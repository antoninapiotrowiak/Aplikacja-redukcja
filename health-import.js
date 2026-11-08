(function () {
    const storageKey = 'appleHealthImport';
    const fileInput = document.getElementById('healthExportFile');
    const status = document.getElementById('healthImportStatus');
    const summary = document.getElementById('healthImportSummary');
    const clearButton = document.getElementById('clearHealthImport');
    const supportedTypes = new Map([
        ['HKQuantityTypeIdentifierStepCount', 'steps'],
        ['HKQuantityTypeIdentifierActiveEnergyBurned', 'activeKcal'],
        ['HKQuantityTypeIdentifierDietaryEnergyConsumed', 'foodKcal'],
        ['HKQuantityTypeIdentifierBodyMass', 'weightKg'],
        ['HKQuantityTypeIdentifierDistanceWalkingRunning', 'distanceKm']
    ]);

    function readSavedImport() {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return null;
        try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.days)) return parsed;
        } catch (error) {
            console.error('Nie można odczytać lokalnego importu Apple Health.', error);
        }
        return null;
    }

    function formatValue(value, fractionDigits = 0) {
        return value === null || value === undefined
            ? '—'
            : new Intl.NumberFormat('pl-PL', { maximumFractionDigits: fractionDigits }).format(value);
    }

    function displayDate(dateKey) {
        return FitnessApp.formatDate(new Date(`${dateKey}T12:00:00`), {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function render(saved = readSavedImport()) {
        summary.replaceChildren();
        clearButton.hidden = !saved;
        if (!saved) {
            summary.hidden = true;
            status.textContent = 'Dane pozostają na tym urządzeniu i są używane wyłącznie w tym profilu.';
            return;
        }
        const days = saved.days.slice().sort((first, second) => second.date.localeCompare(first.date)).slice(0, 7);
        if (!days.length) {
            summary.hidden = true;
            status.textContent = 'Plik nie zawiera obsługiwanych pomiarów z ostatnich 90 dni.';
            return;
        }

        days.forEach((day) => {
            const row = document.createElement('article');
            row.className = 'health-import-day';
            const date = document.createElement('strong');
            date.textContent = displayDate(day.date);
            const values = document.createElement('span');
            values.textContent = `${formatValue(day.steps)} kroków · ${formatValue(day.activeKcal)} aktywne kcal · ${formatValue(day.foodKcal)} spożyte kcal · ${formatValue(day.distanceKm, 2)} km · ${formatValue(day.weightKg, 1)} kg`;
            row.append(date, values);
            summary.append(row);
        });
        summary.hidden = false;
        status.textContent = `Zaimportowano ${days.length} z ostatnich dostępnych dni. Ostatni import: ${FitnessApp.formatDate(new Date(saved.importedAt), { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}.`;
    }

    function quantityInBaseUnit(type, value, unit) {
        if (type === 'steps') return unit === 'count' ? value : null;
        if (type === 'activeKcal' || type === 'foodKcal') return unit === 'kcal' ? value : null;
        if (type === 'weightKg') {
            if (unit === 'kg') return value;
            if (unit === 'lb') return value * 0.45359237;
            return null;
        }
        if (type === 'distanceKm') {
            if (unit === 'km') return value;
            if (unit === 'mi') return value * 1.609344;
            if (unit === 'm') return value / 1000;
            return null;
        }
        return null;
    }

    function parseHealthExport(xmlText) {
        const document = new DOMParser().parseFromString(xmlText, 'application/xml');
        if (document.querySelector('parsererror')) {
            throw new Error('Plik nie jest poprawnym XML-em eksportu Apple Health.');
        }

        const todayKey = FitnessApp.dateKey(new Date());
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const days = new Map();
        const records = document.getElementsByTagName('Record');
        for (const record of records) {
            const type = supportedTypes.get(record.getAttribute('type'));
            if (!type) continue;
            const date = (record.getAttribute('startDate') || '').slice(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayKey) continue;
            const localDay = new Date(`${date}T12:00:00`);
            if (localDay < cutoff) continue;

            const value = Number(record.getAttribute('value'));
            if (!Number.isFinite(value) || value < 0) continue;
            const normalizedValue = quantityInBaseUnit(type, value, record.getAttribute('unit') || '');
            if (normalizedValue === null) continue;
            const day = days.get(date) || {
                date,
                steps: null,
                activeKcal: null,
                foodKcal: null,
                weightKg: null,
                distanceKm: null,
                latestWeightAt: ''
            };
            if (type === 'weightKg') {
                const startDate = record.getAttribute('startDate') || '';
                if (!day.latestWeightAt || startDate >= day.latestWeightAt) {
                    day.weightKg = Math.round(normalizedValue * 10) / 10;
                    day.latestWeightAt = startDate;
                }
            } else {
                day[type] = (day[type] || 0) + normalizedValue;
            }
            days.set(date, day);
        }

        return [...days.values()]
            .map(({ latestWeightAt, ...day }) => ({
                ...day,
                steps: day.steps === null ? null : Math.round(day.steps),
                activeKcal: day.activeKcal === null ? null : Math.round(day.activeKcal),
                foodKcal: day.foodKcal === null ? null : Math.round(day.foodKcal),
                distanceKm: day.distanceKm === null ? null : Math.round(day.distanceKm * 100) / 100
            }))
            .sort((first, second) => first.date.localeCompare(second.date));
    }

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            status.textContent = 'Plik jest większy niż 20 MB. Wybierz mniejszy plik export.xml.';
            status.classList.add('is-error');
            fileInput.value = '';
            return;
        }

        status.classList.remove('is-error');
        status.textContent = 'Odczytuję plik lokalnie…';
        try {
            const days = parseHealthExport(await file.text());
            if (!days.length) {
                status.textContent = 'Nie znaleziono obsługiwanych danych z ostatnich 90 dni. Sprawdź, czy wybrano export.xml.';
                status.classList.add('is-error');
                return;
            }
            const result = { importedAt: new Date().toISOString(), days };
            localStorage.setItem(storageKey, JSON.stringify(result));
            render(result);
        } catch (error) {
            console.error('Import Apple Health nie powiódł się.', error);
            status.textContent = error.message || 'Nie udało się odczytać pliku. Spróbuj ponownie.';
            status.classList.add('is-error');
        } finally {
            fileInput.value = '';
        }
    });

    clearButton.addEventListener('click', () => {
        localStorage.removeItem(storageKey);
        render(null);
    });

    render();
})();

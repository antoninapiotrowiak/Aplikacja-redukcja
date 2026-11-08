(function () {
    const maxImageBytes = 5 * 1024 * 1024;
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    function validateEstimate(estimate) {
        const macro = (value) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1000);
        if (!estimate || typeof estimate.name !== 'string' || !estimate.name.trim() ||
            typeof estimate.serving !== 'string' || !estimate.serving.trim() ||
            typeof estimate.kcal !== 'number' || !Number.isFinite(estimate.kcal) || estimate.kcal < 0 ||
            !macro(estimate.protein) || !macro(estimate.fat) || !macro(estimate.carbs)) {
            throw new Error('Odpowiedź AI ma nieprawidłowy format. Spróbuj ponownie.');
        }
        return estimate;
    }

    function readImage(file) {
        if (!allowedTypes.has(file.type)) {
            throw new Error('Wybierz zdjęcie JPEG, PNG lub WebP.');
        }
        if (file.size > maxImageBytes) {
            throw new Error('Zdjęcie może mieć maksymalnie 5 MB.');
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result));
            reader.addEventListener('error', () => reject(new Error('Nie udało się odczytać zdjęcia.')));
            reader.readAsDataURL(file);
        });
    }

    async function analyze({ description, file }) {
        const text = String(description || '').trim();
        if (text.length > 1200) throw new Error('Opis może mieć maksymalnie 1200 znaków.');
        if (!text && !file) throw new Error('Dodaj opis lub zdjęcie posiłku.');

        const imageDataUrl = file ? await readImage(file) : null;
        let response;
        try {
            response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ description: text, imageDataUrl })
            });
        } catch {
            throw new Error('Nie można połączyć się z serwerem AI. Uruchom aplikację przez npm start i sprawdź konfigurację serwera.');
        }

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(payload?.error || `Serwer AI zwrócił błąd (${response.status}).`);
        }
        return validateEstimate(payload?.estimate);
    }

    window.AIFoodAnalyzer = { analyze };
})();

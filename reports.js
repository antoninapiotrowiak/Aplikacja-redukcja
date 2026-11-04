(function () {
    const tabs = Array.from(document.querySelectorAll('[data-report]'));
    const panel = document.getElementById('reportPanel');
    let activeReport = 'calories';
    let weekOffset = 0;

    function getWeekDates() {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const mondayOffset = (today.getDay() + 6) % 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - mondayOffset + weekOffset * 7);
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            const meals = FitnessApp.getMeals(FitnessApp.dateKey(date));
            const nutrition = FitnessApp.summarizeMeals(meals);
            return {
                date,
                meals,
                ...nutrition
            };
        });
    }

    function updatePeriodLabel(days) {
        const start = days[0].date;
        const end = days[6].date;
        document.getElementById('reportPeriod').textContent =
            `${FitnessApp.formatDate(start, { day: 'numeric', month: 'short' })} – ${FitnessApp.formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        document.getElementById('nextWeek').disabled = weekOffset >= 0;
        document.getElementById('nextWeek').style.opacity = weekOffset >= 0 ? '0.45' : '1';
    }

    function renderCalories(days) {
        const goal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const total = days.reduce((sum, day) => sum + day.calories, 0);
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const elapsedDays = days.filter((day) => day.date <= today).length;
        const average = elapsedDays ? Math.round(total / elapsedDays) : 0;
        panel.innerHTML = `
            <h2>Kalorie w tym tygodniu</h2>
            <div class="stat-pills">
                <div class="stat-pill"><span class="muted">Średnio dziennie</span><strong>${average} kcal</strong></div>
                <div class="stat-pill"><span class="muted">Cel dzienny</span><strong>${goal} kcal</strong></div>
            </div>
            <div class="bar-chart" aria-label="Spożycie kalorii w każdym dniu tygodnia"></div>
            <table class="report-table" style="margin-top:16px">
                <thead><tr><th>Dzień</th><th>Spożycie</th><th>Cel</th></tr></thead>
                <tbody></tbody>
            </table>`;

        const chart = panel.querySelector('.bar-chart');
        const rows = panel.querySelector('tbody');
        const maxValue = Math.max(goal, ...days.map((day) => day.calories), 1);
        days.forEach((day) => {
            const isFuture = day.date > today;
            const item = document.createElement('div');
            item.className = 'bar-chart-item';
            const bar = document.createElement('div');
            bar.className = 'bar-chart-bar';
            bar.style.height = `${Math.max(3, Math.round(day.calories / maxValue * 100))}%`;
            bar.title = isFuture ? 'Brak danych' : `${day.calories} kcal`;
            const label = document.createElement('span');
            label.textContent = FitnessApp.formatDate(day.date, { weekday: 'short' }).replace('.', '');
            item.append(bar, label);
            chart.append(item);

            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            dateCell.textContent = FitnessApp.formatDate(day.date, { weekday: 'long', day: 'numeric' });
            const intakeCell = document.createElement('td');
            intakeCell.textContent = isFuture ? '—' : `${day.calories} kcal`;
            const goalCell = document.createElement('td');
            goalCell.textContent = isFuture ? '—' : `${goal} kcal`;
            row.append(dateCell, intakeCell, goalCell);
            rows.append(row);
        });
    }

    function renderMacros() {
        const days = getWeekDates();
        const total = days.reduce((sum, day) => ({
            protein: sum.protein + day.protein,
            carbs: sum.carbs + day.carbs,
            fat: sum.fat + day.fat,
            trackedProtein: sum.trackedProtein + day.trackedProtein,
            trackedCarbs: sum.trackedCarbs + day.trackedCarbs,
            trackedFat: sum.trackedFat + day.trackedFat
        }), { protein: 0, carbs: 0, fat: 0, trackedProtein: 0, trackedCarbs: 0, trackedFat: 0 });
        const macroFields = [
            { key: 'protein', tracked: 'trackedProtein', name: 'Białko', color: '#f5b247' },
            { key: 'fat', tracked: 'trackedFat', name: 'Tłuszcze', color: '#ef8462' },
            { key: 'carbs', tracked: 'trackedCarbs', name: 'Węglowodany', color: '#46a9d8' }
        ];
        const hasAnyData = macroFields.some((field) => total[field.tracked] > 0);
        panel.innerHTML = `
            <h2>Makroskładniki w tym tygodniu</h2>
            <div class="macro-overview"></div>
            <p class="muted macro-report-note"></p>
            <div class="bar-chart macro-chart" aria-label="Makroskładniki w poszczególnych dniach tygodnia"></div>
            <table class="report-table">
                <thead><tr><th>Dzień</th><th>Białko</th><th>Tłuszcze</th><th>Węglowodany</th></tr></thead>
                <tbody></tbody>
            </table>`;
        const overview = panel.querySelector('.macro-overview');
        macroFields.forEach((field) => {
            const item = document.createElement('div');
            item.className = 'macro-overview-item';
            const label = document.createElement('span');
            label.textContent = field.name;
            const value = document.createElement('strong');
            value.textContent = total[field.tracked] ? `${FitnessApp.formatNumber(total[field.key])} g` : '—';
            item.append(label, value);
            overview.append(item);
        });
        panel.querySelector('.macro-report-note').textContent = hasAnyData
            ? 'Sumy obejmują wyłącznie uzupełnione wartości. Wcześniejsze wpisy bez makro są pomijane.'
            : 'Brak danych makro w tym tygodniu. Dodaj białko, tłuszcze i węglowodany przy wpisywaniu posiłku.';

        const chart = panel.querySelector('.macro-chart');
        const maxValue = Math.max(1, ...days.map((day) => day.protein + day.fat + day.carbs));
        const rows = panel.querySelector('tbody');
        days.forEach((day) => {
            const dayHasData = macroFields.some((field) => day[field.tracked] > 0);
            const isFuture = day.date > new Date(new Date().setHours(23, 59, 59, 999));
            const chartItem = document.createElement('div');
            chartItem.className = 'bar-chart-item';
            const stack = document.createElement('div');
            stack.className = 'macro-stack';
            const amount = day.protein + day.fat + day.carbs;
            stack.style.height = `${dayHasData ? Math.max(4, Math.round(amount / maxValue * 100)) : 3}%`;
            macroFields.forEach((field) => {
                if (!day[field.tracked]) return;
                const segment = document.createElement('span');
                segment.className = 'macro-stack-segment';
                segment.style.flexGrow = String(day[field.key]);
                segment.style.backgroundColor = field.color;
                segment.title = `${field.name}: ${FitnessApp.formatNumber(day[field.key])} g`;
                stack.append(segment);
            });
            const dayLabel = document.createElement('span');
            dayLabel.textContent = FitnessApp.formatDate(day.date, { weekday: 'short' }).replace('.', '');
            chartItem.append(stack, dayLabel);
            chart.append(chartItem);

            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            dateCell.textContent = FitnessApp.formatDate(day.date, { weekday: 'short', day: 'numeric' });
            row.append(dateCell);
            macroFields.forEach((field) => {
                const cell = document.createElement('td');
                cell.textContent = isFuture || !day[field.tracked]
                    ? '—'
                    : `${FitnessApp.formatNumber(day[field.key])} g`;
                row.append(cell);
            });
            rows.append(row);
        });

        const legend = document.createElement('div');
        legend.className = 'macro-legend';
        macroFields.forEach((field) => {
            const item = document.createElement('span');
            const swatch = document.createElement('i');
            swatch.style.backgroundColor = field.color;
            item.append(swatch, document.createTextNode(field.name));
            legend.append(item);
        });
        chart.after(legend);
    }

    function renderFoods(days) {
        const totals = new Map();
        days.forEach((day) => {
            day.meals.forEach((meal) => {
                const category = meal.category === 'Przekąska'
                    ? 'Przekąski/Inne'
                    : meal.category || 'Inne';
                totals.set(category, (totals.get(category) || 0) + (Number(meal.kcal) || 0));
            });
        });

        panel.innerHTML = `
            <h2>Kalorie według posiłków</h2>
            <p class="muted">Rozkład energii zarejestrowanej w każdej części dnia.</p>
            <table class="report-table">
                <thead><tr><th>Kategoria</th><th>Kalorie</th></tr></thead>
                <tbody></tbody>
            </table>`;
        const rows = panel.querySelector('tbody');
        if (totals.size === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 2;
            cell.className = 'muted';
            cell.textContent = 'Brak zapisanych posiłków w tym tygodniu.';
            row.append(cell);
            rows.append(row);
            return;
        }
        totals.forEach((calories, category) => {
            const row = document.createElement('tr');
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category;
            const caloriesCell = document.createElement('td');
            caloriesCell.textContent = `${calories} kcal`;
            row.append(categoryCell, caloriesCell);
            rows.append(row);
        });
    }

    function renderReport() {
        const days = getWeekDates();
        updatePeriodLabel(days);
        if (activeReport === 'calories') renderCalories(days);
        if (activeReport === 'macros') renderMacros();
        if (activeReport === 'foods') renderFoods(days);
        tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.report === activeReport)));
        panel.setAttribute('aria-labelledby', tabs.find((tab) => tab.dataset.report === activeReport).id);
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => {
        activeReport = tab.dataset.report;
        renderReport();
    }));
    document.getElementById('previousWeek').addEventListener('click', () => {
        weekOffset -= 1;
        renderReport();
    });
    document.getElementById('nextWeek').addEventListener('click', () => {
        if (weekOffset < 0) {
            weekOffset += 1;
            renderReport();
        }
    });

    renderReport();
})();

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
            return {
                date,
                meals,
                calories: meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0)
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
        const goal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const targets = [
            { name: 'Węglowodany', share: 50, multiplier: 4 },
            { name: 'Białko', share: 20, multiplier: 4 },
            { name: 'Tłuszcze', share: 30, multiplier: 9 }
        ];
        panel.innerHTML = `
            <h2>Cele makroskładników</h2>
            <p class="muted">Podgląd celu dziennego. Dziennik zapisuje obecnie kalorie, dlatego ilość zjedzonych makroskładników nie jest jeszcze dostępna.</p>
            <table class="report-table">
                <thead><tr><th>Makroskładnik</th><th>Cel</th><th>Spożycie</th></tr></thead>
                <tbody></tbody>
            </table>`;
        const rows = panel.querySelector('tbody');
        targets.forEach((target) => {
            const grams = Math.round(goal * target.share / 100 / target.multiplier);
            const row = document.createElement('tr');
            [target.name, `${target.share}% · ${grams} g`, '—'].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });
            rows.append(row);
        });
    }

    function renderFoods(days) {
        const totals = new Map();
        days.forEach((day) => {
            day.meals.forEach((meal) => {
                const category = meal.category || 'Inne';
                totals.set(category, (totals.get(category) || 0) + (Number(meal.kcal) || 0));
            });
        });

        panel.innerHTML = `
            <h2>Podsumowanie posiłków</h2>
            <p class="muted">Suma kalorii zarejestrowanych posiłków z wybranego tygodnia.</p>
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

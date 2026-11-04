(function () {
    const mealTypes = [
        { category: 'Śniadanie', icon: '🌅', id: 'breakfast' },
        { category: 'Lunch', icon: '☀️', id: 'lunch' },
        { category: 'Obiad', icon: '🌇', id: 'dinner' },
        { category: 'Kolacja', icon: '🌙', id: 'supper' },
        { category: 'Przekąski/Inne', icon: '☾', id: 'snacks' }
    ];
    let selectedDate = new Date();
    selectedDate.setHours(12, 0, 0, 0);

    const datePicker = document.getElementById('datePicker');
    const mealCards = document.getElementById('mealCards');

    function shiftDate(days) {
        selectedDate.setDate(selectedDate.getDate() + days);
        renderDiary();
    }

    function renderWeek() {
        const weekStrip = document.getElementById('weekStrip');
        weekStrip.replaceChildren();
        const mondayOffset = (selectedDate.getDay() + 6) % 7;
        const monday = new Date(selectedDate);
        monday.setDate(selectedDate.getDate() - mondayOffset);

        for (let index = 0; index < 7; index += 1) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + index);
            const link = document.createElement('a');
            link.className = `week-day${FitnessApp.dateKey(day) === FitnessApp.dateKey(selectedDate) ? ' selected' : ''}`;
            link.href = '#';
            link.setAttribute('aria-label', FitnessApp.formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' }));
            const weekday = document.createElement('span');
            weekday.textContent = FitnessApp.formatDate(day, { weekday: 'short' }).replace('.', '');
            const dayNumber = document.createElement('strong');
            dayNumber.textContent = String(day.getDate());
            link.append(weekday, dayNumber);
            link.addEventListener('click', (event) => {
                event.preventDefault();
                selectedDate = day;
                renderDiary();
            });
            weekStrip.append(link);
        }
    }

    function renderMeals(meals) {
        mealCards.replaceChildren();
        mealTypes.forEach((type) => {
            const card = document.createElement('section');
            card.className = 'card meal-card';
            const heading = document.createElement('div');
            heading.className = 'meal-heading';
            const icon = document.createElement('span');
            icon.className = 'meal-emoji';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = type.icon;
            const title = document.createElement('h2');
            title.textContent = type.category;
            const addButton = document.createElement('button');
            addButton.className = 'meal-add';
            addButton.type = 'button';
            addButton.textContent = '+';
            addButton.setAttribute('aria-label', `Dodaj posiłek: ${type.category}`);
            heading.append(icon, title, addButton);

            const entries = document.createElement('div');
            entries.className = 'meal-entries';
            const categoryMeals = meals.filter((meal) => {
                if (type.category === 'Przekąski/Inne') {
                    return meal.category === type.category || meal.category === 'Przekąska';
                }
                return meal.category === type.category;
            });
            categoryMeals.forEach((meal) => {
                const row = document.createElement('div');
                row.className = 'meal-entry';
                const name = document.createElement('span');
                name.className = 'meal-entry-name';
                name.textContent = meal.name;
                const calories = document.createElement('strong');
                calories.textContent = `${Number(meal.kcal) || 0} kcal`;
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.textContent = 'Usuń';
                remove.setAttribute('aria-label', `Usuń ${meal.name}`);
                remove.addEventListener('click', () => removeMeal(meal.id));
                row.append(name, calories, remove);
                entries.append(row);
            });

            const form = document.createElement('form');
            form.className = 'meal-form';
            form.hidden = true;
            form.innerHTML = `
                <input class="form-control" name="name" type="text" maxlength="80" placeholder="Nazwa posiłku" aria-label="Nazwa posiłku" required>
                <input class="form-control" name="kcal" type="number" min="0" max="10000" step="1" inputmode="numeric" placeholder="kcal" aria-label="Kalorie" required>
                <button class="primary-button" type="submit">Dodaj</button>
            `;
            addButton.addEventListener('click', () => {
                form.hidden = !form.hidden;
                if (!form.hidden) form.elements.name.focus();
            });
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const name = form.elements.name.value.trim();
                const kcal = Number(form.elements.kcal.value);
                if (!name || !Number.isFinite(kcal) || kcal < 0 || kcal > 10000) return;
                const dayKey = FitnessApp.dateKey(selectedDate);
                const updatedMeals = FitnessApp.getMeals(dayKey);
                updatedMeals.push({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    category: type.category,
                    name,
                    kcal
                });
                localStorage.setItem(`meals_${dayKey}`, JSON.stringify(updatedMeals));
                renderDiary();
            });
            card.append(heading, entries, form);
            mealCards.append(card);
        });
    }

    function removeMeal(id) {
        const dayKey = FitnessApp.dateKey(selectedDate);
        const meals = FitnessApp.getMeals(dayKey).filter((meal) => String(meal.id) !== String(id));
        localStorage.setItem(`meals_${dayKey}`, JSON.stringify(meals));
        renderDiary();
    }

    function renderDiary() {
        const dayKey = FitnessApp.dateKey(selectedDate);
        const todayKey = FitnessApp.dateKey(new Date());
        const meals = FitnessApp.getMeals(dayKey);
        const total = meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0);
        const goal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const remaining = goal - total;
        const percent = Math.min(100, Math.round((total / goal) * 100));
        const dateLabel = dayKey === todayKey
            ? 'Dzisiaj'
            : FitnessApp.formatDate(selectedDate, { day: 'numeric', month: 'long', year: 'numeric' });

        document.getElementById('selectedDateLabel').textContent = dateLabel;
        document.getElementById('goalDisplay').textContent = `${goal} kcal`;
        document.getElementById('eatenDisplay').textContent = `${total} kcal`;
        document.getElementById('remainingDisplay').textContent = remaining >= 0
            ? `Pozostało: ${remaining} kcal`
            : `Ponad cel: ${Math.abs(remaining)} kcal`;
        document.getElementById('calorieProgress').style.width = `${percent}%`;
        document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
        datePicker.value = dayKey;
        renderWeek();
        renderMeals(meals);
    }

    document.getElementById('previousDay').addEventListener('click', () => shiftDate(-1));
    document.getElementById('nextDay').addEventListener('click', () => shiftDate(1));
    document.getElementById('calendarToggle').addEventListener('click', () => {
        datePicker.hidden = !datePicker.hidden;
        if (!datePicker.hidden) datePicker.showPicker?.();
    });
    datePicker.addEventListener('change', () => {
        if (!datePicker.value) return;
        selectedDate = new Date(`${datePicker.value}T12:00:00`);
        renderDiary();
    });
    document.getElementById('changeGoal').addEventListener('click', () => {
        const currentGoal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const updatedGoal = Number(window.prompt('Podaj dzienny cel kalorii (kcal):', String(currentGoal)));
        if (!Number.isFinite(updatedGoal) || updatedGoal < 500 || updatedGoal > 10000) {
            if (updatedGoal !== 0) window.alert('Cel powinien wynosić od 500 do 10 000 kcal.');
            return;
        }
        localStorage.setItem('userCalorieGoal', String(Math.round(updatedGoal)));
        renderDiary();
    });

    renderDiary();
})();

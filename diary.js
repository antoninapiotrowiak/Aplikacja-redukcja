(function () {
    const mealTypes = [
        { category: 'Śniadanie', icon: '☀', id: 'breakfast' },
        { category: 'Lunch', icon: '◉', id: 'lunch' },
        { category: 'Obiad', icon: '☼', id: 'dinner' },
        { category: 'Kolacja', icon: '☾', id: 'supper' },
        { category: 'Przekąski/Inne', icon: '⋯', id: 'snacks' }
    ];
    let selectedDate = new Date();
    let selectedCategory = mealTypes[0].category;
    selectedDate.setHours(12, 0, 0, 0);

    const datePicker = document.getElementById('datePicker');
    const mealCards = document.getElementById('mealCards');
    const mealDialog = document.getElementById('mealDialog');
    const mealForm = document.getElementById('mealForm');

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
        const todayKey = FitnessApp.dateKey(new Date());

        for (let index = 0; index < 7; index += 1) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + index);
            const dayKey = FitnessApp.dateKey(day);
            const link = document.createElement('button');
            link.className = `week-day${dayKey === FitnessApp.dateKey(selectedDate) ? ' selected' : ''}${dayKey === todayKey ? ' is-today' : ''}`;
            link.type = 'button';
            link.setAttribute('aria-label', FitnessApp.formatDate(day, { weekday: 'long', day: 'numeric', month: 'long' }));
            link.setAttribute('aria-pressed', String(dayKey === FitnessApp.dateKey(selectedDate)));
            const weekday = document.createElement('span');
            weekday.textContent = FitnessApp.formatDate(day, { weekday: 'short' }).replace('.', '');
            const dayNumber = document.createElement('strong');
            dayNumber.textContent = String(day.getDate());
            link.append(weekday, dayNumber);
            link.addEventListener('click', () => {
                selectedDate = day;
                renderDiary();
            });
            weekStrip.append(link);
        }
    }

    function macroSummary(summary) {
        return [
            { label: 'B', value: summary.protein, hasData: summary.trackedProtein > 0 },
            { label: 'T', value: summary.fat, hasData: summary.trackedFat > 0 },
            { label: 'W', value: summary.carbs, hasData: summary.trackedCarbs > 0 }
        ].map((item) => {
            const value = item.hasData ? FitnessApp.formatNumber(item.value) : '—';
            return `<span title="${item.label === 'B' ? 'Białko' : item.label === 'T' ? 'Tłuszcze' : 'Węglowodany'}">${item.label} ${value} g</span>`;
        }).join('');
    }

    function createMealEntry(meal) {
        const row = document.createElement('article');
        row.className = 'meal-entry';

        const detail = document.createElement('div');
        detail.className = 'meal-entry-detail';
        const name = document.createElement('strong');
        name.className = 'meal-entry-name';
        name.textContent = meal.name;
        detail.append(name);

        if (meal.serving) {
            const serving = document.createElement('span');
            serving.className = 'meal-serving';
            serving.textContent = meal.serving;
            detail.append(serving);
        }

        const macros = document.createElement('div');
        macros.className = 'meal-entry-macros';
        [
            { name: 'Białko', key: 'protein' },
            { name: 'Tłuszcze', key: 'fat' },
            { name: 'Węglowodany', key: 'carbs' }
        ].forEach((nutrient) => {
            const value = meal[nutrient.key];
            const item = document.createElement('span');
            const hasValue = value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
            item.textContent = `${nutrient.name}: ${hasValue ? `${FitnessApp.formatNumber(Number(value))} g` : '—'}`;
            macros.append(item);
        });
        detail.append(macros);

        const actions = document.createElement('div');
        actions.className = 'meal-entry-actions';
        const calories = document.createElement('strong');
        calories.className = 'meal-entry-calories';
        calories.textContent = `${Number(meal.kcal) || 0}`;
        const unit = document.createElement('span');
        unit.className = 'muted';
        unit.textContent = 'kcal';
        const remove = document.createElement('button');
        remove.className = 'remove-meal';
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Usuń ${meal.name}`);
        remove.addEventListener('click', () => removeMeal(meal.id));
        actions.append(calories, unit, remove);
        row.append(detail, actions);
        return row;
    }

    function renderMeals(meals) {
        mealCards.replaceChildren();
        mealTypes.forEach((type) => {
            const categoryMeals = meals.filter((meal) => {
                if (type.category === 'Przekąski/Inne') {
                    return meal.category === type.category || meal.category === 'Przekąska';
                }
                return meal.category === type.category;
            });
            const categorySummary = FitnessApp.summarizeMeals(categoryMeals);

            const card = document.createElement('section');
            card.className = 'meal-group';
            const heading = document.createElement('div');
            heading.className = 'meal-heading';
            const toggle = document.createElement('button');
            toggle.className = 'meal-toggle';
            toggle.type = 'button';
            toggle.setAttribute('aria-expanded', String(categoryMeals.length > 0));
            const icon = document.createElement('span');
            icon.className = `meal-emoji meal-emoji-${type.id}`;
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = type.icon;
            const label = document.createElement('span');
            label.className = 'meal-heading-label';
            const title = document.createElement('strong');
            title.textContent = type.category;
            const summary = document.createElement('span');
            summary.className = 'meal-heading-summary';
            summary.textContent = categoryMeals.length
                ? `${categoryMeals.length} ${categoryMeals.length === 1 ? 'produkt' : categoryMeals.length < 5 ? 'produkty' : 'produktów'} · ${categorySummary.calories} kcal`
                : 'Dodaj pierwszy produkt';
            label.append(title, summary);

            const nutrientLine = document.createElement('span');
            nutrientLine.className = 'meal-heading-macros';
            nutrientLine.innerHTML = macroSummary(categorySummary);
            const chevron = document.createElement('span');
            chevron.className = 'meal-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.textContent = categoryMeals.length ? '⌃' : '⌄';
            toggle.append(icon, label, nutrientLine, chevron);

            const addButton = document.createElement('button');
            addButton.className = 'meal-add';
            addButton.type = 'button';
            addButton.textContent = '+';
            addButton.setAttribute('aria-label', `Dodaj posiłek: ${type.category}`);
            addButton.addEventListener('click', () => openMealDialog(type.category));
            heading.append(toggle, addButton);

            const content = document.createElement('div');
            content.className = 'meal-content';
            content.hidden = categoryMeals.length === 0;
            categoryMeals.forEach((meal) => content.append(createMealEntry(meal)));
            toggle.addEventListener('click', () => {
                content.hidden = !content.hidden;
                toggle.setAttribute('aria-expanded', String(!content.hidden));
                chevron.textContent = content.hidden ? '⌄' : '⌃';
            });

            card.append(heading, content);
            mealCards.append(card);
        });
    }

    function openMealDialog(category) {
        selectedCategory = category;
        document.getElementById('mealDialogTitle').textContent = category;
        mealDialog.showModal();
        mealForm.elements.name.focus();
    }

    function closeMealDialog() {
        mealDialog.close();
        mealForm.reset();
    }

    function removeMeal(id) {
        const dayKey = FitnessApp.dateKey(selectedDate);
        const meals = FitnessApp.getMeals(dayKey).filter((meal) => String(meal.id) !== String(id));
        localStorage.setItem(`meals_${dayKey}`, JSON.stringify(meals));
        renderDiary();
    }

    function updateNutrientDisplay(id, summary, key, trackedKey) {
        const display = document.getElementById(id);
        const hasData = summary[trackedKey] > 0;
        display.textContent = hasData ? `${FitnessApp.formatNumber(summary[key])} g` : '—';
        display.classList.toggle('has-data', hasData);
    }

    function renderDiary() {
        const dayKey = FitnessApp.dateKey(selectedDate);
        const todayKey = FitnessApp.dateKey(new Date());
        const meals = FitnessApp.getMeals(dayKey);
        const summary = FitnessApp.summarizeMeals(meals);
        const goal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const remaining = goal - summary.calories;
        const percent = Math.min(100, Math.round((summary.calories / goal) * 100));
        const dateLabel = dayKey === todayKey
            ? 'Dzisiaj'
            : FitnessApp.formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' });

        document.getElementById('selectedDateLabel').textContent = dateLabel;
        document.getElementById('goalDisplay').textContent = `${goal} kcal`;
        document.getElementById('eatenDisplay').textContent = FitnessApp.formatNumber(summary.calories);
        document.getElementById('remainingDisplay').textContent = remaining >= 0
            ? `Pozostało ${FitnessApp.formatNumber(remaining)} kcal`
            : `Ponad cel o ${FitnessApp.formatNumber(Math.abs(remaining))} kcal`;
        document.getElementById('progressPercent').textContent = `${percent}% celu`;
        document.getElementById('calorieProgress').style.width = `${percent}%`;
        document.querySelector('.calorie-progress[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
        updateNutrientDisplay('proteinDisplay', summary, 'protein', 'trackedProtein');
        updateNutrientDisplay('fatDisplay', summary, 'fat', 'trackedFat');
        updateNutrientDisplay('carbsDisplay', summary, 'carbs', 'trackedCarbs');

        const macroNote = document.getElementById('macroNote');
        macroNote.textContent = summary.incompleteMeals
            ? `Makro uzupełniono dla ${meals.length - summary.incompleteMeals} z ${meals.length} produktów.`
            : '';
        macroNote.hidden = !summary.incompleteMeals;
        datePicker.value = dayKey;
        renderWeek();
        renderMeals(meals);
    }

    document.getElementById('previousDay').addEventListener('click', () => shiftDate(-1));
    document.getElementById('nextDay').addEventListener('click', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (FitnessApp.dateKey(selectedDate) < FitnessApp.dateKey(tomorrow)) shiftDate(1);
    });
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
        const value = window.prompt('Podaj dzienny cel kalorii (kcal):', String(currentGoal));
        if (value === null) return;
        const updatedGoal = Number(value);
        if (!Number.isFinite(updatedGoal) || updatedGoal < 500 || updatedGoal > 10000) {
            window.alert('Cel powinien wynosić od 500 do 10 000 kcal.');
            return;
        }
        localStorage.setItem('userCalorieGoal', String(Math.round(updatedGoal)));
        renderDiary();
    });

    mealForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!mealForm.reportValidity()) return;

        const formData = new FormData(mealForm);
        const meal = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            category: selectedCategory,
            name: String(formData.get('name')).trim(),
            serving: String(formData.get('serving') || '').trim(),
            kcal: Number(formData.get('kcal'))
        };
        ['protein', 'carbs', 'fat'].forEach((nutrient) => {
            const value = String(formData.get(nutrient) || '').trim();
            meal[nutrient] = value === '' ? null : Number(value);
        });

        if (!meal.name || !Number.isFinite(meal.kcal) || meal.kcal < 0 || meal.kcal > 10000) return;
        if (['protein', 'carbs', 'fat'].some((nutrient) => meal[nutrient] !== null &&
            (!Number.isFinite(meal[nutrient]) || meal[nutrient] < 0 || meal[nutrient] > 1000))) {
            window.alert('Wartości makro muszą mieścić się w zakresie 0–1000 g.');
            return;
        }

        const dayKey = FitnessApp.dateKey(selectedDate);
        const meals = FitnessApp.getMeals(dayKey);
        meals.push(meal);
        localStorage.setItem(`meals_${dayKey}`, JSON.stringify(meals));
        closeMealDialog();
        renderDiary();
    });
    document.getElementById('closeMealDialog').addEventListener('click', closeMealDialog);
    document.getElementById('cancelMeal').addEventListener('click', closeMealDialog);
    mealDialog.addEventListener('click', (event) => {
        if (event.target === mealDialog) closeMealDialog();
    });

    renderDiary();
})();

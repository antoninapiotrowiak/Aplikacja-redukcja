(function () {
    const defaultMealTypes = [
        { category: 'Śniadanie', icon: '☀', id: 'breakfast' },
        { category: 'Lunch', icon: '◉', id: 'lunch' },
        { category: 'Obiad', icon: '☼', id: 'dinner' },
        { category: 'Kolacja', icon: '☾', id: 'supper' },
        { category: 'Przekąski/Inne', icon: '⋯', id: 'snacks' }
    ];
    const customCategoriesKey = 'customMealCategories';
    let selectedDate = new Date();
    let selectedCategory = defaultMealTypes[0].category;
    selectedDate.setHours(12, 0, 0, 0);

    const datePicker = document.getElementById('datePicker');
    const mealCards = document.getElementById('mealCards');
    const mealDialog = document.getElementById('mealDialog');
    const mealForm = document.getElementById('mealForm');
    const categoryDialog = document.getElementById('categoryDialog');

    function readCustomCategories() {
        const saved = localStorage.getItem(customCategoriesKey);
        if (!saved) return [];
        const categories = JSON.parse(saved);
        if (!Array.isArray(categories) || categories.some((category) => typeof category !== 'string')) {
            console.error('Zapisane własne sekcje posiłków mają nieprawidłowy format.');
            return [];
        }
        return categories;
    }

    function readWaterEntries(dateKey) {
        const saved = localStorage.getItem(`water_${dateKey}`);
        if (!saved) return [];
        const entries = JSON.parse(saved);
        if (!Array.isArray(entries)) {
            console.error(`Dane wody dla ${dateKey} nie są listą.`);
            return [];
        }
        return entries.filter((entry) => entry && Number.isFinite(Number(entry.amount)) && Number(entry.amount) > 0);
    }

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
        const customCategories = readCustomCategories();
        const mealTypes = [
            ...defaultMealTypes,
            ...customCategories.map((category, index) => ({
                category,
                icon: '＋',
                id: `custom-${index}`
            }))
        ];
        mealTypes.forEach((type) => {
            const categoryMeals = meals.filter((meal) => {
                if (type.category === 'Przekąski/Inne') {
                    return meal.category === type.category || meal.category === 'Przekąska';
                }
                return meal.category === type.category;
            });
            const categorySummary = FitnessApp.summarizeMeals(categoryMeals);

            const card = document.createElement('section');
            card.className = `meal-group${type.id.startsWith('custom-') ? ' custom-meal-group' : ''}`;
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
        renderCustomCategoryList(customCategories);
    }

    function renderCustomCategoryList(categories) {
        const list = document.getElementById('customMealList');
        list.replaceChildren();
        if (!categories.length) {
            const empty = document.createElement('p');
            empty.className = 'muted';
            empty.textContent = 'Nie dodano jeszcze własnych sekcji.';
            list.append(empty);
            return;
        }

        categories.forEach((category) => {
            const row = document.createElement('div');
            row.className = 'custom-meal-row';
            const label = document.createElement('span');
            label.textContent = category;
            const remove = document.createElement('button');
            remove.className = 'secondary-button';
            remove.type = 'button';
            remove.textContent = 'Usuń';
            remove.setAttribute('aria-label', `Usuń sekcję ${category}`);
            remove.addEventListener('click', () => {
                const hasSavedMeals = Object.keys(localStorage).some((key) => {
                    if (!key.startsWith('meals_')) return false;
                    return FitnessApp.getMeals(key.slice(6)).some((meal) => meal.category === category);
                });
                if (hasSavedMeals) {
                    window.alert('Nie można usunąć sekcji, która zawiera zapisane posiłki.');
                    return;
                }
                const updated = readCustomCategories().filter((name) => name !== category);
                localStorage.setItem(customCategoriesKey, JSON.stringify(updated));
                renderDiary();
            });
            row.append(label, remove);
            list.append(row);
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
        renderWater();
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
    document.getElementById('manageMeals').addEventListener('click', () => {
        renderCustomCategoryList(readCustomCategories());
        categoryDialog.showModal();
        document.getElementById('customMealName').focus();
    });
    document.getElementById('closeCategoryDialog').addEventListener('click', () => categoryDialog.close());
    document.getElementById('categoryForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('customMealName');
        const name = input.value.trim().replace(/\s+/g, ' ');
        if (!name) return;
        const categories = readCustomCategories();
        const allNames = [...defaultMealTypes.map((meal) => meal.category), ...categories]
            .map((category) => category.toLocaleLowerCase('pl-PL'));
        if (allNames.includes(name.toLocaleLowerCase('pl-PL'))) {
            window.alert('Taka sekcja już istnieje.');
            return;
        }
        categories.push(name);
        localStorage.setItem(customCategoriesKey, JSON.stringify(categories));
        input.value = '';
        renderDiary();
        input.focus();
    });

    document.getElementById('categoryDialog').addEventListener('click', (event) => {
        if (event.target === categoryDialog) categoryDialog.close();
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

    document.querySelectorAll('[data-water-add]').forEach((button) => {
        button.addEventListener('click', () => {
            const dayKey = FitnessApp.dateKey(selectedDate);
            const key = `water_${dayKey}`;
            const entries = readWaterEntries(dayKey);
            entries.push({ amount: Number(button.dataset.waterAdd), added: Date.now() });
            localStorage.setItem(key, JSON.stringify(entries));
            renderWater();
        });
    });

    function renderWater() {
        const dayKey = FitnessApp.dateKey(selectedDate);
        const entries = readWaterEntries(dayKey);
        const total = entries.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const goal = Number(localStorage.getItem('waterGoal')) || 2000;
        const percent = Math.min(100, Math.round(total / goal * 100));
        document.getElementById('waterGoalDisplay').textContent = `${goal} ml`;
        document.getElementById('waterAmountDisplay').textContent = `${FitnessApp.formatNumber(total)} ml`;
        document.getElementById('waterRemainingDisplay').textContent = total >= goal
            ? `Cel osiągnięty · ${percent}%`
            : `Pozostało ${FitnessApp.formatNumber(goal - total)} ml`;
        document.getElementById('waterProgress').style.width = `${percent}%`;
        document.querySelector('.water-progress[role="progressbar"]').setAttribute('aria-valuenow', String(percent));
        document.getElementById('undoWater').disabled = entries.length === 0;
    }

    document.getElementById('changeWaterGoal').addEventListener('click', () => {
        const currentGoal = Number(localStorage.getItem('waterGoal')) || 2000;
        const value = window.prompt('Podaj dzienny cel wody (ml):', String(currentGoal));
        if (value === null) return;
        const updatedGoal = Number(value);
        if (!Number.isFinite(updatedGoal) || updatedGoal < 250 || updatedGoal > 10000) {
            window.alert('Cel powinien wynosić od 250 do 10 000 ml.');
            return;
        }
        localStorage.setItem('waterGoal', String(Math.round(updatedGoal)));
        renderWater();
    });
    document.getElementById('undoWater').addEventListener('click', () => {
        const key = `water_${FitnessApp.dateKey(selectedDate)}`;
        const entries = readWaterEntries(FitnessApp.dateKey(selectedDate));
        entries.pop();
        localStorage.setItem(key, JSON.stringify(entries));
        renderWater();
    });

    renderDiary();
})();

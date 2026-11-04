(function () {
    const baseCalories = 2000;
    const storageKey = 'shoppingListChecked';
    const mealsByDay = [
        {
            day: 'Poniedziałek',
            meals: [
                { category: 'Śniadanie', name: 'Owsianka z bananem', kcal: 450, protein: 20, carbs: 65, fat: 12, items: [['Płatki owsiane', 60, 'g'], ['Mleko', 200, 'ml'], ['Banan', 1, 'szt.'], ['Masło orzechowe', 10, 'g']] },
                { category: 'Lunch', name: 'Miska z kurczakiem i ryżem', kcal: 600, protein: 42, carbs: 72, fat: 14, items: [['Pierś z kurczaka', 150, 'g'], ['Ryż', 70, 'g'], ['Brokuł', 150, 'g'], ['Oliwa', 5, 'ml']] },
                { category: 'Obiad', name: 'Łosoś z ziemniakami', kcal: 650, protein: 36, carbs: 55, fat: 28, items: [['Łosoś', 130, 'g'], ['Ziemniaki', 220, 'g'], ['Mix sałat', 60, 'g'], ['Jogurt naturalny', 50, 'g']] },
                { category: 'Przekąska', name: 'Skyr z jabłkiem', kcal: 300, protein: 22, carbs: 43, fat: 3, items: [['Skyr', 150, 'g'], ['Jabłko', 1, 'szt.'], ['Orzechy włoskie', 8, 'g']] }
            ]
        },
        {
            day: 'Wtorek',
            meals: [
                { category: 'Śniadanie', name: 'Kanapki z jajkiem i pomidorem', kcal: 450, protein: 23, carbs: 48, fat: 17, items: [['Chleb pełnoziarnisty', 90, 'g'], ['Jajka', 2, 'szt.'], ['Pomidor', 1, 'szt.']] },
                { category: 'Lunch', name: 'Wrap z indykiem', kcal: 600, protein: 40, carbs: 65, fat: 18, items: [['Tortilla pełnoziarnista', 1, 'szt.'], ['Indyk', 140, 'g'], ['Sałata', 30, 'g'], ['Papryka', 80, 'g'], ['Jogurt naturalny', 40, 'g']] },
                { category: 'Obiad', name: 'Makaron z sosem pomidorowym i tofu', kcal: 650, protein: 32, carbs: 82, fat: 20, items: [['Makaron pełnoziarnisty', 80, 'g'], ['Tofu', 120, 'g'], ['Passata pomidorowa', 150, 'g'], ['Parmezan', 10, 'g']] },
                { category: 'Przekąska', name: 'Gruszka i serek wiejski', kcal: 300, protein: 20, carbs: 40, fat: 6, items: [['Gruszka', 1, 'szt.'], ['Serek wiejski', 150, 'g']] }
            ]
        },
        {
            day: 'Środa',
            meals: [
                { category: 'Śniadanie', name: 'Jogurt z granolą i owocami', kcal: 450, protein: 24, carbs: 58, fat: 13, items: [['Jogurt naturalny', 180, 'g'], ['Granola', 40, 'g'], ['Owoce jagodowe', 100, 'g']] },
                { category: 'Lunch', name: 'Sałatka z tuńczykiem', kcal: 600, protein: 38, carbs: 62, fat: 20, items: [['Tuńczyk', 120, 'g'], ['Ziemniaki', 150, 'g'], ['Mix sałat', 60, 'g'], ['Fasolka szparagowa', 100, 'g'], ['Oliwa', 5, 'ml']] },
                { category: 'Obiad', name: 'Chili z indykiem i fasolą', kcal: 650, protein: 42, carbs: 70, fat: 18, items: [['Indyk', 130, 'g'], ['Fasola czerwona', 100, 'g'], ['Ryż', 60, 'g'], ['Passata pomidorowa', 120, 'g']] },
                { category: 'Przekąska', name: 'Marchewka z hummusem', kcal: 300, protein: 10, carbs: 38, fat: 12, items: [['Marchew', 150, 'g'], ['Hummus', 50, 'g'], ['Wafle ryżowe', 2, 'szt.']] }
            ]
        },
        {
            day: 'Czwartek',
            meals: [
                { category: 'Śniadanie', name: 'Omlet ze szpinakiem', kcal: 450, protein: 29, carbs: 35, fat: 20, items: [['Jajka', 2, 'szt.'], ['Szpinak', 50, 'g'], ['Chleb pełnoziarnisty', 60, 'g'], ['Ser feta', 20, 'g']] },
                { category: 'Lunch', name: 'Bowl z tofu i kaszą', kcal: 600, protein: 28, carbs: 72, fat: 22, items: [['Tofu', 120, 'g'], ['Kasza bulgur', 70, 'g'], ['Ogórek', 80, 'g'], ['Papryka', 80, 'g'], ['Oliwa', 5, 'ml']] },
                { category: 'Obiad', name: 'Kurczak curry z ryżem', kcal: 650, protein: 42, carbs: 75, fat: 16, items: [['Pierś z kurczaka', 140, 'g'], ['Ryż', 70, 'g'], ['Mleczko kokosowe', 50, 'ml'], ['Warzywa na patelnię', 150, 'g']] },
                { category: 'Przekąska', name: 'Kefir i banan', kcal: 300, protein: 13, carbs: 48, fat: 6, items: [['Kefir', 250, 'ml'], ['Banan', 1, 'szt.']] }
            ]
        },
        {
            day: 'Piątek',
            meals: [
                { category: 'Śniadanie', name: 'Nocna owsianka z gruszką', kcal: 450, protein: 21, carbs: 62, fat: 13, items: [['Płatki owsiane', 55, 'g'], ['Mleko', 150, 'ml'], ['Skyr', 80, 'g'], ['Gruszka', 1, 'szt.']] },
                { category: 'Lunch', name: 'Kanapki z pastą jajeczną', kcal: 600, protein: 28, carbs: 68, fat: 24, items: [['Chleb pełnoziarnisty', 120, 'g'], ['Jajka', 2, 'szt.'], ['Jogurt naturalny', 30, 'g'], ['Ogórek', 80, 'g']] },
                { category: 'Obiad', name: 'Dorsz z kaszą i warzywami', kcal: 650, protein: 43, carbs: 72, fat: 18, items: [['Dorsz', 160, 'g'], ['Kasza gryczana', 70, 'g'], ['Cukinia', 100, 'g'], ['Marchew', 80, 'g'], ['Oliwa', 5, 'ml']] },
                { category: 'Przekąska', name: 'Koktajl truskawkowy', kcal: 300, protein: 18, carbs: 45, fat: 5, items: [['Truskawki', 150, 'g'], ['Kefir', 200, 'ml'], ['Płatki owsiane', 15, 'g']] }
            ]
        },
        {
            day: 'Sobota',
            meals: [
                { category: 'Śniadanie', name: 'Placuszki bananowo-owsiane', kcal: 450, protein: 22, carbs: 58, fat: 14, items: [['Banan', 1, 'szt.'], ['Jajka', 2, 'szt.'], ['Płatki owsiane', 35, 'g'], ['Skyr', 50, 'g']] },
                { category: 'Lunch', name: 'Sałatka grecka z kurczakiem', kcal: 600, protein: 42, carbs: 48, fat: 25, items: [['Pierś z kurczaka', 130, 'g'], ['Ser feta', 30, 'g'], ['Pomidor', 1, 'szt.'], ['Ogórek', 100, 'g'], ['Chleb pełnoziarnisty', 50, 'g']] },
                { category: 'Obiad', name: 'Burgery z indyka i pieczone ziemniaki', kcal: 650, protein: 40, carbs: 70, fat: 20, items: [['Indyk', 140, 'g'], ['Bułka pełnoziarnista', 1, 'szt.'], ['Ziemniaki', 180, 'g'], ['Sałata', 25, 'g']] },
                { category: 'Przekąska', name: 'Mandarynki i migdały', kcal: 300, protein: 8, carbs: 42, fat: 13, items: [['Mandarynki', 2, 'szt.'], ['Migdały', 15, 'g'], ['Skyr', 80, 'g']] }
            ]
        },
        {
            day: 'Niedziela',
            meals: [
                { category: 'Śniadanie', name: 'Tosty z twarożkiem i owocami', kcal: 450, protein: 25, carbs: 57, fat: 13, items: [['Chleb pełnoziarnisty', 80, 'g'], ['Twaróg', 80, 'g'], ['Owoce jagodowe', 80, 'g'], ['Miód', 5, 'g']] },
                { category: 'Lunch', name: 'Zupa z soczewicy i grzanki', kcal: 600, protein: 29, carbs: 82, fat: 16, items: [['Soczewica', 70, 'g'], ['Marchew', 80, 'g'], ['Passata pomidorowa', 100, 'g'], ['Chleb pełnoziarnisty', 50, 'g']] },
                { category: 'Obiad', name: 'Pieczony kurczak z batatem', kcal: 650, protein: 43, carbs: 68, fat: 20, items: [['Pierś z kurczaka', 150, 'g'], ['Batat', 200, 'g'], ['Brokuł', 100, 'g'], ['Oliwa', 5, 'ml']] },
                { category: 'Przekąska', name: 'Serek wiejski z ananasem', kcal: 300, protein: 20, carbs: 38, fat: 7, items: [['Serek wiejski', 150, 'g'], ['Ananas', 100, 'g']] }
            ]
        }
    ];

    function selectedVariant() {
        return Number(document.getElementById('calorieVariant').value);
    }

    function renderPlan() {
        const factor = selectedVariant() / baseCalories;
        const container = document.getElementById('weeklyPlan');
        container.replaceChildren();

        mealsByDay.forEach((day) => {
            const dayCard = document.createElement('section');
            dayCard.className = 'card plan-day';
            const heading = document.createElement('div');
            heading.className = 'plan-day-heading';
            const title = document.createElement('h2');
            title.textContent = day.day;
            const total = day.meals.reduce((sum, meal) => sum + meal.kcal, 0);
            const kcal = document.createElement('span');
            kcal.className = 'plan-day-total';
            kcal.textContent = `~${Math.round(total * factor)} kcal`;
            heading.append(title, kcal);
            dayCard.append(heading);

            day.meals.forEach((meal) => {
                const row = document.createElement('article');
                row.className = 'plan-meal';
                const mealHeading = document.createElement('div');
                mealHeading.className = 'plan-meal-heading';
                const name = document.createElement('strong');
                name.textContent = `${meal.category} · ${meal.name}`;
                const mealKcal = document.createElement('span');
                mealKcal.textContent = `~${Math.round(meal.kcal * factor)} kcal`;
                mealHeading.append(name, mealKcal);
                const macros = document.createElement('p');
                macros.className = 'plan-macros';
                macros.textContent = `B ${Math.round(meal.protein * factor)} g · T ${Math.round(meal.fat * factor)} g · W ${Math.round(meal.carbs * factor)} g`;
                row.append(mealHeading, macros);
                dayCard.append(row);
            });
            container.append(dayCard);
        });
        renderShoppingList(factor);
    }

    function renderShoppingList(factor) {
        const ingredients = new Map();
        mealsByDay.forEach((day) => day.meals.forEach((meal) => meal.items.forEach(([name, amount, unit]) => {
            const key = `${name}|${unit}`;
            ingredients.set(key, (ingredients.get(key) || 0) + amount * factor);
        })));

        const checked = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const list = document.getElementById('shoppingList');
        list.replaceChildren();
        [...ingredients.entries()].sort(([first], [second]) => first.localeCompare(second, 'pl')).forEach(([key, amount]) => {
            const [name, unit] = key.split('|');
            const row = document.createElement('label');
            row.className = 'shopping-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = Boolean(checked[key]);
            const text = document.createElement('span');
            text.textContent = name;
            const quantity = document.createElement('span');
            quantity.className = 'shopping-quantity';
            quantity.textContent = `${Number(amount.toFixed(1))} ${unit}`;
            row.append(checkbox, text, quantity);
            checkbox.addEventListener('change', () => {
                checked[key] = checkbox.checked;
                localStorage.setItem(storageKey, JSON.stringify(checked));
                row.classList.toggle('is-checked', checkbox.checked);
            });
            row.classList.toggle('is-checked', checkbox.checked);
            list.append(row);
        });
    }

    const variantSelect = document.getElementById('calorieVariant');
    const savedVariant = localStorage.getItem('mealPlanVariant');
    if (['1800', '2000', '2200'].includes(savedVariant)) variantSelect.value = savedVariant;
    variantSelect.addEventListener('change', () => {
        localStorage.setItem('mealPlanVariant', variantSelect.value);
        renderPlan();
    });
    document.getElementById('resetShoppingList').addEventListener('click', () => {
        localStorage.removeItem(storageKey);
        renderShoppingList(selectedVariant() / baseCalories);
    });
    renderPlan();
})();

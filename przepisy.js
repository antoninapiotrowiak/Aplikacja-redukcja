(function () {
    const userRecipesKey = 'userRecipes';
    const favoritesKey = 'recipeFavorites';
    const defaultCategories = ['Śniadanie', 'Lunch', 'Obiad', 'Kolacja', 'Przekąski/Inne'];
    const builtInRecipes = [
        {
            id: 'built-in-chocolate-cake',
            title: 'Czekoladowe ciastko z airfryera',
            time: 12,
            kcal: 320,
            ingredients: ['3 łyżki mąki owsianej', '1 łyżka kakao', '1 jajko', '2 łyżki mleka', '1 łyżeczka miodu lub słodzika', 'Kostka gorzkiej czekolady do środka'],
            steps: [
                'Wszystkie składniki, poza kostką czekolady, wymieszaj w małym naczyniu żaroodpornym.',
                'W środek wciśnij kostkę gorzkiej czekolady.',
                'Piecz w airfryerze w 160°C przez około 10–12 minut.'
            ],
            macros: null
        },
        {
            id: 'built-in-oat-muffins',
            title: 'Owsiane muffinki bananowe',
            time: 20,
            kcal: 250,
            ingredients: ['1 dojrzały banan', '4 łyżki płatków owsianych', '1 jajko', '½ łyżeczki proszku do pieczenia', 'Cynamon (opcjonalnie)'],
            steps: [
                'Rozgnieć banana widelcem w miseczce.',
                'Dodaj jajko, płatki i proszek do pieczenia, a następnie wymieszaj.',
                'Przełóż masę do silikonowych foremek.',
                'Piecz w airfryerze w 170°C przez około 12–15 minut.'
            ],
            macros: null
        },
        {
            id: 'built-in-camembert',
            title: 'Camembert z żurawiną z airfryera',
            time: 8,
            kcal: 380,
            ingredients: ['1 krążek sera Camembert', '1 łyżeczka konfitury żurawinowej', 'Szczypta rozmarynu'],
            steps: [
                'Natnij delikatnie wierzch sera w kratkę.',
                'Nałóż na środek łyżeczkę żurawiny i posyp rozmarynem.',
                'Piecz w airfryerze w 180°C przez około 6–8 minut.'
            ],
            macros: null
        }
    ];

    const recipeDialog = document.getElementById('recipeDialog');
    const createDialog = document.getElementById('createRecipeDialog');
    const createForm = document.getElementById('createRecipeForm');
    const servingsInput = document.getElementById('recipeServings');
    const searchInput = document.getElementById('recipeSearch');
    let activeRecipe = null;
    let activeFilter = 'all';
    let logSaved = false;
    let calculatorItems = [];

    function readStoredArray(key) {
        const saved = localStorage.getItem(key);
        if (!saved) return [];
        const value = JSON.parse(saved);
        if (!Array.isArray(value)) {
            console.error(`Dane ${key} nie są listą.`);
            return [];
        }
        return value;
    }

    function getRecipes() {
        return [...builtInRecipes, ...readStoredArray(userRecipesKey).filter((recipe) =>
            recipe && typeof recipe.id === 'string' && typeof recipe.title === 'string'
        )];
    }

    function getFavorites() {
        return readStoredArray(favoritesKey).filter((id) => typeof id === 'string');
    }

    function numberOrNull(value) {
        if (value === '' || value === null || value === undefined) return null;
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function servingWord(count) {
        if (count === 1) return 'porcja';
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (Number.isInteger(count) && lastDigit >= 2 && lastDigit <= 4 &&
            (lastTwoDigits < 12 || lastTwoDigits > 14)) return 'porcje';
        return 'porcji';
    }

    function setActiveFilter(filter) {
        activeFilter = filter;
        document.querySelectorAll('.recipe-filter').forEach((button) => {
            const isActive = button.dataset.filter === filter;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
        renderRecipes();
    }

    function createRecipeCard(recipe, favorites) {
        const card = document.createElement('article');
        card.className = 'recipe-card';
        const openButton = document.createElement('button');
        openButton.className = 'recipe-card-open';
        openButton.type = 'button';
        openButton.setAttribute('aria-label', `Otwórz przepis: ${recipe.title}`);
        const cover = document.createElement('div');
        cover.className = `recipe-card-cover${recipe.isUserRecipe ? ' recipe-card-cover-own' : ''}`;
        cover.setAttribute('aria-hidden', 'true');
        const favorite = document.createElement('button');
        favorite.className = `recipe-favorite${favorites.includes(recipe.id) ? ' is-favorite' : ''}`;
        favorite.type = 'button';
        favorite.textContent = favorites.includes(recipe.id) ? '★' : '☆';
        favorite.setAttribute('aria-label', `${favorites.includes(recipe.id) ? 'Usuń z' : 'Dodaj do'} zapisanych przepisów: ${recipe.title}`);
        favorite.setAttribute('aria-pressed', String(favorites.includes(recipe.id)));
        favorite.addEventListener('click', (event) => {
            const updated = getFavorites();
            const index = updated.indexOf(recipe.id);
            if (index >= 0) updated.splice(index, 1);
            else updated.push(recipe.id);
            localStorage.setItem(favoritesKey, JSON.stringify(updated));
            renderRecipes();
        });

        const content = document.createElement('div');
        content.className = 'recipe-card-content';
        const title = document.createElement('h3');
        title.textContent = recipe.title;
        const detail = document.createElement('div');
        detail.className = 'recipe-card-detail';
        const time = document.createElement('span');
        time.textContent = `◷ ${recipe.time} min`;
        const kcal = document.createElement('span');
        kcal.textContent = recipe.kcal === null || recipe.kcal === undefined
            ? 'Kalorie niepodane'
            : `~${FitnessApp.formatNumber(recipe.kcal)} kcal / porcję`;
        detail.append(time, kcal);
        content.append(title, detail);
        openButton.append(cover, content);
        openButton.addEventListener('click', () => openRecipe(recipe));
        card.append(openButton, favorite);
        return card;
    }

    function renderRecipes() {
        const container = document.getElementById('recipesList');
        const empty = document.getElementById('recipeEmpty');
        const favorites = getFavorites();
        const query = searchInput.value.trim().toLocaleLowerCase('pl-PL');
        const visibleRecipes = getRecipes().filter((recipe) => {
            if (activeFilter === 'favorites' && !favorites.includes(recipe.id)) return false;
            if (activeFilter === 'mine' && !recipe.isUserRecipe) return false;
            const searchable = `${recipe.title} ${(recipe.ingredients || []).join(' ')}`.toLocaleLowerCase('pl-PL');
            return !query || searchable.includes(query);
        });

        container.replaceChildren(...visibleRecipes.map((recipe) => createRecipeCard(recipe, favorites)));
        document.getElementById('recipeResultsLabel').textContent =
            `${visibleRecipes.length} ${visibleRecipes.length === 1 ? 'przepis' : visibleRecipes.length < 5 ? 'przepisy' : 'przepisów'}`;
        empty.hidden = visibleRecipes.length > 0;
    }

    function renderScaledNutrition(recipe, servings) {
        const box = document.getElementById('recipeNutrition');
        box.replaceChildren();
        const nutrients = [
            { label: 'Kalorie', key: 'kcal', unit: 'kcal' },
            { label: 'Białko', key: 'protein', unit: 'g' },
            { label: 'Tłuszcze', key: 'fat', unit: 'g' },
            { label: 'Węglowodany', key: 'carbs', unit: 'g' }
        ];
        nutrients.forEach((nutrient) => {
            const item = document.createElement('div');
            item.className = 'recipe-nutrient';
            const label = document.createElement('span');
            label.textContent = nutrient.label;
            const value = document.createElement('strong');
            const amount = nutrient.key === 'kcal' ? recipe.kcal : recipe.macros?.[nutrient.key];
            value.textContent = amount === null || amount === undefined
                ? '—'
                : `${FitnessApp.formatNumber(amount * servings)} ${nutrient.unit}`;
            item.append(label, value);
            box.append(item);
        });
    }

    function renderRecipeDialog() {
        if (!activeRecipe) return;
        const servings = Number(servingsInput.value) || 1;
        document.getElementById('recipeDialogTitle').textContent = activeRecipe.title;
        document.getElementById('recipeDetailSummary').textContent =
            `${activeRecipe.time} min przygotowania · ${recipeYield} ${servingWord(recipeYield)} w przepisie`;
        const hasMacros = ['protein', 'fat', 'carbs'].some((key) => numberOrNull(activeRecipe.macros?.[key]) !== null);
        document.getElementById('recipeDetailNote').textContent = hasMacros
            ? `Wartości ${activeRecipe.isUserRecipe ? 'wpisano' : 'podano'} na jedną porcję. Zmiana liczby porcji przelicza podsumowanie.`
            : `${activeRecipe.isUserRecipe ? 'Kalorie wpisano' : 'Kalorie są orientacyjne'} na jedną porcję. Pozostałe wartości odżywcze nie zostały podane.`;
        const recipeYield = activeRecipe.originalServings || 1;
        document.getElementById('recipeIngredientsTitle').textContent =
            `Składniki · ${recipeYield} ${servingWord(recipeYield)}`;

        const ingredients = document.getElementById('recipeIngredients');
        ingredients.replaceChildren(...(activeRecipe.ingredients || []).map((ingredient) => {
            const item = document.createElement('li');
            item.textContent = ingredient;
            return item;
        }));
        const steps = document.getElementById('recipeSteps');
        steps.replaceChildren(...(activeRecipe.steps || []).map((step) => {
            const item = document.createElement('li');
            item.textContent = step;
            return item;
        }));
        const categories = [
            ...defaultCategories,
            ...readStoredArray('customMealCategories').filter((name) => typeof name === 'string')
        ];
        const categorySelect = document.getElementById('recipeMealCategory');
        categorySelect.replaceChildren(...categories.map((category) => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            return option;
        }));
        document.getElementById('recipeLogDate').value = FitnessApp.dateKey(new Date());
        document.getElementById('recipeLogMessage').textContent = '';
        const logButton = document.getElementById('addRecipeToDiary');
        logButton.disabled = false;
        logButton.textContent = 'Dodaj do dziennika';
        logSaved = false;
        renderScaledNutrition(activeRecipe, servings);
    }

    function openRecipe(recipe) {
        activeRecipe = recipe;
        servingsInput.value = '1';
        renderRecipeDialog();
        recipeDialog.showModal();
    }

    function createIngredientList(value) {
        return value.split('\n').map((line) => line.trim()).filter(Boolean);
    }

    function optionalNumber(formData, name) {
        const raw = String(formData.get(name) || '').trim();
        return raw ? Number(raw) : null;
    }

    document.querySelectorAll('.recipe-filter').forEach((button) => {
        button.addEventListener('click', () => setActiveFilter(button.dataset.filter));
    });
    searchInput.addEventListener('input', renderRecipes);
    document.getElementById('createRecipe').addEventListener('click', () => {
        createForm.reset();
        document.getElementById('newRecipeServings').value = '2';
        document.getElementById('createRecipeMessage').textContent = '';
        createDialog.showModal();
        document.getElementById('newRecipeName').focus();
    });
    document.getElementById('closeCreateRecipe').addEventListener('click', () => createDialog.close());
    document.getElementById('cancelCreateRecipe').addEventListener('click', () => createDialog.close());
    createDialog.addEventListener('click', (event) => {
        if (event.target === createDialog) createDialog.close();
    });
    document.getElementById('closeRecipeDialog').addEventListener('click', () => recipeDialog.close());
    recipeDialog.addEventListener('click', (event) => {
        if (event.target === recipeDialog) recipeDialog.close();
    });

    createForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!createForm.reportValidity()) return;
        const formData = new FormData(createForm);
        const ingredients = createIngredientList(String(formData.get('ingredients')));
        const steps = createIngredientList(String(formData.get('steps')));
        if (!ingredients.length || !steps.length) {
            document.getElementById('createRecipeMessage').textContent = 'Dodaj co najmniej jeden składnik i jeden krok przygotowania.';
            return;
        }
        const numericFields = ['servings', 'time', 'kcal', 'protein', 'fat', 'carbs'];
        const values = Object.fromEntries(numericFields.map((name) => [name, optionalNumber(formData, name)]));
        if (!values.servings || values.servings < 1 || values.servings > 30 ||
            !values.time || values.time < 1 || values.time > 600 ||
            values.kcal === null || values.kcal < 0 || values.kcal > 10000 ||
            ['protein', 'fat', 'carbs'].some((key) => values[key] !== null && (values[key] < 0 || values[key] > 1000))) {
            document.getElementById('createRecipeMessage').textContent = 'Sprawdź liczbę porcji, czas i wartości odżywcze.';
            return;
        }
        const recipe = {
            id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: String(formData.get('name')).trim(),
            time: values.time,
            kcal: values.kcal,
            ingredients,
            steps,
            originalServings: values.servings,
            isUserRecipe: true,
            macros: {
                protein: values.protein,
                fat: values.fat,
                carbs: values.carbs
            }
        };
        localStorage.setItem(userRecipesKey, JSON.stringify([...readStoredArray(userRecipesKey), recipe]));
        createDialog.close();
        setActiveFilter('mine');
        openRecipe(recipe);
    });

    servingsInput.addEventListener('input', () => {
        const value = Number(servingsInput.value);
        if (Number.isFinite(value) && value >= 0.5 && value <= 20) renderScaledNutrition(activeRecipe, value);
    });
    document.getElementById('decreaseServings').addEventListener('click', () => {
        servingsInput.value = String(Math.max(0.5, (Number(servingsInput.value) || 1) - 0.5));
        renderScaledNutrition(activeRecipe, Number(servingsInput.value));
    });
    document.getElementById('increaseServings').addEventListener('click', () => {
        servingsInput.value = String(Math.min(20, (Number(servingsInput.value) || 1) + 0.5));
        renderScaledNutrition(activeRecipe, Number(servingsInput.value));
    });

    document.getElementById('recipeLogForm').addEventListener('submit', (event) => {
        event.preventDefault();
        if (logSaved || !activeRecipe || !event.currentTarget.reportValidity()) return;
        const dateKey = document.getElementById('recipeLogDate').value;
        const servings = Number(servingsInput.value);
        if (!dateKey || !Number.isFinite(servings) || servings < 0.5 || servings > 20) return;
        const meals = FitnessApp.getMeals(dateKey);
        const entry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            category: document.getElementById('recipeMealCategory').value,
            name: activeRecipe.title,
            serving: `${FitnessApp.formatNumber(servings)} ${servingWord(servings)}`,
            kcal: Math.round(activeRecipe.kcal * servings),
            protein: numberOrNull(activeRecipe.macros?.protein) === null ? null : activeRecipe.macros.protein * servings,
            fat: numberOrNull(activeRecipe.macros?.fat) === null ? null : activeRecipe.macros.fat * servings,
            carbs: numberOrNull(activeRecipe.macros?.carbs) === null ? null : activeRecipe.macros.carbs * servings
        };
        meals.push(entry);
        localStorage.setItem(`meals_${dateKey}`, JSON.stringify(meals));
        document.getElementById('recipeLogMessage').textContent =
            `Dodano do dziennika: ${FitnessApp.formatNumber(entry.kcal)} kcal${entry.protein === null ? '. Makroskładniki nie były podane.' : '.'}`;
        const button = document.getElementById('addRecipeToDiary');
        button.disabled = true;
        button.textContent = 'Dodano';
        logSaved = true;
    });

    function renderCalculator() {
        const container = document.getElementById('calculatorItems');
        container.replaceChildren();
        const total = calculatorItems.reduce((sum, item) => sum + item.kcal, 0);
        calculatorItems.forEach((ingredient, index) => {
            const row = document.createElement('div');
            row.className = 'calculator-item';
            const label = document.createElement('span');
            label.textContent = `${ingredient.name} · ${ingredient.weight} g`;
            const calories = document.createElement('strong');
            calories.textContent = `${FitnessApp.formatNumber(ingredient.kcal)} kcal`;
            const remove = document.createElement('button');
            remove.className = 'calculator-remove';
            remove.type = 'button';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Usuń ${ingredient.name}`);
            remove.addEventListener('click', () => {
                calculatorItems.splice(index, 1);
                renderCalculator();
            });
            row.append(label, calories, remove);
            container.append(row);
        });
        document.getElementById('calculatorTotal').textContent = `Łącznie: ${FitnessApp.formatNumber(total)} kcal`;
    }

    document.getElementById('ingredientForm').addEventListener('submit', (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const formData = new FormData(event.currentTarget);
        const kcalPerHundred = Number(formData.get('kcal'));
        const weight = Number(formData.get('weight'));
        if (!Number.isFinite(kcalPerHundred) || !Number.isFinite(weight)) return;
        calculatorItems.push({
            name: String(formData.get('name')).trim(),
            weight,
            kcal: kcalPerHundred * weight / 100
        });
        event.currentTarget.reset();
        renderCalculator();
    });

    renderRecipes();
    renderCalculator();
})();

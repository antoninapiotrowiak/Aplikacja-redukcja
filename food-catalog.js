(function () {
    const storageKey = 'foodProducts';
    const initialProducts = [
        { id: 'seed-oats', name: 'Płatki owsiane', aliases: ['owsianka', 'platki owsiane'], kcal: 366, protein: 11.9, fat: 7.2, carbs: 58.7 },
        { id: 'seed-rice', name: 'Ryż biały, suchy', aliases: ['ryz', 'ryzu', 'ryzem'], kcal: 344, protein: 6.7, fat: 0.7, carbs: 78.9 },
        { id: 'seed-brown-rice', name: 'Ryż brązowy, suchy', aliases: ['ryz brazowy', 'brazowego ryzu'], kcal: 367, protein: 7.5, fat: 3.2, carbs: 76.2 },
        { id: 'seed-pasta', name: 'Makaron, suchy', aliases: ['makaron', 'makaronu'], kcal: 371, protein: 13, fat: 1.5, carbs: 75 },
        { id: 'seed-chicken', name: 'Pierś z kurczaka, surowa', aliases: ['kurczak', 'kurczaka', 'piers z kurczaka'], kcal: 120, protein: 22.5, fat: 2.6, carbs: 0 },
        { id: 'seed-turkey', name: 'Pierś z indyka, surowa', aliases: ['indyk', 'indyka', 'piers z indyka'], kcal: 114, protein: 23.7, fat: 1.5, carbs: 0 },
        { id: 'seed-egg', name: 'Jajko', aliases: ['jajka', 'jajko', 'jajek'], kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7 },
        { id: 'seed-apple', name: 'Jabłko', aliases: ['jablko', 'jablka', 'jablkiem'], kcal: 52, protein: 0.3, fat: 0.2, carbs: 13.8 },
        { id: 'seed-banana', name: 'Banan', aliases: ['banan', 'banana', 'bananem'], kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8 },
        { id: 'seed-potato', name: 'Ziemniaki', aliases: ['ziemniak', 'ziemniaki', 'ziemniakow'], kcal: 77, protein: 2, fat: 0.1, carbs: 17.5 },
        { id: 'seed-tomato', name: 'Pomidor', aliases: ['pomidor', 'pomidora', 'pomidory'], kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
        { id: 'seed-cucumber', name: 'Ogórek', aliases: ['ogorek', 'ogorka', 'ogorkiem'], kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 },
        { id: 'seed-carrot', name: 'Marchew', aliases: ['marchew', 'marchewka', 'marchewki'], kcal: 41, protein: 0.9, fat: 0.2, carbs: 9.6 },
        { id: 'seed-broccoli', name: 'Brokuł', aliases: ['brokul', 'brokula', 'brokulem'], kcal: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
        { id: 'seed-pepper', name: 'Papryka czerwona', aliases: ['papryka', 'papryki', 'papryke'], kcal: 31, protein: 1, fat: 0.3, carbs: 6 },
        { id: 'seed-salmon', name: 'Łosoś, surowy', aliases: ['losos', 'lososia', 'lososiem'], kcal: 208, protein: 20.4, fat: 13.4, carbs: 0 },
        { id: 'seed-cod', name: 'Dorsz, surowy', aliases: ['dorsz', 'dorsza'], kcal: 82, protein: 17.8, fat: 0.7, carbs: 0 },
        { id: 'seed-tofu', name: 'Tofu naturalne', aliases: ['tofu'], kcal: 144, protein: 17.3, fat: 8.7, carbs: 2.8 },
        { id: 'seed-lentils', name: 'Soczewica, sucha', aliases: ['soczewica', 'soczewicy', 'soczewice'], kcal: 352, protein: 24.6, fat: 1.1, carbs: 63.1 },
        { id: 'seed-beans', name: 'Fasola czerwona, gotowana', aliases: ['fasola', 'fasoli', 'fasole'], kcal: 127, protein: 8.7, fat: 0.5, carbs: 22.8 },
        { id: 'seed-yogurt', name: 'Jogurt naturalny', aliases: ['jogurt', 'jogurtu', 'jogurtem'], kcal: 61, protein: 3.5, fat: 3.3, carbs: 4.7 },
        { id: 'seed-skyr', name: 'Skyr naturalny', aliases: ['skyr', 'skyru'], kcal: 63, protein: 11, fat: 0.2, carbs: 4 },
        { id: 'seed-milk', name: 'Mleko 2%', aliases: ['mleko', 'mleka', 'mlekiem'], kcal: 50, protein: 3.4, fat: 2, carbs: 4.8 },
        { id: 'seed-cottage-cheese', name: 'Serek wiejski', aliases: ['serek wiejski', 'serka wiejskiego'], kcal: 98, protein: 11.5, fat: 4.3, carbs: 2.5 },
        { id: 'seed-bread', name: 'Chleb pełnoziarnisty', aliases: ['chleb', 'chleba', 'chleb pelnoziarnisty'], kcal: 247, protein: 12.5, fat: 4.2, carbs: 41.3 },
        { id: 'seed-olive-oil', name: 'Oliwa z oliwek', aliases: ['oliwa', 'oliwy', 'oliwe'], kcal: 884, protein: 0, fat: 100, carbs: 0 },
        { id: 'seed-peanut-butter', name: 'Masło orzechowe', aliases: ['maslo orzechowe', 'masla orzechowego'], kcal: 588, protein: 25, fat: 50, carbs: 20 },
        { id: 'seed-walnuts', name: 'Orzechy włoskie', aliases: ['orzechy', 'orzechow', 'orzechy wloskie'], kcal: 654, protein: 15.2, fat: 65.2, carbs: 13.7 },
        { id: 'seed-avocado', name: 'Awokado', aliases: ['awokado'], kcal: 160, protein: 2, fat: 14.7, carbs: 8.5 },
        { id: 'seed-orange', name: 'Pomarańcza', aliases: ['pomarancza', 'pomaranczy'], kcal: 47, protein: 0.9, fat: 0.1, carbs: 11.8 }
    ].map((product) => ({
        ...product,
        basis: '100g',
        serving: '100 g',
        source: 'Wartość orientacyjna, baza wstępna'
    }));

    function normalize(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('pl-PL').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function readUserProducts() {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return [];
        let products;
        try {
            products = JSON.parse(saved);
        } catch (error) {
            console.error('Nie można odczytać zapisanej bazy produktów.', error);
            return [];
        }
        if (!Array.isArray(products)) {
            console.error('Zapisana baza produktów nie jest listą.');
            return [];
        }
        return products.filter((product) => product && typeof product.id === 'string' &&
            typeof product.name === 'string' && Number.isFinite(Number(product.kcal)));
    }

    function getAll() {
        const personal = readUserProducts();
        const personalNames = new Set(personal.map((product) => normalize(product.name)));
        const personalCodes = new Set(personal.map((product) => product.barcode).filter(Boolean));
        return [
            ...personal,
            ...initialProducts.filter((product) => !personalNames.has(normalize(product.name)) && !personalCodes.has(product.barcode))
        ];
    }

    function save(product) {
        const products = readUserProducts();
        const key = product.barcode ? 'barcode' : 'name';
        const existingIndex = products.findIndex((entry) => product[key] && normalize(entry[key]) === normalize(product[key]));
        if (existingIndex >= 0) products[existingIndex] = { ...products[existingIndex], ...product };
        else products.unshift(product);
        localStorage.setItem(storageKey, JSON.stringify(products));
        return product;
    }

    function rememberMeal(meal) {
        if (!meal.name || !Number.isFinite(Number(meal.kcal))) return;
        const existing = getAll().find((product) => normalize(product.name) === normalize(meal.name));
        const seed = initialProducts.find((product) => normalize(product.name) === normalize(meal.name));
        if (existing?.barcode) return;
        const gramServing = String(meal.serving || '').match(/^(\d+(?:[.,]\d+)?)\s*g$/i);
        const grams = gramServing ? Number(gramServing[1].replace(',', '.')) : null;
        const basis = Number.isFinite(grams) && grams > 0 ? '100g' : 'portion';
        const factor = basis === '100g' ? 100 / grams : 1;
        save({
            id: existing?.id || `meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: meal.name,
            aliases: [...new Set([...(existing?.aliases || []), ...(seed?.aliases || []), meal.name])],
            kcal: Number(meal.kcal) * factor,
            protein: meal.protein === null ? null : Number(meal.protein) * factor,
            fat: meal.fat === null ? null : Number(meal.fat) * factor,
            carbs: meal.carbs === null ? null : Number(meal.carbs) * factor,
            basis,
            serving: meal.serving || '1 porcja',
            source: 'Zapisane z dziennika'
        });
    }

    async function lookupBarcode(barcode) {
        const code = String(barcode || '').replace(/\D/g, '');
        if (code.length < 8 || code.length > 14) throw new Error('Wpisz poprawny kod kreskowy (8–14 cyfr).');
        const cached = getAll().find((product) => product.barcode === code);
        if (cached) return cached;

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        let response;
        try {
            response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,brands,nutriments,quantity`, {
                signal: controller.signal,
                headers: { Accept: 'application/json' }
            });
        } catch (error) {
            if (error.name === 'AbortError') throw new Error('Wyszukiwanie produktu trwało zbyt długo. Spróbuj ponownie.');
            throw new Error('Nie udało się połączyć z Open Food Facts. Sprawdź internet lub wpisz produkt ręcznie.');
        } finally {
            window.clearTimeout(timeout);
        }
        if (!response.ok) throw new Error(`Open Food Facts zwróciło błąd (${response.status}).`);
        let payload;
        try {
            payload = await response.json();
        } catch {
            throw new Error('Odpowiedź Open Food Facts jest nieprawidłowa. Spróbuj ponownie później.');
        }
        if (payload.status !== 1 || !payload.product) throw new Error('Nie znaleziono produktu o tym kodzie.');

        const item = payload.product;
        const nutrients = item.nutriments || {};
        const kcalValue = nutrients['energy-kcal_100g'];
        const kcal = Number(kcalValue);
        if (!String(item.product_name || '').trim() || kcalValue === null || kcalValue === undefined || !Number.isFinite(kcal) || kcal < 0) {
            throw new Error('Produkt nie ma nazwy lub wartości kcal w bazie Open Food Facts.');
        }
        const nutrientValue = (value) => value === null || value === undefined || value === '' || !Number.isFinite(Number(value))
            ? null
            : Number(value);
        return save({
            id: `barcode-${code}`,
            name: String(item.product_name).trim(),
            brand: String(item.brands || '').split(',')[0].trim(),
            barcode: code,
            kcal,
            protein: nutrientValue(nutrients.proteins_100g),
            fat: nutrientValue(nutrients.fat_100g),
            carbs: nutrientValue(nutrients.carbohydrates_100g),
            basis: '100g',
            serving: String(item.quantity || '100 g'),
            source: 'Open Food Facts'
        });
    }

    function calculateDescription(description) {
        const segments = String(description || '').split(/[,;]|\s+i\s+/i).map((part) => part.trim()).filter(Boolean);
        if (!segments.length) throw new Error('Wpisz produkty z ilością w gramach, np. „150 g ryżu”.');

        const lines = segments.map((segment) => {
            const match = segment.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|gram(?:ów|y|a)?)\s+(.+)$/i);
            if (!match) throw new Error(`Nie rozpoznano ilości w „${segment}”. Użyj gramów, np. „150 g ryżu”.`);
            const enteredAmount = Number(match[1].replace(',', '.'));
            const amount = match[2].toLocaleLowerCase('pl-PL') === 'kg' ? enteredAmount * 1000 : enteredAmount;
            if (!Number.isFinite(amount) || amount <= 0 || amount > 10000) {
                throw new Error(`Ilość w „${segment}” musi być większa od zera i nie przekraczać 10 000 g.`);
            }

            const query = normalize(match[3]);
            const product = getAll()
                .flatMap((item) => [item.name, ...(item.aliases || [])].map((name) => ({
                    item,
                    name: normalize(name)
                })))
                .filter((entry) => entry.name && (query === entry.name || query.includes(entry.name)))
                .sort((a, b) => b.name.length - a.name.length)[0]?.item;
            if (!product) throw new Error(`Nie znaleziono „${match[3]}” w lokalnej bazie produktów.`);
            if (product.basis !== '100g') {
                throw new Error(`„${product.name}” zapisano jako porcję, a nie wartości na 100 g. Wybierz inny produkt lub wpisz go ręcznie.`);
            }
            return { product, amount };
        });

        const total = { kcal: 0, protein: 0, fat: 0, carbs: 0 };
        const tracked = { protein: true, fat: true, carbs: true };
        lines.forEach(({ product, amount }) => {
            const factor = amount / 100;
            total.kcal += Number(product.kcal) * factor;
            ['protein', 'fat', 'carbs'].forEach((key) => {
                if (product[key] === null || product[key] === undefined || !Number.isFinite(Number(product[key]))) {
                    tracked[key] = false;
                } else {
                    total[key] += Number(product[key]) * factor;
                }
            });
        });
        return {
            lines,
            kcal: Math.round(total.kcal),
            protein: tracked.protein ? Math.round((total.protein + 1e-8) * 10) / 10 : null,
            fat: tracked.fat ? Math.round((total.fat + 1e-8) * 10) / 10 : null,
            carbs: tracked.carbs ? Math.round((total.carbs + 1e-8) * 10) / 10 : null
        };
    }

    window.FoodCatalog = {
        normalize,
        getAll,
        search(query) {
            const needle = normalize(query);
            if (!needle) return getAll();
            return getAll().filter((product) =>
                normalize(`${product.name} ${product.brand || ''} ${(product.aliases || []).join(' ')}`).includes(needle)
            );
        },
        findByDescription(query) {
            const needle = normalize(query);
            return getAll().filter((product) => {
                const names = [product.name, ...(product.aliases || [])].map(normalize);
                return names.some((name) => {
                    if (!name) return false;
                    const tokens = name.split(' ');
                    return tokens.some((token) => needle.split(' ').some((part) =>
                        part.length >= 4 && (token.startsWith(part.slice(0, 4)) || part.startsWith(token.slice(0, 4)))
                    ));
                });
            });
        },
        calculateDescription,
        save,
        rememberMeal,
        lookupBarcode
    };
})();

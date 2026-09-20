# Aplikacja-redukcja
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moja Redukcja | PWA Cute Blue</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #5c9ead;       /* Uroczy, zgaszony błękit */
            --primary-light: #eef7fa; /* Bardzo jasny pastelowy niebieski */
            --accent: #8ac4d0;        /* Jasny błękit pastelowy */
            --accent-pink: #f4acb7;   /* Pudrowy akcent */
            --bg: #f0f5f9;            /* Tło chmurkowe */
            --card-bg: #ffffff;
            --text: #3d4a52;          /* Miękki ciemnocielisty/szary */
            --radius: 20px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Comfortaa', 'Segoe UI', system-ui, sans-serif; }
        body { background: var(--bg); color: var(--text); padding-bottom: 95px; }

        header {
            background: linear-gradient(135deg, #70a1ff, #a8c0ff);
            color: white; padding: 25px 20px 20px; text-align: center;
            border-bottom-left-radius: 28px; border-bottom-right-radius: 28px;
            box-shadow: 0 6px 20px rgba(112, 161, 255, 0.25);
        }

        .countdown-box {
            font-size: 0.95rem; margin-top: 10px; font-weight: 700;
            background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(8px);
            padding: 8px 18px; border-radius: 20px; display: inline-block;
            box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2);
        }

        /* Nav Bar */
        nav {
            position: fixed; bottom: 0; left: 0; right: 0; background: #ffffff;
            display: flex; justify-content: space-around; padding: 12px 0 16px;
            box-shadow: 0 -4px 20px rgba(92, 158, 173, 0.1); z-index: 1000; 
            border-top-left-radius: 20px; border-top-right-radius: 20px;
        }
        nav button {
            background: none; border: none; font-size: 0.85rem; color: #a0b2bc;
            font-weight: 700; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: 0.3s;
        }
        nav button.active { color: var(--primary); transform: translateY(-3px); }
        nav button span { font-size: 1.4rem; }

        /* Container */
        .tab-content { display: none; padding: 20px; max-width: 650px; margin: 0 auto; animation: fadeIn 0.3s ease-in-out; }
        .tab-content.active { display: block; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .card {
            background: var(--card-bg); border-radius: var(--radius); padding: 20px;
            margin-bottom: 20px; box-shadow: 0 8px 25px rgba(168, 192, 255, 0.15); border: 2px solid #edf4f8;
        }
        h2 { color: var(--primary); font-size: 1.2rem; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }

        /* Calorie Progress */
        .calorie-progress { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 15px; }
        .stat-box { background: var(--primary-light); padding: 14px; border-radius: 16px; flex: 1; text-align: center; border: 1px solid #e1eef4; }
        .stat-box .num { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 4px 0; }
        .progress-bar-bg { background: #e2f0f5; height: 12px; border-radius: 10px; overflow: hidden; margin-bottom: 15px; }
        .progress-bar-fill { background: linear-gradient(90deg, #8ac4d0, #70a1ff); height: 100%; width: 0%; transition: width 0.4s ease; }

        /* Form Controls */
        input, select, textarea {
            width: 100%; padding: 12px 16px; margin: 8px 0; border: 2px solid #e2edf3;
            border-radius: 14px; font-size: 0.95rem; outline: none; transition: 0.2s; background: #fafcfe; color: var(--text);
        }
        input:focus, textarea:focus { border-color: var(--primary); background: #fff; }
        .btn {
            width: 100%; background: linear-gradient(135deg, #70a1ff, #5c9ead); color: white; border: none;
            padding: 13px; border-radius: 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: 0.2s;
            box-shadow: 0 4px 12px rgba(112, 161, 255, 0.3);
        }
        .btn:hover { opacity: 0.95; transform: translateY(-1px); }
        .btn-small { padding: 6px 12px; font-size: 0.8rem; border-radius: 10px; width: auto; font-weight: 700; }
        .btn-small.active { background: var(--primary); color: white; border-color: var(--primary); }
        .btn-accent { background: linear-gradient(135deg, #8ac4d0, #5c9ead); box-shadow: 0 4px 12px rgba(138, 196, 208, 0.3); }
        .btn-outline { background: #f0f7fa; color: var(--primary); border: 2px solid #d8ebf2; margin-top: 8px; box-shadow: none; }

        /* Recipe Grid & Filters */
        .filter-tags { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px; }
        .tag { background: #eef5f8; color: #78909c; padding: 7px 16px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; white-space: nowrap; font-weight: 700; }
        .tag.active { background: var(--primary); color: white; }
        
        .recipe-item { 
            border-bottom: 1px dashed #e1ebf0; padding: 14px 10px; cursor: pointer; border-radius: 12px; transition: 0.2s; 
        }
        .recipe-item:hover { background: var(--primary-light); }
        .recipe-item:last-child { border: none; }
        .recipe-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .badge { background: #a8c0ff; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }

        /* Modal Styles */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
            display: none; justify-content: center; align-items: center; z-index: 2000; padding: 20px;
        }
        .modal-overlay.active { display: flex; }
        .modal-card {
            background: #ffffff; border-radius: 24px; padding: 24px; max-width: 500px; width: 100%;
            max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: popIn 0.25s ease-out;
        }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .modal-title { font-size: 1.3rem; color: var(--primary); font-weight: 800; }
        .close-btn { background: #f0f5f9; border: none; font-size: 1.2rem; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #78909c; }
        
        .recipe-meta-tag { display: inline-block; background: var(--primary-light); color: var(--primary); font-weight: 700; padding: 6px 14px; border-radius: 12px; font-size: 0.85rem; margin-bottom: 15px; }
        
        .recipe-section-title { font-weight: 800; color: #455a64; margin: 15px 0 8px; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .ingredients-list { list-style-type: square; padding-left: 20px; color: #607d8b; font-size: 0.9rem; line-height: 1.6; }
        .recipe-steps { color: #52626b; font-size: 0.9rem; line-height: 1.6; white-space: pre-line; background: #fafcfe; padding: 12px; border-radius: 12px; border: 1px solid #edf4f8; }

        /* Timer Displays */
        .timer-display { text-align: center; padding: 20px; background: var(--primary-light); border-radius: 20px; margin-bottom: 15px; border: 2px dashed #cae5ef; }
        .timer-time { font-size: 3.5rem; font-weight: 900; color: var(--primary); letter-spacing: 1px; }
        .timer-phase { font-weight: 800; font-size: 1.1rem; text-transform: uppercase; color: #70a1ff; letter-spacing: 1px; }

        /* Workout Steps */
        .workout-step { padding: 10px 14px; background: #f5f9fc; border-left: 4px solid var(--accent); margin-bottom: 8px; border-radius: 8px; font-size: 0.9rem; color: #52626b; }
    </style>
</head>
<body>

    <header>
        <h1>Cel: 58-60 kg 🩵</h1>
        <div class="countdown-box" id="countdown">Ładowanie odliczania...</div>
    </header>

    <!-- TAB 1: DASHBOARD -->
    <div id="dashboard" class="tab-content active">
        <div class="card">
            <h2>☁️ Dziennik Kalorii</h2>
            <div class="progress-bar-bg"><div class="progress-bar-fill" id="kcalBar"></div></div>
            <div class="calorie-progress">
                <div class="stat-box"><div>Zjedzone</div><div class="num" id="eatenKcal">0</div><div>kcal</div></div>
                <div class="stat-box"><div>Pozostało</div><div class="num" id="leftKcal">1600</div><div>kcal</div></div>
            </div>
            <input type="number" id="addKcalInput" placeholder="Wpisz kalorie posiłku (np. 350)">
            <button class="btn" onclick="addCalories()">Dodaj Posiłek ✨</button>
            <button class="btn btn-outline" onclick="resetCalories()">Resetuj kalorie na nowy dzień</button>
        </div>

        <div class="card">
            <h2>📈 Postęp Wagi</h2>
            <div style="display: flex; gap: 10px;">
                <input type="number" step="0.1" id="weightInput" placeholder="Dzisiejsza waga (kg)">
                <button class="btn btn-accent" style="width: 40%;" onclick="addWeight()">Zapisz 🩵</button>
            </div>
            <canvas id="weightChart" style="margin-top:15px;"></canvas>
        </div>
    </div>

    <!-- TAB 2: TRENINGI & TIMERY -->
    <div id="workouts" class="tab-content">
        
        <!-- PEŁNY STOPER DLA PLANU PEŁNEGO -->
        <div class="card">
            <h2>⏱️ Stoper Treningowy (Plan Pełny)</h2>
            <div class="timer-display" style="background: #eef7fa;">
                <div class="timer-phase" style="color: var(--primary);" id="fullPhase">READY FOR THE SET? 🩵</div>
                <div class="timer-time" style="color: var(--primary);" id="fullTime">00:30</div>
                
                <div style="margin-top: 10px;">
                    <span style="font-size:0.8rem; font-weight:700; color:#78909c;">CZAS ĆWICZENIA:</span>
                    <div style="display: flex; justify-content: center; gap: 6px; margin-top: 4px;">
                        <button class="btn btn-small btn-outline full-work-btn active" onclick="setFullWork(30, this)">30s</button>
                        <button class="btn btn-small btn-outline full-work-btn" onclick="setFullWork(45, this)">45s</button>
                        <button class="btn btn-small btn-outline full-work-btn" onclick="setFullWork(60, this)">60s</button>
                    </div>
                </div>

                <div style="margin-top: 10px;">
                    <span style="font-size:0.8rem; font-weight:700; color:#78909c;">CZAS PRZERWY:</span>
                    <div style="display: flex; justify-content: center; gap: 6px; margin-top: 4px;">
                        <button class="btn btn-small btn-outline full-rest-btn" onclick="setFullRest(30, this)">30s</button>
                        <button class="btn btn-small btn-outline full-rest-btn active" onclick="setFullRest(60, this)">60s</button>
                        <button class="btn btn-small btn-outline full-rest-btn" onclick="setFullRest(90, this)">90s</button>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-accent" onclick="startFullTimer()">Start Serii</button>
                <button class="btn btn-outline" style="margin:0;" onclick="resetFullTimer()">Reset</button>
            </div>
        </div>

        <!-- STOPER HIIT -->
        <div class="card">
            <h2>⚡ Stoper HIIT (Plan "Na Lenia")</h2>
            <div class="timer-display">
                <div class="timer-phase" id="timerPhase">GOTOWA? 🩵</div>
                <div class="timer-time" id="timerTime">00:45</div>
                <div style="font-size: 0.9rem; color: #607d8b;" id="currentExercise">Ćwiczenie 1: Step Jacks</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn" onclick="startHIIT()">Start Treningu</button>
                <button class="btn btn-outline" style="margin:0;" onclick="resetHIIT()">Stop / Reset</button>
            </div>
        </div>

        <div class="card">
            <h2>Plan "Na Lenia" (10 Minut / Bez Skakania)</h2>
            <div class="workout-step">1. Step Jacks (Dynamiczny krok w bok z rękami)</div>
            <div class="workout-step">2. Przysiady z wyprostem rąk nad głowę</div>
            <div class="workout-step">3. Mountain Climbers w staniu (Kolana do klatki)</div>
            <div class="workout-step">4. Powolne zakroki w miejscu (Prawa / Lewa)</div>
            <div class="workout-step">5. Wznosy bioder na pośladki w leżeniu</div>
            <div class="workout-step">6. Spięcia brzucha w leżeniu z ugiętymi kolanami</div>
            <div class="workout-step">7. Pompki przy ścianie / w klęku</div>
            <div class="workout-step">8. Boczne wykroki w miejscu</div>
            <div class="workout-step">9. Plank w oparciu o kanapę / w klęku</div>
            <div class="workout-step">10. Powolne wyciąganie rąk i nóg w klęku podpartym</div>
        </div>

        <div class="card">
            <h2>Plan Pełny (Gdy masz więcej czasu)</h2>
            <div class="workout-step">• Przysiady klasyczne z pauzą na dole (4x15)</div>
            <div class="workout-step">• Zakroki w miejscu z mocnym spięciem pośladka (3x12)</div>
            <div class="workout-step">• Glute Bridges z gumą/bez (4x20)</div>
            <div class="workout-step">• Martwy ciąg na prostych nogach (bez obciążenia) (3x15)</div>
            <div class="workout-step">• Deska (Plank) tradycyjna (3x 45 sek)</div>
        </div>
    </div>

    <!-- TAB 3: PRZEPISY -->
    <div id="recipes" class="tab-content">
        <div class="card">
            <h2>🫐 Książka Przepisów</h2>
            <input type="text" id="searchRecipe" placeholder="Szukaj przepisu lub składnika..." oninput="filterRecipes()">
            
            <div class="filter-tags">
                <div class="tag active" onclick="setCategory('all', this)">Wszystkie</div>
                <div class="tag" onclick="setCategory('airfryer', this)">Airfryer</div>
                <div class="tag" onclick="setCategory('zelki', this)">Żelki</div>
                <div class="tag" onclick="setCategory('szkola', this)">Szkolne Lunchboxy</div>
                <div class="tag" onclick="setCategory('desery', this)">Desery</div>
            </div>

            <div id="recipeList"></div>
        </div>

        <div class="card">
            <h2>Dodaj Własny Przepis 📝</h2>
            <input type="text" id="recipeTitle" placeholder="Nazwa potrawy">
            <input type="number" id="recipeKcal" placeholder="Kalorie (kcal)">
            <input type="number" id="recipePortions" placeholder="Liczba porcji (np. 1 lub 2)">
            <select id="recipeCategory">
                <option value="airfryer">Airfryer</option>
                <option value="zelki">Żelki</option>
                <option value="szkola">Szkolne Lunchboxy</option>
                <option value="desery">Desery</option>
            </select>
            <textarea id="recipeIngredients" placeholder="Składniki (oddzielone przecinkami lub nową linią)"></textarea>
            <textarea id="recipeSteps" placeholder="Sposób przygotowania krok po kroku"></textarea>
            <button class="btn" onclick="addNewRecipe()">Zapisz do Mojej Bazy 🩵</button>
        </div>
    </div>

    <!-- OKIENKO MODALNE PRZEPISU -->
    <div class="modal-overlay" id="recipeModal" onclick="closeModalOnOverlay(event)">
        <div class="modal-card">
            <div class="modal-header">
                <div class="modal-title" id="modalTitle">Nazwa przepisu</div>
                <button class="close-btn" onclick="closeModal()">✕</button>
            </div>
            <div class="recipe-meta-tag" id="modalMeta">🔥 0 kcal | 🍽️ Porcje: 1</div>
            
            <div class="recipe-section-title">🥣 Składniki:</div>
            <ul class="ingredients-list" id="modalIngredients"></ul>
            
            <div class="recipe-section-title">👩‍🍳 Sposób przygotowania:</div>
            <div class="recipe-steps" id="modalSteps"></div>
        </div>
    </div>

    <!-- NAV BAR -->
    <nav>
        <button class="active" onclick="switchTab('dashboard', this)"><span>📊</span>Dashboard</button>
        <button onclick="switchTab('workouts', this)"><span>⏱️</span>Treningi</button>
        <button onclick="switchTab('recipes', this)"><span>🥗</span>Przepisy</button>
    </nav>

    <script>
        // 1. ODLICZANIE DO 4 LUTEGO
        const targetDate = new Date("2027-02-04T00:00:00").getTime();
        function updateCountdown() {
            const now = new Date().getTime();
            const diff = targetDate - now;
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                document.getElementById("countdown").innerText = `Pozostało: ${days} dni do 4 lutego! ✨`;
            } else {
                document.getElementById("countdown").innerText = "Czas na Twój Cel!";
            }
        }
        updateCountdown();

        // 2. PRZEŁĄCZANIE ZAKŁADEK
        function switchTab(tabId, btn) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            btn.classList.add('active');
        }

        // 3. KALORIE (Domyślnie 1600 kcal)
        let eaten = parseInt(localStorage.getItem('eatenKcal')) || 0;
        const targetKcal = 1600;

        function updateCalorieUI() {
            document.getElementById('eatenKcal').innerText = eaten;
            const left = Math.max(0, targetKcal - eaten);
            document.getElementById('leftKcal').innerText = left;
            
            const pct = Math.min(100, (eaten / targetKcal) * 100);
            document.getElementById('kcalBar').style.width = pct + '%';
            
            localStorage.setItem('eatenKcal', eaten);
        }
        function addCalories() {
            const val = parseInt(document.getElementById('addKcalInput').value);
            if (val) {
                eaten += val;
                document.getElementById('addKcalInput').value = '';
                updateCalorieUI();
            }
        }
        function resetCalories() {
            eaten = 0;
            updateCalorieUI();
        }
        updateCalorieUI();

        // 4. CHART.JS - DZIENNIK WAGI
        let weightData = JSON.parse(localStorage.getItem('weightData')) || [72];
        let weightLabels = JSON.parse(localStorage.getItem('weightLabels')) || ['Start'];

        const ctx = document.getElementById('weightChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightLabels,
                datasets: [{
                    label: 'Waga (kg)',
                    data: weightData,
                    borderColor: '#70a1ff',
                    backgroundColor: 'rgba(112, 161, 255, 0.15)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#5c9ead',
                    pointRadius: 6
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        function addWeight() {
            const w = parseFloat(document.getElementById('weightInput').value);
            if (w) {
                const dateStr = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
                weightData.push(w);
                weightLabels.push(dateStr);
                localStorage.setItem('weightData', JSON.stringify(weightData));
                localStorage.setItem('weightLabels', JSON.stringify(weightLabels));
                chart.update();
                document.getElementById('weightInput').value = '';
            }
        }

        // 5. PRZEPISY Z MODALEM
        const defaultRecipes = [
            { 
                id: 1, 
                title: "Żelki Jagodowo-Cytrynowe Zero", 
                kcal: 35, 
                portions: 2,
                cat: "zelki", 
                ingredients: ["200 ml naparu z herbaty owocowej lub jagodowej", "25 g żelatyny w proszku", "Słodzik (np. erytrytol lub ksylitol) do smaku", "Sok z 1/2 cytryny"],
                steps: "1. Zaparz mocną herbatę i rozpuść w niej słodzik oraz sok z cytryny.\n2. Do gorącego naparu dodaj żelatynę i bardzo dokładnie wymieszaj, aż całkowicie się rozpuści.\n3. Przelej mieszankę do silikonowych foremek na żelki.\n4. Wstaw do lodówki na około 2 godziny do całkowitego stężenia."
            },
            { 
                id: 2, 
                title: "Airfryer Chrupiący Kurczak Gyros", 
                kcal: 420, 
                portions: 1,
                cat: "airfryer", 
                ingredients: ["160 g piersi z kurczaka", "200 g ziemniaków", "1 łyżeczka oliwy z oliwek", "Przyprawa gyros, sól, pieprz, papryka słodka"],
                steps: "1. Ziemniaki obierz i pokrój w równą kostkę. Kurczaka pokrój w paski.\n2. Ziemniaki i kurczaka skrop oliwą, wymieszaj z przyprawą gyros i ulubionymi ziołami.\n3. Wrzuć wszystko do koszyka Airfryera.\n4. Piecz w 190°C przez 18 minut, potrząsając koszykiem w połowie czasu."
            },
            { 
                id: 3, 
                title: "Zapiekana Tortilla z Szynką i Serem", 
                kcal: 380, 
                portions: 1,
                cat: "szkola", 
                ingredients: ["1 placek tortilli pełnoziarnistej", "2 plastry sera żółtego podpuszczkowego", "3 plastry szynki z piersi indyka", "2 łyżki jogurtu naturalnego + ząbek czosnku (sos)"],
                steps: "1. Na połowie tortilli ułóż ser oraz szynkę z indyka.\n2. Złóż tortillę na pół.\n3. Zapiekaj na suchej patelni lub w opiekaczu przez 3-4 minuty, aż ser pięknie się rozpuści.\n4. Podawaj z domowym sosikiem czosnkowym na bazie jogurtu."
            },
            { 
                id: 4, 
                title: "Airfryer Pieczona Owsianka Czekoladowa", 
                kcal: 310, 
                portions: 1,
                cat: "airfryer", 
                ingredients: ["40 g płatków owsianych", "1/2 dojrzałego banana", "10 g kakao", "80 ml mleka (lub napoju roślinnego)", "1/2 łyżeczki proszku do pieczenia"],
                steps: "1. Rozgnieć banana widelcem w małej foremce żaroodpornej.\n2. Dodaj płatki owsiane, kakao, proszek do pieczenia i mleko, po czym dokładnie wymieszaj.\n3. Wstaw foremkę do Airfryera i piecz w 180°C przez 10 minut.\n4. Opcjonalnie posyp na wierzchu kilkoma malinami lub kostką gorzkiej czekolady."
            }
        ];

        let recipes = JSON.parse(localStorage.getItem('userRecipes')) || defaultRecipes;
        let activeCategory = 'all';

        function renderRecipes() {
            const list = document.getElementById('recipeList');
            const search = document.getElementById('searchRecipe').value.toLowerCase();
            list.innerHTML = '';

            recipes.filter(r => {
                const matchCat = activeCategory === 'all' || r.cat === activeCategory;
                const matchSearch = r.title.toLowerCase().includes(search) || 
                                    (Array.isArray(r.ingredients) ? r.ingredients.join(' ') : r.ingredients).toLowerCase().includes(search);
                return matchCat && matchSearch;
            }).forEach(r => {
                list.innerHTML += `
                    <div class="recipe-item" onclick="openRecipeModal(${r.id})">
                        <div class="recipe-header">
                            <h3 style="color:#455a64; font-size:1.05rem;">${r.title}</h3>
                            <span class="badge">~${r.kcal} kcal</span>
                        </div>
                        <p style="font-size:0.85rem; color:#78909c;">🍽️ Porcje: ${r.portions || 1} • Kliknij, aby zobaczyć przepis ✨</p>
                    </div>
                `;
            });
        }

        function openRecipeModal(id) {
            const recipe = recipes.find(r => r.id === id);
            if (!recipe) return;

            document.getElementById('modalTitle').innerText = recipe.title;
            document.getElementById('modalMeta').innerText = `🔥 ~${recipe.kcal} kcal | 🍽️ Porcje: ${recipe.portions || 1}`;

            const ingList = document.getElementById('modalIngredients');
            ingList.innerHTML = '';
            
            const ingredientsArray = Array.isArray(recipe.ingredients) 
                ? recipe.ingredients 
                : recipe.ingredients.split('\n').filter(i => i.trim() !== '');

            ingredientsArray.forEach(ing => {
                ingList.innerHTML += `<li>${ing}</li>`;
            });

            document.getElementById('modalSteps').innerText = recipe.steps || recipe.desc || 'Brak opisu przygotowania.';

            document.getElementById('recipeModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('recipeModal').classList.remove('active');
        }

        function closeModalOnOverlay(e) {
            if (e.target.id === 'recipeModal') closeModal();
        }

        function setCategory(cat, el) {
            activeCategory = cat;
            document.querySelectorAll('.filter-tags .tag').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            renderRecipes();
        }

        function filterRecipes() { renderRecipes(); }

        function addNewRecipe() {
            const title = document.getElementById('recipeTitle').value;
            const kcal = document.getElementById('recipeKcal').value;
            const portions = document.getElementById('recipePortions').value || 1;
            const cat = document.getElementById('recipeCategory').value;
            const ingredientsRaw = document.getElementById('recipeIngredients').value;
            const steps = document.getElementById('recipeSteps').value;

            if (title && kcal && steps) {
                const ingredients = ingredientsRaw.includes(',') 
                    ? ingredientsRaw.split(',').map(i => i.trim()) 
                    : ingredientsRaw.split('\n').filter(i => i.trim() !== '');

                recipes.unshift({ 
                    id: Date.now(), 
                    title, 
                    kcal, 
                    portions,
                    cat, 
                    ingredients: ingredients.length ? ingredients : [ingredientsRaw], 
                    steps 
                });

                localStorage.setItem('userRecipes', JSON.stringify(recipes));
                renderRecipes();

                document.getElementById('recipeTitle').value = '';
                document.getElementById('recipeKcal').value = '';
                document.getElementById('recipePortions').value = '';
                document.getElementById('recipeIngredients').value = '';
                document.getElementById('recipeSteps').value = '';
            }
        }
        renderRecipes();

        // 6. STOPER HIIT
        const exercises = [
            "1. Step Jacks", "2. Przysiady z wyprostem rąk", "3. Mountain Climbers w staniu", 
            "4. Zakroki w miejscu", "5. Wznosy bioder na pośladki", "6. Spięcia brzucha", 
            "7. Pompki przy ścianie/w klęku", "8. Boczne wykroki", "9. Plank w oparciu", "10. Klęk podparty z wyciąganiem rąk"
        ];
        
        let currentExIdx = 0;
        let isWork = true;
        let timeLeft = 45;
        let timerInterval = null;

        function startHIIT() {
            if (timerInterval) return;
            currentExIdx = 0;
            isWork = true;
            timeLeft = 45;
            updateTimerUI();

            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft < 0) {
                    if (isWork) {
                        isWork = false;
                        timeLeft = 15;
                    } else {
                        isWork = true;
                        currentExIdx++;
                        if (currentExIdx >= exercises.length) {
                            clearInterval(timerInterval);
                            timerInterval = null;
                            document.getElementById('timerPhase').innerText = "BRAWO! TRENING ZROBIONY! 🩵";
                            document.getElementById('timerTime').innerText = "10:00";
                            document.getElementById('currentExercise').innerText = "Koniec na dziś 🏆";
                            return;
                        }
                        timeLeft = 45;
                    }
                }
                updateTimerUI();
            }, 1000);
        }

        function resetHIIT() {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('timerPhase').innerText = "GOTOWA? 🩵";
            document.getElementById('timerTime').innerText = "00:45";
            document.getElementById('currentExercise').innerText = "Ćwiczenie 1: Step Jacks";
        }

        function updateTimerUI() {
            document.getElementById('timerPhase').innerText = isWork ? "ĆWICZ! 🔥" : "PRZERWA ☕";
            document.getElementById('timerTime').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
            document.getElementById('currentExercise').innerText = isWork ? exercises[currentExIdx] : "Odpocznij i napij się wody";
        }

        // 7. PEŁNY STOPER TRENINGOWY
        let fullInterval = null;
        let workDuration = 30;
        let restDuration = 60;
        let fullTimeLeft = 30;
        let isFullWorkPhase = true;

        function setFullWork(sec, btn) {
            workDuration = sec;
            document.querySelectorAll('.full-work-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (!fullInterval && isFullWorkPhase) {
                fullTimeLeft = workDuration;
                updateFullUI();
            }
        }

        function setFullRest(sec, btn) {
            restDuration = sec;
            document.querySelectorAll('.full-rest-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function startFullTimer() {
            if (fullInterval) clearInterval(fullInterval);
            isFullWorkPhase = true;
            fullTimeLeft = workDuration;
            updateFullUI();

            fullInterval = setInterval(() => {
                fullTimeLeft--;
                if (fullTimeLeft < 0) {
                    if (isFullWorkPhase) {
                        isFullWorkPhase = false;
                        fullTimeLeft = restDuration;
                    } else {
                        clearInterval(fullInterval);
                        fullInterval = null;
                        document.getElementById('fullPhase').innerText = "SERIA SKOŃCZONA! 🩵";
                        document.getElementById('fullTime').innerText = "00:00";
                        return;
                    }
                }
                updateFullUI();
            }, 1000);
        }

        function resetFullTimer() {
            if (fullInterval) clearInterval(fullInterval);
            fullInterval = null;
            isFullWorkPhase = true;
            fullTimeLeft = workDuration;
            document.getElementById('fullPhase').innerText = "READY FOR THE SET? 🩵";
            updateFullUI();
        }

        function updateFullUI() {
            const mins = Math.floor(fullTimeLeft / 60);
            const secs = fullTimeLeft % 60;
            document.getElementById('fullPhase').innerText = isFullWorkPhase ? "ĆWICZ SERIĘ! 💪" : "ODPOCZYNEK ☕";
            document.getElementById('fullTime').innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    </script>
</body>
</html>

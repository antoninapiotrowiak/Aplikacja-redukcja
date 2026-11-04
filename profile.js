(function () {
    const recordsKey = 'weightRecords';
    const targetKey = 'weightTarget';
    const weightForm = document.getElementById('weightForm');
    const weightInput = document.getElementById('weightInput');
    const targetInput = document.getElementById('weightTargetInput');
    const message = document.getElementById('weightMessage');
    const fastingKey = 'fastingSession';
    const fastingAction = document.getElementById('fastingAction');
    const fastingProtocol = document.getElementById('fastingProtocol');
    const trendMessage = document.getElementById('weightTrendMessage');
    const calorieSuggestionButton = document.getElementById('acceptCalorieSuggestion');

    function getFastingSession() {
        const saved = localStorage.getItem(fastingKey);
        if (!saved) return null;
        const session = JSON.parse(saved);
        if (!session || !Number.isFinite(session.startedAt) ||
            ![12, 14, 16, 20].includes(Number(session.durationHours))) {
            console.error('Zapisany timer postu ma nieprawidłowy format.');
            return null;
        }
        return session;
    }

    function renderFasting() {
        const session = getFastingSession();
        const timer = document.getElementById('fastingTimer');
        const status = document.getElementById('fastingStatus');
        const description = document.getElementById('fastingDescription');
        timer.hidden = !session;
        fastingProtocol.disabled = Boolean(session);
        fastingAction.textContent = session ? 'Zakończ post' : 'Rozpocznij post';

        if (!session) {
            status.textContent = 'Gotowy';
            status.classList.remove('is-running', 'is-complete');
            description.textContent = 'Wybierz schemat i uruchom timer, kiedy zaczynasz post.';
            return;
        }

        const elapsedMs = Math.max(0, Date.now() - session.startedAt);
        const targetMs = session.durationHours * 60 * 60 * 1000;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsedSeconds % 60).padStart(2, '0');
        const percent = Math.min(100, Math.round(elapsedMs / targetMs * 100));
        const endAt = new Date(session.startedAt + targetMs);
        const endTime = FitnessApp.formatDate(endAt, { hour: '2-digit', minute: '2-digit' });
        const complete = elapsedMs >= targetMs;

        document.getElementById('fastingElapsed').textContent = `${hours}:${minutes}:${seconds}`;
        document.getElementById('fastingSchedule').textContent = `${session.durationHours}:${24 - session.durationHours} · cel o ${endTime}`;
        document.getElementById('fastingProgress').style.width = `${percent}%`;
        document.querySelector('[aria-label="Postęp postu"]').setAttribute('aria-valuenow', String(percent));
        status.textContent = complete ? 'Cel minął' : 'W trakcie';
        status.classList.toggle('is-running', !complete);
        status.classList.toggle('is-complete', complete);
        description.textContent = complete
            ? 'Minął wybrany czas. Zakończ timer, kiedy skończysz post.'
            : 'Timer liczy czas od rozpoczęcia. Możesz go zakończyć w dowolnym momencie.';
    }

    fastingAction.addEventListener('click', () => {
        const session = getFastingSession();
        if (session) {
            localStorage.removeItem(fastingKey);
        } else {
            localStorage.setItem(fastingKey, JSON.stringify({
                startedAt: Date.now(),
                durationHours: Number(fastingProtocol.value)
            }));
        }
        renderFasting();
    });

    function getRecords() {
        const saved = localStorage.getItem(recordsKey);
        if (!saved) return [];
        let records;
        try {
            records = JSON.parse(saved);
        } catch (error) {
            console.error('Nie można odczytać historii pomiarów wagi.', error);
            return [];
        }
        if (!Array.isArray(records)) {
            console.error('Historia pomiarów wagi nie jest listą.');
            return [];
        }
        return records.filter((record) => record && typeof record.date === 'string' &&
            Number.isFinite(Number(record.weight)) && Number(record.weight) >= 1 && Number(record.weight) <= 500);
    }

    function getDateNumber(date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
        const dateNumber = Date.parse(`${date}T00:00:00Z`);
        return Number.isFinite(dateNumber) && new Date(dateNumber).toISOString().slice(0, 10) === date
            ? Math.floor(dateNumber / 86400000)
            : null;
    }

    function renderWeightTrend(records) {
        calorieSuggestionButton.hidden = true;
        const today = getDateNumber(FitnessApp.dateKey(new Date()));
        const recentByDate = new Map();
        records.forEach((record) => {
            const day = getDateNumber(record.date);
            if (day !== null && day >= today - 28 && day <= today) recentByDate.set(day, Number(record.weight));
        });
        const recent = [...recentByDate.entries()].sort((first, second) => first[0] - second[0]);
        const accepted = localStorage.getItem('acceptedCalorieTrendSignature');

        if (recent.length < 4 || recent[recent.length - 1][0] - recent[0][0] < 21 ||
            today - recent[recent.length - 1][0] > 7) {
            trendMessage.textContent = 'Dodaj co najmniej 4 pomiary w ciągu 21 dni, w tym jeden z ostatniego tygodnia. Analiza pominie krótkoterminowe wahania.';
            return;
        }

        const firstDay = recent[0][0];
        const points = recent.map(([day, weight]) => ({ day: day - firstDay, weight }));
        const meanDay = points.reduce((sum, point) => sum + point.day, 0) / points.length;
        const meanWeight = points.reduce((sum, point) => sum + point.weight, 0) / points.length;
        const numerator = points.reduce((sum, point) => sum + (point.day - meanDay) * (point.weight - meanWeight), 0);
        const denominator = points.reduce((sum, point) => sum + (point.day - meanDay) ** 2, 0);
        const weeklyChange = denominator ? numerator / denominator * 7 : 0;
        const latestWeight = recent[recent.length - 1][1];
        const weeklyLossPercent = -weeklyChange / latestWeight * 100;
        const signature = recent.map(([day, weight]) => `${day}:${weight}`).join('|');

        if (weeklyLossPercent >= 0.75) {
            trendMessage.textContent = `Trend wskazuje szybki spadek masy (około ${weeklyLossPercent.toFixed(1)}% tygodniowo). Rozważ zmniejszenie deficytu — możesz podnieść dzienny cel o 100 kcal.`;
            if (accepted === signature) {
                trendMessage.textContent += ' Cel został już podniesiony na podstawie tych pomiarów.';
                return;
            }
            calorieSuggestionButton.textContent = 'Zwiększ cel o 100 kcal';
            calorieSuggestionButton.hidden = false;
            calorieSuggestionButton.onclick = () => {
                const currentGoal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
                if (currentGoal + 100 > 10000) {
                    trendMessage.textContent = 'Nie można zwiększyć celu — osiągnąłby maksymalną dozwoloną wartość.';
                    calorieSuggestionButton.hidden = true;
                    return;
                }
                localStorage.setItem('userCalorieGoal', String(currentGoal + 100));
                localStorage.setItem('acceptedCalorieTrendSignature', signature);
                renderProfile();
            };
        } else if (weeklyLossPercent <= -0.15) {
            trendMessage.textContent = `Trend wskazuje wzrost masy (około ${Math.abs(weeklyLossPercent).toFixed(1)}% tygodniowo). Nie obniżamy celu automatycznie — sprawdź regularność pomiarów i kompletność wpisów.`;
        } else if (weeklyLossPercent < 0.15) {
            trendMessage.textContent = `Trend nie pokazuje wyraźnego spadku masy (około ${weeklyLossPercent.toFixed(1)}% tygodniowo). Nie obniżamy celu automatycznie — sprawdź regularność pomiarów i kompletność wpisów.`;
        } else {
            trendMessage.textContent = `Trend wynosi około ${weeklyLossPercent.toFixed(1)}% masy tygodniowo. Na podstawie tych pomiarów nie ma potrzeby zmieniać celu.`;
        }
    }

    function renderDailyWidgets() {
        const calories = FitnessApp.getTodayCalories();
        const calorieGoal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const caloriePercent = Math.min(100, Math.round(calories / calorieGoal * 100));
        document.getElementById('widgetCalories').textContent = String(calories);
        document.getElementById('widgetCalorieGoal').textContent = String(calorieGoal);
        document.getElementById('widgetCalorieProgress').style.width = `${caloriePercent}%`;
        document.querySelector('[aria-label="Kalorie zjedzone względem celu"]').setAttribute('aria-valuenow', String(caloriePercent));

        const dayKey = FitnessApp.dateKey(new Date());
        const savedWater = localStorage.getItem(`water_${dayKey}`);
        let entries = [];
        if (savedWater) {
            try {
                const parsed = JSON.parse(savedWater);
                if (Array.isArray(parsed)) {
                    entries = parsed.filter((entry) => entry && Number.isFinite(Number(entry.amount)) && Number(entry.amount) > 0);
                } else {
                    console.error(`Dane wody dla ${dayKey} nie są listą.`);
                }
            } catch (error) {
                console.error(`Nie można odczytać danych wody dla ${dayKey}.`, error);
            }
        }
        const water = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
        const waterGoal = Number(localStorage.getItem('waterGoal')) || 2000;
        const waterPercent = Math.min(100, Math.round(water / waterGoal * 100));
        document.getElementById('widgetWater').textContent = String(water);
        document.getElementById('widgetWaterGoal').textContent = String(waterGoal);
        document.getElementById('widgetWaterProgress').style.width = `${waterPercent}%`;
        document.querySelector('[aria-label="Woda wypita względem celu"]').setAttribute('aria-valuenow', String(waterPercent));
    }

    function renderProfile() {
        const records = getRecords().sort((first, second) => first.date.localeCompare(second.date));
        const currentWeight = records.at(-1)?.weight;
        const startWeight = records[0]?.weight;
        const targetWeight = Number(localStorage.getItem(targetKey)) || null;
        const goal = Number(localStorage.getItem('userCalorieGoal')) || 2000;
        const currentCalories = FitnessApp.getTodayCalories();

        document.getElementById('profileCalories').textContent = `${currentCalories} kcal`;
        document.getElementById('profileCalorieGoal').textContent = `${goal} kcal`;
        renderDailyWidgets();
        document.getElementById('startingWeight').textContent = startWeight ? `${startWeight} kg` : '—';
        document.getElementById('currentWeight').textContent = currentWeight ? `${currentWeight} kg` : '—';
        document.getElementById('targetWeight').textContent = targetWeight ? `${targetWeight} kg` : '—';
        if (targetWeight) targetInput.value = String(targetWeight);

        const weightRange = targetWeight && startWeight ? targetWeight - startWeight : 0;
        const progress = currentWeight && weightRange
            ? Math.max(0, Math.min(100, ((currentWeight - startWeight) / weightRange) * 100))
            : 0;
        const progressFill = document.getElementById('weightProgress');
        progressFill.style.width = `${progress}%`;
        progressFill.parentElement.setAttribute('aria-valuenow', String(Math.round(progress)));

        const history = document.getElementById('weightHistory');
        history.replaceChildren();
        records.slice().reverse().slice(0, 5).forEach((record) => {
            const row = document.createElement('div');
            row.className = 'meal-entry';
            const date = document.createElement('span');
            date.className = 'muted';
            date.textContent = FitnessApp.formatDate(new Date(`${record.date}T12:00:00`), {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const weight = document.createElement('strong');
            weight.textContent = `${record.weight} kg`;
            row.append(date, weight);
            history.append(row);
        });
        renderWeightTrend(records);
    }

    weightForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const weight = Number(weightInput.value);
        const target = Number(targetInput.value);
        const records = getRecords();

        if (weightInput.value && (!Number.isFinite(weight) || weight < 1 || weight > 500)) {
            message.textContent = 'Wpisz prawidłową wagę w zakresie 1–500 kg.';
            weightInput.focus();
            return;
        }
        if (targetInput.value && (!Number.isFinite(target) || target < 1 || target > 500)) {
            message.textContent = 'Wpisz prawidłowy cel w zakresie 1–500 kg.';
            targetInput.focus();
            return;
        }
        if (!weightInput.value && !targetInput.value) {
            message.textContent = 'Wpisz wagę lub ustaw cel.';
            return;
        }

        if (weightInput.value) {
            records.push({ date: FitnessApp.dateKey(new Date()), weight });
            localStorage.setItem(recordsKey, JSON.stringify(records));
            weightInput.value = '';
        }
        if (targetInput.value) localStorage.setItem(targetKey, String(target));
        message.textContent = 'Zapisano postępy.';
        renderProfile();
    });

    document.querySelectorAll('[data-home-water-add]').forEach((button) => {
        button.addEventListener('click', () => {
            const dayKey = FitnessApp.dateKey(new Date());
            const key = `water_${dayKey}`;
            const saved = localStorage.getItem(key);
            let entries = [];
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) entries = parsed;
                    else console.error(`Dane wody dla ${dayKey} nie są listą.`);
                } catch (error) {
                    console.error(`Nie można odczytać danych wody dla ${dayKey}.`, error);
                    window.alert('Nie udało się odczytać wcześniejszych wpisów wody. Nie dodano nowego wpisu.');
                    return;
                }
            }
            entries.push({ amount: Number(button.dataset.homeWaterAdd), added: Date.now() });
            localStorage.setItem(key, JSON.stringify(entries));
            renderDailyWidgets();
        });
    });

    renderProfile();
    renderFasting();
    window.setInterval(renderFasting, 1000);
})();

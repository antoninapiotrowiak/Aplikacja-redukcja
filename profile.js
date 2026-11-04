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
        document.getElementById('fastingSchedule').textContent = `${session.durationHours}: ${24 - session.durationHours} · cel o ${endTime}`;
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
        const records = JSON.parse(localStorage.getItem(recordsKey) || '[]');
        return Array.isArray(records) ? records : [];
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

    renderProfile();
    renderFasting();
    window.setInterval(renderFasting, 1000);
})();

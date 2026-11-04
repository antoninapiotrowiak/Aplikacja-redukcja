(function () {
    const storageKey = 'habitProgram';
    const today = FitnessApp.dateKey(new Date());
    const saved = localStorage.getItem(storageKey);
    let program = saved ? JSON.parse(saved) : null;
    if (!program || typeof program.name !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(program.startDate) ||
        !Array.isArray(program.completed)) {
        program = { name: 'Wypiję szklankę wody po przebudzeniu', startDate: today, completed: [] };
        saveProgram();
    }

    const nameInput = document.getElementById('habitName');
    const dateForDay = (offset) => {
        const date = new Date(`${program.startDate}T12:00:00`);
        date.setDate(date.getDate() + offset);
        return date;
    };

    function saveProgram() {
        localStorage.setItem(storageKey, JSON.stringify(program));
    }

    function render() {
        nameInput.value = program.name;
        const start = new Date(`${program.startDate}T12:00:00`);
        const last = dateForDay(13);
        const dateRange = `${FitnessApp.formatDate(start, { day: 'numeric', month: 'long' })} – ${FitnessApp.formatDate(last, { day: 'numeric', month: 'long', year: 'numeric' })}`;
        document.getElementById('habitDateRange').textContent = `Program: ${dateRange}`;

        const calendar = document.getElementById('habitCalendar');
        calendar.replaceChildren();
        let completedCount = 0;
        const todayIndex = Math.floor((new Date(`${today}T12:00:00`) - start) / 86400000);
        for (let index = 0; index < 14; index += 1) {
            const date = dateForDay(index);
            const dateKey = FitnessApp.dateKey(date);
            const isCompleted = program.completed.includes(dateKey);
            if (isCompleted) completedCount += 1;
            const item = document.createElement('label');
            item.className = `habit-day${isCompleted ? ' is-completed' : ''}${dateKey === today ? ' is-today' : ''}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCompleted;
            checkbox.disabled = index > todayIndex;
            checkbox.setAttribute('aria-label', `${index + 1}. dzień programu, ${FitnessApp.formatDate(date, { day: 'numeric', month: 'long' })}`);
            const dayNumber = document.createElement('strong');
            dayNumber.textContent = String(index + 1);
            const dayDate = document.createElement('span');
            dayDate.textContent = FitnessApp.formatDate(date, { day: 'numeric', month: 'short' });
            item.append(checkbox, dayNumber, dayDate);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked && !program.completed.includes(dateKey)) program.completed.push(dateKey);
                if (!checkbox.checked) program.completed = program.completed.filter((key) => key !== dateKey);
                saveProgram();
                render();
            });
            calendar.append(item);
        }

        const percent = Math.round(completedCount / 14 * 100);
        document.getElementById('habitProgressText').textContent = `${completedCount} z 14 dni`;
        document.getElementById('habitPercent').textContent = `${percent}%`;
        document.getElementById('habitProgress').style.width = `${percent}%`;
        document.querySelector('[aria-label="Postęp programu nawyku"]').setAttribute('aria-valuenow', String(completedCount));
        const message = document.getElementById('habitMessage');
        if (todayIndex < 0) message.textContent = 'Program jeszcze się nie rozpoczął.';
        else if (todayIndex >= 14) message.textContent = 'Program zakończony — możesz rozpocząć kolejny.';
        else if (program.completed.includes(today)) message.textContent = 'Dzisiejszy nawyk zaliczony. Dobra robota!';
        else message.textContent = 'Zaznacz dzisiejszy dzień, gdy wykonasz swój nawyk.';
    }

    document.getElementById('habitForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }
        program.name = name;
        saveProgram();
        render();
    });

    document.getElementById('restartHabit').addEventListener('click', () => {
        if (!window.confirm('Rozpocząć 14-dniowy program od dzisiaj? Dotychczasowy postęp zostanie wyczyszczony.')) return;
        program = { name: program.name, startDate: today, completed: [] };
        saveProgram();
        render();
    });

    render();
})();

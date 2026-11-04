(function () {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    window.toggleDarkMode = function () {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(
            'darkMode',
            document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
        );
    };

    window.FitnessApp = {
        dateKey(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        getMeals(dateKey) {
            const saved = localStorage.getItem(`meals_${dateKey}`);
            if (!saved) return [];

            const meals = JSON.parse(saved);
            return Array.isArray(meals) ? meals : [];
        },
        formatDate(date, options) {
            return new Intl.DateTimeFormat('pl-PL', options).format(date);
        },
        getTodayCalories() {
            const today = this.dateKey(new Date());
            return this.getMeals(today).reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0);
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.error('Nie udało się zarejestrować Service Workera:', error);
        });
    }
})();

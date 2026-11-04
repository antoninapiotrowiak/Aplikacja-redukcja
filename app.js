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

    function formatNumber(value) {
        return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 }).format(value);
    }

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
            if (!Array.isArray(meals)) {
                console.error(`Dane posiłków dla ${dateKey} nie są listą.`);
                return [];
            }

            return meals.filter((meal) => meal && typeof meal.name === 'string');
        },
        summarizeMeals(meals) {
            const summary = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                trackedProtein: 0,
                trackedCarbs: 0,
                trackedFat: 0,
                incompleteMeals: 0
            };

            meals.forEach((meal) => {
                summary.calories += Number(meal.kcal) || 0;
                let hasAllMacros = true;
                ['protein', 'carbs', 'fat'].forEach((nutrient) => {
                    const value = meal[nutrient];
                    if (value === null || value === undefined || value === '') {
                        hasAllMacros = false;
                        return;
                    }
                    const amount = Number(value);
                    if (!Number.isFinite(amount) || amount < 0) {
                        hasAllMacros = false;
                        return;
                    }
                    summary[nutrient] += amount;
                    summary[`tracked${nutrient[0].toUpperCase()}${nutrient.slice(1)}`] += 1;
                });
                if (!hasAllMacros) summary.incompleteMeals += 1;
            });

            return summary;
        },
        formatNumber,
        formatDate(date, options) {
            return new Intl.DateTimeFormat('pl-PL', options).format(date);
        },
        getTodayCalories() {
            const today = this.dateKey(new Date());
            return this.summarizeMeals(this.getMeals(today)).calories;
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.error('Nie udało się zarejestrować Service Workera:', error);
        });
    }
})();

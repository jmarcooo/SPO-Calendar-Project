export function init(container) {
    // Add active state to nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary-50', 'dark:bg-primary-500/20', 'text-primary-600', 'dark:text-primary-400');
        el.classList.add('text-gray-600', 'dark:text-slate-400');
        const icon = el.querySelector('.nav-icon');
        if (icon) {
            icon.classList.remove('text-primary-600', 'dark:text-primary-400');
            icon.classList.add('text-gray-400', 'dark:text-slate-500');
        }
    });

    const activeNav = document.getElementById('nav-new_games');
    if (activeNav) {
        activeNav.classList.remove('text-gray-600', 'dark:text-slate-400', 'hover:bg-slate-50', 'dark:hover:bg-slate-900');
        activeNav.classList.add('bg-primary-50', 'dark:bg-primary-500/20', 'text-primary-600', 'dark:text-primary-400');
        const activeIcon = activeNav.querySelector('.nav-icon');
        if (activeIcon) {
            activeIcon.classList.remove('text-gray-400', 'dark:text-slate-500', 'group-hover:text-gray-500', 'dark:text-slate-400');
            activeIcon.classList.add('text-primary-600', 'dark:text-primary-400');
        }
    }

    if (window.renderGameCards) {
        window.renderGameCards();
    }

    return () => {
        // Cleanup if needed
    };
}

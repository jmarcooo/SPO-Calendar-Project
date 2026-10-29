export function init(container) {
    // Add active state to nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-primary-50', 'text-primary-600');
        el.classList.add('text-gray-600');
        const icon = el.querySelector('.nav-icon');
        if (icon) {
            icon.classList.remove('text-primary-600');
            icon.classList.add('text-gray-400');
        }
    });

    const activeNav = document.getElementById('nav-new_games');
    if (activeNav) {
        activeNav.classList.remove('text-gray-600', 'hover:bg-slate-50');
        activeNav.classList.add('bg-primary-50', 'text-primary-600');
        const activeIcon = activeNav.querySelector('.nav-icon');
        if (activeIcon) {
            activeIcon.classList.remove('text-gray-400', 'group-hover:text-gray-500');
            activeIcon.classList.add('text-primary-600');
        }
    }

    if (window.renderGameCards) {
        window.renderGameCards();
    }

    return () => {
        // Cleanup if needed
    };
}

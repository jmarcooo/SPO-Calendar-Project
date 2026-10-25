
window.updateGameDropdown = () => {
    const select = document.getElementById('game-game-selector');
    if (!select) return;

    const currVal = select.value;
    let options = '<option value="">-- Select a Game --</option>';

    const gamesOnly = window.events.filter(e => {
        const iType = e.itemType || (e.isEventOnly ? 'event' : 'task');
        return iType === 'game';
    });
    gamesOnly.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first

    gamesOnly.forEach(e => {
        options += `<option value="${e.id}">[${e.campaignType || 'All'}] ${e.title}</option>`;
    });

    select.innerHTML = options;

    if(currVal && gamesOnly.find(e => e.id === currVal)) {
        select.value = currVal;
    } else {
        const contentArea = document.getElementById('game-content-area');
        if (contentArea) {
            contentArea.classList.add('hidden');
            contentArea.classList.remove('grid');
            document.getElementById('game-empty-state').style.display = 'block';
        }
    }
};

export function init(container) {
    if (window.updateGameDropdown) window.updateGameDropdown();

    // Add active state to nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-indigo-50', 'text-indigo-600');
        el.classList.add('text-gray-600');
        const icon = el.querySelector('.nav-icon');
        if (icon) {
            icon.classList.remove('text-indigo-600');
            icon.classList.add('text-gray-400');
        }
    });

    const activeNav = document.getElementById('nav-new_games');
    if (activeNav) {
        activeNav.classList.remove('text-gray-600', 'hover:bg-slate-50');
        activeNav.classList.add('bg-indigo-50', 'text-indigo-600');
        const activeIcon = activeNav.querySelector('.nav-icon');
        if (activeIcon) {
            activeIcon.classList.remove('text-gray-400', 'group-hover:text-gray-500');
            activeIcon.classList.add('text-indigo-600');
        }
    }

    return () => {
        // Cleanup if needed
    };
}

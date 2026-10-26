import { sortTableData } from "../utils/tableSort.js";

window.renderAdminPOCSettings = () => {
            const container = document.getElementById('poc-settings-container');
            if (!container) return;

            let savedPOCs = {};
            try {
                savedPOCs = JSON.parse(localStorage.getItem('spo_admin_pocs')) || {};
            } catch (e) {
                console.error('Error loading POCs', e);
            }

            let html = '';
            window.POC_MODULES.forEach(module => {
                const currentPOCs = savedPOCs[module.id] || [];

                html += `
                    <div class="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl">
                        <h4 class="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3">${module.name} (Max 3)</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                `;

                window.AVAILABLE_USERS.forEach(user => {
                    const isChecked = currentPOCs.includes(user) ? 'checked' : '';
                    html += `
                        <label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                            <input type="checkbox" name="poc_${module.id}" value="${user}" class="poc-checkbox rounded text-primary-600 focus:ring-primary-500" ${isChecked} onchange="window.handlePOCSelection(this, '${module.id}')">
                            <span>${user}</span>
                        </label>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        };



window.setThemeColor = (color) => {
    document.documentElement.setAttribute('data-theme', color);
    localStorage.setItem('spo_theme_color', color);
    window.updateThemeButtons(color);
};

window.updateThemeButtons = (activeColor) => {
    const btns = document.querySelectorAll('.theme-btn');
    btns.forEach(btn => {
        if (btn.dataset.color === activeColor) {
            btn.classList.remove('ring-transparent', 'hover:scale-110');
            btn.classList.add(`ring-${activeColor}-500`);
        } else {
            btn.classList.add('ring-transparent', 'hover:scale-110');
            btn.classList.remove(`ring-${btn.dataset.color}-500`);
        }
    });
};

window.toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('spo_dark_mode', isDark);

    // Update the toggle switch UI manually if needed, but Tailwind classes should handle it via peer/checked usually.
    // We are using a custom dot animation which relies on the dark class on HTML.
};

export function init(container) {
    const savedColor = localStorage.getItem('spo_theme_color') || 'indigo';
    window.updateThemeButtons(savedColor);

    const isDark = localStorage.getItem('spo_dark_mode') === 'true';
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) darkToggle.checked = isDark;


    const adminSettings = document.getElementById('admin-settings-section');
    if (adminSettings && window.isAdminModeEnabled) {
        adminSettings.style.display = 'block';
        if (window.renderAdminPOCSettings) window.renderAdminPOCSettings();
    }

    return function cleanup() {};
}

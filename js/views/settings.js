import { sortTableData } from "../utils/tableSort.js";

window.toggleDarkModeSetting = (isDark) => {
    localStorage.setItem('spo_dark_mode', isDark);
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

window.changeThemeColor = (themeName) => {
    localStorage.setItem('spo_theme_color', themeName);

    // Update active state in UI
    const buttons = document.querySelectorAll('.theme-color-btn');
    buttons.forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('ring-2', 'ring-offset-2', 'ring-gray-400');
        } else {
            btn.classList.remove('ring-2', 'ring-offset-2', 'ring-gray-400');
        }
    });

    // Update dynamic vars
    if (window.THEMES && window.THEMES[themeName]) {
        const colors = window.THEMES[themeName];
        let cssVars = ':root {\n';
        for (const [shade, hex] of Object.entries(colors)) {
            cssVars += `  --color-primary-${shade}: ${hex};\n`;
        }
        cssVars += '}\n';

        let styleEl = document.getElementById('dynamic-theme-vars');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-theme-vars';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = cssVars;
    }
};

window.renderThemeSettings = () => {
    const isDark = localStorage.getItem('spo_dark_mode') === 'true';
    const darkToggle = document.getElementById('settings-dark-mode');
    if (darkToggle) darkToggle.checked = isDark;

    const container = document.getElementById('settings-theme-colors');
    if (!container || !window.THEMES) return;

    const savedTheme = localStorage.getItem('spo_theme_color') || 'indigo';
    let html = '';

    for (const [themeName, colors] of Object.entries(window.THEMES)) {
        const isActive = themeName === savedTheme;
        const ringClasses = isActive ? 'ring-2 ring-offset-2 ring-gray-400' : '';
        // Use the 500 shade for the swatch
        const colorHex = colors['500'];
        html += `
            <button type="button"
                onclick="window.changeThemeColor('${themeName}')"
                data-theme="${themeName}"
                class="theme-color-btn w-8 h-8 rounded-full focus:outline-none transition-all ${ringClasses}"
                style="background-color: ${colorHex};"
                title="${themeName.charAt(0).toUpperCase() + themeName.slice(1)}">
            </button>
        `;
    }
    container.innerHTML = html;
};

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
                    <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <h4 class="text-sm font-semibold text-gray-800 mb-3">${module.name} (Max 3)</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                `;

                window.AVAILABLE_USERS.forEach(user => {
                    const isChecked = currentPOCs.includes(user) ? 'checked' : '';
                    html += `
                        <label class="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
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


export function init(container) {
    if (window.renderThemeSettings) window.renderThemeSettings();


    const adminSettings = document.getElementById('admin-settings-section');
    if (adminSettings && window.isAdminModeEnabled) {
        adminSettings.style.display = 'block';
        if (window.renderAdminPOCSettings) window.renderAdminPOCSettings();
    }

    return function cleanup() {};
}

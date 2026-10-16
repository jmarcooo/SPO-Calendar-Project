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
                    <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <h4 class="text-sm font-semibold text-gray-800 mb-3">${module.name} (Max 3)</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                `;

                window.AVAILABLE_USERS.forEach(user => {
                    const isChecked = currentPOCs.includes(user) ? 'checked' : '';
                    html += `
                        <label class="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" name="poc_${module.id}" value="${user}" class="poc-checkbox rounded text-indigo-600 focus:ring-indigo-500" ${isChecked} onchange="window.handlePOCSelection(this, '${module.id}')">
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
    window.renderAdminPOCSettings();
    return function cleanup() {};
}

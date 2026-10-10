import re

with open('index.html', 'r') as f:
    content = f.read()

poc_js = """
        // POC Setup for Admin Settings
        window.AVAILABLE_USERS = ['Freddy', 'Renee', 'Marco', 'Clarisse', 'Lim', 'Kenneth', 'Regena', 'Nami', 'Liezl', 'Zayn', 'Humphrey'];
        window.POC_MODULES = [
            { id: 'team_budget', name: 'Team Budget' },
            { id: 'daily_task', name: 'Daily Task' },
            { id: 'post_management', name: 'Post Management' },
            { id: 'sms', name: 'SMS' },
            { id: 'copy_writer', name: 'Copy Writer' },
            { id: 'prize_distribution', name: 'Prize Distribution' }
        ];

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

        window.handlePOCSelection = (checkbox, moduleId) => {
            const checkboxes = document.querySelectorAll(`input[name="poc_${moduleId}"]:checked`);
            if (checkboxes.length > 3) {
                alert(`You can only assign up to 3 Points of Contact for ${moduleId.replace('_', ' ')}.`);
                checkbox.checked = false;
            }
        };

        window.saveAdminPOCs = () => {
            const newPOCs = {};
            window.POC_MODULES.forEach(module => {
                const checkboxes = document.querySelectorAll(`input[name="poc_${module.id}"]:checked`);
                newPOCs[module.id] = Array.from(checkboxes).map(cb => cb.value);
            });
            localStorage.setItem('spo_admin_pocs', JSON.stringify(newPOCs));
            alert('Points of Contact saved successfully.');
        };
"""

# Insert the POC JS right before the end of window.initApp or similar place
# We will insert it just before window.switchView inside the main script tag.

if 'window.POC_MODULES = [' not in content:
    content = content.replace("window.switchView = (viewName) => {", poc_js + "\n        window.switchView = (viewName) => {")
    with open('index.html', 'w') as f:
        f.write(content)
    print("Injected POC logic into index.html")
else:
    print("POC logic already injected")

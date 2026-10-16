import { sortTableData } from "../utils/tableSort.js";

window.updateCampaignDropdown = () => {
            const select = document.getElementById('campaign-task-selector');
            if (!select) return;

            const currVal = select.value;
            let options = '<option value="">-- Select a Task --</option>';

            const tasksOnly = window.events.filter(e => {
                const iType = e.itemType || (e.isEventOnly ? 'event' : 'task');
                return iType === 'task';
            });
            tasksOnly.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first

            tasksOnly.forEach(e => {
                options += `<option value="${e.id}">[${e.campaignType || 'All'}] ${e.title}</option>`;
            });

            select.innerHTML = options;

            if(currVal && tasksOnly.find(e => e.id === currVal)) {
                select.value = currVal;
            } else {
                const contentArea = document.getElementById('campaign-content-area');
                if (contentArea) {
                    contentArea.classList.add('hidden');
                    contentArea.classList.remove('grid');
                    document.getElementById('campaign-empty-state').style.display = 'block';
                }
            }
        };


export function init(container) {
if (window.updateCampaignDropdown) window.updateCampaignDropdown();
    return function cleanup() {};
}

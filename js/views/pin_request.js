import { sortTableData } from "../utils/tableSort.js";

window.switchPRView = (view) => {
            localStorage.setItem('spo_pr_view', view);
            const btnTable = document.getElementById('btn-pr-view-table');
            const btnTimeline = document.getElementById('btn-pr-view-timeline');
            const tableContainer = document.getElementById('pr-table-container');
            const timelineContainer = document.getElementById('pr-timeline-container');

            if (!btnTable || !btnTimeline || !tableContainer || !timelineContainer) return;

            if (view === 'table') {
                btnTable.className = "px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-primary-600 shadow-sm transition-all";
                btnTimeline.className = "px-4 py-1.5 text-sm font-medium rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 transition-all";
                tableContainer.classList.remove('hidden');
                timelineContainer.classList.add('hidden');
                window.renderPinRequestsTable();
            } else {
                btnTimeline.className = "px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-primary-600 shadow-sm transition-all";
                btnTable.className = "px-4 py-1.5 text-sm font-medium rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 transition-all";
                tableContainer.classList.add('hidden');
                timelineContainer.classList.remove('hidden');
                window.renderPRTimeline();
            }
        };


export function init(container) {

    const savedView = localStorage.getItem('spo_pr_view') || 'table';
    if (window.switchPRView) window.switchPRView(savedView);

    return function cleanup() {};
}

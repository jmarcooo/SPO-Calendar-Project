import { sortTableData } from "../utils/tableSort.js";

window.switchPRView = (view) => {
            localStorage.setItem('spo_pr_view', view);
            const btnTable = document.getElementById('btn-pr-view-table');
            const btnTimeline = document.getElementById('btn-pr-view-timeline');
            const tableContainer = document.getElementById('pr-table-container');
            const timelineContainer = document.getElementById('pr-timeline-container');

            if (!btnTable || !btnTimeline || !tableContainer || !timelineContainer) return;

            if (view === 'table') {
                btnTable.className = "px-3.5 py-1.5 text-xs font-semibold font-fun rounded-lg bg-white dark:bg-slate-800 text-peppermint-600 dark:text-peppermint-300 shadow-xs transition-all";
                btnTimeline.className = "px-3.5 py-1.5 text-xs font-semibold font-fun rounded-lg text-stone-500 dark:text-slate-400 hover:text-gingerbread-700 dark:hover:text-white transition-all";
                tableContainer.classList.remove('hidden');
                timelineContainer.classList.add('hidden');
                window.renderPinRequestsTable();
            } else {
                btnTimeline.className = "px-3.5 py-1.5 text-xs font-semibold font-fun rounded-lg bg-white dark:bg-slate-800 text-peppermint-600 dark:text-peppermint-300 shadow-xs transition-all";
                btnTable.className = "px-3.5 py-1.5 text-xs font-semibold font-fun rounded-lg text-stone-500 dark:text-slate-400 hover:text-gingerbread-700 dark:hover:text-white transition-all";
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

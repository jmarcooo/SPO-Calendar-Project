window.renderDailyTasksTable = () => {
            const tbody = document.getElementById('daily-tasks-table-body');
            if (!tbody) return;

            // Build requestor dropdown
            const requestorFilter = document.getElementById('daily-requestor-filter');
            if (requestorFilter) {
                const currentVal = requestorFilter.value;
                let requestors = [...new Set(window.dailyTasks.map(t => t.requestor).filter(r => r))].sort();
                let opts = '<option value="All">All Requestors</option>';
                requestors.forEach(r => opts += `<option value="${r}">${r}</option>`);
                requestorFilter.innerHTML = opts;
                requestorFilter.value = currentVal || 'All';
            }

            let searchVal = document.getElementById('daily-search-input') ? document.getElementById('daily-search-input').value.toLowerCase() : '';
            let reqVal = requestorFilter ? requestorFilter.value : 'All';
            let statusVal = document.getElementById('daily-status-filter') ? document.getElementById('daily-status-filter').value : 'All';

            let filtered = window.dailyTasks.filter(t => {
                if (reqVal !== 'All' && t.requestor !== reqVal) return false;
                if (statusVal !== 'All' && t.status !== statusVal) return false;
                if (searchVal) {
                    const matchTitle = t.taskTitle && t.taskTitle.toLowerCase().includes(searchVal);
                    const matchEvent = t.eventTitle && t.eventTitle.toLowerCase().includes(searchVal);
                    const matchReq = t.requestor && t.requestor.toLowerCase().includes(searchVal);
                    const matchType = t.taskType && t.taskType.toLowerCase().includes(searchVal);
                    return matchTitle || matchEvent || matchReq || matchType;
                }
                return true;
            });

            if (window.dtSortBy) {
                filtered = window.sortTableData(filtered, window.dtSortBy, window.dtSortDesc);
            } else {
                const rank = { 'Ongoing': 1, 'Upcoming': 2, 'Past': 3 };
                filtered.sort((a, b) => {
                    let sA = window.calculateStatus(a.startDate, a.endDate || a.startDate, a.status);
                    let sB = window.calculateStatus(b.startDate, b.endDate || b.startDate, b.status);
                    if (sA === 'Past' && a.status !== 'Completed') sA = 'Ongoing';
                    if (sB === 'Past' && b.status !== 'Completed') sB = 'Ongoing';
                    if (rank[sA] !== rank[sB]) return rank[sA] - rank[sB];
                    return (b.createdTime || '').localeCompare(a.createdTime || '');
                });
            }
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400">No daily tasks found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(task => {
                let rowStatus = window.calculateStatus(task.startDate, task.endDate || task.startDate, null);

                // Only gray out if the date itself is past, ignoring request status override.
                // window.calculateStatus uses Philippine time. We can just use the status returned without status override for opacity.
                let dateStatus = window.calculateStatus(task.startDate, task.endDate || task.startDate, null);
                const isPastDate = dateStatus === 'Past';

                if (rowStatus === 'Past' && task.status !== 'Completed') rowStatus = 'Ongoing';
                const rowOpacityClass = isPastDate ? 'opacity-55 grayscale-[40%] bg-cream-100/60 dark:bg-slate-800/50' : 'hover:bg-cream-100/80 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer';

                let statusClass = 'text-stone-600 bg-cream-200 border border-cream-300';
                if (task.status === 'Completed') statusClass = 'text-evergreen-700 bg-evergreen-100 border border-evergreen-200 dark:bg-evergreen-900/40 dark:text-evergreen-300 dark:border-evergreen-800';
                else if (task.status === 'Under Review') statusClass = 'text-amber-800 bg-amber-100 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
                else if (task.status === 'Pending') statusClass = 'text-peppermint-700 bg-peppermint-50 border border-peppermint-200 dark:bg-peppermint-900/40 dark:text-peppermint-300 dark:border-peppermint-800';

                let statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}">${task.status || 'Pending'}</span>`;

                let typeClass = 'text-gingerbread-700 bg-cream-200 dark:text-slate-200 dark:bg-slate-700';
                if (task.taskType === 'Daily Task') typeClass = 'text-sky-800 bg-sky-100 border border-sky-200 dark:text-sky-200 dark:bg-sky-900/50 dark:border-sky-800';
                else if (task.taskType === 'Time-Limited Task') typeClass = 'text-amber-800 bg-amber-100 border border-amber-200 dark:text-amber-200 dark:bg-amber-900/50 dark:border-amber-800';
                else if (task.taskType === 'Novice Task') typeClass = 'text-evergreen-800 bg-evergreen-100 border border-evergreen-200 dark:text-evergreen-200 dark:bg-evergreen-900/50 dark:border-evergreen-800';
                let taskTypeBadge = task.taskType
                    ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${typeClass}">${task.taskType}</span>`
                    : `<span class="text-xs text-stone-400 dark:text-slate-500">-</span>`;

                let initial = task.requestor ? task.requestor.charAt(0).toUpperCase() : '?';

                const displayStart = task.startDate ? task.startDate.replace('T', ' ') : '';
                const displayEnd = task.endDate ? task.endDate.replace('T', ' ') : '-';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button')) window.openDailyTaskDetails('${task.id}')">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-semibold text-stone-800 dark:text-white truncate max-w-[200px]">${task.taskTitle}</div>
                            <div class="text-xs text-stone-500 dark:text-slate-400 truncate max-w-[200px]">${task.eventTitle}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">${taskTypeBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${task.createdTime}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${displayStart}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${displayEnd}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center space-x-2">
                                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-gingerbread-500 text-white font-fun flex items-center justify-center text-xs font-bold shadow-xs">${initial}</div>
                                <span class="text-sm font-medium text-gingerbread-700 dark:text-white">${task.requestor}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200/80 dark:bg-slate-700 text-gingerbread-700 dark:text-slate-200 border border-cream-300 dark:border-slate-600">${rowStatus}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${(task.status === 'Under Review' && window.isCurrentUserPOC('daily_task')) ? `<button onclick="window.completeDailyTask('${task.id}')" title="Mark as Complete" class="text-evergreen-600 hover:text-evergreen-800 bg-evergreen-50 dark:bg-evergreen-900/30 border border-evergreen-200 dark:border-evergreen-800 px-2 py-1 rounded-lg transition-colors mr-1.5"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="window.openEditDailyTask('${task.id}')" title="Edit" class="text-gingerbread-600 hover:text-gingerbread-700 bg-cream-200/70 dark:bg-slate-700 border border-cream-300 dark:border-slate-600 px-2 py-1 rounded-lg transition-colors mr-1.5"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="window.deleteDailyTask('${task.id}')" title="Delete" class="text-peppermint-600 hover:text-peppermint-800 bg-peppermint-50 dark:bg-peppermint-900/30 border border-peppermint-200/70 dark:border-peppermint-800/50 px-2 py-1 rounded-lg transition-colors"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };


export function init(container) {
if (window.renderDailyTasksTable) window.renderDailyTasksTable();
    return function cleanup() {};
}

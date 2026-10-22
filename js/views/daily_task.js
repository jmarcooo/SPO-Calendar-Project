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
                    return matchTitle || matchEvent || matchReq;
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
                tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">No daily tasks found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(task => {
                let rowStatus = window.calculateStatus(task.startDate, task.endDate || task.startDate, task.status);

                // Only gray out if the date itself is past, ignoring request status override.
                // window.calculateStatus uses Philippine time. We can just use the status returned without status override for opacity.
                let dateStatus = window.calculateStatus(task.startDate, task.endDate || task.startDate, null);
                const isPastDate = dateStatus === 'Past';

                if (rowStatus === 'Past' && task.status !== 'Completed') rowStatus = 'Ongoing';
                const rowOpacityClass = isPastDate ? 'opacity-50 grayscale bg-gray-50' : 'hover:bg-slate-50 transition-colors group cursor-pointer';

                let statusClass = 'text-gray-600 bg-gray-100';
                if (task.status === 'Completed') statusClass = 'text-emerald-600 bg-emerald-100';
                else if (task.status === 'Under Review') statusClass = 'text-amber-600 bg-amber-100';
                else if (task.status === 'Pending') statusClass = 'text-indigo-600 bg-indigo-100';

                let statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${task.status || 'Pending'}</span>`;

                let initial = task.requestor ? task.requestor.charAt(0).toUpperCase() : '?';

                const displayStart = task.startDate ? task.startDate.replace('T', ' ') : '';
                const displayEnd = task.endDate ? task.endDate.replace('T', ' ') : '-';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button')) window.openDailyTaskDetails('${task.id}')">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 truncate max-w-[200px]">${task.taskTitle}</div>
                            <div class="text-xs text-gray-500 truncate max-w-[200px]">${task.eventTitle}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.createdTime}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayStart}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayEnd}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center space-x-2">
                                <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">${initial}</div>
                                <span class="text-sm text-gray-900">${task.requestor}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">${rowStatus}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${(task.status === 'Under Review' && window.isCurrentUserPOC('daily_task')) ? `<button onclick="window.completeDailyTask('${task.id}')" title="Mark as Complete" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md transition-colors mr-2"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="window.openEditDailyTask('${task.id}')" title="Edit" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md transition-colors mr-2"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="window.deleteDailyTask('${task.id}')" title="Delete" class="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md transition-colors"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
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

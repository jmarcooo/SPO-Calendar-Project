import { sortTableData } from "../utils/tableSort.js";

window.renderTasksTable = () => {
            const tasksTable = document.getElementById('tasks-table-body');
            if (!tasksTable) return;

            tasksTable.innerHTML = '';
            if (window.events.length === 0) {
                tasksTable.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No content tasks found. Create one to get started.</td></tr>`;
                return;
            }

            ['title', 'startDate', 'endDate', 'assignees', 'status', 'progress'].forEach(col => {
                const icon = document.getElementById(`sort-icon-${col}`);
                if (icon) {
                    icon.className = 'fa-solid ml-1 transition-colors ' + (window.sortCol === col ? (window.sortAsc ? 'fa-sort-up text-indigo-600' : 'fa-sort-down text-indigo-600') : 'fa-sort text-gray-300 group-hover:text-gray-500');
                }
            });

            let filteredEvents = window.filterEventsByGlobalCategory(window.events).filter(evt => {
                const iType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
                if (iType !== 'task') return false;

                const searchLower = window.searchQuery.toLowerCase();
                const matchesSearch = evt.title.toLowerCase().includes(searchLower) || (evt.assignees || []).join(' ').toLowerCase().includes(searchLower);
                const matchesStatus = window.statusFilter === 'All' || evt.status === window.statusFilter;
                const matchesAssignee = window.assigneeFilter === 'All' || (evt.assignees || []).includes(window.assigneeFilter);
                return matchesSearch && matchesStatus && matchesAssignee;
            });

            filteredEvents.sort((a, b) => {
                const aStart = a.startDate || '';
                const bStart = b.startDate || '';
                const aEnd = a.endDate || '';
                const bEnd = b.endDate || '';

                                if (window.sortCol === 'default') {
                    const getRank = (status) => {
                        if (status === 'Ongoing') return 3;
                        if (status === 'Upcoming') return 2;
                        return 1;
                    };
                    const rankA = getRank(a.status);
                    const rankB = getRank(b.status);
                    if (rankA !== rankB) return rankB - rankA;

                    const timeA = new Date(aStart).getTime() || 0;
                    const timeB = new Date(bStart).getTime() || 0;
                    return timeB - timeA;
                }

                let valA = a[window.sortCol];
                let valB = b[window.sortCol];
                if (window.sortCol === 'assignees') {
                    valA = (a.assignees || []).join(', ');
                    valB = (b.assignees || []).join(', ');
                } else if (window.sortCol === 'progress') {
                    valA = a.progress || 0;
                    valB = b.progress || 0;
                } else if (window.sortCol === 'title' || window.sortCol === 'status') {
                    valA = (valA || '').toLowerCase();
                    valB = (valB || '').toLowerCase();
                } else if (window.sortCol === 'startDate' || window.sortCol === 'endDate' || window.sortCol === 'date') {
                    const dateA = window.sortCol === 'endDate' ? aEnd : aStart;
                    const dateB = window.sortCol === 'endDate' ? bEnd : bStart;
                    valA = new Date(dateA).getTime();
                    valB = new Date(dateB).getTime();
                }

                if (valA < valB) return window.sortAsc ? -1 : 1;
                if (valA > valB) return window.sortAsc ? 1 : -1;
                return 0;
            });

            if (filteredEvents.length === 0) {
                tasksTable.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No tasks match your filters.</td></tr>`;
                return;
            }

            filteredEvents.forEach(evt => {
                const tr = document.createElement('tr');
                tr.id = `task-row-${evt.id}`;

                let baseClass = 'cursor-pointer transition-colors duration-200 group';
                if (evt.status === 'Done') {
                    baseClass += ' opacity-60 bg-gray-50 grayscale hover:bg-gray-100';
                } else {
                    baseClass += ' hover:bg-indigo-50';
                }
                tr.className = baseClass;

                tr.title = window.getPendingSummary(evt);
                tr.onclick = (e) => {
                    if(e.target.closest('button') || e.target.closest('input')) return;
                    window.openTaskDrawer(evt.id);
                };

                tr.onmouseenter = (e) => { window.showTaskTooltip(evt.id, e); };
                tr.onmouseleave = () => { window.hideTaskTooltip(); };
                tr.onmousemove = (e) => { window.moveTaskTooltip(e); };

                const p = evt.progress || 0;
                const pFormatted = p.toFixed(2);
                const pColor = p === 100 ? 'bg-emerald-500' : (p > 0 ? 'bg-indigo-500' : 'bg-gray-300');

                const formatShortDate = (dStr) => {
                    if (!dStr) return '';
                    const d = new Date(dStr);
                    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                };

                const displayDate = evt.startDate === evt.endDate ? formatShortDate(evt.startDate) : `${formatShortDate(evt.startDate)} - ${formatShortDate(evt.endDate)}`;
                const assigns = evt.assignees || [];
                const assignsStr = assigns.length > 0 ? assigns.join(', ') : 'Unassigned';
                const formattedTitle = `[${evt.campaignType || 'All'}] ${evt.title} - ${assignsStr}`;
                const escTitle = formattedTitle.replace(/'/g, "\\'");
                const escAssigns = assignsStr.replace(/'/g, "\\'");

                tr.innerHTML = `
                    <td class="px-6 py-4">
                        <div class="flex flex-col">
                            <div class="flex items-center">
                                <span class="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors"><i class="fa-solid fa-list-check text-indigo-500 mr-1.5 opacity-70"></i>${formattedTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatShortDate(evt.startDate)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatShortDate(evt.endDate)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(function(){
                            if(assigns.length === 0) return '<span class="text-gray-400 italic text-xs">Unassigned</span>';
                            return '<div class="flex items-center space-x-3"><div class="flex items-center -space-x-1">' + assigns.map(a => {
                                let init = a.charAt(0).toUpperCase();
                                return '<div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold border-2 border-white ring-1 ring-slate-200" title="' + a + '">' + init + '</div>';
                            }).join('') + '</div><span class="text-sm text-gray-900">' + assigns.join(', ') + '</span></div>';
                        })()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${evt.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : (evt.status === 'Ongoing' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800')}">${evt.status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col w-full max-w-[150px]">
                            <div class="flex items-center mb-1">
                                <span class="text-xs font-medium text-gray-600 mr-2">${pFormatted}%</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="${pColor} h-2 rounded-full transition-all duration-500" style="width: ${p}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end space-x-2">
                            <button onclick="triggerReminder('${evt.id}', '${escTitle}', '${escAssigns}')" class="text-amber-600 hover:text-amber-900 bg-amber-50 p-1.5 rounded transition-colors" title="Send Reminder">
                                <i class="fa-regular fa-bell"></i>
                            </button>
                            <button onclick="openEditById('${evt.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded transition-colors" title="Edit">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="deleteTask('${evt.id}')" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                tasksTable.appendChild(tr);
            });
        }

        window.setBudgetOwnerFilter = (val) => {
            window.budgetFilterOwner = val;
            window.renderBudgetTable();
        };

export function init(container) {
    window.renderTasksTable();
    return function cleanup() {};
}

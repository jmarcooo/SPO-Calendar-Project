window.renderCWRequestsTable = () => {
            const tbody = document.getElementById('cw-requests-table-body');
            if (!tbody) return;

            let searchVal = document.getElementById('cw-search-input') ? document.getElementById('cw-search-input').value.toLowerCase() : '';

            let filtered = window.cwRequests.filter(p => {
                if (searchVal) {
                    const matchCamp = p.campaignName && p.campaignName.toLowerCase().includes(searchVal);
                    const matchReq = p.requestedBy && p.requestedBy.toLowerCase().includes(searchVal);
                    return matchCamp || matchReq;
                }
                return true;
            });

            if (window.cwSortBy) {
                filtered = window.sortTableData(filtered, window.cwSortBy, window.cwSortDesc);
            } else {
                const rank = { 'Ongoing': 1, 'Upcoming': 2, 'Past': 3 };
                filtered.sort((a, b) => {
                    let sA = window.calculateStatus(a.supportDate, a.endDate || a.supportDate, a.requestStatus);
                    let sB = window.calculateStatus(b.supportDate, b.endDate || b.supportDate, b.requestStatus);
                    if (sA === 'Past' && a.requestStatus !== 'Completed') sA = 'Ongoing';
                    if (sB === 'Past' && b.requestStatus !== 'Completed') sB = 'Ongoing';
                    if (rank[sA] !== rank[sB]) return rank[sA] - rank[sB];
                    return (b.submissionTime || '').localeCompare(a.submissionTime || '');
                });
            }
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400">No CW requests found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(p => {
                const priorityClass = p.priorityLevel === 'High' ? 'text-red-600 bg-red-100' : (p.priorityLevel === 'Medium' ? 'text-amber-600 bg-amber-100' : 'text-blue-600 bg-blue-100');

                let rowStatus = window.calculateStatus(p.supportDate, p.endDate || p.supportDate, p.requestStatus);
                if (rowStatus === 'Past' && p.requestStatus !== 'Completed') rowStatus = 'Ongoing';
                const isPast = rowStatus === 'Past';
                const rowOpacityClass = isPast ? 'opacity-50 grayscale bg-gray-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:bg-slate-900 transition-colors group cursor-pointer';

                let statusClass = 'text-gray-600 bg-gray-100 dark:bg-slate-700';
                if (p.requestStatus === 'Completed') statusClass = 'text-emerald-600 bg-emerald-100';
                else if (p.requestStatus === 'Under Review') statusClass = 'text-amber-600 bg-amber-100';
                else if (p.requestStatus === 'Pending') statusClass = 'text-primary-600 bg-primary-100';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.openCWRequestDetails('${p.id}')">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">${p.campaignName}</div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.submissionTime || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.supportDate || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.endDate || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">${p.campaignStatus || '-'}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityClass}">${p.priorityLevel || 'Medium'}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            ${(() => {
                                let n = p.requestedBy || 'Unknown';
                                let initial = n.charAt(0).toUpperCase();
                                return `<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">${initial}</div><span class="text-sm text-gray-900 dark:text-white">${n}</span></div>`;
                            })()}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${p.requestStatus || 'Pending'}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${(p.requestStatus === 'Under Review' && window.isCurrentUserPOC('copy_writer')) ? `<button onclick="event.stopPropagation(); window.completeCWRequest('${p.id}')" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md transition-colors mr-1" title="Complete"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="event.stopPropagation(); window.openCWRequestModal('${p.id}')" class="text-primary-600 hover:text-primary-900 bg-primary-50 px-2 py-1 rounded-md transition-colors mr-1" title="Edit"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="event.stopPropagation(); window.deleteCWRequest('${p.id}')" class="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };


export function init(container) {
if (window.renderCWRequestsTable) window.renderCWRequestsTable();
    return function cleanup() {};
}

window.renderPDRequestsTable = () => {
            const tbody = document.getElementById('pd-requests-table-body');
            if (!tbody) return;

            let searchVal = document.getElementById('pd-search-input') ? document.getElementById('pd-search-input').value.toLowerCase() : '';

            let filtered = window.pdRequests.filter(p => {
                if (searchVal) {
                    const matchCamp = p.campaignName && p.campaignName.toLowerCase().includes(searchVal);
                    const matchReq = p.requestedBy && p.requestedBy.toLowerCase().includes(searchVal);
                    return matchCamp || matchReq;
                }
                return true;
            });

            if (window.pdSortBy) {
                filtered = window.sortTableData(filtered, window.pdSortBy, window.pdSortDesc);
            } else {
                const rank = { 'Ongoing': 1, 'Upcoming': 2, 'Past': 3 };
                filtered.sort((a, b) => {
                    let sA = window.calculateStatus(a.eventDatetime, a.eventDatetime, a.status);
                    let sB = window.calculateStatus(b.eventDatetime, b.eventDatetime, b.status);
                    if (sA === 'Past' && a.status !== 'Completed' && a.status !== 'Rejected') sA = 'Ongoing';
                    if (sB === 'Past' && b.status !== 'Completed' && b.status !== 'Rejected') sB = 'Ongoing';
                    if (rank[sA] !== rank[sB]) return rank[sA] - rank[sB];
                    return (b.submissionTime || '').localeCompare(a.submissionTime || '');
                });
            }
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-sm text-stone-500 dark:text-slate-400">No PD requests found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(p => {
                let rowStatus = window.calculateStatus(p.eventDatetime, p.eventDatetime, p.status);
                if (rowStatus === 'Past' && p.status !== 'Completed' && p.status !== 'Rejected') rowStatus = 'Ongoing';
                const isPast = rowStatus === 'Past';
                const rowOpacityClass = isPast ? 'opacity-55 grayscale-[40%] bg-cream-100/60 dark:bg-slate-800/50' : 'hover:bg-cream-100/80 dark:hover:bg-slate-700/60 transition-colors group cursor-pointer';

                let statusClass = 'text-stone-600 bg-cream-200 border border-cream-300';
                if (p.status === 'Completed') statusClass = 'text-evergreen-700 bg-evergreen-100 border border-evergreen-200 dark:bg-evergreen-900/40 dark:text-evergreen-300 dark:border-evergreen-800';
                else if (p.status === 'Under Review') statusClass = 'text-amber-800 bg-amber-100 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800';
                else if (p.status === 'Pending') statusClass = 'text-peppermint-700 bg-peppermint-50 border border-peppermint-200 dark:bg-peppermint-900/40 dark:text-peppermint-300 dark:border-peppermint-800';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.openPDRequestDetails('${p.id}')">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-semibold text-stone-800 dark:text-white truncate max-w-[200px]">${p.campaignName}</div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${p.submissionTime || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${p.eventDatetime || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            ${(() => {
                                let n = p.requestedBy || 'Unknown';
                                let initial = n.charAt(0).toUpperCase();
                                return `<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-gingerbread-500 text-white font-fun flex items-center justify-center text-xs font-bold shadow-xs">${initial}</div><span class="text-sm font-medium text-gingerbread-700 dark:text-white">${n}</span></div>`;
                            })()}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-bold font-fun text-gingerbread-700 dark:text-amber-200">${window.formatCurrency ? window.formatCurrency(p.budgetAmount) : p.budgetAmount}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-semibold text-stone-700 dark:text-slate-200">${p.status === 'Completed' ? (window.formatCurrency ? window.formatCurrency(p.actualAmount) : p.actualAmount) : '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}">${p.status}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${(p.status === 'Under Review' && window.isCurrentUserPOC('prize_distribution')) ? `<button onclick="event.stopPropagation(); window.openPDCompleteModal('${p.id}')" class="text-evergreen-600 hover:text-evergreen-800 bg-evergreen-50 dark:bg-evergreen-900/30 border border-evergreen-200 dark:border-evergreen-800 px-2 py-1 rounded-lg transition-colors mr-1" title="Complete"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="event.stopPropagation(); window.openPDRequestModal('${p.id}')" class="text-gingerbread-600 hover:text-gingerbread-700 bg-cream-200/70 dark:bg-slate-700 border border-cream-300 dark:border-slate-600 px-2 py-1 rounded-lg transition-colors mr-1" title="Edit"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="event.stopPropagation(); window.deletePDRequest('${p.id}')" class="text-peppermint-600 hover:text-peppermint-800 bg-peppermint-50 dark:bg-peppermint-900/30 border border-peppermint-200/70 dark:border-peppermint-800/50 px-2 py-1 rounded-lg transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };


export function init(container) {
if (window.renderPDRequestsTable) window.renderPDRequestsTable();
    return function cleanup() {};
}

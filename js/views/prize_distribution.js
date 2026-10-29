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
                tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">No PD requests found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(p => {
                let rowStatus = window.calculateStatus(p.eventDatetime, p.eventDatetime, p.status);
                if (rowStatus === 'Past' && p.status !== 'Completed' && p.status !== 'Rejected') rowStatus = 'Ongoing';
                const isPast = rowStatus === 'Past';
                const rowOpacityClass = isPast ? 'opacity-50 grayscale bg-gray-50' : 'hover:bg-slate-50 transition-colors group cursor-pointer';

                let statusClass = 'text-gray-600 bg-gray-100';
                if (p.status === 'Completed') statusClass = 'text-emerald-600 bg-emerald-100';
                else if (p.status === 'Under Review') statusClass = 'text-amber-600 bg-amber-100';
                else if (p.status === 'Pending') statusClass = 'text-primary-600 bg-primary-100';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.openPDRequestDetails('${p.id}')">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 truncate max-w-[200px]">${p.campaignName}</div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${p.submissionTime || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${p.eventDatetime || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            ${(() => {
                                let n = p.requestedBy || 'Unknown';
                                let initial = n.charAt(0).toUpperCase();
                                return `<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">${initial}</div><span class="text-sm text-gray-900">${n}</span></div>`;
                            })()}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">${window.formatCurrency ? window.formatCurrency(p.budgetAmount) : p.budgetAmount}</td>
                                                <td class="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-900">${p.status === 'Completed' ? (window.formatCurrency ? window.formatCurrency(p.actualAmount) : p.actualAmount) : '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${p.status}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${(p.status === 'Under Review' && window.isCurrentUserPOC('prize_distribution')) ? `<button onclick="event.stopPropagation(); window.openPDCompleteModal('${p.id}')" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md transition-colors mr-1" title="Complete"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="event.stopPropagation(); window.openPDRequestModal('${p.id}')" class="text-primary-600 hover:text-primary-900 bg-primary-50 px-2 py-1 rounded-md transition-colors mr-1" title="Edit"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="event.stopPropagation(); window.deletePDRequest('${p.id}')" class="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
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

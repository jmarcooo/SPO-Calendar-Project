window.renderSMSTable = function() {
            const tbody = document.getElementById('sms-table-body');
            if (!tbody) return;
            const searchInput = document.getElementById('sms-search-input');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

            let filtered = window.smsRequests;
            if (searchTerm) {
                filtered = filtered.filter(req =>
                    (req.campaignName && req.campaignName.toLowerCase().includes(searchTerm)) ||
                    (req.requestor && req.requestor.toLowerCase().includes(searchTerm))
                );
            }

            if (window.smsSortBy) {
                filtered = window.sortTableData(filtered, window.smsSortBy, window.smsSortDesc);
            } else {
                const rank = { 'Ongoing': 1, 'Upcoming': 2, 'Past': 3 };
                filtered.sort((a, b) => {
                    let sA = window.calculateStatus(a.eventDateTime, a.endDatetime || a.eventDateTime, a.requestStatus);
                    let sB = window.calculateStatus(b.eventDateTime, b.endDatetime || b.eventDateTime, b.requestStatus);
                    if (sA === 'Past' && a.requestStatus !== 'Completed') sA = 'Ongoing';
                    if (sB === 'Past' && b.requestStatus !== 'Completed') sB = 'Ongoing';
                    if (rank[sA] !== rank[sB]) return rank[sA] - rank[sB];
                    return (b.createdAt || '').localeCompare(a.createdAt || '');
                });
            }
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-500 dark:text-slate-400">No SMS requests found.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(req => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-slate-50 transition-colors cursor-pointer';
                row.onclick = (event) => {
                    if(!event.target.closest('button')) {
                        window.openSMSDetails(req.id);
                    }
                };

                const statusColors = {
                    'Pending': 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
                    'Under Review': 'bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
                    'Completed': 'bg-evergreen-100 text-evergreen-700 border border-evergreen-200 dark:bg-evergreen-900/40 dark:text-evergreen-300 dark:border-evergreen-800'
                };
                const reqStatus = req.requestStatus || 'Pending';
                const statusClass = statusColors[reqStatus] || 'bg-cream-200 text-gingerbread-700';

                let completeBtn = '';
                if (reqStatus === 'Under Review' && window.isCurrentUserPOC('sms')) {
                    completeBtn = `<button onclick="window.completeSMSRequest('${req.id}'); event.stopPropagation();" class="text-evergreen-600 hover:text-evergreen-800 bg-evergreen-50 dark:bg-evergreen-900/30 border border-evergreen-200 dark:border-evergreen-800 px-2 py-1 rounded-lg transition-colors mr-1" title="Mark as Completed"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>`;
                }

                let rowStatus = window.calculateStatus(req.eventDateTime, req.endDatetime || req.eventDateTime, req.requestStatus);
                if (rowStatus === 'Past' && req.requestStatus !== 'Completed') rowStatus = 'Ongoing';
                const isPast = rowStatus === 'Past';
                const rowOpacityClass = isPast ? 'opacity-55 grayscale-[40%] bg-cream-100/60 dark:bg-slate-800/50' : 'hover:bg-cream-100/80 dark:hover:bg-slate-700/60 transition-colors cursor-pointer';

                row.className = rowOpacityClass;
                row.innerHTML = `
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-semibold text-stone-800 dark:text-white">
                        ${req.campaignName || '-'}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${req.createdAt || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${req.eventDateTime || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-slate-400">${req.endDatetime || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-bold font-fun text-gingerbread-700 dark:text-amber-200">
                        PHP ${parseFloat(req.budget || 0).toFixed(2)}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200/80 dark:bg-slate-700 text-gingerbread-700 dark:text-slate-200 border border-cream-300 dark:border-slate-600">${rowStatus || '-'}</span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/50">${req.audienceType || '-'}</span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-slate-300">${window.formatUserBadge ? window.formatUserBadge(req.requestor) : req.requestor}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                        <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${reqStatus}
                        </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${completeBtn}
                        <button onclick="window.openSMSModal('${req.id}')" class="text-gingerbread-600 hover:text-gingerbread-700 bg-cream-200/70 dark:bg-slate-700 border border-cream-300 dark:border-slate-600 px-2 py-1 rounded-lg transition-colors" title="Edit Request"><i class="fa-solid fa-pen text-xs"></i></button>
                        <button onclick="window.deleteSMSRequest('${req.id}')" class="text-peppermint-600 hover:text-peppermint-800 ml-1.5 bg-peppermint-50 dark:bg-peppermint-900/30 border border-peppermint-200/70 dark:border-peppermint-800/50 px-2 py-1 rounded-lg transition-colors" title="Delete Request"><i class="fa-solid fa-trash text-xs"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        };


export function init(container) {
if (window.renderSMSTable) window.renderSMSTable();
    return function cleanup() {};
}

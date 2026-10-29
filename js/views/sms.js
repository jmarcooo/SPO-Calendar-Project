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
                tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-500">No SMS requests found.</td></tr>';
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
                    'Pending': 'bg-yellow-100 text-yellow-800',
                    'Under Review': 'bg-blue-100 text-blue-800',
                    'Completed': 'bg-green-100 text-green-800'
                };
                const reqStatus = req.requestStatus || 'Pending';
                const statusClass = statusColors[reqStatus] || 'bg-gray-100 text-gray-800';

                let completeBtn = '';
                if (reqStatus === 'Under Review' && window.isCurrentUserPOC('sms')) {
                    completeBtn = `<button onclick="window.completeSMSRequest('${req.id}'); event.stopPropagation();" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md transition-colors mr-1" title="Mark as Completed"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>`;
                }

                let rowStatus = window.calculateStatus(req.eventDateTime, req.endDatetime || req.eventDateTime, req.requestStatus);
                if (rowStatus === 'Past' && req.requestStatus !== 'Completed') rowStatus = 'Ongoing';
                const isPast = rowStatus === 'Past';
                const rowOpacityClass = isPast ? 'opacity-50 grayscale bg-gray-50' : 'hover:bg-slate-50 transition-colors cursor-pointer';

                row.className = rowOpacityClass;
                row.innerHTML = `
                    <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${req.campaignName || '-'}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${req.createdAt || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${req.eventDateTime || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${req.endDatetime || '-'}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        PHP ${parseFloat(req.budget || 0).toFixed(2)}
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">${rowStatus || '-'}</span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">${req.audienceType || '-'}</span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${window.formatUserBadge ? window.formatUserBadge(req.requestor) : req.requestor}</td>
                    <td class="px-3 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${reqStatus}
                        </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${completeBtn}
                        <button onclick="window.openSMSModal('${req.id}')" class="text-primary-600 hover:text-primary-900 group-hover:bg-primary-50 p-1 rounded transition-colors" title="Edit Request"><i class="fa-solid fa-edit"></i></button>
                        <button onclick="window.deleteSMSRequest('${req.id}')" class="text-red-600 hover:text-red-900 ml-2 group-hover:bg-red-50 p-1 rounded transition-colors" title="Delete Request"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        };


export function init(container) {
if (window.renderSMSTable) window.renderSMSTable();
    return function cleanup() {};
}

import { sortTableData } from "../utils/tableSort.js";

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

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">No CW requests found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(p => {
                const priorityClass = p.priorityLevel === 'High' ? 'text-red-600 bg-red-100' : (p.priorityLevel === 'Medium' ? 'text-amber-600 bg-amber-100' : 'text-blue-600 bg-blue-100');

                let statusClass = 'text-gray-600 bg-gray-100';
                if (p.campaignStatus === 'Done') statusClass = 'text-emerald-600 bg-emerald-100';
                else if (p.campaignStatus === 'In Progress') statusClass = 'text-amber-600 bg-amber-100';
                else if (p.campaignStatus === 'Pending') statusClass = 'text-indigo-600 bg-indigo-100';


                const statusColors = { 'Pending': 'bg-yellow-100 text-yellow-800', 'Under Review': 'bg-blue-100 text-blue-800', 'Completed': 'bg-green-100 text-green-800' };
                const reqStatus = p.requestStatus || 'Pending';
                const reqStatusClass = statusColors[reqStatus] || 'bg-gray-100 text-gray-800';
                let completeBtn = '';
                if (reqStatus === 'Under Review' && window.isCurrentUserPOC('copy_writer')) {
                    completeBtn = `<button onclick="window.completeCWRequest(\'${p.id}\'); event.stopPropagation();" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md transition-colors mr-1" title="Mark as Completed"><i class="fa-solid fa-check text-xs" style="pointer-events: none;"></i></button>`;
                }
html += `
                    <tr class="hover:bg-slate-50 transition-colors group cursor-pointer" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.openCWRequestDetails('${p.id}')">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 truncate max-w-[200px]">${p.campaignName}</div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${p.createdDate || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${p.supportDate || ''}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">${p.campaignStatus}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityClass}">${p.priorityLevel}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            ${(function(){
                                let n = p.requestedBy || 'Unknown';
                                let initial = n.charAt(0).toUpperCase();
                                return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900">' + n + '</span></div>';
                            })()}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reqStatusClass}">
                            ${reqStatus}
                        </span>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${completeBtn}
                            <button onclick="event.stopPropagation(); window.openCWRequestModal('${p.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md transition-colors mr-1" title="Edit"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="event.stopPropagation(); window.deleteCWRequest('${p.id}')" class="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };

export function init(container) {
    window.renderCWRequestsTable();
    return function cleanup() {};
}

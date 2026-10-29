import { sortTableData } from "../utils/tableSort.js";


window.copySPOTeamPostUrl = (url, event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
        window.showToast('Post URL copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        window.showToast('Failed to copy URL.', 'error');
    });
};

window.currentSPOTeamPostsSort = { column: 'datePosted', direction: 'desc' };



window.extractSPOTeamPosts = () => {
    let posts = window.spoTeamPosts || [];
    if (window.spoTeamPostsMonthFilter) {
        posts = posts.filter(post => {
            if (!post.datePosted) return false;
            return post.datePosted.startsWith(window.spoTeamPostsMonthFilter);
        });
    }

    if (posts.length === 0) {
        window.showToast('No data to extract for the selected filter.', 'error');
        return;
    }

    const exportData = posts.map(post => ({
        'Title': post.title || '',
        'Date Posted': post.datePosted ? post.datePosted.replace('T', ' ') : '',
        'Created By': post.createdBy || '',
        'Account Used': post.accountUsed || '',
        'Post URL': post.postUrl || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SPO Team Posts");

    const filename = `SPO_Team_Posts_${window.spoTeamPostsMonthFilter || 'All'}.xlsx`;
    XLSX.writeFile(wb, filename);
};

window.filterSPOTeamPostsByMonth = (monthStr) => {
    window.spoTeamPostsMonthFilter = monthStr;
    window.renderSPOTeamPostsTable();
};

window.sortSPOTeamPosts = (column) => {
    if (window.currentSPOTeamPostsSort.column === column) {
        window.currentSPOTeamPostsSort.direction = window.currentSPOTeamPostsSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        window.currentSPOTeamPostsSort.column = column;
        window.currentSPOTeamPostsSort.direction = 'asc';
    }
    window.renderSPOTeamPostsTable();
};

window.renderSPOTeamPostsTable = () => {
    const tbody = document.getElementById('spo-team-posts-tbody');
    const emptyState = document.getElementById('spo-team-posts-empty');
    if (!tbody || !emptyState) return;

    let posts = window.spoTeamPosts || [];

    if (window.spoTeamPostsMonthFilter) {
        posts = posts.filter(post => {
            if (!post.datePosted) return false;
            return post.datePosted.startsWith(window.spoTeamPostsMonthFilter);
        });
    }

    if (posts.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    posts = [...posts]; // clone for sorting

    const col = window.currentSPOTeamPostsSort.column;
    const dir = window.currentSPOTeamPostsSort.direction === 'asc' ? 1 : -1;

    posts.sort((a, b) => {
        let valA = a[col] || '';
        let valB = b[col] || '';
        if (col === 'datePosted') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    });

    tbody.innerHTML = posts.map(post => {
        const datePostedDisplay = post.datePosted ? post.datePosted.replace('T', ' ') : '-';
        return `
            <tr class="hover:bg-slate-50 transition-colors cursor-pointer" onclick="if(!event.target.closest('a') && !event.target.closest('button')) window.openSPOTeamPostDetailsModal('${post.id}')">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${post.title || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${datePostedDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.createdBy || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        ${post.accountUsed || '-'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${post.postUrl ? `
                        <div class="flex items-center space-x-2">
                            <a href="${post.postUrl}" target="_blank" class="text-blue-600 hover:underline"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link</a>
                            <button onclick="window.copySPOTeamPostUrl('${post.postUrl}', event)" class="text-gray-400 hover:text-primary-600 transition-colors" title="Copy URL">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    ` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-3">
                        <button onclick="window.openSPOTeamPostModal('${post.id}'); event.stopPropagation();" class="text-primary-600 hover:text-primary-900" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="window.deleteSPOTeamPost('${post.id}'); event.stopPropagation();" class="text-red-600 hover:text-red-900" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
};

export function init(container) {
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    window.spoTeamPostsMonthFilter = currentMonth;

    const filterInput = document.getElementById('spo-team-posts-month-filter');
    if (filterInput) filterInput.value = currentMonth;

    if (window.renderSPOTeamPostsTable) {
        window.renderSPOTeamPostsTable();
    }
    return function cleanup() {};
}

import { sortTableData } from "../utils/tableSort.js";

window.currentSPOTeamPostsSort = { column: 'datePosted', direction: 'desc' };

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
            <tr class="hover:bg-slate-50 transition-colors cursor-pointer" onclick="if(!event.target.closest('a')) window.openSPOTeamPostModal('${post.id}')">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${post.title || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${datePostedDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.createdBy || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${post.accountUsed || '-'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                    ${post.postUrl ? `<a href="${post.postUrl}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Link</a>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
};

export function init(container) {
    if (window.renderSPOTeamPostsTable) {
        window.renderSPOTeamPostsTable();
    }
    return function cleanup() {};
}

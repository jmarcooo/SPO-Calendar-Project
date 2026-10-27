import { sortTableData } from "../utils/tableSort.js";

window.renderFullNotifications = () => {
            const container = document.getElementById('full-notifications-list');
            if (!container) return;

            const userNotifs = window.notifications.filter(n => n.targetUser === window.currentUserProfile || n.targetUser === 'All');
            userNotifs.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

            if (userNotifs.length === 0) {
                container.innerHTML = '<div class="p-8 text-center text-sm text-gray-500 dark:text-slate-400 ">No notifications found.</div>';
                return;
            }

            let html = '';
            userNotifs.forEach(n => {
                const isRead = n.readBy && n.readBy.includes(window.currentUserProfile);
                html += `
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 mb-3 flex items-start cursor-pointer transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 ${isRead ? 'opacity-70' : 'ring-1 ring-primary-500'}" onclick="window.handleNotificationClick('${n.targetModule}', '${n.targetId}')">
                        <div class="h-8 w-8 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                            <i class="fa-regular fa-bell"></i>
                        </div>
                        <div class="ml-4 flex-1">
                            <p class="text-sm font-medium text-gray-900 dark:text-white ">${n.message}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">${n.createdTime}</p>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        };


export function init(container) {
if (window.renderFullNotifications) window.renderFullNotifications();
    return function cleanup() {};
}

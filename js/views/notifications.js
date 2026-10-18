import { sortTableData } from "../utils/tableSort.js";

window.renderFullNotifications = () => {
            const container = document.getElementById('full-notifications-list');
            if (!container) return;

            const userNotifs = window.notifications.filter(n => n.targetUser === window.currentUserProfile || n.targetUser === 'All');
            userNotifs.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

            if (userNotifs.length === 0) {
                container.innerHTML = '<div class="p-8 text-center text-sm text-gray-500">No notifications found.</div>';
                return;
            }

            let html = '';
            userNotifs.forEach(n => {
                const isRead = n.readBy && n.readBy.includes(window.currentUserProfile);
                html += `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 mb-3 flex items-start cursor-pointer transition-colors hover:bg-slate-50 ${isRead ? 'opacity-70' : 'ring-1 ring-indigo-500'}" onclick="window.switchView('${n.targetModule}'); setTimeout(() => { ${n.targetModule === 'tasks' ? 'window.openEditModal(window.events.find(e => e.id === \'' + n.targetId + '\'))' : 'window.open' + (n.targetModule === 'daily_task' ? 'DailyTask' : n.targetModule === 'pin_request' ? 'PinRequest' : n.targetModule === 'sms' ? 'SMS' : n.targetModule === 'content_writer' ? 'CWRequest' : n.targetModule === 'prize_distribution' ? 'PDRequest' : '') + 'Details(\'' + n.targetId + '\')'} }, 300)">
                        <div class="h-8 w-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                            <i class="fa-regular fa-bell"></i>
                        </div>
                        <div class="ml-4 flex-1">
                            <p class="text-sm font-medium text-gray-900">${n.message}</p>
                            <p class="text-xs text-gray-500 mt-1">${n.createdTime}</p>
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

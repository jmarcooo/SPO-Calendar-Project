import { sortTableData } from "../utils/tableSort.js";

window.updateStats = () => {
            const filtered = window.filterEventsByGlobalCategory(window.events);
            const currStr = window.getCurrentMonthStr();

            const monthStart = `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
            const monthEnd = `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const monthlyEvents = filtered.filter(e => e.startDate <= monthEnd && e.endDate >= monthStart);

            document.querySelectorAll('.stat-month-label').forEach(el => { el.innerText = currStr; });

            const totalTasks = monthlyEvents.filter(e => e.status !== 'Done' && e.itemType === 'task').length;
            const ongoingTasks = monthlyEvents.filter(e => e.status === 'Ongoing' && e.itemType === 'task').length;
            const completedTasks = monthlyEvents.filter(e => e.status === 'Done' && e.itemType === 'task').length;

            const statTotal = document.getElementById('stat-total');
            if (statTotal) statTotal.innerText = totalTasks;
            const statTotalBar = document.getElementById('stat-total-bar');
            if (statTotalBar) {
                statTotalBar.style.width = '100%';
            }

            const statProgress = document.getElementById('stat-progress');
            if (statProgress) statProgress.innerText = ongoingTasks;
            const statProgressBar = document.getElementById('stat-progress-bar');
            if (statProgressBar) {
                const totalActive = ongoingTasks + completedTasks;
                const pct = totalActive > 0 ? (ongoingTasks / totalActive) * 100 : 0;
                statProgressBar.style.width = `${pct}%`;
            }

            const statCompleted = document.getElementById('stat-completed');
            if (statCompleted) statCompleted.innerText = completedTasks;
            const statCompletedBar = document.getElementById('stat-completed-bar');
            if (statCompletedBar) {
                const totalActive = ongoingTasks + completedTasks;
                const pct = totalActive > 0 ? (completedTasks / totalActive) * 100 : 0;
                statCompletedBar.style.width = `${pct}%`;
            }

            let totalAllocated = 0;
            const activeMonthBudgets = window.budgets.filter(b => b.month === currStr);

            activeMonthBudgets.forEach(b => { totalAllocated += parseFloat(b.allocated) || 0; });
            const limitForMonth = window.budgetSettings.limits[currStr] || 0;
            const available = limitForMonth - totalAllocated;

            const budgetStatMonthLabel = document.getElementById('stat-budget-month-label');
            if (budgetStatMonthLabel) budgetStatMonthLabel.innerText = currStr;

            const budgetStatEl = document.getElementById('stat-budget');
            if(budgetStatEl) {
                budgetStatEl.innerText = window.formatCurrency(available);
                budgetStatEl.className = `mt-2 text-4xl font-bold ${available < 0 ? 'text-red-600' : 'text-blue-600'}`;
            }

            const currSymbol = document.getElementById('stat-budget-currency');
            if (currSymbol) currSymbol.innerText = window.budgetSettings.currency || 'PHP';

            const budgetLimitEl = document.getElementById('stat-budget-limit');
            if (budgetLimitEl) budgetLimitEl.innerText = window.formatCurrency(limitForMonth);

            const budgetPctEl = document.getElementById('stat-budget-pct');
            if (budgetPctEl) {
                let pct = 0;
                if (limitForMonth > 0) {
                    pct = (available / limitForMonth) * 100;
                }
                const pctText = pct >= 0 ? `${pct.toFixed(0)}% remaining` : `${Math.abs(pct).toFixed(0)}% over budget`;
                budgetPctEl.innerText = pctText;
                budgetPctEl.className = `font-semibold ${available < 0 ? 'text-red-600' : 'text-blue-600'}`;
            }
        }

window.renderCalendar = () => {
            const calGrid = document.getElementById('calendar-grid');
            const calMonthYear = document.getElementById('calendar-month-year');

            if (!calGrid || !calMonthYear) return;

            calGrid.innerHTML = '';
            const firstDay = new Date(window.currentYear, window.currentMonth, 1).getDay();
            const daysInMonth = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            calMonthYear.innerText = `${monthNames[window.currentMonth]} ${window.currentYear}`;

            const pToday = window.getPHParts(); const today = new Date(Date.UTC(pToday.year, pToday.month, pToday.date));
            const isCurrentMonth = today.getMonth() === window.currentMonth && today.getFullYear() === window.currentYear;
            const currentDay = today.getDate();

            let weeks = [];
            let currentWeek = [];
            const prevMonthDays = new Date(window.currentYear, window.currentMonth, 0).getDate();
            const prevMonth = window.currentMonth === 0 ? 11 : window.currentMonth - 1;
            const prevYear = window.currentMonth === 0 ? window.currentYear - 1 : window.currentYear;

            for (let i = 0; i < firstDay; i++) {
                const pDay = prevMonthDays - firstDay + i + 1;
                const pDateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
                currentWeek.push({ day: pDay, dateStr: pDateStr, isMuted: true });
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                currentWeek.push({ day, dateStr, isMuted: false });
                if (currentWeek.length === 7) {
                    weeks.push(currentWeek);
                    currentWeek = [];
                }
            }

            if (currentWeek.length > 0) {
                let nextDayCounter = 1;
                const nextMonth = window.currentMonth === 11 ? 0 : window.currentMonth + 1;
                const nextYear = window.currentMonth === 11 ? window.currentYear + 1 : window.currentYear;
                while (currentWeek.length < 7) {
                    const nDateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDayCounter).padStart(2, '0')}`;
                    currentWeek.push({ day: nextDayCounter++, dateStr: nDateStr, isMuted: true });
                }
                weeks.push(currentWeek);
            }

            weeks.forEach(week => {
                let weekStart = week[0].dateStr;
                let weekEnd = week[6].dateStr;
                let weekEvents = window.events.filter(e => e.startDate <= weekEnd && e.endDate >= weekStart);
                weekEvents = window.filterEventsByGlobalCategory(weekEvents);

                weekEvents.sort((a, b) => {
                    const aStart = a.startDate || '';
                    const bStart = b.startDate || '';
                    const aEnd = a.endDate || '';
                    const bEnd = b.endDate || '';
                    if (aStart !== bStart) return aStart.localeCompare(bStart);
                    return new Date(bEnd) - new Date(aEnd);
                });

                let tracks = [];
                let placements = [];
                weekEvents.forEach(evt => {
                    let sIdx = 0;
                    for(let i=0; i<7; i++) {
                        if(week[i] && week[i].dateStr === evt.startDate) { sIdx = i; break; }
                        if(week[i] && week[i].dateStr > evt.startDate) { sIdx = 0; break; }
                    }
                    let eIdx = 6;
                    for(let i=6; i>=0; i--) {
                        if(week[i] && week[i].dateStr === evt.endDate) { eIdx = i; break; }
                        if(week[i] && week[i].dateStr < evt.endDate) { eIdx = 6; break; }
                    }
                    let trackIdx = 0;
                    while(true) {
                        if (!tracks[trackIdx]) tracks[trackIdx] = [false,false,false,false,false,false,false];
                        let conflict = false;
                        for(let i = sIdx; i <= eIdx; i++) {
                            if(tracks[trackIdx][i]) conflict = true;
                        }
                        if (!conflict) {
                            for(let i = sIdx; i <= eIdx; i++) tracks[trackIdx][i] = true;
                            placements.push({evt, sIdx, eIdx, trackIdx});
                            break;
                        }
                        trackIdx++;
                    }
                });

                let weekEl = document.createElement('div');
                weekEl.className = 'relative bg-white min-h-[120px] flex-1';
                let bgGridHtml = `<div class="absolute inset-0 grid grid-cols-7 divide-x divide-gray-200 pointer-events-none">`;
                let contentGridHtml = `<div class="relative grid grid-cols-7 gap-y-1 gap-x-1 p-1 pointer-events-none">`;

                week.forEach((dayObj, i) => {
                    const isToday = dayObj.day === currentDay && isCurrentMonth && !dayObj.isMuted;

                    bgGridHtml += `
                        <div class="pointer-events-auto hover:bg-slate-50 cursor-pointer transition-colors ${dayObj.isMuted ? 'bg-slate-50/50' : ''} ${isToday ? 'ring-2 ring-inset ring-primary-500 z-0' : ''}" onclick="openTypeModal('${dayObj.dateStr}')"></div>
                    `;

                    contentGridHtml += `
                        <div class="col-start-${i+1} row-start-1 p-1.5 pointer-events-none flex justify-start relative">
                            <span class="text-sm font-semibold z-10 ${isToday ? 'text-white bg-primary-600 rounded-full h-7 w-7 flex items-center justify-center shadow-md' : (dayObj.isMuted ? 'text-gray-300 h-7 w-7 flex items-center justify-center' : 'text-gray-700 h-7 w-7 flex items-center justify-center')}">
                                ${dayObj.day}
                            </span>
                            ${isToday ? '<span class="absolute top-2.5 left-10 text-[10px] font-bold text-primary-600 uppercase tracking-wider">Today</span>' : ''}
                        </div>
                    `;
                });
                bgGridHtml += `</div>`;

                placements.forEach(p => {
                    const evt = p.evt;
                    const itemType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');

                    let statusColor = '';
                    let formattedTitle = '';

                    if (itemType === 'event') {
                        statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        formattedTitle = `<i class="fa-solid fa-calendar-day text-[10px] mr-1 text-emerald-500"></i>${evt.title}`;
                    } else if (itemType === 'game') {
                        statusColor = 'bg-red-50 text-red-800 border-red-200';
                        formattedTitle = `<i class="fa-solid fa-gamepad text-[10px] mr-1 text-red-500"></i>${evt.title}`;
                    } else {
                        statusColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                        const assignsStr = (evt.assignees && evt.assignees.length > 0) ? evt.assignees.join(', ') : '';
                        formattedTitle = `<i class="fa-solid fa-list-check text-[10px] mr-1 opacity-70"></i>[${evt.campaignType || 'All'}] ${evt.title} - ${assignsStr || 'Unassigned'}`;
                    }

                    let titleAttr = itemType === 'task' ? 'Status: ' + evt.status : (itemType === 'game' ? 'New Game' : 'Event');
                    const style = `grid-column: ${p.sIdx + 1} / ${p.eIdx + 2}; grid-row: ${p.trackIdx + 2};`;

                    const tooltipEvents = itemType === 'task'
                        ? `onmouseenter="showTaskTooltip('${evt.id}', event)" onmouseleave="hideTaskTooltip()" onmousemove="moveTaskTooltip(event)"`
                        : `onmouseenter="showEventTooltip('${evt.id}', event)" onmouseleave="hideEventTooltip()" onmousemove="moveEventTooltip(event)"`;

                    contentGridHtml += `
                        <div style="${style}" class="pointer-events-auto cursor-pointer rounded p-0.5 shadow-md shadow-slate-200/50 mx-1 mb-1 hover:shadow-md transition-shadow ${statusColor}" onclick="openEditById('${evt.id}')" ${tooltipEvents}>
                            <div class="text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full flex items-center">
                                ${formattedTitle}
                            </div>
                        </div>
                    `;
                });
                contentGridHtml += `</div>`;
                weekEl.innerHTML = bgGridHtml + contentGridHtml;
                calGrid.appendChild(weekEl);
            });
        }

window.renderOngoingEvents = () => {
            const ongoingList = document.getElementById('ongoing-events-list');
            if (!ongoingList) return;

            ongoingList.innerHTML = '';
            const monthStart = `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
            const monthEnd = `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            let monthlyEvents = window.events.filter(e => e.startDate <= monthEnd && e.endDate >= monthStart);
            monthlyEvents = window.filterEventsByGlobalCategory(monthlyEvents);

            const pSort = window.getPHParts();
            const nowStrSort = `${pSort.year}-${String(pSort.month + 1).padStart(2, '0')}-${String(pSort.date).padStart(2, '0')}`;

            const getEventStatus = (evt) => {
                const startStr = evt.startDate || '';
                const endStr = evt.endDate || startStr;
                if (evt.status === 'Done' || endStr < nowStrSort) return 'Past';
                if (startStr > nowStrSort) return 'Upcoming';
                return 'Ongoing';
            };

            monthlyEvents.sort((a, b) => {
                const rankA = getEventStatus(a) === 'Ongoing' ? 1 : (getEventStatus(a) === 'Upcoming' ? 2 : 3);
                const rankB = getEventStatus(b) === 'Ongoing' ? 1 : (getEventStatus(b) === 'Upcoming' ? 2 : 3);

                if (rankA !== rankB) return rankA - rankB;

                const startA = a.startDate || '';
                const startB = b.startDate || '';
                if (startA !== startB) return startA.localeCompare(startB);

                const endA = a.endDate || startA;
                const endB = b.endDate || startB;
                return endA.localeCompare(endB);
            });

            const ongoingCountEl = document.getElementById('ongoing-count');
            if (ongoingCountEl) ongoingCountEl.innerText = monthlyEvents.length;

            if (monthlyEvents.length === 0) {
                ongoingList.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                        <i class="fa-solid fa-calendar-check text-4xl mb-3 text-gray-300"></i>
                        <p>No records this month.</p>
                    </div>
                `;
                return;
            }

            const formatShortDate = (dStr) => {
                const d = new Date(dStr);
                return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
            };

            monthlyEvents.forEach(evt => {
                const itemType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
                const dateObj = new Date(evt.endDate);
                const displayDate = evt.startDate === evt.endDate ? formatShortDate(evt.startDate) : `${formatShortDate(evt.startDate)} - ${formatShortDate(evt.endDate)}`;
                const p = window.getPHParts();
                const nowUtc = Date.UTC(p.year, p.month, p.date);
                const daysDiff = Math.ceil((dateObj - nowUtc) / (1000 * 60 * 60 * 24));
                const urgency = (daysDiff <= 2 && evt.status !== 'Done') ? 'text-red-500 font-semibold' : 'text-gray-500';

                const el = document.createElement('div');
                el.title = window.getPendingSummary(evt);

                const nowStrIter = `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.date).padStart(2, '0')}`;
                const startStr = evt.startDate || '';
                const endStr = evt.endDate || startStr;
                const isPast = evt.status === 'Done' || endStr < nowStrIter;
                const opacityClass = isPast ? 'opacity-50 grayscale' : '';

                if (itemType === 'event' || itemType === 'game') {
                    el.onclick = () => window.openEditById(evt.id);

                    let iconClass = itemType === 'game' ? 'fa-gamepad text-rose-500' : 'fa-calendar-day text-emerald-500';
                    let titleColor = itemType === 'game' ? 'text-rose-900' : 'text-emerald-900';
                    let typeLabel = itemType === 'game' ? 'New Game' : 'Offline Event';
                    let typeBg = itemType === 'game' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';

                    el.className = `flex items-start p-4 bg-white hover:bg-slate-50 rounded-xl mb-3 border border-slate-200/60 shadow-md shadow-slate-200/50 transition-all cursor-pointer ${opacityClass}`;

                    el.innerHTML = `
                        <div class="flex-1 min-w-0 flex flex-col justify-between w-full">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center">
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${typeBg}">${typeLabel}</span>
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-gray-600 border border-slate-200/60">Pending</span>
                            </div>
                            <p class="text-sm font-bold ${titleColor} truncate mb-2">${evt.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                            <div class="flex items-center justify-between w-full">
                                <span class="text-xs ${urgency} font-medium flex items-center"><i class="fa-regular fa-calendar mr-1.5"></i>${displayDate}</span>
                            </div>
                        </div>
                    `;
                } else {
                    el.onclick = () => window.jumpToTask(evt.id);

                    const p = evt.progress || 0;
                    const pFormatted = p.toFixed(2);
                    const pColor = p === 100 ? 'bg-emerald-500' : (p > 0 ? 'bg-primary-500' : 'bg-gray-300');
                    const assignsStr = (evt.assignees && evt.assignees.length > 0) ? evt.assignees.join(', ') : 'Unassigned';

                    el.className = `flex items-start p-4 bg-white hover:bg-slate-50 rounded-xl mb-3 border border-slate-200/60 shadow-md shadow-slate-200/50 transition-all cursor-pointer ${opacityClass}`;

                    el.innerHTML = `
                        <div class="flex-1 min-w-0 flex flex-col justify-between w-full">
                            <div class="flex items-center justify-between mb-2">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-primary-50 text-primary-500 border-primary-200">Task</span>
                                <span class="text-sm font-bold text-primary-500">${assignsStr}</span>
                            </div>
                            <p class="text-sm font-bold text-primary-500 truncate mb-2"><i class="fa-solid fa-list-check text-primary-500 mr-1.5 opacity-70"></i>[${evt.campaignType || 'Task'}] ${evt.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                            <div class="flex items-end justify-between w-full mt-1">
                                <span class="text-xs ${urgency} font-medium flex items-center mb-1"><i class="fa-regular fa-calendar mr-1.5 text-red-500"></i><span class="text-red-500">${displayDate}</span></span>
                                <div class="flex flex-col items-end w-2/3">
                                    <div class="flex items-center justify-between mb-1.5 w-full">
                                        <span class="text-[10px] font-bold text-gray-600">Progress</span>
                                        <span class="text-[10px] font-bold text-gray-600">${pFormatted}%</span>
                                    </div>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5">
                                        <div class="${pColor} h-1.5 rounded-full transition-all duration-500" style="width: ${p}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                ongoingList.appendChild(el);
            });
        }

window.renderUI = () => {
            const currStr = window.getCurrentMonthStr();
            const monthInput = document.getElementById('setting-budget-month');
            const limitInput = document.getElementById('setting-budget-limit');
            if (monthInput) monthInput.value = currStr;
            if (limitInput) limitInput.value = window.budgetSettings.limits[currStr] || 0;

            window.updateStats();
            window.renderCalendar();
            window.renderOngoingEvents();
            if(window.renderTasksTable) window.renderTasksTable();
            if(window.renderBudgetTable) window.renderBudgetTable();
            if(window.updateCampaignDropdown) window.updateCampaignDropdown();
        }
export function init(container) {

    if (window.renderUI) window.renderUI();
    const savedTypeSelect = document.getElementById('global-type-filter');
    if (savedTypeSelect) savedTypeSelect.value = window.globalTypeFilter || 'All';
    const savedCategorySelect = document.getElementById('global-category-filter');
    if (savedCategorySelect) savedCategorySelect.value = window.globalCategoryFilter || 'All';

    return function cleanup() {};
}

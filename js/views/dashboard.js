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
    const totalMonthGames = monthlyEvents.filter(e => e.itemType === 'game').length;

    const pToday = window.getPHParts();
    const todayStr = `${pToday.year}-${String(pToday.month + 1).padStart(2, '0')}-${String(pToday.date).padStart(2, '0')}`;
    const endingToday = monthlyEvents.filter(e => e.itemType === 'task' && e.status !== 'Done' && e.endDate === todayStr).length;

    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.innerText = totalTasks;
    const statTotalSub = document.getElementById('stat-total-sub');
    if (statTotalSub) {
        statTotalSub.innerText = totalMonthGames > 0
            ? `plus ${totalMonthGames} holiday game${totalMonthGames > 1 ? 's' : ''} this cycle`
            : `across ${monthlyEvents.length} scheduled item${monthlyEvents.length === 1 ? '' : 's'}`;
    }

    const statProgress = document.getElementById('stat-progress');
    if (statProgress) statProgress.innerText = ongoingTasks;
    const statProgressSub = document.getElementById('stat-progress-sub');
    if (statProgressSub) {
        statProgressSub.innerText = endingToday > 0
            ? `${endingToday} due today`
            : (ongoingTasks > 0 ? `${ongoingTasks} campaign${ongoingTasks > 1 ? 's' : ''} in flight` : 'No active sprints right now');
    }

    const statCompleted = document.getElementById('stat-completed');
    if (statCompleted) statCompleted.innerText = completedTasks;
    const statCompletedSub = document.getElementById('stat-completed-sub');
    if (statCompletedSub) {
        const allMonthTasks = totalTasks + completedTasks;
        if (completedTasks > 0 && allMonthTasks > 0) {
            const donePct = Math.round((completedTasks / allMonthTasks) * 100);
            statCompletedSub.innerText = `${donePct}% of monthly tasks wrapped`;
        } else {
            statCompletedSub.innerText = 'Ready for festive rollout';
        }
    }

    const sprintSummary = document.getElementById('festive-sprint-summary');
    if (sprintSummary) {
        sprintSummary.innerText = `${monthlyEvents.length} campaign${monthlyEvents.length === 1 ? '' : 's'} scheduled for ${currStr} rollout`;
    }

    let totalAllocated = 0;
    const activeMonthBudgets = window.budgets.filter(b => b.month === currStr);

    activeMonthBudgets.forEach(b => { totalAllocated += parseFloat(b.allocated) || 0; });
    const limitForMonth = window.budgetSettings.limits[currStr] || 0;
    const available = limitForMonth - totalAllocated;

    const budgetStatMonthLabel = document.getElementById('stat-budget-month-label');
    if (budgetStatMonthLabel) budgetStatMonthLabel.innerText = currStr;

    const budgetStatEl = document.getElementById('stat-budget');
    if (budgetStatEl) {
        const formatted = window.formatCurrency(available);
        const dotIdx = formatted.lastIndexOf('.');
        if (dotIdx !== -1) {
            budgetStatEl.innerHTML = `${formatted.slice(0, dotIdx)}.<span class="text-lg">${formatted.slice(dotIdx + 1)}</span>`;
        } else {
            budgetStatEl.innerText = formatted;
        }
        budgetStatEl.className = `text-2xl lg:text-3xl font-extrabold font-fun tracking-tight ${available < 0 ? 'text-peppermint-600 dark:text-peppermint-400' : 'text-gingerbread-700 dark:text-amber-200'}`;
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
        budgetPctEl.className = available < 0
            ? 'font-bold text-peppermint-600 dark:text-peppermint-300 bg-peppermint-50 dark:bg-peppermint-900/40 px-2 py-0.5 rounded-full border border-peppermint-200 dark:border-peppermint-800 shrink-0'
            : 'font-bold text-evergreen-600 dark:text-evergreen-300 bg-evergreen-50 dark:bg-evergreen-900/40 px-2 py-0.5 rounded-full border border-evergreen-200 dark:border-evergreen-800 shrink-0';
    }
};

window.renderCalendar = () => {
    const calGrid = document.getElementById('calendar-grid');
    const calMonthYear = document.getElementById('calendar-month-year');

    if (!calGrid || !calMonthYear) return;

    calGrid.innerHTML = '';
    const firstDay = new Date(window.currentYear, window.currentMonth, 1).getDay();
    const daysInMonth = new Date(window.currentYear, window.currentMonth + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    calMonthYear.innerText = `${monthNames[window.currentMonth]} ${window.currentYear}`;

    const pToday = window.getPHParts();
    const today = new Date(Date.UTC(pToday.year, pToday.month, pToday.date));
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
        currentWeek.push({ day: pDay, dateStr: pDateStr, isMuted: true, monthShort: shortMonthNames[prevMonth] });
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
            currentWeek.push({ day: nextDayCounter++, dateStr: nDateStr, isMuted: true, monthShort: shortMonthNames[nextMonth] });
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
            for (let i = 0; i < 7; i++) {
                if (week[i] && week[i].dateStr === evt.startDate) { sIdx = i; break; }
                if (week[i] && week[i].dateStr > evt.startDate) { sIdx = 0; break; }
            }
            let eIdx = 6;
            for (let i = 6; i >= 0; i--) {
                if (week[i] && week[i].dateStr === evt.endDate) { eIdx = i; break; }
                if (week[i] && week[i].dateStr < evt.endDate) { eIdx = 6; break; }
            }
            let trackIdx = 0;
            while (true) {
                if (!tracks[trackIdx]) tracks[trackIdx] = [false, false, false, false, false, false, false];
                let conflict = false;
                for (let i = sIdx; i <= eIdx; i++) {
                    if (tracks[trackIdx][i]) conflict = true;
                }
                if (!conflict) {
                    for (let i = sIdx; i <= eIdx; i++) tracks[trackIdx][i] = true;
                    placements.push({ evt, sIdx, eIdx, trackIdx });
                    break;
                }
                trackIdx++;
            }
        });

        let weekEl = document.createElement('div');
        weekEl.className = 'relative bg-cream-50/40 dark:bg-slate-800 min-h-[112px] flex-1';
        let bgGridHtml = `<div class="absolute inset-0 grid grid-cols-7 divide-x divide-cream-200 dark:divide-slate-700 pointer-events-none">`;
        let contentGridHtml = `<div class="relative grid grid-cols-7 gap-y-1 gap-x-1 p-1 pointer-events-none">`;

        week.forEach((dayObj, i) => {
            const isToday = dayObj.day === currentDay && isCurrentMonth && !dayObj.isMuted;
            const dayLabel = (dayObj.isMuted && dayObj.day === 1 && dayObj.monthShort)
                ? `${dayObj.day} ${dayObj.monthShort}`
                : `${dayObj.day}`;

            bgGridHtml += `
                <div class="pointer-events-auto hover:bg-cream-100/80 dark:hover:bg-slate-700/60 cursor-pointer transition-colors ${dayObj.isMuted ? 'bg-cream-100/40 dark:bg-slate-900/40' : ''} ${isToday ? 'bg-peppermint-50/70 dark:bg-peppermint-900/20 ring-2 ring-inset ring-peppermint-500 rounded-md z-0' : ''}" onclick="openTypeModal('${dayObj.dateStr}')"></div>
            `;

            contentGridHtml += `
                <div class="col-start-${i + 1} row-start-1 px-1.5 pt-1 pb-0.5 pointer-events-none flex items-center justify-between relative">
                    ${isToday
                        ? `<span class="w-5 h-5 rounded-full bg-peppermint-500 text-white font-fun font-bold flex items-center justify-center text-[11px] shadow-sm z-10">${dayObj.day}</span>
                           <span class="text-[9px] font-fun font-bold text-peppermint-600 dark:text-peppermint-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-peppermint-200 dark:border-peppermint-700 uppercase z-10">TODAY 🎄</span>`
                        : `<span class="text-xs font-bold font-fun z-10 ${dayObj.isMuted ? (dayObj.day === 1 ? 'text-gingerbread-600 dark:text-amber-300/70' : 'text-stone-400 dark:text-slate-600') : 'text-stone-700 dark:text-slate-200'}">${dayLabel}</span>`
                    }
                </div>
            `;
        });
        bgGridHtml += `</div>`;

        const getCampaignIcon = (cType) => {
            switch (cType) {
                case 'Game Promotion':
                    return '<i class="fa-solid fa-trophy text-[9px] mr-1 text-sky-600 dark:text-sky-300 shrink-0" title="Game Promotion"></i>';
                case 'Gambling Entertainment':
                    return '<i class="fa-solid fa-dice text-[9px] mr-1 text-sky-600 dark:text-sky-300 shrink-0" title="Gambling Entertainment"></i>';
                case 'Platform Feature':
                    return '<i class="fa-solid fa-rocket text-[9px] mr-1 text-sky-600 dark:text-sky-300 shrink-0" title="Platform Feature"></i>';
                case 'User Growth & Acquisition':
                    return '<i class="fa-solid fa-chart-line text-[9px] mr-1 text-sky-600 dark:text-sky-300 shrink-0" title="User Growth & Acquisition"></i>';
                case 'VIP Retention':
                    return '<i class="fa-solid fa-crown text-[9px] mr-1 text-amber-600 dark:text-amber-300 shrink-0" title="VIP Retention"></i>';
                default:
                    return '<i class="fa-solid fa-bullhorn text-[9px] mr-1 text-sky-600 dark:text-sky-300 shrink-0" title="All"></i>';
            }
        };

        placements.forEach(p => {
            const evt = p.evt;
            const itemType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
            const safeTitle = (evt.title || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");

            let statusColor = '';
            let formattedTitle = '';

            if (itemType === 'event') {
                statusColor = 'bg-evergreen-100 dark:bg-evergreen-900/50 text-evergreen-800 dark:text-evergreen-200 border border-evergreen-200 dark:border-evergreen-700/60';
                formattedTitle = `<i class="fa-solid fa-calendar-day text-[9px] mr-1 text-evergreen-600 dark:text-evergreen-400 shrink-0"></i>${safeTitle}`;
            } else if (itemType === 'game') {
                statusColor = 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-700/60 font-semibold';
                formattedTitle = `<i class="fa-solid fa-gamepad text-[9px] mr-1 text-peppermint-500 shrink-0"></i>${safeTitle}`;
            } else if (itemType === 'livestream') {
                statusColor = 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/60 font-semibold';
                formattedTitle = `<i class="fa-solid fa-video text-[9px] mr-1 text-purple-600 dark:text-purple-300 shrink-0"></i>${safeTitle}`;
            } else {
                const cType = evt.campaignType || 'All';
                if (cType === 'VIP Retention') {
                    statusColor = 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700/60';
                } else {
                    statusColor = 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-700/60';
                }
                const assignsStr = (evt.assignees && evt.assignees.length > 0) ? evt.assignees.join(', ') : '';
                const assignSuffix = assignsStr ? ` - ${assignsStr}` : '';
                formattedTitle = `${getCampaignIcon(cType)}${safeTitle}${assignSuffix}`;
            }

            const style = `grid-column: ${p.sIdx + 1} / ${p.eIdx + 2}; grid-row: ${p.trackIdx + 2};`;

            const tooltipEvents = itemType === 'task'
                ? `onmouseenter="showTaskTooltip('${evt.id}', event)" onmouseleave="hideTaskTooltip()" onmousemove="moveTaskTooltip(event)"`
                : `onmouseenter="showEventTooltip('${evt.id}', event)" onmouseleave="hideEventTooltip()" onmousemove="moveEventTooltip(event)"`;

            contentGridHtml += `
                <div style="${style}" class="pointer-events-auto cursor-pointer rounded px-1.5 py-0.5 mx-0.5 mb-0.5 hover:brightness-95 transition-all ${statusColor}" onclick="openEditById('${evt.id}')" ${tooltipEvents}>
                    <div class="text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full flex items-center leading-tight">
                        ${formattedTitle}
                    </div>
                </div>
            `;
        });
        contentGridHtml += `</div>`;
        weekEl.innerHTML = bgGridHtml + contentGridHtml;
        calGrid.appendChild(weekEl);
    });
};

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
            <div class="flex flex-col items-center justify-center h-full text-center text-stone-500 dark:text-slate-400 py-10">
                <i class="fa-solid fa-cookie-bite text-4xl mb-3 text-gingerbread-200 dark:text-slate-600"></i>
                <p class="font-fun text-sm font-semibold text-gingerbread-600 dark:text-slate-300">No records this month.</p>
                <p class="text-xs text-stone-400 mt-1">Click "+ New Event" to schedule one!</p>
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
        const safeTitle = (evt.title || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const dateObj = new Date(evt.endDate);
        const displayDate = evt.startDate === evt.endDate ? formatShortDate(evt.startDate) : `${formatShortDate(evt.startDate)} - ${formatShortDate(evt.endDate)}`;
        const p = window.getPHParts();
        const nowUtc = Date.UTC(p.year, p.month, p.date);
        const daysDiff = Math.ceil((dateObj - nowUtc) / (1000 * 60 * 60 * 24));
        const isUrgent = daysDiff <= 2 && evt.status !== 'Done';

        const el = document.createElement('div');
        el.title = window.getPendingSummary(evt);

        const nowStrIter = `${p.year}-${String(p.month + 1).padStart(2, '0')}-${String(p.date).padStart(2, '0')}`;
        const startStr = evt.startDate || '';
        const endStr = evt.endDate || startStr;
        const isPast = evt.status === 'Done' || endStr < nowStrIter;
        const opacityClass = isPast ? 'opacity-55 grayscale-[40%]' : '';

        if (itemType === 'event' || itemType === 'game' || itemType === 'livestream') {
            el.onclick = () => window.openEditById(evt.id);

            let cardTone = 'bg-evergreen-50/70 dark:bg-evergreen-950/30 border-evergreen-200 dark:border-evergreen-800/60 hover:border-evergreen-300';
            let iconClass = 'fa-calendar-day text-evergreen-600';
            let typeLabel = 'OFFLINE EVENT';
            let typeBg = 'bg-evergreen-100 dark:bg-evergreen-900/50 text-evergreen-700 dark:text-evergreen-300';

            if (itemType === 'game') {
                cardTone = 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 hover:border-rose-300';
                iconClass = 'fa-gamepad text-peppermint-500';
                typeLabel = 'GAME';
                typeBg = 'bg-peppermint-100 dark:bg-peppermint-900/50 text-peppermint-700 dark:text-peppermint-300';
            } else if (itemType === 'livestream') {
                cardTone = 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/60 hover:border-purple-300';
                iconClass = 'fa-video text-purple-600 dark:text-purple-400';
                typeLabel = 'LIVE STREAM';
                typeBg = 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
            }

            const statusBadgeText = isPast ? 'DONE' : 'PENDING';

            el.className = `p-3.5 rounded-xl border shadow-xs transition-all cursor-pointer ${cardTone} ${opacityClass}`;

            el.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${typeBg}">${typeLabel}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-400">${statusBadgeText}</span>
                </div>
                <h4 class="text-xs font-bold text-stone-800 dark:text-slate-100 flex items-center gap-1.5 mt-1 font-fun truncate">
                    <i class="fa-solid ${iconClass} shrink-0"></i>
                    <span class="truncate">${safeTitle}</span>
                </h4>
                <div class="mt-1.5 text-[11px] ${isUrgent ? 'text-peppermint-600 font-semibold' : 'text-stone-500 dark:text-slate-400'} flex items-center gap-1">
                    <i class="fa-regular fa-calendar text-peppermint-500"></i>
                    <span>${displayDate}</span>
                </div>
            `;
        } else {
            el.onclick = () => window.jumpToTask(evt.id);

            const progress = evt.progress || 0;
            const pFormatted = progress.toFixed(2);
            const pBarClass = progress === 100
                ? 'bg-evergreen-500'
                : 'bg-gradient-to-r from-peppermint-500 to-amber-400';
            const assignsStr = (evt.assignees && evt.assignees.length > 0) ? evt.assignees.join(', ') : 'Unassigned';
            const cType = evt.campaignType || 'All';
            const isVIP = cType === 'VIP Retention';

            const badgeClass = isVIP
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                : 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200';
            const badgeText = isVIP ? 'VIP' : 'CAMPAIGN';

            const iconMap = {
                'Game Promotion': 'fa-trophy text-sky-600',
                'Gambling Entertainment': 'fa-dice text-sky-600',
                'Platform Feature': 'fa-rocket text-sky-600',
                'User Growth & Acquisition': 'fa-chart-line text-sky-600',
                'VIP Retention': 'fa-crown text-amber-500'
            };
            const taskIcon = iconMap[cType] || 'fa-bullhorn text-sky-600';

            el.className = `p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-cream-200/90 dark:border-slate-700 hover:border-peppermint-300 dark:hover:border-peppermint-600 shadow-xs transition-all cursor-pointer ${opacityClass}`;

            el.innerHTML = `
                <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[10px] font-bold tracking-wider uppercase ${badgeClass} px-2 py-0.5 rounded shrink-0">${badgeText}</span>
                    <span class="text-xs font-bold text-gingerbread-600 dark:text-amber-300 font-fun truncate">${assignsStr}</span>
                </div>
                <h4 class="text-xs font-bold text-stone-800 dark:text-slate-100 hover:text-peppermint-600 dark:hover:text-peppermint-400 transition-colors leading-snug">
                    <i class="fa-solid ${taskIcon} mr-1 text-[11px]"></i>[${cType}] ${safeTitle}
                </h4>
                <div class="mt-2.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400">
                    <span class="flex items-center gap-1 font-medium ${isUrgent ? 'text-peppermint-600 dark:text-peppermint-400 font-semibold' : ''}">
                        <i class="fa-regular fa-calendar text-peppermint-500"></i> ${displayDate}
                    </span>
                    <span class="font-semibold ${progress > 0 ? 'text-stone-700 dark:text-slate-200' : 'text-stone-400 dark:text-slate-500'}">${pFormatted}%</span>
                </div>
                <div class="w-full bg-cream-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div class="${pBarClass} h-1.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
            `;
        }
        ongoingList.appendChild(el);
    });
};

window.renderUI = () => {
    const currStr = window.getCurrentMonthStr();
    const monthInput = document.getElementById('setting-budget-month');
    const limitInput = document.getElementById('setting-budget-limit');
    if (monthInput) monthInput.value = currStr;
    if (limitInput) limitInput.value = window.budgetSettings.limits[currStr] || 0;

    window.updateStats();
    window.renderCalendar();
    window.renderOngoingEvents();
    if (window.renderTasksTable) window.renderTasksTable();
    if (window.renderBudgetTable) window.renderBudgetTable();
    if (window.updateCampaignDropdown) window.updateCampaignDropdown();
};

export function init(container) {
    if (sessionStorage.getItem('spo_festive_toast_dismissed') === '1') {
        const toast = document.getElementById('festive-sprint-toast');
        if (toast) toast.remove();
    }

    if (window.renderUI) window.renderUI();
    const savedTypeSelect = document.getElementById('global-type-filter');
    if (savedTypeSelect) savedTypeSelect.value = window.globalTypeFilter || 'All';
    const savedCategorySelect = document.getElementById('global-category-filter');
    if (savedCategorySelect) savedCategorySelect.value = window.globalCategoryFilter || 'All';

    return function cleanup() {};
}

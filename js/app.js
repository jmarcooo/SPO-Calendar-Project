
// Initialize Theme
const initTheme = () => {
    const savedColor = localStorage.getItem('spo_theme_color') || 'indigo';
    document.documentElement.setAttribute('data-theme', savedColor);

    const isDark = localStorage.getItem('spo_dark_mode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};
initTheme();

import { sortTableData } from "./utils/tableSort.js";
window.sortTableData = sortTableData;

// --- GLOBAL TIMEZONE CONFIGURATION ---
        window.getPHParts = () => {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Manila',
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
            }).formatToParts(new Date());
            const getPart = (type) => parseInt(parts.find(p => p.type === type).value, 10);
            return {
                year: getPart('year'),
                month: getPart('month') - 1,
                date: getPart('day'),
                hours: getPart('hour') === 24 ? 0 : getPart('hour'),
                minutes: getPart('minute'),
                seconds: getPart('second')
            };
        };

        window.getFormattedCreatedTime = () => {
            const p = window.getPHParts();
            const pad = (n) => n.toString().padStart(2, '0');
            return `${p.year}-${pad(p.month + 1)}-${pad(p.date)} ${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
        };

        window.getPHDateStr = () => {
            return window.getFormattedCreatedTime().split(' ')[0];
        };

        window.getPHIsoString = () => {
            const p = window.getPHParts();
            const pad = (n) => n.toString().padStart(2, '0');
            return `${p.year}-${pad(p.month + 1)}-${pad(p.date)}T${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}.000Z`;
        };

        window.getPHFakeUtcMs = () => {
            const p = window.getPHParts();
            return Date.UTC(p.year, p.month, p.date, p.hours, p.minutes, p.seconds);
        };
        // -------------------------------------

        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
        import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyDnVAW0iDK1RVvgHppwrfyaXP0ZQIl0wqs",
            authDomain: "spo-calendar-project.firebaseapp.com",
            projectId: "spo-calendar-project",
            storageBucket: "spo-calendar-project.firebasestorage.app",
            messagingSenderId: "375136175643",
            appId: "1:375136175643:web:4f307eebeb3f56a040dabe",
            measurementId: "G-B81BZ4X1Y1"
        };

        let app, analytics, db;
        try {
            app = initializeApp(firebaseConfig);
            analytics = getAnalytics(app);
            db = getFirestore(app);
        } catch (err) {
            console.error("Firebase init error:", err);
        }

        const TEAM_MEMBERS = ['Kenneth', 'Renee', 'Liezl', 'Nami', 'Lim', 'Marco'];

        window.events = [];
        window.dailyTasks = [];
        window.quickLinks = [];
        window.pinRequests = [];
        window.cwRequests = [];
        window.pdRequests = [];
        window.cwTempHashtags = [];

        window.budgets = [];

        let tooltipTimeout;

        window.showEventTooltip = (evtId, e) => {
            const evt = window.events.find(ev => ev.id === evtId);
            if (!evt) return;

            const tooltip = document.getElementById('event-hover-tooltip');

            if (evt.itemType === 'game') {
                const launchDate = evt.officialLaunchDate;
                const status = launchDate ? 'Launched' : 'Upcoming';
                const displayDate = launchDate ? launchDate : (evt.startDate ? evt.startDate.split(' ')[0] : 'TBD');
                const statusColor = launchDate ? 'text-emerald-500' : 'text-amber-500';

                const hasCustomBanner = evt.bannerUrl && window.isValidURL(evt.bannerUrl);
                const hasLegacyBanner = evt.fields && evt.fields.postIds && evt.fields.postIds[0] && evt.fields.postIds[0].imgUrl && window.isValidURL(evt.fields.postIds[0].imgUrl);
                let bannerStyle = 'background: linear-gradient(to right, #6366f1, #a855f7);';
                if (hasCustomBanner) {
                    bannerStyle = `background-image: url('${evt.bannerUrl}'); background-size: cover; background-position: center;`;
                } else if (hasLegacyBanner) {
                    bannerStyle = `background-image: url('${evt.fields.postIds[0].imgUrl}'); background-size: cover; background-position: center;`;
                } else if (evt.imageLink && window.isValidURL(evt.imageLink)) {
                    bannerStyle = `background-image: url('${evt.imageLink}'); background-size: cover; background-position: center;`;
                }

                tooltip.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col w-[320px]">
                        <div class="h-[18rem] w-full relative" style="${bannerStyle}">
                        </div>
                        <div class="px-4 pb-5 relative flex-1 flex flex-col items-center">
                            <div class="w-20 h-20 bg-white dark:bg-slate-800 border-4 border-white shadow-md rounded-2xl flex items-center justify-center -mt-10 mb-3 z-10 overflow-hidden relative">
                                ${evt.iconUrl ? `<img src="${evt.iconUrl}" class="w-full h-full object-cover relative z-20" alt="Icon">` : `<i class="fa-solid fa-gamepad text-2xl text-primary-500 absolute"></i>`}
                            </div>
                            <h4 class="font-bold text-gray-900 dark:text-white text-lg mb-1 text-center w-full truncate" title="${evt.title}">${evt.title}</h4>
                            <p class="text-sm font-medium ${statusColor} text-center mb-1">${status}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400 text-center">${displayDate}</p>
                        </div>
                    </div>
                `;
                tooltip.style.width = "320px";
                tooltip.className = "fixed z-50 hidden transform transition-opacity duration-200 opacity-0 pointer-events-none"; // strip padding and border
            } else {
                // Restore standard tooltip layout
                tooltip.className = "fixed z-50 hidden flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 dark:border-slate-700 p-4 max-w-[700px] transform transition-opacity duration-200 opacity-0 pointer-events-none";
                tooltip.innerHTML = `
                    <h4 id="tooltip-title" class="text-sm font-bold text-gray-900 dark:text-white mb-2 truncate shrink-0"></h4>
                    <div id="tooltip-image-container" class="hidden w-full h-[600px] min-h-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img id="tooltip-image" src="" alt="Event Image" class="w-full h-full object-contain">
                    </div>
                    <p id="tooltip-date" class="text-xs text-gray-500 dark:text-slate-400 mt-2 shrink-0"></p>
                `;
                const titleEl = document.getElementById('tooltip-title');
                const imgContainer = document.getElementById('tooltip-image-container');
                const imgEl = document.getElementById('tooltip-image');
                const dateEl = document.getElementById('tooltip-date');

                titleEl.innerText = evt.title;
                dateEl.innerText = evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} to ${evt.endDate}`;

                const hasValidImage = evt.itemType === 'event' && evt.imageLink && (window.isValidURL ? window.isValidURL(evt.imageLink) : evt.imageLink.startsWith('http'));

                if (hasValidImage) {
                    imgEl.src = evt.imageLink;
                    imgContainer.classList.remove('hidden');
                    tooltip.style.width = "700px";
                } else {
                    imgContainer.classList.add('hidden');
                    tooltip.style.width = "auto";
                }
            }

            tooltip.classList.remove('hidden');
            window.moveEventTooltip(e);

            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                tooltip.classList.remove('opacity-0');
            }, 50);
        };

window.hideEventTooltip = () => {
    const tooltip = document.getElementById('event-hover-tooltip');
    if (!tooltip) return;
    tooltip.classList.add('opacity-0');
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
        tooltip.classList.add('hidden');
    }, 200);
};

window.moveEventTooltip = (e) => {
            const tooltip = document.getElementById('event-hover-tooltip');
            if (tooltip.classList.contains('hidden')) return;

            const rect = tooltip.getBoundingClientRect();
            let x = e.clientX + 15;
            let y = e.clientY + 15;

            if (x + rect.width > window.innerWidth - 10) {
                x = e.clientX - rect.width - 15;
            }
            if (y + rect.height > window.innerHeight - 10) {
                y = e.clientY - rect.height - 15;
            }

            if (x < 10) x = 10;
            if (y < 10) y = 10;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        };

        let taskTooltipInterval = null;

        window.showTaskTooltip = (taskId, e) => {
            const task = window.events.find(ev => ev.id === taskId);
            if (!task) return;

            let images = [];
            if (task.fields && Array.isArray(task.fields.postIds)) {
                images = task.fields.postIds.filter(p => p.imgUrl && (window.isValidURL ? window.isValidURL(p.imgUrl) : p.imgUrl.startsWith('http'))).map(p => p.imgUrl);
            }
            if (task.imageLink && (window.isValidURL ? window.isValidURL(task.imageLink) : task.imageLink.startsWith('http'))) {
                images.push(task.imageLink);
            }

            const tooltip = document.getElementById('event-hover-tooltip');
            const titleEl = document.getElementById('tooltip-title');
            const imgContainer = document.getElementById('tooltip-image-container');
            const imgEl = document.getElementById('tooltip-image');
            const dateEl = document.getElementById('tooltip-date');

            titleEl.innerText = task.title;

            if (images.length === 0) {
                imgContainer.classList.add('hidden');
                tooltip.style.width = "auto";
                dateEl.innerText = `Task`;
            } else {
                imgContainer.classList.remove('hidden');
                tooltip.style.width = "700px";
                dateEl.innerText = images.length > 1 ? `Image 1 of ${images.length}` : `Task Image`;
                imgEl.src = images[0];
            }

            tooltip.classList.remove('hidden');
            window.moveTaskTooltip(e);

            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                tooltip.classList.remove('opacity-0');
            }, 50);

            if (images.length > 1) {
                let currentIndex = 0;
                taskTooltipInterval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % images.length;
                    imgEl.src = images[currentIndex];
                    dateEl.innerText = `Image ${currentIndex + 1} of ${images.length}`;
                }, 2000);
            }
        };

        window.hideTaskTooltip = () => {
            if (taskTooltipInterval) {
                clearInterval(taskTooltipInterval);
                taskTooltipInterval = null;
            }

            const tooltip = document.getElementById('event-hover-tooltip');
            tooltip.classList.add('opacity-0');
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                tooltip.classList.add('hidden');
            }, 200);
        };

        window.moveTaskTooltip = (e) => {
            const tooltip = document.getElementById('event-hover-tooltip');
            if (tooltip.classList.contains('hidden')) return;

            const rect = tooltip.getBoundingClientRect();
            let x = e.clientX + 15;
            let y = e.clientY + 15;

            if (x + rect.width > window.innerWidth - 10) {
                x = e.clientX - rect.width - 15;
            }
            if (y + rect.height > window.innerHeight - 10) {
                y = e.clientY - rect.height - 15;
            }

            if (x < 10) x = 10;
            if (y < 10) y = 10;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        };

        window.currentMonth = localStorage.getItem('spo_current_month') !== null ? parseInt(localStorage.getItem('spo_current_month')) : window.getPHParts().month;
        window.currentYear = localStorage.getItem('spo_current_year') !== null ? parseInt(localStorage.getItem('spo_current_year')) : window.getPHParts().year;
        let currentDateObj = null;

        window.tempSelectedDate = null;
        window.budgetSettings = { limits: {}, currency: 'PHP' };
        window.globalCategoryFilter = localStorage.getItem('spo_global_category_filter') || 'All';
        window.globalTypeFilter = localStorage.getItem('spo_global_type_filter') || 'All';

        let logoClickCount = 0;
        window.isAdminModeEnabled = false;
        window.handleLogoClick = () => {
            logoClickCount++;
            if (logoClickCount === 20) {
                const clearBtn = document.getElementById('btn-clear-data');
                if (clearBtn) clearBtn.style.display = 'inline-flex';
                const budgetConfig = document.getElementById('budget-config-section');
                if (budgetConfig) budgetConfig.style.display = 'block';
                window.isAdminModeEnabled = true;
                const adminSettings = document.getElementById('admin-settings-section');
                if (adminSettings) {
                    adminSettings.style.display = 'block';
                    if (window.renderAdminPOCSettings) window.renderAdminPOCSettings();
                }
                window.showToast("Admin settings unlocked!", "success", "fa-unlock");
            }
        };

        let drawerAccordionStates = { links: true, media: false, ops: false};

        window.budgetSearchQuery = '';
        window.budgetFilterOwner = 'All';
        window.budgetFilterMonth = '';
        window.budgetSortCol = 'month';
        window.budgetSortAsc = false;

        window.assigneeFilter = 'All';
        window.searchQuery = '';
        window.statusFilter = 'All';
        window.sortCol = 'default';
        window.sortAsc = false;

        window.currentCampaignPosts = [];
        window.currentCarouselIndex = 0;

        const defaultFields = {
            documents: [],
            hashtags: [], postIds: [], ignoreListed: false,
            gameReview: 'Pending', dailyTask: 'Pending', contentWriters: 'Pending',
            imChannels: 'Pending', trackableLinks: 'Pending', sms: 'Pending',
            postPinned: 'Pending', rewardDistributed: 'Pending', rewardsBanner: 'Pending'
        };



        window.getCurrentMonthStr = () => `${window.currentYear}-${String(window.currentMonth + 1).padStart(2, '0')}`;

        window.calculateStatus = (startDate, endDate, requestStatus = null) => {
            const now = window.getFormattedCreatedTime(); // "YYYY-MM-DD HH:MM:SS"
            // Handle request status override
            if (requestStatus === 'Completed' || requestStatus === 'Done' || requestStatus === 'Rejected') {
                return 'Past'; // or Done depending on how it's handled downstream, but Past keeps sorting logic consistent. For now let's use Done if it was that. Wait, the new logic uses Past, Upcoming, Ongoing. Let's return Past for completed
            }

            let start = startDate || '';
            let end = endDate || start;

            // Normalize 'T' to space for comparison
            start = start.replace('T', ' ');
            end = end.replace('T', ' ');

            // If time is missing, pad to represent the whole day
            if (start.length === 10) start += " 00:00:00";
            if (end.length === 10) end += " 23:59:59";

            // Ensure padding for cases where time might be " HH:MM" without seconds
            if (start.length === 16) start += ":00";
            if (end.length === 16) end += ":00";

            if (now < start) return 'Upcoming';
            if (now > end) return 'Past';
            return 'Ongoing';
        }

        window.isValidURL = (string) => {
            try { new URL(string); return true; } catch (_) { return false; }
        }

        window.getDatesInRange = (startStr, endStr) => {
            const dates = [];
            let curr = new Date(startStr + 'T00:00:00Z');
            let end = new Date(endStr + 'T00:00:00Z');
            while(curr <= end) {
                dates.push(curr.toISOString().split('T')[0]);
                curr.setUTCDate(curr.getUTCDate() + 1);
            }
            return dates;
        }

        window.getPendingSummary = (task) => {
            const itemType = task.itemType || (task.isEventOnly ? 'event' : 'task');
            if (itemType === 'event') return "Offline Event";
            if (itemType === 'game') return "New Game Launch";
            if (task.progress === 100) return "All tasks completed!";

            const f = task.fields || {};
            let pending = [];

            if (!(Array.isArray(f.documents) && f.documents.some(d => window.isValidURL(d.url)))) pending.push("Documents");

            if (!(Array.isArray(f.hashtags) && f.hashtags.length > 0)) pending.push("Hashtags");
            if (!(Array.isArray(f.postIds) && f.postIds.some(p => p.id && p.id.trim() !== ''))) pending.push("Post IDs");

            const ops = [
                {k: 'gameReview', l: 'Game Review'}, {k: 'contentWriters', l: 'Content Writers'},
                {k: 'dailyTask', l: 'Daily Task'},
                {k: 'imChannels', l: 'IM Channels'}, {k: 'trackableLinks', l: 'Trackable Links'},
                {k: 'sms', l: 'SMS'}, {k: 'postPinned', l: 'Post Pinned'},
                {k: 'rewardDistributed', l: 'Reward Dist.'}, {k: 'rewardsBanner', l: 'Rewards Banner'}
            ];
            ops.forEach(op => {
                if (f[op.k] !== 'Yes' && f[op.k] !== 'N/A') pending.push(op.l);
            });



            if (pending.length === 0) return "All tasks completed!";
            return "Pending Items:\n• " + pending.join("\n• ");
        };

        window.initApp = () => {
            // Request desktop notification permission if not already granted/denied
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }

            const pToday = window.getPHParts(); const today = new Date(Date.UTC(pToday.year, pToday.month, pToday.date));
            window.budgetFilterMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const filterEl = document.getElementById('budget-filter-month');
            if(filterEl) filterEl.value = window.budgetFilterMonth;

            window.updateUserProfileIcon();
            if (!window.currentUserProfile) {
                setTimeout(() => window.openUserProfileModal(true), 500);
            }
            setupTeamMembersUI();

            const savedTypeSelect = document.getElementById('global-type-filter');
            if (savedTypeSelect) savedTypeSelect.value = window.globalTypeFilter;

            const savedCategorySelect = document.getElementById('global-category-filter');
            if (savedCategorySelect) savedCategorySelect.value = window.globalCategoryFilter;



            // Try loading local data immediately so UI isn't blank
            const localEventsStr = localStorage.getItem('spo_content_calendar_events');
            if (localEventsStr) {
                try {
                    window.events = JSON.parse(localEventsStr);
                } catch(e) {}
            }
            const localDailyTasksStr = localStorage.getItem('spo_daily_tasks');
            if (localDailyTasksStr) {
                try {
                    window.dailyTasks = JSON.parse(localDailyTasksStr);
                } catch(e) {}
            }
            const localQuickLinksStr = localStorage.getItem('spo_quick_links');
            if (localQuickLinksStr) {
                try {
                    window.quickLinks = JSON.parse(localQuickLinksStr);
                } catch(e) {}
            }
            const localPinRequestsStr = localStorage.getItem('spo_pin_requests');
            if (localPinRequestsStr) {
                try {
                    window.pinRequests = JSON.parse(localPinRequestsStr);
                } catch(e) {}
            }
            const localCwRequestsStr = localStorage.getItem('spo_cw_requests');
            if (localCwRequestsStr) {
                try {
                    window.cwRequests = JSON.parse(localCwRequestsStr);
                } catch(e) {}
            }
            const localPdRequestsStr = localStorage.getItem('spo_pd_requests');
            if (localPdRequestsStr) {
                try {
                    window.pdRequests = JSON.parse(localPdRequestsStr);
                } catch(e) {}
            }


            const calGrid = document.getElementById('calendar-grid');
            if(calGrid) if (window.renderUI) window.renderUI();

            if (!db) {
                document.getElementById('ongoing-events-list').innerHTML = `<div class="text-center text-red-500 py-8 text-sm">Firebase Connection Error. Running locally.</div>`;
                return;
            }

            onSnapshot(collection(db, "daily_tasks"), (snapshot) => {
                let tempDailyTasks = [];
                snapshot.forEach((doc) => {
                    tempDailyTasks.push(doc.data());
                });



                localStorage.setItem('spo_daily_tasks', JSON.stringify(tempDailyTasks));
                window.dailyTasks = tempDailyTasks;
                if (window.currentView === 'daily_task' && window.renderDailyTasksTable) {
                    window.renderDailyTasksTable();
                }
            }, (error) => {
                console.error("Daily Tasks Error:", error);
            });

            onSnapshot(collection(db, "quick_links"), (snapshot) => {
                let tempQuickLinks = [];
                snapshot.forEach((doc) => {
                    tempQuickLinks.push(doc.data());
                });

                const localLinksStr = localStorage.getItem('spo_quick_links');
                if (tempQuickLinks.length === 0 && localLinksStr && localLinksStr !== '[]') {
                    const localData = JSON.parse(localLinksStr);
                    if (localData.length > 0) {
                        for (let l of localData) {
                            setDoc(doc(db, "quick_links", l.id), l);
                        }
                        localStorage.removeItem('spo_quick_links');
                        window.showToast("Local quick links synced to cloud!", "success");
                    }
                }

                localStorage.setItem('spo_quick_links', JSON.stringify(tempQuickLinks));
                window.quickLinks = tempQuickLinks;
                window.renderQuickLinks();
            }, (error) => {
                console.error("Quick Links Error:", error);
            });

            onSnapshot(collection(db, "notifications"), (snapshot) => {
                let tempNotifs = [];
                snapshot.forEach((doc) => {
                    tempNotifs.push(doc.data());
                });
                window.notifications = tempNotifs;
    localStorage.setItem('spo_notifications', JSON.stringify(tempNotifs));
    window.renderNotificationsDropdown();
            });

            onSnapshot(collection(db, "pd_requests"), (snapshot) => {
                let tempPdRequests = [];
                snapshot.forEach((doc) => {
                    tempPdRequests.push(doc.data());
                });

                localStorage.setItem('spo_pd_requests', JSON.stringify(tempPdRequests));
                window.pdRequests = tempPdRequests;
                if (window.currentView === 'prize_distribution' && window.renderPDRequestsTable) {
                    window.renderPDRequestsTable();
                }
            }, (error) => {
                console.error("PD Requests Error:", error);
            });

            onSnapshot(collection(db, "cw_requests"), (snapshot) => {
                let tempCwRequests = [];
                snapshot.forEach((doc) => {
                    tempCwRequests.push(doc.data());
                });

                localStorage.setItem('spo_cw_requests', JSON.stringify(tempCwRequests));
                window.cwRequests = tempCwRequests;
                if (window.currentView === 'content_writer' && window.renderCWRequestsTable) {
                    window.renderCWRequestsTable();
                }
            }, (error) => {
                console.error("CW Requests Error:", error);
            });

            onSnapshot(collection(db, "pin_requests"), (snapshot) => {
                let tempPinRequests = [];
                snapshot.forEach((doc) => {
                    tempPinRequests.push(doc.data());
                });

                localStorage.setItem('spo_pin_requests', JSON.stringify(tempPinRequests));
                window.pinRequests = tempPinRequests;
                if (window.currentView === 'pin_request' && window.renderPinRequestsTable) {
                    window.renderPinRequestsTable();
                }
            }, (error) => {
                console.error("Pin Requests Error:", error);
            });

            onSnapshot(doc(db, "settings", "budgetSettings"), (docSnap) => {
                if (docSnap.exists()) {
                    window.budgetSettings = { ...window.budgetSettings, ...docSnap.data() };
                    const currInput = document.getElementById('setting-budget-currency');
                    if (currInput) currInput.value = window.budgetSettings.currency;
                    updateCurrencySymbols();
                    if (window.renderUI) window.renderUI();
                }
            });
            onSnapshot(doc(db, "settings", "adminPOCs"), (docSnap) => {
                if (docSnap.exists()) {
                    const pocs = docSnap.data();
                    localStorage.setItem('spo_admin_pocs', JSON.stringify(pocs));
                    if (window.currentView === 'settings' && window.isAdminModeEnabled && window.renderAdminPOCSettings) {
                        window.renderAdminPOCSettings();
                    }
                }
            });


            onSnapshot(collection(db, "events"), (snapshot) => {
                let tempEvents = [];
                snapshot.forEach((doc) => {
                    let e = doc.data();
                    if (!e.startDate) e.startDate = e.date || window.getPHDateStr();
                    if (!e.endDate) e.endDate = e.date || window.getPHDateStr();
                    e.status = window.calculateStatus(e.startDate, e.endDate);

                    if (!e.fields) e.fields = { ...defaultFields };

                    if (typeof e.fields.hashtags === 'string') e.fields.hashtags = e.fields.hashtags ? [e.fields.hashtags] : [];

                    // Migrate legacy 'document' string field into 'documents' array
                    if (!Array.isArray(e.fields.documents)) e.fields.documents = [];
                    if (e.fields.document && typeof e.fields.document === 'string' && e.fields.document.trim() !== '') {
                        if (e.fields.documents.length === 0) {
                            e.fields.documents.push({ type: 'Legacy Document', url: e.fields.document });
                        }
                        // Delete the old field so we don't migrate it again if we save back
                        delete e.fields.document;
                    }

                    if (e.fields.postMortemReport && typeof e.fields.postMortemReport === 'string' && e.fields.postMortemReport.trim() !== '') {
                        const hasPostMortem = e.fields.documents.some(d => d.type === 'Post-Mortem Report' && d.url === e.fields.postMortemReport);
                        if (!hasPostMortem) {
                            e.fields.documents.push({ type: 'Post-Mortem Report', url: e.fields.postMortemReport });
                        }
                        delete e.fields.postMortemReport;
                    }

                    e.progress = window.calcProgress(e);
                    tempEvents.push(e);
                });



                localStorage.setItem('spo_content_calendar_events', JSON.stringify(tempEvents));
                window.events = tempEvents;
                if (window.renderUI) window.renderUI();
                if (window.updateCampaignDropdown) window.updateCampaignDropdown();

                if (window.currentDrawerTaskId) {
                    const t = window.events.find(ev => ev.id === window.currentDrawerTaskId);
                    const iType = t ? (t.itemType || (t.isEventOnly ? 'event' : 'task')) : null;
                    if(t && iType === 'task') {
                        window.updateDrawerProgressUI(t);
                        window.renderDrawerChecklist(t);
                    }
                }
            }, (error) => {
                console.error("Events Error:", error);
                window.showToast("Database connection failed.", "error");
            });


            onSnapshot(collection(db, "sms_requests"), (snapshot) => {
                let tempSMS = [];
                snapshot.forEach((doc) => { tempSMS.push(doc.data()); });

                localStorage.setItem('spo_sms_requests', JSON.stringify(tempSMS));
                window.smsRequests = tempSMS;
                if (window.currentView === 'sms' && window.renderSMSTable) {
                    window.renderSMSTable();
                }
            });

            onSnapshot(collection(db, "budgets"), (snapshot) => {
                let tempBudgets = [];
                snapshot.forEach((doc) => tempBudgets.push(doc.data()));



                localStorage.setItem('spo_budget_data', JSON.stringify(tempBudgets));
                window.budgets = tempBudgets;
                updateBudgetOwnerDropdown();
                if (window.renderUI) window.renderUI();
            });
        }



        window.renderCampaignDetails = (taskId) => {
            const contentArea = document.getElementById('campaign-content-area');
            const emptyState = document.getElementById('campaign-empty-state');

            if (!taskId) {
                contentArea.classList.add('hidden');
                contentArea.classList.remove('grid');
                emptyState.style.display = 'block';
                return;
            }

            const task = window.events.find(e => e.id === taskId);
            if (!task) return;

            contentArea.classList.remove('hidden');
            contentArea.classList.add('grid');
            emptyState.style.display = 'none';

            window.currentCampaignPosts = task.fields.postIds || [];
            window.currentCarouselIndex = 0;

            window.renderCampaignCarousel();
            window.renderCampaignRightSide(task);
            window.renderCampaignPerformance();
        };

        window.getGeneratedPostLink = (idStr) => {
            if (!idStr) return '#';
            idStr = idStr.trim();
            if (idStr.startsWith('http://') || idStr.startsWith('https://')) {
                return idStr;
            }
            return `https://bingoplus.com/community/Detail?id=${idStr}&type=Feed`;
        };

        window.renderCampaignCarousel = () => {
            const container = document.getElementById('campaign-carousel-container');
            const counter = document.getElementById('carousel-counter');
            if(!container) return;

            if (window.currentCampaignPosts.length === 0) {
                container.innerHTML = `
                    <div class="text-gray-400 dark:text-slate-500 flex flex-col items-center">
                        <i class="fa-regular fa-image text-4xl mb-2"></i>
                        <p class="text-sm">No Post IDs/Visuals added to this task.</p>
                    </div>
                `;
                counter.innerText = '0 / 0';
                return;
            }

            const post = window.currentCampaignPosts[window.currentCarouselIndex];
            counter.innerText = `${window.currentCarouselIndex + 1} / ${window.currentCampaignPosts.length}`;

            const link = window.getGeneratedPostLink(post.id);
            const hasImg = post.imgUrl && window.isValidURL(post.imgUrl);

            let html = `
                <div class="w-full flex flex-col items-center h-full justify-center pb-4">
                    <div class="w-full max-w-md aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 relative shadow-inner">
                        ${hasImg ? `<img src="${post.imgUrl}" class="w-full h-full object-cover" alt="Post Visual">` : `<i class="fa-solid fa-image text-6xl text-gray-300"></i>`}

                        ${window.currentCampaignPosts.length > 1 ? `
                            <button onclick="window.changeCarouselSlide(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/90 hover:bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                            <button onclick="window.changeCarouselSlide(1)" class="absolute right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800/90 hover:bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
                        ` : ''}
                    </div>

                    <div class="w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-200/50">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">${post.type || 'Platform'}</span>
                            <span class="text-sm text-gray-500 dark:text-slate-400 font-mono">${post.id || 'No ID'}</span>
                        </div>
                        <a href="${link}" target="_blank" class="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md shadow-slate-200/50 text-white bg-primary-600 hover:bg-primary-700 transition-colors ${!post.id ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}">
                            <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i> Visit Live Post
                        </a>
                    </div>

                    ${window.currentCampaignPosts.length > 1 ? `
                        <div class="flex space-x-1.5 mt-5">
                            ${window.currentCampaignPosts.map((_, i) => `
                                <button onclick="window.goToCarouselSlide(${i})" class="w-2.5 h-2.5 rounded-full transition-colors ${i === window.currentCarouselIndex ? 'bg-primary-600' : 'bg-gray-300 hover:bg-gray-400'}"></button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            container.innerHTML = html;
        };

        window.changeCarouselSlide = (dir) => {
            window.currentCarouselIndex += dir;
            if (window.currentCarouselIndex < 0) window.currentCarouselIndex = window.currentCampaignPosts.length - 1;
            if (window.currentCarouselIndex >= window.currentCampaignPosts.length) window.currentCarouselIndex = 0;
            window.renderCampaignCarousel();
            window.renderCampaignPerformance();
        };

        window.goToCarouselSlide = (idx) => {
            window.currentCarouselIndex = idx;
            window.renderCampaignCarousel();
            window.renderCampaignPerformance();
        };

        window.renderCampaignRightSide = (task) => {
            const container = document.getElementById('campaign-stats-container');
            if(!container) return;

            const pFormatted = (task.progress || 0).toFixed(2);
            const assignsStr = (task.assignees && task.assignees.length > 0) ? task.assignees.join(', ') : 'Unassigned';

            const fields = task.fields || {};
            const operations = [
                { key: 'gameReview', label: 'Game Review' },
                { key: 'dailyTask', label: 'Daily Task' },
                { key: 'contentWriters', label: 'Content Writers' },
                { key: 'imChannels', label: 'IM Channels' },
                { key: 'trackableLinks', label: 'Trackable Links' },
                { key: 'sms', label: 'SMS' },
                { key: 'postPinned', label: 'Post Pinned' },
                { key: 'rewardDistributed', label: 'Reward Distributed' },
                { key: 'rewardsBanner', label: 'Rewards Banner' }
            ];

            let opsHtml = operations.map(op => {
                const val = fields[op.key] || 'Pending';
                let color = 'text-gray-500 dark:text-slate-400';
                let icon = 'fa-circle text-[8px]';
                if (val === 'Yes') { color = 'text-emerald-600 dark:text-emerald-400'; icon = 'fa-check'; }
                if (val === 'N/A') { color = 'text-gray-400 dark:text-slate-500', 'dark:text-slate-500'; icon = 'fa-minus'; }
                return `<div class="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"><span class="text-sm text-gray-600 dark:text-slate-400">${op.label}</span><span class="text-xs font-medium ${color}"><i class="fa-solid ${icon} mr-1.5"></i>${val}</span></div>`;
            }).join('');

            container.innerHTML = `
                <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg flex justify-between items-center">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white"><i class="fa-solid fa-chart-bar mr-2 text-emerald-500"></i>Execution Summary</h4>
                </div>
                <div class="p-5 flex-1 overflow-y-auto space-y-6">
                    <div>
                        <div class="flex justify-between items-end mb-1">
                            <span class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Overall Progress</span>
                            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">${pFormatted}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2">
                            <div class="bg-primary-600 h-2 rounded-full" style="width: ${task.progress || 0}%"></div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Timeline</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">${task.startDate} to ${task.endDate}</span>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Status</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${task.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-800'}">${task.status}</span>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span class="block text-xs text-gray-500 dark:text-slate-400 mb-1">Team Assigned</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">${assignsStr}</span>
                        </div>
                    </div>

                    <div>
                        <span class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4">Operations Checklist</span>
                        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 shadow-md shadow-slate-200/50">
                            ${opsHtml}
                        </div>
                    </div>
                </div>
            `;
        };

        window.renderCampaignPerformance = () => {
            const container = document.getElementById('campaign-performance-container');
            if (!container) return;

            if (window.currentCampaignPosts.length === 0) {
                container.innerHTML = `
                    <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg flex justify-between items-center">
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white"><i class="fa-solid fa-chart-line mr-2 text-blue-500"></i>Post Performance</h4>
                    </div>
                    <div class="p-5 flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 text-center">
                        <i class="fa-solid fa-chart-area text-4xl mb-3 text-gray-300"></i>
                        <p class="text-sm">Add a Post ID to view performance data.</p>
                    </div>
                `;
                return;
            }

            const post = window.currentCampaignPosts[window.currentCarouselIndex];
            const postIdDisplay = post.id || 'Pending ID';

            container.innerHTML = `
                <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-lg flex justify-between items-center">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white"><i class="fa-solid fa-chart-line mr-2 text-blue-500"></i>Post Performance</h4>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">Beta</span>
                </div>
                <div class="p-5 flex-1 overflow-y-auto space-y-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Metrics For</span>
                        <span class="text-xs font-mono text-gray-700 dark:text-slate-300 bg-slate-100 px-2 py-1 rounded truncate max-w-[120px]" title="${postIdDisplay}">${postIdDisplay}</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md shadow-slate-200/50 relative overflow-hidden">
                        <div class="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                        <span class="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Reach</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md shadow-slate-200/50 relative overflow-hidden">
                        <div class="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
                        <span class="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Engagements</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md shadow-slate-200/50 relative overflow-hidden">
                        <div class="absolute right-0 top-0 h-full w-1 bg-amber-500"></div>
                        <span class="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Link Clicks</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">--</span>
                    </div>

                    <div class="mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                        <i class="fa-solid fa-wand-magic-sparkles text-primary-400 text-2xl mb-3"></i>
                        <p class="text-xs text-gray-500 dark:text-slate-400 font-medium">Live API syncing for platform metrics is currently under development.</p>
                    </div>
                </div>
            `;
        };



        window.changeGameMonth = (dir) => {
            window.currentMonth += dir;
            if (window.currentMonth < 0) {
                window.currentMonth = 11;
                window.currentYear--;
            } else if (window.currentMonth > 11) {
                window.currentMonth = 0;
                window.currentYear++;
            }
            localStorage.setItem('spo_current_month', window.currentMonth);
            localStorage.setItem('spo_current_year', window.currentYear);
            window.renderGameCards();
        };

        window.resetGameMonth = () => {
            const ph = window.getPHParts();
            window.currentMonth = ph.month - 1;
            window.currentYear = ph.year;
            localStorage.setItem('spo_current_month', window.currentMonth);
            localStorage.setItem('spo_current_year', window.currentYear);
            window.renderGameCards();
        };

        window.renderGameCards = () => {
            const container = document.getElementById('game-cards-container');
            const monthLabel = document.getElementById('new-games-month-label');
            if (!container) return;

            const monthStr = window.getCurrentMonthStr();
            const date = new Date(window.currentYear, window.currentMonth, 1);
            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (monthLabel) {
                monthLabel.innerText = `Showing games for ${monthName}`;
            }

            const gamesOnly = window.events.filter(e => {
                const iType = e.itemType || (e.isEventOnly ? 'event' : 'task');
                if (iType !== 'game') return false;

                // Filter by month
                if (e.startDate && e.startDate.startsWith(monthStr)) return true;
                if (e.endDate && e.endDate.startsWith(monthStr)) return true;

                // Also show games that span across the month
                if (e.startDate && e.endDate) {
                    if (e.startDate < monthStr + "-01" && e.endDate > monthStr + "-31") return true;
                }

                return false;
            });

            gamesOnly.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first

            if (gamesOnly.length === 0) {
                container.innerHTML = `<div class="col-span-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400">
                    <i class="fa-solid fa-gamepad text-3xl mb-2 text-gray-400 dark:text-slate-500"></i>
                    <p class="text-sm font-medium">No new games found for this month.</p>
                </div>`;
                return;
            }

            let cardsHtml = '';
            gamesOnly.forEach(g => {
                const pFormatted = (g.progress || 0).toFixed(0);
                const isActive = window.currentGameId === g.id;
                const borderClass = isActive ? 'border-primary-500 ring-2 ring-primary-200' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300';

                const hasCustomBanner = g.bannerUrl && window.isValidURL(g.bannerUrl);
                const hasLegacyBanner = g.fields && g.fields.postIds && g.fields.postIds[0] && g.fields.postIds[0].imgUrl && window.isValidURL(g.fields.postIds[0].imgUrl);
                let bannerStyle = 'background: linear-gradient(to right, #6366f1, #a855f7);';
                if (hasCustomBanner) {
                    bannerStyle = `background-image: url('${g.bannerUrl}'); background-size: cover; background-position: center;`;
                } else if (hasLegacyBanner) {
                    bannerStyle = `background-image: url('${g.fields.postIds[0].imgUrl}'); background-size: cover; background-position: center;`;
                }


                const launchDate = g.officialLaunchDate;
                const status = launchDate ? 'Launched' : 'Upcoming';
                const displayDate = launchDate ? launchDate : g.startDate.split(' ')[0];
                const statusColor = launchDate ? 'text-emerald-500' : 'text-amber-500';
cardsHtml += `
                    <div onclick="event.stopPropagation(); window.renderGameDetails('${g.id}')" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border ${borderClass} overflow-hidden flex flex-col">
                        <div class="h-[18rem] w-full relative" style="${bannerStyle}">
                        </div>
                        <div class="px-4 pb-5 relative flex-1 flex flex-col items-center">
                            <div class="w-24 h-24 bg-white dark:bg-slate-800 border-4 border-white shadow-md rounded-2xl flex items-center justify-center -mt-12 mb-3 z-10 overflow-hidden relative">
                                ${g.iconUrl ? `<img src="${g.iconUrl}" class="w-full h-full object-cover relative z-20" alt="Icon">` : `<i class="fa-solid fa-gamepad text-3xl text-primary-500 absolute"></i>`}
                            </div>
                            <h4 class="font-bold text-gray-900 dark:text-white text-lg mb-1 text-center w-full truncate" title="${g.title}">${g.title}</h4>
                            <p class="text-sm font-medium ${statusColor} text-center mb-1">${status}</p>
                            <p class="text-xs text-gray-500 dark:text-slate-400 text-center">${displayDate}</p>
                        </div>
                    </div>
                `;

            });

            container.innerHTML = cardsHtml;
        };

        // Game Settings Drawer Logic
        window.openGameDrawer = function(event) {
            document.getElementById('game-drawer-id').value = event.id;
            document.getElementById('game-drawer-title').textContent = event.title || 'Game Settings';

            // Populate fields
            document.getElementById('game-drawer-icon').value = event.iconUrl || '';
            document.getElementById('game-drawer-banner').value = event.bannerUrl || '';

            // Format datetime-local (YYYY-MM-DDTHH:MM:SS) if exists
            let launchDate = '';
            if (event.officialLaunchDate) {
                try {
                    launchDate = event.officialLaunchDate.replace(' ', 'T');
                } catch(e){}
            }
            document.getElementById('game-drawer-launch').value = launchDate;

            // Show drawer
            const overlay = document.getElementById('game-drawer-overlay');
            const drawer = document.getElementById('game-drawer');
            overlay.classList.remove('hidden');
            // small delay for transition
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                drawer.classList.remove('translate-x-full');
            }, 10);
        };

        window.closeGameDrawer = function() {
            const overlay = document.getElementById('game-drawer-overlay');
            const drawer = document.getElementById('game-drawer');

            overlay.classList.add('opacity-0');
            drawer.classList.add('translate-x-full');

            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        };

        window.saveGameDrawer = async function() {
            const id = document.getElementById('game-drawer-id').value;
            const iconUrl = document.getElementById('game-drawer-icon').value.trim();
            const bannerUrl = document.getElementById('game-drawer-banner').value.trim();
            const launchInput = document.getElementById('game-drawer-launch').value;

            let officialLaunchDate = '';
            if(launchInput) {
                officialLaunchDate = launchInput.replace('T', ' ');
            }

            try {
                if (!db) { throw new Error("Firebase DB not initialized."); }

                const eventRef = doc(db, 'events', id);
                await setDoc(eventRef, {
                    iconUrl: iconUrl,
                    bannerUrl: bannerUrl,
                    officialLaunchDate: officialLaunchDate
                }, { merge: true });

                // Update local memory so UI changes instantly
                const evtIndex = window.events.findIndex(e => String(e.id) === String(id));
                if (evtIndex > -1) {
                    window.events[evtIndex].iconUrl = iconUrl;
                    window.events[evtIndex].bannerUrl = bannerUrl;
                    window.events[evtIndex].officialLaunchDate = officialLaunchDate;
                }

                window.showToast('Game Settings updated successfully!', 'success');
                window.closeGameDrawer();

                // Re-render cards to show updated images
                if (window.location.hash === '#/new-games') {
                    setTimeout(() => window.renderGameCards(), 100);
                }
            } catch (error) {
                console.error("Error saving game settings:", error);
                window.showToast('Error saving game settings.', 'error');
            }
        };


        window.renderGameDetails = function(gameId) {
            const event = window.events.find(e => String(e.id) === String(gameId)) || window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) {
                console.error("Game event not found for id:", gameId);
                return;
            }
            if (typeof window.openGameDrawer === 'function') {
                window.openGameDrawer(event);
            } else {
                console.error("window.openGameDrawer is not defined");
            }
        };



        window.changeGameCarouselSlide = (dir) => {
            window.currentCarouselIndex += dir;
            if (window.currentCarouselIndex < 0) window.currentCarouselIndex = window.currentGamePosts.length - 1;
            if (window.currentCarouselIndex >= window.currentGamePosts.length) window.currentCarouselIndex = 0;
            window.renderGameCarousel();
            window.renderGamePerformance();
        };





        window.migrateLocalData = async () => {
            if(!confirm("This will upload all tasks and budgets saved locally on this browser to your Firebase Cloud Database. Do you want to proceed?")) return;

            if (!db) {
                window.showToast("Firebase is not connected.", "error");
                return;
            }

            const localEvents = JSON.parse(localStorage.getItem('spo_content_calendar_events') || '[]');
            const localBudgets = JSON.parse(localStorage.getItem('spo_budget_data') || '[]');
            const localSettings = JSON.parse(localStorage.getItem('spo_budget_settings') || '{}');
            const localDailyTasks = JSON.parse(localStorage.getItem('spo_daily_tasks') || '[]');
            const localPinRequests = JSON.parse(localStorage.getItem('spo_pin_requests') || '[]');
            const localCwRequests = JSON.parse(localStorage.getItem('spo_cw_requests') || '[]');
            const localPdRequests = JSON.parse(localStorage.getItem('spo_pd_requests') || '[]');

            if (localEvents.length === 0 && localBudgets.length === 0 && localDailyTasks.length === 0 && localPinRequests.length === 0 && localCwRequests.length === 0 && localPdRequests.length === 0) {
                window.showToast("No local data found on this computer to migrate.", "info");
                return;
            }

            window.showToast("Migrating data to cloud... Please wait.", "info");

            try {
                for (let e of localEvents) { await setDoc(doc(db, "events", e.id), e); }
                for (let b of localBudgets) { await setDoc(doc(db, "budgets", b.id), b); }
                for (let t of localDailyTasks) { await setDoc(doc(db, "daily_tasks", t.id), t); }
                for (let p of localPinRequests) { await setDoc(doc(db, "pin_requests", p.id), p); }
                for (let c of localCwRequests) { await setDoc(doc(db, "cw_requests", c.id), c); }
                for (let p of localPdRequests) { await setDoc(doc(db, "pd_requests", p.id), p); }
                if (Object.keys(localSettings).length > 0) {
                    await setDoc(doc(db, "settings", "budgetSettings"), localSettings);
                }
                localStorage.removeItem('spo_content_calendar_events');
                localStorage.removeItem('spo_budget_data');
                localStorage.removeItem('spo_daily_tasks');
                localStorage.removeItem('spo_pin_requests');
                window.showToast("Local data successfully uploaded to Firebase Cloud!", "success");
            } catch (err) {
                console.error(err);
                window.showToast("Error migrating data to cloud. Check console for details.", "error");
            }
        };

        function setupTeamMembersUI() {
            const container = document.getElementById('assignee-checkboxes');
            const filterSelect = document.getElementById('assignee-filter-select');

            TEAM_MEMBERS.forEach(member => {
                const id = `chk-${member}`;
                if (container) {
                    container.innerHTML += `
                        <div class="flex items-center">
                            <input id="${id}" name="assignees" type="checkbox" value="${member}" class="h-4 w-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500 border-gray-300 dark:border-slate-600 rounded">
                            <label for="${id}" class="ml-2 block text-sm text-gray-700 dark:text-slate-300">${member}</label>
                        </div>
                    `;
                }
                if (filterSelect) {
                    filterSelect.innerHTML += `<option value="${member}">${member}</option>`;
                }
            });
        }

        window.setGlobalTypeFilter = (val) => {
            window.globalTypeFilter = val;
            localStorage.setItem('spo_global_type_filter', val);
            if (window.renderUI) window.renderUI();
        }

        window.setGlobalCategoryFilter = (val) => {
            window.globalCategoryFilter = val;
            localStorage.setItem('spo_global_category_filter', val);
            if (window.renderUI) window.renderUI();
        }

        window.filterEventsByGlobalCategory = (eventList) => {
            let filteredList = eventList;
            if (window.globalCategoryFilter !== 'All') {
                filteredList = filteredList.filter(e => e.campaignType === window.globalCategoryFilter);
            }
            if (window.globalTypeFilter !== 'All') {
                filteredList = filteredList.filter(e => {
                    const itemType = e.itemType || (e.isEventOnly ? 'event' : 'task');
                    return itemType === window.globalTypeFilter;
                });
            }
            return filteredList;
        }

        function updateCurrencySymbols() {
            const sym = window.budgetSettings.currency === 'PHP' ? '₱' : '$';
            const s1 = document.getElementById('curr-symbol-1');
            const s2 = document.getElementById('curr-symbol-2');
            if(s1) s1.innerText = sym;
            if(s2) s2.innerText = sym;
        }

        window.saveBudgetSettings = async () => {
            const limitInput = document.getElementById('setting-budget-limit');
            const currInput = document.getElementById('setting-budget-currency');
            const targetMonth = document.getElementById('setting-budget-month').value;

            window.budgetSettings.limits[targetMonth] = parseFloat(limitInput.value) || 0;
            window.budgetSettings.currency = currInput.value;

            if (!db) {
                localStorage.setItem('spo_budget_settings', JSON.stringify(window.budgetSettings));
                window.showToast("Saved Locally", "success");
                updateCurrencySymbols();
                if (window.renderUI) window.renderUI();
                return;
            }

            try {
                await setDoc(doc(db, "settings", "budgetSettings"), window.budgetSettings);
                window.showToast("Budget settings saved", "success");
            } catch(e) {
                console.error(e);
                window.showToast("Failed to save settings", "error");
            }
        }

        window.syncBudgetMonth = (val) => {
            if (val) {
                const parts = val.split('-');
                window.currentYear = parseInt(parts[0]);
                window.currentMonth = parseInt(parts[1]) - 1;
                if (window.renderUI) window.renderUI();
            }
        }

        function updateBudgetOwnerDropdown() {
            const ownerSelect = document.getElementById('budget-filter-owner');
            if (!ownerSelect) return;

            const currentVal = window.budgetFilterOwner;
            let options = `<option value="All">All Owners</option>`;

            const owners = [...new Set(window.budgets.map(b => (b.owner || '').trim()).filter(o => o !== ''))].sort();
            owners.forEach(o => {
                options += `<option value="${o}">${o}</option>`;
            });
            ownerSelect.innerHTML = options;

            if (owners.includes(currentVal) || currentVal === 'All') {
                ownerSelect.value = currentVal;
            } else {
                ownerSelect.value = 'All';
                window.budgetFilterOwner = 'All';
            }
        }

        window.formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-PH', { style: 'currency', currency: window.budgetSettings.currency }).format(amount || 0);
        }

        window.calcProgress = (evt) => {
            const itemType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
            if (itemType === 'event' || itemType === 'game') return 0;

            const fields = evt.fields || {};
            let completed = 0;
            const totalItems = 13;

            if (Array.isArray(fields.documents) && fields.documents.some(d => window.isValidURL(d.url))) completed++;

            if (Array.isArray(fields.hashtags) && fields.hashtags.length > 0) completed++;
            if (Array.isArray(fields.postIds) && fields.postIds.some(p => p.id && p.id.trim() !== '')) completed++;

            if (fields.ignoreListed) completed++;


            const dropdownFields = [
                'gameReview', 'contentWriters', 'imChannels', 'trackableLinks',
                'dailyTask',
                'sms', 'postPinned', 'rewardDistributed', 'rewardsBanner'
            ];

            dropdownFields.forEach(key => {
                if (fields[key] === 'Yes' || fields[key] === 'N/A') completed++;
            });



            return (completed / totalItems) * 100;
        }

        window.syncEventToFirestore = async (task) => {
    let oldTask = window.events.find(e => e.id === task.id);
    if (oldTask && oldTask.progress !== task.progress) {
        if (task.requestor && task.requestor !== window.currentUserProfile) {
            window.logNotification(`Task "${task.title}" progress was updated to ${task.progress}% by ${window.currentUserProfile}`, task.requestor, 'tasks', task.id);
        }
        if (task.owner && task.owner !== window.currentUserProfile && task.owner !== task.requestor) {
            window.logNotification(`Task "${task.title}" progress was updated to ${task.progress}% by ${window.currentUserProfile}`, task.owner, 'tasks', task.id);
        }
    }
    const idx = window.events.findIndex(e => e.id === task.id);
            if (idx > -1) window.events[idx] = task;
            else window.events.push(task);
            localStorage.setItem('spo_content_calendar_events', JSON.stringify(window.events));

            if (!db) return;
            try {
                await setDoc(doc(db, "events", task.id), task);
            } catch(e) {
                console.error(e);
            }
        }

        window.deleteTask = (id) => {
            if (!id) return;
            if (confirm('Are you sure you want to delete this event/task?')) {
                window.events = window.events.filter(evt => evt.id !== id);
                window.saveToLocalStorage();
                window.closeAddModal();
                window.renderCalendar();
                window.renderTasksList();
                window.renderOngoingEvents();
                window.showToast("Deleted successfully", "success");
            }
        };

        window.saveEvent = async (e) => {
            e.preventDefault();
            const form = document.getElementById('event-form');
            if (!form.reportValidity()) return;

            const itemType = document.getElementById('event-item-type').value;
            const isNonTask = (itemType === 'event' || itemType === 'game');

            const id = document.getElementById('event-id').value;
            const title = document.getElementById('event-title').value.trim();
            const startDate = document.getElementById('event-start-date').value;
            let endDate = document.getElementById('event-end-date').value;
            const imageLink = document.getElementById('event-image-link').value.trim();

            if (itemType === 'game') {
                endDate = startDate;
            }

            const documentLink = document.getElementById('event-document-link').value.trim();

            let campaignType = isNonTask ? 'All' : document.getElementById('event-campaign-type').value;

            if (endDate < startDate) {
                window.showToast("End date cannot be before start date", "error");
                return;
            }

            const assignees = [];
            if (!isNonTask) {
                document.querySelectorAll('input[name="assignees"]:checked').forEach(cb => assignees.push(cb.value));
                if (assignees.length === 0) {
                    window.showToast("Assignees cannot be blank. Please select at least one.", "error");
                    return;
                }
            }

            const status = window.calculateStatus(startDate, endDate);
            const existingEvent = window.events.find(ev => ev.id === id);
            const fieldsToSave = existingEvent ? existingEvent.fields : { ...defaultFields, hashtags: [] };

            if (itemType === 'task') {
                if (!Array.isArray(fieldsToSave.documents)) fieldsToSave.documents = [];
                if (fieldsToSave.documents.length === 0) {
                    if (documentLink) {
                        fieldsToSave.documents.push({ type: 'Main Document', url: documentLink });
                    }
                } else {
                    if (documentLink) {
                        fieldsToSave.documents[0].url = documentLink;
                    }
                }
            }



            const tempEventForCalc = { itemType, startDate, endDate, fields: fieldsToSave, isEventOnly: itemType === 'event' };
            const progress = window.calcProgress(tempEventForCalc);

            const eventId = id ? id : Date.now().toString();
            const eventData = {
                id: eventId,
                itemType: itemType,
                isEventOnly: itemType === 'event',
                title,
                startDate,
                endDate,
                campaignType,
                status,
                assignees,
                fields: fieldsToSave,
                progress: progress,
                updatedAt: window.getPHIsoString()
            };
            if (itemType === 'event') {
                eventData.imageLink = imageLink;
            }

            if (!id) {
                eventData.CreatedTime = window.getFormattedCreatedTime();
            } else if (existingEvent && existingEvent.CreatedTime) {
                eventData.CreatedTime = existingEvent.CreatedTime;
            } else {
                eventData.CreatedTime = window.getFormattedCreatedTime();
            }

            const btn = document.getElementById('save-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                await window.syncEventToFirestore(eventData);
                window.showToast(id ? "Item updated" : "Item created", "success");
                window.closeAddModal();
                if (window.renderUI) window.renderUI();
            } catch (err) {
                console.error("Save Event Error:", err);
            } finally {
                btn.innerHTML = 'Save';
                btn.disabled = false;
            }
        }

        window.deleteTask = async (id) => {
            window.events = window.events.filter(e => e.id !== id);
            localStorage.setItem('spo_content_calendar_events', JSON.stringify(window.events));

            if (db) {
                try { await deleteDoc(doc(db, "events", id)); }
                catch(e) {}
            }
            window.showToast("Item deleted", "success");
            window.closeAddModal();
            if (window.renderUI) window.renderUI();
        }

        window.triggerReminder = (id, title, assigneesStr) => {
            const task = window.events.find(ev => ev.id === id);
            if (task) {
                task.lastReminded = window.getPHIsoString();
                window.syncEventToFirestore(task);
                const names = assigneesStr ? assigneesStr : 'the team';
                window.showToast(`Reminder sent to ${names} for "${title}"!`, "success", "fa-bell");
            }
        }

        window.clearAllData = async () => {
            if(!confirm("Are you sure? This deletes ALL events globally from Firebase.")) return;
            localStorage.removeItem('spo_content_calendar_events');
            localStorage.removeItem('spo_daily_tasks');
            localStorage.removeItem('spo_quick_links');
            localStorage.removeItem('spo_pin_requests');

            if (db) {
                try {
                    window.events.forEach(e => deleteDoc(doc(db, "events", e.id)));
                    window.dailyTasks.forEach(t => deleteDoc(doc(db, "daily_tasks", t.id)));
                    window.quickLinks.forEach(l => deleteDoc(doc(db, "quick_links", l.id)));
                    window.pinRequests.forEach(p => deleteDoc(doc(db, "pin_requests", p.id)));
                    window.cwRequests.forEach(c => deleteDoc(doc(db, "cw_requests", c.id)));
                    window.pdRequests.forEach(p => deleteDoc(doc(db, "pd_requests", p.id)));
                } catch(err) {}
            }

            window.events = [];
            window.dailyTasks = [];
            window.quickLinks = [];
            window.pinRequests = [];
            window.cwRequests = [];
            window.pdRequests = [];

            window.showToast("Data clearing initiated", "success");
            if (window.renderUI) window.renderUI();
            window.renderQuickLinks();
        };

        window.clearAllBudgets = async () => {
            if(!confirm("Are you sure? This deletes ALL budget entries globally from Firebase.")) return;
            localStorage.removeItem('spo_budget_data');
            window.budgets = [];
            if (db) {
                try {
                    window.budgets.forEach(b => deleteDoc(doc(db, "budgets", b.id)));
                } catch(e){}
            }
            window.showToast("All budgets cleared", "success");
            if (window.renderUI) window.renderUI();
        };

        window.exportTasksExcel = () => {
            let filteredEvents = window.filterEventsByGlobalCategory(window.events).filter(evt => {
                const iType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
                if (iType === 'event' || iType === 'game') return false;

                const searchLower = window.searchQuery.toLowerCase();
                const matchesSearch = evt.title.toLowerCase().includes(searchLower) ||
                                      (evt.assignees || []).join(' ').toLowerCase().includes(searchLower);
                const matchesStatus = window.statusFilter === 'All' || evt.status === window.statusFilter;
                const matchesAssignee = window.assigneeFilter === 'All' || (evt.assignees || []).includes(window.assigneeFilter);
                return matchesSearch && matchesStatus && matchesAssignee;
            });


            const getRank = (status) => {
                if (status === 'Ongoing') return 3;
                if (status === 'Upcoming') return 2;
                return 1;
            };
            filteredEvents.forEach(e => {
                if(e.progress === undefined) e.progress = window.calcProgress(e);
            });
            filteredEvents = sortTableData(filteredEvents, window.sortCol, window.sortAsc, (row) => getRank(row.status));


            const data = filteredEvents.map(e => {
                const f = e.fields || {};
                const posts = (f.postIds || []).map(p => {
                    let s = `${p.type || 'N/A'}: ${p.id || 'N/A'}`;
                    if (p.imgUrl) s += ` (${p.imgUrl})`;
                    return s;
                }).join(' | ');

                return {
                    "Task Title": e.title || '',
                    "Start Date": e.startDate || '',
                    "End Date": e.endDate || '',
                    "Campaign Type": e.campaignType || '',
                    "Status": e.status || '',
                    "Assignees": (e.assignees || []).join(', '),
                    "Progress (%)": parseFloat((e.progress || 0).toFixed(2)),
                    "Created Time": e.CreatedTime || '',

                    "Documents": (f.documents || []).map(d => `${d.type || 'N/A'}: ${d.url || 'N/A'}`).join(' | '),

                    "Hashtags": (f.hashtags || []).join(', '),
                    "Post IDs": posts,

                    "Game Review": f.gameReview || 'Pending',
                    "Content Writers": f.contentWriters || 'Pending',
                    "IM Channels": f.imChannels || 'Pending',
                    "Trackable Links": f.trackableLinks || 'Pending',
                    "SMS": f.sms || 'Pending',
                    "Post Pinned": f.postPinned || 'Pending',
                    "Reward Distributed": f.rewardDistributed || 'Pending',
                    "Rewards Banner": f.rewardsBanner || 'Pending',
                    "Ignore Listed": f.ignoreListed ? 'Yes' : 'No',
                    "Daily Task": f.dailyTask || 'Pending'
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks & Progress");
            XLSX.writeFile(workbook, "SPO_Tasks_Export.xlsx");
        };

        window.exportBudgetExcel = () => {
            let currentBudgets = window.budgets && window.budgets.length > 0 ? window.budgets : JSON.parse(localStorage.getItem('spo_budget_data') || '[]');
            console.log("Current Budgets Count:", currentBudgets.length);
            let filteredBudgets = currentBudgets.filter(b => {
                const matchesSearch = (b.name || '').toLowerCase().includes(window.budgetSearchQuery.toLowerCase()) ||
                                      (b.owner || '').toLowerCase().includes(window.budgetSearchQuery.toLowerCase());
                const matchesMonth = !window.budgetFilterMonth || b.month === window.budgetFilterMonth || window.budgetFilterMonth === '';
                let bOwnerName = b.owner || '';
                try {
                    const o = JSON.parse(b.owner);
                    bOwnerName = o.name || o.username || bOwnerName;
                } catch(e) {}
                const matchesOwner = window.budgetFilterOwner === 'All' || bOwnerName.trim() === window.budgetFilterOwner;
                return matchesSearch && matchesMonth && matchesOwner;
            });


            filteredBudgets = sortTableData(filteredBudgets, window.budgetSortCol, window.budgetSortAsc);


            const data = filteredBudgets.map(b => {
                const alloc = parseFloat(b.allocated) || 0;
                const spent = parseFloat(b.spent) || 0;
                return {
                    "Created Time": b.CreatedTime || '',
                    "Month": b.month || '',
                    "Campaign / Project Name": b.name || '',
                    "Type": b.type || '',
                    "Owner": b.owner || '',
                    "Allocated Budget": alloc,
                    "Amount Spent": spent,
                    "Remaining Balance": alloc - spent
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Team Budget");
            XLSX.writeFile(workbook, "SPO_Budget_Export.xlsx");
        };


        // POC Setup for Admin Settings
        window.AVAILABLE_USERS = ['Freddy', 'Renee', 'Marco', 'Clarisse', 'Lim', 'Kenneth', 'Regena', 'Nami', 'Liezl', 'Zayn', 'Humphrey'];
        window.POC_MODULES = [
            { id: 'team_budget', name: 'Team Budget' },
            { id: 'daily_task', name: 'Daily Task' },
            { id: 'post_management', name: 'Post Management' },
            { id: 'sms', name: 'SMS' },
            { id: 'copy_writer', name: 'Copy Writer' },
            { id: 'prize_distribution', name: 'Prize Distribution' }
        ];



        window.handlePOCSelection = (checkbox, moduleId) => {
            const checkboxes = document.querySelectorAll(`input[name="poc_${moduleId}"]:checked`);
            if (checkboxes.length > 3) {
                alert(`You can only assign up to 3 Points of Contact for ${moduleId.replace('_', ' ')}.`);
                checkbox.checked = false;
            }
        };


        window.isCurrentUserPOC = (moduleId) => {
            if (window.currentUserProfile && typeof window.currentUserProfile === 'string' && window.currentUserProfile.includes('testuser')) return true;
            if (!window.currentUserProfile) return false;
            let savedPOCs = {};
            try {
                savedPOCs = JSON.parse(localStorage.getItem('spo_admin_pocs')) || {};
            } catch(e){}
            const pocs = savedPOCs[moduleId] || [];
            return pocs.includes(window.currentUserProfile);
        };

        window.saveAdminPOCs = async () => {
            const newPOCs = {};
            window.POC_MODULES.forEach(module => {
                const checkboxes = document.querySelectorAll(`input[name="poc_${module.id}"]:checked`);
                newPOCs[module.id] = Array.from(checkboxes).map(cb => cb.value);
            });
            localStorage.setItem('spo_admin_pocs', JSON.stringify(newPOCs));

            if (db) {
                try {
                    await setDoc(doc(db, "settings", "adminPOCs"), newPOCs);
                } catch(e) {
                    console.error("Error syncing POCs to Firestore", e);
                }
            }
            window.showToast('Points of Contact saved successfully.', 'success');
        };


        window.handleGlobalSearch = () => {
            const searchInput = document.getElementById('global-search');
            const resultsContainer = document.getElementById('global-search-results');
            const resultsList = document.getElementById('global-search-results-list');

            if (!searchInput || !resultsContainer || !resultsList) return;
            const val = searchInput.value.toLowerCase().trim();

            if (!val) {
                resultsContainer.classList.add('hidden');
                return;
            }

            let results = [];

            // Search Tasks/Events
            if (window.events) {
                window.events.forEach(t => {
                    if (t.title && t.title.toLowerCase().includes(val)) {
                        results.push({ type: 'Task/Event', icon: 'fa-tasks', title: t.title, id: t.id, action: `window.switchView('tasks'); setTimeout(() => window.openEditModal(window.events.find(e => e.id === '${t.id}')), 300);` });
                    }
                });
            }

            // Search Budget
            if (window.budgets) {
                window.budgets.forEach(b => {
                    if (b.name && b.name.toLowerCase().includes(val)) {
                        results.push({ type: 'Budget', icon: 'fa-wallet', title: b.name, id: b.id, action: `window.switchView('budget'); setTimeout(() => window.openBudgetDetails('${b.id}'), 300);` });
                    }
                });
            }

            // Search Daily Tasks
            if (window.dailyTasks) {
                window.dailyTasks.forEach(dt => {
                    if (dt.taskTitle && dt.taskTitle.toLowerCase().includes(val) || (dt.eventTitle && dt.eventTitle.toLowerCase().includes(val))) {
                        results.push({ type: 'Daily Task', icon: 'fa-clipboard-check', title: dt.taskTitle || dt.eventTitle, id: dt.id, action: `window.switchView('daily_task'); setTimeout(() => window.openDailyTaskDetails('${dt.id}'), 300);` });
                    }
                });
            }

            // Search Pin Requests
            if (window.pinRequests) {
                window.pinRequests.forEach(pr => {
                    if (pr.campaignName && pr.campaignName.toLowerCase().includes(val)) {
                        results.push({ type: 'Pin Request', icon: 'fa-thumbtack', title: pr.campaignName, id: pr.id, action: `window.switchView('pin_request'); setTimeout(() => window.openPinRequestDetails('${pr.id}'), 300);` });
                    }
                });
            }

            // Search SMS
            if (window.smsRequests) {
                window.smsRequests.forEach(s => {
                    if (s.campaignName && s.campaignName.toLowerCase().includes(val)) {
                        results.push({ type: 'SMS Request', icon: 'fa-comment-sms', title: s.campaignName, id: s.id, action: `window.switchView('sms'); setTimeout(() => window.openSMSDetails('${s.id}'), 300);` });
                    }
                });
            }

            // Search CW
            if (window.cwRequests) {
                window.cwRequests.forEach(cw => {
                    if (cw.campaignName && cw.campaignName.toLowerCase().includes(val)) {
                        results.push({ type: 'CW Request', icon: 'fa-pen-nib', title: cw.campaignName, id: cw.id, action: `window.switchView('content_writer'); setTimeout(() => window.openCWRequestDetails('${cw.id}'), 300);` });
                    }
                });
            }

            // Search PD
            if (window.pdRequests) {
                window.pdRequests.forEach(pd => {
                    if (pd.campaignName && pd.campaignName.toLowerCase().includes(val)) {
                        results.push({ type: 'PD Request', icon: 'fa-gift', title: pd.campaignName, id: pd.id, action: `window.switchView('prize_distribution'); setTimeout(() => window.openPDRequestDetails('${pd.id}'), 300);` });
                    }
                });
            }

            if (results.length === 0) {
                resultsList.innerHTML = `<div class="p-4 text-center text-sm text-gray-500 dark:text-slate-400">No results found for "${val}"</div>`;
            } else {
                // limit to 10 results
                const limited = results.slice(0, 10);
                resultsList.innerHTML = limited.map(r => {
                    const safeTitle = (r.title || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `
                    <div class="flex items-center px-4 py-3 hover:bg-slate-50 dark:bg-slate-900 cursor-pointer rounded-lg border-b border-gray-100 dark:border-slate-700 last:border-0" onclick="${r.action}; document.getElementById('global-search-results').classList.add('hidden'); document.getElementById('global-search').value = '';">
                        <div class="h-8 w-8 rounded-full bg-primary-50 dark:bg-primary-500/20 text-primary-500 flex items-center justify-center mr-3 shrink-0">
                            <i class="fa-solid ${r.icon} text-sm"></i>
                        </div>
                        <div class="flex flex-col overflow-hidden">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">${safeTitle}</span>
                            <span class="text-xs text-gray-500 dark:text-slate-400">${r.type}</span>
                        </div>
                    </div>
                    `;
                }).join('');

                if (results.length > 10) {
                    resultsList.innerHTML += `<div class="px-4 py-2 text-center text-xs text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700">Showing 10 of ${results.length} results. Please refine your search.</div>`;
                }
            }

            resultsContainer.classList.remove('hidden');
        };

        // Add click outside to close dropdown
        document.addEventListener('click', (e) => {
            const container = document.getElementById('global-search-results');
            const input = document.getElementById('global-search');
            if (container && input && !container.contains(e.target) && e.target !== input) {
                container.classList.add('hidden');
            }
        });


        window.activeViewControllerCleanup = null;

        window.switchView = async (viewName) => {
            window.currentView = viewName;
            localStorage.setItem('spo_active_view', viewName);

            if (window.location.hash !== '#' + viewName) {
                history.pushState(null, null, '#' + viewName);
            }

            const views = ['dashboard', 'tasks', 'budget', 'campaign', 'daily_task', 'pin_request', 'sms', 'content_writer', 'prize_distribution', 'settings'];
            views.forEach(v => {
                const nav = document.getElementById(`nav-${v}`);
                if(nav) {
                    const icon = nav.querySelector('i');
                    if (v === viewName) {
                        nav.classList.add('bg-primary-50', 'dark:bg-primary-500/20', 'text-primary-700');
                        nav.classList.remove('text-gray-600', 'dark:text-slate-400', 'hover:bg-slate-50', 'dark:hover:bg-slate-900', 'hover:text-gray-900', 'dark:text-white', 'dark:hover:text-white');
                        if(icon) {
                            icon.classList.add('text-primary-500');
                            icon.classList.remove('text-gray-400', 'dark:text-slate-500', 'group-hover:text-gray-500', 'dark:text-slate-400');
                        }
                    } else {
                        nav.classList.remove('bg-primary-50', 'dark:bg-primary-500/20', 'text-primary-700');
                        nav.classList.add('text-gray-600', 'dark:text-slate-400', 'hover:bg-slate-50', 'dark:hover:bg-slate-900', 'hover:text-gray-900', 'dark:text-white', 'dark:hover:text-white');
                        if(icon) {
                            icon.classList.remove('text-primary-500');
                            icon.classList.add('text-gray-400', 'dark:text-slate-500', 'group-hover:text-gray-500', 'dark:text-slate-400');
                        }
                    }
                }
            });

            if (typeof window.activeViewControllerCleanup === 'function') {
                window.activeViewControllerCleanup();
                window.activeViewControllerCleanup = null;
            }

            try {
                const res = await fetch(`views/${viewName}.html`);
                if (!res.ok) throw new Error("Could not load view");
                const html = await res.text();

                const container = document.getElementById('main-content-container');
                container.innerHTML = html;

                try {
                    const module = await import(`./views/${viewName}.js`);
                    if (module.init) {
                        window.activeViewControllerCleanup = module.init(container);
                    }
                } catch(e) {
                    // It should not fallback to old globals, the functions should be globally available or directly inside the controller
                    console.log("No explicit module controller for " + viewName, e);
                }

            } catch (err) {
                console.error(err);
                document.getElementById('main-content-container').innerHTML = `<div class="p-8 text-center text-red-500">Failed to load view.</div>`;
            }
        };

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                window.switchView(hash);
            }
        });










        window.setAssigneeFilter = (val) => {
            window.assigneeFilter = val;
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.setFilter = (val) => {
            window.statusFilter = val;
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.setSearch = (val) => {
            window.searchQuery = val;
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.handleSort = (col) => {
            if (window.sortCol === col) {
                window.sortAsc = !window.sortAsc;
            } else {
                window.sortCol = col;
                window.sortAsc = true;
            }
            if (window.renderTasksTable) window.renderTasksTable();
        };



        window.setBudgetOwnerFilter = (val) => {
            window.budgetFilterOwner = val;
            if (window.renderBudgetTable) window.renderBudgetTable();
        };

        window.setBudgetSearch = (val) => {
            window.budgetSearchQuery = val;
            if (window.renderBudgetTable) window.renderBudgetTable();
        }

        window.setBudgetMonthFilter = (val) => {
            window.budgetFilterMonth = val;
            if (window.renderBudgetTable) window.renderBudgetTable();
        }

        window.handleBudgetSort = (col) => {
            if (window.budgetSortCol === col) {
                window.budgetSortAsc = !window.budgetSortAsc;
            } else {
                window.budgetSortCol = col;
                window.budgetSortAsc = true;
            }
            if (window.renderBudgetTable) window.renderBudgetTable();
        }



        window.saveBudgetEntry = async (e) => {
            e.preventDefault();
            const form = document.getElementById('budget-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('budget-id').value;
            const month = document.getElementById('budget-month').value;
            const existingBudget = id ? window.budgets.find(b => b.id === id) : null;
            const owner = existingBudget && existingBudget.owner ? existingBudget.owner : (window.currentUserProfile || 'Unknown');
            const name = document.getElementById('budget-name').value.trim();
            const type = document.getElementById('budget-type').value;
            const allocated = document.getElementById('budget-allocated').value;

            // Gather items
            const itemEls = document.querySelectorAll('#budget-items-container > div');
            if(itemEls.length === 0) {
                window.showToast("At least one item is required", "error");
                return;
            }

            let items = [];
            itemEls.forEach(el => {
                const typeVal = el.querySelector('.budget-item-type').value;
                const amtVal = parseFloat(el.querySelector('.budget-item-amount').value) || 0;
                items.push({ type: typeVal, amount: amtVal });
            });

            const entryId = id ? id : Date.now().toString();
            const entryData = {
                id: entryId,
                name,
                type,
                owner,
                month,
                items: items,
                allocated: parseFloat(allocated),
                spent: 0
            };

            if (id) {
                entryData.editedBy = window.currentUserProfile || 'Unknown';
            }

            if (!id) {
                entryData.createdAt = window.getFormattedCreatedTime();
            } else {
                const existingBudget = window.budgets.find(b => b.id === id);
                if (existingBudget && existingBudget.createdAt) {
                    entryData.createdAt = existingBudget.createdAt;
                } else {
                    entryData.createdAt = window.getFormattedCreatedTime();
                }
            }

            const btn = document.getElementById('save-budget-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                // Update Local Storage Fallback Immediately
                const idx = window.budgets.findIndex(b => b.id === entryId);
                if (idx > -1) window.budgets[idx] = entryData;
                else window.budgets.push(entryData);
                localStorage.setItem('spo_budget_data', JSON.stringify(window.budgets));

                if (db) {
                    await setDoc(doc(db, "budgets", entryId), entryData);
                }

                window.showToast(id ? "Budget entry updated" : "Budget entry added", "success");
                window.closeBudgetModal();
                if (window.renderUI) window.renderUI();
            } catch(e) {
                window.showToast("Error saving budget", "error");
            } finally {
                btn.innerHTML = 'Save Entry';
                btn.disabled = false;
            }
        };




        window.budgetItems = [];
        window.addBudgetItem = (item = null) => {
            const container = document.getElementById('budget-items-container');
            const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

            const div = document.createElement('div');
            div.className = "flex space-x-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700";
            div.id = `budget-item-${itemId}`;

            const selType = item ? item.type : '';
            const valAmt = item ? item.amount : '';

            const budgetType = document.getElementById('budget-type').value;
            let typeInputHtml = '';

            if (budgetType === 'Campaign Expenses') {
                typeInputHtml = `<select class="budget-item-type block w-full border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2 sm:text-sm bg-white dark:bg-slate-800">
                    <option value="UGC Rewards" ${selType==='UGC Rewards'?'selected':''}>UGC Rewards</option>
                    <option value="SMS" ${selType==='SMS'?'selected':''}>SMS</option>
                    <option value="Daily Task" ${selType==='Daily Task'?'selected':''}>Daily Task</option>
                    <option value="Game Review" ${selType==='Game Review'?'selected':''}>Game Review</option>
                </select>`;
            } else {
                typeInputHtml = `<input type="text" class="budget-item-type block w-full border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2 sm:text-sm" placeholder="Expense Type" required value="${selType}">`;
            }

            div.innerHTML = `
                <div class="flex-1 budget-item-type-container">
                    ${typeInputHtml}
                </div>
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span class="text-gray-500 dark:text-slate-400 sm:text-xs">₱</span>
                    </div>
                    <input type="number" step="0.01" min="0" value="${valAmt}" placeholder="Amount" oninput="window.calcBudgetTotal()" required class="budget-item-amount block w-full pl-6 border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2 sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                </div>
                <button type="button" onclick="window.removeBudgetItem('${itemId}')" class="text-red-500 hover:text-red-700 p-1">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            container.appendChild(div);
            window.calcBudgetTotal();
        };

        window.removeBudgetItem = (itemId) => {
            const el = document.getElementById(`budget-item-${itemId}`);
            if(el) {
                el.remove();
                window.calcBudgetTotal();
            }
        };

        window.calcBudgetTotal = () => {
            const amounts = document.querySelectorAll('.budget-item-amount');
            let total = 0;
            amounts.forEach(input => {
                const val = parseFloat(input.value);
                if(!isNaN(val) && val > 0) total += val;
            });
            document.getElementById('budget-allocated-display').innerText = window.formatCurrency(total);
            document.getElementById('budget-allocated').value = total;
        };

        window.deleteBudgetEntry = async (id) => {
            window.budgets = window.budgets.filter(b => b.id !== id);
            localStorage.setItem('spo_budget_data', JSON.stringify(window.budgets));

            if (db) {
                try { await deleteDoc(doc(db, "budgets", id)); } catch(e) {}
            }
            window.showToast("Budget entry deleted", "success");
            if (window.renderUI) window.renderUI();
        };

        window.openBudgetModal = (id = null) => {
            document.getElementById('budget-form').reset();
            document.getElementById('budget-id').value = '';
            document.getElementById('budget-modal-title').innerText = 'Add Budget Entry';
            document.getElementById('budget-month').value = window.getCurrentMonthStr();
            document.getElementById('budget-type').value = 'Campaign Expenses';

            const container = document.getElementById('budget-items-container');
            container.innerHTML = '';

            if (id) {
                const b = window.budgets.find(x => x.id === id);
                if (b) {
                    document.getElementById('budget-id').value = b.id;
                    document.getElementById('budget-month').value = b.month || window.getCurrentMonthStr();

                    document.getElementById('budget-name').value = b.name;
                    if(b.type) document.getElementById('budget-type').value = b.type;
                    document.getElementById('budget-allocated').value = b.allocated;

                    if (b.items && b.items.length > 0) {
                        b.items.forEach(it => window.addBudgetItem(it));
                    } else {
                        // Fallback for old entries without items but with an allocated budget
                        window.addBudgetItem({ type: 'UGC Rewards', amount: b.allocated || 0 });
                    }

                    document.getElementById('budget-modal-title').innerText = 'Edit Budget Entry';
                }
            } else {
                window.addBudgetItem(); // add one empty item by default
            }
            window.calcBudgetTotal();

            document.getElementById('budget-modal').classList.remove('hidden');
        };


        window.openBudgetDetails = (id) => {
            const b = window.budgets.find(x => x.id === id);
            if (!b) return;

            document.getElementById('budget-details-name').innerText = b.name || '-';

            let monthStr = b.month || '-';
            if (b.month) {
                const parts = b.month.split('-');
                if(parts.length === 2) {
                    const date = new Date(parts[0], parseInt(parts[1])-1);
                    monthStr = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                }
            }
            document.getElementById('budget-details-month').innerText = monthStr;

            document.getElementById('budget-details-type').innerText = b.type || '-';
            document.getElementById('budget-details-created-at').innerText = b.createdAt || '-';
            document.getElementById('budget-details-owner').innerHTML = window.formatUserBadge ? window.formatUserBadge(b.owner) : b.owner;
            document.getElementById('budget-details-allocated').innerText = window.formatCurrency(b.allocated || 0);

            const ul = document.getElementById('budget-details-items-list');
            ul.innerHTML = '';
            if (b.items && b.items.length > 0) {
                b.items.forEach(it => {
                    const li = document.createElement('li');
                    li.className = 'px-4 py-3 flex justify-between items-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:bg-slate-900';
                    li.innerHTML = `<span class="font-medium text-gray-700 dark:text-slate-300">${it.type}</span><span class="text-primary-600 dark:text-primary-400 font-semibold">${window.formatCurrency(it.amount)}</span>`;
                    ul.appendChild(li);
                });
            } else {
                // fallback
                ul.innerHTML = `<li class="px-4 py-3 text-gray-500 dark:text-slate-400 text-center italic">No items found</li>`;
            }

            document.getElementById('budget-details-modal').classList.remove('hidden');
        };

        window.closeBudgetDetails = () => {
            document.getElementById('budget-details-modal').classList.add('hidden');
        };

        window.closeBudgetModal = () => {
            document.getElementById('budget-modal').classList.add('hidden');
        };

        window.openBudgetDrawer = () => {
            const overlay = document.getElementById('budget-drawer-overlay');
            const drawer = document.getElementById('budget-drawer');

            const years = new Set();
            years.add(window.currentYear.toString());
            window.budgets.forEach(b => {
                if (b.month) years.add(b.month.split('-')[0]);
            });

            const yearSelect = document.getElementById('budget-drawer-year');
            yearSelect.innerHTML = Array.from(years).sort().reverse().map(y => `<option value="${y}" ${y === window.currentYear.toString() ? 'selected' : ''}>${y}</option>`).join('');

            window.renderBudgetDrawerContent(window.currentYear.toString());
            overlay.classList.remove('hidden');
            void overlay.offsetWidth;
            overlay.classList.remove('opacity-0');
            drawer.classList.remove('translate-x-full');
        };

        window.closeBudgetDrawer = () => {
            const overlay = document.getElementById('budget-drawer-overlay');
            const drawer = document.getElementById('budget-drawer');

            overlay.classList.add('opacity-0');
            drawer.classList.add('translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        };

        window.renderBudgetDrawerContent = (year) => {
            const content = document.getElementById('budget-drawer-content');
            const monthsInYear = [];

            for (let m = 1; m <= 12; m++) {
                monthsInYear.push(`${year}-${String(m).padStart(2, '0')}`);
            }

            window.budgets.forEach(b => {
                if (b.month && b.month.startsWith(year) && !monthsInYear.includes(b.month)) {
                    monthsInYear.push(b.month);
                }
            });

            const activeMonths = monthsInYear.filter(m => {
                const hasBudget = window.budgets.some(b => b.month === m);
                const hasLimit = (window.budgetSettings.limits[m] || 0) > 0;
                return hasBudget || hasLimit;
            });

            activeMonths.sort().reverse();

            if (activeMonths.length === 0) {
                content.innerHTML = '<div class="p-6 text-center text-gray-500 dark:text-slate-400">No budget data found for this year.</div>';
                return;
            }

            let html = '';
            activeMonths.forEach(m => {
                let spent = 0;
                window.budgets.filter(b => b.month === m).forEach(b => {
                    spent += (parseFloat(b.spent) || 0);
                });

                const limit = window.budgetSettings.limits[m] || 0;
                const d = new Date(m + '-01');
                const monthName = d.toLocaleString('default', { month: 'long', year: 'numeric' });

                html += `
                    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                        <h3 class="text-md font-bold text-gray-900 dark:text-white mb-2">${monthName}</h3>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div class="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                                <span class="block text-xs text-gray-500 dark:text-slate-400">Total Spent</span>
                                <span class="font-semibold text-gray-900 dark:text-white">${window.formatCurrency(spent)}</span>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                                <span class="block text-xs text-gray-500 dark:text-slate-400">Month Limit</span>
                                <span class="font-semibold text-gray-900 dark:text-white">${window.formatCurrency(limit)}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            content.innerHTML = html;
        };

        window.changeMonth = (dir) => {
            window.currentMonth += dir;
            if (window.currentMonth < 0) {
                window.currentMonth = 11;
                window.currentYear--;
            } else if (window.currentMonth > 11) {
                window.currentMonth = 0;
                window.currentYear++;
            }
            localStorage.setItem('spo_current_month', window.currentMonth);
            localStorage.setItem('spo_current_year', window.currentYear);
            if (window.renderUI) window.renderUI();
        };

        window.resetToToday = () => {
            window.currentMonth = new Date().getMonth();
            window.currentYear = new Date().getFullYear();
            localStorage.setItem('spo_current_month', window.currentMonth);
            localStorage.setItem('spo_current_year', window.currentYear);
            if (window.renderUI) window.renderUI();
        };



        window.exportDailyTasksExcel = () => {
            if (!window.dailyTasks || window.dailyTasks.length === 0) {
                alert("No daily tasks to export.");
                return;
            }

            const data = window.dailyTasks.map(t => {
                return {
                    "Title": t.taskTitle,
                    "Event Title": t.eventTitle,
                    "Start Date": t.startDate,
                    "End Date": t.endDate,
                    "Task Description": t.taskDesc,
                    "Template Title": t.templateTitle,
                    "Template ID": t.templateId,
                    "Template Caption": t.templateCaption,
                    "Hashtags": t.hashtags,
                    "Linked Post URL": t.linkedPost,
                    "Document Link": t.docLink,
                    "Requested By": t.requestor,
                    "Created Time": t.createdTime,
                    "Status": t.status
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Tasks");
            XLSX.writeFile(workbook, "SPO_Daily_Tasks_Export.xlsx");
        };


        window.openDailyTaskDetails = (id) => {
            const task = window.dailyTasks.find(t => t.id === id);
            if (!task) return;

            window.currentDetailTaskId = id;

            document.getElementById('detail-task-title').innerText = task.taskTitle || 'Untitled Task';
            document.getElementById('detail-event-title').innerText = task.eventTitle || 'No Event';
            if (document.getElementById('detail-dt-end-date')) document.getElementById('detail-dt-end-date').innerText = task.endDate || 'N/A';

            if (task.status === 'Pending' && window.isCurrentUserPOC('daily_task')) {
                task.status = 'Under Review';
                window.syncDailyTaskToFirestore(task);
                if (window.renderDailyTasksTable) window.renderDailyTasksTable();
            }
            const statusColors = { 'Pending': 'bg-yellow-100 text-yellow-800', 'Under Review': 'bg-blue-100 text-blue-800', 'Completed': 'bg-green-100 text-green-800' };
            const reqStatus = task.status || 'Pending';
            const statusEl = document.getElementById('detail-status-text');
            if (statusEl) {
                statusEl.innerText = reqStatus;
                statusEl.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reqStatus] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'}`;
            }
            document.getElementById('detail-start-date').innerText = task.startDate || 'N/A';
            document.getElementById('detail-end-date').innerText = task.endDate || 'N/A';
            document.getElementById('detail-requestor').innerText = task.requestor || 'Unknown';

            const linkedTaskDisplay = document.getElementById('detail-linked-task');
            if (task.linkedTaskId) {
                const linkedTaskEvent = window.events.find(e => e.id === task.linkedTaskId);
                if (linkedTaskEvent) {
                    linkedTaskDisplay.innerHTML = `<button onclick="window.jumpToTask('${task.linkedTaskId}'); window.closeDailyTaskDetails();" class="text-primary-600 dark:text-primary-400 hover:text-primary-800 hover:underline cursor-pointer text-left focus:outline-none">${linkedTaskEvent.title}</button>`;
                } else {
                    linkedTaskDisplay.innerText = 'Unknown Task';
                }
            } else {
                linkedTaskDisplay.innerText = 'None';
            }

            document.getElementById('detail-task-desc').innerText = task.taskDesc || 'No description provided.';
            document.getElementById('detail-template-title').innerText = task.templateTitle || 'N/A';
            document.getElementById('detail-template-id').innerText = task.templateId || 'N/A';
            document.getElementById('detail-template-caption').innerText = task.templateCaption || 'N/A';
            document.getElementById('detail-hashtags').innerText = task.hashtags || 'N/A';

            const linkPost = document.getElementById('detail-linked-post');
            if (task.linkedPost) {
                linkPost.href = task.linkedPost;
                linkPost.innerText = task.linkedPost;
            } else {
                linkPost.removeAttribute('href');
                linkPost.innerText = 'N/A';
            }

            const docLink = document.getElementById('detail-doc-link');
            if (task.docLink) {
                docLink.href = task.docLink;
                docLink.innerText = task.docLink;
            } else {
                docLink.removeAttribute('href');
                docLink.innerText = 'N/A';
            }

            document.getElementById('detail-created-time').innerText = task.createdTime || 'Unknown';



            document.getElementById('daily-task-details-modal').classList.remove('hidden');
        };

        window.closeDailyTaskDetails = () => {
            document.getElementById('daily-task-details-modal').classList.add('hidden');
            window.currentDetailTaskId = null;
        };

        window.syncDailyTaskToFirestore = async (task) => {
    const oldTask = window.dailyTasks.find(t => t.id === task.id);
    if (oldTask && oldTask.status !== task.status) {
        if (task.requestor && task.requestor !== window.currentUserProfile) {
            window.logNotification(`Daily Task "${task.taskTitle}" status was updated to ${task.status} by ${window.currentUserProfile}`, task.requestor, 'daily_task', task.id);
        }
    }
            const idx = window.dailyTasks.findIndex(t => t.id === task.id);
            if (idx > -1) window.dailyTasks[idx] = task;
            else window.dailyTasks.push(task);
            localStorage.setItem('spo_daily_tasks', JSON.stringify(window.dailyTasks));

            if (!db) return;
            try {
                await setDoc(doc(db, "daily_tasks", task.id), task);
            } catch(e) {
                console.error(e);
            }
        };

        window.updateDailyTaskStatus = (id, newStatus) => {
            const task = window.dailyTasks.find(t => t.id === id);
            if (task) {
                task.status = newStatus;
                window.syncDailyTaskToFirestore(task);
                if (window.currentView === 'daily_task') {
                    window.renderDailyTasksTable();
                }
            }
        };

        window.populateLinkedTasksDropdown = () => {
            const dropdown = document.getElementById('dt-linked-task');
            if (!dropdown) return;
            dropdown.innerHTML = '<option value="">None</option>';
            window.events.filter(e => e.type === 'task').forEach(task => {
                const opt = document.createElement('option');
                opt.value = task.id;
                opt.textContent = task.title;
                dropdown.appendChild(opt);
            });
        };

        window.openDailyTaskModal = () => {
            document.getElementById('daily-task-form').reset();
            document.getElementById('dt-id').value = '';
            if (document.getElementById('dt-end-date')) document.getElementById('dt-end-date').value = '';
            window.currentDTHashtags = [];
            if (window.renderDTHashtags) window.renderDTHashtags();
            document.getElementById('daily-task-modal-title').innerText = 'Create Daily Task Request';
            window.populateLinkedTasksDropdown();
            document.getElementById('daily-task-modal').classList.remove('hidden');
        }

        window.openDailyTaskModalFromTask = (taskId) => {
            document.getElementById('daily-task-form').reset();
            document.getElementById('dt-id').value = '';
            if (document.getElementById('dt-end-date')) document.getElementById('dt-end-date').value = '';
            window.currentDTHashtags = [];
            if (window.renderDTHashtags) window.renderDTHashtags();
            document.getElementById('daily-task-modal-title').innerText = 'Create Daily Task Request';
            window.populateLinkedTasksDropdown();

            const task = window.events.find(e => e.id === taskId);
            if (task) {
                document.getElementById('dt-linked-task').value = taskId;
                document.getElementById('dt-task-title').value = task.title || '';
                document.getElementById('dt-event-title').value = task.campaignType || 'N/A';
                document.getElementById('dt-start-date').value = task.startDate || '';
                document.getElementById('dt-end-date').value = task.endDate || '';
            }

            document.getElementById('daily-task-modal').classList.remove('hidden');
        };

        window.openEditDailyTask = (id) => {
            const task = window.dailyTasks.find(t => t.id === id);
            if (!task) return;

            document.getElementById('daily-task-form').reset();
            document.getElementById('dt-id').value = task.id;
            document.getElementById('daily-task-modal-title').innerText = 'Edit Daily Task Request';

            window.populateLinkedTasksDropdown();

            document.getElementById('dt-event-title').value = task.eventTitle || '';
            let sDate = task.startDate || '';
            if (sDate && sDate.includes(' ')) sDate = sDate.replace(' ', 'T');
            document.getElementById('dt-start-date').value = sDate.substring(0, 16);
            if (document.getElementById('dt-end-date')) {
                let eDate = task.endDate || '';
                if (eDate && eDate.includes(' ')) eDate = eDate.replace(' ', 'T');
                document.getElementById('dt-end-date').value = eDate.substring(0, 16);
            }
            document.getElementById('dt-task-title').value = task.taskTitle || '';
            document.getElementById('dt-linked-task').value = task.linkedTaskId || '';
            document.getElementById('dt-task-desc').value = task.taskDesc || '';
            document.getElementById('dt-template-title').value = task.templateTitle || '';
            document.getElementById('dt-template-id').value = task.templateId || '';
            document.getElementById('dt-template-caption').value = task.templateCaption || '';

            let tags = [];
            if (Array.isArray(task.hashtags)) {
                tags = task.hashtags;
            } else if (typeof task.hashtags === 'string') {
                tags = task.hashtags.split(' ').filter(t => t.trim() !== '');
            }
            window.currentDTHashtags = tags;

            window.renderDTHashtags();
            document.getElementById('dt-linked-post').value = task.linkedPost || '';
            document.getElementById('dt-doc-link').value = task.docLink || '';



            document.getElementById('daily-task-modal').classList.remove('hidden');
        }


        // --- Daily Task Hashtag Logic ---
        window.currentDTHashtags = [];

        window.addDTHashtag = function() {
            const input = document.getElementById('dt-hashtag-input');
            const val = input.value.trim();
            if (val && !window.currentDTHashtags.includes(val)) {
                window.currentDTHashtags.push(val);
                input.value = '';
                window.renderDTHashtags();
            }
        };

        window.removeDTHashtag = function(index) {
            window.currentDTHashtags.splice(index, 1);
            window.renderDTHashtags();
        };

        window.renderDTHashtags = function() {
            const container = document.getElementById('dt-hashtags-container');
            if(!container) return;
            container.innerHTML = '';
            window.currentDTHashtags.forEach((tag, idx) => {
                const pill = document.createElement('div');
                pill.className = 'bg-primary-100 text-primary-700 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 flex items-center';
                pill.innerHTML = `<span>${tag}</span><button type="button" class="ml-2 focus:outline-none" onclick="window.removeDTHashtag(${idx})"><i class="fa-solid fa-times text-primary-500 hover:text-primary-700"></i></button>`;
                container.appendChild(pill);
            });
        };
        // ------------------------------------

        window.saveDailyTask = () => {
            const eventTitle = document.getElementById('dt-event-title').value.trim();
            const startDate = document.getElementById('dt-start-date').value;
            const endDate = document.getElementById('dt-end-date').value;
            const taskTitle = document.getElementById('dt-task-title').value.trim();
            const linkedTaskId = document.getElementById('dt-linked-task').value;
            const dtId = document.getElementById('dt-id').value;
            const existingTask = dtId ? window.dailyTasks.find(t => t.id === dtId) : null;
            const requestor = existingTask && existingTask.requestor ? existingTask.requestor : (window.currentUserProfile || 'Unknown');

            if (!eventTitle || !startDate || !endDate || !taskTitle) {
                alert("Please fill in all required fields (*).");
                return;
            }

            const now = new Date();
            const createdTime = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, '0') + "-" +
                String(now.getDate()).padStart(2, '0') + " " +
                String(now.getHours()).padStart(2, '0') + ":" +
                String(now.getMinutes()).padStart(2, '0') + ":" +
                String(now.getSeconds()).padStart(2, '0');

            let targetTask = null;
            let isNew = false;

            if (dtId) {
                targetTask = window.dailyTasks.find(t => t.id === dtId);
            }

            if (!targetTask) {
                isNew = true;
                targetTask = {
                    id: Date.now().toString(),
                    createdTime: createdTime,
                    status: "Pending"
                };
            }

            targetTask.eventTitle = eventTitle;
            targetTask.startDate = startDate;
            targetTask.endDate = document.getElementById('dt-end-date') ? document.getElementById('dt-end-date').value : '';
            targetTask.taskTitle = taskTitle;
            targetTask.taskDesc = document.getElementById('dt-task-desc').value.trim();
            targetTask.templateTitle = document.getElementById('dt-template-title').value.trim();
            targetTask.linkedTaskId = linkedTaskId;
            targetTask.templateId = document.getElementById('dt-template-id').value.trim();
            targetTask.templateCaption = document.getElementById('dt-template-caption').value.trim();
            targetTask.hashtags = window.currentDTHashtags.join(' ');
            targetTask.linkedPost = document.getElementById('dt-linked-post').value.trim();
            targetTask.docLink = document.getElementById('dt-doc-link').value.trim();
            targetTask.requestor = requestor;
            if (dtId) {
                targetTask.editedBy = window.currentUserProfile || 'Unknown';
            }
            // status is handled by lifecycle, not from form input
            if (!dtId) targetTask.status = 'Pending';

            if (isNew) {
        window.dailyTasks.push(targetTask);
        window.notifyPOCs(`New Daily Task "${targetTask.taskTitle}" submitted by ${window.currentUserProfile}`, 'daily_task', 'daily_task', targetTask.id);
    }
            window.syncDailyTaskToFirestore(targetTask);

            document.getElementById('daily-task-form').reset();
            window.closeDailyTaskModal();

            if (window.currentView === 'daily_task') {
                window.renderDailyTasksTable();
            }

            if (linkedTaskId) {
                const evt = window.events.find(e => e.id === linkedTaskId);
                if (evt) {
                    evt.progress = window.calcProgress(evt);
                    window.syncEventToFirestore(evt);

                    if (window.currentDrawerTaskId === linkedTaskId) {
                        window.renderDrawerChecklist(evt);
                        window.updateDrawerProgressUI(evt);
                    }
                    if (window.renderTasksTable) window.renderTasksTable();
                    window.renderOngoingEvents();
                }
            }
        };




        window.openPinRequestModal = (id = null, prefillSlot = null, prefillStart = null, isPinAction = false) => {
            const form = document.getElementById('pin-request-form');
            form.reset();
            document.getElementById('pr-id').value = '';
            document.getElementById('pin-request-modal-title').innerText = isPinAction ? 'Pin Post' : (id ? 'Edit Pin Request' : 'Create Pin Request');

            const fieldsToLock = ['pr-campaign-name', 'pr-start-date', 'pr-end-date', 'pr-category', 'pr-priority', 'pr-post-id', 'pr-post-title', 'pr-remark'];
            const pinSettings = ['pr-page', 'pr-position', 'pr-sort'];
            const pinSettingsSection = document.getElementById('pr-pin-settings-container');
            const slotAvailabilitySection = document.getElementById('pr-slot-availability-container');

            if (isPinAction) {
                // Main request fields stay unlocked
                fieldsToLock.forEach(fid => {
                    const el = document.getElementById(fid);
                    if(el) {
                        el.disabled = false;
                        el.classList.remove('bg-gray-100', 'dark:bg-slate-700');
                    }
                });

                // Unlock pin settings
                pinSettings.forEach(fid => {
                    const el = document.getElementById(fid);
                    if(el) {
                        el.disabled = false;
                        el.classList.remove('bg-gray-100', 'dark:bg-slate-700');
                    }
                });

                // Show slot availability and pin settings
                if(pinSettingsSection) pinSettingsSection.classList.remove('hidden');
                if(slotAvailabilitySection) slotAvailabilitySection.classList.remove('hidden');
            } else {
                // Enable main fields
                fieldsToLock.forEach(fid => {
                    const el = document.getElementById(fid);
                    if(el) {
                        el.disabled = false;
                        el.classList.remove('bg-gray-100', 'dark:bg-slate-700');
                    }
                });

                // Disable pin settings
                pinSettings.forEach(fid => {
                    const el = document.getElementById(fid);
                    if(el) {
                        el.disabled = true;
                        el.classList.add('bg-gray-100', 'dark:bg-slate-700');
                    }
                });

                // Hide sections
                if(pinSettingsSection) pinSettingsSection.classList.add('hidden');
                if(slotAvailabilitySection) slotAvailabilitySection.classList.add('hidden');
            }

            // Set save button text
            const saveBtn = document.getElementById('save-pr-btn');
            if(saveBtn) {
                saveBtn.innerText = isPinAction ? 'Save Pin Settings' : 'Save Request';
            }


            if (prefillStart) {
                document.getElementById('pr-start-date').value = prefillStart;
            }
            if (prefillSlot) {
                const parts = prefillSlot.split('-');
                document.getElementById('pr-page').value = parts[0];
                document.getElementById('pr-position').value = parts[1];
                document.getElementById('pr-sort').value = parts[2];
            }


            let req = null;
            if (id) {
                req = window.pinRequests.find(p => p.id === id);

                if (req) {
                    document.getElementById('pr-id').value = req.id;
                    document.getElementById('pr-campaign-name').value = req.campaignName || '';

                    document.getElementById('pr-start-date').value = req.startDate ? req.startDate.replace(' ', 'T').substring(0, 16) : '';
                    document.getElementById('pr-end-date').value = req.endDate ? req.endDate.replace(' ', 'T').substring(0, 16) : '';

                    document.getElementById('pr-category').value = req.category || 'PGC';
                    document.getElementById('pr-priority').value = req.priority || 'Medium';
                    document.getElementById('pr-post-id').value = req.postId || '';
                    document.getElementById('pr-post-title').value = req.postTitle || '';

                    document.getElementById('pr-remark').value = req.remark || '';

                    document.getElementById('pr-page').value = req.page || '';
                    document.getElementById('pr-position').value = req.position || '';
                    document.getElementById('pr-sort').value = req.sort || '';

                    if (isPinAction || (req.status !== 'Pending' && window.isCurrentUserPOC('post_management'))) {
                        // If it's a Pin Action or already under review, user fields stay unlocked, unlock Pin Settings
                        fieldsToLock.forEach(fid => {
                            const el = document.getElementById(fid);
                            if(el) {
                                el.disabled = false;
                                el.classList.remove('bg-gray-100', 'dark:bg-slate-700');
                            }
                        });
                        pinSettings.forEach(fid => {
                            const el = document.getElementById(fid);
                            if(el) {
                                el.disabled = false;
                                el.classList.remove('bg-gray-100', 'dark:bg-slate-700');
                            }
                        });
                        if(pinSettingsSection) pinSettingsSection.classList.remove('hidden');
                        if(slotAvailabilitySection) slotAvailabilitySection.classList.remove('hidden');
                    }
                }
            }

            document.getElementById('pin-request-modal').classList.remove('hidden');
            window.updateSelectedPosition();
            window.renderModalTimeline();

        };


        window.closePinRequestModal = () => {
            document.getElementById('pin-request-modal').classList.add('hidden');
        };


        window.formatDateTimeStr = function(dtLocalStr) {
            if (!dtLocalStr) return '';
            if (dtLocalStr.includes(' ') && dtLocalStr.split(':').length === 3) return dtLocalStr;
            const dt = new Date(dtLocalStr);
            if (isNaN(dt.getTime())) return '';
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            const hh = String(dt.getHours()).padStart(2, '0');
            const mins = String(dt.getMinutes()).padStart(2, '0');
            const ss = '00';
            return `${yyyy}-${mm}-${dd} ${hh}:${mins}:${ss}`;
        };

        window.savePinRequest = async () => {
            const form = document.getElementById('pin-request-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('pr-id').value;
            const campaignName = document.getElementById('pr-campaign-name').value.trim();
            const startDate = document.getElementById('pr-start-date').value;
            const endDate = document.getElementById('pr-end-date').value;
            const category = document.getElementById('pr-category').value;

            if (!startDate || isNaN(new Date(startDate).getTime())) {
                window.showToast("Please enter a valid Start Date and Time.", "error");
                return;
            }
            if (!endDate || isNaN(new Date(endDate).getTime())) {
                window.showToast("Please enter a valid End Date and Time.", "error");
                return;
            }
            if (new Date(startDate) > new Date(endDate)) {
                window.showToast("Start Date cannot be after End Date.", "error");
                return;
            }

            const formattedStartDate = window.formatDateTimeStr(startDate);
            const formattedEndDate = window.formatDateTimeStr(endDate);

            const page = document.getElementById('pr-page').value;
            const position = document.getElementById('pr-position').value;
            const sortVal = document.getElementById('pr-sort').value;

            if (page || position || sortVal) {
                if (page && (page < 1 || page > 2)) { window.showToast("Page must be 1 or 2", "error"); return; }
                if (position && (position < 1 || position > 10)) { window.showToast("Position must be between 1 and 10", "error"); return; }
                if (sortVal && (sortVal < 1 || sortVal > 3)) { window.showToast("Sort must be between 1 and 3", "error"); return; }
            }

            const priority = document.getElementById('pr-priority').value;
            const postId = document.getElementById('pr-post-id').value.trim();
            const postTitle = document.getElementById('pr-post-title').value.trim();
            const remark = document.getElementById('pr-remark').value.trim();

            const reqId = id ? id : Date.now().toString();

            const existing = id ? window.pinRequests.find(p => p.id === id) : null;
            const owner = existing && existing.owner ? existing.owner : (window.currentUserProfile || 'Unknown');
            let status = existing ? existing.status : 'Pending';

            if (page && position && sortVal) {
                status = 'Completed';
            }

            const reqData = {
                id: reqId,
                campaignName,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                category,
                priority,
                postId,
                postTitle,
                owner,
                remark,
                status,
                createdDate: existing && existing.createdDate ? existing.createdDate : window.getFormattedCreatedTime(),
                updateDate: window.getFormattedCreatedTime(),
                page: document.getElementById('pr-page').value || '',
                position: document.getElementById('pr-position').value || '',
                sort: document.getElementById('pr-sort').value || ''
            };

            if (id) {
                reqData.editedBy = window.currentUserProfile || 'Unknown';
            }

            const btn = document.getElementById('save-pr-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {

    const oldPin = window.pinRequests.find(p => p.id === reqId);
    if (oldPin && oldPin.status !== reqData.status) {
        if (reqData.owner && reqData.owner !== window.currentUserProfile) {
            window.logNotification(`Pin Request "${reqData.campaignName}" status was updated to ${reqData.status} by ${window.currentUserProfile}`, reqData.owner, 'pin_request', reqData.id);
        }
    }
    const idx = window.pinRequests.findIndex(p => p.id === reqId);
                if (idx > -1) window.pinRequests[idx] = reqData;
    else {
        window.pinRequests.push(reqData);
        window.notifyPOCs(`New Pin Request "${reqData.campaignName}" submitted by ${window.currentUserProfile}`, 'post_management', 'pin_request', reqData.id);
    }

                localStorage.setItem('spo_pin_requests', JSON.stringify(window.pinRequests));

                if (db) {
                    await setDoc(doc(db, "pin_requests", reqId), reqData);
                }

                window.showToast(id ? "Pin request updated" : "Pin request added", "success");
                window.closePinRequestModal();
                if (window.currentView === 'pin_request') {
                    window.renderPinRequestsTable();
                    if (window.renderPRTimeline) window.renderPRTimeline();
                }
                if (window.renderModalTimeline) window.renderModalTimeline();
            } catch (err) {
                console.error(err);
                window.showToast("Error saving pin request", "error");
            } finally {
                btn.innerHTML = 'Submit Request';
                btn.disabled = false;
            }
        };

        window.deletePinRequest = async (id) => {
            if (confirm('Are you sure you want to delete this pin request?')) {
                window.pinRequests = window.pinRequests.filter(p => String(p.id) !== String(id));
                localStorage.setItem('spo_pin_requests', JSON.stringify(window.pinRequests));

                if (db) {
                    try { await deleteDoc(doc(db, "pin_requests", id)); }
                    catch(e) {}
                }

                if (window.currentView === 'pin_request') {
                    window.renderPinRequestsTable();
                }
                window.showToast("Pin request deleted", "success");
            }
        };

        window.exportPinRequestsExcel = () => {
            if (!window.pinRequests || window.pinRequests.length === 0) {
                alert("No pin requests to export.");
                return;
            }

            const data = window.pinRequests.map(p => {
                return {
                    "CampaignGameName": p.campaignName,
                    "CreatedDate": p.createdDate || p.createdTime || '',
                    "StartDate": p.startDate,
                    "EndDate": p.endDate,
                    "UpdateDate": p.updateDate || p.updatedAt || '',
                    "Category": p.category,
                    "PostID": p.postId,
                    "PostTitle": p.postTitle,
                    "Priority": p.priority,
                    "Owner": p.owner,
                    "Status": p.status || 'Upcoming',
                    "Page": p.page || '',
                    "Position": p.position || '',
                    "Sort": p.sort || ''
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Pin Requests");
            XLSX.writeFile(workbook, "SPO_Pin_Requests_Export.xlsx");
        };





        window.pinSortMode = 1; // 1: Page>Pos>Sort, 2: Pos>Page>Sort, 3: Sort>Pos>Page

        window.cyclePinSort = () => {
            window.pinSortMode = window.pinSortMode === 3 ? 1 : window.pinSortMode + 1;
            if (window.renderPinRequestsTable) window.renderPinRequestsTable();
            if (window.renderPRTimeline) window.renderPRTimeline();
        };

        window.renderPinRequestsTable = () => {
            const tbody = document.getElementById('pin-requests-table-body');
            if (!tbody) return;

            let searchVal = document.getElementById('pin-search-input') ? document.getElementById('pin-search-input').value.toLowerCase() : '';
            let catVal = document.getElementById('pin-category-filter') ? document.getElementById('pin-category-filter').value : 'All';
            let statusVal = document.getElementById('pin-status-filter') ? document.getElementById('pin-status-filter').value : 'All';

            const now = new Date();
            const nowMs = now.getTime();

            // First, calculate Pin Status for each item
            window.pinRequests.forEach(p => {
                let pinStatus = 'Ended'; // default if missing dates
                if (p.startDate && p.endDate) {
                    const sParts = p.startDate.split(/[- :T]/);
                    const eParts = p.endDate.split(/[- :T]/);
                    if (sParts.length >= 3 && eParts.length >= 3) {
                        const sDate = new Date(Date.UTC(sParts[0], sParts[1]-1, sParts[2], sParts[3]||0, sParts[4]||0, sParts[5]||0));
                        const eDate = new Date(Date.UTC(eParts[0], eParts[1]-1, eParts[2], eParts[3]||0, eParts[4]||0, eParts[5]||0));
                        const sMs = sDate.getTime();
                        const eMs = eDate.getTime();

                        if (nowMs < sMs) {
                            pinStatus = 'Upcoming';
                        } else if (nowMs >= sMs && nowMs <= eMs) {
                            pinStatus = 'Live';
                        } else {
                            pinStatus = 'Ended';
                        }
                    }
                }
                p.calculatedPinStatus = pinStatus;
            });

            let filtered = window.pinRequests.filter(p => {
                if (catVal !== 'All' && p.category !== catVal) return false;
                if (statusVal !== 'All' && p.calculatedPinStatus !== statusVal) return false;
                if (searchVal) {
                    const matchCamp = p.campaignName && p.campaignName.toLowerCase().includes(searchVal);
                    const matchPost = p.postId && p.postId.toLowerCase().includes(searchVal);
                    const matchOwner = p.owner && p.owner.toLowerCase().includes(searchVal);
                    return matchCamp || matchPost || matchOwner;
                }
                return true;
            });


            // Custom sorting logic
            if (window.pinSortBy) {
                filtered.sort((a, b) => {
                    let valA = a[window.pinSortBy] || '';
                    let valB = b[window.pinSortBy] || '';
                    if (typeof valA === 'string') valA = valA.toLowerCase();
                    if (typeof valB === 'string') valB = valB.toLowerCase();

                    if (valA < valB) return window.pinSortDesc ? 1 : -1;
                    if (valA > valB) return window.pinSortDesc ? -1 : 1;
                    return 0;
                });
            } else {
                const rank = { 'Live': 1, 'Upcoming': 2, 'Ended': 3 };
                filtered.sort((a, b) => {
                    let sA = a.calculatedPinStatus;
                    let sB = b.calculatedPinStatus;
                    if (sA === 'Ended' && a.status !== 'Completed') sA = 'Live';
                    if (sB === 'Ended' && b.status !== 'Completed') sB = 'Live';
                    if (rank[sA] !== rank[sB]) return rank[sA] - rank[sB];
                    // Secondary sorting by position modes
                    const aPage = parseInt(a.page) || 0;
                    const bPage = parseInt(b.page) || 0;
                    const aPos = parseInt(a.position) || 0;
                    const bPos = parseInt(b.position) || 0;
                    const aSort = parseInt(a.sort) || 0;
                    const bSort = parseInt(b.sort) || 0;

                    const maxVal = 999;
                    const aP = aPage || maxVal; const bP = bPage || maxVal;
                    const aPo = aPos || maxVal; const bPo = bPos || maxVal;
                    const aS = aSort || maxVal; const bS = bSort || maxVal;

                    if (window.pinSortMode === 1 || !window.pinSortMode) {
                        if (aS !== bS) return aS - bS;
                        if (aP !== bP) return aP - bP;
                        if (aPo !== bPo) return aPo - bPo;
                    } else if (window.pinSortMode === 2) {
                        if (aPo !== bPo) return aPo - bPo;
                        if (aP !== bP) return aP - bP;
                        if (aS !== bS) return aS - bS;
                    } else {
                        if (aP !== bP) return aP - bP;
                        if (aPo !== bPo) return aPo - bPo;
                        if (aS !== bS) return aS - bS;
                    }

                    // Fallback to start date
                    return (b.startDate || '').localeCompare(a.startDate || '');
                });
            }



            const sortIcon = document.getElementById('pin-sort-icon');
            if (sortIcon) {
                sortIcon.className = 'fa-solid ml-1 transition-colors ' +
                    (window.pinSortMode === 1 ? 'fa-sort-numeric-down text-primary-600 dark:text-primary-400' :
                    (window.pinSortMode === 2 ? 'fa-sort-amount-down text-primary-600 dark:text-primary-400' : 'fa-list-ol text-primary-600 dark:text-primary-400'));
                sortIcon.title = window.pinSortMode === 1 ? 'Sort: Sort > Page > Position' :
                    (window.pinSortMode === 2 ? 'Sort: Position > Page > Sort' : 'Sort: Page > Position > Sort');
            }

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-400">No pin requests found.</td></tr>';
                return;
            }

            let html = '';
            filtered.forEach(p => {
                let rowStatus = p.calculatedPinStatus;
                if (rowStatus === 'Ended' && p.status !== 'Completed') rowStatus = 'Live';
                const isPast = rowStatus === 'Ended';
                const rowOpacityClass = isPast ? 'opacity-50 grayscale bg-gray-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:bg-slate-900 transition-colors group cursor-pointer';

                const priorityClass = p.priority === 'High' ? 'text-red-600 dark:text-red-400 bg-red-100' : (p.priority === 'Medium' ? 'text-amber-600 dark:text-amber-400 bg-amber-100' : 'text-blue-600 dark:text-blue-400 bg-blue-100');

                let pinStatusClass = 'text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700';
                if (p.calculatedPinStatus === 'Live') pinStatusClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-100';
                else if (p.calculatedPinStatus === 'Upcoming') pinStatusClass = 'text-primary-600 dark:text-primary-400 bg-primary-100';

                const pinStatusStr = (p.page || p.position || p.sort) ? `${p.page || '-'} - ${p.position || '-'} - ${p.sort || '-'}` : '-';

                html += `
                    <tr class="${rowOpacityClass}" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.openPinRequestDetails('${p.id}')">
                        <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">${p.campaignName}</div>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.category || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.startDate || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">${p.endDate || '-'}</td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${priorityClass}">${p.priority}</span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            ${(function(){
                                let n = p.owner || 'Unknown';
                                let initial = n.charAt(0).toUpperCase();
                                return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-primary-100 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900 dark:text-white">' + n + '</span></div>';
                            })()}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : (p.status === 'Under Review' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800')}">
                                ${p.status || 'Pending'}
                            </span>
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            ${pinStatusStr}
                        </td>
                        <td class="px-3 py-4 whitespace-nowrap">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pinStatusClass}">${p.calculatedPinStatus}</span>
                        </td>
                                                <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${p.status === 'Under Review' && window.isCurrentUserPOC('post_management') ? `<button onclick="event.stopPropagation(); window.openPinRequestModal('${p.id}', null, null, true)" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 bg-primary-50 dark:bg-primary-500/20 px-2 py-1 rounded-md transition-colors mr-1" title="Pin Post"><i class="fa-solid fa-thumbtack text-xs" style="pointer-events: none;"></i></button>` : ''}
                            <button onclick="event.stopPropagation(); window.openPinRequestModal('${p.id}')" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 bg-primary-50 dark:bg-primary-500/20 px-2 py-1 rounded-md transition-colors mr-1" title="Edit"><i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i></button>
                            <button onclick="event.stopPropagation(); window.deletePinRequest('${p.id}')" class="text-red-600 dark:text-red-400 hover:text-red-900 bg-red-50 dark:bg-red-500/20 px-2 py-1 rounded-md transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i></button>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };


        window.renderPRTimeline = () => {
            const container = document.getElementById('pr-timeline-inner');
            if (!container) return;

            const dateInput = document.getElementById('pr-timeline-start-date');
            let startOfWeek;

            if (dateInput && dateInput.value) {
                // If a date is provided, use it as the start date
                startOfWeek = new Date(dateInput.value + 'T00:00:00Z');
            } else {
                // Otherwise default to today (not snapping to Monday, just starting from today)
                const p = window.getPHParts();
                startOfWeek = new Date(Date.UTC(p.year, p.month, p.date));
                if (dateInput) {
                    dateInput.value = startOfWeek.toISOString().split('T')[0];
                }
            }

            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setUTCDate(d.getUTCDate() + i);
                days.push(d);
            }

            // Timeline Header

            const sortIconClass = (window.pinSortMode === 1 ? 'fa-sort-numeric-down text-primary-600 dark:text-primary-400' :
                (window.pinSortMode === 2 ? 'fa-sort-amount-down text-primary-600 dark:text-primary-400' : 'fa-list-ol text-primary-600 dark:text-primary-400'));

            let html = `<div class="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                <div onclick="window.cyclePinSort()" class="w-32 shrink-0 border-r border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-gray-600 dark:text-slate-400 uppercase flex items-center justify-center bg-slate-100 sticky left-0 z-20 cursor-pointer hover:bg-slate-200 dark:bg-slate-600 transition-colors group select-none">
                    Position <i class="fa-solid ml-1 transition-colors ${sortIconClass}"></i>
                </div>`;

            days.forEach(d => {
                const dateStr = d.toISOString().split('T')[0];
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
                html += `<div class="flex-1 min-w-[120px] border-r border-slate-200 dark:border-slate-700 text-center">
                    <div class="py-1 bg-slate-200 dark:bg-slate-600/50 text-xs font-bold text-gray-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">${dayName} ${dateStr}</div>
                    <div class="flex text-[10px] text-gray-500 dark:text-slate-400 divide-x divide-slate-200 dark:divide-slate-700/60 h-4">
                        <div class="flex-1">00:00</div>
                        <div class="flex-1">12:00</div>
                    </div>
                </div>`;
            });
            html += `</div>`;

            // Row Generation
            const allSlots = [];
            for (let page = 1; page <= 2; page++) {
                for (let pos = 1; pos <= 10; pos++) {
                    for (let sort = 1; sort <= 3; sort++) {
                        allSlots.push({
                            id: `${page}-${pos}-${sort}`,
                            page: page,
                            position: pos,
                            sort: sort
                        });
                    }
                }
            }

            allSlots.sort((a, b) => {
                const aP = a.page; const bP = b.page;
                const aPo = a.position; const bPo = b.position;
                const aS = a.sort; const bS = b.sort;

                if (window.pinSortMode === 1 || !window.pinSortMode) {
                    if (aS !== bS) return aS - bS;
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                } else if (window.pinSortMode === 2) {
                    if (aPo !== bPo) return aPo - bPo;
                    if (aP !== bP) return aP - bP;
                    if (aS !== bS) return aS - bS;
                } else {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                }
                return 0;
            });

            const slots = allSlots.map(s => ({ id: s.id }));

            const scaleMsToPct = (durationMs) => (durationMs / (7 * 24 * 60 * 60 * 1000)) * 100;
            const weekStartMs = startOfWeek.getTime();
            const weekEndMs = weekStartMs + (7 * 24 * 60 * 60 * 1000);

            slots.forEach(slot => {
                html += `<div class="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-900 transition-colors relative group h-10">
                    <div class="w-32 shrink-0 border-r border-slate-200 dark:border-slate-700 p-2 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 sticky left-0 z-10 flex items-center justify-center">
                        <span class="text-sm font-bold text-gray-700 dark:text-slate-300">${slot.id}</span>
                    </div>
                    <div class="flex-1 relative pr-track cursor-pointer" data-slot="${slot.id}" onclick="window.handlePRTimelineClick(event, '${slot.id}')">`;

                // Add grid lines for background
                days.forEach((_, i) => {
                    html += `<div class="absolute top-0 bottom-0 border-l border-slate-200 dark:border-slate-700/40 pointer-events-none" style="left: ${(i/7)*100}%; width: ${100/7}%"></div>`;
                    html += `<div class="absolute top-0 bottom-0 border-l border-slate-100 dark:border-slate-700/40 border-dashed pointer-events-none" style="left: ${((i+0.5)/7)*100}%"></div>`;
                });

                // Add gray overlay for past time
                const nowMs = window.getPHFakeUtcMs();
                if (nowMs > weekStartMs) {
                    const pastPct = scaleMsToPct(Math.min(nowMs, weekEndMs) - weekStartMs);
                    html += `<div class="absolute top-0 bottom-0 bg-gray-200/50 pointer-events-none z-0" style="left: 0%; width: ${pastPct}%"></div>`;
                }

                // Find requests matching this slot
                const reqs = window.pinRequests.filter(r => r.page === slot.id.split('-')[0] && r.position === slot.id.split('-')[1] && r.sort === slot.id.split('-')[2]);

                reqs.forEach(req => {
                    if (!req.startDate || !req.endDate) return;
                    // Format: YYYY-MM-DD HH:MM:SS
                    // Since it's UTC conceptually, we parse it manually
                    const sParts = req.startDate.split(/[- :T]/);
                    const eParts = req.endDate.split(/[- :T]/);

                    if (sParts.length < 3 || eParts.length < 3) return;

                    const sDate = new Date(Date.UTC(sParts[0], sParts[1]-1, sParts[2], sParts[3]||0, sParts[4]||0, sParts[5]||0));
                    const eDate = new Date(Date.UTC(eParts[0], eParts[1]-1, eParts[2], eParts[3]||0, eParts[4]||0, eParts[5]||0));

                    const sMs = sDate.getTime();
                    const eMs = eDate.getTime();

                    // Check if it overlaps with current week
                    if (eMs <= weekStartMs || sMs >= weekEndMs) return;

                    let leftPct = scaleMsToPct(Math.max(0, sMs - weekStartMs));
                    let widthPct = scaleMsToPct(Math.min(weekEndMs, eMs) - Math.max(weekStartMs, sMs));

                    const durationH = Math.round((eMs - sMs) / (60 * 60 * 1000));

                    let baseColorClass = 'bg-blue-100 text-blue-800 border border-blue-200 hover:ring-blue-400';
                    if (req.category === 'PGC' || req.category === 'Content Writer') {
                        baseColorClass = 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 border border-emerald-200 hover:ring-emerald-400';
                    } else if (req.category === 'UGC' || req.category === 'Perya Host') {
                        baseColorClass = 'bg-red-50 dark:bg-red-500/20 text-red-800 border border-red-200 hover:ring-red-400';
                    } else if (req.status === 'Completed') {
                        baseColorClass = 'bg-blue-100 text-blue-800 border border-blue-200 hover:ring-blue-400';
                    } else if (req.status === 'Under Review') {
                        baseColorClass = 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 border border-amber-200 hover:ring-amber-400';
                    }

                    const isPast = eMs < window.getPHFakeUtcMs();
                    const grayOutClass = isPast ? 'opacity-50 grayscale' : '';

                    html += `<div class="absolute top-1 bottom-1 rounded-md shadow-sm ${baseColorClass} ${grayOutClass} text-[10px] flex items-center px-2 truncate cursor-pointer hover:ring-2 ring-offset-1 z-10 transition-all"
                                style="left: ${leftPct}%; width: ${widthPct}%;"
                                title="${req.campaignName}\nStart: ${req.startDate}\nEnd: ${req.endDate}\nDuration: ${durationH}h\nOwner: ${req.owner || 'Unknown'}"
                                onclick="event.stopPropagation(); window.openPinRequestDetails('${req.id}')">
                                <span class="truncate font-medium">${req.campaignName}</span>
                             </div>`;
                });

                html += `</div></div>`;
            });

            container.innerHTML = html;
        };



        window.handlePRTimelineClick = (e, slotId) => {
            const track = e.currentTarget;
            const rect = track.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;

            // Calculate clicked date
            const pToday = window.getPHParts(); const today = new Date(Date.UTC(pToday.year, pToday.month, pToday.date));
            const dayOfWeek = today.getUTCDay();
            const startOfWeek = new Date(today);
            startOfWeek.setUTCDate(today.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startOfWeek.setUTCHours(0, 0, 0, 0);

            const clickedMs = startOfWeek.getTime() + (pct * 7 * 24 * 60 * 60 * 1000);
            const clickedDate = new Date(clickedMs);

            const sYear = clickedDate.getUTCFullYear();
            const sMo = String(clickedDate.getUTCMonth() + 1).padStart(2, '0');
            const sDa = String(clickedDate.getUTCDate()).padStart(2, '0');
            const sHr = String(clickedDate.getUTCHours()).padStart(2, '0');
            // Round to nearest hour
            const formattedStart = `${sYear}-${sMo}-${sDa}T${sHr}:00`;

            window.openPinRequestModal(null, slotId, formattedStart);
        };

        window.updateSelectedPosition = () => {
            const page = document.getElementById('pr-page').value;
            const position = document.getElementById('pr-position').value;
            const sort = document.getElementById('pr-sort').value;

            const display = document.getElementById('pr-selected-position-display');
            if (page && position && sort) {
                display.innerText = `${page} - ${position} - ${sort}`;
            } else {
                display.innerText = '-';
            }

            // Re-render modal timeline to highlight selected row
            window.renderModalTimeline();

        };

        window.handleModalTimelineClick = (id) => {
            const parts = id.split('-');
            document.getElementById('pr-page').value = parts[0];
            document.getElementById('pr-position').value = parts[1];
            document.getElementById('pr-sort').value = parts[2];
            window.updateSelectedPosition();
        };


        window.modalTimelineSortState = 0; // 0: Page>Pos>Sort, 1: Pos>Page>Sort, 2: Sort>Pos>Page
        window.cycleModalTimelineSort = () => {
            window.modalTimelineSortState = (window.modalTimelineSortState + 1) % 3;
            window.renderModalTimeline();
        };

        window.renderModalTimeline = () => {
            const container = document.getElementById('modal-timeline-container');
            if (!container) return;

            let startDateVal = document.getElementById('modal-timeline-start-date').value;
            if (!startDateVal) {
                const prStartVal = document.getElementById('pr-start-date').value;
                if(prStartVal) {
                    startDateVal = prStartVal.split('T')[0];
                    document.getElementById('modal-timeline-start-date').value = startDateVal;
                }
            }

            if (!startDateVal) {
                container.innerHTML = '<div class="text-center py-10 text-gray-400 dark:text-slate-500 text-sm">Select a start date to view availability</div>';
                return;
            }

            const startDate = new Date(startDateVal + 'T00:00:00Z');
            if (isNaN(startDate.getTime())) return;

            // Generate 7-day view
            const endDate = new Date(startDate.getTime());
            endDate.setUTCDate(endDate.getUTCDate() + 6);

            const allSlots = [];
            for (let page = 1; page <= 2; page++) {
                for (let pos = 1; pos <= 10; pos++) {
                    for (let sort = 1; sort <= 3; sort++) {
                        allSlots.push({ page, pos, sort, id: `${page}-${pos}-${sort}` });
                    }
                }
            }

            allSlots.sort((a, b) => {
                if (window.modalTimelineSortState === 1 || !window.modalTimelineSortState) {
                    if (a.sort !== b.sort) return a.sort - b.sort;
                    if (a.page !== b.page) return a.page - b.page;
                    return a.pos - b.pos;
                } else if (window.modalTimelineSortState === 2) {
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    if (a.page !== b.page) return a.page - b.page;
                    return a.sort - b.sort;
                } else {
                    if (a.page !== b.page) return a.page - b.page;
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    return a.sort - b.sort;
                }
            });
            const priorities = allSlots.map(s => s.id);

            const selectedPage = document.getElementById('pr-page').value;
            const selectedPosition = document.getElementById('pr-position').value;
            const selectedSort = document.getElementById('pr-sort').value;
            const selectedId = (selectedPage && selectedPosition && selectedSort) ? `${selectedPage}-${selectedPosition}-${selectedSort}` : null;

            const currentReqId = document.getElementById('pr-id').value;

            // Generate timeline HTML
            // Header showing selected date range
            const formatStr = (d) => {
                const day = d.getDate();
                const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
                const hh = String(d.getHours()).padStart(2, '0');
                const mm = String(d.getMinutes()).padStart(2, '0');
                return `${day} ${mo}, ${hh}:${mm}`;
            };

            let html = `
                <div class="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-20 flex p-2 font-bold text-xs text-gray-700 dark:text-slate-300 shadow-sm">
                    <div class="w-20 shrink-0 border-r border-gray-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:bg-slate-600" onclick="window.cycleModalTimelineSort()" title="Click to change sort order">Position <i class="fa-solid fa-arrow-down-a-z ml-1 text-gray-400 dark:text-slate-500"></i></div>
                    <div class="flex-1 flex justify-between px-2">
                        <span>${formatStr(startDate)}</span>
                        <i class="fa-solid fa-arrow-right text-gray-400 dark:text-slate-500"></i>
                        <span>${formatStr(endDate)}</span>
                    </div>
                </div>
            `;

            // Content rows
            const sMs = startDate.getTime();
            const eMs = endDate.getTime();

            priorities.forEach(id => {
                const parts = id.split('-');

                // Find overlapping requests for this slot
                const overlapping = window.pinRequests.filter(r => {
                    if (r.id === currentReqId) return false;
                    if (r.page === parts[0] && r.position === parts[1] && r.sort === parts[2]) {
                        if (!r.startDate || !r.endDate) return false;

                        const rsParts = r.startDate.split(/[- :T]/);
                        const reParts = r.endDate.split(/[- :T]/);
                        if (rsParts.length < 3 || reParts.length < 3) return false;

                        const rsDate = new Date(Date.UTC(rsParts[0], rsParts[1]-1, rsParts[2], rsParts[3]||0, rsParts[4]||0, rsParts[5]||0));
                        const reDate = new Date(Date.UTC(reParts[0], reParts[1]-1, reParts[2], reParts[3]||0, reParts[4]||0, reParts[5]||0));

                        const rsMs = rsDate.getTime();
                        const reMs = reDate.getTime();

                        // Check overlap
                        return (rsMs < eMs && reMs > sMs);
                    }
                    return false;
                });

                const isSelected = id === selectedId;
                const isOccupied = overlapping.length > 0;

                let rowClasses = "flex border-b border-gray-100 dark:border-slate-700 hover:bg-primary-50 dark:bg-primary-500/20/50 cursor-pointer transition-colors relative group h-8";
                let innerHTML = "";

                if (isSelected) {
                    rowClasses += " bg-primary-50 dark:bg-primary-500/20";
                    innerHTML = `<div class="absolute inset-x-2 inset-y-1 border-2 border-primary-500 rounded flex items-center justify-center bg-primary-100/50 text-primary-700 text-xs font-bold shadow-sm pointer-events-none">Selected - available</div>`;
                }

                if (isOccupied && !isSelected) {
                    rowClasses += " bg-red-50 dark:bg-red-500/20 cursor-not-allowed";
                    rowClasses = rowClasses.replace("hover:bg-primary-50 dark:bg-primary-500/20/50", "");
                    rowClasses = rowClasses.replace("cursor-pointer", "");
                    innerHTML = `<div class="absolute inset-x-2 inset-y-1 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] pointer-events-none">Existing pin</div>`;

                    html += `
                        <div class="${rowClasses}">
                            <div class="w-16 shrink-0 border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-slate-300 z-10 sticky left-0">
                                ${id}
                            </div>
                            <div class="flex-1 relative">
                                ${innerHTML}
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="${rowClasses}" onclick="window.handleModalTimelineClick('${id}')">
                            <div class="w-16 shrink-0 border-r border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-slate-300 z-10 sticky left-0">
                                ${id}
                            </div>
                            <div class="flex-1 relative">
                                ${innerHTML}
                            </div>
                        </div>
                    `;
                }
            });

            html += `<div class="text-center py-2 text-[10px] text-gray-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">Scroll for more positions ↓</div>`;

            container.innerHTML = html;
        };

        window.openPinActionModal = (id) => {
            // Instead of opening the separate small pin action modal, we open the main Create Pin Request modal
            // with read-only fields and 'Pin Post' title.
            window.openPinRequestModal(id, null, null, true);
        };


        window.closePinActionModal = () => {
            document.getElementById('pin-action-modal').classList.add('hidden');
        };

        window.savePinAction = async () => {
            const form = document.getElementById('pin-action-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('pa-id').value;
            const req = window.pinRequests.find(p => p.id === id);
            if (!req) return;

            req.page = document.getElementById('pa-page').value.trim();
            req.position = document.getElementById('pa-position').value.trim();
            req.sort = document.getElementById('pa-sort').value;
            req.status = 'Completed';
            req.updateDate = window.getFormattedCreatedTime();
    if (req.owner && req.owner !== window.currentUserProfile) {
        window.logNotification(`Pin Request "${req.campaignName}" was Completed by ${window.currentUserProfile}`, req.owner, 'pin_request', req.id);
    }
    if (req.requestedBy && req.requestedBy !== window.currentUserProfile) {
        window.logNotification(`Request "${req.campaignName || req.taskTitle}" was Completed by ${window.currentUserProfile}`, req.requestedBy, req.category === 'sms' ? 'sms' : (req.campaignName ? 'prize_distribution' : 'daily_task'), req.id);
    }

            const btn = document.getElementById('save-pa-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                localStorage.setItem('spo_pin_requests', JSON.stringify(window.pinRequests));

                if (db) {
                    await setDoc(doc(db, "pin_requests", req.id), req);
                }

                window.showToast("Pin action saved", "success");
                window.closePinActionModal();
                if (window.currentView === 'pin_request') {
                    window.renderPinRequestsTable();
                    if (window.renderPRTimeline) window.renderPRTimeline();
                }
                if (window.renderModalTimeline) window.renderModalTimeline();
            } catch (err) {
                console.error(err);
                window.showToast("Error saving pin action", "error");
            } finally {
                btn.innerHTML = 'Save';
                btn.disabled = false;
            }
        };

        window.completeDailyTask = async (id) => {
            if (confirm('Are you sure you want to mark this daily task as completed?')) {
                const task = window.dailyTasks.find(t => t.id === id);
                if (task) {
                    task.status = 'Completed';
                    window.syncDailyTaskToFirestore(task);
                    if (window.renderDailyTasksTable) window.renderDailyTasksTable();
                    window.showToast("Daily task marked as completed.", "success");
                }
            }
        };

        window.deleteDailyTask = async (id) => {
            if (confirm('Are you sure you want to delete this daily task request?')) {
                const taskToDelete = window.dailyTasks.find(t => t.id === id);
                const linkedTaskId = taskToDelete ? taskToDelete.linkedTaskId : null;

                window.dailyTasks = window.dailyTasks.filter(t => t.id !== id);
                localStorage.setItem('spo_daily_tasks', JSON.stringify(window.dailyTasks));
                if (db) {
                    try { await deleteDoc(doc(db, "daily_tasks", id)); }
                    catch(e) {}
                }
                window.renderDailyTasksTable();

                if (linkedTaskId) {
                    const evt = window.events.find(e => e.id === linkedTaskId);
                    if (evt) {
                        evt.progress = window.calcProgress(evt);
                        window.syncEventToFirestore(evt);
                        if (window.currentDrawerTaskId === linkedTaskId) {
                            window.renderDrawerChecklist(evt);
                            window.updateDrawerProgressUI(evt);
                        }
                    }
                    if (window.renderTasksTable) window.renderTasksTable();
                    window.renderOngoingEvents();
                }
            }
        };

        window.closeDailyTaskModal = () => {
            document.getElementById('daily-task-modal').classList.add('hidden');
        }

        window.renderQuickLinks = () => {
            const container = document.getElementById('quick-links-container');
            if (!container) return;
            container.innerHTML = '';

            if (window.quickLinks.length === 0) {
                container.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400 dark:text-slate-500 italic">No quick links added.</div>';
                return;
            }

            window.quickLinks.forEach(link => {
                const el = document.createElement('div');
                el.className = "flex items-center justify-between px-3 py-1 hover:bg-slate-50 dark:bg-slate-900 rounded-xl group transition-colors";

                const linkUrl = link.url.startsWith('http') ? link.url : 'https://' + link.url;

                el.innerHTML = `
                    <a href="${linkUrl}" target="_blank" class="flex items-center text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:text-white font-medium truncate flex-1" title="${link.title} (Created by ${link.createdBy})">
                        <i class="fa-solid fa-link mr-3 text-gray-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors shrink-0"></i>
                        <span class="truncate">${link.title}</span>
                    </a>
                    <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <button onclick="openQuickLinkModal('${link.id}')" class="text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:text-primary-400 p-1" title="Edit">
                            <i class="fa-solid fa-pen text-xs" style="pointer-events: none;"></i>
                        </button>
                        <button onclick="deleteQuickLink('${link.id}')" class="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:text-red-400 p-1" title="Delete">
                            <i class="fa-solid fa-trash text-xs" style="pointer-events: none;"></i>
                        </button>
                    </div>
                `;
                container.appendChild(el);
            });
        };

        window.openQuickLinkModal = (id = null) => {
            const form = document.getElementById('quick-link-form');
            form.reset();
            document.getElementById('ql-id').value = '';
            document.getElementById('quick-link-modal-title').innerText = 'Add Quick Link';

            if (id) {
                const link = window.quickLinks.find(l => l.id === id);
                if (link) {
                    document.getElementById('ql-id').value = link.id;
                    document.getElementById('ql-title').value = link.title || '';
                    document.getElementById('ql-url').value = link.url || '';

                    document.getElementById('quick-link-modal-title').innerText = 'Edit Quick Link';
                }
            }

            document.getElementById('quick-link-modal').classList.remove('hidden');
        };

        window.closeQuickLinkModal = () => {
            document.getElementById('quick-link-modal').classList.add('hidden');
        };

        window.saveQuickLink = async (e) => {
            e.preventDefault();
            const form = document.getElementById('quick-link-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('ql-id').value;
            const title = document.getElementById('ql-title').value.trim();
            const url = document.getElementById('ql-url').value.trim();
            const existingLink = id ? window.quickLinks.find(l => l.id === id) : null;
            const createdBy = existingLink && existingLink.createdBy ? existingLink.createdBy : (window.currentUserProfile || 'Unknown');

            const btn = document.getElementById('save-ql-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            const linkId = id ? id : Date.now().toString();
            const timestamp = window.getFormattedCreatedTime();

            let linkData = {
                id: linkId,
                title,
                url,
                createdBy,
                editTime: timestamp
            };

            if (id) {
                linkData.editedBy = window.currentUserProfile || 'Unknown';
            }

            if (id) {
                const existing = window.quickLinks.find(l => l.id === id);
                if (existing) {
                    linkData.createdTime = existing.createdTime || timestamp;
                } else {
                    linkData.createdTime = timestamp;
                }
            } else {
                linkData.createdTime = timestamp;
            }

            try {
                const idx = window.quickLinks.findIndex(l => l.id === linkId);
                if (idx > -1) window.quickLinks[idx] = linkData;
                else window.quickLinks.push(linkData);

                localStorage.setItem('spo_quick_links', JSON.stringify(window.quickLinks));

                if (db) {
                    await setDoc(doc(db, "quick_links", linkId), linkData);
                }

                window.showToast(id ? "Quick link updated" : "Quick link added", "success");
                window.closeQuickLinkModal();
                window.renderQuickLinks();
            } catch(err) {
                console.error(err);
                window.showToast("Error saving quick link", "error");
            } finally {
                btn.innerHTML = 'Save';
                btn.disabled = false;
            }
        };

        window.deleteQuickLink = async (id) => {
            if (!confirm('Are you sure you want to delete this quick link?')) return;

            window.quickLinks = window.quickLinks.filter(l => l.id !== id);
            localStorage.setItem('spo_quick_links', JSON.stringify(window.quickLinks));

            if (db) {
                try {
                    await deleteDoc(doc(db, "quick_links", id));
                } catch(err) {
                    console.error(err);
                }
            }

            window.renderQuickLinks();
            window.showToast("Quick link deleted", "success");
        };


        window.openTypeModal = (dateStr = null) => {
            window.tempSelectedDate = dateStr;
            document.getElementById('type-modal').classList.remove('hidden');
        }

        window.closeTypeModal = () => {
            document.getElementById('type-modal').classList.add('hidden');
            window.tempSelectedDate = null;
        }

        window.selectEventType = (type) => {
            document.getElementById('type-modal').classList.add('hidden');
            window.openAddModal(type, window.tempSelectedDate);
            window.tempSelectedDate = null;
        }

        window.openAddModal = (itemType = 'task', dateStr = null) => {
            document.getElementById('event-form').reset();
            document.getElementById('event-id').value = '';
            document.getElementById('event-item-type').value = itemType;

            let titleTxt = 'Add New Content Task';
            if (itemType === 'event') titleTxt = 'Add Offline Event';
            if (itemType === 'game') titleTxt = 'Add New Game Launch';
            document.getElementById('modal-title').innerText = titleTxt;

            const startDate = dateStr ? dateStr : new Date().toISOString().split('T')[0];
            document.getElementById('event-start-date').value = startDate;
            document.getElementById('event-end-date').value = startDate;
            document.getElementById('event-image-link').value = '';

            document.getElementById('event-campaign-type').value = 'All';

            const docContainer = document.getElementById('document-link-container');
            const docInput = document.getElementById('event-document-link');
            if (itemType === 'task') {
                docContainer.style.display = 'block';

                docInput.value = '';
            } else {
                docContainer.style.display = 'none';
                docInput.removeAttribute('required');
                docInput.value = '';
            }

            const campContainer = document.getElementById('campaign-type-container');
            const assignContainer = document.getElementById('assignees-container');
            const campInput = document.getElementById('event-campaign-type');
            const imageContainer = document.getElementById('image-link-container');

            const isNonTask = itemType === 'event' || itemType === 'game';

            if (itemType === 'event') {
                imageContainer.style.display = 'block';
            } else {
                imageContainer.style.display = 'none';
            }

            const endDateContainer = document.getElementById('event-end-date-container');
            const endDateInput = document.getElementById('event-end-date');

            if (itemType === 'game') {
                endDateContainer.style.display = 'none';
                endDateInput.removeAttribute('required');
            } else {
                endDateContainer.style.display = 'block';
                endDateInput.setAttribute('required', 'required');
            }

            if (isNonTask) {
                campContainer.style.display = 'none';
                assignContainer.style.display = 'none';
                campInput.removeAttribute('required');
            } else {
                campContainer.style.display = 'block';
                assignContainer.style.display = 'block';
                campInput.setAttribute('required', 'required');
            }

            document.getElementById('delete-btn').style.display = 'none';
            document.getElementById('event-modal').classList.remove('hidden');
        }

        window.openAddModalWithDate = (dateStr) => {
            window.openTypeModal(dateStr);
        }

        window.openEditById = (id) => {
            const evt = window.events.find(e => e.id === id);
            if (evt) window.openEditModal(evt);
        }

        window.openEditModal = (evt) => {
            document.getElementById('event-form').reset();
            document.getElementById('event-id').value = evt.id;

            const itemType = evt.itemType || (evt.isEventOnly ? 'event' : 'task');
            document.getElementById('event-item-type').value = itemType;

            let titleTxt = 'Edit Content Task';
            if (itemType === 'event') titleTxt = 'Edit Offline Event';
            if (itemType === 'game') titleTxt = 'Edit New Game Launch';
            document.getElementById('modal-title').innerText = titleTxt;

            document.getElementById('event-title').value = evt.title;
            document.getElementById('event-start-date').value = evt.startDate;
            document.getElementById('event-end-date').value = evt.endDate;
            document.getElementById('event-campaign-type').value = evt.campaignType || 'All';
            document.getElementById('event-image-link').value = evt.imageLink || '';

            const campContainer = document.getElementById('campaign-type-container');
            const assignContainer = document.getElementById('assignees-container');
            const campInput = document.getElementById('event-campaign-type');
            const imageContainer = document.getElementById('image-link-container');

            const docContainer = document.getElementById('document-link-container');
            const docInput = document.getElementById('event-document-link');
            if (itemType === 'task') {
                docContainer.style.display = 'block';

                docInput.value = (evt.fields && evt.fields.documents && evt.fields.documents.length > 0) ? evt.fields.documents[0].url : '';
            } else {
                docContainer.style.display = 'none';
                docInput.removeAttribute('required');
                docInput.value = '';
            }

            const isNonTask = itemType === 'event' || itemType === 'game';

            if (itemType === 'event') {
                imageContainer.style.display = 'block';
            } else {
                imageContainer.style.display = 'none';
            }

            const endDateContainer = document.getElementById('event-end-date-container');
            const endDateInput = document.getElementById('event-end-date');

            if (itemType === 'game') {
                endDateContainer.style.display = 'none';
                endDateInput.removeAttribute('required');
            } else {
                endDateContainer.style.display = 'block';
                endDateInput.setAttribute('required', 'required');
            }

            if (isNonTask) {
                campContainer.style.display = 'none';
                assignContainer.style.display = 'none';
                campInput.removeAttribute('required');
            } else {
                campContainer.style.display = 'block';
                assignContainer.style.display = 'block';
                campInput.setAttribute('required', 'required');
            }

            const assigns = evt.assignees || [];
            document.querySelectorAll('input[name="assignees"]').forEach(cb => {
                cb.checked = assigns.includes(cb.value);
            });
            document.getElementById('delete-btn').style.display = 'inline-block';
            document.getElementById('event-modal').classList.remove('hidden');
        }

        window.closeAddModal = () => {
            document.getElementById('event-modal').classList.add('hidden');
        }

        window.openTaskDrawer = (taskId) => {
            const evt = window.events.find(e => e.id === taskId);
            if (!evt) return;

            window.currentDrawerTaskId = taskId;

            const assignsStr = (evt.assignees && evt.assignees.length > 0) ? evt.assignees.join(', ') : 'Unassigned';
            document.getElementById('drawer-title').innerText = `[${evt.campaignType || 'All'}] ${evt.title} - ${assignsStr}`;

            window.updateDrawerProgressUI(evt);
            window.renderDrawerChecklist(evt);

            const overlay = document.getElementById('drawer-overlay');
            const drawer = document.getElementById('task-drawer');

            overlay.classList.remove('hidden');
            void overlay.offsetWidth;
            overlay.classList.remove('opacity-0');
            drawer.classList.remove('translate-x-full');
        };

        window.closeTaskDrawer = () => {
            const overlay = document.getElementById('drawer-overlay');
            const drawer = document.getElementById('task-drawer');

            overlay.classList.add('opacity-0');
            drawer.classList.add('translate-x-full');
            setTimeout(() => {
                overlay.classList.add('hidden');
                window.currentDrawerTaskId = null;
            }, 300);
        };

        window.updateDrawerProgressUI = (evt) => {
            const p = evt.progress || 0;
            const pFormatted = p.toFixed(2);
            document.getElementById('drawer-progress-text').innerText = `${pFormatted}%`;

            const bar = document.getElementById('drawer-progress-bar');
            bar.style.width = `${p}%`;
            bar.classList.remove('bg-emerald-50', 'dark:bg-emerald-500/200', 'bg-primary-600', 'bg-gray-400');

            if (p === 100) {
                bar.classList.add('bg-emerald-50', 'dark:bg-emerald-500/200');
            } else if (p > 0) {
                bar.classList.add('bg-primary-600');
            } else {
                bar.classList.add('bg-gray-400');
            }
        }

        window.handleHashtagEnter = (e, taskId) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const input = e.target;
                const val = input.value.trim();
                if (!val) return;

                const task = window.events.find(ev => ev.id === taskId);
                if (!task) return;

                if (!Array.isArray(task.fields.hashtags)) task.fields.hashtags = [];

                const newTags = val.split(/\s+/).filter(t => t.length > 0);
                newTags.forEach(tag => {
                    if (task.fields.hashtags.length < 10) {
                        task.fields.hashtags.push(tag);
                    }
                });

                input.value = '';
                task.progress = window.calcProgress(task);

                window.syncEventToFirestore(task);
                window.updateDrawerProgressUI(task);
                window.renderDrawerChecklist(task);
                if (window.renderUI) window.renderUI();

                setTimeout(() => { document.getElementById('hashtag-input')?.focus(); }, 10);
            }
        };

        window.removeHashtag = (taskId, idx) => {
            const task = window.events.find(ev => ev.id === taskId);
            if (!task || !Array.isArray(task.fields.hashtags)) return;

            task.fields.hashtags.splice(idx, 1);
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            window.renderDrawerChecklist(task);
            if (window.renderUI) window.renderUI();

            setTimeout(() => { document.getElementById('hashtag-input')?.focus(); }, 10);
        };

        window.renderDrawerChecklist = (evt) => {
            const list = document.getElementById('drawer-checklist');

            const existingDetails = list.querySelectorAll('details');
            if (existingDetails.length === 3) {
                drawerAccordionStates.links = existingDetails[0].open;
                drawerAccordionStates.media = existingDetails[1].open;
                drawerAccordionStates.ops = existingDetails[2].open;

            }

            const f = evt.fields || { ...defaultFields };

            let linksDone = 0;
            if (Array.isArray(f.documents) && f.documents.some(d => window.isValidURL(d.url))) linksDone++;

            let mediaDone = 0;
            if (Array.isArray(f.hashtags) && f.hashtags.length > 0) mediaDone++;
            if (Array.isArray(f.postIds) && f.postIds.some(p => p.id && p.id.trim() !== '')) mediaDone++;

            let opsDone = 0;
            ['gameReview', 'contentWriters', 'imChannels', 'trackableLinks',
                'dailyTask', 'sms', 'postPinned', 'rewardDistributed', 'rewardsBanner'].forEach(k => {
                if (f[k] === 'Yes' || f[k] === 'N/A') opsDone++;
            });
            if (f.ignoreListed) opsDone++;





            const makeAccordion = (title, done, total, content, isOpen = true) => {
                const isAllDone = done === total;
                const badgeClass = isAllDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-gray-700 dark:text-slate-300';
                return `
                    <details class="group mb-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-md shadow-slate-200/50 overflow-hidden" ${isOpen ? 'open' : ''}>
                        <summary class="cursor-pointer bg-slate-50 dark:bg-slate-900 px-4 py-3 font-semibold text-gray-800 dark:text-slate-200 text-sm hover:bg-slate-100 outline-none flex justify-between items-center transition-colors list-none [&::-webkit-details-marker]:hidden">
                            <div class="flex items-center">
                                <span>${title}</span>
                                <span class="ml-3 px-2 py-0.5 rounded-full text-xs font-bold ${badgeClass}">${done} / ${total}</span>
                            </div>
                            <i class="fa-solid fa-chevron-down text-gray-400 dark:text-slate-500 transition-transform duration-200 group-open:rotate-180"></i>
                        </summary>
                        <div class="p-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                            ${content}
                        </div>
                    </details>
                `;
            };

            const makeRadioHtml = (key, label) => {
                const val = f[key] || 'Pending';
                return `
                    <div class="flex flex-col p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md shadow-slate-200/50">
                        <label class="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">${label}</label>
                        <div class="flex space-x-4">
                            <label class="inline-flex items-center cursor-pointer hover:bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 transition-colors">
                                <input type="radio" name="${evt.id}-${key}" value="Yes" onchange="updateTaskField('${evt.id}', '${key}', this.value)" ${val === 'Yes' ? 'checked' : ''} class="text-primary-600 dark:text-primary-400 focus:ring-primary-500 w-4 h-4 cursor-pointer">
                                <span class="ml-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">Yes</span>
                            </label>
                            <label class="inline-flex items-center cursor-pointer hover:bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 transition-colors">
                                <input type="radio" name="${evt.id}-${key}" value="N/A" onchange="updateTaskField('${evt.id}', '${key}', this.value)" ${val === 'N/A' ? 'checked' : ''} class="text-primary-600 dark:text-primary-400 focus:ring-primary-500 w-4 h-4 cursor-pointer">
                                <span class="ml-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">N/A</span>
                            </label>
                        </div>
                    </div>
                `;
            };

            const makeDocumentsHtml = () => {
                const docs = Array.isArray(f.documents) ? f.documents : [];
                let rowsHtml = docs.map((d, i) => {
                    const isUrlValid = d.url === '' || window.isValidURL(d.url);
                    const borderClass = isUrlValid ? 'border-gray-300 dark:border-slate-600 focus:ring-primary-500' : 'border-red-500 text-red-900';
                    return `
                        <div class="flex flex-col space-y-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl relative">
                            <button type="button" onclick="removeDocument('${evt.id}', ${i})" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-500/20 rounded transition-colors"><i class="fa-solid fa-xmark"></i></button>
                            <div class="flex items-center space-x-2 pr-8">
                                <input type="text" placeholder="Document Type" value="${(d.type || '').replace(/"/g, '&quot;')}" onchange="updateDocumentField('${evt.id}', ${i}, 'type', this.value)" class="w-1/3 text-sm border border-gray-300 dark:border-slate-600 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-primary-500 bg-white dark:bg-slate-800">
                                <input type="url" value="${(d.url || '').replace(/"/g, '&quot;')}" placeholder="Link (http://)" onchange="updateDocumentField('${evt.id}', ${i}, 'url', this.value)" class="flex-1 text-sm border rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 ${borderClass} bg-white dark:bg-slate-800">
                            </div>
                            ${!isUrlValid ? `<p class="text-xs text-red-500 mt-1">Invalid URL format.</p>` : ''}
                        </div>
                    `;
                }).join('');

                return `
                    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md shadow-slate-200/50">
                        <div class="flex justify-between items-center mb-1 border-b border-slate-100 dark:border-slate-700 pb-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Documents</label>
                            <button type="button" onclick="addDocument('${evt.id}')" class="text-xs font-medium bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/30 px-2 py-1 rounded transition-colors"><i class="fa-solid fa-plus mr-1"></i> Add Document</button>
                        </div>
                        ${rowsHtml.length > 0 ? `<div class="space-y-1 mt-2">${rowsHtml}</div>` : '<p class="text-xs text-gray-500 dark:text-slate-400 mt-3 italic text-center">No documents added yet. Click + to add one.</p>'}
                    </div>
                `;
            };

            const makeHashtagsHtml = () => {
                const tags = Array.isArray(f.hashtags) ? f.hashtags : [];
                let pills = tags.map((t, i) => `
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mr-2 mb-2">
                        ${t}
                        <button type="button" onclick="removeHashtag('${evt.id}', ${i})" class="ml-1 text-primary-500 hover:text-primary-800"><i class="fa-solid fa-xmark"></i></button>
                    </span>
                `).join('');

                return `
                    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md shadow-slate-200/50">
                        <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Official Hashtags (Max 10)</label>
                        <div class="flex flex-wrap mb-1">${pills}</div>
                        <input type="text" id="hashtag-input" placeholder="Type and press Enter or Space..." onkeydown="handleHashtagEnter(event, '${evt.id}')" ${tags.length >= 10 ? 'disabled' : ''} class="w-full text-sm border border-gray-300 dark:border-slate-600 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-primary-500 disabled:bg-slate-100 disabled:cursor-not-allowed">
                    </div>
                `;
            };

            const makePostIdsHtml = () => {
                const posts = Array.isArray(f.postIds) ? f.postIds : [];
                let rowsHtml = posts.map((p, i) => `
                    <div class="flex flex-col space-y-2 mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl relative">
                        <button type="button" onclick="removePostId('${evt.id}', ${i})" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-red-50 dark:bg-red-500/20 rounded transition-colors"><i class="fa-solid fa-xmark"></i></button>
                        <div class="flex items-center space-x-2 pr-8">
                            <input type="text" placeholder="Platform" value="${(p.type || '').replace(/"/g, '&quot;')}" onchange="updatePostIdField('${evt.id}', ${i}, 'type', this.value)" class="w-28 text-sm border border-gray-300 dark:border-slate-600 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-primary-500 bg-white dark:bg-slate-800">
                            <input type="text" value="${(p.id || '').replace(/"/g, '&quot;')}" placeholder="Enter Post ID or URL..." onchange="updatePostIdField('${evt.id}', ${i}, 'id', this.value)" class="flex-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-primary-500 bg-white dark:bg-slate-800">
                        </div>
                        <div>
                            <input type="url" value="${(p.imgUrl || '').replace(/"/g, '&quot;')}" placeholder="Image URL..." onchange="updatePostIdField('${evt.id}', ${i}, 'imgUrl', this.value)" class="w-full text-sm border border-gray-300 dark:border-slate-600 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-primary-500 bg-white dark:bg-slate-800">
                        </div>
                    </div>
                `).join('');

                return `
                    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md shadow-slate-200/50">
                        <div class="flex justify-between items-center mb-1 border-b border-slate-100 dark:border-slate-700 pb-2">
                            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Post IDs</label>
                            <button type="button" onclick="addPostId('${evt.id}')" class="text-xs font-medium bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/30 px-2 py-1 rounded transition-colors"><i class="fa-solid fa-plus mr-1"></i> Add Post ID</button>
                        </div>
                        ${rowsHtml.length > 0 ? `<div class="space-y-1 mt-2">${rowsHtml}</div>` : '<p class="text-xs text-gray-500 dark:text-slate-400 mt-3 italic text-center">No post IDs added yet. Click + to add one.</p>'}
                    </div>
                `;
            };

            const makeCheckboxHtml = (key, label) => {
                const isChecked = f[key] ? 'checked' : '';
                return `
                    <div class="flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md shadow-slate-200/50 cursor-pointer hover:bg-slate-50 dark:bg-slate-900 transition-colors">
                        <input id="drawer-chk-${key}" type="checkbox" onchange="updateTaskField('${evt.id}', '${key}', this.checked)" ${isChecked} class="w-4 h-4 text-primary-600 dark:text-primary-400 bg-slate-100 border-gray-300 dark:border-slate-600 rounded cursor-pointer">
                        <label for="drawer-chk-${key}" class="ml-3 text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1">${label}</label>
                    </div>
                `;
            };

            const linksContent = `
                ${makeDocumentsHtml()}
            `;

            const mediaContent = `
                ${makeHashtagsHtml()}
                ${makePostIdsHtml()}
            `;

            const operationsContent = `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${makeRadioHtml('gameReview', 'Game Review')}
                    ${makeRadioHtml('dailyTask', 'Daily Task')}
                    ${makeRadioHtml('contentWriters', 'Content Writers')}
                    ${makeRadioHtml('imChannels', 'IM Channels')}
                    ${makeRadioHtml('trackableLinks', 'Trackable Links')}
                    ${makeRadioHtml('sms', 'SMS')}
                    ${makeRadioHtml('postPinned', 'Post Pinned')}
                    ${makeRadioHtml('rewardDistributed', 'Reward Distributed')}
                    ${makeRadioHtml('rewardsBanner', 'Rewards Banner')}
                </div>
                <div class="flex space-x-4 mt-4">
                    <div class="flex-1">${makeCheckboxHtml('ignoreListed', 'Ignore Listed')}</div>
                </div>
            `;



            list.innerHTML = `
                <div class="pb-8">
                    ${makeAccordion('Important Links', linksDone, 1, linksContent, drawerAccordionStates.links)}
                    ${makeAccordion('Content & Publishing', mediaDone, 2, mediaContent, drawerAccordionStates.media)}
                    ${makeAccordion('Operations Checklist', opsDone, 10, operationsContent, drawerAccordionStates.ops)}

                </div>
            `;
        }

        window.updateTaskField = (taskId, fieldName, val) => {
            const taskIdx = window.events.findIndex(e => e.id === taskId);
            if (taskIdx === -1) return;

            const task = window.events[taskIdx];
            if (!task.fields) task.fields = { ...defaultFields };

            task.fields[fieldName] = val;
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            window.renderDrawerChecklist(task);
            if (window.renderTasksTable) window.renderTasksTable();
            window.renderOngoingEvents();
        };


        window.addDocument = (taskId) => {
            const task = window.events.find(e => e.id === taskId);
            if (!task) return;
            if (!Array.isArray(task.fields.documents)) task.fields.documents = [];

            task.fields.documents.push({ type: '', url: '' });
            window.syncEventToFirestore(task);
            window.renderDrawerChecklist(task);
        };

        window.removeDocument = (taskId, idx) => {
            const task = window.events.find(e => e.id === taskId);
            if (!task || !Array.isArray(task.fields.documents)) return;

            task.fields.documents.splice(idx, 1);
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            window.renderDrawerChecklist(task);
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.updateDocumentField = (taskId, idx, key, val) => {
            const task = window.events.find(e => e.id === taskId);
            if (!task || !Array.isArray(task.fields.documents) || !task.fields.documents[idx]) return;

            task.fields.documents[idx][key] = val;
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.addPostId = (taskId) => {

            const task = window.events.find(e => e.id === taskId);
            if (!task) return;
            if (!Array.isArray(task.fields.postIds)) task.fields.postIds = [];

            task.fields.postIds.push({ type: '', id: '', imgUrl: '' });
            window.syncEventToFirestore(task);
            window.renderDrawerChecklist(task);
        };

        window.updatePostIdField = (taskId, idx, key, val) => {
            const task = window.events.find(e => e.id === taskId);
            if (!task || !Array.isArray(task.fields.postIds) || !task.fields.postIds[idx]) return;

            task.fields.postIds[idx][key] = val;
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.removePostId = (taskId, idx) => {
            const task = window.events.find(e => e.id === taskId);
            if (!task || !Array.isArray(task.fields.postIds)) return;

            task.fields.postIds.splice(idx, 1);
            task.progress = window.calcProgress(task);

            window.syncEventToFirestore(task);
            window.updateDrawerProgressUI(task);
            window.renderDrawerChecklist(task);
            if (window.renderTasksTable) window.renderTasksTable();
        };

        window.jumpToTask = (id) => {
            window.switchView('tasks');

            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            window.searchQuery = '';

            if (window.renderTasksTable) window.renderTasksTable();

            setTimeout(() => {
                const row = document.getElementById(`task-row-${id}`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.classList.remove('hover:bg-slate-50', 'dark:hover:bg-slate-900');
                    row.classList.add('bg-primary-100');
                    setTimeout(() => {
                        row.classList.remove('bg-primary-100');
                        row.classList.add('hover:bg-slate-50', 'dark:hover:bg-slate-900');
                    }, 2000);
                }
            }, 100);
        }

        window.showToast = (message, type = "info", iconOverride = null) => {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');

            let bg = 'bg-gray-800 dark:bg-slate-900';
            let icon = 'fa-circle-info';
            let iconColor = 'text-blue-400';

            if (type === 'success') { icon = 'fa-circle-check'; iconColor = 'text-emerald-400'; }
            if (type === 'error') { icon = 'fa-circle-xmark'; iconColor = 'text-red-400'; }
            if (iconOverride) { icon = iconOverride; }

            toast.className = `flex items-center w-full max-w-xs p-4 text-white ${bg} rounded-xl shadow toast-enter dark:text-gray-400 dark:bg-gray-800 dark:bg-slate-900`;
            toast.innerHTML = `
                <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-xl">
                    <i class="fa-solid ${icon} ${iconColor} text-lg"></i>
                </div>
                <div class="ml-3 text-sm font-normal">${message}</div>
            `;

            container.appendChild(toast);

            requestAnimationFrame(() => {
                toast.classList.remove('toast-enter');
                toast.classList.add('toast-enter-active');
            });

            setTimeout(() => {
                toast.classList.remove('toast-enter-active');
                toast.classList.add('toast-exit-active');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }


        window.onload = () => {
            window.initApp();
            const hash = window.location.hash.substring(1);
            if (hash) {
                window.switchView(hash);
            } else {
                const activeView = localStorage.getItem('spo_active_view') || 'dashboard';
                window.switchView(activeView);
            }
        };



        window.calculateCWDuration = () => {
            const start = document.getElementById('cwr-support-date').value;
            const end = document.getElementById('cwr-support-end-date').value;
            const durationEl = document.getElementById('cwr-duration');
            if (start && end) {
                const s = new Date(start);
                const e = new Date(end);
                const diffTime = e - s;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                durationEl.value = diffDays >= 0 ? diffDays + " days" : "Invalid Dates";
            } else {
                durationEl.value = '';
            }
        };

        window.renderCWhashtags = () => {
            const container = document.getElementById('cwr-hashtags-container');
            const input = document.getElementById('cwr-hashtag-input');
            if (!container || !input) return;

            let pills = window.cwTempHashtags.map((t, i) => `
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mr-2 mb-2">
                    ${t}
                    <button type="button" onclick="removeCWhashtag(${i})" class="ml-1 text-primary-500 hover:text-primary-800"><i class="fa-solid fa-xmark"></i></button>
                </span>
            `).join('');

            container.innerHTML = pills;
            if (window.cwTempHashtags.length >= 10) {
                input.disabled = true;
                input.classList.add('bg-slate-100', 'cursor-not-allowed');
            } else {
                input.disabled = false;
                input.classList.remove('bg-slate-100', 'cursor-not-allowed');
            }
        };

        window.handleCWhashtagEnter = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const input = e.target;
                const val = input.value.trim();
                if (!val) return;

                const newTags = val.split(/\s+/).filter(t => t.length > 0);
                newTags.forEach(tag => {
                    if (window.cwTempHashtags.length < 10) {
                        window.cwTempHashtags.push(tag);
                    }
                });

                input.value = '';
                window.renderCWhashtags();
            }
        };

        window.removeCWhashtag = (idx) => {
            window.cwTempHashtags.splice(idx, 1);
            window.renderCWhashtags();
        };

        window.openCWRequestModal = (id = null) => {
            const form = document.getElementById('cw-request-form');
            if (form) form.reset();
            document.getElementById('cwr-id').value = '';
            if (document.getElementById('cwr-support-end-date')) document.getElementById('cwr-support-end-date').value = '';
            document.getElementById('cw-request-modal-title').innerText = 'Create Copy Writer Request';
            const supportTypeRadiosReset = document.getElementsByName('cwr-support-type');
            for (let i = 0; i < supportTypeRadiosReset.length; i++) supportTypeRadiosReset[i].checked = false;
            window.cwTempHashtags = [];
            window.renderCWhashtags();

            if (id) {
                const req = window.cwRequests.find(p => p.id === id);
                if (req) {
                    document.getElementById('cwr-id').value = req.id;

                    document.getElementById('cwr-campaign-name').value = req.campaignName || '';
            if (document.getElementById('cw-end-date')) document.getElementById('cw-end-date').value = req.endDate || '';
                    const supportTypeRadios = document.getElementsByName('cwr-support-type');
                    for (let i = 0; i < supportTypeRadios.length; i++) {
                        supportTypeRadios[i].checked = (supportTypeRadios[i].value === req.supportType);
                    }
                    document.getElementById('cwr-campaign-file').value = req.campaignFile || '';
                    document.getElementById('cwr-support-date').value = req.supportDate || '';
                    document.getElementById('cwr-support-end-date').value = req.endDate || '';
                    document.getElementById('cwr-campaign-status').value = req.campaignStatus || 'Upcoming';
                    document.getElementById('cwr-priority-level').value = req.priorityLevel || 'S Level';
                    document.getElementById('cwr-priority-rationale').value = req.priorityRationale || '';
                    document.getElementById('cwr-posting-requirements').value = req.postingRequirements || '';
                    document.getElementById('cwr-game-configuration').value = req.gameConfiguration || '';
                    document.getElementById('cwr-special-payout').value = req.specialPayout || '';


                    window.cwTempHashtags = Array.isArray(req.officialHashtags) ? [...req.officialHashtags] : [];
                    window.renderCWhashtags();

                    const formatCheckboxes = document.querySelectorAll('input[name="cwr-content-format"]');
                    const formats = req.contentFormat || [];
                    formatCheckboxes.forEach(cb => {
                        cb.checked = formats.includes(cb.value);
                    });

                    window.calculateCWDuration();
                    document.getElementById('cw-request-modal-title').innerText = 'Edit Copy Writer Request';
                }
            }

            document.getElementById('cw-request-modal').classList.remove('hidden');
        };

        window.closeCWRequestModal = () => {
            document.getElementById('cw-request-modal').classList.add('hidden');
        };

        window.saveCWRequest = async () => {
            const form = document.getElementById('cw-request-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('cwr-id').value;
            const existingCw = id ? window.cwRequests.find(p => p.id === id) : null;
            const requestedBy = existingCw && existingCw.requestedBy ? existingCw.requestedBy : (window.currentUserProfile || 'Unknown');
            const campaignName = document.getElementById('cwr-campaign-name').value.trim();
            const campaignFile = document.getElementById('cwr-campaign-file').value.trim();
            let supportType = '';
            const supportTypeRadiosSave = document.getElementsByName('cwr-support-type');
            for (let i = 0; i < supportTypeRadiosSave.length; i++) {
                if (supportTypeRadiosSave[i].checked) supportType = supportTypeRadiosSave[i].value;
            }
            const supportDate = document.getElementById('cwr-support-date').value;
            const supportEndDate = document.getElementById('cwr-support-end-date').value;
            const campaignStatus = document.getElementById('cwr-campaign-status').value;
            const priorityLevel = document.getElementById('cwr-priority-level').value;
            const priorityRationale = document.getElementById('cwr-priority-rationale').value.trim();
            const postingRequirements = document.getElementById('cwr-posting-requirements').value.trim();
            const gameConfiguration = document.getElementById('cwr-game-configuration').value.trim();
            const specialPayout = document.getElementById('cwr-special-payout').value.trim();


            const formatCheckboxes = document.querySelectorAll('input[name="cwr-content-format"]:checked');
            const contentFormat = Array.from(formatCheckboxes).map(cb => cb.value);

            const reqId = id ? id : Date.now().toString();
            const existing = id ? window.cwRequests.find(p => p.id === id) : null;

            const supportEndDateField = document.getElementById('cwr-support-end-date') ? document.getElementById('cwr-support-end-date').value : '';

            const reqData = {
                id: reqId,
                requestedBy,
                campaignName,
                endDate: supportEndDateField,
                campaignFile,
                supportType,
                supportDate,
                campaignStatus,
                priorityLevel,
                priorityRationale,
                postingRequirements,
                contentFormat,
                gameConfiguration,
                officialHashtags: window.cwTempHashtags,
                specialPayout,

                createdDate: existing && existing.createdDate ? existing.createdDate : window.getFormattedCreatedTime(),
                updateDate: window.getFormattedCreatedTime()
            };

            if (id) {
                reqData.editedBy = window.currentUserProfile || 'Unknown';
            }

            const btn = document.getElementById('save-cwr-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {

    const oldCw = window.cwRequests.find(p => p.id === reqId);
    if (oldCw && oldCw.requestStatus !== reqData.requestStatus) {
        if (reqData.requestedBy && reqData.requestedBy !== window.currentUserProfile) {
            window.logNotification(`CW Request "${reqData.campaignName}" status was updated to ${reqData.requestStatus} by ${window.currentUserProfile}`, reqData.requestedBy, 'content_writer', reqData.id);
        }
    }
    const idx = window.cwRequests.findIndex(p => p.id === reqId);
                if (idx > -1) window.cwRequests[idx] = reqData;
    else {
        window.cwRequests.push(reqData);
        window.notifyPOCs(`New Content Writer Request "${reqData.campaignName}" submitted by ${window.currentUserProfile}`, 'copy_writer', 'content_writer', reqData.id);
    }

                localStorage.setItem('spo_cw_requests', JSON.stringify(window.cwRequests));

                if (db) {
                    await setDoc(doc(db, "cw_requests", reqId), reqData);
                }

                window.showToast(id ? "CW request updated" : "CW request added", "success");
                window.closeCWRequestModal();
                if (window.currentView === 'content_writer') {
                    window.renderCWRequestsTable();
                }
            } catch (err) {
                console.error(err);
                window.showToast("Error saving CW request", "error");
            } finally {
                btn.innerHTML = 'Save Request';
                btn.disabled = false;
            }
        };


        window.completeCWRequest = function(id) {
            const req = window.cwRequests.find(r => r.id === id);
            if (req) {
                req.requestStatus = 'Completed';
                window.syncCWRequestSilent(req);
                window.renderCWRequestsTable();

                const detailsModal = document.getElementById('cw-request-details-modal');
                if (detailsModal && !detailsModal.classList.contains('hidden') && document.getElementById('cw-details-id') && document.getElementById('cw-details-id').value === id) {
                    const statusEl = document.getElementById('cw-details-request-status');
                    if(statusEl) {
                        statusEl.innerText = 'Completed';
                        statusEl.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
                    }
                }
            }
        };

        window.syncCWRequestSilent = async function(req) {
            let requests = JSON.parse(localStorage.getItem('spo_cw_requests') || '[]');
            const index = requests.findIndex(r => r.id === req.id);
            if (index > -1) {
                requests[index] = req;
            } else {
                requests.push(req);
            }
            localStorage.setItem('spo_cw_requests', JSON.stringify(requests));
            if (db) {
                try { await setDoc(doc(db, "cw_requests", req.id), req); } catch(e) { console.error(e); }
            }
        };

        window.deleteCWRequest = async (id) => {
            if (confirm('Are you sure you want to delete this content writer request?')) {
                window.cwRequests = window.cwRequests.filter(p => String(p.id) !== String(id));
                localStorage.setItem('spo_cw_requests', JSON.stringify(window.cwRequests));

                if (db) {
                    try { await deleteDoc(doc(db, "cw_requests", id)); }
                    catch(e) {}
                }

                if (window.currentView === 'content_writer') {
                    window.renderCWRequestsTable();
                }
                window.showToast("CW request deleted", "success");
            }
        };


        // ================= SMS LOGIC =================
        window.smsRequests = JSON.parse(localStorage.getItem('spo_sms_requests') || '[]');



        window.openSMSModal = function(id = null) {
            document.getElementById('sms-modal-form').reset();
            const requestorInput = document.getElementById('sms-requestor');

            let userName = 'Unknown User';
            if (window.currentUserProfile) {
                try {
                    const profileObj = JSON.parse(window.currentUserProfile);
                    userName = profileObj.name || profileObj.username || 'Unknown User';
                } catch(e) {
                    userName = window.currentUserProfile;
                }
            }
            requestorInput.value = userName;


            if (id) {
                const req = window.smsRequests.find(r => r.id === id);
                if (req) {
                    document.getElementById('sms-id').value = req.id;
                    document.getElementById('sms-campaign-name').value = req.campaignName || '';
            if (document.getElementById('sms-end-datetime')) document.getElementById('sms-end-datetime').value = req.endDatetime || '';
                    document.getElementById('sms-event-datetime').value = req.eventDateTime || '';
                    document.getElementById('sms-budget').value = req.budget || '';
                    document.getElementById('sms-doc-link').value = req.docLink || '';
                    document.getElementById('sms-short-link').value = req.shortLink || '';
                    requestorInput.value = req.requestor || '';
                    document.getElementById('sms-modal-title').innerText = 'Edit SMS Request';
                }
            } else {
                document.getElementById('sms-id').value = '';
                document.getElementById('sms-modal-title').innerText = 'Create SMS Request';
            }
            document.getElementById('sms-modal').classList.remove('hidden');
        };

        window.closeSMSModal = function() {
            document.getElementById('sms-modal').classList.add('hidden');
        };

        window.saveSMSRequest = async function(event) {
            event.preventDefault();
            const id = document.getElementById('sms-id').value;
            const payload = {
                campaignName: document.getElementById('sms-campaign-name').value,
                endDatetime: document.getElementById('sms-end-datetime') ? document.getElementById('sms-end-datetime').value : '',
                eventDateTime: document.getElementById('sms-event-datetime').value,
                budget: parseFloat(document.getElementById('sms-budget').value),
                docLink: document.getElementById('sms-doc-link').value,
                shortLink: document.getElementById('sms-short-link').value,
                requestor: document.getElementById('sms-requestor').value
            };

            if (id) {
                payload.editedBy = window.currentUserProfile || 'Unknown';
                const index = window.smsRequests.findIndex(r => r.id === id);
                if (index > -1) {
                    window.smsRequests[index] = { ...window.smsRequests[index], ...payload };
                }
            } else {
                const newReq = {
                    id: "sms-" + Date.now(),
                    createdAt: window.getFormattedCreatedTime ? window.getFormattedCreatedTime() : window.getPHIsoString(),
                    requestStatus: "Pending",
                    ...payload
                };
                window.smsRequests.push(newReq);
    window.notifyPOCs(`New SMS Request "${newReq.campaignName}" submitted by ${window.currentUserProfile}`, 'sms', 'sms', newReq.id);
            }

            const reqToSave = id ? window.smsRequests.find(r => r.id === id) : window.smsRequests[window.smsRequests.length - 1];
    if (id) {
        const oldReq = JSON.parse(localStorage.getItem('spo_sms_requests') || '[]').find(r => r.id === id);
        if (oldReq && oldReq.requestStatus !== reqToSave.requestStatus) {
            if (reqToSave.requestedBy && reqToSave.requestedBy !== window.currentUserProfile) {
                window.logNotification(`SMS Request "${reqToSave.campaignName}" status was updated to ${reqToSave.requestStatus} by ${window.currentUserProfile}`, reqToSave.requestedBy, 'sms', reqToSave.id);
            }
        }
    }
            localStorage.setItem('spo_sms_requests', JSON.stringify(window.smsRequests));

            if (db) {
                try { await setDoc(doc(db, "sms_requests", reqToSave.id), reqToSave); } catch(e) { console.error(e); }
            }
            window.closeSMSModal();
            window.renderSMSTable();
        };

        window.deleteSMSRequest = async function(id) {
            if (confirm("Are you sure you want to delete this SMS Request?")) {
                window.smsRequests = window.smsRequests.filter(r => String(r.id) !== String(id));
                localStorage.setItem('spo_sms_requests', JSON.stringify(window.smsRequests));

                if (db) {
                    try { await deleteDoc(doc(db, "sms_requests", id)); } catch(e) { console.error(e); }
                }
                window.renderSMSTable();
            }
        };

        window.completeSMSRequest = function(id) {
            const req = window.smsRequests.find(r => r.id === id);
            if (!req) return;
            document.getElementById('sms-complete-form').reset();
            document.getElementById('smsc-id').value = id;
            document.getElementById('smsc-rate').value = '0.00%';
            document.getElementById('sms-complete-modal').classList.remove('hidden');
        };

        window.closeSMSCompleteModal = function() {
            const modal = document.getElementById('sms-complete-modal');
            if (modal) modal.classList.add('hidden');
        };

        window.calcSMSRate = () => {
            const clicked = parseInt(document.getElementById('smsc-clicked').value) || 0;
            const recipients = parseInt(document.getElementById('smsc-recipients').value) || 0;
            const rateEl = document.getElementById('smsc-rate');
            if (recipients > 0) {
                const rate = (clicked / recipients) * 100;
                rateEl.value = rate.toFixed(2) + '%';
            } else {
                rateEl.value = '0.00%';
            }
        };

        setTimeout(() => {
            const cEl = document.getElementById('smsc-clicked');
            const rEl = document.getElementById('smsc-recipients');
            if(cEl) cEl.addEventListener('input', window.calcSMSRate);
            if(rEl) rEl.addEventListener('input', window.calcSMSRate);
        }, 100);

        window.submitSMSComplete = async function() {
            const form = document.getElementById('sms-complete-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('smsc-id').value;
            const req = window.smsRequests.find(r => r.id === id);
            if (!req) return;

            req.usersClicked = parseInt(document.getElementById('smsc-clicked').value) || 0;
            req.actualRecipients = parseInt(document.getElementById('smsc-recipients').value) || 0;
            req.actualBudget = parseFloat(document.getElementById('smsc-actual-budget').value) || 0;
            req.loginRate = document.getElementById('smsc-rate').value;

            req.requestStatus = 'Completed';

            const btn = document.querySelector('#sms-complete-form button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
                btn.disabled = true;
            }

            try {
                await window.syncSMSRequestSilent(req);
                window.showToast("SMS Request marked as completed", "success");
                window.closeSMSCompleteModal();
                if(window.renderSMSTable) window.renderSMSTable();

                const detailsModal = document.getElementById('sms-details-modal');
                if (detailsModal && !detailsModal.classList.contains('hidden') && document.getElementById('sms-details-id').value === id) {
                    window.openSMSDetails(id); // Reload details modal to show new metrics
                }
            } catch(e) {
                window.showToast("Error saving: " + e.message, "error");
            } finally {
                if (btn) {
                    btn.innerHTML = 'Confirm Completion';
                    btn.disabled = false;
                }
            }
        };

        window.syncSMSRequestSilent = async function(req) {
            let requests = JSON.parse(localStorage.getItem('spo_sms_requests') || '[]');
            const index = requests.findIndex(r => r.id === req.id);
            if (index > -1) {
                requests[index] = req;
            } else {
                requests.push(req);
            }
            localStorage.setItem('spo_sms_requests', JSON.stringify(requests));
            if (db) {
                try { await setDoc(doc(db, "sms_requests", req.id), req); } catch(e) { console.error(e); }
            }
        };

        window.openSMSDetails = function(id) {
            const req = window.smsRequests.find(r => r.id === id);
            if (!req) return;

            if ((!req.requestStatus || req.requestStatus === 'Pending') && window.isCurrentUserPOC('sms')) {
                req.requestStatus = 'Under Review';
                window.syncSMSRequestSilent(req);
                window.renderSMSTable();
            }

            document.getElementById('sms-details-campaign-name').innerText = req.campaignName || '-';
            document.getElementById('sms-details-event-datetime').innerText = req.eventDateTime || '-';
            document.getElementById('sms-details-budget').innerText = `PHP ${parseFloat(req.budget || 0).toFixed(2)}`;

            const docLinkEl = document.getElementById('sms-details-doc-link');
            if (req.docLink) {
                docLinkEl.href = req.docLink;
                docLinkEl.innerText = req.docLink;
            } else {
                docLinkEl.href = '#';
                docLinkEl.innerText = '-';
            }

            const shortLinkEl = document.getElementById('sms-details-short-link');
            if (req.shortLink) {
                shortLinkEl.href = req.shortLink;
                shortLinkEl.innerText = req.shortLink;
            } else {
                shortLinkEl.href = '#';
                shortLinkEl.innerText = '-';
            }

            document.getElementById('sms-details-created-at').innerText = req.createdAt || '-';
            document.getElementById('sms-details-requestor').innerHTML = window.formatUserBadge ? window.formatUserBadge(req.requestor) : req.requestor;

            const reqStatus = req.requestStatus || 'Pending';
            const statusColors = { 'Pending': 'bg-yellow-100 text-yellow-800', 'Under Review': 'bg-blue-100 text-blue-800', 'Completed': 'bg-green-100 text-green-800' };
            document.getElementById('sms-details-request-status').innerText = reqStatus;
            document.getElementById('sms-details-request-status').className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reqStatus] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'}`;
            document.getElementById('sms-details-id').value = req.id;

            const metricsSection = document.getElementById('sms-details-completion-metrics');
            if (reqStatus === 'Completed') {
                metricsSection.classList.remove('hidden');
                document.getElementById('sms-details-clicked').innerText = req.usersClicked || 0;
                document.getElementById('sms-details-recipients').innerText = req.actualRecipients || 0;
                document.getElementById('sms-details-actual-budget').innerText = `PHP ${parseFloat(req.actualBudget || 0).toFixed(2)}`;
                document.getElementById('sms-details-login-rate').innerText = req.loginRate || '0.00%';
            } else {
                metricsSection.classList.add('hidden');
            }

            document.getElementById('sms-details-modal').classList.remove('hidden');
        };

        window.closeSMSDetails = function() {
            document.getElementById('sms-details-modal').classList.add('hidden');
        };

        window.exportSMSRequestsExcel = function() {
            const data = window.smsRequests.map(req => ({
                'Campaign Name': req.campaignName,
                'Target Date': req.targetDate,
                'Audience Type': req.audienceType,
                'Message Content': req.messageContent,
                'Notes': req.notes,
                'Requested By': req.requestor,
                'Created At': req.createdAt,
                'Request Status': req.requestStatus || 'Pending'
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "SMS Requests");
            XLSX.writeFile(workbook, "SMS_Requests.xlsx");
        };

        window.exportCWRequestsExcel = () => {
            if (!window.cwRequests || window.cwRequests.length === 0) {
                alert("No CW requests to export.");
                return;
            }

            const data = window.cwRequests.map(p => {
                return {
                    "RequestedBy": p.requestedBy,
                    "CampaignName": p.campaignName,
                    "CampaignFile": p.campaignFile,
                    "SupportType": p.supportType,
                    "SupportStartDate": p.supportDate,
                    "SupportEndDate": p.supportEndDate,
                    "CampaignStatus": p.campaignStatus,
                    "PriorityLevel": p.priorityLevel,
                    "PriorityRationale": p.priorityRationale,
                    "PostingRequirements": p.postingRequirements,
                    "ContentFormat": (p.contentFormat || []).join(', '),
                    "GameConfiguration": p.gameConfiguration,
                    "OfficialHashtags": (p.officialHashtags || []).join(', '),
                    "SpecialPayout": p.specialPayout,

                    "CreatedDate": p.createdDate || '',
                    "UpdateDate": p.updateDate || ''
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "CW Requests");
            XLSX.writeFile(workbook, "SPO_CW_Requests_Export.xlsx");
        };




        window.openPDRequestModal = (id = null) => {
            const form = document.getElementById('pd-request-form');
            if (form) form.reset();
            document.getElementById('pdr-id').value = '';
            if (document.getElementById('pdr-event-datetime')) document.getElementById('pdr-event-datetime').value = '';
            document.getElementById('pd-request-modal-title').innerText = 'Create Prize Distribution Request';

            if (id) {
                const req = window.pdRequests.find(p => p.id === id);
                if (req) {
                    document.getElementById('pdr-id').value = req.id;
                    document.getElementById('pdr-campaign-name').value = req.campaignName || '';
            if (document.getElementById('pdr-event-datetime')) {
                let edv = req.eventDatetime || '';
                if (edv.includes(' ')) edv = edv.replace(' ', 'T');
                document.getElementById('pdr-event-datetime').value = edv.substring(0, 16);
            }

                    document.getElementById('pdr-campaign-doc').value = req.campaignDocLink || '';
                    document.getElementById('pdr-winner-list-doc').value = req.winnerListDocLink || '';
                    document.getElementById('pdr-budget-amount').value = req.budgetAmount || '';
                    document.getElementById('pdr-actual-amount').value = req.actualAmount || '';
                    document.getElementById('pd-request-modal-title').innerText = 'Edit Prize Distribution Request';
                }
            }

            document.getElementById('pd-request-modal').classList.remove('hidden');
        };

        window.closePDRequestModal = () => {
            document.getElementById('pd-request-modal').classList.add('hidden');
        };

        window.savePDRequest = async () => {
            const form = document.getElementById('pd-request-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('pdr-id').value;
            const campaignName = document.getElementById('pdr-campaign-name').value.trim();
            const eventDatetime = document.getElementById('pdr-event-datetime') ? document.getElementById('pdr-event-datetime').value.trim() : '';
            const existingPd = id ? window.pdRequests.find(p => p.id === id) : null;
            const requestedBy = existingPd && existingPd.requestedBy ? existingPd.requestedBy : (window.currentUserProfile || 'Unknown');
            const campaignDocLink = document.getElementById('pdr-campaign-doc').value.trim();
            const winnerListDocLink = document.getElementById('pdr-winner-list-doc').value.trim();
            const budgetAmount = parseFloat(document.getElementById('pdr-budget-amount').value) || 0;
            const actualAmount = parseFloat(document.getElementById('pdr-actual-amount').value) || 0;

            const reqId = id ? id : Date.now().toString();
            const existing = id ? window.pdRequests.find(p => p.id === id) : null;

            // Keep existing status or default for new requests
            const status = existing ? existing.status : 'Pending';

            const reqData = {
                id: reqId,
                campaignName,
                eventDatetime,
                requestedBy,
                campaignDocLink,
                winnerListDocLink,
                budgetAmount,
                actualAmount,
                status,
                submissionTime: existing && existing.submissionTime ? existing.submissionTime : window.getFormattedCreatedTime(),
                updateDate: window.getFormattedCreatedTime()
            };

            if (id) {
                reqData.editedBy = window.currentUserProfile || 'Unknown';
            }

            const btn = document.getElementById('save-pdr-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {

    const oldPd = window.pdRequests.find(p => p.id === reqId);
    if (oldPd && oldPd.status !== reqData.status) {
        if (reqData.requestedBy && reqData.requestedBy !== window.currentUserProfile) {
            window.logNotification(`PD Request "${reqData.campaignName}" status was updated to ${reqData.status} by ${window.currentUserProfile}`, reqData.requestedBy, 'prize_distribution', reqData.id);
        }
    }
    const idx = window.pdRequests.findIndex(p => p.id === reqId);
                if (idx > -1) window.pdRequests[idx] = reqData;
    else {
        window.pdRequests.push(reqData);
        window.notifyPOCs(`New Prize Distribution Request "${reqData.campaignName}" submitted by ${window.currentUserProfile}`, 'prize_distribution', 'prize_distribution', reqData.id);
    }

                localStorage.setItem('spo_pd_requests', JSON.stringify(window.pdRequests));

                if (db) {
                    await setDoc(doc(db, "pd_requests", reqId), reqData);
                }

                window.showToast(id ? "PD request updated" : "PD request added", "success");
                window.closePDRequestModal();
                if (window.currentView === 'prize_distribution') {
                    window.renderPDRequestsTable();
                }
            } catch (err) {
                console.error(err);
                window.showToast("Error saving PD request", "error");
            } finally {
                btn.innerHTML = 'Save Request';
                btn.disabled = false;
            }
        };

        window.deletePDRequest = async (id) => {
            if (confirm('Are you sure you want to delete this prize distribution request?')) {
                window.pdRequests = window.pdRequests.filter(p => String(p.id) !== String(id));
                localStorage.setItem('spo_pd_requests', JSON.stringify(window.pdRequests));

                if (db) {
                    try { await deleteDoc(doc(db, "pd_requests", id)); }
                    catch(e) {}
                }

                if (window.currentView === 'prize_distribution') {
                    window.renderPDRequestsTable();
                }
                window.showToast("PD request deleted", "success");
            }
        };

        window.exportPDRequestsExcel = () => {
            if (!window.pdRequests || window.pdRequests.length === 0) {
                alert("No PD requests to export.");
                return;
            }

            const data = window.pdRequests.map(p => {
                return {
                    "CampaignName": p.campaignName,
                    "SubmissionTime": p.submissionTime,
                    "RequestedBy": p.requestedBy,
                    "CampaignDocLink": p.campaignDocLink,
                    "WinnerListDocLink": p.winnerListDocLink,
                    "BudgetAmount": p.budgetAmount,
                    "ActualAmount": p.actualAmount,
                    "Status": p.status,
                    "UpdateDate": p.updateDate
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "PD Requests");
            XLSX.writeFile(workbook, "SPO_PD_Requests_Export.xlsx");
        };








        window.syncPinRequestSilent = async function(req) {
            let requests = JSON.parse(localStorage.getItem('spo_pin_requests') || '[]');
            const index = requests.findIndex(r => r.id === req.id);
            if (index > -1) {
                requests[index] = req;
            } else {
                requests.push(req);
            }

            // CRITICAL FIX: Update in-memory state so table updates instantly
            window.pinRequests = requests;

            localStorage.setItem('spo_pin_requests', JSON.stringify(requests));
            if (db) {
                try { await setDoc(doc(db, "pin_requests", req.id), req); } catch(e) { console.error(e); }
            }
            if (window.currentView === 'pin_request') {
                window.renderPinRequestsTable();
            }
        };

        window.openPinRequestDetails = (id) => {
            const req = window.pinRequests.find(p => p.id === id);
            if (!req) return;

            if (req.status === 'Pending' && window.isCurrentUserPOC('post_management')) {
        if (req.owner && req.owner !== window.currentUserProfile) {
            window.logNotification(`Pin Request "${req.campaignName}" is now Under Review by ${window.currentUserProfile}`, req.owner, 'pin_request', req.id);
        }

                req.status = 'Under Review';
                window.syncPinRequestSilent(req);
            }

            document.getElementById('detail-pr-campaign-name').innerText = req.campaignName || 'N/A';
            document.getElementById('detail-pr-start-date').innerText = req.startDate || 'N/A';
            document.getElementById('detail-pr-end-date').innerText = req.endDate || 'N/A';
            document.getElementById('detail-pr-category').innerText = req.category || 'N/A';
            document.getElementById('detail-pr-priority').innerText = req.priority || 'N/A';
            document.getElementById('detail-pr-post-id').innerText = req.postId || 'N/A';
            document.getElementById('detail-pr-post-title').innerText = req.postTitle || 'N/A';
            document.getElementById('detail-pr-owner').innerText = req.owner || 'N/A';
            document.getElementById('detail-pr-status').innerText = req.status || 'N/A';
            document.getElementById('detail-pr-remark').innerText = req.remark || 'N/A';

            document.getElementById('detail-pr-page').innerText = req.page || '-';
            document.getElementById('detail-pr-position').innerText = req.position || '-';
            document.getElementById('detail-pr-sort').innerText = req.sort || '-';

            document.getElementById('pin-request-details-modal').classList.remove('hidden');
        };

        window.closePinRequestDetails = () => {
            document.getElementById('pin-request-details-modal').classList.add('hidden');
        };

        window.openCWRequestDetails = (id) => {
            const req = window.cwRequests.find(p => p.id === id);
            if (!req) return;
            if ((!req.requestStatus || req.requestStatus === 'Pending') && window.isCurrentUserPOC('copy_writer')) {
                req.requestStatus = 'Under Review';
                if(window.syncCWRequestSilent) window.syncCWRequestSilent(req);
                if(window.renderCWRequestsTable) window.renderCWRequestsTable();
            }

            document.getElementById('detail-cwr-campaign-name').innerText = req.campaignName || 'N/A';
        if(document.getElementById('detail-cwr-end-date')) document.getElementById('detail-cwr-end-date').innerText = req.endDate || '-';
            document.getElementById('detail-cwr-requested-by').innerText = req.requestedBy || 'N/A';
            const reqStatus = req.requestStatus || 'Pending';
            const statusColors = { 'Pending': 'bg-yellow-100 text-yellow-800', 'Under Review': 'bg-blue-100 text-blue-800', 'Completed': 'bg-green-100 text-green-800' };
            const statusEl = document.getElementById('cw-details-request-status');
            if (statusEl) {
                statusEl.innerText = reqStatus;
                statusEl.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[reqStatus] || 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200'}`;
            }
            const idEl = document.getElementById('cw-details-id');
            if(idEl) idEl.value = req.id;
            document.getElementById('detail-cwr-campaign-status').innerText = req.campaignStatus || 'N/A';
            document.getElementById('detail-cwr-support-type').innerText = req.supportType || 'N/A';

            const fileLink = document.getElementById('detail-cwr-campaign-file');
            if (req.campaignFile) {
                fileLink.href = req.campaignFile;
                fileLink.innerText = req.campaignFile;
            } else {
                fileLink.removeAttribute('href');
                fileLink.innerText = 'N/A';
            }

            document.getElementById('detail-cwr-support-date').innerText = req.supportDate || 'N/A';
            document.getElementById('detail-cwr-support-end-date').innerText = req.endDate || 'N/A';
            document.getElementById('detail-cwr-priority-level').innerText = req.priorityLevel || 'N/A';
            document.getElementById('detail-cwr-priority-rationale').innerText = req.priorityRationale || 'N/A';
            document.getElementById('detail-cwr-posting-requirements').innerText = req.postingRequirements || 'N/A';
            document.getElementById('detail-cwr-content-format').innerText = (req.contentFormat || []).join(', ') || 'N/A';
            document.getElementById('detail-cwr-game-configuration').innerText = req.gameConfiguration || 'N/A';
            document.getElementById('detail-cwr-hashtags').innerText = (req.officialHashtags || []).join(', ') || 'N/A';
            document.getElementById('detail-cwr-special-payout').innerText = req.specialPayout || 'N/A';


            document.getElementById('cw-request-details-modal').classList.remove('hidden');
        };

        window.closeCWRequestDetails = () => {
            document.getElementById('cw-request-details-modal').classList.add('hidden');
        };

        window.syncPDRequestSilent = async (reqData) => {
            try {
                const idx = window.pdRequests.findIndex(p => p.id === reqData.id);
                if (idx > -1) window.pdRequests[idx] = reqData;
    else {
        window.pdRequests.push(reqData);
        window.notifyPOCs(`New Prize Distribution Request "${reqData.campaignName}" submitted by ${window.currentUserProfile}`, 'prize_distribution', 'prize_distribution', reqData.id);
    }

                localStorage.setItem('spo_pd_requests', JSON.stringify(window.pdRequests));
                if (db) await setDoc(doc(db, "pd_requests", reqData.id), reqData);

                if (window.currentView === 'prize_distribution') window.renderPDRequestsTable();
            } catch (err) { console.error(err); }
        };

        window.openPDRequestDetails = (id) => {
            const req = window.pdRequests.find(p => p.id === id);
            if (!req) return;

            if (req.status === 'Pending' && window.isCurrentUserPOC('prize_distribution')) {
        if (req.requestedBy && req.requestedBy !== window.currentUserProfile) {
            window.logNotification(`PD Request "${req.campaignName}" is now In Progress by ${window.currentUserProfile}`, req.requestedBy, 'prize_distribution', req.id);
        }

                req.status = 'Under Review';
                window.syncPDRequestSilent(req);
            }

            document.getElementById('detail-pdr-campaign-name').innerText = req.campaignName || 'N/A';
            if (document.getElementById('detail-pdr-event-datetime')) document.getElementById('detail-pdr-event-datetime').innerText = req.eventDatetime || 'N/A';
            document.getElementById('detail-pdr-requested-by').innerText = req.requestedBy || 'N/A';
            document.getElementById('detail-pdr-status').innerText = req.status || 'N/A';

            const docLink = document.getElementById('detail-pdr-campaign-doc');
            if (req.campaignDocLink) {
                docLink.href = req.campaignDocLink;
                docLink.innerText = req.campaignDocLink;
            } else {
                docLink.removeAttribute('href');
                docLink.innerText = 'N/A';
            }

            const winLink = document.getElementById('detail-pdr-winner-list-doc');
            if (req.winnerListDocLink) {
                winLink.href = req.winnerListDocLink;
                winLink.innerText = req.winnerListDocLink;
            } else {
                winLink.removeAttribute('href');
                winLink.innerText = 'N/A';
            }

            document.getElementById('detail-pdr-budget-amount').innerText = window.formatCurrency ? window.formatCurrency(req.budgetAmount) : req.budgetAmount;
            document.getElementById('detail-pdr-actual-amount').innerText = window.formatCurrency ? window.formatCurrency(req.actualAmount) : req.actualAmount;

            document.getElementById('pd-request-details-modal').classList.remove('hidden');
        };

        window.closePDRequestDetails = () => {
            document.getElementById('pd-request-details-modal').classList.add('hidden');
        };


        window.openPDCompleteModal = (id) => {
            const req = window.pdRequests.find(p => p.id === id);
            if (!req) return;

            document.getElementById('pdc-id').value = id;
            document.getElementById('pd-complete-modal').classList.remove('hidden');
        };

        window.closePDCompleteModal = () => {
            document.getElementById('pd-complete-modal').classList.add('hidden');
        };

        window.savePDComplete = async () => {
            const id = document.getElementById('pdc-id').value;

            const req = window.pdRequests.find(p => p.id === id);
            if (!req) return;

            req.status = 'Completed';
            req.updateDate = window.getFormattedCreatedTime();
    if (req.owner && req.owner !== window.currentUserProfile) {
        window.logNotification(`Pin Request "${req.campaignName}" was Completed by ${window.currentUserProfile}`, req.owner, 'pin_request', req.id);
    }
    if (req.requestedBy && req.requestedBy !== window.currentUserProfile) {
        window.logNotification(`Request "${req.campaignName || req.taskTitle}" was Completed by ${window.currentUserProfile}`, req.requestedBy, req.category === 'sms' ? 'sms' : (req.campaignName ? 'prize_distribution' : 'daily_task'), req.id);
    }

            const btn = document.getElementById('save-pdc-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                await window.syncPDRequestSilent(req);
                window.showToast("Distribution marked as completed", "success");
                window.closePDCompleteModal();
            } finally {
                btn.innerHTML = 'Complete Request';
                btn.disabled = false;
            }
        };

        window.notifications = JSON.parse(localStorage.getItem('spo_notifications') || '[]');
window.notifyPOCs = async (message, pocModuleName, targetModule, targetId) => {
    let savedPOCs = {};
    try {
        savedPOCs = JSON.parse(localStorage.getItem('spo_admin_pocs')) || {};
    } catch(e){}
    const pocs = savedPOCs[pocModuleName] || [];

    // Fallback: if there are no POCs assigned, let's log it for 'All' so at least an admin can see it
    if (pocs.length === 0) {
        await window.logNotification(message, 'All', targetModule, targetId);
        return;
    }

    for (const poc of pocs) {
        await window.logNotification(message, poc, targetModule, targetId);
    }
};

window.logNotification = async (message, targetUser, targetModule = null, targetId = null) => {
    const notifId = "notif-" + Date.now();
    const notifData = {
        id: notifId,
        message,
        targetUser,
        targetModule,
        targetId,
        createdTime: window.getFormattedCreatedTime(),
        readBy: []
    };

    // Update local array and storage
    if (!window.notifications) window.notifications = JSON.parse(localStorage.getItem('spo_notifications') || '[]');
    window.notifications.unshift(notifData); // Add to beginning
    localStorage.setItem('spo_notifications', JSON.stringify(window.notifications));

    if (window.renderNotificationsDropdown) window.renderNotificationsDropdown();
    if (window.renderFullNotifications) window.renderFullNotifications();

    // Show toast and desktop notification if it's for the current user or 'All'
    if (targetUser === window.currentUserProfile || targetUser === 'All') {
        if (window.showToast) {
            window.showToast(message, 'info', 'fa-bell');
        }

        if (Notification.permission === "granted") {
            new Notification("SPO Content Calendar", {
                body: message,
                icon: "favicon.svg"
            });
        }
    }

    if (db) {
        try {
            await setDoc(doc(db, "notifications", notifId), notifData);
        } catch(e) {
            console.error("Error logging notification:", e);
        }
    }
};

        window.handleNotificationClick = (moduleName, targetId) => {
    window.switchView(moduleName);
    setTimeout(() => {
        if (moduleName === 'tasks') {
            const evt = window.events.find(e => e.id === targetId);
            if (evt) window.openEditModal(evt);
        } else if (moduleName === 'daily_task') {
            window.openDailyTaskDetails(targetId);
        } else if (moduleName === 'pin_request') {
            window.openPinRequestDetails(targetId);
        } else if (moduleName === 'sms') {
            window.openSMSDetails(targetId);
        } else if (moduleName === 'content_writer') {
            window.openCWRequestDetails(targetId);
        } else if (moduleName === 'prize_distribution') {
            window.openPDRequestDetails(targetId);
        }
        document.getElementById('notif-dropdown')?.classList.add('hidden');
    }, 300);
};

window.toggleNotifications = () => {
            const dropdown = document.getElementById('notif-dropdown');
            if (dropdown.classList.contains('hidden')) {
                dropdown.classList.remove('hidden');
                // Mark as read immediately when opening
                window.markNotificationsAsRead();
            } else {
                dropdown.classList.add('hidden');
            }
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const notifContainer = document.querySelector('.relative > #notif-dropdown')?.parentElement;
            if (notifContainer && !notifContainer.contains(e.target)) {
                document.getElementById('notif-dropdown').classList.add('hidden');
            }
        });



        window.renderNotificationsDropdown = () => {
            const listEl = document.getElementById('notif-list');
            const badge = document.getElementById('notif-badge');
            if (!listEl || !badge) return;

            // Filter for current user
            const userNotifs = window.notifications.filter(n => n.targetUser === window.currentUserProfile || n.targetUser === 'All');
            userNotifs.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

            const unreadCount = userNotifs.filter(n => !n.readBy || !n.readBy.includes(window.currentUserProfile)).length;

            if (unreadCount > 0) {
                badge.classList.remove('hidden');
                badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
            } else {
                badge.classList.add('hidden');
            }

            if (userNotifs.length === 0) {
                listEl.innerHTML = '<div class="p-4 text-center text-xs text-gray-500 dark:text-slate-400">No new notifications.</div>';
                return;
            }

            let html = '';
            userNotifs.slice(0, 5).forEach(n => {
                const isRead = n.readBy && n.readBy.includes(window.currentUserProfile);
                html += `
                    <div class="p-3 rounded-lg hover:bg-slate-50 dark:bg-slate-900 cursor-pointer transition-colors ${isRead ? 'opacity-70' : 'bg-primary-50 dark:bg-primary-500/20/30'} border border-transparent hover:border-slate-100 dark:border-slate-700" onclick="window.handleNotificationClick('${n.targetModule}', '${n.targetId}')">
                        <p class="text-xs font-medium text-gray-900 dark:text-white">${n.message}</p>
                        <p class="text-[10px] text-gray-500 dark:text-slate-400 mt-1">${n.createdTime}</p>
                    </div>
                `;
            });
            listEl.innerHTML = html;
        };

        window.markNotificationsAsRead = async () => {
            if (!window.currentUserProfile || !db) return;

            const userNotifs = window.notifications.filter(n => (n.targetUser === window.currentUserProfile || n.targetUser === 'All') && (!n.readBy || !n.readBy.includes(window.currentUserProfile)));

            if (userNotifs.length === 0) return;

            for (let n of userNotifs) {
                if (!n.readBy) n.readBy = [];
                n.readBy.push(window.currentUserProfile);
                try {
                    await setDoc(doc(db, "notifications", n.id), n);
                } catch(e) {}
            }

            window.renderNotificationsDropdown();
        };

        window.currentUserProfile = localStorage.getItem('spo_current_user') || '';

        window.openUserProfileModal = (force = false) => {
            const select = document.getElementById('user-profile-select');
            select.value = window.currentUserProfile;

            const closeBtn = document.getElementById('close-user-profile-btn');
            if (force) {
                closeBtn.style.display = 'none';
            } else {
                closeBtn.style.display = 'block';
            }

            document.getElementById('user-profile-modal').classList.remove('hidden');
        };

        window.closeUserProfileModal = () => {
            if (!window.currentUserProfile) {
                window.showToast("Please select a user profile to continue.", "error");
                return;
            }
            document.getElementById('user-profile-modal').classList.add('hidden');
        };

        window.saveUserProfile = () => {
            const val = document.getElementById('user-profile-select').value;
            if (!val) {
                window.showToast("Please select a user.", "error");
                return;
            }
            window.currentUserProfile = val;
            localStorage.setItem('spo_current_user', val);
            window.updateUserProfileIcon();
            window.renderNotificationsDropdown();
            document.getElementById('user-profile-modal').classList.add('hidden');
            window.showToast("Profile saved successfully!", "success");
        };

        window.updateUserProfileIcon = () => {
            const btn = document.getElementById('user-profile-btn');
            if (window.currentUserProfile) {
                btn.innerHTML = `<span class="text-sm font-bold text-primary-700">${window.currentUserProfile.charAt(0)}</span>`;
                btn.title = `User Profile: ${window.currentUserProfile}`;
                btn.classList.add('bg-primary-100', 'border-primary-300');
                btn.classList.remove('bg-slate-200', 'dark:bg-slate-600', 'border-slate-300', 'dark:border-slate-600');
            } else {
                btn.innerHTML = `<i class="fa-regular fa-user text-lg"></i>`;
                btn.title = "User Profile";
                btn.classList.remove('bg-primary-100', 'border-primary-300');
                btn.classList.add('bg-slate-200', 'dark:bg-slate-600', 'border-slate-300', 'dark:border-slate-600');
            }
        };
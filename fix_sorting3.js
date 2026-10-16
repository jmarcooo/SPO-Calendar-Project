const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// 1. Add end date column to daily task table
// views/daily_task.html
let dailyTaskHtml = fs.readFileSync('views/daily_task.html', 'utf-8');
dailyTaskHtml = dailyTaskHtml.replace(
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">\n                            Start Date <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>',
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cycleDailyTasksSort) window.cycleDailyTasksSort(\'startDate\')">\n                            Start Date <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>\n                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cycleDailyTasksSort) window.cycleDailyTasksSort(\'endDate\')">\n                            End Date <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);

dailyTaskHtml = dailyTaskHtml.replace(
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">\n                            Title <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>',
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cycleDailyTasksSort) window.cycleDailyTasksSort(\'title\')">\n                            Title <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);

// We need to wait and add end date column values in index.html renderDailyTasksTable
fs.writeFileSync('views/daily_task.html', dailyTaskHtml);


// 2. Make adding of hashtag same as per content writer modal
// In index.html, replace dt-hashtags with the new container and input
const oldDtHashtags = `<div class="sm:col-span-2">
                            <label class="block text-sm font-medium text-gray-700">Hashtags</label>
                            <input type="text" id="dt-hashtags" placeholder="#tag1 #tag2" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-md shadow-slate-200/50 py-2 px-3 sm:text-sm">
                        </div>`;

const newDtHashtags = `<div class="sm:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hashtags (Max 10)</label>
                            <div class="flex flex-wrap mb-1" id="dt-hashtags-container"></div>
                            <input type="text" id="dt-hashtag-input" placeholder="Type and press Enter or Space..." onkeydown="handleDThashtagEnter(event)" class="w-full text-sm border border-gray-300 rounded-xl shadow-md shadow-slate-200/50 py-1.5 px-3 focus:ring-indigo-500">
                        </div>`;

html = html.replace(oldDtHashtags, newDtHashtags);

// Add dtTempHashtags
html = html.replace('window.cwTempHashtags = [];', 'window.cwTempHashtags = [];\n        window.dtTempHashtags = [];');

// Add handleDThashtagEnter and renderDThashtags and removeDThashtag
const dtHashtagFunctions = `
        window.renderDThashtags = () => {
            const container = document.getElementById('dt-hashtags-container');
            const input = document.getElementById('dt-hashtag-input');
            if (!container || !input) return;

            let pills = window.dtTempHashtags.map((t, i) => \`
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 mr-2 mb-2">
                    \${t}
                    <button type="button" onclick="removeDThashtag(\${i})" class="ml-1 text-indigo-500 hover:text-indigo-800"><i class="fa-solid fa-xmark"></i></button>
                </span>
            \`).join('');

            container.innerHTML = pills;
            if (window.dtTempHashtags.length >= 10) {
                input.disabled = true;
                input.classList.add('bg-slate-100', 'cursor-not-allowed');
            } else {
                input.disabled = false;
                input.classList.remove('bg-slate-100', 'cursor-not-allowed');
            }
        };

        window.handleDThashtagEnter = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const input = e.target;
                const val = input.value.trim();
                if (!val) return;

                const newTags = val.split(/\\s+/).filter(t => t.length > 0);
                newTags.forEach(tag => {
                    if (window.dtTempHashtags.length < 10) {
                        window.dtTempHashtags.push(tag);
                    }
                });

                input.value = '';
                window.renderDThashtags();
            }
        };

        window.removeDThashtag = (idx) => {
            window.dtTempHashtags.splice(idx, 1);
            window.renderDThashtags();
        };
`;

html = html.replace('window.calculateCWDuration = () => {', dtHashtagFunctions + '\n        window.calculateCWDuration = () => {');


// Update openDailyTaskModal and openEditDailyTask to clear/populate dtTempHashtags
html = html.replace(
    'document.getElementById(\'daily-task-form\').reset();\n            document.getElementById(\'dt-id\').value = \'\';',
    'document.getElementById(\'daily-task-form\').reset();\n            document.getElementById(\'dt-id\').value = \'\';\n            window.dtTempHashtags = [];\n            window.renderDThashtags();'
);

html = html.replace(
    'document.getElementById(\'dt-hashtags\').value = task.hashtags || \'\';',
    'window.dtTempHashtags = (task.hashtags || []).slice();\n            window.renderDThashtags();'
);

// Update saveDailyTask
html = html.replace(
    'targetTask.hashtags = document.getElementById(\'dt-hashtags\').value.trim();',
    'targetTask.hashtags = window.dtTempHashtags.slice();'
);


// 3. For pin request use the pin start time for logic
// Replace pin request timeline start time check in renderModalTimeline
// Already done? User says "for pin request use the pin start time for logic". Maybe they mean for Pin Status logic.
const oldPinStatusLogic = `const sDate = new Date(Date.UTC(sParts[0], sParts[1]-1, sParts[2], sParts[3]||0, sParts[4]||0, sParts[5]||0));
                        const eDate = new Date(Date.UTC(eParts[0], eParts[1]-1, eParts[2], eParts[3]||0, eParts[4]||0, eParts[5]||0));`;

const newPinStatusLogic = `const sPartsPin = p.pinStartDate ? p.pinStartDate.split(/[- :T]/) : null;
                        const ePartsPin = p.pinEndDate ? p.pinEndDate.split(/[- :T]/) : null;

                        let sDate = sPartsPin ? new Date(Date.UTC(sPartsPin[0], sPartsPin[1]-1, sPartsPin[2], sPartsPin[3]||0, sPartsPin[4]||0, sPartsPin[5]||0)) : null;
                        let eDate = ePartsPin ? new Date(Date.UTC(ePartsPin[0], ePartsPin[1]-1, ePartsPin[2], ePartsPin[3]||0, ePartsPin[4]||0, ePartsPin[5]||0)) : null;

                        if (!sDate && sParts) sDate = new Date(Date.UTC(sParts[0], sParts[1]-1, sParts[2], sParts[3]||0, sParts[4]||0, sParts[5]||0));
                        if (!eDate && eParts) eDate = new Date(Date.UTC(eParts[0], eParts[1]-1, eParts[2], eParts[3]||0, eParts[4]||0, eParts[5]||0));`;

html = html.replace(oldPinStatusLogic, newPinStatusLogic);

// Make the title clickable for sorting in pin request
// Wait, pin request uses pinSortMode for position sorting. The user says "make the title clickable for sorting".
// Views/pin_request.html
let prHtml = fs.readFileSync('views/pin_request.html', 'utf-8');
prHtml = prHtml.replace(
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\n                            Campaign / Post Name\n                        </th>',
    '<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cyclePinSort) window.cyclePinSort(\'title\')">\n                            Campaign / Post Name <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);
fs.writeFileSync('views/pin_request.html', prHtml);


// 4. For SMS request add also end date column and campaign status campaign status checks the current date and shows if event is upcoming, ongoing, completed
// And make the title clickable for sorting.

let smsHtml = fs.readFileSync('views/sms.html', 'utf-8');
smsHtml = smsHtml.replace(
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\n                            Target Date\n                        </th>',
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\n                            Start Date\n                        </th>\n                        <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\n                            End Date\n                        </th>\n                        <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">\n                            Campaign Status\n                        </th>'
);
smsHtml = smsHtml.replace(
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">\n                            Campaign Name\n                        </th>',
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cycleSMSSort) window.cycleSMSSort(\'title\')">\n                            Campaign Name <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);

fs.writeFileSync('views/sms.html', smsHtml);

// SMS Modal end date column
html = html.replace(
    '<div class="grid grid-cols-2 gap-4">\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Event Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-event-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>',
    '<div class="grid grid-cols-2 gap-4">\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Start Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-start-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">End Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-end-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>'
);

// We need to fix budget col size? Budget is in the same row. Let's make it 3 cols maybe? Or put Budget below.
html = html.replace(
    '<div class="grid grid-cols-2 gap-4">\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Start Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-start-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">End Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-end-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Budget (PHP) <span class="text-red-500">*</span></label>\n                        <input type="number" id="sms-budget" step="0.01" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                </div>',
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Start Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-start-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                    <div>\n                        <label class="block text-sm font-medium text-gray-700 mb-1">End Date and Time <span class="text-red-500">*</span></label>\n                        <input type="text" id="sms-end-datetime" placeholder="YYYY-MM-DD HH:MM:SS" pattern="\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                    <div class="md:col-span-2">\n                        <label class="block text-sm font-medium text-gray-700 mb-1">Budget (PHP) <span class="text-red-500">*</span></label>\n                        <input type="number" id="sms-budget" step="0.01" min="0" required class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow">\n                    </div>\n                </div>'
);

// Adjust saveSMSRequest
html = html.replace('const eventDateTime = document.getElementById(\'sms-event-datetime\').value.trim();', 'const startDateTime = document.getElementById(\'sms-start-datetime\').value.trim();\n            const endDateTime = document.getElementById(\'sms-end-datetime\').value.trim();');
html = html.replace('eventDateTime: eventDateTime,', 'eventDateTime: startDateTime,\n                startDateTime: startDateTime,\n                endDateTime: endDateTime,');
html = html.replace('document.getElementById(\'sms-event-datetime\').value = req.eventDateTime || \'\';', 'document.getElementById(\'sms-start-datetime\').value = req.startDateTime || req.eventDateTime || \'\';\n            document.getElementById(\'sms-end-datetime\').value = req.endDateTime || \'\';');
html = html.replace('document.getElementById(\'detail-sms-event-datetime\').innerText = req.eventDateTime || \'-\';', 'document.getElementById(\'detail-sms-event-datetime\').innerText = (req.startDateTime || req.eventDateTime || \'-\') + " to " + (req.endDateTime || \'-\');');

// We need to write this logic inside the actual script, wait. I will just replace the JS functions for sorting and rendering completely. Let's do that at the end.


fs.writeFileSync('index.html', html);

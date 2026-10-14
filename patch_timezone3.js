const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const timezoneScript = `
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
            return \`\${p.year}-\${pad(p.month + 1)}-\${pad(p.date)} \${pad(p.hours)}:\${pad(p.minutes)}:\${pad(p.seconds)}\`;
        };

        window.getPHDateStr = () => {
            return window.getFormattedCreatedTime().split(' ')[0];
        };

        window.getPHIsoString = () => {
            const p = window.getPHParts();
            const pad = (n) => n.toString().padStart(2, '0');
            return \`\${p.year}-\${pad(p.month + 1)}-\${pad(p.date)}T\${pad(p.hours)}:\${pad(p.minutes)}:\${pad(p.seconds)}.000Z\`;
        };

        window.getPHFakeUtcMs = () => {
            const p = window.getPHParts();
            return Date.UTC(p.year, p.month, p.date, p.hours, p.minutes, p.seconds);
        };
        // -------------------------------------
`;

// Inject into index.html
html = html.replace(
    `        window.getFormattedCreatedTime = () => {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            return \`\${now.getFullYear()}-\${pad(now.getMonth() + 1)}-\${pad(now.getDate())} \${pad(now.getHours())}:\${pad(now.getMinutes())}:\${pad(now.getSeconds())}\`;
        }`,
    timezoneScript
);

// Targeted Replacements in index.html
html = html.replace(/let currentMonth = localStorage\.getItem\('spo_current_month'\) !== null \? parseInt\(localStorage\.getItem\('spo_current_month'\)\) : new Date\(\)\.getMonth\(\);/, "let currentMonth = localStorage.getItem('spo_current_month') !== null ? parseInt(localStorage.getItem('spo_current_month')) : window.getPHParts().month;");
html = html.replace(/let currentYear = localStorage\.getItem\('spo_current_year'\) !== null \? parseInt\(localStorage\.getItem\('spo_current_year'\)\) : new Date\(\)\.getFullYear\(\);/, "let currentYear = localStorage.getItem('spo_current_year') !== null ? parseInt(localStorage.getItem('spo_current_year')) : window.getPHParts().year;");
html = html.replace(/let currentDateObj = new Date\(\);/, "let currentDateObj = null;");

html = html.replace(/const today = new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/g, "const today = window.getPHDateStr();");
html = html.replace(/e\.startDate = e\.date \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/g, "e.startDate = e.date || window.getPHDateStr();");
html = html.replace(/e\.endDate = e\.date \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/g, "e.endDate = e.date || window.getPHDateStr();");
html = html.replace(/updatedAt: new Date\(\)\.toISOString\(\)/g, "updatedAt: window.getPHIsoString()");
html = html.replace(/task\.lastReminded = new Date\(\)\.toISOString\(\);/g, "task.lastReminded = window.getPHIsoString();");
html = html.replace(/createdAt: window\.getFormattedCreatedTime \? window\.getFormattedCreatedTime\(\) : new Date\(\)\.toISOString\(\),/g, "createdAt: window.getFormattedCreatedTime ? window.getFormattedCreatedTime() : window.getPHIsoString(),");

// Timeline replacements
html = html.replace(/const today = new Date\(\);\n\s*startOfWeek = new Date\(Date\.UTC\(today\.getUTCFullYear\(\), today\.getUTCMonth\(\), today\.getUTCDate\(\)\)\);/,
`const p = window.getPHParts();
                startOfWeek = new Date(Date.UTC(p.year, p.month, p.date));`);

html = html.replace(/const isPast = eMs < Date\.now\(\);/g, "const isPast = eMs < window.getPHFakeUtcMs();");

// Gray out background overlay check in renderPRTimeline
html = html.replace(/const nowMs = Date\.now\(\);/g, "const nowMs = window.getPHFakeUtcMs();");

html = html.replace(/const daysDiff = Math\.ceil\(\(dateObj - new Date\(\)\) \/ \(1000 \* 60 \* 60 \* 24\)\);/g,
`const p = window.getPHParts();
                const nowUtc = Date.UTC(p.year, p.month, p.date);
                const daysDiff = Math.ceil((dateObj - nowUtc) / (1000 * 60 * 60 * 24));`);

html = html.replace(/const today = new Date\(\);/g, "const pToday = window.getPHParts(); const today = new Date(Date.UTC(pToday.year, pToday.month, pToday.date));");

fs.writeFileSync('index.html', html);

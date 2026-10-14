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

// Remove the one we injected at 607
html = html.replace(timezoneScript, "");

// Inject right after <script type="module">
html = html.replace('<script type="module">', '<script type="module">\n' + timezoneScript);

fs.writeFileSync('index.html', html);

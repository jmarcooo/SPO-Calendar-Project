const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const regex = /<script>([\s\S]*?)<\/script>[\s\S]*?<script src="https:\/\/cdn.tailwindcss.com"><\/script>/m;
const match = indexHtml.match(regex);

if (match) {
    const tailwindConfigScript = match[1];

    if (tailwindConfigScript.includes('safelist')) {
        console.log("safelist already exists");
    } else {
        const newTailwindConfigScript = tailwindConfigScript.replace(
            /theme: {/,
            `safelist: [
                { pattern: /bg-primary-(50|100|200|300|400|500|600|700|800|900)/, variants: ['hover', 'focus', 'active', 'group-hover'] },
                { pattern: /text-primary-(50|100|200|300|400|500|600|700|800|900)/, variants: ['hover', 'focus', 'active', 'group-hover'] },
                { pattern: /border-primary-(50|100|200|300|400|500|600|700|800|900)/, variants: ['hover', 'focus', 'active', 'group-hover'] },
                { pattern: /ring-primary-(50|100|200|300|400|500|600|700|800|900)/, variants: ['hover', 'focus', 'active', 'group-hover'] }
            ],
            theme: {`
        );

        fs.writeFileSync('index.html', indexHtml.replace(tailwindConfigScript, newTailwindConfigScript));
        console.log("safelist updated");
    }
}

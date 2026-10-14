const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// The default values for pr-page, pr-position, pr-sort are defined in the HTML inputs
// e.g. <input type="number" id="pr-page" ... value="1" />
// We need to remove these default values so it's not pre-selected.

html = html.replace(/<input type="number" id="pr-page" min="1" max="2" value="1"/g, '<input type="number" id="pr-page" min="1" max="2"');
html = html.replace(/<input type="number" id="pr-position" min="1" max="10" value="1"/g, '<input type="number" id="pr-position" min="1" max="10"');
html = html.replace(/<input type="number" id="pr-sort" min="1" max="3" value="1"/g, '<input type="number" id="pr-sort" min="1" max="3"');

fs.writeFileSync('index.html', html);

const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// In PR Timeline
// html += `<div class="flex border-b border-slate-100 hover:bg-slate-50 transition-colors relative group h-12">
html = html.replace(/<div class="flex border-b border-slate-100 hover:bg-slate-50 transition-colors relative group h-12">/g, '<div class="flex border-b border-slate-100 hover:bg-slate-50 transition-colors relative group h-10">');

// In Modal Timeline
// let rowClasses = "flex border-b border-gray-100 hover:bg-indigo-50/50 cursor-pointer transition-colors relative group h-10";
html = html.replace(/let rowClasses = "flex border-b border-gray-100 hover:bg-indigo-50\/50 cursor-pointer transition-colors relative group h-10";/g, 'let rowClasses = "flex border-b border-gray-100 hover:bg-indigo-50/50 cursor-pointer transition-colors relative group h-8";');

fs.writeFileSync('index.html', html);

const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// For Content Writer, make title clickable for sorting
let cwHtml = fs.readFileSync('views/content_writer.html', 'utf-8');
cwHtml = cwHtml.replace(
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">\n                            Campaign Name\n                        </th>',
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cycleCWSort) window.cycleCWSort(\'title\')">\n                            Campaign Name <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);
fs.writeFileSync('views/content_writer.html', cwHtml);


// In Prize Distribution Modal, Event/Campaign Date format yyyy-mm-dd hh:mm:ss
// Wait, it already is format yyyy-mm-dd hh:mm:ss in the modal according to views/prize_distribution.html
// But let's add it to the column and make title clickable
let pdHtml = fs.readFileSync('views/prize_distribution.html', 'utf-8');
pdHtml = pdHtml.replace(
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">\n                            Campaign Name\n                        </th>',
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onclick="if(window.cyclePDSort) window.cyclePDSort(\'title\')">\n                            Campaign Name <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);
pdHtml = pdHtml.replace(
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap">\n                            Submission Time\n                        </th>',
    '<th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap">\n                            Submission Time\n                        </th>\n                        <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group whitespace-nowrap" onclick="if(window.cyclePDSort) window.cyclePDSort(\'eventDate\')">\n                            Event Date <i class="fa-solid fa-sort text-gray-300 ml-1"></i>\n                        </th>'
);
fs.writeFileSync('views/prize_distribution.html', pdHtml);

fs.writeFileSync('index.html', html);

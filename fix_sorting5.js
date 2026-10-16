const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// I already added Event/Campaign Date format yyyy-mm-dd hh:mm:ss in the PD modal previously (it already had pdr-event-datetime). I'll make sure it's shown in the table.
// Next I need to write a unified sorting/status function and apply it to tables. Let's do that with write_file and python.

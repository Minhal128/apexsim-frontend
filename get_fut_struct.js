const fs = require('fs');
const f = fs.readFileSync('fut_copy.txt', 'utf8');
const p = f.indexOf('<div className="flex gap-6 items-center shrink-0"');
console.log(f.slice(p - 100, p + 500));

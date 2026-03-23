const fs = require('fs');
const s = fs.readFileSync('spot_copy.txt', 'utf8');
const p2 = s.indexOf('<div className="flex flex-col md:flex-row h-full gap-px bg-white/5"');
console.log(s.slice(p2 - 4000, p2 - 3500));

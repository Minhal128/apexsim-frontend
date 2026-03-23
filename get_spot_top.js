const fs = require('fs');
const s = fs.readFileSync('spot_copy.txt', 'utf8');

const p2 = s.indexOf('<div className="flex flex-col md:flex-row h-full gap-px bg-white/5">');
const p1 = s.lastIndexOf('<div className="flex bg-[#', p2);

console.log('p1:', p1, 'p2:', p2);
if (p1 !== -1) {
  console.log('Got it:', s.slice(p1, p1 + 100));
}

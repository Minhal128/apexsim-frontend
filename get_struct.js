const fs = require('fs');
const spot = fs.readFileSync('spot_copy.txt', 'utf8');
const p = spot.indexOf('<div className="relative min-w-fit"');
console.log(spot.slice(p, p + 200));

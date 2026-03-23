const fs = require('fs');
const spot = fs.readFileSync('spot_copy.txt', 'utf8');
const p = spot.indexOf('createPortal(');
const p2 = spot.indexOf(')}', p) + 2;
console.log(spot.slice(p2, p2 + 200));

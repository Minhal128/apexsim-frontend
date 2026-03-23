const fs = require('fs');
const spot = fs.readFileSync('src/app/dashboard/(trade)/spot-trade/page.tsx', 'utf8');
const fut = fs.readFileSync('src/app/dashboard/(trade)/futures-trade/page.tsx', 'utf8');

console.log('Spot has createPortal:', spot.includes('createPortal'));
console.log('Futures has createPortal:', fut.includes('createPortal'));

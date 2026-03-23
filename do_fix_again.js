const fs = require('fs');
const spot = fs.readFileSync('spot_copy.txt', 'utf8');
let fut = fs.readFileSync('fut_copy.txt', 'utf8');

const s1 = spot.indexOf('  // Coin dropdown state');
const s2 = spot.indexOf('  // Keep URL in sync on initial drop');
const stateCode = spot.slice(s1, s2);

const renderStart = spot.indexOf('<div className="relative min-w-fit">');
const renderEnd = spot.indexOf(')}', spot.indexOf('createPortal(')) + 2;
const triggerCode = spot.slice(renderStart, renderEnd) + '\n          </div>'; // close the wrapper if needed, wait, the portal IS inside the min-w-fit maybe?


const fs = require('fs');

const spot = fs.readFileSync('src/app/dashboard/(trade)/spot-trade/page.tsx', 'utf8');
let fut = fs.readFileSync('src/app/dashboard/(trade)/futures-trade/page.tsx', 'utf8');

// Extraction from Spot
const stateStart = spot.indexOf('  // Coin dropdown state');
const stateEnd = spot.indexOf('  // Keep URL in sync on initial drop');

const triggerStart = spot.indexOf('<button');
// wait, instead of guessing, I'll extract using regex 

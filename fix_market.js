const fs = require('fs');
const path = 'H:/Development/Apexsim/Apexsim-Backend/routes/market.js';
let content = fs.readFileSync(path, 'utf8');

// Strip all logo/images
content = content.replace(/,\s*icons:\s*\[[^\]]+\]/g, '');
content = content.replace(/,\s*logo:\s*'[^']+'/g, '');
content = content.replace(/,\s*image:\s*'[^']+'/g, '');
content = content.replace(/icons:\s*\[[^\]]+\]\s*,/g, '');
content = content.replace(/logo:\s*'[^']+'\s*,/g, '');
content = content.replace(/image:\s*'[^']+'\s*,/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Stripped images from market.js');

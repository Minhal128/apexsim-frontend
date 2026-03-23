const fs = require('fs');
let code = fs.readFileSync('src/components/trading/futures-trading/CoinSelector.tsx', 'utf8');
fs.writeFileSync('src/components/trading/futures-trading/CoinSelector.tsx', code);

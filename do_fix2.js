const fs = require('fs');
const t = fs.readFileSync('src/components/trading/futures-trading/CoinSelector.tsx', 'utf8');
fs.writeFileSync('src/components/trading/futures-trading/CoinSelector.tsx', t.replace('onSelect(`${coin.symbol}/USDT`);', 'onSelect(category !== "crypto" && !coin.symbol.includes("/") ? coin.symbol : `${coin.symbol}/USDT`);'));
console.log('DONE');
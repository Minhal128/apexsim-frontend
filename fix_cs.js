const fs = require('fs');
const file = 'src/components/trading/futures-trading/CoinSelector.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/onSelect\(\\$\{coin\.symbol\}\/USDT\\);/g, "onSelect(category !== 'crypto' ? \\$\{coin.symbol\}\ : \\$\{coin.symbol\}\/USDT\);");
fs.writeFileSync(file, code);

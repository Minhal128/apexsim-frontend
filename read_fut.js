const fs = require('fs');
const f = fs.readFileSync('fut_copy.txt', 'utf8');
const p = f.indexOf('<div className="relative min-w-fit"');
console.log('Found relative class?', p !== -1);
if (p === -1) {
  const p2 = f.indexOf('CoinSelector');
  console.log(f.slice(p2 - 100, p2 + 200));
}


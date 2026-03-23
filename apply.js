const fs = require('fs');

const spot = fs.readFileSync('src/app/dashboard/(trade)/spot-trade/page.tsx', 'utf8');
let fut = fs.readFileSync('src/app/dashboard/(trade)/futures-trade/page.tsx', 'utf8');

let stateCode = '';
{
  const start = spot.indexOf('  // Coin dropdown state');
  const end = spot.indexOf('  // Handle selected coin change on explicit dropdown pick');
  stateCode = spot.slice(start, end);
}

let triggerCode = '';
{
  const start = spot.indexOf('<div className="relative min-w-fit">');
  const end = spot.indexOf('<div className="flex gap-6 items-center shrink-0">');
  triggerCode = spot.slice(start, end);
}

// Ensure we don't accidentally do it twice
if (!fut.includes('// Coin dropdown state')) {
  const stTarget = 'const [marketInfo, setMarketInfo] = useState<any>(null);';
  fut = fut.replace(stTarget, stTarget + '\n\n' + stateCode);

  const trStart = fut.indexOf('<div className="flex items-center gap-6 shrink-0">');
  const trEnd = fut.indexOf('<div className="flex gap-6 items-center shrink-0">');
  
  if (trStart !== -1 && trEnd !== -1) {
    fut = fut.slice(0, trStart) + '<div className="flex items-center gap-6 shrink-0">\n            ' + triggerCode + fut.slice(trEnd);
  }

  // Remove CoinSelector
  fut = fut.replace(/<CoinSelector[\s\S]*?\/>/, '');
  fut = fut.replace(/import CoinSelector from .*?;\n/, '');
  fut = fut.replace(/const \[isSelectorOpen.*?\n/, '');

  fs.writeFileSync('src/app/dashboard/(trade)/futures-trade/page.tsx', fut);
  console.log('SUCCESS');
} else {
  console.log('Already applied');
}

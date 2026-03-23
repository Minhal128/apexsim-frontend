const fs = require('fs');
const files = [
  'src/app/dashboard/(trade)/spot-trade/page.tsx',
  'src/app/dashboard/(trade)/futures-trade/page.tsx'
];

for(let file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(
    /const assetSymbol = selectedCoin\.symbol\.includes\('\/'\) \?\s*selectedCoin\.symbol\.toUpperCase\(\) :\s*\\\\$\\{selectedCoin\.symbol\.toUpperCase\(\)\}\/\\\$\\{quoteParam\\}\;/,
    "const assetSymbol = (category !== 'crypto' || selectedCoin.symbol.startsWith('^')) ? selectedCoin.symbol.toUpperCase() : selectedCoin.symbol.includes('/') ? selectedCoin.symbol.toUpperCase() : \\/\\;"
  );
  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Fixed ' + file);
}

const fs = require('fs');

function fixPage(filePath) {
    if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Fix validData filter to include details.value for Indices
    code = code.replace(/\(details\.usd > 0 \|\| details\.price > 0\)/g, '(details.usd > 0 || details.price > 0 || details.value > 0)');
    
    // Fix current_price mapping to include details.value
    code = code.replace(/current_price: details\.usd \|\| details\.price \|\| 0,/g, 'current_price: details.usd || details.price || details.value || 0,');
    
    // Fix assetSymbol concatenation so EUR/USD doesn't become EUR/USD/USDT
    const assetSymbolRegex = /const assetSymbol\s*=\s*`\$\{selectedCoin\.symbol\.toUpperCase\(\)\}\/\$\{quoteParam\}`;/g;
    code = code.replace(assetSymbolRegex, "const assetSymbol = selectedCoin.symbol.includes('/') ? selectedCoin.symbol.toUpperCase() : \`${selectedCoin.symbol.toUpperCase()}/${quoteParam}\`;");

    fs.writeFileSync(filePath, code);
    console.log('Fixed Page:', filePath);
}

const pagePaths = [
    'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/spot-trade/page.tsx',
    'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/futures-trade/page.tsx'
];
pagePaths.forEach(fixPage);

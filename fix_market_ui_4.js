const fs = require('fs');

function fixLabels(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    code = code.replace(/\{selectedCoin\.symbol\.toUpperCase\(\)\}\/USDT/g, '{assetSymbol}');
    code = code.replace(/\{coin\.symbol\.toUpperCase\(\)\}\/USDT/g, "{coin.symbol.includes('/') ? coin.symbol.toUpperCase() : \`${coin.symbol.toUpperCase()}/${quoteParam}\`}");

    fs.writeFileSync(filePath, code);
    console.log('Fixed UI labels:', filePath);
}

['H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/spot-trade/page.tsx',
 'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/futures-trade/page.tsx'].forEach(fixLabels);

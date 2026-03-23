const fs = require('fs');

function fixChart(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    code = code.replace(/\(marketInfo\?\.usd \|\| marketInfo\?\.price\)/g, '(marketInfo?.usd || marketInfo?.price || marketInfo?.value)');
    code = code.replace(/\(marketInfo\.usd \|\| marketInfo\.price\)/g, '(marketInfo.usd || marketInfo.price || marketInfo.value)');
    code = code.replace(/\(marketInfo\.usd \?\? marketInfo\.price\)/g, '(marketInfo.usd ?? marketInfo.price ?? marketInfo.value)');
    code = code.replace(/marketInfo\?\.usd \?\? marketInfo\?\.price(?! \?\? marketInfo\?\.value)/g, 'marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value');
    
    fs.writeFileSync(filePath, code);
    console.log('Fixed Chart:', filePath);
}

['H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx',
 'H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingChart.tsx'].forEach(fixChart);

function fixPage(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');
    
    code = code.replace(/marketInfo\?\.usd \?\? marketInfo\?\.price(?! \?\? marketInfo\?\.value)/g, 'marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value');

    fs.writeFileSync(filePath, code);
    console.log('Fixed Page:', filePath);
}

['H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/spot-trade/page.tsx',
 'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/futures-trade/page.tsx'].forEach(fixPage);

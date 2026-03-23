const fs = require('fs');

function patchTradeForm(filePath) {
    if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace fetchMarketPrice
    const fetchMarketPriceRegex = /const fetchMarketPrice = async \(\) => \{[\s\S]*?console\.error\("Failed to fetch market price:", err\);\s*\}\s*\};/g;

    const newFetchMarketPrice = `const fetchMarketPrice = async () => {
    try {
      const [prices, stocks, forex, commodities, indices] = await Promise.all([
        apiRequest("/market/prices").catch(() => ({})),
        apiRequest("/market/stocks").catch(() => ({})),
        apiRequest("/market/forex").catch(() => ({})),
        apiRequest("/market/commodities").catch(() => ({})),
        apiRequest("/market/indices").catch(() => ({}))
      ]);
      const allMarkets = { ...prices, ...stocks, ...forex, ...commodities, ...indices };
      const assetBase = symbol.split('/')[0].toUpperCase();
      const symbolClean = symbol.replace('/', '').toUpperCase();
      
      const assetData = allMarkets[assetBase] || 
                        Object.values(allMarkets).find((m:any) => m?.symbol?.toUpperCase() === assetBase || m?.pair?.toUpperCase() === symbol.toUpperCase()) ||
                        allMarkets[symbolClean];
                        
      const fetchedPrice = assetData?.usd || assetData?.price || assetData?.value || 0;
      
      if (fetchedPrice > 0) {
        setPrice(fetchedPrice.toString());
        setCurrentMarketPrice(fetchedPrice.toString());
      }
    } catch (err) {
      console.error("Failed to fetch market price:", err);
    }
  };`;

    code = code.replace(fetchMarketPriceRegex, newFetchMarketPrice);


    const socketUpdateRegex = /const handleMarketUpdate = \(data: any\) => \{[\s\S]*?setCurrentMarketPrice[\s\S]*?\};/g;

    const newSocketUpdate = `const handleMarketUpdate = (data: any) => {
      const assetBase = symbol.split('/')[0].toUpperCase();
      const symbolClean = symbol.replace('/', '').toUpperCase();
      
      const assetData = data[assetBase] || 
                        Object.values(data).find((m:any) => m?.symbol?.toUpperCase() === assetBase || m?.pair?.toUpperCase() === symbol.toUpperCase()) ||
                        data[symbolClean];
                        
      if (assetData) {
          const livePrice = (assetData.usd || assetData.price || assetData.value || 0).toString();
          if (parseFloat(livePrice) > 0) {
            setCurrentMarketPrice(livePrice);
          }
      }
  };`;

    code = code.replace(socketUpdateRegex, newSocketUpdate);

    fs.writeFileSync(filePath, code);
    console.log('Patched TradeForm: ' + filePath);
}

const formPaths = [
    'H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradeForm.tsx',
    'H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingForm.tsx'
];
formPaths.forEach(patchTradeForm);


function patchPage(filePath) {
    if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
    let code = fs.readFileSync(filePath, 'utf8');

    // Fix the socket handler logic
    const handlerRegex = /const handler = \(data: any\) => \{\s*if \(data\?\.\[assetBase\]\) setMarketInfo\(data\[assetBase\]\);\s*\};/g;
    
    // Instead of relying on just assetBase, we find the proper key
    const newHandler = `const handler = (data: any) => {
        const symbolRaw = searchParams.get('asset') || 'BTC/USDT';
        const assetBaseCheck = symbolRaw.split('/')[0].toUpperCase();
        const symbolClean = symbolRaw.replace('/', '').toUpperCase();
        
        let found = data[assetBaseCheck] || 
                    Object.values(data).find((m:any) => m?.symbol?.toUpperCase() === assetBaseCheck || m?.pair?.toUpperCase() === symbolRaw.toUpperCase()) ||
                    data[symbolClean];
                    
        if (found) {
            setMarketInfo(found);
        }
      };`;
    code = code.replace(handlerRegex, newHandler);

    // Also replace references to marketInfo?.usd ?? marketInfo?.price, etc. to include marketInfo?.value
    code = code.replace(/marketInfo\?\.(usd|price) \?\? marketInfo\?\.(usd|price)/g, 'marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value');

    fs.writeFileSync(filePath, code);
    console.log('Patched Page: ' + filePath);
}

const pagePaths = [
    'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/spot-trade/page.tsx',
    'H:/Development/Apexsim/apexsim-webapp-master/src/app/dashboard/(trade)/futures-trade/page.tsx'
];
pagePaths.forEach(patchPage);


function patchChart(filePath) {
    if (!fs.existsSync(filePath)) { console.log('Not found:', filePath); return; }
    let code = fs.readFileSync(filePath, 'utf8');

    code = code.replace(/marketInfo\?\.(usd|price) \?\? marketInfo\?\.(usd|price)/g, 'marketInfo?.usd ?? marketInfo?.price ?? marketInfo?.value');
    
    fs.writeFileSync(filePath, code);
    console.log('Patched Chart: ' + filePath);
}
const chartPaths = [
    'H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx',
    'H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingChart.tsx'
];
chartPaths.forEach(patchChart);

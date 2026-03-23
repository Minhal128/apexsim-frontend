const fs = require('fs');

function updateTradeForm(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Fix 1: fetchMarketPrice
  const fetchMarketPriceRegex = /const fetchMarketPrice = async \(\) => \{[\s\S]*?console\.error\("Failed to fetch market price:", err\);\s*\}\s*\};/g;

  const newFetchMarketPrice = `const fetchMarketPrice = async () => {
    try {
      // Fetch from all categories to ensure we find the asset
      const [prices, stocks, forex, commodities, indices] = await Promise.all([
        apiRequest("/market/prices").catch(() => ({})),
        apiRequest("/market/stocks").catch(() => ({})),
        apiRequest("/market/forex").catch(() => ({})),
        apiRequest("/market/commodities").catch(() => ({})),
        apiRequest("/market/indices").catch(() => ({}))
      ]);
      const allMarkets = { ...prices, ...stocks, ...forex, ...commodities, ...indices };
      const assetBase = symbol.split('/')[0];
      const fetchedPrice = allMarkets[assetBase]?.usd || allMarkets[assetBase]?.price || 0;
      
      if (fetchedPrice > 0) {
        setPrice(fetchedPrice.toString());
        setCurrentMarketPrice(fetchedPrice.toString());
      }
    } catch (err) {
      console.error("Failed to fetch market price:", err);
    }
  };`;

  code = code.replace(fetchMarketPriceRegex, newFetchMarketPrice);

  // Fix 2: Socket update logic missing .price fallback
  const socketUpdateRegex = /const handleMarketUpdate = \(data: any\) => \{[\s\S]*?if\s*\(\s*data\[assetBase\]\s*&&\s*data\[assetBase\]\.usd\s*\)\s*\{[\s\S]*?const livePrice = data\[assetBase\]\.usd\.toString\(\);[\s\S]*?setCurrentMarketPrice\(livePrice\);[\s\S]*?\}[\s\S]*?\};/g;

  const newSocketUpdate = `const handleMarketUpdate = (data: any) => {
      const assetBase = symbol.split('/')[0];
      const assetData = data[assetBase];
      if (assetData && (assetData.usd || assetData.price)) {
          const livePrice = (assetData.usd || assetData.price).toString();
          setCurrentMarketPrice(livePrice);
          // If the user hasn't typed a price and is on Limit, we could update price
          // But usually we just update currentMarketPrice
      }
  };`;

  code = code.replace(socketUpdateRegex, newSocketUpdate);

  fs.writeFileSync(filePath, code);
  console.log('Fixed ' + filePath);
}

updateTradeForm('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradeForm.tsx');
updateTradeForm('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/TradeForm.tsx');


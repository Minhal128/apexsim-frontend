const fs = require('fs');

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // If we haven't done the first pass replacements for futures yet
  code = code.replace(/marketInfo\?\.usd\s*\?/g, '(marketInfo?.usd !== undefined || marketInfo?.price !== undefined) ?');
  code = code.replace(/marketInfo\.usd\.toLocaleString/g, '(marketInfo.usd ?? marketInfo.price).toLocaleString');
  code = code.replace(/marketInfo\?\.usd\s*!==\s*undefined/g, '(marketInfo?.usd ?? marketInfo?.price) !== undefined');
  code = code.replace(/marketInfo\?\.usd_24h_change\s*!==\s*undefined/g, '(marketInfo?.usd_24h_change ?? marketInfo?.change24h) !== undefined');
  code = code.replace(/marketInfo\?\.usd_24h_change\s*!==\s*null/g, '(marketInfo?.usd_24h_change ?? marketInfo?.change24h) !== null');
  code = code.replace(/marketInfo\.usd_24h_change\.toFixed/g, '(marketInfo.usd_24h_change ?? marketInfo.change24h).toFixed');


  // Extract a custom component block or replace the specific block directly
  const searchRegex = /<InfoRow\s+label="Previous Close"\s+value=\{[^}]+\}\s*\/>/s;
  const newPreviousClose = `<InfoRow
                      label="Previous Close"
                      value={
                        (marketInfo?.usd ?? marketInfo?.price) !== undefined && (marketInfo?.usd_24h_change ?? marketInfo?.change24h) !== undefined
                          ? formatPrice(String((marketInfo.usd ?? marketInfo.price) - ((marketInfo.usd_24h_change ?? marketInfo.change24h) / 100) * (marketInfo.usd ?? marketInfo.price)))
                          : formatPrice(quoteData?.previous_close)
                      }
                    />`;
                    
  code = code.replace(searchRegex, newPreviousClose);
  
  const searchPrice = /<InfoRow\s+label="Price"\s+value=\{([^}]+)\}\s*\/>/s;
  const newPrice = `<InfoRow
                      label="Price"
                      value={
                        (marketInfo?.usd ?? marketInfo?.price) !== undefined
                          ? \`$$\{(marketInfo.usd ?? marketInfo.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}\`
                          : formatPrice(quoteData?.close)
                      }
                    />`;
  code = code.replace(searchPrice, newPrice);


  fs.writeFileSync(filePath, code);
  console.log('Updated ' + filePath);
}

updateFile('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx');
updateFile('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingChart.tsx');

const fs = require('fs');
const path = require('path');

const files = [
  'src/components/trading/spot-trading/TradingChart.tsx',
  'src/components/trading/futures-trading/FutureTradingChart.tsx'
];

const replacement = `  const getTradingViewSymbol = (sym: string) => {
    const s = sym.toUpperCase();
    const base = s.split("/")[0] || s;
    const quote = s.split("/")[1] || "USDT";

    const mappings: Record<string, string> = {
      AAPL: "NASDAQ:AAPL",
      MSFT: "NASDAQ:MSFT",
      GOOGL: "NASDAQ:GOOGL",
      AMZN: "NASDAQ:AMZN",
      TSLA: "NASDAQ:TSLA",
      META: "NASDAQ:META",
      SPX: "SP:SPX",
      INDU: "DJ:DJI",
      CCMP: "NASDAQ:IXIC",
      FTSE: "TVC:UKX",
      DAX: "XETR:DAX",
      GOLD: "OANDA:XAUUSD",
      SILVER: "OANDA:XAGUSD",
      OIL: "TVC:USOIL",
      NATGAS: "TVC:NATGAS",
      COPPER: "COMEX:HG1!",
      "^GSPC": "SP:SPX",
      "^DJI": "DJ:DJI",
      "^IXIC": "NASDAQ:IXIC",
      "^NYA": "NYSE:NYA",
      "^RUT": "CBOE:RUT",
      "^FTSE": "TVC:UKX",
      "^FTMC": "FTSE:FTMC",
      "^GDAXI": "XETR:DAX",
      "^FCHI": "EURONEXT:PX1",
      "^STOXX50E": "EURONEXT:PX1",
      "^IBEX": "BME:IBEX",
      "^N225": "OSE:N225",
      "^TOPX": "OSE:TOPIX",
      "000001.SS": "SSE:000001",
      "^HSI": "HKEX:HSI",
      "399001.SZ": "SZSE:399001",
      "^NSEI": "NSE:NIFTY",
      "^BSESN": "BSE:SENSEX",
      "^KSE": "KSE:KSE100",
      "^AXJO": "ASX:XJO",
      "^GSPTSE": "TSX:TSX",
      "URTH": "AMEX:URTH"
    };

    if (mappings[base]) return mappings[base];
    
    if (base.startsWith('^')) {
      return base.replace('^', '');
    }

    if (["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD"].includes(base)) {     
      return \`FX:\${base}\${quote.replace("T", "")}\`;
    }

    if (quote.includes("USD")) {
      return \`BINANCE:\${base}\${quote}\`;
    }

    return s.replace("/", "");
  };`;

for (const relPath of files) {
  const file = path.join(__dirname, relPath);
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the old getTradingViewSymbol function across multiple lines
  const regex = /const getTradingViewSymbol = \([^]+\n\s+return s\.replace\("\/", ""\);\r?\n\s*\};/;
  
  if (regex.test(content)) {
    let replaced = content.replace(regex, replacement);
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('Successfully updated ' + file);
  } else {
    // try literal match
    const startObj = 'const getTradingViewSymbol = (sym: string) => {';
    const endObj = 'return s.replace("/", "");\r\n  };';
    const endObj2 = 'return s.replace("/", "");\n  };';
    
    let startIdx = content.indexOf(startObj);
    if(startIdx !== -1) {
        let endIdx = content.indexOf(endObj, startIdx);
        let endLen = endObj.length;
        if(endIdx === -1) {
            endIdx = content.indexOf(endObj2, startIdx);
            endLen = endObj2.length;
        }
        
        if(endIdx !== -1) {
            content = content.substring(0, startIdx) + replacement + content.substring(endIdx + endLen);
            fs.writeFileSync(file, content, 'utf8');
            console.log('Successfully updated ' + file + ' via substring');
        } else {
            console.log('Found start but not end in ' + file);
        }
    } else {
        console.log('Regex and substring did not match in ' + file);
    }
  }
}

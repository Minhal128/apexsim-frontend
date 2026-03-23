const fs = require('fs');
const path = require('path');

const files = [
  'src/components/trading/spot-trading/TradingChart.tsx',
  'src/components/trading/futures-trading/FutureTradingChart.tsx'
];

const replacement = \  const getTradingViewSymbol = (sym: string) => {
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
      SPX: "CAPITALCOM:US500",
      INDU: "CAPITALCOM:US30",
      CCMP: "CAPITALCOM:US100",
      FTSE: "CAPITALCOM:UK100",
      DAX: "CAPITALCOM:DE40",
      GOLD: "OANDA:XAUUSD",
      SILVER: "OANDA:XAGUSD",
      OIL: "TVC:USOIL",
      NATGAS: "TVC:NATGAS",
      COPPER: "COMEX:HG1!",
      "^GSPC": "CAPITALCOM:US500",
      "^DJI": "CAPITALCOM:US30",
      "^IXIC": "CAPITALCOM:US100",
      "^NYA": "AMEX:SPY",
      "^RUT": "CAPITALCOM:US2000",
      "^FTSE": "CAPITALCOM:UK100",
      "^FTMC": "TVC:UKX",
      "^GDAXI": "CAPITALCOM:DE40",
      "^FCHI": "CAPITALCOM:FR40",
      "^STOXX50E": "CAPITALCOM:EU50",
      "^IBEX": "CAPITALCOM:ES35",
      "^N225": "CAPITALCOM:JP225",
      "^TOPX": "TVC:TOPIX",
      "000001.SS": "TVC:SHCOMP",
      "^HSI": "CAPITALCOM:HK50",
      "399001.SZ": "TVC:SZCOMP",
      "^NSEI": "TVC:NIFTY",
      "^BSESN": "TVC:SENSEX",
      "^KSE": "TVC:KSE100",
      "^AXJO": "CAPITALCOM:AU200",
      "^GSPTSE": "TVC:TSX",
      "URTH": "AMEX:URTH"
    };

    if (mappings[base]) return mappings[base];
    
    if (base.startsWith('^')) {
      return base.replace('^', '');
    }

    if (["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD"].includes(base)) {     
      return \\\FX:\\\\\\\\\;
    }

    if (quote.includes("USD")) {
      return \\\BINANCE:\\\\\\\\\;
    }

    return s.replace("/", "");
  };\;

for (const relPath of files) {
  const file = path.join(__dirname, relPath);
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  const startObj = 'const getTradingViewSymbol = (sym: string) => {';
  const endObj = 'return s.replace("/", "");\\r\\n  };';
  const endObj2 = 'return s.replace("/", "");\\n  };';
  
  let startIdx = content.indexOf(startObj);
  if(startIdx !== -1) {
      let endIdx = content.indexOf(endObj, startIdx);
      let endLen = endObj.replace(/\\\\r\\\\n/g, '\\r\\n').replace(/\\\\n/g, '\\n').length;
      if(endIdx === -1) {
          endIdx = content.indexOf(endObj2.replace(/\\\\n/g, '\\n'), startIdx);
          endLen = endObj2.replace(/\\\\n/g, '\\n').length;
      }
      if(endIdx === -1) {
          // just try naive replace
          endIdx = content.indexOf('return s.replace("/", "");', startIdx);
          endIdx = content.indexOf('}', endIdx);
          endLen = 1;
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

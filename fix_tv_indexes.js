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
      return \\\FX:\\\\\\\\\;
    }

    if (quote.includes("USD")) {
      return \\\BINANCE:\\\\\\\\\;
    }

    return s.replace("/", "");
  };\;

for (const relPath of files) {
  const file = path.join(__dirname, relPath);
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the old getTradingViewSymbol function across multiple lines
  const regex = /const getTradingViewSymbol = \\(sym: string\\) => \\{[\\s\\S]*?return s\\.replace\\("\\/", ""\\);\\r?\\n\\s*\\};/;

  if (regex.test(content)) {
    let replaced = content.replace(regex, replacement);
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('Successfully updated ' + file);
  } else {
    console.log('Regex did not match in ' + file);
  }
}

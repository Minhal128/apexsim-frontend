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
      "^NYA": "AMEX:SPY", // Proxy for NYSE if unavailable
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
  if (!fs.existsSync(file)) {
    continue;
  }

  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the old getTradingViewSymbol function across multiple lines
  const regex = /const getTradingViewSymbol = \\(sym: string\\) => \\{[\\s\\S]*?return s\\.replace\\("\\/", ""\\);\\r?\\n\\s*\\};/;

  if (regex.test(content)) {
    let replaced = content.replace(regex, replacement);
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('Successfully updated ' + file);
  }
}

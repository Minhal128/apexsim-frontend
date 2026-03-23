const fs = require('fs');

function patchTV(file) {
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(/const mappings: Record<string, string> = \{([\s\S]*?)\};\n\n    if \(mappings\[base\]\) return mappings\[base\];/, `const mappings: Record<string, string> = {
      // Stocks
      AAPL: "NASDAQ:AAPL", MSFT: "NASDAQ:MSFT", GOOGL: "NASDAQ:GOOGL",
      AMZN: "NASDAQ:AMZN", NVDA: "NASDAQ:NVDA", META: "NASDAQ:META",
      TSLA: "NASDAQ:TSLA", "BRK-B": "NYSE:BRK.B", LLY: "NYSE:LLY", V: "NYSE:V",
      // Commodities
      GOLD: "OANDA:XAUUSD", SILVER: "OANDA:XAGUSD", OIL: "TVC:USOIL",
      NATGAS: "TVC:NATGAS", COPPER: "COMEX:HG1!",
      // Indices
      "^GSPC": "CAPITALCOM:US500", SPX: "CAPITALCOM:US500", SP500: "CAPITALCOM:US500",
      "^DJI": "CAPITALCOM:US30", DJI: "CAPITALCOM:US30",
      "^IXIC": "CAPITALCOM:US100", IXIC: "CAPITALCOM:US100", NASDAQ: "CAPITALCOM:US100",
      "^NYA": "AMEX:SPY", "^RUT": "CAPITALCOM:US2000", RUT: "CAPITALCOM:US2000",
      "^FTSE": "CAPITALCOM:UK100", FTSE: "CAPITALCOM:UK100", "^FTMC": "FTSE:FTMC",
      "^GDAXI": "CAPITALCOM:DE40", GDAXI: "CAPITALCOM:DE40",
      "^FCHI": "CAPITALCOM:FR40", FCHI: "CAPITALCOM:FR40",
      "^STOXX50E": "CAPITALCOM:EU50", STOXX50E: "CAPITALCOM:EU50",
      "^IBEX": "CAPITALCOM:ES35", IBEX: "CAPITALCOM:ES35",
      "^N225": "CAPITALCOM:JP225", N225: "CAPITALCOM:JP225",
      "^TOPX": "OSE:TOPIX", "000001.SS": "SSE:000001",
      "^HSI": "CAPITALCOM:HK50", HSI: "CAPITALCOM:HK50",
      "399001.SZ": "SZSE:399001", "^NSEI": "NSE:NIFTY", NSEI: "NSE:NIFTY",
      "^BSESN": "BSE:SENSEX", BSESN: "BSE:SENSEX", "^KSE": "KSE:KSE100", KSE: "KSE:KSE100",
      "^AXJO": "CAPITALCOM:AU200", AXJO: "CAPITALCOM:AU200", "^GSPTSE": "TSX:TSX", GSPTSE: "TSX:TSX",
      URTH: "AMEX:URTH"
    };

    if (s.includes(":")) return s;
    if (mappings[base]) return mappings[base];
    if (mappings[s]) return mappings[s];

    // Explicit check for Forex pairs since backend returns things like EURUSD
    if (s.length === 6 && ["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD"].some(prefix => s.startsWith(prefix))) {
      return \`FX:\${s}\`;
    }
`);

  // Ensure forex logic fallback works
  if (code.includes('if (["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD"].includes(base)) {')) {
    code = code.replace(/if \(\["EUR", "GBP", "AUD", "JPY", "CAD", "CHF", "NZD"\]\.includes\(base\)\) \{\n      return `FX:\$\{base\}\$\{quote\.replace\("T", ""\)\}`;\n    \}/, '');
  }

  // Rewrite USD logic not to break explicitly captured forex/symbols
  let oldQuote = /if \(quote\.includes\("USD"\)\) \{\n      return `BINANCE:\$\{base\}USDT`;\n    \}/;
  let newQuote = `if (quote.includes("USD") && !s.includes("FX:")) {
      return \`BINANCE:\${base}USDT\`;
    }`;
  code = code.replace(oldQuote, newQuote);

  fs.writeFileSync(file, code);
}
patchTV('apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx');
patchTV('apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingChart.tsx');
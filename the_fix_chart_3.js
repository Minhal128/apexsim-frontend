const fs = require('fs');

function patchTV(file) {
  let code = fs.readFileSync(file, 'utf8');

  // We find everything from "const getTradingViewSymbol = (sym: string) => {" to the end of the function.
  // We can do this cleanly by looking for "const getTradingViewSymbol =" and the next "const tvSymbol ="
  const startIdx = code.indexOf('const getTradingViewSymbol =');
  const endIdx = code.indexOf('const tvSymbol =', startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.log('Could not find function in', file);
    return;
  }

  const newFunc = `const getTradingViewSymbol = (sym: string) => {
    const s = sym.toUpperCase();
    const base = s.split("/")[0] || s;
    const quote = s.split("/")[1] || "USDT";

    const mappings: Record<string, string> = {
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

    if (quote.includes("USD") && !s.includes("FX:")) {
      return \`BINANCE:\${base}USDT\`;
    }
    
    return base.replace('^', '');
  };

  `;

  code = code.substring(0, startIdx) + newFunc + code.substring(endIdx);
  fs.writeFileSync(file, code);
  console.log('Patched', file);
}

patchTV('apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx');
patchTV('apexsim-webapp-master/src/components/trading/futures-trading/FutureTradingChart.tsx');

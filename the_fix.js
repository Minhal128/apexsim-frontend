const fs = require('fs');
const HARD = `
const HARDCODED_MARKETS = {
  crypto: [
    { symbol: "BINANCE:BTCUSDT", name: "Bitcoin / USDT", usd: 65000, change24h: 2.5, image: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    { symbol: "BINANCE:ETHUSDT", name: "Ethereum / USDT", usd: 3500, change24h: 1.2, image: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { symbol: "BINANCE:SOLUSDT", name: "Solana / USDT", usd: 150, change24h: 5.4, image: "https://cryptologos.cc/logos/solana-sol-logo.png" }
  ],
  forex: [
    { symbol: "FX:EURUSD", name: "Euro / US Dollar", usd: 1.08, change24h: 0.1, image: "https://cdn-icons-png.flaticon.com/512/197/197484.png" },
    { symbol: "FX:USDJPY", name: "US Dollar / Yen", usd: 150.5, change24h: 0.3, image: "https://cdn-icons-png.flaticon.com/512/197/197604.png" }
  ],
  stocks: [
    { symbol: "NASDAQ:AAPL", name: "Apple Inc.", usd: 175.5, change24h: 1.5, image: "https://companieslogo.com/img/orig/AAPL-420a7b45.png" },
    { symbol: "NASDAQ:TSLA", name: "Tesla Inc.", usd: 195.2, change24h: -2.1, image: "https://companieslogo.com/img/orig/TSLA-560410ff.png" }
  ],
  commodities: [
    { symbol: "OANDA:XAUUSD", name: "Gold / US Dollar", usd: 2350.5, change24h: 0.8, image: "https://cdn-icons-png.flaticon.com/512/3034/3034002.png" },
    { symbol: "TVC:USOIL", name: "US Oil", usd: 82.5, change24h: -0.5, image: "https://cdn-icons-png.flaticon.com/512/2823/2823522.png" }
  ],
  indices: [
    { symbol: "TVC:RUT", name: "Russell 2000", usd: 2050.5, change24h: 0.5, image: "https://cdn-icons-png.flaticon.com/512/2921/2921935.png" },
    { symbol: "SP:SPX", name: "S&P 500", usd: 5150.0, change24h: 1.2, image: "https://cdn-icons-png.flaticon.com/512/2921/2921935.png" }
  ]
};
`;
let p1 = 'apexsim-webapp-master/src/components/trading/futures-trading/CoinSelector.tsx';
let txt1 = fs.readFileSync(p1, 'utf8');
txt1 = txt1.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[isOpen, category\]\);/, HARD + '\n  useEffect(() => { if(!isOpen) return; setCoins((HARDCODED_MARKETS[category] || [])); setLoading(false); }, [isOpen, category]);');
fs.writeFileSync(p1, txt1);

let p2 = 'apexsim-webapp-master/src/app/dashboard/(trade)/spot-trade/page.tsx';
let txt2 = fs.readFileSync(p2, 'utf8');
txt2 = txt2.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[category\]\); \/\/ eslint-disable-line react-hooks\/exhaustive-deps/, HARD + '\n  useEffect(() => {\n    const list = HARDCODED_MARKETS[category] || [];\n    setCoins(list.map(c => ({ id: c.symbol.toLowerCase(), symbol: c.symbol, name: c.name, current_price: c.usd, price_change_percentage_24h: c.change24h, image: c.image })));\n    const assetBase = initialAsset;\n    const match = list.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase());\n    if (match) setSelectedCoin({ id: match.symbol.toLowerCase(), symbol: match.symbol, name: match.name, current_price: match.usd, price_change_percentage_24h: match.change24h, image: match.image });\n    setCoinsLoading(false);\n  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps');
fs.writeFileSync(p2, txt2);
console.log('done');

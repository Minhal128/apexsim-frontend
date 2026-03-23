const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/dashboard/(trade)/futures-trade/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add missing state hooks below `const assetBase = ...`
const stateDecl = `  // Coin dropdown state
  const [coins, setCoins]               = useState<CoinInfo[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [category, setCategory] = useState(categoryParam || 'crypto');
  const categories = ['crypto', 'forex', 'commodities', 'indices', 'stocks'];
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo>({
    id: assetBase.toLowerCase(),
    symbol: assetBase.toLowerCase(),
    name: assetBase,
    image: \`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/\${assetBase.toLowerCase().replace('^', '')}.png\`,
    current_price: 0,
    price_change_percentage_24h: 0,
    market_cap_rank: 1,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [dropdownPos,  setDropdownPos]  = useState({ top: 0, left: 0, width: 288 });

  // Refs \u2014 trigger button for measuring, overlay div for outside-click
  const triggerRef  = useRef<HTMLButtonElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);`;

content = content.replace(
  "const assetBase = assetParam.includes('/') ? assetParam.split('/')[0] : assetParam;",
  "const assetBase = assetParam.includes('/') ? assetParam.split('/')[0] : assetParam;\n\n" + stateDecl
);

// 2. We need to add the `fetch initial coins` and `close dropdown` logic and `openDropdown`.
const effects = `
  // Sync selectedCoin when URL asset changes
  useEffect(() => {
    const match = coins.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase());
    if (match && match.symbol.toLowerCase() !== selectedCoin.symbol.toLowerCase()) {
      setSelectedCoin(match);
      setMarketInfo(null); // Reset market info for new asset
    }
  }, [assetBase, coins]);

  // Fetch coins from backend or socket
  useEffect(() => {
    let mounted = true;
    const socket = initializeSocket();
    socket.emit('subscribe-market', category);
    
    const handleMarketData = (data: any) => {
      const validData = Object.entries(data).filter(([_, details]: [string, any]) => (details.usd > 0 || details.price > 0 || details.value > 0 || details.regularMarketPrice > 0));
      if (validData.length > 0) {
        const formatted: CoinInfo[] = validData.map(([symbol, details]: [string, any]) => ({
          id: symbol.toLowerCase(),
          symbol: details.symbol || symbol.toUpperCase(),
          name: details.name || details.pair || symbol,
          current_price: details.usd || details.price || details.value || details.regularMarketPrice || 0,
          price_change_percentage_24h: details.change24h || details.regularMarketChangePercent || 0,
          image: details.image || \`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/\${symbol.toLowerCase().replace('^', '')}.png\`,
          market_cap_rank: 1
        }));
        setCoins(formatted);
        const match = formatted.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase());
        if (match) setSelectedCoin(match);
        setCoinsLoading(false);
      }
    };

    apiRequest('/market/prices').then((data: any) => {
      if (!mounted) return;
      handleMarketData(data);
    }).catch((e) => {
      console.error("Failed to load initial market data", e);
      setCoinsLoading(false);
    });

    socket.on('market-data', handleMarketData);
    socket.on('market-update', handleMarketData);

    return () => {
      mounted = false;
      socket.off('market-data', handleMarketData);
      socket.off('market-update', handleMarketData);
    };
  }, [category, assetBase]); 

  // Close dropdown when clicking outside the fixed overlay
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInsideOverlay  = overlayRef.current?.contains(target);
      const isInsideTrigger  = triggerRef.current?.contains(target);
      if (!isInsideOverlay && !isInsideTrigger) {
        setDropdownOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  // Recalculate position when window resizes while open
  useEffect(() => {
    if (!dropdownOpen) return;
    function onResize() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 288) });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dropdownOpen]);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 288) });
    setDropdownOpen(true);
    setSearchQuery('');
  }, []);
`;

// Insert effects before `const [walletInfo, setWalletInfo]` or similar.
// Let's insert it before `const [walletInfo, setWalletInfo] = useState<any>({`
content = content.replace(
  "const [walletInfo, setWalletInfo] = useState<any>({",
  effects + "\n  const [walletInfo, setWalletInfo] = useState<any>({"
);

// 3. One more thing: `filteredCoins` needs to be defined BEFORE it is used in the UI.
// We can define it before the `handleExecuteTrade`
const filteredCoins = `
  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );
`;
content = content.replace(
  "const handleExecuteTrade = async",
  filteredCoins + "\n  const handleExecuteTrade = async"
);


fs.writeFileSync(file, content);
console.log('patched futures-trade page.tsx');

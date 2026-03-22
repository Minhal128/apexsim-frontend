const fs = require('fs');
let file = fs.readFileSync('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/CoinSelector.tsx', 'utf8');

file = file.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [category, setCategory] = useState("crypto");\n  const categories = ["crypto", "forex", "commodities", "indices", "stocks"];'
);

file = file.replace(
  /useEffect\(\(\) => \{\n\s+if \(!isOpen\) return;\n\n\s+const socket = initializeSocket\(\);\n\s+socket\.emit\('subscribe-market', 'crypto'\);/g,
  "useEffect(() => {\n    if (!isOpen) return;\n\n    const socket = initializeSocket();\n    socket.emit('subscribe-market', category);\n"
);

file = file.replace(
  /\[isOpen\]\);/g,
  "[isOpen, category]);"
);

file = file.replace(
  /const fetchInitialCoins = async \(\) => \{/g,
  "const fetchInitialCoins = async () => {\n      if (category !== 'crypto') return;\n"
);

// Add category buttons below search bar
let str = '</div>\n        </div>\n\n        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">\n          {categories.map((cat) => (\n            <button\n              key={cat}\n              onClick={() => { setCategory(cat); setCoins([]); setLoading(true); }}\n              className={px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors }\n            >\n              {cat}\n            </button>\n          ))}\n        </div>\n\n        <div className="flex-1 overflow-y-auto';

file = file.replace(
  /<\/div>\n\s+<\/div>\n\n\s+<div className="flex-1 overflow-y-auto/g,
  str
);

fs.writeFileSync('H:/Development/Apexsim/apexsim-webapp-master/src/components/trading/futures-trading/CoinSelector.tsx', file);
console.log("Patched CoinSelector.tsx");

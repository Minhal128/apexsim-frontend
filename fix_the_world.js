const fs = require('fs');

const spot = fs.readFileSync('spot_copy.txt', 'utf8');
const fut = fs.readFileSync('fut_copy.txt', 'utf8');

// 1. Get header from spot
const spotStart = spot.indexOf('<div className="flex items-center gap-4 md:px-4 px-6 md:py-4 py-2 border-b');
const spotEnd = spot.indexOf('<div className="flex flex-col md:flex-row h-full gap-px bg-white/5">');
const spotHeader = spot.slice(spotStart, spotEnd);

// 2. Remove CoinSelector import
let newFut = fut.replace("import CoinSelector from '@/components/trading/futures-trading/CoinSelector';\n", "");

// 3. Replace state logic
const stateStart = spot.indexOf('  // Coin dropdown state');
const stateEnd = spot.indexOf('  // Keep URL in sync on initial drop');
const stateCode = spot.slice(stateStart, stateEnd);

newFut = newFut.replace(/  const \[isSelectorOpen, setIsSelectorOpen\] = useState\(false\);\n/, "  const [isSelectorOpen, setIsSelectorOpen] = useState(false);\n" + stateCode);

// 4. Replace the Header in fut
const futStart = fut.indexOf('<div className="flex items-center justify-between gap-4 md:px-4');
const futEnd = fut.indexOf('<div className="flex flex-col md:flex-row w-full md:overflow-y-auto');
let futHeaderCode = spotHeader;
// Note: we need to make sure the header fits in the tree properly.
// The spotHeader uses 'selectedCoin'. Let's rename selectedCoin to marketInfo things? No wait, spot uses marketInfo AND selectedCoin.
// In Futures, 'selectedCoin' is not defined? Wait, in spot, 'selectedCoin' is derived from coins.find(...)
// The stateCode gives us coins, searchQuery, selectedCoin, etc.
// spot has this:
// const selectedCoin = coins.find((c) => c.symbol.toLowerCase() === assetBase.toLowerCase()) || coins[0];
// It is part of the stateCode!

newFut = newFut.replace(fut.slice(futStart, futEnd), spotHeader);

// 5. Remove the bottom CoinSelector component in fut
const bottomCoinSelectorStart = newFut.indexOf('<CoinSelector');
if (bottomCoinSelectorStart !== -1) {
   const bottomCoinSelectorEnd = newFut.indexOf('currentAsset={assetParam}', bottomCoinSelectorStart) + 26; // approx length of line + />
   const afterEnd = newFut.indexOf('/>', bottomCoinSelectorEnd - 30);
   if (afterEnd !== -1) {
       newFut = newFut.slice(0, bottomCoinSelectorStart) + newFut.slice(afterEnd + 2);
   }
}

fs.writeFileSync('src/app/dashboard/(trade)/futures-trade/page.tsx', newFut);
console.log('FUTURES FIXED!');

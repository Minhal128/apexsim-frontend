const fs = require('fs');
let file = fs.readFileSync('h:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx', 'utf8');
file = file.replace(/\);\s*\);/g, ');\n');
fs.writeFileSync('h:/Development/Apexsim/apexsim-webapp-master/src/components/trading/spot-trading/TradingChart.tsx', file);

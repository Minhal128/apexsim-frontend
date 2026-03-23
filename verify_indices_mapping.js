const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, 'src/components/trading/spot-trading/TradingChart.tsx'),
  path.join(__dirname, 'src/components/trading/futures-trading/FutureTradingChart.tsx')
];

function verifyMappings(file) {
  console.log(`\nVerifying mappings in ${path.basename(file)}...`);
  const content = fs.readFileSync(file, 'utf8');

  // Regex to extract the US Indices to Other Indices section roughly
  const regex = /\/\/ US Indices([\s\S]*?)\/\/ Other Indices([\s\S]*?)URTH:\s*"([^"]+)"/g;
  
  const matches = [...content.matchAll(regex)];
  if (matches.length > 0) {
    console.log("✅ Successfully found Indices mapping block in the file.");
    
    // We can also extract individual key value pairs
    const keyValueRegex = /"([^"]+)"|\b([A-Z0-9_]+)\b\s*:\s*"([^"]+)"/g;
    
    // Simplistic extraction just to show what it found mapped
    const block = matches[0][0]; 
    const lines = block.split('\n').filter(l => l.includes(': "'));
    
    let total = 0;
    const uniqueTargets = new Set();
    
    lines.forEach(line => {
      const match = line.match(/(['"]?)([\^A-Z0-9_\.]+)\1\s*:\s*"([^"]+)"/i);
      if (match) {
        total++;
        uniqueTargets.add(match[3]);
      }
    });

    console.log(`✅ Found ${total} mappings pointing to ${uniqueTargets.size} unique TV symbols:`);
    console.log([...uniqueTargets].join(', '));
  } else {
    console.log("❌ Could not find the Indices mapping block.");
  }
}

targetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    verifyMappings(file);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

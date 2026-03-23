const fs = require('fs');
const f = fs.readFileSync('fut_copy.txt', 'utf8');
const r = f.match(/<div className="flex flex-col md:flex-row[^>]*>/);
console.log('Flex col:', r ? r[0] : 'nope');

const start = f.indexOf('<div className="flex items-center justify-between gap-4 md:px-4');
console.log('Start:', start !== -1 ? 'found' : 'not found');

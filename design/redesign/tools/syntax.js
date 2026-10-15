const fs = require('fs');
const src = fs.readFileSync(process.argv[2], 'utf8');
try { new Function('DCLogic', 'StreamableLogic', 'React', src + '\n;return Component;'); console.log('syntax ok'); }
catch (e) { console.log('SYNTAX ERROR', e.message); process.exit(1); }

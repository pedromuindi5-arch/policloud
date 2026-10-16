const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');

js = js.replace('const iconConfig = getFileIcon(latest.tipo);', 'const iconConfig = getFileIconType(latest.name, latest.tipo);');

fs.writeFileSync('js/cloud.js', js, 'utf8');
console.log('Fixed getFileIcon reference!');

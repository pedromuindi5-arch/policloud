const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');

js = js.replace('const safeName = latest.nome;', 'const safeName = latest.name || latest.nome || \"Ficheiro sem nome\";');

fs.writeFileSync('js/cloud.js', js, 'utf8');
console.log('Fixed safeName reference!');

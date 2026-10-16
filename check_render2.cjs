const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');

const s = js.indexOf('function renderFilteredFiles');
const e = js.indexOf('// Inicialização', s);
if (s !== -1 && e !== -1) {
  fs.writeFileSync('check_render2.txt', js.substring(s, e), 'utf8');
}

const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');

const s = js.indexOf('function renderFolderSystem(files)');
const e = js.indexOf('function updateBreadcrumbsUI()');
if (s !== -1 && e !== -1) {
  fs.writeFileSync('check_render1.txt', js.substring(s, e), 'utf8');
}

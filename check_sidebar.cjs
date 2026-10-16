const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');

const i = js.indexOf('function setupSidebarByRole');
if (i !== -1) {
    console.log(js.substring(i, i + 500));
}

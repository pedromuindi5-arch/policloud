const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');
const s = js.indexOf('async function fetchAllFiles');
const e = js.indexOf('function groupFilesByVersion');
if(s !== -1 && e !== -1) {
  fs.writeFileSync('fetch_all.txt', js.substring(s, e), 'utf8');
  console.log('Done writing fetch_all.txt');
}

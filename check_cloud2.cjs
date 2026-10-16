const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');

const s = js.indexOf('async function initCloudApp');
if (s !== -1) {
  console.log(js.substring(s, s + 1000));
} else {
  console.log('initCloudApp not found');
}

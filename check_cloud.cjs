const fs = require('fs');
const js = fs.readFileSync('js/cloud.js', 'utf8');

const i1 = js.indexOf('async function initCloudApp()');
if (i1 !== -1) {
    console.log("=== initCloudApp ===");
    console.log(js.substring(i1, i1 + 800));
}

const i2 = js.indexOf('async function fetchAllFiles()');
if (i2 !== -1) {
    console.log("=== fetchAllFiles ===");
    console.log(js.substring(i2, i2 + 500));
}

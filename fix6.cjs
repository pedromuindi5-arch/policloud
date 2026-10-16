const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');

const replacement = `  if (typeof fetchAllFiles === 'function') {
    await fetchAllFiles();
    if (typeof renderFolderSystem === 'function') renderFolderSystem(allFilesData);
    if (typeof renderFilteredFiles === 'function') renderFilteredFiles();
  }`;

js = js.replace(`  if (typeof fetchAllFiles === 'function') {
    await fetchAllFiles();
  }`, replacement);

// Also fix the name display in setupSidebarByRole
js = js.replace('setupSidebarByRole(currentProfile.role, currentProfile.nome);', 'setupSidebarByRole(currentProfile.role, currentProfile.nome || currentProfile.full_name);');

fs.writeFileSync('js/cloud.js', js, 'utf8');
console.log('Fixed initCloudApp UI rendering bugs!');

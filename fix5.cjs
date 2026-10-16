const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');

// The block to move
const blockStart = '  const htmlArr = groupedList.map(item => {';
const blockEndStr = "  cloudFilesContainer.innerHTML = htmlArr.join('');\n";

const startIndex = js.indexOf(blockStart);
const endIndex = js.indexOf(blockEndStr) + blockEndStr.length;

if (startIndex === -1) {
  console.log('Block not found');
  process.exit(1);
}

const block = js.substring(startIndex, endIndex);

// Remove the block and its preceding `}`
let jsClean = js.substring(0, startIndex - 5) + js.substring(endIndex);

// Find the correct insertion point
const correctPointStr = `        <span style="color: var(--color-text-secondary); max-width: 320px; line-height: 1.5;">Não existem documentos nesta pasta com os critérios selecionados. Se fores docente, podes fazer o upload.</span>
      </div>
    \`;
    return;`;

const cIndex = jsClean.indexOf(correctPointStr);
if (cIndex === -1) {
  console.log('Correct point not found');
  process.exit(1);
}

jsClean = jsClean.substring(0, cIndex + correctPointStr.length) + '\n  }\n\n' + block + jsClean.substring(cIndex + correctPointStr.length);

fs.writeFileSync('js/cloud.js', jsClean, 'utf8');
console.log('Moved block to the correct place!');

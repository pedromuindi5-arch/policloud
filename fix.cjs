const fs = require('fs');
let c = fs.readFileSync('mural.html', 'utf8');

c = c.replace(/Ã¡/g, 'á')
     .replace(/Ã£/g, 'ã')
     .replace(/Ã§/g, 'ç')
     .replace(/Ã©/g, 'é')
     .replace(/Ã­/g, 'í')
     .replace(/Ã³/g, 'ó')
     .replace(/Ãµ/g, 'õ')
     .replace(/Ãº/g, 'ú')
     .replace(/Ãª/g, 'ê')
     .replace(/Ã¢/g, 'â')
     .replace(/Ã /g, 'À')
     .replace(/Ã€/g, 'À')
     .replace(/Ãƒ/g, 'Ã')
     .replace(/Ã /g, 'Á')
     .replace(/Ã‰/g, 'É')
     .replace(/ÃŠ/g, 'Ê')
     .replace(/Ã /g, 'Í')
     .replace(/Ã“/g, 'Ó')
     .replace(/Ã”/g, 'Ô')
     .replace(/Ã•/g, 'Õ')
     .replace(/Ãš/g, 'Ú')
     .replace(/Ã‡/g, 'Ç')
     .replace(/Ã/g, 'Á'); // Fallback for some

fs.writeFileSync('mural.html', c, 'utf8');

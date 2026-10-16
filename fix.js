const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');

js = js.replace(/<div class="state-empty" style="padding: 48px 16px;">[\s\S]*?<\/div>/, \<div class=\"state-empty\" style=\"padding: 60px 20px; background: var(--color-surface-base); border: 2px dashed var(--color-border-subtle); border-radius: 12px; margin-top: 20px; text-align: center; display: flex; flex-direction: column; align-items: center;\">
  <div style=\"background: rgba(37, 99, 235, 0.05); padding: 16px; border-radius: 50%; margin-bottom: 16px;\">
    <svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"var(--color-primary)\" stroke-width=\"1.5\">
      <path d=\"M20 16V9a2 2 0 0 0-2-2H9L7 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z\"></path>
      <path d=\"M12 12v6\"></path>
      <path d=\"M9 15h6\"></path>
    </svg>
  </div>
  <strong style=\"font-size: 17px; color: var(--color-text-primary); margin-bottom: 8px;\">Pasta Vazia</strong>
  <span style=\"color: var(--color-text-secondary); max-width: 320px; line-height: 1.5;\">Não existem documentos nesta pasta com os critérios selecionados. Se fores docente, podes fazer o upload.</span>
</div>\);

fs.writeFileSync('js/cloud.js', js, 'utf8');
console.log('Fixed!');

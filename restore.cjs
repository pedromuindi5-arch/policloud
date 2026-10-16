const fs = require('fs');
let js = fs.readFileSync('js/cloud.js', 'utf8');
const insertPoint = '    return;';
const code = `  }

  const htmlArr = groupedList.map(item => {
    const latest = item.latest;
    const safeName = latest.nome;
    const safeTurma = latest.turma || 'Todas';
    const iconConfig = getFileIcon(latest.tipo);
    const isAdmin = currentProfile?.role === 'admin';
    const isTeacher = (currentProfile?.role === 'professor' || currentProfile?.role === 'teacher');
    
    return \`
      <article class="cloud-file-card-wrapper" style="display: flex; flex-direction: column;">
        <div class="cloud-file-card">
          <div class="cloud-file-main">
            <div class="cloud-file-icon \${iconConfig.cssClass}">
              \${iconConfig.svg}
            </div>
            <div class="cloud-file-info">
              <div class="cloud-file-title-row">
                <span class="cloud-file-name" title="\${safeName}">\${safeName}</span>
                <span class="cloud-version-pill">v\${latest.version || 1}</span>
              </div>
              <div class="cloud-file-meta-row">
                <span class="cloud-meta-discipline">\${latest.disciplina || 'Geral'}</span>
                <span>Turma \${safeTurma}</span>
                <span>•</span>
                <span>\${formatFileSize(latest.size)}</span>
                <span>•</span>
                <span>\${formatDateDisplay(latest.created_at)}</span>
                <span>•</span>
                <span>Por: \${latest.uploader_name || 'Docente'}</span>
              </div>
            </div>
          </div>
          <div class="cloud-file-actions">
            \${(isAdmin || (isTeacher && latest.uploader_id === currentProfile?.id)) ? \`
            <button type="button" class="btn-delete-file" data-file-id="\${latest.id}" data-file-url="\${latest.file_url}" data-file-name="\${safeName}" style="background: transparent; color: var(--color-danger); border: 1px solid var(--color-danger); margin-right: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Apagar</span>
            </button>\` : ''}
            <button type="button" class="btn-download-file" data-file-id="\${latest.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Descarregar</span>
            </button>
          </div>
        </div>
      </article>
    \`;
  });
  
  cloudFilesContainer.innerHTML = htmlArr.join('');
`;

js = js.replace(insertPoint, insertPoint + '\n' + code);
fs.writeFileSync('js/cloud.js', js, 'utf8');
console.log('Restored rendering logic safely!');

// PoliCloud - Intranet Escolar IPPLN
// Lógica da Nuvem de Ficheiros & Materiais Pedagógicos (cloud.html)

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
import './theme.js';

function isConfigPlaceholder() { return false; }

// ==========================================
// Seletores do DOM
// ==========================================
const sessionOverlay = document.getElementById('session-check-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const appSidebar = document.getElementById('app-sidebar');
const navDashboardLink = document.getElementById('nav-dashboard-link');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const sidebarUserRole = document.getElementById('sidebar-user-role');
const demoRoleSwitcher = document.getElementById('demo-role-switcher');

// Filtros
const filterCurso = document.getElementById('filter-curso');
const filterCursoWrap = document.getElementById('filter-curso-wrap');
const filterClasse = document.getElementById('filter-classe');
const filterTurma = document.getElementById('filter-turma');
const filterTurmaWrap = document.getElementById('filter-turma-wrap');
const filterDisciplina = document.getElementById('filter-disciplina');
const filterSearch = document.getElementById('filter-search');
const activeFilterText = document.getElementById('active-filter-text');
const btnResetFilters = document.getElementById('btn-reset-filters');
const totalFilesCount = document.getElementById('total-files-count');
const cloudFilesContainer = document.getElementById('cloud-files-container');

// Modal de Upload
const btnOpenUpload = document.getElementById('btn-open-upload');
const uploadFileModal = document.getElementById('upload-file-modal');
const btnCloseUploadModal = document.getElementById('btn-close-upload-modal');
const btnCancelUpload = document.getElementById('btn-cancel-upload');
const uploadFileForm = document.getElementById('upload-file-form');
const fileDropzone = document.getElementById('file-dropzone');
const fileInput = document.getElementById('file-input');
const filePreviewCard = document.getElementById('file-preview-card');
const previewFileName = document.getElementById('preview-file-name');
const previewFileSize = document.getElementById('preview-file-size');
const previewFileIcon = document.getElementById('preview-file-icon');
const btnRemoveSelectedFile = document.getElementById('btn-remove-selected-file');
const uploadProgressBox = document.getElementById('upload-progress-box');
const uploadProgressText = document.getElementById('upload-progress-text');
const uploadProgressPercent = document.getElementById('upload-progress-percent');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const uploadFormAlert = document.getElementById('upload-form-alert');
const btnSubmitUpload = document.getElementById('btn-submit-upload');

// Campos do Formulário de Upload
const uploadDisciplina = document.getElementById('upload-disciplina');
const uploadCurso = document.getElementById('upload-curso');
const uploadClasse = document.getElementById('upload-classe');
const uploadTurma = document.getElementById('upload-turma');
const uploadCursoGroup = document.getElementById('upload-curso-group');
const uploadTurmaGroup = document.getElementById('upload-turma-group');
const studentUploadNote = document.getElementById('student-upload-note');
const studentTargetClassLabel = document.getElementById('student-target-class-label');

// ==========================================
// Constantes & Validações
// ==========================================
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg', 'webp'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

// Estado da Aplicação
let currentProfile = null;
let currentUser = null;
let selectedUploadFile = null;
let allFilesData = [];

// ==========================================
// Dados de Demonstração (com Histórico de Versões)
// ==========================================
const DEFAULT_DEMO_FILES = [
  // Ficheiro com versão histórica v1 e v2
  {
    id: 'demo-f-1a',
    name: 'Guiao_Laboratorio_VLANs_Roteamento.pdf',
    storage_path: 'materiais/INF-12A/Guiao_Laboratorio_VLANs_Roteamento_v1.pdf',
    file_url: 'materiais/INF-12A/Guiao_Laboratorio_VLANs_Roteamento_v1.pdf',
    size: 1845000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'INF-12A',
    version: 1,
    uploader_name: 'Prof. Manuel Gonçalves',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-f-1b',
    name: 'Guiao_Laboratorio_VLANs_Roteamento.pdf',
    storage_path: 'materiais/INF-12A/Guiao_Laboratorio_VLANs_Roteamento_v2.pdf',
    file_url: 'materiais/INF-12A/Guiao_Laboratorio_VLANs_Roteamento_v2.pdf',
    size: 2150000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'INF-12A',
    version: 2,
    uploader_name: 'Prof. Manuel Gonçalves',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  // Sebenta de Sistemas Digitais
  {
    id: 'demo-f-2',
    name: 'Sebenta_Arquitectura_Microcontroladores.docx',
    storage_path: 'materiais/INF-12A/Sebenta_Arquitectura_Microcontroladores_v1.docx',
    file_url: 'materiais/INF-12A/Sebenta_Arquitectura_Microcontroladores_v1.docx',
    size: 3420000,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    disciplina: 'Sistemas Digitais',
    curso: 'Informática',
    classe: '12ª',
    turma: 'INF-12A',
    version: 1,
    uploader_name: 'Prof. Maria Esperança',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  // Trabalho Prático entregue por um aluno
  {
    id: 'demo-f-3',
    name: 'Relatorio_Configuracao_Servidor_DNS.pdf',
    storage_path: 'materiais/INF-12A/Relatorio_Configuracao_Servidor_DNS_v1.pdf',
    file_url: 'materiais/INF-12A/Relatorio_Configuracao_Servidor_DNS_v1.pdf',
    size: 950000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'INF-12A',
    version: 1,
    uploader_name: 'Pedro Muindi (Aluno)',
    uploader_role: 'aluno',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  // Esquema Eléctrico para curso de Electricidade
  {
    id: 'demo-f-4',
    name: 'Esquema_Unifilar_Subestacao_Namibe.png',
    storage_path: 'materiais/ELE-11A/Esquema_Unifilar_Subestacao_Namibe_v1.png',
    file_url: 'materiais/ELE-11A/Esquema_Unifilar_Subestacao_Namibe_v1.png',
    size: 4200000,
    mime_type: 'image/png',
    disciplina: 'Máquinas Eléctricas',
    curso: 'Electricidade',
    classe: '11ª',
    turma: 'ELE-11A',
    version: 1,
    uploader_name: 'Prof. António Silva',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  // Livro Digital Geral de Matemática
  {
    id: 'demo-f-5',
    name: 'Manual_Calculo_Diferencial_Integral.pdf',
    storage_path: 'materiais/geral/Manual_Calculo_Diferencial_Integral_v1.pdf',
    file_url: 'materiais/geral/Manual_Calculo_Diferencial_Integral_v1.pdf',
    size: 8900000,
    mime_type: 'application/pdf',
    disciplina: 'Matemática',
    curso: 'Geral',
    classe: '12ª',
    turma: null,
    version: 1,
    uploader_name: 'Gabinete Pedagógico IPPLN',
    uploader_role: 'admin',
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

function getLocalDemoFiles() {
  try {
    const saved = localStorage.getItem('policloud_demo_files');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...DEFAULT_DEMO_FILES];
}

function saveLocalDemoFile(newFile) {
  const files = getLocalDemoFiles();
  files.unshift(newFile);
  try {
    localStorage.setItem('policloud_demo_files', JSON.stringify(files));
  } catch (e) {}
}

// ==========================================
// Utilitários de Formatação
// ==========================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

function getFileIconType(filename = '', mimeType = '') {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf' || mimeType.includes('pdf')) {
    return {
      cssClass: 'file-icon-pdf',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12v6"/><path d="M10 15h3a1.5 1.5 0 0 0 0-3h-3"/></svg>`
    };
  }
  if (['docx', 'doc'].includes(ext) || mimeType.includes('word')) {
    return {
      cssClass: 'file-icon-doc',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
    };
  }
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType.includes('image')) {
    return {
      cssClass: 'file-icon-img',
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`
    };
  }
  return {
    cssClass: 'file-icon-other',
    svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`
  };
}

// ==========================================
// Configuração do Perfil & Sidebar
// ==========================================
function setupSidebarByRole(role, nome) {
  if (navDashboardLink) {
    if (role === 'admin') {
      navDashboardLink.href = '/admin.html';
    } else if (role === 'professor') {
      navDashboardLink.href = '/dashboard-professor.html';
    } else {
      navDashboardLink.href = '/dashboard-aluno.html';
    }
  }

  if (sidebarUserName) sidebarUserName.textContent = nome || 'Utilizador';
  if (sidebarUserRole) {
    const roleMap = {
      admin: 'Administrador',
      professor: 'Docente / Professor',
      aluno: 'Estudante'
    };
    sidebarUserRole.textContent = `Perfil: ${roleMap[role] || role}`;
  }

  if (sidebarUserAvatar) {
    const initial = (nome || 'U').trim()[0].toUpperCase();
    sidebarUserAvatar.textContent = initial;
  }
}

function setupDemoRoleSwitcher(activeRole) {
  if (!demoRoleSwitcher) return;
  if (!isConfigPlaceholder()) {
    demoRoleSwitcher.style.display = 'none';
    return;
  }

  demoRoleSwitcher.style.display = 'flex';
  demoRoleSwitcher.innerHTML = `
    <span>Teste de Perfil:</span>
    <div class="demo-role-buttons">
      <button type="button" class="demo-role-btn ${activeRole === 'admin' ? 'active' : ''}" data-role="admin">Admin</button>
      <button type="button" class="demo-role-btn ${activeRole === 'professor' ? 'active' : ''}" data-role="professor">Professor</button>
      <button type="button" class="demo-role-btn ${activeRole === 'aluno' ? 'active' : ''}" data-role="aluno">Aluno</button>
    </div>
  `;

  demoRoleSwitcher.querySelectorAll('.demo-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      localStorage.setItem('policloud_demo_role', targetRole);
      window.location.reload();
    });
  });
}

// ==========================================
// Carregamento e Filtragem de Ficheiros
// ==========================================
async function fetchAllFiles() {
  try {
    let query = sb
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    // Regra estrita para Aluno: só vê e descarrega ficheiros do seu próprio curso/turma — NUNCA de outro curso!
    if (currentProfile.role === 'aluno') {
      const studentCurso = currentProfile.curso || 'Informática';
      // Filtra por arquivos do curso do aluno ou gerais da escola
      query = query.or(`curso.eq.${studentCurso},curso.eq.Geral,curso.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    allFilesData = data || [];
  } catch (err) {
    console.error('Erro ao consultar ficheiros:', err);
    allFilesData = getLocalDemoFiles();
  }
}

/**
 * Agrupa ficheiros por nome e contexto (para identificar versões históricas v1, v2, v3)
 */
function groupFilesByVersion(files) {
  const groups = new Map();

  files.forEach(file => {
    // Chave única: nome do ficheiro + contexto de turma/curso
    const groupKey = `${(file.name || '').toLowerCase()}:::${file.turma || file.curso || 'geral'}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(file);
  });

  const result = [];
  groups.forEach((fileList, key) => {
    // Ordena por versão descendente (a versão mais recente em primeiro)
    fileList.sort((a, b) => (b.version || 1) - (a.version || 1));
    result.push({
      groupKey: key,
      latest: fileList[0],
      versions: fileList,
      totalVersions: fileList.length
    });
  });

  // Ordena os grupos pela data da versão mais recente
  result.sort((a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime());
  return result;
}

/**
 * Renderiza a lista de ficheiros com base nos filtros selecionados
 */
function renderFilteredFiles() {
  if (!cloudFilesContainer) return;

  const selCurso = filterCurso ? filterCurso.value : 'todos';
  const selClasse = filterClasse ? filterClasse.value : 'todas';
  const selTurma = filterTurma ? filterTurma.value : 'todas';
  const selDisciplina = filterDisciplina ? filterDisciplina.value : 'todas';
  const searchTerm = (filterSearch ? filterSearch.value : '').trim().toLowerCase();

  // Aplica filtros sobre a base de dados
  let filtered = allFilesData.filter(file => {
    // 1. Regra de segurança do perfil Aluno: nunca ver outro curso
    if (currentProfile.role === 'aluno') {
      const studentCurso = currentProfile.curso || 'Informática';
      if (file.curso && file.curso !== 'Geral' && file.curso !== studentCurso) {
        return false;
      }
    }

    // 2. Filtro de Curso
    if (selCurso !== 'todos') {
      if (file.curso && file.curso !== 'Geral' && file.curso !== selCurso) return false;
    }

    // 3. Filtro de Classe
    if (selClasse !== 'todas') {
      if (file.classe && file.classe !== 'Geral' && file.classe !== selClasse) return false;
    }

    // 4. Filtro de Turma
    if (selTurma !== 'todas') {
      if (file.turma && file.turma !== selTurma) return false;
    }

    // 5. Filtro de Disciplina
    if (selDisciplina !== 'todas') {
      if (file.disciplina && file.disciplina !== selDisciplina) return false;
    }

    // 6. Pesquisa por Nome
    if (searchTerm) {
      const fileName = (file.name || '').toLowerCase();
      const disc = (file.disciplina || '').toLowerCase();
      const author = (file.uploader_name || '').toLowerCase();
      if (!fileName.includes(searchTerm) && !disc.includes(searchTerm) && !author.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });

  // Agrupamento por versão
  const groupedList = groupFilesByVersion(filtered);

  // Actualiza contadores e indicadores
  if (totalFilesCount) {
    const totalFiles = filtered.length;
    totalFilesCount.textContent = `${totalFiles} ${totalFiles === 1 ? 'ficheiro encontrado' : 'ficheiros encontrados'}`;
  }

  if (activeFilterText) {
    const filtersUsed = [];
    if (selCurso !== 'todos') filtersUsed.push(`Curso: ${selCurso}`);
    if (selClasse !== 'todas') filtersUsed.push(`Classe: ${selClasse}`);
    if (selTurma !== 'todas') filtersUsed.push(`Turma: ${selTurma}`);
    if (selDisciplina !== 'todas') filtersUsed.push(`Disciplina: ${selDisciplina}`);
    if (searchTerm) filtersUsed.push(`"${searchTerm}"`);

    if (filtersUsed.length > 0) {
      activeFilterText.textContent = `Filtros: ${filtersUsed.join(' • ')}`;
    } else {
      activeFilterText.textContent = currentProfile.role === 'aluno'
        ? `A mostrar ficheiros do seu curso (${currentProfile.curso || 'Informática'}) e turma`
        : 'A mostrar todos os ficheiros do IPPLN';
    }
  }

  // Estado Vazio
  if (groupedList.length === 0) {
    cloudFilesContainer.innerHTML = `
      <div class="state-empty" style="padding: 48px 16px; background: #ffffff; border: 1px solid var(--light-border); border-radius: 12px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--light-accent); opacity: 0.8;">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        </svg>
        <strong style="font-size: 15px; color: var(--light-text);">Nenhum ficheiro encontrado</strong>
        <span>Não existem documentos para os critérios de filtro selecionados. Tente ajustar os filtros ou submeter um novo ficheiro.</span>
      </div>
    `;
    return;
  }

  // Renderiza cada grupo de ficheiro
  cloudFilesContainer.innerHTML = groupedList.map(item => renderFileItem(item)).join('');

  // Adiciona eventos aos botões de Download Seguro (Signed URL)
  cloudFilesContainer.querySelectorAll('.btn-download-file, .btn-version-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileId = btn.getAttribute('data-file-id');
      handleSecureDownload(fileId);
    });
  });

  // Adiciona eventos para alternar histórico de versões
  cloudFilesContainer.querySelectorAll('.cloud-version-history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target-drawer');
      const drawer = document.getElementById(targetId);
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'flex' : 'none';
        btn.setAttribute('aria-expanded', String(isHidden));
        const iconSvg = btn.querySelector('svg');
        if (iconSvg) {
          iconSvg.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        }
      }
    });
  });
}

/**
 * Constrói o HTML de um ficheiro com suporte completo ao histórico de versões
 */
function renderFileItem(item) {
  const latest = item.latest;
  const versions = item.versions;
  const hasHistory = versions.length > 1;
  const iconConfig = getFileIconType(latest.name, latest.mime_type);
  const safeName = escapeHtml(latest.name || 'Documento');
  const safeTurma = latest.turma ? `Turma ${escapeHtml(latest.turma)}` : 'Geral';
  const drawerId = `drawer-${latest.id}`;

  return `
    <article class="cloud-file-card-wrapper" style="display: flex; flex-direction: column;">
      <div class="cloud-file-card">
        <div class="cloud-file-main">
          <div class="cloud-file-icon ${iconConfig.cssClass}">
            ${iconConfig.svg}
          </div>

          <div class="cloud-file-info">
            <div class="cloud-file-title-row">
              <span class="cloud-file-name" title="${safeName}">${safeName}</span>
              <span class="cloud-version-pill">v${latest.version || 1}</span>

              ${hasHistory ? `
                <button
                  type="button"
                  class="cloud-version-history-btn"
                  data-target-drawer="${drawerId}"
                  aria-expanded="false"
                  title="Ver histórico de versões anteriores"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition: transform 0.2s ease;">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <span>Histórico (${versions.length} versões)</span>
                </button>
              ` : ''}
            </div>

            <div class="cloud-file-meta-row">
              <span class="cloud-meta-discipline">${escapeHtml(latest.disciplina || 'Geral')}</span>
              <span>${safeTurma}</span>
              <span>•</span>
              <span>${formatFileSize(latest.size)}</span>
              <span>•</span>
              <span>${formatDateDisplay(latest.created_at)}</span>
              <span>•</span>
              <span>Por: ${escapeHtml(latest.uploader_name || 'Docente')}</span>
            </div>
          </div>
        </div>

        <div class="cloud-file-actions">
          <button
            type="button"
            class="btn-download-file"
            data-file-id="${latest.id}"
            aria-label="Descarregar ${safeName} versão ${latest.version || 1}"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Descarregar</span>
          </button>
        </div>
      </div>

      ${hasHistory ? `
        <!-- Acordeão com Histórico de Versões (v1, v2, v3...) -->
        <div id="${drawerId}" class="cloud-versions-drawer" style="display: none;">
          <span class="version-history-title">Histórico de Versões do Ficheiro</span>
          ${versions.map(v => `
            <div class="version-row">
              <div class="version-meta-left">
                <span class="version-tag">v${v.version || 1} ${v.version === latest.version ? '(Actual)' : ''}</span>
                <span class="version-date">${formatDateDisplay(v.created_at)}</span>
                <span class="version-author">Por: ${escapeHtml(v.uploader_name || 'Utilizador')}</span>
                <span>•</span>
                <span>${formatFileSize(v.size)}</span>
              </div>
              <button
                type="button"
                class="btn-version-download"
                data-file-id="${v.id}"
                title="Descarregar v${v.version || 1}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Descarregar v${v.version || 1}</span>
              </button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
}

// ==========================================
// DOWNLOAD SEGURO VIA STORAGE SIGNED URL
// ==========================================
async function handleSecureDownload(fileId) {
  const targetFile = allFilesData.find(f => f.id === fileId);
  if (!targetFile) {
    toast('Ficheiro não encontrado.', 'error');
    return;
  }

  // 1. Verificação de permissão estrita: se for aluno, não pode descarregar de outro curso!
  if (currentProfile.role === 'aluno') {
    const studentCurso = currentProfile.curso || 'Informática';
    if (targetFile.curso && targetFile.curso !== 'Geral' && targetFile.curso !== studentCurso) {
      toast('Acesso negado: Alunos não têm autorização para descarregar ficheiros de outros cursos.', 'error');
      return;
    }
  }

  const storagePath = targetFile.storage_path || targetFile.file_url;
  const fileName = targetFile.name || 'documento_policloud.pdf';

  // Feedback visual temporário no botão
  const clickedBtn = document.querySelector(`button[data-file-id="${fileId}"]`);
  let originalHtml = '';
  if (clickedBtn) {
    originalHtml = clickedBtn.innerHTML;
    clickedBtn.disabled = true;
    clickedBtn.innerHTML = `
      <div class="spinner spinner-light" style="width: 14px; height: 14px; border-width: 2px;"></div>
      <span>A assinar link...</span>
    `;
  }

  try {
    // Supabase Storage: gera Signed URL temporária (60 segundos de validade)
    const { data, error } = await sb.storage
      .from('policloud')
      .createSignedUrl(storagePath, 60, {
        download: fileName
      });

    if (error) {
      throw error;
    }

    if (!data || !data.signedUrl) {
      throw new Error('Não foi possível obter o link seguro para download.');
    }

    triggerBrowserDownload(data.signedUrl, fileName);
  } catch (err) {
    console.error('Erro ao gerar download seguro:', err);
    toast(`Erro ao descarregar ficheiro: ${err.message || 'Verifique as suas permissões de acesso.'}`, 'error');
  } finally {
    if (clickedBtn) {
      clickedBtn.disabled = false;
      clickedBtn.innerHTML = originalHtml;
    }
  }
}

function triggerBrowserDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// UPLOAD DE FICHEIROS COM VALIDAÇÃO & VERSIONAMENTO
// ==========================================
function openUploadModal() {
  hideUploadAlert();
  resetUploadForm();

  // Configuração contextual do formulário dependente do perfil:
  if (currentProfile.role === 'aluno') {
    // Aluno: só pode fazer upload dentro da sua própria turma!
    if (uploadCurso) {
      uploadCurso.value = currentProfile.curso || 'Informática';
      uploadCurso.disabled = true;
    }
    if (uploadClasse) {
      uploadClasse.value = currentProfile.classe || '12ª';
      uploadClasse.disabled = true;
    }
    if (uploadTurma) {
      uploadTurma.value = currentProfile.turma || 'INF-12A';
      uploadTurma.disabled = true;
    }
    if (studentUploadNote) {
      studentUploadNote.style.display = 'block';
      if (studentTargetClassLabel) {
        studentTargetClassLabel.textContent = `${currentProfile.curso || 'Informática'} • Turma ${currentProfile.turma || 'INF-12A'}`;
      }
    }
  } else {
    // Professor / Admin: pode fazer upload em qualquer turma
    if (uploadCurso) uploadCurso.disabled = false;
    if (uploadClasse) uploadClasse.disabled = false;
    if (uploadTurma) uploadTurma.disabled = false;
    if (studentUploadNote) studentUploadNote.style.display = 'none';
  }

  if (uploadFileModal) uploadFileModal.classList.remove('hidden');
}

function closeUploadModal() {
  if (uploadFileModal) uploadFileModal.classList.add('hidden');
}

function showUploadAlert(msg, type = 'error') {
  if (!uploadFormAlert) return;
  uploadFormAlert.className = `alert-box visible alert-${type}`;
  uploadFormAlert.innerHTML = `<span>${escapeHtml(msg)}</span>`;
}

function hideUploadAlert() {
  if (!uploadFormAlert) return;
  uploadFormAlert.className = 'alert-box';
  uploadFormAlert.innerHTML = '';
}

function resetUploadForm() {
  if (uploadFileForm) uploadFileForm.reset();
  selectedUploadFile = null;
  if (filePreviewCard) filePreviewCard.style.display = 'none';
  if (fileDropzone) fileDropzone.style.display = 'flex';
  if (uploadProgressBox) uploadProgressBox.style.display = 'none';
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
}

/**
 * Validação prévia de formato e tamanho (máx 15MB)
 */
function handleFileSelection(file) {
  hideUploadAlert();
  if (!file) return;

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  // 1. Validação de formato (PDF, DOCX, DOC, PNG, JPG, JPEG, WEBP)
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mime);

  if (!isExtAllowed && !isMimeAllowed) {
    showUploadAlert('Formato de ficheiro não suportado. Apenas são aceites documentos PDF, Word (.doc, .docx) e imagens (.png, .jpg, .jpeg, .webp).');
    selectedUploadFile = null;
    return;
  }

  // 2. Validação de tamanho máximo (15MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    showUploadAlert(`O ficheiro seleccionado tem ${sizeMb} MB e excede o limite máximo permitido de 15 MB.`);
    selectedUploadFile = null;
    return;
  }

  // Ficheiro válido
  selectedUploadFile = file;

  if (previewFileName) previewFileName.textContent = file.name;
  if (previewFileSize) previewFileSize.textContent = formatFileSize(file.size);

  const iconInfo = getFileIconType(file.name, file.type);
  if (previewFileIcon) {
    previewFileIcon.className = `cloud-file-icon ${iconInfo.cssClass}`;
    previewFileIcon.innerHTML = iconInfo.svg;
  }

  if (fileDropzone) fileDropzone.style.display = 'none';
  if (filePreviewCard) filePreviewCard.style.display = 'flex';
}

function clearSelectedFile() {
  selectedUploadFile = null;
  if (fileInput) fileInput.value = '';
  if (filePreviewCard) filePreviewCard.style.display = 'none';
  if (fileDropzone) fileDropzone.style.display = 'flex';
  hideUploadAlert();
}

/**
 * Submissão de Upload com Versionamento Automático
 */
async function handleUploadSubmit(e) {
  e.preventDefault();
  hideUploadAlert();

  if (!selectedUploadFile) {
    showUploadAlert('Por favor, selecione um ficheiro para enviar.');
    return;
  }

  const disciplina = uploadDisciplina ? uploadDisciplina.value : 'Geral';
  if (!disciplina) {
    showUploadAlert('Por favor, selecione a disciplina.');
    return;
  }

  // Regras de contexto
  let targetCurso = uploadCurso.value;
  let targetClasse = uploadClasse.value;
  let targetTurma = uploadTurma.value;

  // Se aluno, força o contexto do próprio perfil (segurança contra manipulação da UI)
  if (currentProfile.role === 'aluno') {
    targetCurso = currentProfile.curso || 'Informática';
    targetClasse = currentProfile.classe || '12ª';
    targetTurma = currentProfile.turma || 'INF-12A';
  }

  btnSubmitUpload.disabled = true;

  // Ativa a barra de progresso
  if (uploadProgressBox) uploadProgressBox.style.display = 'block';
  if (uploadProgressBar) uploadProgressBar.style.width = '20%';
  if (uploadProgressPercent) uploadProgressPercent.textContent = '20%';
  if (uploadProgressText) uploadProgressText.textContent = 'A preparar ficheiro...';

  try {
    const rawFileName = selectedUploadFile.name.trim();

    // 1. Versionamento Automático:
    // Se já existir um ficheiro com o mesmo nome no mesmo contexto de turma/curso,
    // calcula a próxima versão em vez de sobrescrever/apagar a anterior!
    const existingVersions = allFilesData.filter(f =>
      f.name.toLowerCase() === rawFileName.toLowerCase() &&
      (f.turma === targetTurma || (!f.turma && targetTurma === 'todas'))
    );

    let nextVersion = 1;
    if (existingVersions.length > 0) {
      const maxVer = Math.max(...existingVersions.map(f => f.version || 1));
      nextVersion = maxVer + 1;
    }

    // Gera o caminho no Storage
    const sanitizedName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = targetTurma ? targetTurma : (targetCurso || 'geral');
    const storagePath = `materiais/${folder}/${Date.now()}_v${nextVersion}_${sanitizedName}`;

    // Progresso
    if (uploadProgressBar) uploadProgressBar.style.width = '55%';
    if (uploadProgressPercent) uploadProgressPercent.textContent = '55%';
    if (uploadProgressText) uploadProgressText.textContent = 'A enviar para o bucket policloud...';

    if (isConfigPlaceholder()) {
      // Simulação no ambiente Demo
      await new Promise(r => setTimeout(r, 600));

      const newFileRecord = {
        id: `file-${Date.now()}`,
        name: rawFileName,
        storage_path: storagePath,
        file_url: storagePath,
        size: selectedUploadFile.size,
        mime_type: selectedUploadFile.type,
        disciplina: disciplina,
        curso: targetCurso,
        classe: targetClasse,
        turma: targetTurma === 'todas' ? null : targetTurma,
        version: nextVersion,
        uploader_id: currentUser.id,
        uploader_name: currentProfile.nome || 'Utilizador',
        created_at: new Date().toISOString()
      };

      saveLocalDemoFile(newFileRecord);
    } else {
      // 2. Upload Real para o Bucket "policloud" no Supabase Storage
      const { error: uploadError } = await sb.storage
        .from('policloud')
        .upload(storagePath, selectedUploadFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erro no Supabase Storage: ${uploadError.message}`);
      }

      if (uploadProgressBar) uploadProgressBar.style.width = '85%';
      if (uploadProgressPercent) uploadProgressPercent.textContent = '85%';
      if (uploadProgressText) uploadProgressText.textContent = 'A registar metadados na base de dados...';

      // 3. Registo na Tabela 'files'
      const { data: insertedFile, error: dbError } = await sb
        .from('files')
        .insert({
          name: rawFileName,
          file_url: storagePath,
          storage_path: storagePath,
          size: selectedUploadFile.size,
          mime_type: selectedUploadFile.type || 'application/octet-stream',
          disciplina: disciplina,
          curso: targetCurso,
          classe: targetClasse,
          turma: targetTurma === 'todas' ? null : targetTurma,
          version: nextVersion,
          uploader_id: currentProfile.id || currentUser.id,
          uploader_name: currentProfile.nome || 'Docente / Utilizador',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao registar metadados: ${dbError.message}`);
      }

      await log('upload_ficheiro', 'files', insertedFile?.id, currentProfile?.nome || '');
    }

    // 100% Sucesso
    if (uploadProgressBar) uploadProgressBar.style.width = '100%';
    if (uploadProgressPercent) uploadProgressPercent.textContent = '100%';
    if (uploadProgressText) uploadProgressText.textContent = 'Ficheiro carregado com sucesso!';

    const successMsg = nextVersion > 1
      ? `Ficheiro carregado com sucesso como nova versão (v${nextVersion})!`
      : 'Ficheiro carregado com sucesso para a Cloud!';

    toast(successMsg, 'success');
    showUploadAlert(successMsg, 'success');

    await fetchAllFiles();
    renderFilteredFiles();

    setTimeout(() => {
      closeUploadModal();
    }, 1000);

  } catch (err) {
    console.error('Erro no upload de ficheiro:', err);
    showUploadAlert(err.message || 'Ocorreu um erro ao submeter o ficheiro.');
    if (uploadProgressBox) uploadProgressBox.style.display = 'none';
  } finally {
    btnSubmitUpload.disabled = false;
  }
}

// ==========================================
// Inicialização da Página Cloud
// ==========================================
async function initCloudPage() {
  initSidebar();
  mouseTrack();

  // ACESSO: todos os perfis autenticados. Verifica sessão; sem sessão, redirecciona para login.html.
  const profile = await requireAuth(['aluno', 'professor', 'admin']);
  if (!profile) return;

  currentProfile = profile;
  currentUser = profile;

  // 1. Configura a Sidebar
  setupSidebarByRole(currentProfile.role, currentProfile.nome);
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }
  setupDemoRoleSwitcher(currentProfile.role);

  // População dinâmica dos selects com constantes do sb.js
  if (filterClasse) {
    filterClasse.innerHTML = `
      <option value="todas">Todas as Classes</option>
      ${CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('')}
    `;
  }
  if (uploadClasse) {
    uploadClasse.innerHTML = `
      ${CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('')}
      <option value="Geral">Todas as Classes</option>
    `;
  }
  if (uploadCurso) {
    uploadCurso.innerHTML = `
      ${CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
      <option value="Geral">Tronco Comum (Todos)</option>
    `;
  }

  // 3. Regras de Visibilidade e Filtros Iniciais por Perfil:
  if (currentProfile.role === 'aluno') {
    const studentCurso = currentProfile.curso || 'Informática';
    const studentTurma = currentProfile.turma || 'INF-12A';

    // Aluno: só vê e descarrega ficheiros do seu próprio curso/turma
    if (filterCurso) {
      filterCurso.innerHTML = `
        <option value="${escapeHtml(studentCurso)}" selected>Curso: ${escapeHtml(studentCurso)}</option>
      `;
      filterCurso.disabled = true;
    }

    if (filterTurma) {
      filterTurma.innerHTML = `
        <option value="todas">Geral (${escapeHtml(studentCurso)})</option>
        <option value="${escapeHtml(studentTurma)}" selected>A sua Turma (${escapeHtml(studentTurma)})</option>
      `;
      filterTurma.value = studentTurma;
    }
  } else {
    // Professor / Admin: têm selector amplo e livre com base nas constantes
    if (filterCurso) {
      filterCurso.disabled = false;
      filterCurso.innerHTML = `
        <option value="todos">Todos os Cursos</option>
        ${CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
      `;
    }
    if (filterTurma) {
      filterTurma.disabled = false;
      const generatedTurmas = [];
      CLASSES.forEach(c => {
        TURMAS.forEach(t => {
          generatedTurmas.push(`${c.replace('ª', '')}-${t}`);
        });
      });
      filterTurma.innerHTML = `
        <option value="todas">Todas as Turmas</option>
        ${generatedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('')}
      `;
    }

    if (uploadTurma) {
      const generatedTurmas = [];
      CLASSES.forEach(c => {
        TURMAS.forEach(t => {
          generatedTurmas.push(`${c.replace('ª', '')}-${t}`);
        });
      });
      uploadTurma.innerHTML = `
        ${generatedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('')}
        <option value="todas">Geral (Todo o Curso)</option>
      `;
    }

    // Se vier do dashboard do professor com parâmetro ?turma=...
    const urlParams = new URLSearchParams(window.location.search);
    const paramTurma = urlParams.get('turma');
    if (paramTurma && filterTurma) {
      filterTurma.value = paramTurma;
    }
  }

  // 4. Listeners para os Filtros
  [filterCurso, filterClasse, filterTurma, filterDisciplina].forEach(sel => {
    if (sel) {
      sel.addEventListener('change', renderFilteredFiles);
    }
  });

  if (filterSearch) {
    filterSearch.addEventListener('input', renderFilteredFiles);
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (filterClasse) filterClasse.value = 'todas';
      if (filterDisciplina) filterDisciplina.value = 'todas';
      if (filterSearch) filterSearch.value = '';

      if (currentProfile.role !== 'aluno') {
        if (filterCurso) filterCurso.value = 'todos';
        if (filterTurma) filterTurma.value = 'todas';
      }
      renderFilteredFiles();
    });
  }

  // 5. Configurar Modal de Upload
  if (btnOpenUpload) btnOpenUpload.addEventListener('click', openUploadModal);
  if (btnCloseUploadModal) btnCloseUploadModal.addEventListener('click', closeUploadModal);
  if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeUploadModal);

  // Dropzone Drag & Drop
  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', () => fileInput.click());

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.classList.remove('dragover');
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  if (btnRemoveSelectedFile) {
    btnRemoveSelectedFile.addEventListener('click', clearSelectedFile);
  }

  if (uploadFileForm) {
    uploadFileForm.addEventListener('submit', handleUploadSubmit);
  }

  // Fechar modal ao clicar fora ou com ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUploadModal();
  });

  if (uploadFileModal) {
    uploadFileModal.addEventListener('click', (e) => {
      if (e.target === uploadFileModal) closeUploadModal();
    });
  }

  // 6. Carregar Ficheiros Iniciais
  await fetchAllFiles();
  renderFilteredFiles();

  // Ocultar Overlay de Sessão
  if (sessionOverlay) {
    sessionOverlay.classList.add('fade-out');
    setTimeout(() => {
      sessionOverlay.style.display = 'none';
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', initCloudPage);
import { sb, getProfile, requireAuth, signOut, log, toast, confirmModal, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS, DISCIPLINAS, getDisciplinasDB } from './sb.js';
import { turmaHasNewActivity } from './messages-service.js';
import './theme.js';

let dynamicDisciplinas = [];

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

// Navegação de Pastas & Breadcrumbs
const cloudBreadcrumbs = document.getElementById('cloud-breadcrumbs');
const btnCrumbRoot = document.getElementById('btn-crumb-root');
const cloudCurrentPathLabel = document.getElementById('cloud-current-path-label');
const cloudFoldersSection = document.getElementById('cloud-folders-section');
const foldersSectionTitle = document.getElementById('folders-section-title');
const foldersCountText = document.getElementById('folders-count-text');
const cloudFoldersGrid = document.getElementById('cloud-folders-grid');
const filesSectionTitle = document.getElementById('files-section-title');

// Filtros e Ordenação
const filterCurso = document.getElementById('filter-curso');
const filterCursoWrap = document.getElementById('filter-curso-wrap');
const filterClasse = document.getElementById('filter-classe');
const filterTurma = document.getElementById('filter-turma');
const filterTurmaWrap = document.getElementById('filter-turma-wrap');
const filterDisciplina = document.getElementById('filter-disciplina');
const filterSearch = document.getElementById('filter-search');
const filterSort = document.getElementById('filter-sort');
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

// Estado de Navegação por Pastas
let currentFolderState = {
  level: 'root', // 'root' (ver disciplinas ou classes), 'turma' (se professor escolheu classe), 'disciplina'
  classe: null,
  turma: null,
  disciplina: null
};

// ==========================================
// Dados de Demonstração (com Histórico de Versões)
// ==========================================
const DEFAULT_DEMO_FILES = [
  // Ficheiro com versão histórica v1 e v2
  {
    id: 'demo-f-1a',
    name: 'Guiao_Laboratorio_VLANs_Roteamento.pdf',
    storage_path: 'materiais/A/Guiao_Laboratorio_VLANs_Roteamento_v1.pdf',
    file_url: 'materiais/A/Guiao_Laboratorio_VLANs_Roteamento_v1.pdf',
    size: 1845000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'A',
    version: 1,
    uploader_name: 'Prof. Manuel Gonçalves',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-f-1b',
    name: 'Guiao_Laboratorio_VLANs_Roteamento.pdf',
    storage_path: 'materiais/A/Guiao_Laboratorio_VLANs_Roteamento_v2.pdf',
    file_url: 'materiais/A/Guiao_Laboratorio_VLANs_Roteamento_v2.pdf',
    size: 2150000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'A',
    version: 2,
    uploader_name: 'Prof. Manuel Gonçalves',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  // Sebenta de Sistemas Digitais
  {
    id: 'demo-f-2',
    name: 'Sebenta_Arquitectura_Microcontroladores.docx',
    storage_path: 'materiais/A/Sebenta_Arquitectura_Microcontroladores_v1.docx',
    file_url: 'materiais/A/Sebenta_Arquitectura_Microcontroladores_v1.docx',
    size: 3420000,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    disciplina: 'Sistemas Digitais',
    curso: 'Informática',
    classe: '12ª',
    turma: 'A',
    version: 1,
    uploader_name: 'Prof. Maria Esperança',
    uploader_role: 'professor',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  // Trabalho Prático entregue por um aluno
  {
    id: 'demo-f-3',
    name: 'Relatorio_Configuracao_Servidor_DNS.pdf',
    storage_path: 'materiais/A/Relatorio_Configuracao_Servidor_DNS_v1.pdf',
    file_url: 'materiais/A/Relatorio_Configuracao_Servidor_DNS_v1.pdf',
    size: 950000,
    mime_type: 'application/pdf',
    disciplina: 'Redes de Computadores',
    curso: 'Informática',
    classe: '12ª',
    turma: 'A',
    version: 1,
    uploader_name: 'Pedro Muindi (Aluno)',
    uploader_role: 'aluno',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  // Esquema Eléctrico para curso de Electricidade
  {
    id: 'demo-f-4',
    name: 'Esquema_Unifilar_Subestacao_Namibe.png',
    storage_path: 'materiais/B/Esquema_Unifilar_Subestacao_Namibe_v1.png',
    file_url: 'materiais/B/Esquema_Unifilar_Subestacao_Namibe_v1.png',
    size: 4200000,
    mime_type: 'image/png',
    disciplina: 'Máquinas Eléctricas',
    curso: 'Electricidade',
    classe: '11ª',
    turma: 'B',
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
 * Gestão de Notificações / Badges "Novo" das Pastas
 */
function getSeenFolders() {
  try {
    const s = localStorage.getItem('policloud_seen_folders');
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}

function markFolderAsSeen(folderKey) {
  try {
    const seen = getSeenFolders();
    if (!seen.includes(folderKey)) {
      seen.push(folderKey);
      localStorage.setItem('policloud_seen_folders', JSON.stringify(seen));
    }
  } catch (e) {}
}

function isFolderSeen(folderKey) {
  return getSeenFolders().includes(folderKey);
}

/**
 * Normaliza e compara nomes de cursos ignorando maiúsculas e acentos
 */
export function matchesCourseName(c1, c2) {
  if (!c1 || !c2) return false;
  const s1 = c1.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const s2 = c2.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s1 === s2) return true;
  if ((s1 === 'electronica' || s1 === 'electricidade') && (s2 === 'electronica' || s2 === 'electricidade')) return true;
  return false;
}

/**
 * Retorna lista filtrada e desduplicada de disciplinas para um determinado curso e classe
 */
export function getDisciplinasForContext({ course = null, classe = null } = {}) {
  const norm = s => (s || '').toString().toLowerCase().trim();
  const clNorm = classe && classe !== 'todas' ? norm(classe) : null;

  const source = (dynamicDisciplinas && dynamicDisciplinas.length > 0)
    ? dynamicDisciplinas
    : DISCIPLINAS.map(d => ({ nome: d, curso: 'Geral', classe: 'Todas' }));

  const filtered = source.filter(d => {
    const dNome = typeof d === 'string' ? d : d.nome;
    if (!dNome) return false;

    if (typeof d === 'object') {
      const dCursoNorm = norm(d.curso);
      const isGeneral = !d.curso || dCursoNorm === 'geral' || dCursoNorm === 'todos' || dCursoNorm === 'tronco comum';

      if (course && course !== 'todos') {
        const matches = isGeneral || matchesCourseName(d.curso, course);
        if (!matches) return false;
      }

      if (clNorm && d.classe) {
        const dClasseNorm = norm(d.classe);
        const matchesClasse = dClasseNorm === clNorm || dClasseNorm === 'todas' || dClasseNorm === 'geral';
        if (!matchesClasse) return false;
      }
    }

    return true;
  });

  const uniqueNames = [];
  const seen = new Set();
  filtered.forEach(d => {
    const name = typeof d === 'string' ? d.trim() : (d.nome || '').trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      uniqueNames.push(name);
    }
  });

  return uniqueNames.sort((a, b) => a.localeCompare(b, 'pt'));
}

/**
 * Renderiza o Sistema de Pastas (UI/UX Inspirado em Kintsugi e Synapse)
 */
function renderFolderSystem(files) {
  if (!cloudFoldersGrid) return;

  const isTeacher = currentProfile && (currentProfile.role === 'professor' || currentProfile.role === 'teacher');
  const isAdmin = currentProfile && currentProfile.role === 'admin';

  // 1. Atualizar Breadcrumbs
  updateBreadcrumbsUI();

  const cloudMainHeader = document.getElementById('cloud-main-header');
  const cloudFiltersPanel = document.getElementById('cloud-filters-panel');
  const foldersTitleWrap = document.getElementById('folders-section-title-wrap');

  // CASO ESPECIAL: Utilizador ESTÁ DENTRO DE UMA PASTA DE DISCIPLINA (Foco Exclusivo)
  if (currentFolderState.disciplina) {
    // Oculta o cabeçalho superior redundante e a barra de filtros
    if (cloudMainHeader) cloudMainHeader.style.display = 'none';
    if (cloudFiltersPanel) cloudFiltersPanel.style.display = 'none';
    if (foldersTitleWrap) foldersTitleWrap.style.display = 'none';

    const disc = currentFolderState.disciplina;
    const discFiles = files.filter(f => f.disciplina === disc);
    const totalSize = discFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);

    const contextParts = [];
    if (currentFolderState.classe) contextParts.push(`${currentFolderState.classe} Classe`);
    if (currentFolderState.turma) contextParts.push(`Turma ${currentFolderState.turma}`);
    if (currentProfile?.curso && currentProfile.role === 'aluno') contextParts.push(currentProfile.curso);
    const contextLabel = contextParts.join(' • ') || 'Geral IPPLN';

    cloudFoldersGrid.innerHTML = `
      <div class="cloud-active-folder-banner" style="grid-column: 1 / -1;">
        <div class="cloud-active-folder-left">
          <div class="cloud-folder-icon-wrap" style="width: 58px; height: 58px; background: linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(96,165,250,0.28) 100%); color: var(--color-accent);">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
          </div>
          <div class="cloud-active-folder-info">
            <div class="cloud-active-folder-badge">Pasta em Foco</div>
            <h2 class="cloud-active-folder-title">${escapeHtml(disc)}</h2>
            <div class="cloud-active-folder-meta">
              <span><strong>${discFiles.length}</strong> ${discFiles.length === 1 ? 'ficheiro' : 'ficheiros'}</span>
              <span> • ${formatFileSize(totalSize)}</span>
              <span> • ${escapeHtml(contextLabel)}</span>
            </div>
          </div>
        </div>
        <div class="cloud-active-folder-actions">
          <button type="button" class="btn-folder-back" id="btn-back-folders">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Voltar às Pastas</span>
          </button>
          <button type="button" class="btn-folder-upload" id="btn-folder-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Carregar para esta Pasta</span>
          </button>
        </div>
      </div>
    `;

    const btnBack = document.getElementById('btn-back-folders');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        currentFolderState.disciplina = null;
        if (filterDisciplina) filterDisciplina.value = 'todas';
        renderFilteredFiles();
      });
    }

    const btnUpload = document.getElementById('btn-folder-upload');
    if (btnUpload) {
      btnUpload.addEventListener('click', () => {
        openUploadModal();
      });
    }

    return;
  }

  // Quando na visão geral (todas as pastas), reexibe o cabeçalho, filtros e títulos
  if (cloudMainHeader) cloudMainHeader.style.display = '';
  if (cloudFiltersPanel) cloudFiltersPanel.style.display = '';
  if (foldersTitleWrap) foldersTitleWrap.style.display = '';

  // Caso 1: Nível Raiz para Professor ou Admin (Exibir Classes)
  if ((isTeacher || isAdmin) && currentFolderState.level === 'root') {
    if (foldersSectionTitle) {
      foldersSectionTitle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        <span>Classes Académicas</span>
      `;
    }

    const availableClasses = (isTeacher && currentProfile.classes && currentProfile.classes.length > 0)
      ? currentProfile.classes
      : CLASSES;

    if (foldersCountText) {
      foldersCountText.textContent = `${availableClasses.length} ${availableClasses.length === 1 ? 'classe' : 'classes'}`;
    }

    cloudFoldersGrid.innerHTML = availableClasses.map(classe => {
      const classFiles = files.filter(f => f.classe === classe || (!f.classe && classe === '12ª'));
      const totalSize = classFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
      const hasRecent = classFiles.some(f => (Date.now() - new Date(f.created_at).getTime()) < 48 * 3600 * 1000);
      const folderKey = `classe:${classe}`;
      const showNewBadge = hasRecent && !isFolderSeen(folderKey);

      return `
        <div class="cloud-folder-card" data-folder-action="enter-classe" data-folder-target="${escapeHtml(classe)}">
          ${showNewBadge ? `<span class="cloud-folder-badge-new">Novo</span>` : ''}
          <div class="cloud-folder-top">
            <div class="cloud-folder-icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-1.5V6.75A2.75 2.75 0 0 0 15.25 4H8.75A2.75 2.75 0 0 0 6 6.75V10.5H4.5A3 3 0 0 0 1.5 13.5V18a3 3 0 0 0 3 3h15Z" opacity="0.4"/>
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
          </div>
          <div>
            <h3 class="cloud-folder-title">${escapeHtml(classe)} Classe</h3>
            <span class="cloud-folder-subtext">Turmas e disciplinas correspondentes</span>
          </div>
          <div class="cloud-folder-meta">
            <span class="cloud-folder-count">${classFiles.length} ${classFiles.length === 1 ? 'ficheiro' : 'ficheiros'}</span>
            <span>${formatFileSize(totalSize)}</span>
          </div>
        </div>
      `;
    }).join('');

    attachFolderClickEvents();
    return;
  }

  // Caso 2: Professor ou Admin dentro de uma Classe (Exibir Turmas)
  if ((isTeacher || isAdmin) && currentFolderState.level === 'turma') {
    if (foldersSectionTitle) {
      foldersSectionTitle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
        </svg>
        <span>Turmas da ${escapeHtml(currentFolderState.classe)} Classe</span>
      `;
    }

    const availableTurmas = (isTeacher && currentProfile.turmas && currentProfile.turmas.length > 0)
      ? currentProfile.turmas
      : TURMAS;

    if (foldersCountText) {
      foldersCountText.textContent = `${availableTurmas.length} ${availableTurmas.length === 1 ? 'turma' : 'turmas'}`;
    }

    cloudFoldersGrid.innerHTML = availableTurmas.map(turma => {
      const turmaFiles = files.filter(f => (f.turma === turma || f.turma === `INF-${currentFolderState.classe.replace('ª','')}${turma}`) && (f.classe === currentFolderState.classe || !f.classe));
      const totalSize = turmaFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
      const hasRecent = turmaFiles.some(f => (Date.now() - new Date(f.created_at).getTime()) < 48 * 3600 * 1000) || turmaHasNewActivity(turma);
      const folderKey = `turma:${turma}`;
      const showNewBadge = hasRecent && !isFolderSeen(folderKey);

      return `
        <div class="cloud-folder-card" data-folder-action="enter-turma" data-folder-target="${escapeHtml(turma)}">
          ${showNewBadge ? `<span class="cloud-folder-badge-new">Novo</span>` : ''}
          <div class="cloud-folder-top">
            <div class="cloud-folder-icon-wrap" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.22) 100%); color: #10B981;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
          </div>
          <div>
            <h3 class="cloud-folder-title">Turma ${escapeHtml(turma)}</h3>
            <span class="cloud-folder-subtext">${escapeHtml(currentFolderState.classe)} Classe • Disciplinas</span>
          </div>
          <div class="cloud-folder-meta">
            <span class="cloud-folder-count">${turmaFiles.length} ${turmaFiles.length === 1 ? 'ficheiro' : 'ficheiros'}</span>
            <span>${formatFileSize(totalSize)}</span>
          </div>
        </div>
      `;
    }).join('');

    attachFolderClickEvents();
    return;
  }

  // Caso 3: Nível de Disciplinas (Para Aluno ou quando Professor/Admin selecionou a turma)
  const isAluno = currentProfile && (currentProfile.role === 'aluno' || currentProfile.role === 'student');

  let activeTargetCourse = null;
  if (isAluno) {
    activeTargetCourse = currentProfile.curso || 'Informática';
  } else if (filterCurso && filterCurso.value !== 'todos') {
    activeTargetCourse = filterCurso.value;
  } else if (isTeacher) {
    activeTargetCourse = currentProfile.curso || (Array.isArray(currentProfile.cursos) && currentProfile.cursos[0]) || null;
  }

  const activeTargetClasse = currentFolderState.classe || (filterClasse && filterClasse.value !== 'todas' ? filterClasse.value : null);

  let availableDisciplinas = [];
  if (isTeacher && Array.isArray(currentProfile.disciplinas) && currentProfile.disciplinas.length > 0 && (!filterCurso || filterCurso.value === 'todos')) {
    availableDisciplinas = [...new Set(currentProfile.disciplinas)];
  } else {
    availableDisciplinas = getDisciplinasForContext({ course: activeTargetCourse, classe: activeTargetClasse });
  }

  if (foldersSectionTitle) {
    const courseBadge = activeTargetCourse ? ` • ${activeTargetCourse}` : '';
    foldersSectionTitle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
      </svg>
      <span>Pastas de Disciplinas${escapeHtml(courseBadge)}</span>
    `;
  }

  if (foldersCountText) {
    foldersCountText.textContent = `${availableDisciplinas.length} ${availableDisciplinas.length === 1 ? 'disciplina' : 'disciplinas'}`;
  }

  if (availableDisciplinas.length === 0) {
    cloudFoldersGrid.innerHTML = `
      <div class="state-empty" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
        <span style="font-size: 14px; color: var(--color-text-secondary);">Nenhuma pasta de disciplina encontrada para este curso.</span>
      </div>
    `;
    return;
  }

  cloudFoldersGrid.innerHTML = availableDisciplinas.map(disc => {
    const discFiles = files.filter(f => {
      if (f.disciplina !== disc) return false;
      if (isAluno) {
        const studentCurso = currentProfile.curso || 'Informática';
        const studentClasse = currentProfile.classe || '10ª';
        const studentTurma = currentProfile.turma || 'A';
        if (f.curso && f.curso !== 'Geral' && f.curso !== 'todos' && !matchesCourseName(f.curso, studentCurso)) return false;
        if (f.classe && f.classe !== 'Geral' && f.classe !== 'todas' && f.classe !== studentClasse) return false;
        if (f.turma && f.turma !== 'Geral' && f.turma !== 'todas' && f.turma !== studentTurma) return false;
      }
      return true;
    });

    const totalSize = discFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
    const hasRecent = discFiles.some(f => (Date.now() - new Date(f.created_at).getTime()) < 48 * 3600 * 1000);
    const folderKey = `disc:${disc}`;
    const showNewBadge = hasRecent && !isFolderSeen(folderKey);

    return `
      <div class="cloud-folder-card" data-folder-action="open-disciplina" data-folder-target="${escapeHtml(disc)}">
        ${showNewBadge ? `<span class="cloud-folder-badge-new">Novo</span>` : ''}
        <div class="cloud-folder-top">
          <div class="cloud-folder-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
            </svg>
          </div>
        </div>
        <div>
          <h3 class="cloud-folder-title">${escapeHtml(disc)}</h3>
          <span class="cloud-folder-subtext">Toque para abrir pasta</span>
        </div>
        <div class="cloud-folder-meta">
          <span class="cloud-folder-count">${discFiles.length} ${discFiles.length === 1 ? 'ficheiro' : 'ficheiros'}</span>
          <span>${formatFileSize(totalSize)}</span>
        </div>
      </div>
    `;
  }).join('');

  attachFolderClickEvents();
}

/**
 * Atualiza o Breadcrumb superior
 */
function updateBreadcrumbsUI() {
  if (!cloudBreadcrumbs) return;

  const crumbs = [
    `<button type="button" class="breadcrumb-item breadcrumb-home" id="btn-crumb-root">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
      <span>Nuvem</span>
    </button>`
  ];

  if (currentFolderState.classe) {
    crumbs.push(`<span class="breadcrumb-sep">/</span>`);
    crumbs.push(`
      <button type="button" class="breadcrumb-item" id="btn-crumb-classe">
        <span>${escapeHtml(currentFolderState.classe)} Classe</span>
      </button>
    `);
  }

  if (currentFolderState.turma) {
    crumbs.push(`<span class="breadcrumb-sep">/</span>`);
    crumbs.push(`
      <button type="button" class="breadcrumb-item" id="btn-crumb-turma">
        <span>Turma ${escapeHtml(currentFolderState.turma)}</span>
      </button>
    `);
  }

  if (currentFolderState.disciplina) {
    crumbs.push(`<span class="breadcrumb-sep">/</span>`);
    crumbs.push(`
      <span class="breadcrumb-item is-current">
        <span>${escapeHtml(currentFolderState.disciplina)}</span>
      </span>
    `);
  }

  cloudBreadcrumbs.innerHTML = crumbs.join('');

  // Atualiza label do modo
  if (cloudCurrentPathLabel) {
    if (currentFolderState.disciplina) {
      cloudCurrentPathLabel.textContent = currentFolderState.disciplina;
    } else if (currentFolderState.turma) {
      cloudCurrentPathLabel.textContent = `Turma ${currentFolderState.turma}`;
    } else if (currentFolderState.classe) {
      cloudCurrentPathLabel.textContent = `${currentFolderState.classe} Classe`;
    } else {
      const isAluno = currentProfile && (currentProfile.role === 'aluno' || currentProfile.role === 'student');
      cloudCurrentPathLabel.textContent = isAluno && currentProfile.curso
        ? `Disciplinas • ${currentProfile.curso}`
        : 'Todas as Pastas';
    }
  }

  // Listener para o Root
  const rootBtn = document.getElementById('btn-crumb-root');
  if (rootBtn) {
    rootBtn.addEventListener('click', () => {
      currentFolderState = { level: 'root', classe: null, turma: null, disciplina: null };
      if (filterDisciplina) filterDisciplina.value = 'todas';
      renderFilteredFiles();
    });
  }

  const classeBtn = document.getElementById('btn-crumb-classe');
  if (classeBtn) {
    classeBtn.addEventListener('click', () => {
      currentFolderState.level = 'turma';
      currentFolderState.turma = null;
      currentFolderState.disciplina = null;
      if (filterDisciplina) filterDisciplina.value = 'todas';
      renderFilteredFiles();
    });
  }

  const turmaBtn = document.getElementById('btn-crumb-turma');
  if (turmaBtn) {
    turmaBtn.addEventListener('click', () => {
      currentFolderState.level = 'disciplina';
      currentFolderState.disciplina = null;
      if (filterDisciplina) filterDisciplina.value = 'todas';
      renderFilteredFiles();
    });
  }
}

/**
 * Ativa cliques nos cartões de pastas (Abrir Diretório & Dismiss "Novo")
 */
function attachFolderClickEvents() {
  if (!cloudFoldersGrid) return;

  cloudFoldersGrid.querySelectorAll('[data-folder-action]').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.getAttribute('data-folder-action');
      const target = card.getAttribute('data-folder-target');

      if (action === 'enter-classe') {
        markFolderAsSeen(`classe:${target}`);
        currentFolderState.level = 'turma';
        currentFolderState.classe = target;
        currentFolderState.turma = null;
        currentFolderState.disciplina = null;
        if (filterClasse) filterClasse.value = target;
        renderFilteredFiles();
      } else if (action === 'enter-turma') {
        markFolderAsSeen(`turma:${target}`);
        currentFolderState.level = 'disciplina';
        currentFolderState.turma = target;
        currentFolderState.disciplina = null;
        if (filterTurma) filterTurma.value = target;
        renderFilteredFiles();
      } else if (action === 'open-disciplina' || action === 'select-disciplina') {
        markFolderAsSeen(`disc:${target}`);
        currentFolderState.disciplina = target;
        if (filterDisciplina) filterDisciplina.value = target;
        renderFilteredFiles();
      }
    });
  });
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
    // 1. Regra de segurança do perfil Aluno
    const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';
    if (isAluno) {
      const studentCurso = currentProfile.curso || 'Informática';
      const studentClasse = currentProfile.classe || '10ª';
      const studentTurma = currentProfile.turma || 'A';

      if (file.curso && file.curso !== 'Geral' && file.curso !== 'todos' && !matchesCourseName(file.curso, studentCurso)) {
        return false;
      }
      if (file.classe && file.classe !== 'Geral' && file.classe !== 'todas' && file.classe !== studentClasse) {
        return false;
      }
      if (file.turma && file.turma !== 'Geral' && file.turma !== 'todas' && file.turma !== studentTurma) {
        return false;
      }

      // Regra NetAcad / Privacidade:
      // Se for upload de aluno com visibilidade 'professor', só o próprio autor do ficheiro pode ver!
      if (file.visibility === 'professor' && file.uploader_id && file.uploader_id !== (currentProfile.id || currentUser?.id)) {
        return false;
      }
    }

    // 2. Filtro de Curso
    if (selCurso !== 'todos') {
      if (file.curso && file.curso !== 'Geral' && !matchesCourseName(file.curso, selCurso)) return false;
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

  // Renderiza a grelha de pastas
  renderFolderSystem(allFilesData);

  // Agrupamento por versão
  const groupedList = groupFilesByVersion(filtered);

  // Ordenação selecionada
  const selSort = filterSort ? filterSort.value : 'recentes';
  if (selSort === 'nome-asc') {
    groupedList.sort((a, b) => (a.latest.name || '').localeCompare(b.latest.name || ''));
  } else if (selSort === 'nome-desc') {
    groupedList.sort((a, b) => (b.latest.name || '').localeCompare(a.latest.name || ''));
  } else if (selSort === 'tamanho-desc') {
    groupedList.sort((a, b) => (b.latest.size || 0) - (a.latest.size || 0));
  } else if (selSort === 'tamanho-asc') {
    groupedList.sort((a, b) => (a.latest.size || 0) - (b.latest.size || 0));
  } else {
    groupedList.sort((a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime());
  }

  // Actualiza contadores e indicadores
  if (totalFilesCount) {
    const totalFiles = filtered.length;
    totalFilesCount.textContent = `${totalFiles} ${totalFiles === 1 ? 'ficheiro encontrado' : 'ficheiros encontrados'}`;
  }

  if (activeFilterText) {
    const filtersUsed = [];
    if (currentFolderState.disciplina) filtersUsed.push(`Disciplina: ${currentFolderState.disciplina}`);
    if (selCurso !== 'todos') filtersUsed.push(`Curso: ${selCurso}`);
    if (selClasse !== 'todas') filtersUsed.push(`Classe: ${selClasse}`);
    if (selTurma !== 'todas') filtersUsed.push(`Turma: ${selTurma}`);
    if (searchTerm) filtersUsed.push(`"${searchTerm}"`);
    if (selSort && selSort !== 'recentes') {
      const sortMap = { 'nome-asc': 'Nome A–Z', 'nome-desc': 'Nome Z–A', 'tamanho-desc': 'Maior Tamanho', 'tamanho-asc': 'Menor Tamanho' };
      filtersUsed.push(`Ordem: ${sortMap[selSort] || selSort}`);
    }

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
           <div class="state-empty" style="padding: 60px 20px; background: var(--color-surface-base); border: 2px dashed var(--color-border-subtle); border-radius: 12px; margin-top: 20px; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <div style="background: rgba(37, 99, 235, 0.05); padding: 16px; border-radius: 50%; margin-bottom: 16px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5">
            <path d="M20 16V9a2 2 0 0 0-2-2H9L7 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
            <path d="M12 12v6"></path>
            <path d="M9 15h6"></path>
          </svg>
        </div>
        <strong style="font-size: 17px; color: var(--color-text-primary); margin-bottom: 8px;">Pasta Vazia</strong>
        <span style="color: var(--color-text-secondary); max-width: 320px; line-height: 1.5;">Não existem documentos nesta pasta com os critérios selecionados. Se fores docente, podes fazer o upload.</span>
      </div>
    `;
    return;
  }

  const htmlArr = groupedList.map(item => {
    const latest = item.latest;
    const safeName = latest.name || latest.nome || "Ficheiro sem nome";
    const safeTurma = latest.turma || 'Todas';
    const iconConfig = getFileIconType(latest.name, latest.tipo);
    const isAdmin = currentProfile?.role === 'admin';
    const isTeacher = (currentProfile?.role === 'professor' || currentProfile?.role === 'teacher');
    
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
              </div>
              <div class="cloud-file-meta-row">
                <span class="cloud-meta-discipline">${latest.disciplina || 'Geral'}</span>
                <span>Turma ${safeTurma}</span>
                <span>•</span>
                <span>${formatFileSize(latest.size)}</span>
                <span>•</span>
                <span>${formatDateDisplay(latest.created_at)}</span>
                <span>•</span>
                <span>Por: ${latest.uploader_name || 'Docente'}</span>
              </div>
            </div>
          </div>
          <div class="cloud-file-actions">
            ${(isAdmin || (isTeacher && latest.uploader_id === currentProfile?.id)) ? `
            <button type="button" class="btn-delete-file" data-file-id="${latest.id}" data-file-url="${latest.file_url}" data-file-name="${safeName}" style="background: transparent; color: var(--color-danger); border: 1px solid var(--color-danger); margin-right: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Apagar</span>
            </button>` : ''}
            <button type="button" class="btn-download-file" data-file-id="${latest.id}">
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
    `;
  });
  
  cloudFilesContainer.innerHTML = htmlArr.join('');


  // Eventos de Apagar Ficheiro
  cloudFilesContainer.querySelectorAll('.btn-delete-file').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileId = btn.getAttribute('data-file-id');
      const fileUrl = btn.getAttribute('data-file-url');
      const fileName = btn.getAttribute('data-file-name');
      handleFileDelete(fileId, fileUrl, fileName);
    });
  });

  // Eventos de Download
  cloudFilesContainer.querySelectorAll('.btn-download-file, .btn-version-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const fileId = btn.getAttribute('data-file-id');
      handleSecureDownload(fileId);
    });
  });

  // Acordeões de histórico
  cloudFilesContainer.querySelectorAll('.cloud-version-history-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('data-target-drawer'));
      if(target) target.style.display = target.style.display === 'none' ? 'flex' : 'none';
    });
  });
}

async function handleFileDelete(fileId, storagePath, fileName) {
  const confirmed = await confirmModal({
    title: 'Eliminar Ficheiro',
    message: `Tem a certeza absoluta de que deseja eliminar o ficheiro "${fileName}"?\nEsta ação removerá o ficheiro permanentemente e não pode ser desfeita.`,
    confirmText: 'Sim, Eliminar Ficheiro',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) return;
  try {
    toast('A apagar ficheiro...', 'info');
    if (storagePath) {
      await sb.storage.from('policloud').remove([storagePath]);
    }
    const { error: dbError } = await sb.from('files').delete().eq('id', fileId);
    if (dbError) throw dbError;
    toast('Ficheiro eliminado com sucesso.', 'success');
    await log('REMOCAO_FICHEIRO', 'Ficheiro removido: ' + fileName);
    await fetchAllFiles();
  } catch (err) {
    console.error(err);
    toast('Ocorreu um erro.', 'error');
  }
}

async function handleSecureDownload(fileId) {
  const targetFile = allFilesData.find(f => f.id === fileId);
  if (!targetFile) return;
  toast('A preparar download seguro...', 'info');
  try {
    const { data, error } = await sb.storage.from('policloud').createSignedUrl(targetFile.file_url, 60, {
      download: true
    });
    if (error) throw error;
    
    // Atualizar visualizações
    const currentViews = targetFile.views || 0;
    await sb.from('files').update({ views: currentViews + 1 }).eq('id', fileId);
    
    await log('download_ficheiro', 'files', fileId, currentProfile?.nome);
    
    window.location.href = data.signedUrl;
  } catch (err) {
    console.error(err);
    toast('Erro ao descarregar ficheiro.', 'error');
  }
}

// ==========================================
// UPLOAD DE FICHEIROS COM VALIDAÇÃO & VERSIONAMENTO
// ==========================================
function openUploadModal() {
  hideUploadAlert();
  resetUploadForm();

  const uploadFolderContextPill = document.getElementById('upload-folder-context-pill');
  const uploadContextName = document.getElementById('upload-context-name');
  const uploadContextSubtext = document.getElementById('upload-context-subtext');
  const uploadAcademicRow = document.getElementById('upload-academic-row');
  const discGroup = document.getElementById('upload-disciplina-group');

  const isInsideFolder = Boolean(currentFolderState.disciplina);

  if (isInsideFolder) {
    // Contexto automático: dentro de uma pasta não é preciso escolher disciplina/turma
    if (uploadFolderContextPill) {
      uploadFolderContextPill.style.display = 'flex';
      if (uploadContextName) uploadContextName.textContent = currentFolderState.disciplina;
      const subParts = [];
      if (currentFolderState.classe) subParts.push(`${currentFolderState.classe} Classe`);
      if (currentFolderState.turma) subParts.push(`Turma ${currentFolderState.turma}`);
      if (currentProfile?.curso && currentProfile.role === 'aluno') subParts.push(currentProfile.curso);
      if (uploadContextSubtext) {
        uploadContextSubtext.textContent = subParts.length > 0 ? `(${subParts.join(' • ')})` : '';
      }
    }

    if (uploadDisciplina) {
      // Garante que a opção existe no select (required)
      if (![...uploadDisciplina.options].some(o => o.value === currentFolderState.disciplina)) {
        const opt = document.createElement('option');
        opt.value = currentFolderState.disciplina;
        opt.textContent = currentFolderState.disciplina;
        uploadDisciplina.appendChild(opt);
      }
      uploadDisciplina.value = currentFolderState.disciplina;
    }

    if (discGroup) discGroup.style.display = 'none';
    if (uploadAcademicRow) uploadAcademicRow.style.display = 'none';
    if (uploadTurmaGroup) uploadTurmaGroup.style.display = 'none';
    if (studentUploadNote) studentUploadNote.style.display = 'none';
  } else {
    if (uploadFolderContextPill) uploadFolderContextPill.style.display = 'none';
    if (discGroup) discGroup.style.display = 'block';
    if (uploadAcademicRow) uploadAcademicRow.style.display = 'grid';
    if (uploadTurmaGroup) uploadTurmaGroup.style.display = 'block';

    if (currentProfile.role === 'aluno' || currentProfile.role === 'student') {
      const studentCurso = currentProfile.curso || 'Informática';
      if (uploadCurso) { uploadCurso.value = studentCurso; uploadCurso.disabled = true; }
      if (uploadClasse) { uploadClasse.value = currentProfile.classe || CLASSES[0]; uploadClasse.disabled = true; }
      if (uploadTurma) { uploadTurma.value = currentProfile.turma || TURMAS[0]; uploadTurma.disabled = true; }
      if (uploadDisciplina) {
        const studentDiscs = getDisciplinasForContext({ course: studentCurso, classe: currentProfile.classe || null });
        fillSelect(uploadDisciplina, studentDiscs, { value: '', label: 'Selecione a disciplina...' });
      }
      if (studentUploadNote) {
        studentUploadNote.style.display = 'block';
        if (studentTargetClassLabel) {
          studentTargetClassLabel.textContent = `${studentCurso} • Turma ${currentProfile.turma || ''}`;
        }
      }
    } else {
      if (uploadCurso) {
        uploadCurso.disabled = false;
        if (filterCurso && filterCurso.value !== 'todos') {
          uploadCurso.value = filterCurso.value;
        }
      }
      if (uploadClasse) {
        uploadClasse.disabled = false;
        if (currentFolderState.classe) uploadClasse.value = currentFolderState.classe;
      }
      if (uploadTurma) {
        uploadTurma.disabled = false;
        if (currentFolderState.turma) uploadTurma.value = currentFolderState.turma;
      }
      if (uploadDisciplina) {
        const activeUpCurso = uploadCurso?.value || (filterCurso && filterCurso.value !== 'todos' ? filterCurso.value : null);
        const upDiscs = getDisciplinasForContext({ course: activeUpCurso, classe: uploadClasse?.value });
        fillSelect(uploadDisciplina, upDiscs, { value: '', label: 'Selecione a disciplina...' });
      }
      if (studentUploadNote) studentUploadNote.style.display = 'none';
    }
  }

  openM('upload-file-modal');
}

function closeUploadModal() {
  closeM('upload-file-modal');
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
  if (fileInput) fileInput.value = '';
  if (filePreviewCard) filePreviewCard.style.display = 'none';
  if (fileDropzone) fileDropzone.style.display = 'flex';
  if (uploadProgressBox) uploadProgressBox.style.display = 'none';
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
  if (btnSubmitUpload) btnSubmitUpload.disabled = false;
}

/**
 * Validação prévia de formato e tamanho (máx 15MB)
 */
function handleFileSelection(file) {
  hideUploadAlert();
  if (!file) return;

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(mime)) {
    showUploadAlert('Formato de ficheiro não suportado. Apenas são aceites documentos PDF, Word (.doc, .docx) e imagens (.png, .jpg, .jpeg, .webp).');
    selectedUploadFile = null;
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    showUploadAlert(`O ficheiro seleccionado tem ${sizeMb} MB e excede o limite máximo permitido de 15 MB.`);
    selectedUploadFile = null;
    return;
  }

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

  const disciplina = currentFolderState.disciplina || (uploadDisciplina ? uploadDisciplina.value : '');
  if (!disciplina) {
    showUploadAlert('Por favor, selecione a disciplina.');
    return;
  }

  let targetCurso = uploadCurso?.value || 'Geral';
  let targetClasse = uploadClasse?.value || null;
  let targetTurma = uploadTurma?.value || null;

  if (currentFolderState.classe) targetClasse = currentFolderState.classe;
  if (currentFolderState.turma) targetTurma = currentFolderState.turma;

  // Aluno: força o contexto do próprio perfil (segurança contra manipulação da UI)
  if (currentProfile.role === 'aluno') {
    targetCurso = currentProfile.curso || targetCurso;
    targetClasse = currentProfile.classe || targetClasse;
    targetTurma = currentProfile.turma || targetTurma;
  }

  const visibility = 'geral';

  btnSubmitUpload.disabled = true;
  if (uploadProgressBox) uploadProgressBox.style.display = 'block';
  if (uploadProgressBar) uploadProgressBar.style.width = '20%';
  if (uploadProgressPercent) uploadProgressPercent.textContent = '20%';
  if (uploadProgressText) uploadProgressText.textContent = 'A preparar ficheiro...';

  try {
    const rawFileName = selectedUploadFile.name.trim();

    // Versionamento: mesmo nome + mesma turma => nova versão
    const existingVersions = allFilesData.filter(f =>
      (f.name || '').toLowerCase() === rawFileName.toLowerCase() &&
      (f.turma || null) === (targetTurma === 'todas' ? null : targetTurma)
    );
    let nextVersion = 1;
    if (existingVersions.length > 0) {
      nextVersion = Math.max(...existingVersions.map(f => f.version || 1)) + 1;
    }

    const sanitizedName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = (targetTurma || targetCurso || 'geral').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `materiais/${folder}/${Date.now()}_v${nextVersion}_${sanitizedName}`;

    if (uploadProgressBar) uploadProgressBar.style.width = '55%';
    if (uploadProgressPercent) uploadProgressPercent.textContent = '55%';
    if (uploadProgressText) uploadProgressText.textContent = 'A enviar para o bucket policloud...';

    const { error: uploadError } = await sb.storage
      .from('policloud')
      .upload(storagePath, selectedUploadFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      throw new Error(`Erro no Supabase Storage: ${uploadError.message}`);
    }

    if (uploadProgressBar) uploadProgressBar.style.width = '85%';
    if (uploadProgressPercent) uploadProgressPercent.textContent = '85%';
    if (uploadProgressText) uploadProgressText.textContent = 'A registar metadados na base de dados...';

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
        visibility: visibility,
        uploader_id: currentProfile.id,
        uploader_name: currentProfile.nome || 'Utilizador',
        uploader_role: currentProfile.role || 'aluno',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      // Evita ficheiros órfãos no Storage
      try { await sb.storage.from('policloud').remove([storagePath]); } catch (_) {}
      throw new Error(`Erro ao registar metadados: ${dbError.message}`);
    }

    try { await log('upload_ficheiro', 'files', insertedFile?.id, currentProfile?.nome || ''); } catch (_) {}

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

    setTimeout(() => closeUploadModal(), 1000);
  } catch (err) {
    console.error('Erro no upload de ficheiro:', err);
    showUploadAlert(err.message || 'Ocorreu um erro ao submeter o ficheiro.');
    if (uploadProgressBox) uploadProgressBox.style.display = 'none';
  } finally {
    btnSubmitUpload.disabled = false;
  }
}

// ==========================================
// População de Selects (Filtros & Upload)
// ==========================================
function fillSelect(selectEl, items, firstOption = null, labelFn = (v) => v) {
  if (!selectEl) return;
  const prev = selectEl.value;
  selectEl.innerHTML =
    (firstOption ? `<option value="${escapeHtml(firstOption.value)}">${escapeHtml(firstOption.label)}</option>` : '') +
    items.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(labelFn(v))}</option>`).join('');
  if (prev && [...selectEl.options].some(o => o.value === prev)) selectEl.value = prev;
}

function updateDisciplinasSelects() {
  const isAluno = currentProfile?.role === 'aluno' || currentProfile?.role === 'student';
  const isTeacher = currentProfile?.role === 'professor' || currentProfile?.role === 'teacher';

  let targetCourse = null;
  if (isAluno) {
    targetCourse = currentProfile.curso || 'Informática';
  } else if (filterCurso && filterCurso.value !== 'todos') {
    targetCourse = filterCurso.value;
  } else if (isTeacher) {
    targetCourse = currentProfile.curso || (Array.isArray(currentProfile.cursos) && currentProfile.cursos[0]) || null;
  }

  const targetClasse = filterClasse && filterClasse.value !== 'todas' ? filterClasse.value : null;

  let discNames = getDisciplinasForContext({ course: targetCourse, classe: targetClasse });
  if (isTeacher && Array.isArray(currentProfile.disciplinas) && currentProfile.disciplinas.length > 0 && (!filterCurso || filterCurso.value === 'todos')) {
    discNames = [...new Set(currentProfile.disciplinas)];
  }

  const prevFilter = filterDisciplina ? filterDisciplina.value : null;
  fillSelect(filterDisciplina, discNames, { value: 'todas', label: 'Todas as Disciplinas' });
  if (prevFilter && discNames.includes(prevFilter)) {
    filterDisciplina.value = prevFilter;
  }

  const uploadCourseTarget = isAluno 
    ? (currentProfile.curso || 'Informática') 
    : (uploadCurso?.value || targetCourse);
  const uploadDiscs = getDisciplinasForContext({ course: uploadCourseTarget, classe: uploadClasse?.value });
  fillSelect(uploadDisciplina, uploadDiscs, { value: '', label: 'Selecione a disciplina...' });
}

async function populateSelects() {
  // Disciplinas vindas da BD (com fallback para a lista estática)
  try {
    const discs = await getDisciplinasDB();
    dynamicDisciplinas = Array.isArray(discs) ? discs : [];
  } catch (_) {
    dynamicDisciplinas = [];
  }

  fillSelect(filterCurso, CURSOS, { value: 'todos', label: 'Todos os Cursos' });
  fillSelect(filterClasse, CLASSES, { value: 'todas', label: 'Todas as Classes' }, c => `${c} Classe`);
  fillSelect(filterTurma, TURMAS, { value: 'todas', label: 'Todas as Turmas' }, t => `Turma ${t}`);

  fillSelect(uploadCurso, [...CURSOS, 'Geral'], null, c => (c === 'Geral' ? 'Tronco Comum (Todos)' : c));
  fillSelect(uploadClasse, CLASSES, null, c => `${c} Classe`);
  fillSelect(uploadTurma, [...TURMAS, 'todas'], null, t => (t === 'todas' ? 'Todas as Turmas' : `Turma ${t}`));

  // Aluno: filtros de curso/turma fixos no seu contexto
  if (currentProfile.role === 'aluno' || currentProfile.role === 'student') {
    if (filterCursoWrap) filterCursoWrap.style.display = 'none';
    if (filterTurmaWrap) filterTurmaWrap.style.display = 'none';
    if (filterCurso) filterCurso.value = currentProfile.curso || 'Informática';
  }

  updateDisciplinasSelects();
}

function setupFilterListeners() {
  [filterCurso, filterClasse, filterTurma, filterDisciplina, filterSort].forEach(el => {
    if (el) el.addEventListener('change', () => {
      if (el === filterCurso || el === filterClasse) {
        updateDisciplinasSelects();
      }
      if (el === filterDisciplina) {
        currentFolderState.disciplina = filterDisciplina.value !== 'todas' ? filterDisciplina.value : null;
      }
      renderFilteredFiles();
    });
  });

  if (filterSearch) {
    let t = null;
    filterSearch.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(renderFilteredFiles, 180);
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (filterCurso) filterCurso.value = (currentProfile?.role === 'aluno' || currentProfile?.role === 'student') ? (currentProfile.curso || 'Informática') : 'todos';
      if (filterClasse) filterClasse.value = 'todas';
      if (filterTurma) filterTurma.value = 'todas';
      if (filterDisciplina) filterDisciplina.value = 'todas';
      if (filterSort) filterSort.value = 'recentes';
      if (filterSearch) filterSearch.value = '';
      currentFolderState = { level: 'root', classe: null, turma: null, disciplina: null };
      updateDisciplinasSelects();
      renderFilteredFiles();
    });
  }
}

function setupUploadListeners() {
  if (btnOpenUpload) btnOpenUpload.addEventListener('click', openUploadModal);
  if (btnCloseUploadModal) btnCloseUploadModal.addEventListener('click', closeUploadModal);
  if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeUploadModal);

  if (uploadCurso) {
    uploadCurso.addEventListener('change', () => {
      const selectedCurso = uploadCurso.value;
      const targetClasse = uploadClasse?.value || null;
      const discsForUpload = getDisciplinasForContext({ course: selectedCurso, classe: targetClasse });
      fillSelect(uploadDisciplina, discsForUpload, { value: '', label: 'Selecione a disciplina...' });
    });
  }

  if (uploadClasse) {
    uploadClasse.addEventListener('change', () => {
      const selectedCurso = uploadCurso?.value || null;
      const targetClasse = uploadClasse.value;
      const discsForUpload = getDisciplinasForContext({ course: selectedCurso, classe: targetClasse });
      fillSelect(uploadDisciplina, discsForUpload, { value: '', label: 'Selecione a disciplina...' });
    });
  }

  if (fileDropzone && fileInput) {
    fileDropzone.addEventListener('click', () => fileInput.click());
    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.classList.add('dragover');
    });
    fileDropzone.addEventListener('dragleave', () => fileDropzone.classList.remove('dragover'));
    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleFileSelection(e.target.files[0]);
    });
  }

  if (btnRemoveSelectedFile) btnRemoveSelectedFile.addEventListener('click', clearSelectedFile);
  if (uploadFileForm) uploadFileForm.addEventListener('submit', handleUploadSubmit);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUploadModal();
  });

  if (uploadFileModal) {
    uploadFileModal.addEventListener('click', (e) => {
      if (e.target === uploadFileModal) closeUploadModal();
    });
  }
}

// ==========================================
// Inicialização da Página Cloud
// ==========================================
async function initCloudApp() {
  try { initSidebar(); } catch (_) {}
  try { mouseTrack(); } catch (_) {}

  // requireAuth() (sb.js) normaliza role (student→aluno, teacher→professor) e nome (full_name→nome)
  const profile = await requireAuth(['aluno', 'professor', 'admin']);
  if (!profile) return;

  currentProfile = profile;
  currentUser = profile;

  setupSidebarByRole(currentProfile.role, currentProfile.nome);
  setupDemoRoleSwitcher(currentProfile.role);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => { e.preventDefault(); await signOut(); });

  setupUploadListeners();
  setupFilterListeners();

  try {
    await populateSelects();
  } catch (err) {
    console.error('Erro ao preencher filtros:', err);
  }

  try {
    await fetchAllFiles();
    renderFilteredFiles();
  } catch (err) {
    console.error('Erro ao renderizar a Cloud:', err);
    if (cloudFilesContainer) {
      cloudFilesContainer.innerHTML = `<div class="state-empty" style="padding: 40px 20px; text-align:center;">Não foi possível carregar os ficheiros. Tente novamente.</div>`;
    }
  } finally {
    if (sessionOverlay) sessionOverlay.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initCloudApp);


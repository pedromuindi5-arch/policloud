import { sb, getProfile, requireAuth, signOut, log, toast, confirmModal, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS, DISCIPLINAS, getDisciplinasDB, getCursosDB, cleanTurma, sameCourse, normStr } from './sb.js';
import { turmaHasNewActivity, getUserTurmaScopes } from './messages-service.js';
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
const DEFAULT_DEMO_FILES = [];

function getLocalDemoFiles() {
  return [];
}

function saveLocalDemoFile() {}

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

function setupDemoRoleSwitcher() {
  if (demoRoleSwitcher) demoRoleSwitcher.style.display = 'none';
}

// ==========================================
// Isolamento Estrito de Ficheiros por Perfil/Curso/Classe/Turma
// ==========================================
export function fileVisibleToUser(file, profile) {
  if (!file || !profile) return false;
  const role = profile.role;
  if (role === 'admin') return true;

  const fileCurso = file.curso || '';
  const fileClasse = file.classe || '';
  const fileTurma = cleanTurma(file.turma || '');

  if (role === 'aluno' || role === 'student') {
    const studentCurso = profile.curso || '';
    const studentClasse = profile.classe || '';
    const studentTurma = cleanTurma(profile.turma || '');

    if (!studentCurso || !fileCurso || !sameCourse(fileCurso, studentCurso)) return false;
    if (studentClasse && fileClasse && normStr(fileClasse) !== normStr(studentClasse)) return false;
    if (studentTurma && (!fileTurma || normStr(fileTurma) !== normStr(studentTurma))) return false;

    // Ficheiros enviados por outros alunos NUNCA são visíveis para colegas de turma (apenas para o próprio autor e professores)
    const isStudentUpload = file.uploader_role === 'aluno' || file.uploader_role === 'student' || file.visibility === 'professor';
    if (isStudentUpload && String(file.uploader_id || '') !== String(profile.id || '')) {
      return false;
    }

    return true;
  }

  if (role === 'professor' || role === 'teacher') {
    // O próprio professor vê sempre os ficheiros que ele enviou
    if (file.uploader_id && String(file.uploader_id) === String(profile.id)) return true;

    const scopes = getUserTurmaScopes(profile);
    if (!scopes || scopes.length === 0) return false;

    // Verifica se o ficheiro pertence a algum (curso, classe, turma) atribuído ao professor
    const matchesScope = scopes.some(s => {
      if (s.curso && (!fileCurso || !sameCourse(s.curso, fileCurso))) return false;
      if (s.classe && fileClasse && normStr(s.classe) !== normStr(fileClasse)) return false;
      if (s.turma && fileTurma && normStr(cleanTurma(s.turma)) !== normStr(fileTurma)) return false;
      return true;
    });

    return matchesScope;
  }

  return false;
}

// ==========================================
// Carregamento e Filtragem de Ficheiros
// ==========================================
async function fetchAllFiles() {
  try {
    const { data, error } = await sb
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const raw = data || [];
    allFilesData = raw.filter(f => fileVisibleToUser(f, currentProfile));
  } catch (err) {
    console.error('Erro ao consultar ficheiros:', err);
    allFilesData = [];
  }
}

/**
 * Agrupa ficheiros por nome e contexto (para identificar versões históricas v1, v2, v3)
 */
function groupFilesByVersion(files) {
  const groups = new Map();

  files.forEach(file => {
    const groupKey = `${(file.name || '').toLowerCase()}:::${file.curso || ''}:::${file.classe || ''}:::${cleanTurma(file.turma) || 'geral'}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(file);
  });

  const result = [];
  groups.forEach((fileList, key) => {
    fileList.sort((a, b) => (b.version || 1) - (a.version || 1));
    result.push({
      groupKey: key,
      latest: fileList[0],
      versions: fileList,
      totalVersions: fileList.length
    });
  });

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
  return sameCourse(c1, c2);
}

/**
 * Retorna lista filtrada e desduplicada de disciplinas para um determinado curso e classe
 */
export function getDisciplinasForContext({ course = null, classe = null, turma = null } = {}) {
  const clNorm = classe && classe !== 'todas' ? normStr(classe) : null;
  const tNorm = turma && turma !== 'todas' ? normStr(cleanTurma(turma)) : null;
  const isTeacher = currentProfile && (currentProfile.role === 'professor' || currentProfile.role === 'teacher');

  const source = Array.isArray(dynamicDisciplinas) ? dynamicDisciplinas : [];

  const filtered = source.filter(d => {
    const dNome = typeof d === 'string' ? d : d.nome;
    if (!dNome) return false;

    if (typeof d === 'object') {
      // Se um curso específico foi pedido, exige correspondência estrita de curso (não mistura disciplinas de outros cursos)
      if (course && course !== 'todos' && course !== 'Geral') {
        if (!d.curso || !sameCourse(d.curso, course)) return false;
      }

      if (clNorm && d.classe) {
        const dClasseNorm = normStr(d.classe);
        const matchesClasse = dClasseNorm === clNorm || dClasseNorm === 'todas' || dClasseNorm === 'geral';
        if (!matchesClasse) return false;
      }
    }

    // Se for professor, restringe às disciplinas/cursos que leciona
    if (isTeacher) {
      const teacherAttrs = Array.isArray(currentProfile.atribuicoes_curriculares) ? currentProfile.atribuicoes_curriculares : [];
      const teacherDiscs = Array.isArray(currentProfile.disciplinas) ? currentProfile.disciplinas : [];
      if (teacherAttrs.length > 0) {
        const matchesAttr = teacherAttrs.some(a => {
          if (a.disciplina && normStr(a.disciplina) !== normStr(dNome)) return false;
          if (course && course !== 'todos' && a.curso && !sameCourse(a.curso, course)) return false;
          if (clNorm && a.classe && normStr(a.classe) !== clNorm) return false;
          if (tNorm && a.turmas) {
            const tList = Array.isArray(a.turmas) ? a.turmas.map(cleanTurma) : String(a.turmas).split(',').map(cleanTurma);
            if (tList.length > 0 && !tList.some(t => normStr(t) === tNorm)) return false;
          }
          return true;
        });
        if (!matchesAttr && !teacherDiscs.some(td => normStr(td) === normStr(dNome))) return false;
      } else if (teacherDiscs.length > 0) {
        if (!teacherDiscs.some(td => normStr(td) === normStr(dNome))) return false;
      } else {
        return false;
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
 * Renderiza o Sistema de Pastas
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
    if (cloudMainHeader) cloudMainHeader.style.display = 'none';
    if (cloudFiltersPanel) cloudFiltersPanel.style.display = 'none';
    if (foldersTitleWrap) foldersTitleWrap.style.display = 'none';

    const disc = currentFolderState.disciplina;
    const discFiles = files.filter(f => normStr(f.disciplina) === normStr(disc));
    const totalSize = discFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);

    const contextParts = [];
    if (currentFolderState.classe) contextParts.push(`${currentFolderState.classe} Classe`);
    if (currentFolderState.turma) contextParts.push(`Turma ${cleanTurma(currentFolderState.turma)}`);
    if (currentProfile?.curso && currentProfile.role === 'aluno') contextParts.push(currentProfile.curso);
    else if (filterCurso && filterCurso.value !== 'todos') contextParts.push(filterCurso.value);
    const contextLabel = contextParts.join(' • ') || 'IPPLN';

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

    const availableClasses = isTeacher
      ? (Array.isArray(currentProfile.classes) && currentProfile.classes.length > 0 ? currentProfile.classes : [])
      : CLASSES;

    if (foldersCountText) {
      foldersCountText.textContent = `${availableClasses.length} ${availableClasses.length === 1 ? 'classe' : 'classes'}`;
    }

    if (availableClasses.length === 0) {
      cloudFoldersGrid.innerHTML = `
        <div class="state-empty" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
          <span style="font-size: 14px; color: var(--color-text-secondary);">Ainda não possui classes/disciplinas atribuídas ao seu perfil docente.</span>
        </div>
      `;
      return;
    }

    cloudFoldersGrid.innerHTML = availableClasses.map(classe => {
      const classFiles = files.filter(f => normStr(f.classe) === normStr(classe));
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

    let availableTurmas = TURMAS;
    if (isTeacher) {
      const scopes = getUserTurmaScopes(currentProfile).filter(s => !s.classe || normStr(s.classe) === normStr(currentFolderState.classe));
      const scopedTurmas = [...new Set(scopes.map(s => cleanTurma(s.turma)).filter(Boolean))];
      availableTurmas = scopedTurmas.length > 0
        ? scopedTurmas
        : (Array.isArray(currentProfile.turmas) ? [...new Set(currentProfile.turmas.map(cleanTurma).filter(Boolean))] : []);
    }

    if (foldersCountText) {
      foldersCountText.textContent = `${availableTurmas.length} ${availableTurmas.length === 1 ? 'turma' : 'turmas'}`;
    }

    cloudFoldersGrid.innerHTML = availableTurmas.map(turma => {
      const cleanT = cleanTurma(turma);
      const turmaFiles = files.filter(f => normStr(cleanTurma(f.turma)) === normStr(cleanT) && normStr(f.classe) === normStr(currentFolderState.classe));
      const totalSize = turmaFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
      const hasRecent = turmaFiles.some(f => (Date.now() - new Date(f.created_at).getTime()) < 48 * 3600 * 1000) || turmaHasNewActivity(cleanT);
      const folderKey = `turma:${cleanT}`;
      const showNewBadge = hasRecent && !isFolderSeen(folderKey);

      return `
        <div class="cloud-folder-card" data-folder-action="enter-turma" data-folder-target="${escapeHtml(cleanT)}">
          ${showNewBadge ? `<span class="cloud-folder-badge-new">Novo</span>` : ''}
          <div class="cloud-folder-top">
            <div class="cloud-folder-icon-wrap" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(52, 211, 153, 0.22) 100%); color: #10B981;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              </svg>
            </div>
          </div>
          <div>
            <h3 class="cloud-folder-title">Turma ${escapeHtml(cleanT)}</h3>
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
    activeTargetCourse = currentProfile.curso || '';
  } else if (filterCurso && filterCurso.value !== 'todos') {
    activeTargetCourse = filterCurso.value;
  } else if (isTeacher) {
    activeTargetCourse = currentProfile.curso || (Array.isArray(currentProfile.cursos) && currentProfile.cursos.length === 1 ? currentProfile.cursos[0] : null);
  }

  const activeTargetClasse = isAluno
    ? (currentProfile.classe || null)
    : (currentFolderState.classe || (filterClasse && filterClasse.value !== 'todas' ? filterClasse.value : null));

  const activeTargetTurma = isAluno
    ? cleanTurma(currentProfile.turma || null)
    : (currentFolderState.turma || (filterTurma && filterTurma.value !== 'todas' ? filterTurma.value : null));

  const availableDisciplinas = getDisciplinasForContext({
    course: activeTargetCourse,
    classe: activeTargetClasse,
    turma: activeTargetTurma
  });

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
        <span style="font-size: 14px; color: var(--color-text-secondary);">Nenhuma pasta de disciplina encontrada para este curso/turma.</span>
      </div>
    `;
    return;
  }

  cloudFoldersGrid.innerHTML = availableDisciplinas.map(disc => {
    const discFiles = files.filter(f => normStr(f.disciplina) === normStr(disc));

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

  // 1. Filtra pela visibilidade estrita de curso/classe/turma e privacidade de envios de aluno
  const baseVisible = allFilesData.filter(file => {
    if (!fileVisibleToUser(file, currentProfile)) return false;
    if (selCurso !== 'todos') {
      if (!file.curso || !sameCourse(file.curso, selCurso)) return false;
    }
    return true;
  });

  // 2. Aplica os restantes filtros de UI
  let filtered = baseVisible.filter(file => {
    if (selClasse !== 'todas') {
      if (!file.classe || normStr(file.classe) !== normStr(selClasse)) return false;
    }

    if (selTurma !== 'todas') {
      if (!file.turma || normStr(cleanTurma(file.turma)) !== normStr(cleanTurma(selTurma))) return false;
    }

    if (selDisciplina !== 'todas') {
      if (!file.disciplina || normStr(file.disciplina) !== normStr(selDisciplina)) return false;
    }

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

  // Renderiza a grelha de pastas apenas com ficheiros visíveis no curso/perfil atual
  renderFolderSystem(baseVisible);

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
        ? `A mostrar ficheiros do seu curso (${currentProfile.curso || ''}) • ${currentProfile.classe || ''} • Turma ${cleanTurma(currentProfile.turma || '')}`
        : 'A mostrar ficheiros das suas turmas';
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
        <span style="color: var(--color-text-secondary); max-width: 320px; line-height: 1.5;">Não existem documentos nesta pasta com os critérios selecionados.</span>
      </div>
    `;
    return;
  }

  const htmlArr = groupedList.map(item => {
    const latest = item.latest;
    const safeName = latest.name || latest.nome || "Ficheiro sem nome";
    const safeTurma = cleanTurma(latest.turma) || 'Todas';
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
                <span class="cloud-file-name" title="${escapeHtml(safeName)}">${escapeHtml(safeName)}</span>
                <span class="cloud-version-pill">v${latest.version || 1}</span>
              </div>
              <div class="cloud-file-meta-row">
                <span class="cloud-meta-discipline">${escapeHtml(latest.disciplina || 'Geral')}</span>
                <span>${escapeHtml(latest.curso || '')} • ${escapeHtml(latest.classe || '')} Turma ${escapeHtml(safeTurma)}</span>
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
            ${(isAdmin || (isTeacher && latest.uploader_id === currentProfile?.id) || (latest.uploader_id === currentProfile?.id)) ? `
            <button type="button" class="btn-delete-file" data-file-id="${latest.id}" data-file-url="${latest.file_url}" data-file-name="${escapeHtml(safeName)}" style="background: transparent; color: var(--color-danger); border: 1px solid var(--color-danger); margin-right: 8px;">
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
    renderFilteredFiles();
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
    
    const currentViews = targetFile.views || 0;
    await sb.from('files').update({ views: currentViews + 1 }).eq('id', fileId);
    
    await log('download_ficheiro', 'files', fileId, currentProfile?.nome);
    
    window.location.href = data.signedUrl;
  } catch (err) {
    console.error(err);
    toast('Erro ao descarregar ficheiro.', 'error');
  }
}

/**
 * Resolve o curso de uma disciplina para o utilizador atual
 */
function resolveCourseForDisciplina(discName) {
  if (currentProfile?.role === 'aluno' || currentProfile?.role === 'student') {
    return currentProfile.curso || '';
  }
  if (filterCurso && filterCurso.value && filterCurso.value !== 'todos') {
    return filterCurso.value;
  }
  if (discName && Array.isArray(dynamicDisciplinas)) {
    const matched = dynamicDisciplinas.find(d => normStr(d.nome) === normStr(discName) && d.curso && d.curso !== 'Geral');
    if (matched?.curso) return matched.curso;
  }
  if (Array.isArray(currentProfile?.cursos) && currentProfile.cursos.length > 0) {
    return currentProfile.cursos[0];
  }
  return currentProfile?.curso || uploadCurso?.value || CURSOS[0] || 'Informática';
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
  const isAluno = currentProfile?.role === 'aluno' || currentProfile?.role === 'student';

  if (isInsideFolder) {
    const resolvedCurso = resolveCourseForDisciplina(currentFolderState.disciplina);
    const resolvedClasse = isAluno ? (currentProfile.classe || '10ª') : (currentFolderState.classe || (filterClasse && filterClasse.value !== 'todas' ? filterClasse.value : (currentProfile?.classes?.[0] || '10ª')));
    const resolvedTurma = isAluno ? cleanTurma(currentProfile.turma || 'A') : cleanTurma(currentFolderState.turma || (filterTurma && filterTurma.value !== 'todas' ? filterTurma.value : (currentProfile?.turmas?.[0] || 'A')));

    if (uploadCurso && resolvedCurso) {
      if (![...uploadCurso.options].some(o => o.value === resolvedCurso)) {
        const opt = document.createElement('option');
        opt.value = resolvedCurso;
        opt.textContent = resolvedCurso;
        uploadCurso.appendChild(opt);
      }
      uploadCurso.value = resolvedCurso;
    }
    if (uploadClasse && resolvedClasse) uploadClasse.value = resolvedClasse;
    if (uploadTurma && resolvedTurma) uploadTurma.value = resolvedTurma;

    if (uploadFolderContextPill) {
      uploadFolderContextPill.style.display = 'flex';
      if (uploadContextName) uploadContextName.textContent = currentFolderState.disciplina;
      const subParts = [];
      if (resolvedCurso) subParts.push(resolvedCurso);
      if (resolvedClasse) subParts.push(`${resolvedClasse} Classe`);
      if (resolvedTurma) subParts.push(`Turma ${resolvedTurma}`);
      if (uploadContextSubtext) {
        uploadContextSubtext.textContent = subParts.length > 0 ? `(${subParts.join(' • ')})` : '';
      }
    }

    if (uploadDisciplina) {
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

    if (isAluno) {
      const studentCurso = currentProfile.curso || '';
      const studentClasse = currentProfile.classe || CLASSES[0];
      const studentTurma = cleanTurma(currentProfile.turma || TURMAS[0]);
      if (uploadCurso) {
        if (studentCurso && ![...uploadCurso.options].some(o => o.value === studentCurso)) {
          const opt = document.createElement('option');
          opt.value = studentCurso;
          opt.textContent = studentCurso;
          uploadCurso.appendChild(opt);
        }
        uploadCurso.value = studentCurso;
        uploadCurso.disabled = true;
      }
      if (uploadClasse) { uploadClasse.value = studentClasse; uploadClasse.disabled = true; }
      if (uploadTurma) { uploadTurma.value = studentTurma; uploadTurma.disabled = true; }
      if (uploadDisciplina) {
        const studentDiscs = getDisciplinasForContext({ course: studentCurso, classe: studentClasse, turma: studentTurma });
        fillSelect(uploadDisciplina, studentDiscs, { value: '', label: 'Selecione a disciplina...' });
      }
      if (studentUploadNote) {
        studentUploadNote.style.display = 'block';
        if (studentTargetClassLabel) {
          studentTargetClassLabel.textContent = `${studentCurso} • ${studentClasse} • Turma ${studentTurma}`;
        }
      }
    } else {
      if (uploadCurso) {
        uploadCurso.disabled = false;
        if (filterCurso && filterCurso.value !== 'todos') {
          uploadCurso.value = filterCurso.value;
        } else if (Array.isArray(currentProfile?.cursos) && currentProfile.cursos.length > 0) {
          uploadCurso.value = currentProfile.cursos[0];
        }
      }
      if (uploadClasse) {
        uploadClasse.disabled = false;
        if (currentFolderState.classe) uploadClasse.value = currentFolderState.classe;
        else if (filterClasse && filterClasse.value !== 'todas') uploadClasse.value = filterClasse.value;
      }
      if (uploadTurma) {
        uploadTurma.disabled = false;
        if (currentFolderState.turma) uploadTurma.value = cleanTurma(currentFolderState.turma);
        else if (filterTurma && filterTurma.value !== 'todas') uploadTurma.value = cleanTurma(filterTurma.value);
      }
      if (uploadDisciplina) {
        const activeUpCurso = uploadCurso?.value || (filterCurso && filterCurso.value !== 'todos' ? filterCurso.value : null);
        const upDiscs = getDisciplinasForContext({ course: activeUpCurso, classe: uploadClasse?.value, turma: uploadTurma?.value });
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
 * Submissão de Upload com Versionamento Automático e Isolamento Estrito
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

  const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';

  let targetCurso = currentFolderState.disciplina
    ? resolveCourseForDisciplina(currentFolderState.disciplina)
    : (uploadCurso?.value || resolveCourseForDisciplina(disciplina));
  let targetClasse = currentFolderState.classe || uploadClasse?.value || currentProfile.classes?.[0] || '10ª';
  let targetTurma = cleanTurma(currentFolderState.turma || uploadTurma?.value || currentProfile.turmas?.[0] || 'A');

  // Aluno: força sempre o contexto exato do seu próprio perfil e visibilidade exclusiva para o docente
  if (isAluno) {
    targetCurso = currentProfile.curso || targetCurso;
    targetClasse = currentProfile.classe || targetClasse;
    targetTurma = cleanTurma(currentProfile.turma || targetTurma);
  }

  const visibility = isAluno ? 'professor' : 'geral';

  btnSubmitUpload.disabled = true;
  if (uploadProgressBox) uploadProgressBox.style.display = 'block';
  if (uploadProgressBar) uploadProgressBar.style.width = '20%';
  if (uploadProgressPercent) uploadProgressPercent.textContent = '20%';
  if (uploadProgressText) uploadProgressText.textContent = 'A preparar ficheiro...';

  try {
    const rawFileName = selectedUploadFile.name.trim();

    // Versionamento: mesmo nome + mesmo curso + mesma classe + mesma turma => nova versão
    const existingVersions = allFilesData.filter(f =>
      (f.name || '').toLowerCase() === rawFileName.toLowerCase() &&
      sameCourse(f.curso, targetCurso) &&
      normStr(f.classe) === normStr(targetClasse) &&
      normStr(cleanTurma(f.turma)) === normStr(cleanTurma(targetTurma))
    );
    let nextVersion = 1;
    if (existingVersions.length > 0) {
      nextVersion = Math.max(...existingVersions.map(f => f.version || 1)) + 1;
    }

    const sanitizedName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = `${targetCurso || 'curso'}_${targetClasse || 'classe'}_${targetTurma || 'A'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
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
        turma: targetTurma === 'todas' ? null : cleanTurma(targetTurma),
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
    targetCourse = currentProfile.curso || '';
  } else if (filterCurso && filterCurso.value !== 'todos') {
    targetCourse = filterCurso.value;
  } else if (isTeacher) {
    targetCourse = currentProfile.curso || (Array.isArray(currentProfile.cursos) && currentProfile.cursos.length === 1 ? currentProfile.cursos[0] : null);
  }

  const targetClasse = isAluno
    ? (currentProfile.classe || null)
    : (filterClasse && filterClasse.value !== 'todas' ? filterClasse.value : null);

  const targetTurma = isAluno
    ? cleanTurma(currentProfile.turma || null)
    : (filterTurma && filterTurma.value !== 'todas' ? filterTurma.value : null);

  const discNames = getDisciplinasForContext({ course: targetCourse, classe: targetClasse, turma: targetTurma });

  const prevFilter = filterDisciplina ? filterDisciplina.value : null;
  fillSelect(filterDisciplina, discNames, { value: 'todas', label: 'Todas as Disciplinas' });
  if (prevFilter && discNames.includes(prevFilter)) {
    filterDisciplina.value = prevFilter;
  }

  const uploadCourseTarget = isAluno 
    ? (currentProfile.curso || '') 
    : (uploadCurso?.value || targetCourse);
  const uploadDiscs = getDisciplinasForContext({ course: uploadCourseTarget, classe: uploadClasse?.value, turma: uploadTurma?.value });
  fillSelect(uploadDisciplina, uploadDiscs, { value: '', label: 'Selecione a disciplina...' });
}

async function populateSelects() {
  try {
    await getCursosDB();
  } catch (_) {}

  try {
    const discs = await getDisciplinasDB();
    dynamicDisciplinas = Array.isArray(discs) ? discs : [];
  } catch (_) {
    dynamicDisciplinas = [];
  }

  const isAluno = currentProfile?.role === 'aluno' || currentProfile?.role === 'student';
  const isTeacher = currentProfile?.role === 'professor' || currentProfile?.role === 'teacher';

  const teacherCursos = isTeacher && Array.isArray(currentProfile.cursos) && currentProfile.cursos.length > 0
    ? currentProfile.cursos
    : CURSOS;
  const teacherClasses = isTeacher && Array.isArray(currentProfile.classes) && currentProfile.classes.length > 0
    ? currentProfile.classes
    : CLASSES;
  const teacherTurmas = isTeacher && Array.isArray(currentProfile.turmas) && currentProfile.turmas.length > 0
    ? [...new Set(currentProfile.turmas.map(cleanTurma).filter(Boolean))]
    : TURMAS;

  fillSelect(filterCurso, teacherCursos, teacherCursos.length > 1 || !isTeacher ? { value: 'todos', label: 'Todos os Cursos' } : null);
  fillSelect(filterClasse, teacherClasses, { value: 'todas', label: 'Todas as Classes' }, c => `${c} Classe`);
  fillSelect(filterTurma, teacherTurmas, { value: 'todas', label: 'Todas as Turmas' }, t => `Turma ${t}`);

  fillSelect(uploadCurso, teacherCursos, null);
  fillSelect(uploadClasse, teacherClasses, null, c => `${c} Classe`);
  fillSelect(uploadTurma, teacherTurmas, null, t => `Turma ${t}`);

  // Aluno: filtros de curso/classe/turma fixos no seu contexto
  if (isAluno) {
    if (filterCursoWrap) filterCursoWrap.style.display = 'none';
    if (filterTurmaWrap) filterTurmaWrap.style.display = 'none';
    if (filterClasse && filterClasse.parentElement) filterClasse.parentElement.style.display = 'none';
    if (filterCurso) {
      if (currentProfile.curso && ![...filterCurso.options].some(o => o.value === currentProfile.curso)) {
        const opt = document.createElement('option');
        opt.value = currentProfile.curso;
        opt.textContent = currentProfile.curso;
        filterCurso.appendChild(opt);
      }
      filterCurso.value = currentProfile.curso || '';
    }
    if (filterClasse && currentProfile.classe) filterClasse.value = currentProfile.classe;
    if (filterTurma && currentProfile.turma) filterTurma.value = cleanTurma(currentProfile.turma);
  } else if (isTeacher && teacherCursos.length === 1 && filterCurso) {
    filterCurso.value = teacherCursos[0];
  }

  updateDisciplinasSelects();
}

function setupFilterListeners() {
  [filterCurso, filterClasse, filterTurma, filterDisciplina, filterSort].forEach(el => {
    if (el) el.addEventListener('change', () => {
      if (el === filterCurso || el === filterClasse || el === filterTurma) {
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
      const isAluno = currentProfile?.role === 'aluno' || currentProfile?.role === 'student';
      const isTeacher = currentProfile?.role === 'professor' || currentProfile?.role === 'teacher';
      if (filterCurso) {
        if (isAluno) filterCurso.value = currentProfile.curso || '';
        else if (isTeacher && Array.isArray(currentProfile.cursos) && currentProfile.cursos.length === 1) filterCurso.value = currentProfile.cursos[0];
        else filterCurso.value = 'todos';
      }
      if (filterClasse) filterClasse.value = isAluno ? (currentProfile.classe || 'todas') : 'todas';
      if (filterTurma) filterTurma.value = isAluno ? cleanTurma(currentProfile.turma || 'todas') : 'todas';
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
      cloudFilesContainer.innerHTML = `<div class="state-empty state-empty-spaced text-center">Não foi possível carregar os ficheiros. Tente novamente.</div>`;
    }
  } finally {
    if (sessionOverlay) sessionOverlay.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initCloudApp);


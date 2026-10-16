import { sb, createIsolatedClient, getProfile, requireAuth, signOut, log, toast, confirmModal, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS, DISCIPLINAS, getDisciplinasDB, getTurmasDB } from './sb.js';
import './theme.js';

function isConfigPlaceholder() { return false; }

// ==========================================
// Seletores do DOM
// ==========================================
const sessionOverlay = document.getElementById('session-check-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const appSidebar = document.getElementById('app-sidebar');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const sidebarUserRole = document.getElementById('sidebar-user-role');

// Navegação entre secções
const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-section]');
const viewSections = document.querySelectorAll('.admin-view-section');

// Métricas Rápidas
const statTotalUsers = document.getElementById('stat-total-users');
const statTotalAlunos = document.getElementById('stat-total-alunos');
const statTotalProfessores = document.getElementById('stat-total-professores');
const statActiveRate = document.getElementById('stat-active-rate');

// Secção 1: Utilizadores
const filterUserRole = document.getElementById('filter-user-role');
const filterUserCurso = document.getElementById('filter-user-curso');
const filterUserTurma = document.getElementById('filter-user-turma');
const filterUserStatus = document.getElementById('filter-user-status');
const filterUserSearch = document.getElementById('filter-user-search');
const usersFilterText = document.getElementById('users-filter-text');
const btnResetUserFilters = document.getElementById('btn-reset-user-filters');
const usersTableBody = document.getElementById('users-table-body');
const usersPagination = document.getElementById('users-pagination');
const usersPaginationCount = document.getElementById('users-pagination-count');
const btnUsersPrevPage = document.getElementById('btn-users-prev-page');
const usersPageIndicator = document.getElementById('users-page-indicator');
const btnUsersNextPage = document.getElementById('btn-users-next-page');

// Modal Criar Utilizador
const btnOpenCreateUserTop = document.getElementById('btn-open-create-user-top');
const btnOpenCreateUserModal = document.getElementById('btn-open-create-user-modal');
const modalCreateUser = document.getElementById('modal-create-user');
const btnCloseCreateUserModal = document.getElementById('btn-close-create-user-modal');
const btnCancelCreateUser = document.getElementById('btn-cancel-create-user');
const formCreateUser = document.getElementById('form-create-user');
const createUserAlert = document.getElementById('create-user-alert');
const tabBtnAluno = document.getElementById('tab-btn-aluno');
const tabBtnProfessor = document.getElementById('tab-btn-professor');
const studentSpecificFields = document.getElementById('student-specific-fields');
const inputUserNome = document.getElementById('input-user-nome');
const inputUserEmail = document.getElementById('input-user-email');
const inputUserPassword = document.getElementById('input-user-password');
const inputUserCurso = document.getElementById('input-user-curso');
const inputUserClasse = document.getElementById('input-user-classe');
const inputUserTurma = document.getElementById('input-user-turma');
const teacherSpecificFields = document.getElementById('teacher-specific-fields');
const teacherDisciplinasGrid = document.getElementById('teacher-disciplinas-grid');
const teacherCursosGrid = document.getElementById('teacher-cursos-grid');
const teacherClassesGrid = document.getElementById('teacher-classes-grid');
const teacherTurmasGrid = document.getElementById('teacher-turmas-grid');
const btnSelectAllDisciplinas = document.getElementById('btn-select-all-disciplinas');
const btnClearDisciplinas = document.getElementById('btn-clear-disciplinas');
const btnSelectAllCursos = document.getElementById('btn-select-all-cursos');
const btnClearCursos = document.getElementById('btn-clear-cursos');
const btnSelectAllClasses = document.getElementById('btn-select-all-classes');
const btnSelectAllTurmas = document.getElementById('btn-select-all-turmas');
const btnSubmitCreateUser = document.getElementById('btn-submit-create-user');
const btnSubmitUserText = document.getElementById('btn-submit-user-text');

// Modal Editar Utilizador
const modalEditUser = document.getElementById('modal-edit-user');
const btnCloseEditUserModal = document.getElementById('btn-close-edit-user-modal');
const btnCancelEditUser = document.getElementById('btn-cancel-edit-user');
const formEditUser = document.getElementById('form-edit-user');
const editUserAlert = document.getElementById('edit-user-alert');
const editUserId = document.getElementById('edit-user-id');
const editUserNome = document.getElementById('edit-user-nome');
const editUserEmail = document.getElementById('edit-user-email');
const editUserRole = document.getElementById('edit-user-role');
const editStudentSpecificFields = document.getElementById('edit-student-specific-fields');
const editTeacherSpecificFields = document.getElementById('edit-teacher-specific-fields');
const editTeacherDisciplinasGrid = document.getElementById('edit-teacher-disciplinas-grid');
const editTeacherCursosGrid = document.getElementById('edit-teacher-cursos-grid');
const editTeacherClassesGrid = document.getElementById('edit-teacher-classes-grid');
const editTeacherTurmasGrid = document.getElementById('edit-teacher-turmas-grid');
const btnEditSelectAllDisciplinas = document.getElementById('btn-edit-select-all-disciplinas');
const btnEditClearDisciplinas = document.getElementById('btn-edit-clear-disciplinas');
const btnEditSelectAllCursos = document.getElementById('btn-edit-select-all-cursos');
const btnEditClearCursos = document.getElementById('btn-edit-clear-cursos');
const btnEditSelectAllClasses = document.getElementById('btn-edit-select-all-classes');
const btnEditSelectAllTurmas = document.getElementById('btn-edit-select-all-turmas');
const editUserCurso = document.getElementById('edit-user-curso');
const editUserClasse = document.getElementById('edit-user-classe');
const editUserTurma = document.getElementById('edit-user-turma');
const editUserPassword = document.getElementById('edit-user-password');
const editUserStatus = document.getElementById('edit-user-status');
const btnSubmitEditUser = document.getElementById('btn-submit-edit-user');

// Secção 2: Notícias
const newsTableBody = document.getElementById('news-table-body');

// Secção 3: Serviços
const btnRunHealthCheck = document.getElementById('btn-run-health-check');
const healthCheckIcon = document.getElementById('health-check-icon');
const lastHealthCheckTime = document.getElementById('last-health-check-time');

// Secção 4: Armazenamento
const storageTotalDisplay = document.getElementById('storage-total-display');
const storageProgressBarContainer = document.getElementById('storage-progress-bar-container');
const storageProgressFill = document.getElementById('storage-progress-fill');
const storageCoursesBreakdown = document.getElementById('storage-courses-breakdown');
const storageClassesTableBody = document.getElementById('storage-classes-table-body');

// Secção 5: Logs de Actividade
const btnRefreshLogs = document.getElementById('btn-refresh-logs');
const filterLogAction = document.getElementById('filter-log-action');
const filterLogSearch = document.getElementById('filter-log-search');
const logsTableBody = document.getElementById('logs-table-body');

// Secção: Gestão de Disciplinas & Cadeiras
const filterDisciplinaCurso = document.getElementById('filter-disciplina-curso');
const filterDisciplinaClasse = document.getElementById('filter-disciplina-classe');
const filterDisciplinaSearch = document.getElementById('filter-disciplina-search');
const btnResetDisciplinaFilters = document.getElementById('btn-reset-disciplina-filters');
const tableDisciplinas = document.getElementById('table-disciplinas');
const disciplinasTableBody = document.getElementById('disciplinas-table-body');
const disciplinasPagination = document.getElementById('disciplinas-pagination');
const disciplinasPaginationCount = document.getElementById('disciplinas-pagination-count');
const btnDisciplinasPrevPage = document.getElementById('btn-disciplinas-prev-page');
const disciplinasPageIndicator = document.getElementById('disciplinas-page-indicator');
const btnDisciplinasNextPage = document.getElementById('btn-disciplinas-next-page');
const btnOpenCreateDisciplinaModal = document.getElementById('btn-open-create-disciplina-modal');

// Modal Criar Disciplina
const modalCreateDisciplina = document.getElementById('modal-create-disciplina');
const btnCloseCreateDisciplinaModal = document.getElementById('btn-close-create-disciplina-modal');
const btnCancelCreateDisciplina = document.getElementById('btn-cancel-create-disciplina');

// Importar Disciplina
const modalImportDisciplina = document.getElementById('modal-import-disciplina');
const btnOpenImportDisciplinaModal = document.getElementById('btn-open-import-disciplina-modal');
const btnCloseImportDisciplinaModal = document.getElementById('btn-close-import-disciplina-modal');
const btnCancelImportDisciplina = document.getElementById('btn-cancel-import-disciplina');
const formImportDisciplina = document.getElementById('form-import-disciplina');
const importDiscSelect = document.getElementById('import-disc-select');
const importDisciplinaAlert = document.getElementById('import-disciplina-alert');
const formCreateDisciplina = document.getElementById('form-create-disciplina');
const createDisciplinaAlert = document.getElementById('create-disciplina-alert');
const createDiscNome = document.getElementById('create-disc-nome');
const createDiscCodigo = document.getElementById('create-disc-codigo');
const createDiscCarga = document.getElementById('create-disc-carga');
const createDiscCurso = document.getElementById('create-disc-curso');
const createDiscClasse = document.getElementById('create-disc-classe');
const createDiscDescricao = document.getElementById('create-disc-descricao');

// Modal Editar Disciplina
const modalEditDisciplina = document.getElementById('modal-edit-disciplina');
const btnCloseEditDisciplinaModal = document.getElementById('btn-close-edit-disciplina-modal');
const btnCancelEditDisciplina = document.getElementById('btn-cancel-edit-disciplina');
const formEditDisciplina = document.getElementById('form-edit-disciplina');
const editDisciplinaAlert = document.getElementById('edit-disciplina-alert');
const editDiscId = document.getElementById('edit-disc-id');
const editDiscNome = document.getElementById('edit-disc-nome');
const editDiscCodigo = document.getElementById('edit-disc-codigo');
const editDiscCarga = document.getElementById('edit-disc-carga');
const editDiscCurso = document.getElementById('edit-disc-curso');
const editDiscClasse = document.getElementById('edit-disc-classe');
const editDiscDescricao = document.getElementById('edit-disc-descricao');

// Modal Lotação / Atribuição Docente
const modalTeacherAssignment = document.getElementById('modal-manage-teacher-assignment');
const btnCloseTeacherAssignmentModal = document.getElementById('btn-close-teacher-assignment-modal');
const btnCancelTeacherAssignment = document.getElementById('btn-cancel-teacher-assignment');
const formTeacherAssignment = document.getElementById('form-teacher-assignment');
const teacherAssignmentAlert = document.getElementById('teacher-assignment-alert');
const assignTeacherId = document.getElementById('assign-teacher-id');
const assignTeacherAvatar = document.getElementById('assign-teacher-avatar');
const assignTeacherName = document.getElementById('assign-teacher-name');
const assignTeacherEmail = document.getElementById('assign-teacher-email');
const assignTeacherCursosGrid = document.getElementById('assign-teacher-cursos-grid');
const assignTeacherDisciplinasGrid = document.getElementById('assign-teacher-disciplinas-grid');
const assignTeacherClassesGrid = document.getElementById('assign-teacher-classes-grid');
const assignTeacherTurmasGrid = document.getElementById('assign-teacher-turmas-grid');
const assignSummaryText = document.getElementById('assign-summary-text');
const btnAssignAllCursos = document.getElementById('btn-assign-all-cursos');
const btnAssignClearCursos = document.getElementById('btn-assign-clear-cursos');
const btnAssignAllDisciplinas = document.getElementById('btn-assign-all-disciplinas');
const btnAssignClearDisciplinas = document.getElementById('btn-assign-clear-disciplinas');
const btnAssignAllClasses = document.getElementById('btn-assign-all-classes');
const btnAssignAllTurmas = document.getElementById('btn-assign-all-turmas');
const btnAssignClearTurmas = document.getElementById('btn-assign-clear-turmas');

// Modal Atribuição de Professores por Turma para uma Cadeira
const modalDiscTurmas = document.getElementById('modal-disciplina-turmas-professores');
const btnCloseDiscTurmasModal = document.getElementById('btn-close-disc-turmas-modal');
const btnCancelDiscTurmas = document.getElementById('btn-cancel-disc-turmas');
const formDiscTurmasProfessores = document.getElementById('form-disc-turmas-professores');
const discTurmasAlert = document.getElementById('disc-turmas-alert');
const discTurmasDiscId = document.getElementById('disc-turmas-disc-id');
const discTurmasDiscNome = document.getElementById('disc-turmas-disc-nome');
const discTurmasDiscCursoClasse = document.getElementById('disc-turmas-disc-curso-classe');
const discTurmasDiscCodigo = document.getElementById('disc-turmas-disc-codigo');
const discTurmasInputsContainer = document.getElementById('disc-turmas-inputs-container');

// Estado da Aplicação e Focus Trap
let currentProfile = null;
let currentUser = null;
let selectedUserType = 'aluno';
let allProfilesData = [];
let allFilesData = [];
let allNewsData = [];
let allLogsData = [];
let allDisciplinasData = [];
let disciplinasCurrentPage = 1;
const DISCIPLINAS_PER_PAGE = 8;
let activeAssignTeacher = null;
let lastFocusedElement = null;
let usersCurrentPage = 1;
const USERS_PER_PAGE = 7;

// Fallback Demo Users
const DEFAULT_DEMO_USERS = [
  { id: 'usr-admin-1', nome: 'Gabinete de Administração e Sistemas', email: 'admin.sistemas@ippln.ao', role: 'admin', curso: null, classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-1', nome: 'Prof. Manuel Gonçalves', email: 'manuel.goncalves@ippln.ao', role: 'professor', curso: 'Informática', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-2', nome: 'Prof. Maria Esperança', email: 'maria.esperanca@ippln.ao', role: 'professor', curso: 'Informática', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-3', nome: 'Prof. António Silva', email: 'antonio.silva@ippln.ao', role: 'professor', curso: 'Electricidade', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-1', nome: 'Pedro Muindi', email: 'pedro.muindi@aluno.ippln.ao', role: 'aluno', curso: 'Informática', classe: '12ª', turma: 'A', is_active: true, created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-2', nome: 'Teresa Chipalanga', email: 'teresa.chipalanga@aluno.ippln.ao', role: 'aluno', curso: 'Informática', classe: '12ª', turma: 'A', is_active: true, created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-3', nome: 'João Baptista Ndala', email: 'joao.ndala@aluno.ippln.ao', role: 'aluno', curso: 'Electricidade', classe: '11ª', turma: 'B', is_active: true, created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-4', nome: 'Marta dos Santos', email: 'marta.santos@aluno.ippln.ao', role: 'aluno', curso: 'Mecânica', classe: '12ª', turma: 'C', is_active: false, created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() }
];

const DEFAULT_DEMO_LOGS = [
  { id: 'log-1', user_name: 'Gabinete de Administração', user_role: 'admin', action_type: 'Criação de Conta', details: 'Criou a conta de aluno para Pedro Muindi (Turma 12ª A)', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 'log-2', user_name: 'Prof. Manuel Gonçalves', user_role: 'professor', action_type: 'Upload de Ficheiro', details: 'Enviou Guiao_Laboratorio_VLANs_Roteamento.pdf (v2) para a turma 12ª A', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 'log-3', user_name: 'Gabinete de Administração', user_role: 'admin', action_type: 'Alteração de Estado', details: 'Desactivou temporariamente a conta de Marta dos Santos (Mecânica 12ª C)', created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString() },
  { id: 'log-4', user_name: 'Direcção Pedagógica', user_role: 'admin', action_type: 'Publicação de Notícia', details: 'Publicou comunicado oficial sobre o Início das Provas do 2º Trimestre', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
  { id: 'log-5', user_name: 'Pedro Muindi', user_role: 'aluno', action_type: 'Autenticação', details: 'Iniciou sessão com sucesso na intranet via IPPLN Portal', created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString() }
];

function getLocalUsers() {
  try {
    const saved = localStorage.getItem('policloud_admin_users');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...DEFAULT_DEMO_USERS];
}

function getLocalLogs() {
  try {
    const saved = localStorage.getItem('policloud_admin_logs');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...DEFAULT_DEMO_LOGS];
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 MB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
}

function getNewsCategoryConfig(category) {
  switch (category) {
    case 'direccao':
    case 'Direcção & Secretaria':
      return { label: 'Direcção & Secretaria', class: 'cat-direccao' };
    case 'pedagogico':
    case 'Pedagógico':
    case 'Pedagógico & Aulas':
      return { label: 'Pedagógico & Aulas', class: 'cat-pedagogico' };
    case 'oficinas':
    case 'Oficinas & Laboratórios':
    case 'Infraestrutura':
      return { label: 'Oficinas & Laboratórios', class: 'cat-oficinas' };
    case 'eventos':
    case 'Eventos & Ciência':
    case 'Eventos & Feiras':
      return { label: 'Eventos & Ciência', class: 'cat-eventos' };
    default:
      return { label: 'Comunicado Geral', class: 'cat-direccao' };
  }
}

function renderMultiSelectChips(container, items, prefix, selectedItems = []) {
  if (!container) return;
  const selectedSet = new Set(selectedItems.map(s => String(s).trim()));
  container.innerHTML = items.map(item => {
    const isChecked = selectedSet.has(String(item).trim());
    const safeId = `${prefix}-${String(item).toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return `
      <label class="chip-checkbox-label ${isChecked ? 'is-selected' : ''}" for="${safeId}">
        <input
          type="checkbox"
          id="${safeId}"
          value="${escapeHtml(item)}"
          ${isChecked ? 'checked' : ''}
          onchange="this.parentElement.classList.toggle('is-selected', this.checked)"
        />
        <span>${escapeHtml(item)}</span>
      </label>
    `;
  }).join('');
}

function getSelectedChipsValues(container) {
  if (!container) return [];
  const checked = container.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checked).map(cb => cb.value);
}

function setAllChips(container, selectAll = true) {
  if (!container) return;
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = selectAll;
    cb.parentElement.classList.toggle('is-selected', selectAll);
  });
}

function populateTeacherChips(mode = 'create', currentData = {}) {
  const isCreate = mode === 'create';
  const discGrid = isCreate ? teacherDisciplinasGrid : editTeacherDisciplinasGrid;
  const cursoGrid = isCreate ? teacherCursosGrid : editTeacherCursosGrid;
  const classeGrid = isCreate ? teacherClassesGrid : editTeacherClassesGrid;
  const turmaGrid = isCreate ? teacherTurmasGrid : editTeacherTurmasGrid;
  const pfx = isCreate ? 'create-t' : 'edit-t';

  renderMultiSelectChips(discGrid, DISCIPLINAS, `${pfx}-disc`, currentData.disciplinas || []);
  renderMultiSelectChips(cursoGrid, CURSOS, `${pfx}-curso`, currentData.cursos || []);
  renderMultiSelectChips(classeGrid, CLASSES, `${pfx}-classe`, currentData.classes || []);
  renderMultiSelectChips(turmaGrid, TURMAS, `${pfx}-turma`, currentData.turmas || []);
}

function populateAdminSelects() {
  if (filterUserCurso) {
    filterUserCurso.innerHTML = `<option value="todos">Todos os Cursos</option>` + CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  if (inputUserCurso) {
    inputUserCurso.innerHTML = CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  if (editUserCurso) {
    editUserCurso.innerHTML = CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  if (inputUserClasse) {
    inputUserClasse.innerHTML = CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('');
  }
  if (editUserClasse) {
    editUserClasse.innerHTML = CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('');
  }

  const uniqueTurmas = Array.from(new Set([...TURMAS])).sort();

  if (filterUserTurma) {
    filterUserTurma.innerHTML = `<option value="todas">Todas as Turmas</option>` + uniqueTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('');
  }
  if (inputUserTurma) {
    inputUserTurma.innerHTML = uniqueTurmas.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }
  if (editUserTurma) {
    editUserTurma.innerHTML = uniqueTurmas.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
  }

  populateTeacherChips('create');
}

// ==========================================
// NAVEGAÇÃO DE VISTAS EXCLUSIVAS
// ==========================================
function setupSectionNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionName = item.getAttribute('data-section');
      switchSection(sectionName);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['usuarios', 'disciplinas', 'noticias', 'servicos', 'storage', 'logs'].includes(hash)) {
      switchSection(hash);
    }
  });

  const currentHash = window.location.hash.replace('#', '');
  if (currentHash && ['usuarios', 'disciplinas', 'noticias', 'servicos', 'storage', 'logs'].includes(currentHash)) {
    switchSection(currentHash);
  } else {
    switchSection('usuarios');
  }
}

function switchSection(sectionId) {
  navItems.forEach(item => {
    const isActive = item.getAttribute('data-section') === sectionId;
    item.classList.toggle('is-active', isActive);
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  viewSections.forEach(section => {
    const isTarget = section.id === `section-${sectionId}`;
    section.classList.toggle('is-active', isTarget);
    section.classList.toggle('active', isTarget);
    section.setAttribute('aria-hidden', !isTarget);
  });

  if (window.location.hash !== `#${sectionId}`) {
    try {
      window.history.replaceState(null, '', `#${sectionId}`);
    } catch (e) {}
  }

  if (appSidebar && appSidebar.classList.contains('mobile-open')) {
    appSidebar.classList.remove('mobile-open');
  }

  if (sectionId === 'servicos') {
    runServicesHealthCheck();
  }
}

// ==========================================
// SECÇÃO 1: GESTÃO DE UTILIZADORES
// ==========================================
async function fetchAllProfiles() {
  const parseArr = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      val = val.trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        try { return JSON.parse(val); } catch (e) {}
      }
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  try {
    const queryPromise = sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tempo de resposta da base de dados excedido.')), 15000)
    );
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error) throw error;
    allProfilesData = (data || []).map(p => {
      p.nome = p.nome || p.full_name || '';
      p.cursos = parseArr(p.cursos || (p.curso ? [p.curso] : []));
      p.disciplinas = parseArr(p.disciplinas || (p.disciplina ? [p.disciplina] : []));
      p.classes = parseArr(p.classes || (p.classe ? [p.classe] : []));
      p.turmas = parseArr(p.turmas || (p.turma ? [p.turma] : []));
      return p;
    });
    // Limpa cópias locais antigas que causavam números incorrectos
    try { localStorage.removeItem('policloud_admin_users'); } catch (e) {}
  } catch (err) {
    console.error('Erro ao consultar profiles:', err);
    if (usersTableBody) {
      usersTableBody.innerHTML = `
        <tr><td colspan="7" class="table-cell-centered">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;">
            <strong style="color: var(--color-text-primary);">Não foi possível carregar os utilizadores da base de dados</strong>
            <span style="font-size:13px;color: var(--color-text-secondary);">${escapeHtml(err.message || 'Erro desconhecido')}</span>
            <button type="button" class="btn-table-action" id="btn-retry-profiles">Tentar novamente</button>
          </div>
        </td></tr>`;
      const retry = document.getElementById('btn-retry-profiles');
      if (retry) retry.addEventListener('click', fetchAllProfiles);
    }
    if (usersFilterText) usersFilterText.textContent = 'Erro ao carregar utilizadores';
    return;
  }

  populateAdminSelects();
  renderUsersTable();
  updateGlobalStats();
}

function updateGlobalStats() {
  const total = allProfilesData.length;
  const alunos = allProfilesData.filter(u => u.role === 'student' || u.role === 'aluno').length;
  const professores = allProfilesData.filter(u => u.role === 'teacher' || u.role === 'professor').length;
  const activos = allProfilesData.filter(u => u.is_active !== false).length;

  if (statTotalUsers) statTotalUsers.textContent = total;
  if (statTotalAlunos) statTotalAlunos.textContent = alunos;
  if (statTotalProfessores) statTotalProfessores.textContent = professores;
  if (statActiveRate) {
    const percent = total > 0 ? Math.round((activos / total) * 100) : 100;
    statActiveRate.textContent = `${activos} (${percent}%)`;
  }
}

function renderUsersTable() {
  if (!usersTableBody) return;

  const selRole = filterUserRole ? filterUserRole.value : 'todos';
  const selCurso = filterUserCurso ? filterUserCurso.value : 'todos';
  const selTurma = filterUserTurma ? filterUserTurma.value : 'todas';
  const selStatus = filterUserStatus ? filterUserStatus.value : 'todos';
  const searchTerm = (filterUserSearch ? filterUserSearch.value : '').trim().toLowerCase();

  const filtered = allProfilesData.filter(u => {
    if (selRole !== 'todos') {
      const roleMap = { 'professor': ['professor','teacher'], 'aluno': ['aluno','student'], 'admin': ['admin'] };
      const allowed = roleMap[selRole] || [selRole];
      if (!allowed.includes(u.role)) return false;
    }

    const isTeacher = (u.role === 'teacher' || u.role === 'professor');

    if (selCurso !== 'todos') {
      if (isTeacher) {
        const cursosList = u.cursos || (u.curso ? u.curso.split(',').map(s=>s.trim()) : []);
        if (!cursosList.includes(selCurso)) return false;
      } else {
        if (u.curso !== selCurso) return false;
      }
    }

    if (selTurma !== 'todas') {
      if (isTeacher) {
        const turmasList = u.turmas || (u.turma ? u.turma.split(',').map(s=>s.trim()) : []);
        if (!turmasList.includes(selTurma)) return false;
      } else {
        if (u.turma !== selTurma) return false;
      }
    }

    if (selStatus === 'activo' && u.is_active === false) return false;
    if (selStatus === 'inactivo' && u.is_active !== false) return false;

    if (searchTerm) {
      const name = (u.nome || u.full_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const disc = (u.disciplina || (u.disciplinas ? u.disciplinas.join(' ') : '')).toLowerCase();
      if (!name.includes(searchTerm) && !email.includes(searchTerm) && !disc.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  if (usersFilterText) {
    usersFilterText.textContent = `${filtered.length} ${filtered.length === 1 ? 'utilizador encontrado' : 'utilizadores encontrados'}`;
  }

  if (filtered.length === 0) {
    if (usersPagination) usersPagination.style.display = 'none';
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="table-cell-centered">
          <div class="state-empty" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <strong style="font-size: 14px; color: var(--color-text-primary);">Nenhum utilizador encontrado</strong>
            <span style="font-size: 13px; color: var(--color-text-secondary);">Ajuste os filtros de pesquisa para visualizar outros perfis escolares.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Cálculo de Paginação
  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  if (usersCurrentPage > totalPages) usersCurrentPage = totalPages;
  if (usersCurrentPage < 1) usersCurrentPage = 1;

  const startIdx = (usersCurrentPage - 1) * USERS_PER_PAGE;
  const endIdx = startIdx + USERS_PER_PAGE;
  const pageUsers = filtered.slice(startIdx, endIdx);

  if (usersPagination) {
    usersPagination.style.display = 'flex';
    const showStart = startIdx + 1;
    const showEnd = Math.min(filtered.length, endIdx);
    if (usersPaginationCount) {
      usersPaginationCount.textContent = `A mostrar ${showStart}–${showEnd} de ${filtered.length} utilizadores`;
    }
    if (usersPageIndicator) {
      usersPageIndicator.textContent = `Página ${usersCurrentPage} de ${totalPages}`;
    }
    if (btnUsersPrevPage) btnUsersPrevPage.disabled = usersCurrentPage <= 1;
    if (btnUsersNextPage) btnUsersNextPage.disabled = usersCurrentPage >= totalPages;
  }

  usersTableBody.innerHTML = pageUsers.map(user => {
    const isActivo = user.is_active !== false;
    const displayName = user.nome || user.full_name || 'Sem Nome';
    const initial = ((displayName.trim()[0]) || 'U').toUpperCase();
    const roleKey = user.role || '';
    const roleBadgeClass = roleKey === 'admin' ? 'role-badge-admin' : (roleKey === 'teacher' || roleKey === 'professor' ? 'role-badge-professor' : 'role-badge-aluno');
    const roleLabel = roleKey === 'admin' ? 'Administrador' : (roleKey === 'teacher' || roleKey === 'professor' ? 'Docente' : 'Aluno');
    const isTeacher = (roleKey === 'teacher' || roleKey === 'professor');
    let cursoInfo = '';
    let turmaInfo = '';

    if (isTeacher) {
      const discList = user.disciplinas || (user.disciplina ? user.disciplina.split(',').map(s=>s.trim()) : []);
      const cursosList = user.cursos || (user.curso ? user.curso.split(',').map(s=>s.trim()) : []);
      const turmasList = user.turmas || (user.turma ? user.turma.split(',').map(s=>s.trim()) : []);

      const discPills = discList.slice(0, 2).map(d => `<span class="table-tag-pill pill-accent">${escapeHtml(d)}</span>`).join('') + (discList.length > 2 ? `<span class="table-tag-pill">+${discList.length - 2}</span>` : '');
      const cursosText = cursosList.length > 0 ? cursosList.slice(0, 2).join(', ') + (cursosList.length > 2 ? ` (+${cursosList.length - 2})` : '') : 'Todos os Cursos';

      cursoInfo = `
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <span style="font-size: 13px; font-weight: 500; color: var(--color-text-primary);">${cursosText}</span>
          <div style="display: flex; flex-wrap: wrap; gap: 2px;">${discPills}</div>
        </div>
      `;

      turmaInfo = turmasList.length > 0 ? turmasList.map(t => `<span class="table-tag-pill">${escapeHtml(t)}</span>`).join('') : '—';
    } else {
      cursoInfo = user.curso ? `${escapeHtml(user.curso)} ${user.classe ? `• ${escapeHtml(user.classe)}` : ''}` : 'Geral / Corpo Directivo';
      turmaInfo = user.turma ? escapeHtml(user.turma) : '—';
    }

    return `
      <tr data-user-row-id="${user.id}">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="user-avatar" style="width: 34px; height: 34px; font-size: 13px; font-weight: 700;">${initial}</div>
            <div style="display: flex; flex-direction: column;">
              <strong style="font-size: 13.5px; color: var(--color-text-primary);">${escapeHtml(displayName)}</strong>
              <span style="font-size: 12px; color: var(--color-text-secondary);">${escapeHtml(user.email || '—')}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="role-badge ${roleBadgeClass}">${roleLabel}</span>
        </td>
        <td>
          <div style="font-size: 13px; color: var(--color-text-primary);">${cursoInfo}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 13px; color: var(--color-accent);">${turmaInfo}</div>
        </td>
        <td>
          <span class="status-pill ${isActivo ? 'status-pill-active' : 'status-pill-inactive'}">
            <span class="status-dot"></span>
            ${isActivo ? 'Activo' : 'Desactivado'}
          </span>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--color-text-secondary);">${formatDate(user.created_at)}</span>
        </td>
        <td style="text-align: right;">
          <div class="table-actions-group">
            <button
              type="button"
              class="btn-table-action"
              data-action="edit-user"
              data-user-id="${user.id}"
              title="Editar dados e parâmetros do utilizador"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Editar</span>
            </button>
            ${isTeacher ? `
              <button
                type="button"
                class="btn-table-action"
                data-action="assign-teacher"
                data-user-id="${user.id}"
                title="Gerir Lotação: Cadeiras, Turmas e Cursos do Professor"
                style="color: var(--color-accent); border-color: rgba(37,99,235,0.35); font-weight: 600;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                  <path d="M6 6h10"/>
                </svg>
                <span>Lotação</span>
              </button>
            ` : ''}
            ${user.role !== 'admin' ? `
              <button
                type="button"
                class="btn-table-action ${isActivo ? 'action-status-danger' : 'action-status-success'}"
                data-action="toggle-status"
                data-user-id="${user.id}"
                data-user-name="${escapeHtml(displayName)}"
                data-current-status="${isActivo}"
                title="${isActivo ? 'Desactivar conta' : 'Reactivar conta'}"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${isActivo ? `
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  ` : `
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  `}
                </svg>
                <span>${isActivo ? 'Desactivar' : 'Reactivar'}</span>
              </button>
              <button
                type="button"
                class="btn-table-action"
                data-action="delete-user"
                data-user-id="${user.id}"
                data-user-name="${escapeHtml(displayName)}"
                title="Eliminar utilizador permanentemente"
                style="color: var(--color-danger, #ef4444); border-color: rgba(239,68,68,0.35); font-weight: 600;"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                <span>Eliminar</span>
              </button>
            ` : `
              <span style="font-size: 11px; color: var(--color-text-secondary); font-style: italic; padding: 0 4px;">Protegido</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Listeners de acções
  usersTableBody.querySelectorAll('button[data-action="assign-teacher"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      openTeacherAssignmentModal(userId);
    });
  });

  usersTableBody.querySelectorAll('button[data-action="edit-user"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      openEditUserModal(userId);
    });
  });

  usersTableBody.querySelectorAll('button[data-action="toggle-status"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      const userName = btn.getAttribute('data-user-name');
      const currentStatus = btn.getAttribute('data-current-status') === 'true';
      handleToggleUserStatus(userId, userName, currentStatus);
    });
  });

  usersTableBody.querySelectorAll('button[data-action="delete-user"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      const userName = btn.getAttribute('data-user-name');
      handleDeleteUser(userId, userName);
    });
  });
}

async function handleDeleteUser(userId, userName) {
  const confirmed = await confirmModal({
    title: 'Eliminar Conta de Utilizador',
    message: `Tem a certeza absoluta de que deseja eliminar o utilizador "${userName}"?\n\nEsta acção removerá o utilizador do sistema e não pode ser desfeita.`,
    confirmText: 'Sim, Eliminar Conta',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) return;

  try {
    // 1. Remover da memória e localStorage
    allProfilesData = allProfilesData.filter(u => String(u.id) !== String(userId));
    try {
      localStorage.setItem('policloud_admin_users', JSON.stringify(allProfilesData));
    } catch (e) {}

    // 2. Apagar do Supabase via RPC (garante que apaga da auth.users)
    const { error: delError } = await sb.rpc('admin_delete_user', { target_user_id: userId });
    
    // Se a RPC não existir ainda ou falhar, tentar apagar directamente como fallback, 
    // mas sem ignorar o erro silenciosamente
    if (delError) {
      console.warn('RPC admin_delete_user falhou ou não existe. A tentar apagar da tabela profiles...', delError);
      const { data, error: fallbackError } = await sb.from('profiles').delete().eq('id', userId).select();
      if (fallbackError) throw fallbackError;
      if (!data || data.length === 0) {
        throw new Error('A base de dados recusou a eliminação (Erro de Permissões RLS ou utilizador não encontrado).');
      }
    }

    toast(`Utilizador "${userName}" eliminado com sucesso.`, 'success');
    await log('eliminar_utilizador', 'profiles', userId, currentProfile?.nome || '');

    renderUsersTable();
    updateGlobalStats();
  } catch (err) {
    console.error('Erro ao eliminar utilizador:', err);
    toast(`Erro ao eliminar utilizador: ${err.message || 'Verifique as suas permissões.'}`, 'error');
  }
}

async function handleToggleUserStatus(userId, userName, currentStatus) {
  const novoEstado = !currentStatus;
  const actionText = novoEstado ? 'reactivar' : 'desactivar';
  const confirmTitle = novoEstado ? 'Reactivar Conta' : 'Desactivar Conta';
  const confirmMsg = `Tem a certeza de que deseja ${actionText} a conta do utilizador "${userName}"?`;

  const confirmed = await confirmModal({
    title: confirmTitle,
    message: confirmMsg,
    confirmText: novoEstado ? 'Reactivar Conta' : 'Desactivar Conta',
    cancelText: 'Cancelar',
    danger: !novoEstado
  });
  if (!confirmed) return;

  const btn = usersTableBody.querySelector(`button[data-action="toggle-status"][data-user-id="${userId}"]`);
  let originalHtml = '';
  if (btn) {
    originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner spinner-light spinner-sm"></div> <span>A processar...</span>`;
  }

  try {
    const userIndex = allProfilesData.findIndex(u => String(u.id) === String(userId));
    if (userIndex !== -1) {
      allProfilesData[userIndex].is_active = novoEstado;
      localStorage.setItem('policloud_admin_users', JSON.stringify(allProfilesData));
    }

    try {
      const { error: updateError } = await sb
        .from('profiles')
        .update({ is_active: novoEstado })
        .eq('id', userId);

      if (updateError) console.warn('Supabase update note:', updateError.message);
    } catch (sbErr) {
      console.warn('Persistência Supabase offline, salvo em localStorage:', sbErr);
    }

    toast(`Conta ${novoEstado ? 'reactivada' : 'desactivada'} com sucesso.`, 'success');
    await log(novoEstado ? 'reactivar_conta' : 'desactivar_conta', 'profiles', userId, currentProfile?.nome || '');

    renderUsersTable();
    updateGlobalStats();
  } catch (err) {
    console.error('Erro ao alternar status do utilizador:', err);
    toast(`Erro ao ${actionText} conta: ${err.message || 'Verifique as suas permissões.'}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

// ==========================================
// MODAL DE CRIAR UTILIZADOR (APPLE SHEET & FOCUS TRAP)
// ==========================================
function addTeacherAssignmentBlock(containerId, initialData = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const block = document.createElement('div');
  block.className = 'teacher-assignment-block';
  block.style.cssText = 'border: 1px solid var(--color-border-subtle); padding: 16px; border-radius: var(--radius-control); background: var(--color-surface-secondary); position: relative;';
  
  const cursosOptions = window._dynamicCursos ? window._dynamicCursos.map(c => `<option value="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</option>`).join('') : CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  block.innerHTML = `
    <button type="button" class="btn-remove-assignment" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: var(--color-danger); cursor: pointer; padding: 4px;" aria-label="Remover">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
    
    <div class="form-group-custom" style="margin-bottom: 12px; padding-right: 24px;">
      <label class="form-label-custom" style="font-size: 13px;">Curso</label>
      <select class="form-input-custom assign-curso" required>
        <option value="" disabled selected>Selecione o curso</option>
        ${cursosOptions}
      </select>
    </div>
    
    <div class="form-row-2col" style="margin-bottom: 12px;">
      <div class="form-group-custom" style="margin-bottom: 0;">
        <label class="form-label-custom" style="font-size: 13px;">Classe</label>
        <select class="form-input-custom assign-classe" required>
          <option value="10ª" selected>10ª Classe</option>
          <option value="11ª">11ª Classe</option>
          <option value="12ª">12ª Classe</option>
          <option value="13ª">13ª Classe</option>
        </select>
      </div>
      <div class="form-group-custom" style="margin-bottom: 0;">
        <label class="form-label-custom" style="font-size: 13px;">Disciplina</label>
        <select class="form-input-custom assign-disciplina" required>
          <option value="" disabled selected>Primeiro selecione o curso</option>
        </select>
      </div>
    </div>
    
    <div class="form-group-custom" style="margin-bottom: 0;">
      <label class="form-label-custom" style="font-size: 13px;">Turmas (Selecione uma ou mais)</label>
      <div class="assign-turmas-grid" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
        <!-- Turmas serão inseridas aqui dinamicamente -->
      </div>
    </div>
  `;
  
  const cursoSelect = block.querySelector('.assign-curso');
  const classeSelect = block.querySelector('.assign-classe');
  const disciplinaSelect = block.querySelector('.assign-disciplina');
  const turmasGrid = block.querySelector('.assign-turmas-grid');
  
  function updateBlockDynamicOptions(doNotResetTurmas = false) {
    const selectedCurso = cursoSelect.value;
    const selectedClasse = classeSelect.value;
    
    // Filtra disciplinas ou oculta se for 13ª classe
    const disciplinaGroup = disciplinaSelect.closest('.form-group-custom');
    if (selectedClasse === '13ª') {
      disciplinaGroup.style.display = 'none';
      disciplinaSelect.removeAttribute('required');
      disciplinaSelect.innerHTML = '<option value="Projeto / Estágio" selected>Projeto / Estágio</option>';
    } else {
      disciplinaGroup.style.display = 'block';
      disciplinaSelect.setAttribute('required', 'true');
      if (selectedCurso) {
        const filteredDisciplinas = allDisciplinasData.filter(d => 
          (d.curso === selectedCurso || !d.curso) &&
          (d.classe === selectedClasse || d.classe === 'Todas' || !d.classe)
        );
        
        if (filteredDisciplinas.length === 0) {
          disciplinaSelect.innerHTML = '<option value="" disabled selected>Nenhuma disciplina para este filtro</option>';
        } else {
          disciplinaSelect.innerHTML = '<option value="" disabled selected>Selecione a disciplina</option>' + 
            filteredDisciplinas.map(d => `<option value="${escapeHtml(d.nome)}">${escapeHtml(d.nome)}</option>`).join('');
        }
      } else {
        disciplinaSelect.innerHTML = '<option value="" disabled selected>Primeiro selecione o curso</option>';
      }
    }
    
    // Se recebemos initialData, preenche a disciplina
    if (initialData && initialData.disciplina && !doNotResetTurmas) {
      disciplinaSelect.value = initialData.disciplina;
    }
    
    // Atualiza turmas
    if (selectedClasse === '13ª') {
      const isChecked = (initialData && initialData.turmas && initialData.turmas.includes('Única')) ? 'checked' : (initialData ? '' : 'checked');
      turmasGrid.innerHTML = `
        <label style="display: flex; align-items: center; gap: 4px; font-size: 13.5px; cursor: pointer; background: var(--color-surface-base); padding: 4px 8px; border: 1px solid var(--color-border-subtle); border-radius: 4px;">
          <input type="checkbox" value="Única" class="assign-turma-checkbox" ${isChecked} /> Turma Única
        </label>
      `;
    } else {
      turmasGrid.innerHTML = ['A','B','C','D'].map(t => {
        const isChecked = (initialData && initialData.turmas && initialData.turmas.includes(t)) ? 'checked' : '';
        return `
        <label style="display: flex; align-items: center; gap: 4px; font-size: 13.5px; cursor: pointer; background: var(--color-surface-base); padding: 4px 8px; border: 1px solid var(--color-border-subtle); border-radius: 4px;">
          <input type="checkbox" value="${t}" class="assign-turma-checkbox" ${isChecked} /> Turma ${t}
        </label>
        `;
      }).join('');
    }
  }

  cursoSelect.addEventListener('change', () => updateBlockDynamicOptions(true));
  classeSelect.addEventListener('change', () => updateBlockDynamicOptions(true));
  
  if (initialData) {
    cursoSelect.value = initialData.curso || '';
    classeSelect.value = initialData.classe || '10ª';
  }
  
  updateBlockDynamicOptions(false);
  
  block.querySelector('.btn-remove-assignment').addEventListener('click', () => {
    block.remove();
  });
  
  container.appendChild(block);
}

function openCreateUserModal() {
  hideCreateUserAlert();
  if (formCreateUser) formCreateUser.reset();
  selectUserTypeTab('aluno');
  
  const container = document.getElementById('teacher-assignments-container');
  if (container) {
    container.innerHTML = '';
    addTeacherAssignmentBlock('teacher-assignments-container');
  }
  
  openM('modal-create-user');
}

function closeCreateUserModal() {
  closeM('modal-create-user');
}

function selectUserTypeTab(type) {
  selectedUserType = type;
  if (type === 'aluno') {
    tabBtnAluno.classList.add('is-active');
    tabBtnAluno.classList.add('active');
    tabBtnAluno.setAttribute('aria-selected', 'true');
    tabBtnProfessor.classList.remove('is-active');
    tabBtnProfessor.classList.remove('active');
    tabBtnProfessor.setAttribute('aria-selected', 'false');

    if (studentSpecificFields) {
      studentSpecificFields.style.display = 'block';
      studentSpecificFields.querySelectorAll('select').forEach(sel => {
        sel.removeAttribute('tabindex');
        sel.setAttribute('required', 'true');
      });
    }
    if (teacherSpecificFields) {
      teacherSpecificFields.style.display = 'none';
    }
    const txt = document.getElementById("btn-submit-user-text"); if (txt) txt.textContent = "Criar Conta de Aluno";
  } else {
    tabBtnProfessor.classList.add('is-active');
    tabBtnProfessor.classList.add('active');
    tabBtnProfessor.setAttribute('aria-selected', 'true');
    tabBtnAluno.classList.remove('is-active');
    tabBtnAluno.classList.remove('active');
    tabBtnAluno.setAttribute('aria-selected', 'false');

    if (studentSpecificFields) {
      studentSpecificFields.style.display = 'none';
      studentSpecificFields.querySelectorAll('select').forEach(sel => {
        sel.setAttribute('tabindex', '-1');
        sel.removeAttribute('required');
      });
    }
    if (teacherSpecificFields) {
      teacherSpecificFields.style.display = 'block';
    }
    const txt2 = document.getElementById("btn-submit-user-text"); if (txt2) txt2.textContent = "Criar Conta de Professor";
  }
}

function handleModalFocusTrap(e) {
  if (!modalCreateUser || !modalCreateUser.classList.contains('is-open')) return;
  if (e.key !== 'Tab') return;

  const focusables = modalCreateUser.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;

  const firstEl = focusables[0];
  const lastEl = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
      lastEl.focus();
      e.preventDefault();
    }
  } else {
    if (document.activeElement === lastEl) {
      firstEl.focus();
      e.preventDefault();
    }
  }
}

function showCreateUserAlert(msg, type = 'error') {
  if (!createUserAlert) return;
  createUserAlert.className = `alert-box visible alert-${type}`;
  createUserAlert.innerHTML = `<span>${escapeHtml(msg)}</span>`;
}

function hideCreateUserAlert() {
  if (!createUserAlert) return;
  createUserAlert.className = 'alert-box';
  createUserAlert.innerHTML = '';
}

async function handleCreateUserSubmit(e) {
  e.preventDefault();
  hideCreateUserAlert();

  const nomeCompleto = (inputUserNome.value || '').trim();
  const novoEmail = (inputUserEmail.value || '').trim().toLowerCase();
  const novaSenha = inputUserPassword.value || '';
  const roleUI = selectedUserType;
  const role = roleUI === 'aluno' ? 'student' : roleUI === 'professor' ? 'teacher' : roleUI;
  const curso = roleUI === 'aluno' ? inputUserCurso.value : null;
  const classe = roleUI === 'aluno' ? inputUserClasse.value : null;
  const turma = roleUI === 'aluno' ? inputUserTurma.value : null;

  // Atribuições Dinâmicas para Professor
  let teacherDisciplinas = [];
  let teacherCursos = [];
  let teacherClasses = [];
  let teacherTurmas = [];
  let atribuicoesCurriculares = [];

  if (roleUI === 'professor') {
    const blocks = document.querySelectorAll('.teacher-assignment-block');
    if (blocks.length === 0) {
      toast('Por favor, adicione pelo menos uma atribuição curricular para o professor.', 'error');
      return;
    }
    
    let hasError = false;
    const disciplinasSet = new Set();
    const cursosSet = new Set();
    const classesSet = new Set();
    const turmasSet = new Set();

    blocks.forEach(block => {
      const disciplina = block.querySelector('.assign-disciplina').value;
      const curso = block.querySelector('.assign-curso').value;
      const classe = block.querySelector('.assign-classe').value;
      const checkboxes = block.querySelectorAll('.assign-turma-checkbox:checked');
      
      if (!disciplina) {
        toast('Todas as atribuições devem ter uma disciplina selecionada.', 'error');
        hasError = true;
        return;
      }
      if (checkboxes.length === 0) {
        toast('Por favor, selecione pelo menos uma turma em todas as atribuições.', 'error');
        hasError = true;
        return;
      }
      
      const turmas = Array.from(checkboxes).map(cb => cb.value);
      atribuicoesCurriculares.push({ disciplina, curso, classe, turmas });
      
      disciplinasSet.add(disciplina);
      cursosSet.add(curso);
      classesSet.add(classe);
      turmas.forEach(t => turmasSet.add(t));
    });
    
    if (hasError) return;

    teacherDisciplinas = Array.from(disciplinasSet);
    teacherCursos = Array.from(cursosSet);
    teacherClasses = Array.from(classesSet);
    teacherTurmas = Array.from(turmasSet);
  }

  if (!nomeCompleto || nomeCompleto.length < 3) {
    toast('Por favor, introduza o nome completo do utilizador.', 'error');
    return;
  }

  if (!novoEmail || !novoEmail.includes('@')) {
    toast('Por favor, introduza um endereço de email escolar válido.', 'error');
    return;
  }

  if (!novaSenha || novaSenha.length < 6) {
    toast('A palavra-passe deve ter pelo menos 6 caracteres.', 'error');
    return;
  }

  btnSubmitCreateUser.disabled = true;
  const prevBtnHtml = btnSubmitCreateUser.innerHTML;
  btnSubmitCreateUser.innerHTML = `
    <div class="spinner spinner-light" style="width: 14px; height: 14px; border-width: 2px;"></div>
    <span>A criar conta...</span>
  `;

  if (isConfigPlaceholder()) {
    setTimeout(() => {
      const demoUser = {
        id: `usr-demo-${Date.now()}`,
        nome: nomeCompleto,
        email: novoEmail,
        role: roleUI,
        curso: curso,
        classe: classe,
        turma: turma,
        cursos: teacherCursos,
        classes: teacherClasses,
        turmas: teacherTurmas,
        disciplinas: teacherDisciplinas,
        is_active: true,
        created_at: new Date().toISOString()
      };
      allProfilesData.unshift(demoUser);
      renderUsersTable();
      updateGlobalStats();
      toast('Conta criada com sucesso (Modo Demonstração).', 'success');
      if (formCreateUser) formCreateUser.reset();
      closeCreateUserModal();
      btnSubmitCreateUser.disabled = false;
      btnSubmitCreateUser.innerHTML = prevBtnHtml;
    }, 600);
    return;
  }

  let adminSession = null; // Já não é necessário trocar sessões (cliente isolado)

  try {
    // PASSO 1/2 — Cria o utilizador no Auth com um cliente isolado,
    // mantendo intacta a sessão do administrador.
    const signupClient = createIsolatedClient();
    const { data, error } = await signupClient.auth.signUp({ 
      email: novoEmail, 
      password: novaSenha,
      options: {
        data: {
          role: role,
          full_name: nomeCompleto,
          nome: nomeCompleto,
          curso: roleUI === 'aluno' ? curso : null,
          classe: roleUI === 'aluno' ? classe : null,
          turma: roleUI === 'aluno' ? turma : null
        }
      }
    });

    if (error) {
      let msg = error.message || 'Erro ao criar a conta.';
      const lower = msg.toLowerCase();
      if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already_registered')) {
        msg = 'Este email já está registado.';
      } else if (lower.includes('password should be')) {
        msg = 'A palavra-passe deve ter pelo menos 6 caracteres.';
      }
      toast(msg, 'error');
      return;
    }

    let rpcSuccess = true;
    if (data && data.user) {
      // PASSO 3 — Tenta criar o perfil com os campos base e multi-seleção
      const rpcPayload = {
        user_id: data.user.id,
        full_name: nomeCompleto,
        user_email: novoEmail,
        user_role: role,
        user_curso: roleUI === 'aluno' ? curso : (teacherCursos.join(', ') || null),
        user_classe: roleUI === 'aluno' ? classe : (teacherClasses.join(', ') || null),
        user_turma: roleUI === 'aluno' ? turma : (teacherTurmas.join(', ') || null)
      };

      const { error: rpcError } = await sb.rpc('admin_create_user_profile', rpcPayload);

      if (rpcError) {
        console.warn('Tentativa padrão RPC:', rpcError.message);
        // Fallback: tentar update direto em profiles
        try {
          const upsertPayload = {
            id: data.user.id,
            full_name: nomeCompleto,
            email: novoEmail,
            role: role,
            curso: roleUI === 'aluno' ? curso : teacherCursos.join(', '),
            classe: roleUI === 'aluno' ? classe : teacherClasses.join(', '),
            turma: roleUI === 'aluno' ? turma : teacherTurmas.join(', '),
            disciplina: roleUI === 'professor' ? teacherDisciplinas.join(', ') : null,
            cursos: teacherCursos,
            classes: teacherClasses,
            turmas: teacherTurmas,
            disciplinas: teacherDisciplinas,
            atribuicoes_curriculares: atribuicoesCurriculares,
            is_active: true
          };
          let err = null;
          try {
             const { error } = await sb.from('profiles').upsert(upsertPayload);
             err = error;
             if (err && err.message && err.message.includes('atribuicoes_curriculares')) throw err;
          } catch(e) {
             if (e.message && e.message.includes('atribuicoes_curriculares')) {
                delete upsertPayload.atribuicoes_curriculares;
                const { error } = await sb.from('profiles').upsert(upsertPayload);
                err = error;
             }
          }
          if (err) throw err;
        } catch (directErr) {
          console.warn('Direct upsert note:', directErr);
        }
      } else if (roleUI === 'professor') {
        // Update direct array fields if RPC was successful but doesn't handle them
        try {
          const profPayload = {
            disciplina: teacherDisciplinas.join(', '),
            cursos: teacherCursos,
            classes: teacherClasses,
            turmas: teacherTurmas,
            disciplinas: teacherDisciplinas,
            atribuicoes_curriculares: atribuicoesCurriculares
          };
          let err = null;
          try {
            const { error } = await sb.from('profiles').update(profPayload).eq('id', data.user.id);
            err = error;
            if (err && err.message && err.message.includes('atribuicoes_curriculares')) throw err;
          } catch(e) {
            if (e.message && e.message.includes('atribuicoes_curriculares')) {
              delete profPayload.atribuicoes_curriculares;
              const { error } = await sb.from('profiles').update(profPayload).eq('id', data.user.id);
              err = error;
            }
          }
          if (err) throw err;
        } catch (updateErr) {
          console.warn('Direct update note:', updateErr);
        }
      }

      // Atualiza também localmente para persistência garantida na interface
      const localNewUser = {
        id: data.user.id,
        nome: nomeCompleto,
        full_name: nomeCompleto,
        email: novoEmail,
        role: roleUI,
        curso: roleUI === 'aluno' ? curso : teacherCursos.join(', '),
        classe: roleUI === 'aluno' ? classe : teacherClasses.join(', '),
        turma: roleUI === 'aluno' ? turma : teacherTurmas.join(', '),
        disciplina: roleUI === 'professor' ? teacherDisciplinas.join(', ') : null,
        cursos: teacherCursos,
        classes: teacherClasses,
        turmas: teacherTurmas,
        disciplinas: teacherDisciplinas,
        is_active: true,
        created_at: new Date().toISOString()
      };
      allProfilesData.unshift(localNewUser);
    }

    // PASSO 4 — Confirma sucesso
    if (data && data.user) {
      toast('Conta criada com sucesso.', 'success');
      await log('criar_conta', 'profiles', data.user.id, currentProfile?.nome || '');
      await fetchAllProfiles();
      await fetchAllLogs();
      if (formCreateUser) formCreateUser.reset();
      closeCreateUserModal();
    }
  } catch (err) {
    console.error('Erro na criação de utilizador:', err);
    toast(err.message || 'Ocorreu um erro ao registar a conta.', 'error');
  } finally {
    // PASSO 5 — Garantia Obrigatória em Finally: Restaura a sessão do admin
    if (adminSession) {
      try {
        await sb.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token
        });
      } catch (sessErr) {
        console.error('Erro ao restaurar sessão admin:', sessErr);
      }
    }
    btnSubmitCreateUser.disabled = false;
    btnSubmitCreateUser.innerHTML = prevBtnHtml;
  }
}

// ==========================================
// MODAL DE EDITAR UTILIZADOR
// ==========================================
function openEditUserModal(userId) {
  if (!modalEditUser) return;
  hideEditUserAlert();

  const user = allProfilesData.find(u => String(u.id) === String(userId));
  if (!user) {
    toast('Utilizador não encontrado no sistema.', 'error');
    return;
  }

  if (editUserId) editUserId.value = user.id;
  if (editUserNome) editUserNome.value = user.nome || user.full_name || '';
  if (editUserEmail) editUserEmail.value = user.email || '—';

  const role = user.role || 'aluno';
  const roleVal = (role === 'teacher' || role === 'professor') ? 'professor' : (role === 'admin' ? 'admin' : 'aluno');
  if (editUserRole) editUserRole.value = roleVal;

  if (roleVal === 'aluno') {
    if (editStudentSpecificFields) {
      editStudentSpecificFields.style.display = 'block';
      if (editUserCurso) editUserCurso.value = user.curso || CURSOS[0];
      if (editUserClasse) editUserClasse.value = user.classe || CLASSES[0];
      if (editUserTurma) editUserTurma.value = user.turma || 'INF-10A';
    }
    if (editTeacherSpecificFields) editTeacherSpecificFields.style.display = 'none';
  } else if (roleVal === 'professor') {
    if (editStudentSpecificFields) editStudentSpecificFields.style.display = 'none';
    if (editTeacherSpecificFields) {
      editTeacherSpecificFields.style.display = 'block';
      const container = document.getElementById('edit-teacher-assignments-container');
      if (container) {
        container.innerHTML = '';
        if (user.atribuicoes_curriculares && Array.isArray(user.atribuicoes_curriculares) && user.atribuicoes_curriculares.length > 0) {
          user.atribuicoes_curriculares.forEach(atr => {
            addTeacherAssignmentBlock('edit-teacher-assignments-container', atr);
          });
        } else {
          // Backward compatibility se não houver atribuicoes_curriculares
          if (user.disciplinas && user.disciplinas.length > 0) {
            addTeacherAssignmentBlock('edit-teacher-assignments-container', {
              disciplina: user.disciplinas[0],
              curso: user.cursos ? user.cursos[0] : null,
              classe: user.classes ? user.classes[0] : null,
              turmas: user.turmas || []
            });
          } else {
             addTeacherAssignmentBlock('edit-teacher-assignments-container');
          }
        }
      }
    }
  } else {
    if (editStudentSpecificFields) editStudentSpecificFields.style.display = 'none';
    if (editTeacherSpecificFields) editTeacherSpecificFields.style.display = 'none';
  }

  if (editUserPassword) editUserPassword.value = '';
  if (editUserStatus) editUserStatus.checked = user.is_active !== false;

  openM('modal-edit-user');
}

function closeEditUserModal() {
  closeM('modal-edit-user');
}

function showEditUserAlert(msg, type = 'error') {
  if (!editUserAlert) return;
  editUserAlert.className = `alert-box visible alert-${type}`;
  editUserAlert.innerHTML = `<span>${escapeHtml(msg)}</span>`;
}

function hideEditUserAlert() {
  if (!editUserAlert) return;
  editUserAlert.className = 'alert-box';
  editUserAlert.innerHTML = '';
}

async function handleEditUserSubmit(e) {
  e.preventDefault();
  hideEditUserAlert();

  const userId = editUserId ? editUserId.value : '';
  const nome = editUserNome ? editUserNome.value.trim() : '';
  const novaSenha = editUserPassword ? editUserPassword.value : '';
  const isActivo = editUserStatus ? editUserStatus.checked : true;

  if (!userId) return;

  if (!nome || nome.length < 3) {
    showEditUserAlert('O nome do utilizador deve conter pelo menos 3 caracteres.');
    return;
  }

  if (novaSenha && novaSenha.length < 6) {
    showEditUserAlert('A nova palavra-passe deve ter no mínimo 6 caracteres.');
    return;
  }

  const userIdx = allProfilesData.findIndex(u => String(u.id) === String(userId));
  if (userIdx === -1) {
    showEditUserAlert('Utilizador não encontrado no sistema.');
    return;
  }

  const user = allProfilesData[userIdx];
  const role = user.role || 'aluno';
  const isStudent = (role === 'aluno' || role === 'student');
  const isProfessor = (role === 'professor' || role === 'teacher');

  const curso = isStudent && editUserCurso ? editUserCurso.value : user.curso;
  const classe = isStudent && editUserClasse ? editUserClasse.value : user.classe;
  const turma = isStudent && editUserTurma ? editUserTurma.value : user.turma;

  // Multi-seleção para Professor
  let teacherDisciplinas = user.disciplinas || [];
  let teacherCursos = user.cursos || [];
  let teacherClasses = user.classes || [];
  let teacherTurmas = user.turmas || [];
  let atribuicoesCurriculares = user.atribuicoes_curriculares || [];

  if (isProfessor) {
    const blocks = document.querySelectorAll('#edit-teacher-assignments-container .teacher-assignment-block');
    if (blocks.length === 0) {
      showEditUserAlert('Por favor, adicione pelo menos uma atribuição curricular para o professor.');
      return;
    }
    
    let hasError = false;
    const disciplinasSet = new Set();
    const cursosSet = new Set();
    const classesSet = new Set();
    const turmasSet = new Set();
    atribuicoesCurriculares = [];

    blocks.forEach(block => {
      const bDisciplina = block.querySelector('.assign-disciplina').value;
      const bCurso = block.querySelector('.assign-curso').value;
      const bClasse = block.querySelector('.assign-classe').value;
      const checkboxes = block.querySelectorAll('.assign-turma-checkbox:checked');
      
      if (!bDisciplina) {
        showEditUserAlert('Todas as atribuições devem ter uma disciplina selecionada.');
        hasError = true;
        return;
      }
      if (checkboxes.length === 0) {
        showEditUserAlert('Por favor, selecione pelo menos uma turma em todas as atribuições.');
        hasError = true;
        return;
      }
      
      const bTurmas = Array.from(checkboxes).map(cb => cb.value);
      atribuicoesCurriculares.push({ disciplina: bDisciplina, curso: bCurso, classe: bClasse, turmas: bTurmas });
      
      disciplinasSet.add(bDisciplina);
      cursosSet.add(bCurso);
      classesSet.add(bClasse);
      bTurmas.forEach(t => turmasSet.add(t));
    });
    
    if (hasError) return;

    teacherDisciplinas = Array.from(disciplinasSet);
    teacherCursos = Array.from(cursosSet);
    teacherClasses = Array.from(classesSet);
    teacherTurmas = Array.from(turmasSet);
  }

  if (btnSubmitEditUser) {
    btnSubmitEditUser.disabled = true;
    btnSubmitEditUser.innerHTML = `<div class="spinner spinner-light spinner-sm"></div> <span>A guardar...</span>`;
  }

  try {
    // 1. Atualizar em memória
    allProfilesData[userIdx] = {
      ...user,
      nome: nome,
      full_name: nome,
      curso: isStudent ? curso : teacherCursos.join(', '),
      classe: isStudent ? classe : teacherClasses.join(', '),
      turma: isStudent ? turma : teacherTurmas.join(', '),
      disciplina: isProfessor ? teacherDisciplinas.join(', ') : user.disciplina,
      cursos: isProfessor ? teacherCursos : user.cursos,
      classes: isProfessor ? teacherClasses : user.classes,
      turmas: isProfessor ? teacherTurmas : user.turmas,
      disciplinas: isProfessor ? teacherDisciplinas : user.disciplinas,
      atribuicoes_curriculares: isProfessor ? atribuicoesCurriculares : user.atribuicoes_curriculares,
      is_active: isActivo
    };

    // 2. Persistir localmente
    localStorage.setItem('policloud_admin_users', JSON.stringify(allProfilesData));

    // 3. Tentar persistência no Supabase
    try {
      const updatePayload = {
        full_name: nome,
        curso: isStudent ? curso : teacherCursos.join(', '),
        classe: isStudent ? classe : teacherClasses.join(', '),
        turma: isStudent ? turma : teacherTurmas.join(', '),
        is_active: isActivo
      };
      if (isProfessor) {
        updatePayload.disciplina = teacherDisciplinas.join(', ');
        updatePayload.cursos = teacherCursos;
        updatePayload.classes = teacherClasses;
        updatePayload.turmas = teacherTurmas;
        updatePayload.disciplinas = teacherDisciplinas;
        updatePayload.atribuicoes_curriculares = atribuicoesCurriculares;
      }
      let error = null;
      try {
        const result = await sb.from('profiles').update(updatePayload).eq('id', userId);
        error = result.error;
        if (error && error.message && error.message.includes('atribuicoes_curriculares')) {
          throw error;
        }
      } catch (e) {
        if (e.message && e.message.includes('atribuicoes_curriculares')) {
          console.warn("Coluna 'atribuicoes_curriculares' não existe. A guardar sem ela...");
          delete updatePayload.atribuicoes_curriculares;
          const retryResult = await sb.from('profiles').update(updatePayload).eq('id', userId);
          error = retryResult.error;
        } else {
          error = e;
        }
      }
      if (error) throw error;
    } catch (sbErr) {
      console.warn('Persistência remota em profiles offline, guardado no cache local.');
    }

    await log('actualizar_perfil', 'profiles', userId, currentProfile?.nome || '');
    toast('Dados do utilizador actualizados com sucesso.', 'success');
    closeEditUserModal();
    renderUsersTable();
    updateGlobalStats();
  } catch (err) {
    console.error('Erro ao editar utilizador:', err);
    showEditUserAlert(err.message || 'Erro ao guardar alterações.');
  } finally {
    if (btnSubmitEditUser) {
      btnSubmitEditUser.disabled = false;
      btnSubmitEditUser.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Guardar Alterações</span>
      `;
    }
  }
}

// ==========================================
// SECÇÃO 2: NOTÍCIAS
// ==========================================
async function fetchRecentNews() {
  if (!newsTableBody) return;

  const DEFAULT_DEMO_NEWS = [
    { id: 'news-1', title: 'Início das Inscrições para a Feira Tecnológica e Feira de Ciências do IPPLN 2026', categoria: 'Eventos & Feiras', autor: 'Gabinete de Relações e Extensão', created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: 'news-2', title: 'Calendário Oficial das Provas e Exames Trimestrais publicado', categoria: 'Pedagógico', autor: 'Direcção Pedagógica IPPLN', created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 'news-3', title: 'Manutenção Programada e Expansão da Conectividade dos Laboratórios de Redes', categoria: 'Infraestrutura', autor: 'Departamento de Informática', created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString() }
  ];

  if (isConfigPlaceholder()) {
    allNewsData = DEFAULT_DEMO_NEWS;
    renderNewsTable();
    return;
  }

  try {
    const { data, error } = await sb
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    allNewsData = data && data.length > 0 ? data : DEFAULT_DEMO_NEWS;
  } catch (err) {
    console.error('Erro ao consultar notícias:', err);
    allNewsData = DEFAULT_DEMO_NEWS;
  }

  renderNewsTable();
}

function renderNewsTable() {
  if (!newsTableBody) return;

  if (allNewsData.length === 0) {
    newsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="table-cell-centered" style="color: var(--color-text-secondary);">
          Nenhum comunicado registado até ao momento.
        </td>
      </tr>
    `;
    return;
  }

  newsTableBody.innerHTML = allNewsData.map(item => {
    const catConfig = getNewsCategoryConfig(item.category || item.categoria);

    return `
      <tr>
        <td>
          <strong style="font-size: 13.5px; color: var(--color-text-primary);">${escapeHtml(item.title || item.titulo || 'Comunicado Escolar')}</strong>
        </td>
        <td>
          <span class="news-category-tag ${catConfig.class}">
            <span class="cat-dot" aria-hidden="true"></span>
            ${escapeHtml(catConfig.label)}
          </span>
        </td>
        <td>
          <span style="font-size: 12.5px; color: var(--color-text-secondary);">${escapeHtml(item.autor || item.author || 'Direcção')}</span>
        </td>
        <td>
          <span style="font-size: 12.5px; color: var(--color-text-secondary);">${formatDate(item.created_at)}</span>
        </td>
        <td style="text-align: right;">
          <a href="/noticias.html" class="btn-table-action" style="padding: 4px 12px; font-size: 12.5px; min-height: 32px;">
            <span>Visualizar</span>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// SECÇÃO: GESTÃO CURRICULAR & DOCÊNCIA (DISCIPLINAS E LOTAÇÃO DOCENTE)
// ==========================================
async function fetchAllCursos() {
  try {
    const { data, error } = await sb.from('cursos').select('*').order('nome', { ascending: true });
    if (error) throw error;
    window._dynamicCursos = data;
  } catch (err) {
    console.error('Erro ao buscar cursos. Fallback para os base.', err);
    window._dynamicCursos = CURSOS.map(c => ({ id: null, nome: c }));
  }
  
  // Atualiza todos os dropdowns de cursos espalhados pela UI
  updateAllCourseDropdowns();
}

function updateAllCourseDropdowns() {
  if (!window._dynamicCursos) return;
  const optionsHtml = window._dynamicCursos.map(c => `<option value="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</option>`).join('');
  const optionsWithAll = `<option value="todos">Todos os Cursos</option>` + optionsHtml;

  const userFilter = document.getElementById('filter-user-curso');
  if (userFilter) {
    const val = userFilter.value;
    userFilter.innerHTML = optionsWithAll;
    userFilter.value = val || 'todos';
  }
  
  const discFilter = document.getElementById('filter-disciplina-curso');
  if (discFilter) {
    const val = discFilter.value;
    discFilter.innerHTML = optionsWithAll;
    discFilter.value = val || 'todos';
  }
  
  const createUserCurso = document.getElementById('create-user-curso');
  if (createUserCurso) {
    const val = createUserCurso.value;
    createUserCurso.innerHTML = optionsHtml;
    if (val) createUserCurso.value = val;
  }
  
  const createDiscCurso = document.getElementById('create-disc-curso');
  if (createDiscCurso) {
    const val = createDiscCurso.value;
    createDiscCurso.innerHTML = optionsHtml;
    if (val) createDiscCurso.value = val;
  }
  
  const editDiscCurso = document.getElementById('edit-disc-curso');
  if (editDiscCurso) {
    const val = editDiscCurso.value;
    editDiscCurso.innerHTML = optionsHtml;
    if (val) editDiscCurso.value = val;
  }
}

async function fetchAllDisciplinas() {
  try {
    const list = await getDisciplinasDB();
    allDisciplinasData = Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Erro ao carregar disciplinas:', err);
    allDisciplinasData = DISCIPLINAS.map((nome, idx) => ({
      id: `fallback-disc-${idx}`,
      nome,
      codigo: nome.slice(0, 3).toUpperCase(),
      curso: 'Informática',
      classe: '10ª',
      carga_horaria: 4,
      descricao: `Disciplina curricular de ${nome}`
    }));
  }

  updateDisciplinasMetrics();
  renderDisciplinasTable();
}

function updateDisciplinasMetrics() {
  const statTotal = document.getElementById('stat-total-disciplinas');
  const statProfAlocados = document.getElementById('stat-total-professores-alocados');
  const statSemProf = document.getElementById('stat-disciplinas-sem-prof');

  if (statTotal) {
    statTotal.textContent = allDisciplinasData.length;
  }

  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');
  const allocatedTeachers = teachers.filter(t => {
    const discs = Array.isArray(t.disciplinas) ? t.disciplinas : (t.disciplina ? [t.disciplina] : []);
    return discs.length > 0;
  });

  if (statProfAlocados) {
    statProfAlocados.textContent = allocatedTeachers.length;
  }

  // Quantas disciplinas cadastradas não têm docente
  const unassignedCount = allDisciplinasData.filter(disc => {
    return !teachers.some(t => {
      const discs = Array.isArray(t.disciplinas) ? t.disciplinas : (t.disciplina ? [t.disciplina] : []);
      return discs.some(d => String(d).trim().toLowerCase() === String(disc.nome).trim().toLowerCase());
    });
  }).length;

  if (statSemProf) {
    statSemProf.textContent = unassignedCount;
  }
}
// ==========================================
// GESTÃO CURRICULAR: NAVEGAÇÃO DE CURSOS
// ==========================================
const viewCursosGrid = document.getElementById('view-cursos-grid');
const viewDisciplinasTable = document.getElementById('view-disciplinas-table');
const btnBackToCursos = document.getElementById('btn-back-to-cursos');
const currentCourseTitle = document.getElementById('current-course-title');
let selectedCourseForView = null;

if (btnBackToCursos) {
  btnBackToCursos.addEventListener('click', () => {
    viewDisciplinasTable.style.display = 'none';
    viewCursosGrid.style.display = 'flex';
    selectedCourseForView = null;
    
    // Reset filters
    if (document.getElementById('filter-disciplina-curso')) {
       document.getElementById('filter-disciplina-curso').value = 'todos';
       document.getElementById('filter-disciplina-curso').parentElement.style.display = 'block'; // show filter again if hidden
    }
  });
}

function renderCursosCards() {
  const container = document.getElementById('cursos-cards-container');
  if (!container) return;
  
  // Usar os cursos dinâmicos se existirem, senão fallback para CURSOS base
  const coursesToRender = window._dynamicCursos || CURSOS.map(c => ({ nome: c }));
  
  container.innerHTML = coursesToRender.map(curso => {
    // Conta quantas disciplinas existem para este curso
    const countDisc = allDisciplinasData.filter(d => d.curso === curso.nome).length;
    
    return `
      <div class="admin-stat-card" style="cursor: pointer; position: relative; transition: all 0.2s; border: 1px solid var(--color-border-subtle);" onclick="openCourseView('${escapeHtml(curso.nome)}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div style="background: var(--color-accent-subtle); padding: 10px; border-radius: 10px; color: var(--color-accent);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <!-- Botão de editar -->
          <button class="btn-icon" style="background: transparent; padding: 4px; border: none; color: var(--color-text-tertiary);" onclick="event.stopPropagation(); openManageCourseModal('${curso.id}', '${escapeHtml(curso.nome)}')" aria-label="Gerir Curso">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
        </div>
        <h4 style="margin: 0 0 4px 0; font-size: 16px; color: var(--color-text-primary); font-weight: 600;">${escapeHtml(curso.nome)}</h4>
        <p style="margin: 0; font-size: 13.5px; color: var(--color-text-secondary);">${countDisc} Disciplina${countDisc !== 1 ? 's' : ''} vinculada${countDisc !== 1 ? 's' : ''}</p>
      </div>
    `;
  }).join('');
  
  // Adiciona o cartão de "Criar Novo Curso" no final
  container.innerHTML += `
    <div class="admin-stat-card" style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(37, 99, 235, 0.03); border: 2px dashed var(--color-border-subtle); transition: all 0.2s;" onclick="openManageCourseModal()">
      <div style="background: var(--color-surface-base); padding: 10px; border-radius: 50%; color: var(--color-text-secondary); margin-bottom: 12px; box-shadow: var(--shadow-sm);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <h4 style="margin: 0; font-size: 15px; color: var(--color-text-secondary); font-weight: 500;">Adicionar Novo Curso</h4>
    </div>
  `;
}

window.openCourseView = function(cursoName) {
  selectedCourseForView = cursoName;
  viewCursosGrid.style.display = 'none';
  viewDisciplinasTable.style.display = 'flex';
  
  if (currentCourseTitle) {
    currentCourseTitle.textContent = `Disciplinas de ${cursoName}`;
  }
  
  // Filter the table and hide the Course filter dropdown since we are already in a course
  const filterCursoEl = document.getElementById('filter-disciplina-curso');
  if (filterCursoEl) {
    filterCursoEl.value = cursoName;
    filterCursoEl.parentElement.style.display = 'none'; // hide the column
  }
  
  renderDisciplinasTable();
};


function renderDisciplinasTable() {
  if (!disciplinasTableBody) return;

  const filterCursoVal = filterDisciplinaCurso ? filterDisciplinaCurso.value : 'todos';
  const filterClasseVal = filterDisciplinaClasse ? filterDisciplinaClasse.value : 'todas';
  const searchTerm = filterDisciplinaSearch ? filterDisciplinaSearch.value.trim().toLowerCase() : '';

  let filtered = allDisciplinasData.filter(d => {
    if (filterCursoVal !== 'todos' && d.curso !== filterCursoVal) return false;
    if (filterClasseVal !== 'todas' && d.classe !== filterClasseVal && d.classe !== 'Todas') return false;
    if (searchTerm) {
      const matchNome = (d.nome || '').toLowerCase().includes(searchTerm);
      const matchCod = (d.codigo || '').toLowerCase().includes(searchTerm);
      if (!matchNome && !matchCod) return false;
    }
    return true;
  });

  // Paginação
  const DISCIPLINAS_PER_PAGE_DYNAMIC = 20; // Increased so more fit on a single page
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / DISCIPLINAS_PER_PAGE_DYNAMIC) || 1;
  if (disciplinasCurrentPage > totalPages) disciplinasCurrentPage = totalPages;
  if (disciplinasCurrentPage < 1) disciplinasCurrentPage = 1;

  const startIndex = (disciplinasCurrentPage - 1) * DISCIPLINAS_PER_PAGE_DYNAMIC;
  const paginated = filtered.slice(startIndex, startIndex + DISCIPLINAS_PER_PAGE_DYNAMIC);

  if (disciplinasPagination) {
    disciplinasPagination.style.display = totalPages > 1 ? 'flex' : 'none';
  }

  if (disciplinasPaginationCount) {
    const from = totalItems === 0 ? 0 : startIndex + 1;
    const to = Math.min(startIndex + DISCIPLINAS_PER_PAGE_DYNAMIC, totalItems);
    disciplinasPaginationCount.textContent = `A mostrar ${from}–${to} de ${totalItems} disciplinas`;
  }
  if (disciplinasPageIndicator) {
    disciplinasPageIndicator.textContent = `Página ${disciplinasCurrentPage} de ${totalPages}`;
  }
  if (btnDisciplinasPrevPage) btnDisciplinasPrevPage.disabled = disciplinasCurrentPage <= 1;
  if (btnDisciplinasNextPage) btnDisciplinasNextPage.disabled = disciplinasCurrentPage >= totalPages;

  if (paginated.length === 0) {
    disciplinasTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--color-text-secondary);">
          <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
          <strong style="font-size: 15px; display: block; color: var(--color-text-primary); margin-bottom: 4px;">Nenhuma disciplina encontrada</strong>
          <span style="font-size: 13px;">Tente ajustar os filtros ou clique em "+ Nova Disciplina" para registar no plano curricular.</span>
        </td>
      </tr>
    `;
    return;
  }

  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');

  disciplinasTableBody.innerHTML = paginated.map(disc => {
    // 1. Carga horária limpa sem repetições
    const cleanCarga = String(disc.carga_horaria || 4).replace(/h\s*\/\s*semana/gi, '').trim();

    // 2. Professores atribuídos por turma
    let turmaMap = {};
    if (disc.professores_turmas) {
      if (typeof disc.professores_turmas === 'object') {
        turmaMap = disc.professores_turmas;
      } else if (typeof disc.professores_turmas === 'string') {
        try { turmaMap = JSON.parse(disc.professores_turmas); } catch (e) {}
      }
    }

    const assignedTurmasEntries = Object.entries(turmaMap).filter(([t, profVal]) => Boolean(profVal));

    let teacherBadgeHtml = '';
    if (assignedTurmasEntries.length > 0) {
      teacherBadgeHtml = `
        <div class="disc-turma-teachers-wrap">
          ${assignedTurmasEntries.map(([turmaName, profVal]) => {
            let tName = 'Docente';
            if (typeof profVal === 'object' && profVal !== null) {
              tName = profVal.nome || 'Docente';
            } else {
              const pObj = allProfilesData.find(p => String(p.id) === String(profVal));
              tName = pObj ? pObj.nome : String(profVal);
            }
            return `
              <span class="disc-turma-badge" title="Turma ${escapeHtml(turmaName)}: ${escapeHtml(tName)}">
                <span class="turma-tag">${escapeHtml(turmaName)}</span>
                <span class="disc-teacher-name">${escapeHtml(tName.split(' ').slice(0, 2).join(' '))}</span>
              </span>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Fallback: verificar se algum professor tem esta disciplina na sua lotação geral
      const assignedFallback = teachers.filter(t => {
        const discs = Array.isArray(t.disciplinas) ? t.disciplinas : (t.disciplina ? [t.disciplina] : []);
        return discs.some(d => String(d).trim().toLowerCase() === String(disc.nome).trim().toLowerCase());
      });

      if (assignedFallback.length > 0) {
        teacherBadgeHtml = `
          <div class="disc-turma-teachers-wrap">
            ${assignedFallback.map(t => `
              <span class="disc-turma-badge" title="Docente: ${escapeHtml(t.nome)}">
                <span class="disc-teacher-name">👨‍🏫 ${escapeHtml(t.nome.split(' ').slice(0, 2).join(' '))}</span>
              </span>
            `).join('')}
          </div>
        `;
      } else {
        teacherBadgeHtml = `<span style="font-size: 12px; color: var(--color-text-tertiary); font-style: italic;">Sem docente atribuído</span>`;
      }
    }

    return `
      <tr>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <strong style="font-size: 14px; color: var(--color-text-primary);">${escapeHtml(disc.nome)}</strong>
            ${disc.descricao ? `<span style="font-size: 12px; color: var(--color-text-secondary); max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(disc.descricao)}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="activity-badge badge-info" style="font-family: monospace; font-weight: 700; font-size: 11.5px;">${escapeHtml(disc.codigo || '—')}</span>
        </td>
        <td>
          <span class="user-role-badge" style="background: rgba(0, 113, 227, 0.1); color: var(--color-accent); font-size: 11.5px;">
            ${escapeHtml(disc.curso || 'Geral')}
          </span>
        </td>
        <td>
          <span class="status-indicator-badge status-active" style="font-size: 11.5px;">
            ${escapeHtml(disc.classe || 'Todas')}
          </span>
        </td>
        <td>
          <span style="font-size: 13px; font-weight: 500; color: var(--color-text-primary);">${cleanCarga}h / semana</span>
        </td>
        <td>
          ${teacherBadgeHtml}
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end;">
            <button type="button" class="btn-table-action btn-assign-turmas" data-id="${disc.id}" title="Atribuir Docentes por Turma" style="color: var(--color-accent); border-color: rgba(0, 113, 227, 0.35); font-weight: 600;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Turmas</span>
            </button>
            <button type="button" class="btn-table-action btn-edit-disciplina" data-id="${disc.id}" title="Editar Disciplina">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>Editar</span>
            </button>
            <button type="button" class="btn-table-action danger btn-delete-disciplina" data-id="${disc.id}" title="Remover Disciplina">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Excluir</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Listeners dos botões
  disciplinasTableBody.querySelectorAll('.btn-assign-turmas').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openAssignTurmasModal(id);
    });
  });

  disciplinasTableBody.querySelectorAll('.btn-edit-disciplina').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditDisciplinaModal(id);
    });
  });

  disciplinasTableBody.querySelectorAll('.btn-delete-disciplina').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteDisciplina(id);
    });
  });
}

// Utilitários para seleção de professores por turma nos modais de criação e edição
function populateTurmaTeacherSelects(prefix, currentTurmaMap = {}) {
  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');
  ['a', 'b', 'c', 'd'].forEach(letter => {
    const sel = document.getElementById(`${prefix}-disc-prof-turma-${letter}`);
    if (!sel) return;
    const turmaKey = `Turma ${letter.toUpperCase()}`;
    const assigned = currentTurmaMap[turmaKey];
    const assignedId = assigned ? (typeof assigned === 'object' ? assigned.id : String(assigned)) : '';

    sel.innerHTML = `<option value="">-- Sem professor --</option>` +
      teachers.map(t => {
        const isSel = String(t.id) === String(assignedId);
        return `<option value="${escapeHtml(t.id)}" ${isSel ? 'selected' : ''}>${escapeHtml(t.nome)} (${escapeHtml(t.email || '')})</option>`;
      }).join('');
  });
}

function getSelectedTurmaTeachers(prefix) {
  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');
  const payload = {};
  ['a', 'b', 'c', 'd'].forEach(letter => {
    const sel = document.getElementById(`${prefix}-disc-prof-turma-${letter}`);
    const turmaKey = `Turma ${letter.toUpperCase()}`;
    if (sel && sel.value) {
      const teacherObj = teachers.find(t => String(t.id) === String(sel.value));
      payload[turmaKey] = {
        id: sel.value,
        nome: teacherObj ? teacherObj.nome : 'Professor'
      };
    } else {
      payload[turmaKey] = null;
    }
  });
  return payload;
}

async function syncTeachersProfiles(discNome, turmaPayload) {
  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');
  for (const [turma, profData] of Object.entries(turmaPayload)) {
    if (profData && profData.id) {
      const teacherProfile = teachers.find(t => String(t.id) === String(profData.id));
      if (teacherProfile) {
        const discs = Array.isArray(teacherProfile.disciplinas) ? [...teacherProfile.disciplinas] : [];
        if (!discs.includes(discNome)) discs.push(discNome);

        const turmas = Array.isArray(teacherProfile.turmas) ? [...teacherProfile.turmas] : [];
        const cleanTurmaLetter = turma.replace(/^Turma\s*/i, '').trim();
        if (!turmas.includes(cleanTurmaLetter)) turmas.push(cleanTurmaLetter);

        await sb.from('profiles').update({
          disciplinas: discs,
          disciplina: discs[0] || null,
          turmas: turmas,
          turma: turmas[0] || null
        }).eq('id', profData.id);

        teacherProfile.disciplinas = discs;
        teacherProfile.turmas = turmas;
      }
    }
  }
}

// ==========================================
// MODAL: GERIR CURSOS (Fase 3)
// ==========================================
const modalManageCourse = document.getElementById('modal-manage-course');
const btnCloseManageCourseModal = document.getElementById('btn-close-manage-course-modal');
const btnCancelManageCourse = document.getElementById('btn-cancel-manage-course');
const formManageCourse = document.getElementById('form-manage-course');
const manageCourseAlert = document.getElementById('manage-course-alert');
const manageCourseId = document.getElementById('manage-course-id');
const inputCourseName = document.getElementById('input-course-name');
const btnSubmitCourseText = document.getElementById('btn-submit-course-text');
const modalManageCourseTitle = document.getElementById('modal-manage-course-title');
const btnDeleteCourse = document.getElementById('btn-delete-course');

window.openManageCourseModal = function(id = '', nome = '') {
  if (!modalManageCourse) return;
  if (formManageCourse) formManageCourse.reset();
  if (manageCourseAlert) manageCourseAlert.style.display = 'none';
  
  manageCourseId.value = id;
  inputCourseName.value = nome;
  
  if (id) {
    modalManageCourseTitle.textContent = 'Editar Curso';
    btnSubmitCourseText.textContent = 'Guardar Alterações';
    btnDeleteCourse.style.display = 'block';
  } else {
    modalManageCourseTitle.textContent = 'Adicionar Novo Curso';
    btnSubmitCourseText.textContent = 'Criar Curso';
    btnDeleteCourse.style.display = 'none';
  }
  
  openM('modal-manage-course');
  if (inputCourseName) inputCourseName.focus();
};

function closeManageCourseModal() {
  closeM('modal-manage-course');
}

if (btnCloseManageCourseModal) btnCloseManageCourseModal.addEventListener('click', closeManageCourseModal);
if (btnCancelManageCourse) btnCancelManageCourse.addEventListener('click', closeManageCourseModal);

if (formManageCourse) {
  formManageCourse.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (manageCourseAlert) manageCourseAlert.style.display = 'none';
    
    const id = manageCourseId.value;
    const nome = inputCourseName.value.trim();
    
    if (!nome) return;
    
    const submitBtn = formManageCourse.querySelector('button[type="submit"]');
    const oldText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner spinner-light spinner-sm"></div>';
    submitBtn.disabled = true;
    
    try {
      if (id) {
        // Atualizar
        const { error } = await sb.from('cursos').update({ nome }).eq('id', id);
        if (error) throw error;
        toast('Curso atualizado com sucesso!', 'success');
      } else {
        // Inserir
        const { error } = await sb.from('cursos').insert([{ nome }]);
        if (error) throw error;
        toast('Curso criado com sucesso!', 'success');
      }
      
      closeManageCourseModal();
      await fetchAllCursos();
      renderCursosCards();
    } catch (err) {
      console.error(err);
      if (manageCourseAlert) {
        manageCourseAlert.style.display = 'block';
        manageCourseAlert.className = 'alert-box alert-error visible';
        manageCourseAlert.innerHTML = `<span>Erro: O curso já existe ou ocorreu uma falha.</span>`;
      }
    } finally {
      submitBtn.innerHTML = oldText;
      submitBtn.disabled = false;
    }
  });
}

if (btnDeleteCourse) {
  btnDeleteCourse.addEventListener('click', async () => {
    const id = manageCourseId.value;
    const nome = inputCourseName.value;
    if (!id) return;
    
    const confirmed = await confirmModal({
      title: 'Eliminar Curso Técnico',
      message: `Tem a certeza de que deseja eliminar o curso "${nome}"?\nTodas as configurações associadas poderão ser afetadas.`,
      confirmText: 'Sim, Eliminar Curso',
      cancelText: 'Cancelar',
      danger: true
    });
    if (!confirmed) return;
    
    const oldText = btnDeleteCourse.innerHTML;
    btnDeleteCourse.innerHTML = '<div class="spinner spinner-light spinner-sm"></div>';
    btnDeleteCourse.disabled = true;
    
    try {
      const { error } = await sb.from('cursos').delete().eq('id', id);
      if (error) throw error;
      toast('Curso eliminado com sucesso!', 'info');
      closeManageCourseModal();
      await fetchAllCursos();
      renderCursosCards();
    } catch (err) {
      console.error(err);
      toast('Não foi possível apagar o curso (pode ter disciplinas associadas).', 'error');
    } finally {
      btnDeleteCourse.innerHTML = oldText;
      btnDeleteCourse.disabled = false;
    }
  });
}

// ==========================================
// MODAL: IMPORTAR DISCIPLINA EXISTENTE
// ==========================================
function openImportDisciplinaModal() {
  if (!modalImportDisciplina) return;
  if (formImportDisciplina) formImportDisciplina.reset();
  if (importDisciplinaAlert) {
    importDisciplinaAlert.style.display = 'none';
    importDisciplinaAlert.textContent = '';
  }
  
  if (importDiscSelect) {
    // Populate with unique disciplines (by name)
    const uniqueNames = new Set();
    const uniqueDisciplinas = [];
    allDisciplinasData.forEach(d => {
      if (!uniqueNames.has(d.nome)) {
        uniqueNames.add(d.nome);
        uniqueDisciplinas.push(d);
      }
    });
    
    uniqueDisciplinas.sort((a, b) => a.nome.localeCompare(b.nome));
    
    importDiscSelect.innerHTML = '<option value="" disabled selected>Selecione uma disciplina...</option>' + 
      uniqueDisciplinas.map(d => `<option value="${d.id}">${escapeHtml(d.nome)}</option>`).join('');
  }
  
  openM('modal-import-disciplina');
}

function closeImportDisciplinaModal() {
  closeM('modal-import-disciplina');
}

if (btnCloseImportDisciplinaModal) btnCloseImportDisciplinaModal.addEventListener('click', closeImportDisciplinaModal);
if (btnCancelImportDisciplina) btnCancelImportDisciplina.addEventListener('click', closeImportDisciplinaModal);

if (formImportDisciplina) {
  formImportDisciplina.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (importDisciplinaAlert) importDisciplinaAlert.style.display = 'none';
    
    if (!selectedCourseForView) {
      if (importDisciplinaAlert) {
        importDisciplinaAlert.style.display = 'block';
        importDisciplinaAlert.className = 'alert-box alert-error visible';
        importDisciplinaAlert.textContent = 'Erro: Nenhum curso selecionado.';
      }
      return;
    }
    
    const selectedId = importDiscSelect.value;
    if (!selectedId) return;
    
    const sourceDisc = allDisciplinasData.find(d => String(d.id) === String(selectedId));
    if (!sourceDisc) return;
    
    const submitBtn = formImportDisciplina.querySelector('button[type="submit"]');
    const oldText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner spinner-light spinner-sm"></div>';
    submitBtn.disabled = true;
    
    try {
      // Create clone object
      const cloneData = {
        nome: sourceDisc.nome,
        codigo: sourceDisc.codigo,
        curso: selectedCourseForView,
        classe: sourceDisc.classe,
        carga_horaria: sourceDisc.carga_horaria,
        descricao: sourceDisc.descricao
      };
      
      const { error } = await sb.from('disciplinas').insert([cloneData]);
      if (error) throw error;
      
      toast(`Disciplina "${sourceDisc.nome}" importada para ${selectedCourseForView}!`, 'success');
      await log('IMPORTAÇÃO DE DISCIPLINA', `Disciplina "${sourceDisc.nome}" vinculada ao curso ${selectedCourseForView}`);
      
      closeImportDisciplinaModal();
      await fetchAllDisciplinas();
    } catch (err) {
      console.error(err);
      if (importDisciplinaAlert) {
        importDisciplinaAlert.style.display = 'block';
        importDisciplinaAlert.className = 'alert-box alert-error visible';
        importDisciplinaAlert.textContent = 'Erro ao importar. Pode já existir uma com o mesmo nome para esta classe.';
      }
    } finally {
      submitBtn.innerHTML = oldText;
      submitBtn.disabled = false;
    }
  });
}

function openCreateDisciplinaModal() {
  if (!modalCreateDisciplina) return;
  if (formCreateDisciplina) formCreateDisciplina.reset();
  if (createDisciplinaAlert) {
    createDisciplinaAlert.style.display = 'none';
    createDisciplinaAlert.textContent = '';
  }
  
  if (selectedCourseForView && document.getElementById('create-disc-curso')) {
    document.getElementById('create-disc-curso').value = selectedCourseForView;
  }
  
  populateTurmaTeacherSelects('create', {});
  openM('modal-create-disciplina');
  if (createDiscNome) createDiscNome.focus();
}

function closeCreateDisciplinaModal() {
  closeM('modal-create-disciplina');
}

async function handleCreateDisciplinaSubmit(e) {
  e.preventDefault();
  const nome = createDiscNome ? createDiscNome.value.trim() : '';
  const codigo = createDiscCodigo ? createDiscCodigo.value.trim().toUpperCase() : '';
  const carga = createDiscCarga ? parseInt(createDiscCarga.value, 10) : 4;
  const curso = createDiscCurso ? createDiscCurso.value : 'Informática';
  const classe = createDiscClasse ? createDiscClasse.value : '10ª';
  const descricao = createDiscDescricao ? createDiscDescricao.value.trim() : '';
  const professoresTurmas = getSelectedTurmaTeachers('create');

  if (!nome) {
    if (createDisciplinaAlert) {
      createDisciplinaAlert.style.display = 'block';
      createDisciplinaAlert.textContent = 'Indique o nome da disciplina / cadeira curricular.';
    }
    return;
  }

  try {
    const { data, error } = await sb.from('disciplinas').insert([{
      nome,
      codigo: codigo || nome.slice(0, 3).toUpperCase(),
      curso,
      classe,
      carga_horaria: carga || 4,
      descricao,
      professores_turmas: professoresTurmas
    }]).select();

    if (error) throw error;

    await syncTeachersProfiles(nome, professoresTurmas);

    toast(`Disciplina "${nome}" criada com sucesso!`, 'success');
    await log('CRIAÇÃO DE DISCIPLINA', `Nova disciplina registada: "${nome}" (${curso} - ${classe})`);
    closeCreateDisciplinaModal();
    await fetchAllDisciplinas();
    renderUsersTable();
  } catch (err) {
    console.error('Erro ao registar disciplina:', err);
    if (createDisciplinaAlert) {
      const msg = (err && err.code === '23505')
        ? 'Já existe uma disciplina com este nome para o mesmo curso e classe.'
        : `Erro ao salvar: ${err.message || 'Falha no banco de dados.'}`;
      createDisciplinaAlert.style.display = 'block';
      createDisciplinaAlert.textContent = msg;
    }
  }
}

function openEditDisciplinaModal(id) {
  const disc = allDisciplinasData.find(d => String(d.id) === String(id));
  if (!disc || !modalEditDisciplina) return;

  if (editDisciplinaAlert) {
    editDisciplinaAlert.style.display = 'none';
    editDisciplinaAlert.textContent = '';
  }

  if (editDiscId) editDiscId.value = disc.id;
  if (editDiscNome) editDiscNome.value = disc.nome || '';
  if (editDiscCodigo) editDiscCodigo.value = disc.codigo || '';
  if (editDiscCarga) editDiscCarga.value = String(disc.carga_horaria || 4).replace(/h\s*\/\s*semana/gi, '').trim();
  if (editDiscCurso) editDiscCurso.value = disc.curso || 'Informática';
  if (editDiscClasse) editDiscClasse.value = disc.classe || '10ª';
  if (editDiscDescricao) editDiscDescricao.value = disc.descricao || '';

  let currentTurmaMap = {};
  if (disc.professores_turmas) {
    if (typeof disc.professores_turmas === 'object') currentTurmaMap = disc.professores_turmas;
    else if (typeof disc.professores_turmas === 'string') {
      try { currentTurmaMap = JSON.parse(disc.professores_turmas); } catch(e) {}
    }
  }
  populateTurmaTeacherSelects('edit', currentTurmaMap);

  openM('modal-edit-disciplina');
  if (editDiscNome) editDiscNome.focus();
}

function closeEditDisciplinaModal() {
  closeM('modal-edit-disciplina');
}

async function handleEditDisciplinaSubmit(e) {
  e.preventDefault();
  const id = editDiscId ? editDiscId.value : null;
  const nome = editDiscNome ? editDiscNome.value.trim() : '';
  const codigo = editDiscCodigo ? editDiscCodigo.value.trim().toUpperCase() : '';
  const carga = editDiscCarga ? parseInt(editDiscCarga.value, 10) : 4;
  const curso = editDiscCurso ? editDiscCurso.value : 'Informática';
  const classe = editDiscClasse ? editDiscClasse.value : '10ª';
  const descricao = editDiscDescricao ? editDiscDescricao.value.trim() : '';
  const professoresTurmas = getSelectedTurmaTeachers('edit');

  if (!id || !nome) {
    if (editDisciplinaAlert) {
      editDisciplinaAlert.style.display = 'block';
      editDisciplinaAlert.textContent = 'O nome da disciplina é obrigatório.';
    }
    return;
  }

  try {
    const { error } = await sb.from('disciplinas').update({
      nome,
      codigo,
      carga_horaria: carga,
      curso,
      classe,
      descricao,
      professores_turmas: professoresTurmas
    }).eq('id', id);

    if (error) throw error;

    await syncTeachersProfiles(nome, professoresTurmas);

    toast(`Disciplina "${nome}" actualizada com sucesso!`, 'success');
    await log('EDIÇÃO DE DISCIPLINA', `Disciplina actualizada: "${nome}" (${curso} - ${classe})`);
    closeEditDisciplinaModal();
    await fetchAllDisciplinas();
    renderUsersTable();
  } catch (err) {
    console.error('Erro ao actualizar disciplina:', err);
    if (editDisciplinaAlert) {
      editDisciplinaAlert.style.display = 'block';
      editDisciplinaAlert.textContent = `Erro ao salvar: ${err.message || 'Falha no banco de dados.'}`;
    }
  }
}

async function deleteDisciplina(id) {
  const disc = allDisciplinasData.find(d => String(d.id) === String(id));
  const discNome = disc ? disc.nome : 'esta disciplina';

  const confirmed = await confirmModal({
    title: 'Remover Disciplina Curricular',
    message: `Tem a certeza de que deseja remover a disciplina "${discNome}" do plano curricular?\nPastas de materiais e aulas podem ser afetadas.`,
    confirmText: 'Sim, Remover Disciplina',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) return;

  try {
    const { error } = await sb.from('disciplinas').delete().eq('id', id);
    if (error) throw error;

    toast(`Disciplina "${discNome}" removida com sucesso.`, 'info');
    await log('EXCLUSÃO DE DISCIPLINA', `Disciplina eliminada pelo administrador: "${discNome}"`);
    await fetchAllDisciplinas();
  } catch (err) {
    console.error('Erro ao excluir disciplina:', err);
    toast(`Erro ao excluir disciplina: ${err.message || 'Falha no banco de dados.'}`, 'error');
  }
}

// ------------------------------------------
// Atribuição de Professores por Turma (ex: Turma A tem um professor, Turma B outro)
// ------------------------------------------
function openAssignTurmasModal(disciplinaId) {
  const disc = allDisciplinasData.find(d => String(d.id) === String(disciplinaId));
  if (!disc || !modalDiscTurmas) return;

  if (discTurmasAlert) {
    discTurmasAlert.style.display = 'none';
    discTurmasAlert.textContent = '';
  }

  if (discTurmasDiscId) discTurmasDiscId.value = disc.id;
  if (discTurmasDiscNome) discTurmasDiscNome.textContent = disc.nome;
  if (discTurmasDiscCursoClasse) discTurmasDiscCursoClasse.textContent = `${disc.curso || 'Tronco Comum'} • ${disc.classe || 'Todas as Classes'}`;
  if (discTurmasDiscCodigo) discTurmasDiscCodigo.textContent = disc.codigo || '—';

  // Obter todos os professores registrados
  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');

  // Obter mapa atual de turmas
  let currentTurmaMap = {};
  if (disc.professores_turmas) {
    if (typeof disc.professores_turmas === 'object') {
      currentTurmaMap = disc.professores_turmas;
    } else if (typeof disc.professores_turmas === 'string') {
      try { currentTurmaMap = JSON.parse(disc.professores_turmas); } catch (e) {}
    }
  }

  // Lista de turmas oficiais da escola
  const turmasList = ['Turma A', 'Turma B', 'Turma C', 'Turma D'];

  if (discTurmasInputsContainer) {
    discTurmasInputsContainer.innerHTML = turmasList.map(turma => {
      const assignedProf = currentTurmaMap[turma];
      let assignedId = '';
      if (assignedProf) {
        assignedId = typeof assignedProf === 'object' ? assignedProf.id : String(assignedProf);
      }

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: var(--color-surface-base); border: 1px solid var(--color-border-subtle); border-radius: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 100px;">
            <span class="user-role-badge" style="background: rgba(0, 113, 227, 0.12); color: var(--color-accent); font-weight: 700; font-size: 12px; padding: 4px 10px;">
              ${escapeHtml(turma)}
            </span>
          </div>

          <div style="flex: 1;">
            <select class="form-select select-turma-prof" data-turma="${escapeHtml(turma)}" style="width: 100%; font-size: 13px;">
              <option value="">-- Sem professor atribuído --</option>
              ${teachers.map(t => {
                const isSelected = String(t.id) === String(assignedId);
                return `<option value="${escapeHtml(t.id)}" ${isSelected ? 'selected' : ''}>${escapeHtml(t.nome)} (${escapeHtml(t.email || '')})</option>`;
              }).join('')}
            </select>
          </div>
        </div>
      `;
    }).join('');
  }

  openM('modal-disciplina-turmas-professores');
}

function closeAssignTurmasModal() {
  closeM('modal-disciplina-turmas-professores');
}

async function handleAssignTurmasSubmit(e) {
  e.preventDefault();
  const discId = discTurmasDiscId ? discTurmasDiscId.value : null;
  if (!discId) return;

  const disc = allDisciplinasData.find(d => String(d.id) === String(discId));
  if (!disc) return;

  const selects = discTurmasInputsContainer ? discTurmasInputsContainer.querySelectorAll('.select-turma-prof') : [];
  const payload = {};
  const teachers = allProfilesData.filter(p => p.role === 'professor' || p.role === 'teacher');

  selects.forEach(sel => {
    const turma = sel.getAttribute('data-turma');
    const teacherId = sel.value;
    if (teacherId) {
      const teacherObj = teachers.find(t => String(t.id) === String(teacherId));
      payload[turma] = {
        id: teacherId,
        nome: teacherObj ? teacherObj.nome : 'Professor'
      };
    } else {
      payload[turma] = null;
    }
  });

  try {
    const { error } = await sb.from('disciplinas').update({
      professores_turmas: payload
    }).eq('id', discId);

    if (error) throw error;

    // Sincronização bidirecional: atualizar perfis dos professores
    for (const [turma, profData] of Object.entries(payload)) {
      if (profData && profData.id) {
        const teacherProfile = teachers.find(t => String(t.id) === String(profData.id));
        if (teacherProfile) {
          const discs = Array.isArray(teacherProfile.disciplinas) ? [...teacherProfile.disciplinas] : [];
          if (!discs.includes(disc.nome)) discs.push(disc.nome);

          const turmas = Array.isArray(teacherProfile.turmas) ? [...teacherProfile.turmas] : [];
          const cleanTurmaLetter = turma.replace(/^Turma\s*/i, '').trim();
          if (!turmas.includes(cleanTurmaLetter)) turmas.push(cleanTurmaLetter);

          // Atualizar profile
          await sb.from('profiles').update({
            disciplinas: discs,
            disciplina: discs[0] || null,
            turmas: turmas,
            turma: turmas[0] || null
          }).eq('id', profData.id);

          teacherProfile.disciplinas = discs;
          teacherProfile.turmas = turmas;
        }
      }
    }

    // Atualizar no array local allDisciplinasData
    disc.professores_turmas = payload;

    toast(`Professores atribuídos às turmas de "${disc.nome}" com sucesso!`, 'success');
    await log('LOTAÇÃO DA CADEIRA', `Actualizada atribuição de docentes por turma para: "${disc.nome}"`);

    closeAssignTurmasModal();
    updateDisciplinasMetrics();
    renderDisciplinasTable();
    renderUsersTable();
  } catch (err) {
    console.error('Erro ao guardar atribuição por turma:', err);
    if (discTurmasAlert) {
      discTurmasAlert.style.display = 'block';
      discTurmasAlert.textContent = `Erro ao salvar: ${err.message || 'Falha no banco de dados'}`;
    }
  }
}

// ------------------------------------------
// Lotação Docente (Atribuição de Cadeiras, Cursos, Classes e Turmas)
// ------------------------------------------
function openTeacherAssignmentModal(teacherId) {
  const teacher = allProfilesData.find(p => String(p.id) === String(teacherId));
  if (!teacher || !modalTeacherAssignment) return;

  activeAssignTeacher = teacher;

  if (assignTeacherId) assignTeacherId.value = teacher.id;
  if (assignTeacherAvatar) assignTeacherAvatar.textContent = initials(teacher.nome || 'P');
  if (assignTeacherName) assignTeacherName.textContent = teacher.nome || 'Professor';
  if (assignTeacherEmail) assignTeacherEmail.textContent = teacher.email || '—';

  if (teacherAssignmentAlert) {
    teacherAssignmentAlert.style.display = 'none';
    teacherAssignmentAlert.textContent = '';
  }

  const container = document.getElementById('assign-teacher-assignments-container');
  if (container) {
    container.innerHTML = '';
    if (teacher.atribuicoes_curriculares && Array.isArray(teacher.atribuicoes_curriculares) && teacher.atribuicoes_curriculares.length > 0) {
      teacher.atribuicoes_curriculares.forEach(atr => {
        addTeacherAssignmentBlock('assign-teacher-assignments-container', atr);
      });
    } else {
      // Backward compatibility se não houver atribuicoes_curriculares
      const teacherCursos = Array.isArray(teacher.cursos) ? teacher.cursos : (teacher.curso ? [teacher.curso] : []);
      const teacherDiscs = Array.isArray(teacher.disciplinas) ? teacher.disciplinas : (teacher.disciplina ? [teacher.disciplina] : []);
      const teacherClasses = Array.isArray(teacher.classes) ? teacher.classes : (teacher.classe ? [teacher.classe] : []);
      const teacherTurmas = Array.isArray(teacher.turmas) ? teacher.turmas : (teacher.turma ? [teacher.turma] : []);
      
      if (teacherDiscs.length > 0) {
        addTeacherAssignmentBlock('assign-teacher-assignments-container', {
          disciplina: teacherDiscs[0],
          curso: teacherCursos.length > 0 ? teacherCursos[0] : null,
          classe: teacherClasses.length > 0 ? teacherClasses[0] : null,
          turmas: teacherTurmas
        });
      } else {
         addTeacherAssignmentBlock('assign-teacher-assignments-container');
      }
    }
  }

  const assignSummaryText = document.getElementById('assign-summary-text');
  if (assignSummaryText) {
    assignSummaryText.textContent = `Podes adicionar múltiplas atribuições (turmas e turmas específicas) para este professor.`;
  }

  openM('modal-manage-teacher-assignment');
}

// Disponibilizar globalmente para clique rápido em badges de professor
window.openTeacherAssignmentModal = openTeacherAssignmentModal;

function closeTeacherAssignmentModal() {
  closeM('modal-manage-teacher-assignment');
  activeAssignTeacher = null;
}

function updateTeacherAssignmentSummary() {
  if (!assignSummaryText) return;
  const numCursos = assignTeacherCursosGrid ? assignTeacherCursosGrid.querySelectorAll('input:checked').length : 0;
  const numDiscs = assignTeacherDisciplinasGrid ? assignTeacherDisciplinasGrid.querySelectorAll('input:checked').length : 0;
  const numClasses = assignTeacherClassesGrid ? assignTeacherClassesGrid.querySelectorAll('input:checked').length : 0;
  const numTurmas = assignTeacherTurmasGrid ? assignTeacherTurmasGrid.querySelectorAll('input:checked').length : 0;

  assignSummaryText.textContent = `${numDiscs} disciplina(s) • ${numCursos} curso(s) • ${numClasses} classe(s) • ${numTurmas} turma(s) atribuídas`;
}

function setupTeacherAssignmentQuickButtons() {
  const toggleGrid = (grid, check) => {
    if (!grid) return;
    grid.querySelectorAll('.chip-checkbox-label').forEach(lbl => {
      const cb = lbl.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.checked = check;
        if (check) lbl.classList.add('is-selected');
        else lbl.classList.remove('is-selected');
      }
    });
    updateTeacherAssignmentSummary();
  };

  if (btnAssignAllCursos) btnAssignAllCursos.addEventListener('click', () => toggleGrid(assignTeacherCursosGrid, true));
  if (btnAssignClearCursos) btnAssignClearCursos.addEventListener('click', () => toggleGrid(assignTeacherCursosGrid, false));
  if (btnAssignAllDisciplinas) btnAssignAllDisciplinas.addEventListener('click', () => toggleGrid(assignTeacherDisciplinasGrid, true));
  if (btnAssignClearDisciplinas) btnAssignClearDisciplinas.addEventListener('click', () => toggleGrid(assignTeacherDisciplinasGrid, false));
  if (btnAssignAllClasses) btnAssignAllClasses.addEventListener('click', () => toggleGrid(assignTeacherClassesGrid, true));
  if (btnAssignAllTurmas) btnAssignAllTurmas.addEventListener('click', () => toggleGrid(assignTeacherTurmasGrid, true));
  if (btnAssignClearTurmas) btnAssignClearTurmas.addEventListener('click', () => toggleGrid(assignTeacherTurmasGrid, false));
}

async function handleTeacherAssignmentSubmit(e) {
  e.preventDefault();
  if (!activeAssignTeacher) return;

  const blocks = document.querySelectorAll('#assign-teacher-assignments-container .teacher-assignment-block');
  if (blocks.length === 0) {
    if (teacherAssignmentAlert) {
      teacherAssignmentAlert.style.display = 'block';
      teacherAssignmentAlert.textContent = 'Por favor, adicione pelo menos uma atribuição curricular para o professor.';
    }
    return;
  }
  
  let hasError = false;
  const disciplinasSet = new Set();
  const cursosSet = new Set();
  const classesSet = new Set();
  const turmasSet = new Set();
  const atribuicoesCurriculares = [];

  blocks.forEach(block => {
    const bDisciplina = block.querySelector('.assign-disciplina').value;
    const bCurso = block.querySelector('.assign-curso').value;
    const bClasse = block.querySelector('.assign-classe').value;
    const checkboxes = block.querySelectorAll('.assign-turma-checkbox:checked');
    
    if (!bDisciplina) {
      if (teacherAssignmentAlert) {
        teacherAssignmentAlert.style.display = 'block';
        teacherAssignmentAlert.textContent = 'Todas as atribuições devem ter uma disciplina selecionada.';
      }
      hasError = true;
      return;
    }
    if (checkboxes.length === 0) {
      if (teacherAssignmentAlert) {
        teacherAssignmentAlert.style.display = 'block';
        teacherAssignmentAlert.textContent = 'Por favor, selecione pelo menos uma turma em todas as atribuições.';
      }
      hasError = true;
      return;
    }
    
    const bTurmas = Array.from(checkboxes).map(cb => cb.value);
    atribuicoesCurriculares.push({ disciplina: bDisciplina, curso: bCurso, classe: bClasse, turmas: bTurmas });
    
    disciplinasSet.add(bDisciplina);
    cursosSet.add(bCurso);
    classesSet.add(bClasse);
    bTurmas.forEach(t => turmasSet.add(t));
  });
  
  if (hasError) return;

  const selectedCursos = Array.from(cursosSet);
  const selectedDiscs = Array.from(disciplinasSet);
  const selectedClasses = Array.from(classesSet);
  const selectedTurmas = Array.from(turmasSet);
  const teacherId = activeAssignTeacher.id;

  try {
    const updatePayload = {
      cursos: selectedCursos,
      curso: selectedCursos.length > 0 ? selectedCursos.join(', ') : null,
      disciplinas: selectedDiscs,
      disciplina: selectedDiscs.length > 0 ? selectedDiscs.join(', ') : null,
      classes: selectedClasses,
      classe: selectedClasses.length > 0 ? selectedClasses.join(', ') : null,
      turmas: selectedTurmas,
      turma: selectedTurmas.length > 0 ? selectedTurmas.join(', ') : null,
      atribuicoes_curriculares: atribuicoesCurriculares
    };

    let error = null;
    try {
      const result = await sb.from('profiles').update(updatePayload).eq('id', teacherId);
      error = result.error;
      if (error && error.message && error.message.includes('atribuicoes_curriculares')) {
        throw error;
      }
    } catch (e) {
      if (e.message && e.message.includes('atribuicoes_curriculares')) {
        console.warn("Coluna 'atribuicoes_curriculares' não existe. A guardar sem ela...");
        delete updatePayload.atribuicoes_curriculares;
        const retryResult = await sb.from('profiles').update(updatePayload).eq('id', teacherId);
        error = retryResult.error;
      } else {
        error = e;
      }
    }

    if (error) throw error;

    // Atualizar no array local allProfilesData
    const profIndex = allProfilesData.findIndex(p => String(p.id) === String(teacherId));
    if (profIndex !== -1) {
      allProfilesData[profIndex] = {
        ...allProfilesData[profIndex],
        ...updatePayload
      };
    }

    toast(`Lotação docente de "${activeAssignTeacher.nome}" actualizada com sucesso!`, 'success');
    await log('LOTAÇÃO DOCENTE', `Lotação configurada para ${activeAssignTeacher.nome}: ${selectedDiscs.length} disciplinas, ${selectedTurmas.length} turmas (${selectedCursos.join(', ') || 'Nenhum curso'})`);
    
    closeTeacherAssignmentModal();
    updateDisciplinasMetrics();
    renderDisciplinasTable();
    renderUsersTable();
  } catch (err) {
    console.error('Erro ao actualizar lotação docente:', err);
    if (teacherAssignmentAlert) {
      teacherAssignmentAlert.style.display = 'block';
      teacherAssignmentAlert.textContent = `Erro ao salvar atribuição: ${err.message || 'Falha no banco de dados'}`;
    }
  }
}

// ==========================================
// SECÇÃO 3: PAINEL DE SERVIÇOS (HEALTH CHECK PARALELO)
// ==========================================
async function runServicesHealthCheck() {
  if (healthCheckIcon) healthCheckIcon.style.animation = 'appleSpin 0.8s linear infinite';
  if (btnRunHealthCheck) btnRunHealthCheck.disabled = true;

  const now = new Date();
  if (lastHealthCheckTime) {
    lastHealthCheckTime.textContent = `Hoje às ${now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }

  // Execução paralela sem bloqueios em cadeia
  await Promise.allSettled([
    testApiService(),
    testStorageService(),
    testAuthService(),
    testDatabaseService()
  ]);

  if (healthCheckIcon) healthCheckIcon.style.animation = 'none';
  if (btnRunHealthCheck) btnRunHealthCheck.disabled = false;
}

async function testApiService() {
  const t0 = performance.now();
  try {
    const { error } = await sb.from('profiles').select('id', { count: 'exact', head: true });
    const duration = Math.round(performance.now() - t0);
    setServiceStatus('api', !error, `${duration} ms`);
  } catch (err) {
    setServiceStatus('api', false, 'Erro de ligação');
  }
}

async function testStorageService() {
  const t0 = performance.now();
  try {
    // Correção: Avaliação estrita sem '!error || true'
    const { data, error } = await sb.storage.getBucket('policloud');
    const duration = Math.round(performance.now() - t0);
    const isOk = !error && !!data;
    setServiceStatus('storage', isOk, isOk ? `Bucket Activo (${duration} ms)` : 'Erro no Bucket');
  } catch (err) {
    setServiceStatus('storage', false, 'Indisponível');
  }
}

async function testAuthService() {
  try {
    const { data: { session }, error } = await sb.auth.getSession();
    setServiceStatus('auth', !error && !!session, session ? 'Sessão Activa' : 'Sem Sessão');
  } catch (err) {
    setServiceStatus('auth', false, 'Erro Auth');
  }
}

async function testDatabaseService() {
  const t0 = performance.now();
  try {
    const { error } = await sb.from('files').select('id', { count: 'exact', head: true });
    const duration = Math.round(performance.now() - t0);
    setServiceStatus('db', !error, `${duration} ms`);
  } catch (err) {
    setServiceStatus('db', false, 'Erro PostgreSQL');
  }
}

function setServiceStatus(serviceKey, isOnline, metaText) {
  const badgeEl = document.getElementById(`badge-service-${serviceKey}`);
  const textEl = document.getElementById(`text-service-${serviceKey}`);
  const latencyEl = document.getElementById(`latency-service-${serviceKey}`);

  if (badgeEl) {
    badgeEl.className = `status-pill ${isOnline ? 'status-pill-active' : 'status-pill-inactive'}`;
  }
  if (textEl) textEl.textContent = isOnline ? 'Online' : 'Offline';
  if (latencyEl) {
    latencyEl.textContent = metaText;
    latencyEl.style.color = isOnline ? 'var(--color-text-primary)' : 'var(--color-danger)';
  }
}

// ==========================================
// SECÇÃO 4: ARMAZENAMENTO
// ==========================================
async function fetchStorageAggregation() {
  const DEFAULT_DEMO_FILES = [
    { size: 1845000, curso: 'Informática', turma: 'A' },
    { size: 2150000, curso: 'Informática', turma: 'A' },
    { size: 3420000, curso: 'Informática', turma: 'B' },
    { size: 950000, curso: 'Informática', turma: 'B' },
    { size: 4200000, curso: 'Electricidade', turma: 'A' },
    { size: 3100000, curso: 'Mecânica', turma: 'C' },
    { size: 1900000, curso: 'Química', turma: 'A' },
    { size: 8900000, curso: 'Geral', turma: null }
  ];

  if (isConfigPlaceholder()) {
    allFilesData = DEFAULT_DEMO_FILES;
    renderStorageOverview();
    return;
  }

  try {
    const { data, error } = await sb
      .from('files')
      .select('id, name, size, curso, turma');

    if (error) throw error;
    allFilesData = data && data.length > 0 ? data : DEFAULT_DEMO_FILES;
  } catch (err) {
    console.error('Erro ao consultar ficheiros para cálculo de storage:', err);
    allFilesData = DEFAULT_DEMO_FILES;
  }

  renderStorageOverview();
}

function renderStorageOverview() {
  let totalUsedBytes = 0;
  const courseBytesMap = { 'Informática': 0, 'Electricidade': 0, 'Mecânica': 0, 'Química': 0, 'Geral': 0 };
  const classMap = new Map();

  allFilesData.forEach(file => {
    const size = Number(file.size) || 0;
    totalUsedBytes += size;

    const curso = file.curso || 'Geral';
    if (courseBytesMap[curso] !== undefined) {
      courseBytesMap[curso] += size;
    } else {
      courseBytesMap['Geral'] += size;
    }

    const turmaKey = file.turma || 'Geral';
    if (!classMap.has(turmaKey)) {
      classMap.set(turmaKey, { turma: turmaKey, curso: curso, filesCount: 0, bytes: 0 });
    }
    const item = classMap.get(turmaKey);
    item.filesCount += 1;
    item.bytes += size;
  });

  const quotaTotalBytes = 5 * 1024 * 1024 * 1024; // 5 GB
  const totalPct = Math.min(100, ((totalUsedBytes / quotaTotalBytes) * 100).toFixed(1));

  if (storageTotalDisplay) {
    storageTotalDisplay.textContent = `${formatBytes(totalUsedBytes)} de 5.0 GB Usados (${totalPct}%)`;
  }

  if (storageProgressFill) {
    storageProgressFill.style.width = `${totalPct}%`;
  }

  if (storageCoursesBreakdown) {
    storageCoursesBreakdown.innerHTML = Object.entries(courseBytesMap).map(([curso, bytes]) => {
      const pct = totalUsedBytes > 0 ? Math.round((bytes / totalUsedBytes) * 100) : 0;
      return `
        <div class="quick-action-card" style="padding: 14px 18px; border-radius: var(--radius-control); background: var(--color-surface-secondary); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <strong style="font-size: 14px; color: var(--color-text-primary); display: block;">${escapeHtml(curso)}</strong>
            <span style="font-size: 12px; color: var(--color-text-secondary);">${formatBytes(bytes)}</span>
          </div>
          <span class="status-pill status-pill-active">${pct}%</span>
        </div>
      `;
    }).join('');
  }

  if (storageClassesTableBody) {
    const classList = Array.from(classMap.values());
    classList.sort((a, b) => b.bytes - a.bytes);

    storageClassesTableBody.innerHTML = classList.map(item => {
      const pct = totalUsedBytes > 0 ? ((item.bytes / totalUsedBytes) * 100).toFixed(1) : '0.0';
      const docLabel = item.filesCount === 1 ? '1 documento' : `${item.filesCount} documentos`;
      return `
        <tr>
          <td><strong style="font-size: 13.5px; color: var(--color-text-primary);">${escapeHtml(item.turma)}</strong></td>
          <td><span style="font-size: 13px; color: var(--color-text-secondary);">${escapeHtml(item.curso)}</span></td>
          <td><span style="font-weight: 600; color: var(--color-accent);">${docLabel}</span></td>
          <td><span style="font-weight: 700; color: var(--color-text-primary);">${formatBytes(item.bytes)}</span></td>
          <td><span class="status-pill status-pill-active">${pct}%</span></td>
        </tr>
      `;
    }).join('');
  }
}

// ==========================================
// SECÇÃO 5: LOGS DE ACTIVIDADE
// ==========================================
async function fetchAllLogs() {
  if (isConfigPlaceholder()) {
    allLogsData = getLocalLogs();
    renderLogsTable();
    return;
  }

  try {
    const { data, error } = await sb
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      allLogsData = getLocalLogs();
    } else {
      allLogsData = data && data.length > 0 ? data : getLocalLogs();
    }
  } catch (err) {
    allLogsData = getLocalLogs();
  }

  renderLogsTable();
}

function renderLogsTable() {
  if (!logsTableBody) return;

  const selAction = filterLogAction ? filterLogAction.value : 'todas';
  const searchTerm = (filterLogSearch ? filterLogSearch.value : '').trim().toLowerCase();

  const filtered = allLogsData.filter(log => {
    if (selAction !== 'todas' && log.action_type !== selAction && log.action !== selAction) return false;
    if (searchTerm) {
      const details = (log.details || log.action || '').toLowerCase();
      const user = (log.user_name || '').toLowerCase();
      if (!details.includes(searchTerm) && !user.includes(searchTerm)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    logsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="table-cell-centered" style="color: var(--color-text-secondary);">
          Nenhum registo de actividade coincide com a pesquisa seleccionada.
        </td>
      </tr>
    `;
    return;
  }

  logsTableBody.innerHTML = filtered.map(log => {
    let tagClass = 'log-tag-create';
    const actionText = log.action_type || log.action || 'Operação';
    if (actionText.includes('Alteração') || actionText.includes('desactivar')) tagClass = 'log-tag-update';
    if (actionText.includes('Eliminação')) tagClass = 'log-tag-delete';

    return `
      <tr>
        <td style="white-space: nowrap; color: var(--color-text-secondary); font-size: 12.5px;">${formatDateTime(log.created_at)}</td>
        <td>
          <strong style="color: var(--color-text-primary); font-size: 13px;">${escapeHtml(log.user_name || 'Sistema')}</strong>
        </td>
        <td><span class="log-action-tag ${tagClass}">${escapeHtml(actionText)}</span></td>
        <td><span style="color: var(--color-text-primary); font-size: 13px;">${escapeHtml(log.details || log.entity_type || '—')}</span></td>
      </tr>
    `;
  }).join('');
}

function setupSidebarUserInfo(profile) {
  if (sidebarUserName) sidebarUserName.textContent = profile.nome || 'Administrador';
  if (sidebarUserRole) sidebarUserRole.textContent = 'Perfil: Administrador';
  if (sidebarUserAvatar) {
    sidebarUserAvatar.textContent = (profile.nome || 'A').trim()[0].toUpperCase();
  }
}

// ==========================================
// INICIALIZAÇÃO DA PÁGINA ADMIN
// ==========================================
async function initAdminPage() {
  initSidebar();
  mouseTrack();

  const profile = await requireAuth(['admin']);
  if (!profile) return;

  currentProfile = profile;
  currentUser = profile;

  setupSidebarUserInfo(currentProfile);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }

  allProfilesData = [];
  try { localStorage.removeItem('policloud_admin_users'); } catch (e) {}
  populateAdminSelects();
  setupSectionNavigation();

  if (mobileMenuBtn && appSidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('mobile-open');
    });
  }

  [filterUserRole, filterUserCurso, filterUserTurma, filterUserStatus].forEach(el => {
    if (el) el.addEventListener('change', () => {
      usersCurrentPage = 1;
      renderUsersTable();
    });
  });

  if (filterUserSearch) {
    filterUserSearch.addEventListener('input', () => {
      usersCurrentPage = 1;
      renderUsersTable();
    });
  }

  if (btnResetUserFilters) {
    btnResetUserFilters.addEventListener('click', () => {
      if (filterUserRole) filterUserRole.value = 'todos';
      if (filterUserCurso) filterUserCurso.value = 'todos';
      if (filterUserTurma) filterUserTurma.value = 'todas';
      if (filterUserStatus) filterUserStatus.value = 'todos';
      if (filterUserSearch) filterUserSearch.value = '';
      usersCurrentPage = 1;
      renderUsersTable();
    });
  }

  if (btnUsersPrevPage) {
    btnUsersPrevPage.addEventListener('click', () => {
      if (usersCurrentPage > 1) {
        usersCurrentPage--;
        renderUsersTable();
      }
    });
  }

  if (btnUsersNextPage) {
    btnUsersNextPage.addEventListener('click', () => {
      usersCurrentPage++;
      renderUsersTable();
    });
  }

  if (btnOpenCreateUserTop) btnOpenCreateUserTop.addEventListener('click', openCreateUserModal);
  if (btnOpenCreateUserModal) btnOpenCreateUserModal.addEventListener('click', openCreateUserModal);
  if (btnCloseCreateUserModal) btnCloseCreateUserModal.addEventListener('click', closeCreateUserModal);
  if (btnCancelCreateUser) btnCancelCreateUser.addEventListener('click', closeCreateUserModal);
  
  const btnAddTeacherAssignment = document.getElementById('btn-add-teacher-assignment');
  if (btnAddTeacherAssignment) btnAddTeacherAssignment.addEventListener('click', () => addTeacherAssignmentBlock('teacher-assignments-container'));
  
  const btnAddEditTeacherAssignment = document.getElementById('btn-add-edit-teacher-assignment');
  if (btnAddEditTeacherAssignment) btnAddEditTeacherAssignment.addEventListener('click', () => addTeacherAssignmentBlock('edit-teacher-assignments-container'));

  const btnAddAssignTeacherAssignment = document.getElementById('btn-add-assign-teacher-assignment');
  if (btnAddAssignTeacherAssignment) btnAddAssignTeacherAssignment.addEventListener('click', () => addTeacherAssignmentBlock('assign-teacher-assignments-container'));

  if (btnCloseEditUserModal) btnCloseEditUserModal.addEventListener('click', closeEditUserModal);
  if (btnCancelEditUser) btnCancelEditUser.addEventListener('click', closeEditUserModal);
  if (formEditUser) formEditUser.addEventListener('submit', handleEditUserSubmit);

  if (tabBtnAluno) tabBtnAluno.addEventListener('click', () => selectUserTypeTab('aluno'));
  if (tabBtnProfessor) tabBtnProfessor.addEventListener('click', () => selectUserTypeTab('professor'));

  // Quick action buttons para fichas do Professor (Criação)
  if (btnSelectAllDisciplinas) btnSelectAllDisciplinas.addEventListener('click', () => setAllChips(teacherDisciplinasGrid, true));
  if (btnClearDisciplinas) btnClearDisciplinas.addEventListener('click', () => setAllChips(teacherDisciplinasGrid, false));
  if (btnSelectAllCursos) btnSelectAllCursos.addEventListener('click', () => setAllChips(teacherCursosGrid, true));
  if (btnClearCursos) btnClearCursos.addEventListener('click', () => setAllChips(teacherCursosGrid, false));
  if (btnSelectAllClasses) btnSelectAllClasses.addEventListener('click', () => setAllChips(teacherClassesGrid, true));
  if (btnSelectAllTurmas) btnSelectAllTurmas.addEventListener('click', () => setAllChips(teacherTurmasGrid, true));

  // Quick action buttons para fichas do Professor (Edição)
  if (btnEditSelectAllDisciplinas) btnEditSelectAllDisciplinas.addEventListener('click', () => setAllChips(editTeacherDisciplinasGrid, true));
  if (btnEditClearDisciplinas) btnEditClearDisciplinas.addEventListener('click', () => setAllChips(editTeacherDisciplinasGrid, false));
  if (btnEditSelectAllCursos) btnEditSelectAllCursos.addEventListener('click', () => setAllChips(editTeacherCursosGrid, true));
  if (btnEditClearCursos) btnEditClearCursos.addEventListener('click', () => setAllChips(editTeacherCursosGrid, false));
  if (btnEditSelectAllClasses) btnEditSelectAllClasses.addEventListener('click', () => setAllChips(editTeacherClassesGrid, true));
  if (btnEditSelectAllTurmas) btnEditSelectAllTurmas.addEventListener('click', () => setAllChips(editTeacherTurmasGrid, true));

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', handleCreateUserSubmit);
  }

  if (modalCreateUser) {
    modalCreateUser.addEventListener('click', (e) => {
      if (e.target === modalCreateUser) closeCreateUserModal();
    });
  }

  if (modalEditUser) {
    modalEditUser.addEventListener('click', (e) => {
      if (e.target === modalEditUser) closeEditUserModal();
    });
  }

  // Gestão de Disciplinas & Cadeiras (Filtros e Paginação)
  if (filterDisciplinaCurso) filterDisciplinaCurso.addEventListener('change', () => { disciplinasCurrentPage = 1; renderDisciplinasTable(); });
  if (filterDisciplinaClasse) filterDisciplinaClasse.addEventListener('change', () => { disciplinasCurrentPage = 1; renderDisciplinasTable(); });
  if (filterDisciplinaSearch) filterDisciplinaSearch.addEventListener('input', () => { disciplinasCurrentPage = 1; renderDisciplinasTable(); });
  if (btnResetDisciplinaFilters) {
    btnResetDisciplinaFilters.addEventListener('click', () => {
      if (filterDisciplinaCurso) filterDisciplinaCurso.value = 'todos';
      if (filterDisciplinaClasse) filterDisciplinaClasse.value = 'todas';
      if (filterDisciplinaSearch) filterDisciplinaSearch.value = '';
      disciplinasCurrentPage = 1;
      renderDisciplinasTable();
    });
  }
  if (btnDisciplinasPrevPage) {
    btnDisciplinasPrevPage.addEventListener('click', () => {
      if (disciplinasCurrentPage > 1) {
        disciplinasCurrentPage--;
        renderDisciplinasTable();
      }
    });
  }
  if (btnDisciplinasNextPage) {
    btnDisciplinasNextPage.addEventListener('click', () => {
      disciplinasCurrentPage++;
      renderDisciplinasTable();
    });
  }

  // Modais de Disciplina
  if (btnOpenImportDisciplinaModal) btnOpenImportDisciplinaModal.addEventListener('click', openImportDisciplinaModal);
  if (btnOpenCreateDisciplinaModal) btnOpenCreateDisciplinaModal.addEventListener('click', openCreateDisciplinaModal);
  if (btnCloseCreateDisciplinaModal) btnCloseCreateDisciplinaModal.addEventListener('click', closeCreateDisciplinaModal);
  if (btnCancelCreateDisciplina) btnCancelCreateDisciplina.addEventListener('click', closeCreateDisciplinaModal);
  if (formCreateDisciplina) formCreateDisciplina.addEventListener('submit', handleCreateDisciplinaSubmit);
  if (modalCreateDisciplina) {
    modalCreateDisciplina.addEventListener('click', (e) => {
      if (e.target === modalCreateDisciplina) closeCreateDisciplinaModal();
    });
  }

  if (btnCloseEditDisciplinaModal) btnCloseEditDisciplinaModal.addEventListener('click', closeEditDisciplinaModal);
  if (btnCancelEditDisciplina) btnCancelEditDisciplina.addEventListener('click', closeEditDisciplinaModal);
  if (formEditDisciplina) formEditDisciplina.addEventListener('submit', handleEditDisciplinaSubmit);
  if (modalEditDisciplina) {
    modalEditDisciplina.addEventListener('click', (e) => {
      if (e.target === modalEditDisciplina) closeEditDisciplinaModal();
    });
  }

  // Modal Lotação Docente Geral
  if (btnCloseTeacherAssignmentModal) btnCloseTeacherAssignmentModal.addEventListener('click', closeTeacherAssignmentModal);
  if (btnCancelTeacherAssignment) btnCancelTeacherAssignment.addEventListener('click', closeTeacherAssignmentModal);
  if (formTeacherAssignment) formTeacherAssignment.addEventListener('submit', handleTeacherAssignmentSubmit);
  if (modalTeacherAssignment) {
    modalTeacherAssignment.addEventListener('click', (e) => {
      if (e.target === modalTeacherAssignment) closeTeacherAssignmentModal();
    });
  }
  setupTeacherAssignmentQuickButtons();

  // Modal Atribuição de Professores por Turma para Cadeira
  if (btnCloseDiscTurmasModal) btnCloseDiscTurmasModal.addEventListener('click', closeAssignTurmasModal);
  if (btnCancelDiscTurmas) btnCancelDiscTurmas.addEventListener('click', closeAssignTurmasModal);
  if (formDiscTurmasProfessores) formDiscTurmasProfessores.addEventListener('submit', handleAssignTurmasSubmit);
  if (modalDiscTurmas) {
    modalDiscTurmas.addEventListener('click', (e) => {
      if (e.target === modalDiscTurmas) closeAssignTurmasModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalCreateUser && modalCreateUser.classList.contains('open')) closeCreateUserModal();
      if (modalEditUser && modalEditUser.classList.contains('open')) closeEditUserModal();
      if (modalCreateDisciplina && modalCreateDisciplina.classList.contains('open')) closeCreateDisciplinaModal();
      if (modalEditDisciplina && modalEditDisciplina.classList.contains('open')) closeEditDisciplinaModal();
      if (modalTeacherAssignment && modalTeacherAssignment.classList.contains('open')) closeTeacherAssignmentModal();
      if (modalDiscTurmas && modalDiscTurmas.classList.contains('open')) closeAssignTurmasModal();
    }
  });

  document.addEventListener('keydown', handleModalFocusTrap);

  if (btnRunHealthCheck) {
    btnRunHealthCheck.addEventListener('click', runServicesHealthCheck);
  }

  if (filterLogAction) filterLogAction.addEventListener('change', renderLogsTable);
  if (filterLogSearch) filterLogSearch.addEventListener('input', renderLogsTable);
  if (btnRefreshLogs) btnRefreshLogs.addEventListener('click', fetchAllLogs);

  try {
    await Promise.allSettled([
      fetchAllProfiles(),
      fetchRecentNews(),
      fetchStorageAggregation(),
      fetchAllLogs(),
      fetchAllCursos(),
      fetchAllDisciplinas()
    ]);
    updateDisciplinasMetrics();
    renderCursosCards();
    renderDisciplinasTable();
  } catch (err) {
    console.error('Erro ao carregar dados do painel de administração:', err);
  } finally {
    if (sessionOverlay) {
      sessionOverlay.classList.add('fade-out');
      setTimeout(() => {
        sessionOverlay.style.display = 'none';
      }, 300);
    }
  }
}

// Timeout de segurança para nunca travar no ecrã de validação
setTimeout(() => {
  if (sessionOverlay && sessionOverlay.style.display !== 'none') {
    sessionOverlay.classList.add('fade-out');
    setTimeout(() => { sessionOverlay.style.display = 'none'; }, 200);
  }
}, 3000);

// Execução imediata sem depender exclusivamente do DOMContentLoaded tardio
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminPage);
} else {
  initAdminPage();
}

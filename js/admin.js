// PoliCloud - Intranet Escolar IPPLN
// Painel Administrativo (admin.html) - Exclusivo para role = 'admin'

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
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
const btnSubmitCreateUser = document.getElementById('btn-submit-create-user');
const btnSubmitUserText = document.getElementById('btn-submit-user-text');

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

// Estado da Aplicação e Focus Trap
let currentProfile = null;
let currentUser = null;
let selectedUserType = 'aluno';
let allProfilesData = [];
let allFilesData = [];
let allNewsData = [];
let allLogsData = [];
let lastFocusedElement = null;

// Fallback Demo Users
const DEFAULT_DEMO_USERS = [
  { id: 'usr-admin-1', nome: 'Gabinete de Administração e Sistemas', email: 'admin.sistemas@ippln.ao', role: 'admin', curso: null, classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-1', nome: 'Prof. Manuel Gonçalves', email: 'manuel.goncalves@ippln.ao', role: 'professor', curso: 'Informática', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-2', nome: 'Prof. Maria Esperança', email: 'maria.esperanca@ippln.ao', role: 'professor', curso: 'Informática', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 22 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-prof-3', nome: 'Prof. António Silva', email: 'antonio.silva@ippln.ao', role: 'professor', curso: 'Electricidade', classe: null, turma: null, is_active: true, created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-1', nome: 'Pedro Muindi', email: 'pedro.muindi@aluno.ippln.ao', role: 'aluno', curso: 'Informática', classe: '12ª', turma: 'INF-12A', is_active: true, created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-2', nome: 'Teresa Chipalanga', email: 'teresa.chipalanga@aluno.ippln.ao', role: 'aluno', curso: 'Informática', classe: '12ª', turma: 'INF-12A', is_active: true, created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-3', nome: 'João Baptista Ndala', email: 'joao.ndala@aluno.ippln.ao', role: 'aluno', curso: 'Electricidade', classe: '11ª', turma: 'ELE-11A', is_active: true, created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
  { id: 'usr-aluno-4', nome: 'Marta dos Santos', email: 'marta.santos@aluno.ippln.ao', role: 'aluno', curso: 'Mecânica', classe: '12ª', turma: 'MEC-12A', is_active: false, created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() }
];

const DEFAULT_DEMO_LOGS = [
  { id: 'log-1', user_name: 'Gabinete de Administração', user_role: 'admin', action_type: 'Criação de Conta', details: 'Criou a conta de aluno para Pedro Muindi (Turma INF-12A)', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 'log-2', user_name: 'Prof. Manuel Gonçalves', user_role: 'professor', action_type: 'Upload de Ficheiro', details: 'Enviou Guiao_Laboratorio_VLANs_Roteamento.pdf (v2) para a turma INF-12A', created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 'log-3', user_name: 'Gabinete de Administração', user_role: 'admin', action_type: 'Alteração de Estado', details: 'Desactivou temporariamente a conta de Marta dos Santos (MEC-12A)', created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString() },
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

function populateAdminSelects() {
  if (filterUserCurso) {
    filterUserCurso.innerHTML = `<option value="todos">Todos os Cursos</option>` + CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  if (inputUserCurso) {
    inputUserCurso.innerHTML = CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }
  if (inputUserClasse) {
    inputUserClasse.innerHTML = CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('');
  }
  const generatedTurmas = [];
  CLASSES.forEach(c => {
    TURMAS.forEach(t => {
      generatedTurmas.push(`${c.replace('ª', '')}-${t}`);
    });
  });
  if (filterUserTurma) {
    filterUserTurma.innerHTML = `<option value="todas">Todas as Turmas</option>` + generatedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('');
  }
  if (inputUserTurma) {
    inputUserTurma.innerHTML = generatedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('');
  }
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
    if (hash && ['usuarios', 'noticias', 'servicos', 'storage', 'logs'].includes(hash)) {
      switchSection(hash);
    }
  });

  const currentHash = window.location.hash.replace('#', '');
  if (currentHash && ['usuarios', 'noticias', 'servicos', 'storage', 'logs'].includes(currentHash)) {
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
  if (isConfigPlaceholder()) {
    allProfilesData = getLocalUsers();
    renderUsersTable();
    updateGlobalStats();
    return;
  }

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allProfilesData = data || [];
  } catch (err) {
    console.error('Erro ao consultar profiles:', err);
    allProfilesData = getLocalUsers();
  }

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
    if (selCurso !== 'todos' && u.curso !== selCurso) return false;
    if (selTurma !== 'todas' && u.turma !== selTurma) return false;
    if (selStatus === 'activo' && u.is_active === false) return false;
    if (selStatus === 'inactivo' && u.is_active !== false) return false;

    if (searchTerm) {
      const name = (u.nome || u.full_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      if (!name.includes(searchTerm) && !email.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });

  if (usersFilterText) {
    usersFilterText.textContent = `${filtered.length} ${filtered.length === 1 ? 'utilizador encontrado' : 'utilizadores encontrados'}`;
  }

  if (filtered.length === 0) {
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

  usersTableBody.innerHTML = filtered.map(user => {
    const isActivo = user.is_active !== false;
    const displayName = user.nome || user.full_name || 'Sem Nome';
    const initial = displayName.trim()[0].toUpperCase();
    const roleKey = user.role || '';
    const roleBadgeClass = roleKey === 'admin' ? 'role-badge-admin' : (roleKey === 'teacher' ? 'role-badge-professor' : 'role-badge-aluno');
    const roleLabel = roleKey === 'admin' ? 'Administrador' : (roleKey === 'teacher' ? 'Professor' : 'Estudante');
    const cursoInfo = user.curso ? `${escapeHtml(user.curso)} ${user.classe ? `• ${escapeHtml(user.classe)}` : ''}` : 'Geral / Corpo Directivo';
    const turmaInfo = user.turma ? escapeHtml(user.turma) : '—';

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
          <span style="font-size: 13px; color: var(--color-text-primary);">${cursoInfo}</span>
        </td>
        <td>
          <span style="font-weight: 600; font-size: 13px; color: var(--color-accent);">${turmaInfo}</span>
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
          ${user.role !== 'admin' ? `
            <button
              type="button"
              class="btn-secondary"
              style="padding: 6px 14px; font-size: 13px; min-height: 36px;"
              data-action="toggle-status"
              data-user-id="${user.id}"
              data-user-name="${escapeHtml(displayName)}"
              data-current-status="${isActivo}"
              title="${isActivo ? 'Desactivar conta' : 'Reactivar conta'}"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
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
          ` : `
            <span style="font-size: 11px; color: var(--color-text-secondary); font-style: italic;">Protegido</span>
          `}
        </td>
      </tr>
    `;
  }).join('');

  usersTableBody.querySelectorAll('button[data-action="toggle-status"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = btn.getAttribute('data-user-id');
      const userName = btn.getAttribute('data-user-name');
      const currentStatus = btn.getAttribute('data-current-status') === 'true';
      handleToggleUserStatus(userId, userName, currentStatus);
    });
  });
}

async function handleToggleUserStatus(userId, userName, currentStatus) {
  const novoEstado = !currentStatus;
  const actionText = novoEstado ? 'reactivar' : 'desactivar';
  const confirmMsg = `Tem a certeza de que deseja ${actionText} a conta do utilizador "${userName}"?`;

  if (!window.confirm(confirmMsg)) return;

  const btn = usersTableBody.querySelector(`button[data-user-id="${userId}"]`);
  let originalHtml = '';
  if (btn) {
    originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner spinner-light" style="width: 12px; height: 12px; border-width: 2px;"></div> <span>A processar...</span>`;
  }

  try {
    const { error: updateError } = await sb
      .from('profiles')
      .update({ is_active: novoEstado })
      .eq('id', userId);

    if (updateError) throw updateError;

    toast(`Conta ${novoEstado ? 'reactivada' : 'desactivada'} com sucesso.`, 'success');
    await log(novoEstado ? 'reactivar_conta' : 'desactivar_conta', 'profiles', userId, currentProfile?.nome || '');

    await fetchAllProfiles();
    await fetchAllLogs();
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
function openCreateUserModal() {
  lastFocusedElement = document.activeElement;
  hideCreateUserAlert();
  if (formCreateUser) formCreateUser.reset();
  selectUserTypeTab('aluno');

  if (modalCreateUser) {
    modalCreateUser.classList.add('is-open');
    modalCreateUser.classList.add('open');
    modalCreateUser.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  setTimeout(() => {
    if (inputUserNome) inputUserNome.focus();
  }, 60);
}

function closeCreateUserModal() {
  if (modalCreateUser) {
    modalCreateUser.classList.remove('is-open');
    modalCreateUser.classList.remove('open');
    modalCreateUser.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
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
    if (btnSubmitUserText) btnSubmitUserText.textContent = 'Criar Conta de Aluno';
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
    if (btnSubmitUserText) btnSubmitUserText.textContent = 'Criar Conta de Professor';
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

  let adminSession = null;

  try {
    // PASSO 1 — Guarda a sessão actual do admin
    const { data: adminSessionData } = await sb.auth.getSession();
    adminSession = adminSessionData ? adminSessionData.session : null;

    // PASSO 2 — Cria o utilizador no Auth
    const { data, error } = await sb.auth.signUp({ email: novoEmail, password: novaSenha });

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
      // PASSO 3 — Chama a RPC para criar o perfil
      const { error: rpcError } = await sb.rpc('admin_create_user_profile', {
        user_id: data.user.id,
        full_name: nomeCompleto,
        user_email: novoEmail,
        user_role: role,
        user_curso: roleUI === 'aluno' ? curso : null,
        user_classe: roleUI === 'aluno' ? classe : null,
        user_turma: roleUI === 'aluno' ? turma : null
      });

      if (rpcError) {
        console.error('Erro na RPC admin_create_user_profile:', rpcError);
        toast('Erro ao criar o perfil do utilizador.', 'error');
        rpcSuccess = false;
      }
    }

    // PASSO 4 — Confirma sucesso se RPC deu OK
    if (rpcSuccess && data && data.user) {
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

  newsTableBody.innerHTML = allNewsData.map(item => `
    <tr>
      <td>
        <strong style="font-size: 13.5px; color: var(--color-text-primary);">${escapeHtml(item.title || item.titulo || 'Comunicado Escolar')}</strong>
      </td>
      <td>
        <span class="role-badge role-badge-professor">
          ${escapeHtml(item.categoria || item.category || 'Geral')}
        </span>
      </td>
      <td>
        <span style="font-size: 12.5px; color: var(--color-text-secondary);">${escapeHtml(item.autor || item.author || 'Direcção')}</span>
      </td>
      <td>
        <span style="font-size: 12.5px; color: var(--color-text-secondary);">${formatDate(item.created_at)}</span>
      </td>
      <td style="text-align: right;">
        <a href="/noticias.html" class="btn-secondary" style="padding: 4px 12px; font-size: 12.5px; min-height: 32px;">
          <span>Visualizar</span>
        </a>
      </td>
    </tr>
  `).join('');
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
    { size: 1845000, curso: 'Informática', turma: 'INF-12A' },
    { size: 2150000, curso: 'Informática', turma: 'INF-12A' },
    { size: 3420000, curso: 'Informática', turma: 'INF-12A' },
    { size: 950000, curso: 'Informática', turma: 'INF-12A' },
    { size: 4200000, curso: 'Electricidade', turma: 'ELE-11A' },
    { size: 3100000, curso: 'Mecânica', turma: 'MEC-12A' },
    { size: 1900000, curso: 'Química', turma: 'QUI-10A' },
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

  populateAdminSelects();
  setupSectionNavigation();

  if (mobileMenuBtn && appSidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('mobile-open');
    });
  }

  [filterUserRole, filterUserCurso, filterUserTurma, filterUserStatus].forEach(el => {
    if (el) el.addEventListener('change', renderUsersTable);
  });

  if (filterUserSearch) {
    filterUserSearch.addEventListener('input', renderUsersTable);
  }

  if (btnResetUserFilters) {
    btnResetUserFilters.addEventListener('click', () => {
      if (filterUserRole) filterUserRole.value = 'todos';
      if (filterUserCurso) filterUserCurso.value = 'todos';
      if (filterUserTurma) filterUserTurma.value = 'todas';
      if (filterUserStatus) filterUserStatus.value = 'todos';
      if (filterUserSearch) filterUserSearch.value = '';
      renderUsersTable();
    });
  }

  if (btnOpenCreateUserTop) btnOpenCreateUserTop.addEventListener('click', openCreateUserModal);
  if (btnOpenCreateUserModal) btnOpenCreateUserModal.addEventListener('click', openCreateUserModal);
  if (btnCloseCreateUserModal) btnCloseCreateUserModal.addEventListener('click', closeCreateUserModal);
  if (btnCancelCreateUser) btnCancelCreateUser.addEventListener('click', closeCreateUserModal);

  if (tabBtnAluno) tabBtnAluno.addEventListener('click', () => selectUserTypeTab('aluno'));
  if (tabBtnProfessor) tabBtnProfessor.addEventListener('click', () => selectUserTypeTab('professor'));

  if (formCreateUser) {
    formCreateUser.addEventListener('submit', handleCreateUserSubmit);
  }

  if (modalCreateUser) {
    modalCreateUser.addEventListener('click', (e) => {
      if (e.target === modalCreateUser) closeCreateUserModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalCreateUser && modalCreateUser.classList.contains('is-open')) {
      closeCreateUserModal();
    }
  });

  document.addEventListener('keydown', handleModalFocusTrap);

  if (btnRunHealthCheck) {
    btnRunHealthCheck.addEventListener('click', runServicesHealthCheck);
  }

  if (filterLogAction) filterLogAction.addEventListener('change', renderLogsTable);
  if (filterLogSearch) filterLogSearch.addEventListener('input', renderLogsTable);
  if (btnRefreshLogs) btnRefreshLogs.addEventListener('click', fetchAllLogs);

  await Promise.all([
    fetchAllProfiles(),
    fetchRecentNews(),
    fetchStorageAggregation(),
    fetchAllLogs()
  ]);

  if (sessionOverlay) {
    sessionOverlay.classList.add('fade-out');
    setTimeout(() => {
      sessionOverlay.style.display = 'none';
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', initAdminPage);

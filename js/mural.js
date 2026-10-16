// PoliCloud - Intranet Escolar IPPLN
// Lógica do Mural de Turma & Calendário Escolar (mural.html)

import { sb, getProfile, requireAuth, signOut, log, toast, confirmModal, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
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

// Cabeçalho e Controlo de Turma
const muralMainTitle = document.getElementById('mural-main-title');
const muralMainDesc = document.getElementById('mural-main-desc');
const studentTurmaBadgeWrap = document.getElementById('student-turma-badge-wrap');
const studentTurmaDisplay = document.getElementById('student-turma-display');
const teacherTurmaSelectorWrap = document.getElementById('teacher-turma-selector-wrap');
const turmaFilterSelect = document.getElementById('turma-filter-select');
const teacherAdminActions = document.getElementById('teacher-admin-actions');
const currentTurmaIndicator = document.getElementById('current-turma-indicator');
const postsListHeading = document.getElementById('posts-list-heading');

// Abas de Navegação
const tabBtnMural = document.getElementById('tab-btn-mural');
const tabBtnCalendar = document.getElementById('tab-btn-calendar');
const tabPaneMural = document.getElementById('tab-pane-mural');
const tabPaneCalendar = document.getElementById('tab-pane-calendar');
const badgePostsCount = document.getElementById('badge-posts-count');
const badgeEventsCount = document.getElementById('badge-events-count');

// Containers de Listagem
const pinnedPostsSection = document.getElementById('pinned-posts-section');
const pinnedPostsContainer = document.getElementById('pinned-posts-container');
const muralPostsContainer = document.getElementById('mural-posts-container');
const calendarEventsContainer = document.getElementById('calendar-events-container');

// Modais e Botões de Abertura (Professor / Admin)
const btnOpenPostModal = document.getElementById('btn-open-post-modal');
const btnOpenEventModal = document.getElementById('btn-open-event-modal');

// Modal 1: Publicar Recado
const modalNewPost = document.getElementById('modal-new-post');
const btnClosePostModal = document.getElementById('btn-close-post-modal');
const btnCancelPostModal = document.getElementById('btn-cancel-post-modal');
const formCreatePost = document.getElementById('form-create-post');
const postCursoSelect = document.getElementById('post-curso-select');
const postClasseSelect = document.getElementById('post-classe-select');
const postTurmaSelect = document.getElementById('post-turma-select');
const postContentInput = document.getElementById('post-content-input');
const postPinnedCheckbox = document.getElementById('post-pinned-checkbox');
const postFormAlert = document.getElementById('post-form-alert');
const btnSubmitPost = document.getElementById('btn-submit-post');

// Modal 2: Adicionar Evento
const modalNewEvent = document.getElementById('modal-new-event');
const btnCloseEventModal = document.getElementById('btn-close-event-modal');
const btnCancelEventModal = document.getElementById('btn-cancel-event-modal');
const formCreateEvent = document.getElementById('form-create-event');
const eventCursoSelect = document.getElementById('event-curso-select');
const eventClasseSelect = document.getElementById('event-classe-select');
const eventTurmaSelect = document.getElementById('event-turma-select');
const eventTitleInput = document.getElementById('event-title-input');
const eventCategorySelect = document.getElementById('event-category-select');
const eventDateInput = document.getElementById('event-date-input');
const eventDescInput = document.getElementById('event-desc-input');
const eventFormAlert = document.getElementById('event-form-alert');
const btnSubmitEvent = document.getElementById('btn-submit-event');


// ==========================================
// Estado Interno
// ==========================================
let currentProfile = null;
let currentUser = null;
let activeTurmaFilter = 'todas';
let activeCategoryFilter = 'todas';
let allCalendarEvents = [];
let currentLoadedPosts = [];
let isDemoMode = false;

// Dados de demonstração padrão para ambiente sem chave
const DEFAULT_DEMO_POSTS = [
  {
    id: 'demo-post-1',
    author_name: 'Prof. Manuel Gonçalves (Coord. Informática)',
    author_role: 'professor',
    content: 'Caros estudantes da 12ª classe:\nRelembro que a entrega do anteprojecto de Prova de Aptidão Profissional (PAP) encerra impreterivelmente na próxima sexta-feira. Tragam os documentos formatados segundo as normas técnicas institucionais do IPPLN.',
    turma: 'A',
    pinned: true,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-post-2',
    author_name: 'Prof. Maria Esperança (Sistemas Digitais)',
    author_role: 'professor',
    content: 'Atenção turma A:\nA aula prática de laboratório de amanhã será realizada na Sala de Oficinas 3. Devem trazer os relatórios impressos do ensaio de microcontroladores.',
    turma: 'A',
    pinned: false,
    created_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-post-3',
    author_name: 'Gabinete de Apoio ao Estudante',
    author_role: 'admin',
    content: 'Aviso Geral a todas as turmas:\nO acesso à biblioteca do IPPLN durante o período da tarde foi alargado até às 17h30 para apoio aos grupos de estudo dos cursos técnicos.',
    turma: null,
    pinned: false,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'demo-post-4',
    author_name: 'Prof. António Silva (Electricidade)',
    author_role: 'professor',
    content: 'Caros alunos de Electricidade:\nAs medições de bancada nos quadros trifásicos continuam esta semana. É expressamente proibida a entrada na oficina sem calçado isolador de segurança.',
    turma: 'B',
    pinned: true,
    created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

const DEFAULT_DEMO_EVENTS = [
  {
    id: 'demo-ev-1',
    title: 'Prova Parcelar de Redes de Computadores II',
    description: 'Avaliação sobre configuração de VLANs, roteamento estático e protocolos TCP/UDP. Sala B-04.',
    category: 'exame',
    event_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0], // Amanhã
    turma: 'A'
  },
  {
    id: 'demo-ev-2',
    title: 'Entrega do Relatório Prático de Redes e Cablagem',
    description: 'Submissão de relatório técnico em formato PDF na pasta da turma no PoliCloud.',
    category: 'entrega',
    event_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0], // 3 dias
    turma: 'A'
  },
  {
    id: 'demo-ev-3',
    title: 'Conselho de Turma e Avaliação Intercalar',
    description: 'Reunião de professores e delegados de turma na sala de reuniões da coordenação.',
    category: 'reuniao',
    event_date: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
    turma: 'A'
  },
  {
    id: 'demo-ev-4',
    title: 'Simulação Laboratorial de Máquinas Eléctricas',
    description: 'Ensaio de motores de indução no pavilhão de máquinas.',
    category: 'aula',
    event_date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    turma: 'ELE-11A'
  },
  {
    id: 'demo-ev-5',
    title: 'Apresentação Intercalar dos Projectos PAP',
    description: 'Defesa prévia perante a comissão pedagógica do instituto.',
    category: 'exame',
    event_date: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
    turma: null // Geral
  }
];

// Carregar posts e eventos locais guardados para sessão de teste
function getLocalDemoPosts() {
  try {
    const saved = localStorage.getItem('policloud_demo_mural_posts');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...DEFAULT_DEMO_POSTS];
}

function saveLocalDemoPost(newPost) {
  const posts = getLocalDemoPosts();
  posts.unshift(newPost);
  try {
    localStorage.setItem('policloud_demo_mural_posts', JSON.stringify(posts));
  } catch (e) {}
}

function updateLocalDemoPost(id, data) {
  const posts = getLocalDemoPosts();
  const idx = posts.findIndex(p => String(p.id) === String(id));
  if (idx !== -1) {
    posts[idx] = { ...posts[idx], ...data };
    try {
      localStorage.setItem('policloud_demo_mural_posts', JSON.stringify(posts));
    } catch (e) {}
  }
}

function deleteLocalDemoPost(id) {
  let posts = getLocalDemoPosts();
  posts = posts.filter(p => String(p.id) !== String(id));
  try {
    localStorage.setItem('policloud_demo_mural_posts', JSON.stringify(posts));
  } catch (e) {}
}

function getLocalDemoEvents() {
  try {
    const saved = localStorage.getItem('policloud_demo_calendar_events');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [...DEFAULT_DEMO_EVENTS];
}

function saveLocalDemoEvent(newEvent) {
  const events = getLocalDemoEvents();
  events.push(newEvent);
  try {
    localStorage.setItem('policloud_demo_calendar_events', JSON.stringify(events));
  } catch (e) {}
}

function updateLocalDemoEvent(id, data) {
  const events = getLocalDemoEvents();
  const idx = events.findIndex(e => String(e.id) === String(id));
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...data };
    try {
      localStorage.setItem('policloud_demo_calendar_events', JSON.stringify(events));
    } catch (e) {}
  }
}

function deleteLocalDemoEvent(id) {
  let events = getLocalDemoEvents();
  events = events.filter(e => String(e.id) !== String(id));
  try {
    localStorage.setItem('policloud_demo_calendar_events', JSON.stringify(events));
  } catch (e) {}
}

// ==========================================
// Utilitários de Formatação & Sanitização
// ==========================================
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateRelative(dateString) {
  if (!dateString) return '';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 2) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHours < 24) return `Hoje às ${new Date(dateString).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return `Ontem às ${new Date(dateString).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays < 7) return `Há ${diffDays} dias`;

    return new Date(dateString).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Calcula a proximidade de um evento (Hoje, Amanhã, Esta Semana, etc.)
 */
function getEventProximity(dateString) {
  if (!dateString) return { label: 'Agendado', class: 'prox-future', isImminent: false };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { label: 'Hoje', class: 'prox-today', isImminent: true };
    } else if (diffDays === 1) {
      return { label: 'Amanhã', class: 'prox-tomorrow', isImminent: true };
    } else if (diffDays > 1 && diffDays <= 7) {
      return { label: `Em ${diffDays} dias`, class: 'prox-week', isImminent: diffDays <= 3 };
    } else if (diffDays > 7) {
      return { label: `Em ${diffDays} dias`, class: 'prox-future', isImminent: false };
    } else {
      return { label: 'Concluído', class: 'prox-future', isImminent: false };
    }
  } catch (e) {
    return { label: 'Agendado', class: 'prox-future', isImminent: false };
  }
}

function getCategoryConfig(category) {
  switch (category) {
    case 'exame':
      return { label: 'Prova / Exame', class: 'cat-exame' };
    case 'entrega':
      return { label: 'Entrega de Trabalho', class: 'cat-entrega' };
    case 'reuniao':
      return { label: 'Reunião / Conselho', class: 'cat-reuniao' };
    case 'aula':
      return { label: 'Prática de Oficina', class: 'cat-aula' };
    default:
      return { label: 'Atividade Académica', class: 'cat-reuniao' };
  }
}

// ==========================================
// Configuração de Perfil & Permissões
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
// Carregamento de Turmas (Professores e Admin)
// ==========================================
async function populateTurmaOptions() {
  const turmasSet = new Set([...TURMAS]);

  try {
    const { data, error } = await sb
      .from('profiles')
      .select('turma')
      .not('turma', 'is', null);

    if (!error && data) {
      data.forEach(p => {
        if (p.turma && p.turma.trim()) turmasSet.add(p.turma.trim());
      });
    }
  } catch (e) {
  }

  const sortedTurmas = Array.from(turmasSet).sort();

  // Preenche o seletor do filtro principal
  if (turmaFilterSelect) {
    turmaFilterSelect.innerHTML = `
      <option value="todas">Todas as Turmas (Geral)</option>
      ${sortedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('')}
    `;
  }

  // Preenche os seletores nos modais de criação
  const optionsHtml = `
    ${sortedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('')}
    <option value="todas">Geral (Todas as Turmas)</option>
  `;
  
  const cursosHtml = `
    ${CURSOS.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
    <option value="todos">Todos os Cursos</option>
  `;

  const classesHtml = `
    ${CLASSES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)} Classe</option>`).join('')}
    <option value="todas">Todas as Classes</option>
  `;

  if (postTurmaSelect) postTurmaSelect.innerHTML = optionsHtml;
  if (eventTurmaSelect) eventTurmaSelect.innerHTML = optionsHtml;
  if (postCursoSelect) postCursoSelect.innerHTML = cursosHtml;
  if (eventCursoSelect) eventCursoSelect.innerHTML = cursosHtml;
  if (postClasseSelect) postClasseSelect.innerHTML = classesHtml;
  if (eventClasseSelect) eventClasseSelect.innerHTML = classesHtml;
}

// ==========================================
// Renderização do Mural de Recados
// ==========================================
async function loadMuralPosts() {
  if (!muralPostsContainer) return;

  muralPostsContainer.innerHTML = `
    <div class="state-loading">
      <div class="spinner spinner-light"></div>
      <span>A carregar publicações da turma...</span>
    </div>
  `;

  let posts = [];
  const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';

  if (isConfigPlaceholder()) {
    // Modo de demonstração com dados simulados
    const allDemoPosts = getLocalDemoPosts();
    if (isAluno) {
      const studentCurso = currentProfile.curso;
      const studentClasse = currentProfile.classe;
      const studentTurma = currentProfile.turma;
      posts = allDemoPosts.filter(p => {
        if (p.curso && p.curso !== 'todos' && p.curso !== 'Geral' && p.curso !== studentCurso) return false;
        if (p.classe && p.classe !== 'todas' && p.classe !== 'Geral' && p.classe !== studentClasse) return false;
        if (p.turma && p.turma !== 'todas' && p.turma !== 'Geral' && p.turma !== studentTurma) return false;
        return true;
      });
    } else {
      if (activeTurmaFilter === 'todas') {
        posts = allDemoPosts;
      } else {
        posts = allDemoPosts.filter(p => !p.turma || p.turma === 'todas' || p.turma === activeTurmaFilter);
      }
    }
  } else {
    // Consulta Real ao Supabase
    try {
      let query = sb
        .from('mural_posts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      const rawPosts = data || [];

      if (isAluno) {
        const studentCurso = currentProfile.curso;
        const studentClasse = currentProfile.classe;
        const studentTurma = currentProfile.turma;

        posts = rawPosts.filter(p => {
          if (p.curso && p.curso !== 'todos' && p.curso !== 'Geral' && p.curso !== studentCurso) return false;
          if (p.classe && p.classe !== 'todas' && p.classe !== 'Geral' && p.classe !== studentClasse) return false;
          if (p.turma && p.turma !== 'todas' && p.turma !== 'Geral' && p.turma !== studentTurma) return false;
          return true;
        });
      } else {
        // Professor / Admin: respeita o filtro selecionado
        if (activeTurmaFilter && activeTurmaFilter !== 'todas') {
          posts = rawPosts.filter(p => !p.turma || p.turma === 'todas' || p.turma === activeTurmaFilter);
        } else {
          posts = rawPosts;
        }
      }
    } catch (err) {
      console.error('Erro ao carregar posts do mural:', err);
      muralPostsContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Não foi possível ligar ao mural de recados de momento.</span>
        </div>
      `;
      return;
    }
  }

  // Separação entre posts fixados no topo e posts normais
  const pinnedPosts = posts.filter(p => p.pinned === true || p.is_pinned === true || p.fixado === true);
  const regularPosts = posts.filter(p => !(p.pinned === true || p.is_pinned === true || p.fixado === true));

  // Actualiza o contador na aba
  if (badgePostsCount) {
    badgePostsCount.textContent = String(posts.length);
  }

  // 1. Renderiza Posts Fixados
  if (pinnedPostsSection && pinnedPostsContainer) {
    if (pinnedPosts.length > 0) {
      pinnedPostsSection.style.display = 'block';
      pinnedPostsContainer.innerHTML = pinnedPosts.map(post => renderPostCard(post, true)).join('');
    } else {
      pinnedPostsSection.style.display = 'none';
      pinnedPostsContainer.innerHTML = '';
    }
  }

  // 2. Renderiza Posts Regulares
  if (regularPosts.length === 0 && pinnedPosts.length === 0) {
    const turmaLabel = currentProfile.role === 'aluno'
      ? (currentProfile.turma ? `para a turma ${currentProfile.turma}` : '')
      : (activeTurmaFilter !== 'todas' ? `para a turma ${activeTurmaFilter}` : 'no mural');

    muralPostsContainer.innerHTML = `
      <div class="state-empty" style="padding: 48px 16px;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-accent); opacity: 0.85;">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M3 9h18"/>
          <path d="M9 21V9"/>
        </svg>
        <strong style="font-size: 15px; color: var(--color-text-primary);">O mural está sem publicações</strong>
        <span style="color: var(--color-text-secondary); max-width: 440px;">Ainda não há recados ou avisos registados ${turmaLabel}.</span>
      </div>
    `;
    return;
  }

  if (regularPosts.length === 0 && pinnedPosts.length > 0) {
    muralPostsContainer.innerHTML = `
      <div class="state-empty" style="padding: 24px 16px;">
        <span>Todos os avisos actuais encontram-se fixados em destaque no topo.</span>
      </div>
    `;
    return;
  }

  muralPostsContainer.innerHTML = regularPosts.map(post => renderPostCard(post, false)).join('');
  currentLoadedPosts = posts;
  attachPostActionListeners();
}

/**
 * Validação de permissões de gestão do mural:
 * - Admin: pode gerir recados e eventos de todos
 * - Professor: pode gerir apenas os dele
 * - Aluno: não pode gerir nada
 */
function canManagePost(post) {
  if (!currentProfile) return false;
  if (currentProfile.role === 'admin') return true;
  if (currentProfile.role === 'professor') {
    if (post.author_id && post.author_id === currentProfile.id) return true;
    if (post.created_by && post.created_by === currentProfile.id) return true;
    if (post.author_name && currentProfile.nome && (
      post.author_name.toLowerCase().includes(currentProfile.nome.toLowerCase()) ||
      currentProfile.nome.toLowerCase().includes(post.author_name.toLowerCase())
    )) return true;
    return false;
  }
  return false;
}

function canManageEvent(event) {
  if (!currentProfile) return false;
  if (currentProfile.role === 'admin') return true;
  if (currentProfile.role === 'professor') {
    if (event.created_by && event.created_by === currentProfile.id) return true;
    if (event.author_id && event.author_id === currentProfile.id) return true;
    return false;
  }
  return false;
}

/**
 * Cria o HTML de um cartão de post no mural
 */
function renderPostCard(post, isPinned) {
  const authorName = post.author_name || 'Docente / Direcção';
  const authorInitial = authorName.trim()[0].toUpperCase();
  const authorRole = post.author_role || (authorName.toLowerCase().includes('admin') || authorName.toLowerCase().includes('direcção') ? 'admin' : 'professor');
  const roleLabel = authorRole === 'admin' ? 'Administração' : 'Corpo Docente';
  const turmaTag = post.turma ? `Turma: ${escapeHtml(post.turma)}` : 'Comunicado Geral IPPLN';
  const canManage = canManagePost(post);

  return `
    <article class="mural-post-card ${isPinned ? 'pinned' : ''}">
      <header class="mural-post-header">
        <div class="mural-author-info">
          <div class="mural-avatar-circle" aria-hidden="true">${authorInitial}</div>
          <div class="mural-author-details">
            <div class="mural-author-name-row">
              <span class="mural-author-name">${escapeHtml(authorName)}</span>
              <span class="mural-role-pill ${authorRole}">${roleLabel}</span>
            </div>
            <span class="mural-target-turma">Destino: ${turmaTag}</span>
          </div>
        </div>

        <div class="mural-post-meta-right" style="display: flex; align-items: center; gap: 8px;">
          ${isPinned ? `
            <span class="mural-pin-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="17" x2="12" y2="22"/>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
              </svg>
              Fixado
            </span>
          ` : ''}
          <time class="mural-time" datetime="${post.created_at || ''}">${formatDateRelative(post.created_at)}</time>
          ${canManage ? `
            <div class="mural-post-actions" style="display: inline-flex; gap: 6px; margin-left: 6px;">
              <button type="button" class="btn-table-action btn-edit-post" data-id="${escapeHtml(post.id)}" title="Editar recado">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Editar</span>
              </button>
              <button type="button" class="btn-table-action action-status-danger btn-delete-post" data-id="${escapeHtml(post.id)}" title="Eliminar recado">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          ` : ''}
        </div>
      </header>

      <div class="mural-post-body">
        <p>${escapeHtml(post.content || '')}</p>
      </div>
    </article>
  `;
}

// ==========================================
// Renderização do Calendário de Avaliações
// ==========================================
async function loadCalendarEvents() {
  if (!calendarEventsContainer) return;

  calendarEventsContainer.innerHTML = `
    <div class="state-loading">
      <div class="spinner spinner-light"></div>
      <span>A carregar datas e exames do calendário...</span>
    </div>
  `;

  let events = [];

  const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';

  if (isConfigPlaceholder()) {
    const allDemoEvents = getLocalDemoEvents();
    if (isAluno) {
      const studentCurso = currentProfile.curso;
      const studentClasse = currentProfile.classe;
      const studentTurma = currentProfile.turma;
      events = allDemoEvents.filter(e => {
        if (e.curso && e.curso !== 'todos' && e.curso !== 'Geral' && e.curso !== studentCurso) return false;
        if (e.classe && e.classe !== 'todas' && e.classe !== 'Geral' && e.classe !== studentClasse) return false;
        if (e.turma && e.turma !== 'todas' && e.turma !== 'Geral' && e.turma !== studentTurma) return false;
        return true;
      });
    } else {
      if (activeTurmaFilter === 'todas') {
        events = allDemoEvents;
      } else {
        events = allDemoEvents.filter(e => !e.turma || e.turma === 'todas' || e.turma === activeTurmaFilter);
      }
    }
  } else {
    try {
      let query = sb
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      const rawEvents = data || [];

      if (isAluno) {
        const studentCurso = currentProfile.curso;
        const studentClasse = currentProfile.classe;
        const studentTurma = currentProfile.turma;
        events = rawEvents.filter(e => {
          if (e.curso && e.curso !== 'todos' && e.curso !== 'Geral' && e.curso !== studentCurso) return false;
          if (e.classe && e.classe !== 'todas' && e.classe !== 'Geral' && e.classe !== studentClasse) return false;
          if (e.turma && e.turma !== 'todas' && e.turma !== 'Geral' && e.turma !== studentTurma) return false;
          return true;
        });
      } else {
        if (activeTurmaFilter && activeTurmaFilter !== 'todas') {
          events = rawEvents.filter(e => !e.turma || e.turma === 'todas' || e.turma === activeTurmaFilter);
        } else {
          events = rawEvents;
        }
      }
    } catch (err) {
      console.error('Erro ao carregar calendário:', err);
      calendarEventsContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível aceder ao calendário escolar de momento.</span>
        </div>
      `;
      return;
    }
  }

  // Ordena por data (ascendente: os mais próximos no topo)
  events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  allCalendarEvents = events;

  renderFilteredCalendarEvents();
}

/**
 * Renderiza eventos com base na categoria e turma ativas
 */
function renderFilteredCalendarEvents() {
  if (!calendarEventsContainer) return;

  let filtered = allCalendarEvents;
  if (activeCategoryFilter !== 'todas') {
    filtered = allCalendarEvents.filter(e => e.category === activeCategoryFilter);
  }

  if (badgeEventsCount) {
    badgeEventsCount.textContent = String(allCalendarEvents.length);
  }

  if (filtered.length === 0) {
    const isFilteredByCategory = activeCategoryFilter !== 'todas';
    const catLabel = getCategoryConfig(activeCategoryFilter).label;
    const turmaLabel = currentProfile.role === 'aluno'
      ? (currentProfile.turma ? `para a turma ${currentProfile.turma}` : '')
      : (activeTurmaFilter !== 'todas' ? `para a turma ${activeTurmaFilter}` : 'no calendário');

    calendarEventsContainer.innerHTML = `
      <div class="state-empty" style="padding: 48px 16px;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-accent); opacity: 0.85;">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <strong style="font-size: 15px; color: var(--color-text-primary);">
          ${isFilteredByCategory ? `Nenhum evento em "${catLabel}"` : 'Nenhum evento no calendário'}
        </strong>
        <span style="color: var(--color-text-secondary); max-width: 440px;">
          ${isFilteredByCategory 
            ? `Não existem registos desta categoria ${turmaLabel}. Experimente selecionar "Todas as Datas".` 
            : `Não existem avaliações, entregas ou reuniões agendadas ${turmaLabel}.`}
        </span>
      </div>
    `;
    return;
  }

  calendarEventsContainer.innerHTML = filtered.map(event => renderEventCard(event)).join('');
  attachEventActionListeners();
}

function setupCalendarCategoryFilters() {
  const categoryBtns = document.querySelectorAll('.category-filter-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.getAttribute('data-category') || 'todas';
      renderFilteredCalendarEvents();
    });
  });
}

/**
 * Cria o HTML de um cartão de evento no calendário escolar
 */
function renderEventCard(event) {
  const dateObj = event.event_date ? new Date(event.event_date) : new Date();
  const day = isNaN(dateObj.getDate()) ? '15' : String(dateObj.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = isNaN(dateObj.getMonth()) ? 'Mês' : monthNames[dateObj.getMonth()];

  const proximity = getEventProximity(event.event_date);
  const catConfig = getCategoryConfig(event.category);
  const turmaTag = event.turma ? `Turma: ${escapeHtml(event.turma)}` : 'Geral (Todo o IPPLN)';
  const canManage = canManageEvent(event);

  return `
    <article class="dark-event-card ${proximity.isImminent ? 'imminent' : ''}">
      <div class="dark-event-date-box" aria-label="Data: ${day} de ${month}">
        <span class="dark-event-day">${day}</span>
        <span class="dark-event-month">${month}</span>
      </div>

      <div class="dark-event-content">
        <div class="dark-event-top-row">
          <div class="dark-event-title-group">
            <h3 class="dark-event-title">${escapeHtml(event.title || 'Evento Escolar')}</h3>
            <span class="dark-event-category-badge ${catConfig.class}">${catConfig.label}</span>
          </div>

          <span class="dark-event-proximity-pill ${proximity.class}">
            ${proximity.isImminent ? `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            ` : ''}
            ${proximity.label}
          </span>
        </div>

        ${event.description ? `
          <p class="dark-event-desc">${escapeHtml(event.description)}</p>
        ` : ''}

        <footer class="dark-event-footer" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span class="dark-event-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              ${turmaTag}
            </span>
            <span class="dark-event-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${event.event_date ? new Date(event.event_date).toLocaleDateString('pt-AO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : ''}
            </span>
          </div>
          ${canManage ? `
            <div class="dark-event-actions" style="display: inline-flex; gap: 6px; margin-left: auto;">
              <button type="button" class="btn-table-action btn-edit-event" data-id="${escapeHtml(event.id)}" title="Editar evento">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Editar</span>
              </button>
              <button type="button" class="btn-table-action action-status-danger btn-delete-event" data-id="${escapeHtml(event.id)}" title="Eliminar evento">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          ` : ''}
        </footer>
      </div>
    </article>
  `;
}

// ==========================================
// Gestão de Abas (Mural vs Calendário)
// ==========================================
function switchTab(tabName) {
  if (tabName === 'calendar') {
    tabBtnCalendar.classList.add('active');
    tabBtnCalendar.setAttribute('aria-selected', 'true');
    tabBtnMural.classList.remove('active');
    tabBtnMural.setAttribute('aria-selected', 'false');

    tabPaneCalendar.style.display = 'block';
    tabPaneMural.style.display = 'none';
  } else {
    tabBtnMural.classList.add('active');
    tabBtnMural.setAttribute('aria-selected', 'true');
    tabBtnCalendar.classList.remove('active');
    tabBtnCalendar.setAttribute('aria-selected', 'false');

    tabPaneMural.style.display = 'block';
    tabPaneCalendar.style.display = 'none';
  }
}

// ==========================================
// Listeners e Gestão de Acções (Editar & Eliminar)
// ==========================================
function attachPostActionListeners() {
  document.querySelectorAll('.btn-edit-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditPost(id);
    });
  });

  document.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      await deleteMuralPost(id);
    });
  });
}

function attachEventActionListeners() {
  document.querySelectorAll('.btn-edit-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditEvent(id);
    });
  });

  document.querySelectorAll('.btn-delete-event').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      await deleteCalendarEvent(id);
    });
  });
}

function openEditPost(postId) {
  const post = currentLoadedPosts.find(p => String(p.id) === String(postId));
  if (!post || !canManagePost(post)) {
    toast('Não tem permissão para editar este recado.', 'error');
    return;
  }

  hidePostAlert();
  if (formCreatePost) formCreatePost.reset();

  const editingInput = document.getElementById('post-editing-id');
  if (editingInput) editingInput.value = post.id;

  const modalTitle = document.getElementById('modal-post-title');
  if (modalTitle) modalTitle.textContent = 'Editar Recado do Mural';

  if (postCursoSelect) postCursoSelect.value = post.curso || 'todos';
  if (postClasseSelect) postClasseSelect.value = post.classe || 'todas';
  if (postTurmaSelect) postTurmaSelect.value = post.turma || 'todas';
  if (postContentInput) postContentInput.value = post.content || '';
  if (postPinnedCheckbox) postPinnedCheckbox.checked = post.pinned === true || post.is_pinned === true || post.fixado === true;

  if (btnSubmitPost) {
    btnSubmitPost.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Guardar Alterações</span>
    `;
  }

  openM('modal-new-post');
}

async function deleteMuralPost(postId) {
  const post = currentLoadedPosts.find(p => String(p.id) === String(postId));
  if (!post || !canManagePost(post)) {
    toast('Não tem permissão para eliminar este recado.', 'error');
    return;
  }

  const confirmed = await confirmModal({
    title: 'Eliminar Recado do Mural',
    message: 'Tem a certeza de que pretende eliminar este recado do mural? Esta ação não pode ser desfeita.',
    confirmText: 'Sim, Eliminar',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) {
    return;
  }

  try {
    if (isConfigPlaceholder()) {
      deleteLocalDemoPost(postId);
    } else {
      const { error } = await sb.from('mural_posts').delete().eq('id', postId);
      if (error) throw error;
      await log('eliminar_mural', 'mural_posts', postId, currentProfile?.nome || '');
    }
    toast('Recado eliminado com sucesso!', 'success');
    await loadMuralPosts();
  } catch (err) {
    console.error('Erro ao eliminar recado:', err);
    toast(err.message || 'Falha ao eliminar recado.', 'error');
  }
}

function openEditEvent(eventId) {
  const event = allCalendarEvents.find(e => String(e.id) === String(eventId));
  if (!event || !canManageEvent(event)) {
    toast('Não tem permissão para editar este evento.', 'error');
    return;
  }

  hideEventAlert();
  if (formCreateEvent) formCreateEvent.reset();

  const editingInput = document.getElementById('event-editing-id');
  if (editingInput) editingInput.value = event.id;

  const modalTitle = document.getElementById('modal-event-title');
  if (modalTitle) modalTitle.textContent = 'Editar Evento do Calendário';

  if (eventTitleInput) eventTitleInput.value = event.title || '';
  if (eventCategorySelect) eventCategorySelect.value = event.category || 'exame';
  if (eventDateInput) eventDateInput.value = event.event_date ? event.event_date.split('T')[0] : '';
  if (eventDescInput) eventDescInput.value = event.description || '';
  if (eventCursoSelect) eventCursoSelect.value = event.curso || 'todos';
  if (eventClasseSelect) eventClasseSelect.value = event.classe || 'todas';
  if (eventTurmaSelect) eventTurmaSelect.value = event.turma || 'todas';

  if (btnSubmitEvent) {
    btnSubmitEvent.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Guardar Alterações</span>
    `;
  }

  openM('modal-new-event');
}

async function deleteCalendarEvent(eventId) {
  const event = allCalendarEvents.find(e => String(e.id) === String(eventId));
  if (!event || !canManageEvent(event)) {
    toast('Não tem permissão para eliminar este evento.', 'error');
    return;
  }

  const confirmed = await confirmModal({
    title: 'Eliminar Evento da Agenda',
    message: `Tem a certeza de que pretende eliminar o evento "${event.title || ''}"? Esta ação é definitiva.`,
    confirmText: 'Sim, Eliminar',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) {
    return;
  }

  try {
    if (isConfigPlaceholder()) {
      deleteLocalDemoEvent(eventId);
    } else {
      const { error } = await sb.from('calendar_events').delete().eq('id', eventId);
      if (error) throw error;
      await log('eliminar_evento', 'calendar_events', eventId, currentProfile?.nome || '');
    }
    toast('Evento eliminado com sucesso!', 'success');
    await loadCalendarEvents();
  } catch (err) {
    console.error('Erro ao eliminar evento:', err);
    toast(err.message || 'Falha ao eliminar evento.', 'error');
  }
}

// ==========================================
// Modais de Criação (Professor / Admin)
// ==========================================
function openPostModal() {
  const isAluno = !currentProfile || currentProfile.role === 'aluno' || currentProfile.role === 'student';
  if (isAluno) {
    toast('Apenas professores e administradores têm permissão para criar publicações no mural.', 'error');
    return;
  }

  hidePostAlert();
  if (formCreatePost) formCreatePost.reset();

  const editingInput = document.getElementById('post-editing-id');
  if (editingInput) editingInput.value = '';

  const modalTitle = document.getElementById('modal-post-title');
  if (modalTitle) modalTitle.textContent = 'Publicar Recado no Mural';

  if (btnSubmitPost) {
    btnSubmitPost.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      <span>Publicar no Mural</span>
    `;
  }

  // Pré-seleciona a turma atual no formulário se não for 'todas'
  if (postTurmaSelect && activeTurmaFilter && activeTurmaFilter !== 'todas') {
    postTurmaSelect.value = activeTurmaFilter;
  }

  openM('modal-new-post');
}

function closePostModal() {
  closeM('modal-new-post');
}

function openEventModal() {
  const isAluno = !currentProfile || currentProfile.role === 'aluno' || currentProfile.role === 'student';
  if (isAluno) {
    toast('Apenas professores e administradores têm permissão para agendar eventos no calendário.', 'error');
    return;
  }

  hideEventAlert();
  if (formCreateEvent) formCreateEvent.reset();

  const editingInput = document.getElementById('event-editing-id');
  if (editingInput) editingInput.value = '';

  const modalTitle = document.getElementById('modal-event-title');
  if (modalTitle) modalTitle.textContent = 'Adicionar Evento ao Calendário';

  if (btnSubmitEvent) {
    btnSubmitEvent.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Registar Evento</span>
    `;
  }

  // Define data padrão para amanhã
  if (eventDateInput) {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    eventDateInput.value = tomorrow.toISOString().split('T')[0];
  }

  if (eventTurmaSelect && activeTurmaFilter && activeTurmaFilter !== 'todas') {
    eventTurmaSelect.value = activeTurmaFilter;
  }

  openM('modal-new-event');
}

function closeEventModal() {
  closeM('modal-new-event');
}

function showPostAlert(msg, type = 'error') {
  if (!postFormAlert) return;
  postFormAlert.className = `alert-box visible alert-${type}`;
  postFormAlert.innerHTML = `<span>${escapeHtml(msg)}</span>`;
}

function hidePostAlert() {
  if (!postFormAlert) return;
  postFormAlert.className = 'alert-box';
  postFormAlert.innerHTML = '';
}

function showEventAlert(msg, type = 'error') {
  if (!eventFormAlert) return;
  eventFormAlert.className = `alert-box visible alert-${type}`;
  eventFormAlert.innerHTML = `<span>${escapeHtml(msg)}</span>`;
}

function hideEventAlert() {
  if (!eventFormAlert) return;
  eventFormAlert.className = 'alert-box';
  eventFormAlert.innerHTML = '';
}

// ==========================================
// Submissão de Formulários (Professor & Admin)
// ==========================================
async function handleCreatePostSubmit(e) {
  e.preventDefault();

  // 1. Verificação estrita de papel: Alunos NUNCA publicam
  const isAluno = !currentProfile || currentProfile.role === 'aluno' || currentProfile.role === 'student';
  if (isAluno) {
    showPostAlert('Acesso Negado: Alunos não têm autorização para publicar no mural.');
    toast('Acesso Negado: Alunos não podem publicar recados.', 'error');
    return;
  }

  const editingId = document.getElementById('post-editing-id')?.value;
  if (editingId) {
    const existing = currentLoadedPosts.find(p => String(p.id) === String(editingId));
    if (!existing || !canManagePost(existing)) {
      showPostAlert('Acesso Negado: Não tem permissão para editar este recado.');
      return;
    }
  }

  const content = (postContentInput.value || '').trim();
  const turmaValue = postTurmaSelect.value;
  const isPinned = postPinnedCheckbox.checked;

  if (!content) {
    showPostAlert('Por favor, escreva o conteúdo do recado.');
    return;
  }

  btnSubmitPost.disabled = true;
  btnSubmitPost.innerHTML = `
    <div class="spinner spinner-light" style="width: 16px; height: 16px; border-width: 2px;"></div>
    <span>${editingId ? 'A guardar alterações...' : 'A publicar...'}</span>
  `;

  try {
    const targetTurma = turmaValue === 'todas' ? null : turmaValue;
    const cursoValue = postCursoSelect ? postCursoSelect.value : null;
    const targetCurso = cursoValue === 'todos' ? null : cursoValue;
    const classeValue = postClasseSelect ? postClasseSelect.value : null;
    const targetClasse = classeValue === 'todas' ? null : classeValue;

    if (editingId) {
      if (isConfigPlaceholder()) {
        updateLocalDemoPost(editingId, {
          content,
          curso: targetCurso,
          classe: targetClasse,
          turma: targetTurma,
          pinned: isPinned
        });
      } else {
        const { error } = await sb
          .from('mural_posts')
          .update({
            content: content,
            curso: targetCurso,
            classe: targetClasse,
            turma: targetTurma,
            pinned: isPinned
          })
          .eq('id', editingId);

        if (error) throw error;
        await log('editar_mural', 'mural_posts', editingId, currentProfile?.nome || '');
      }
      toast('Recado atualizado com sucesso!', 'success');
      showPostAlert('Recado atualizado com sucesso!', 'success');
    } else {
      if (isConfigPlaceholder()) {
        const newPost = {
          id: `post-${Date.now()}`,
          author_name: currentProfile.nome || 'Professor',
          author_role: currentProfile.role,
          content: content,
          curso: targetCurso,
          classe: targetClasse,
          turma: targetTurma,
          pinned: isPinned,
          created_at: new Date().toISOString()
        };
        saveLocalDemoPost(newPost);
      } else {
        const { data: insertedPost, error } = await sb
          .from('mural_posts')
          .insert({
            author_id: currentProfile.id || currentUser.id,
            author_name: currentProfile.nome || 'Professor',
            content: content,
            curso: targetCurso,
            classe: targetClasse,
            turma: targetTurma,
            pinned: isPinned,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        await log('publicar_mural', 'mural_posts', insertedPost?.id, currentProfile?.nome || '');
      }
      toast('Publicação realizada com sucesso no mural!', 'success');
      showPostAlert('Publicação realizada com sucesso no mural!', 'success');
    }

    setTimeout(() => {
      closePostModal();
      loadMuralPosts();
    }, 700);

  } catch (err) {
    console.error('Erro ao guardar recado:', err);
    showPostAlert(err.message || 'Erro ao processar recado. Verifique as suas permissões.');
  } finally {
    btnSubmitPost.disabled = false;
    btnSubmitPost.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      <span>${editingId ? 'Guardar Alterações' : 'Publicar no Mural'}</span>
    `;
  }
}

async function handleCreateEventSubmit(e) {
  e.preventDefault();

  const isAluno = !currentProfile || currentProfile.role === 'aluno' || currentProfile.role === 'student';
  if (isAluno) {
    showEventAlert('Acesso Negado: Alunos não têm autorização para adicionar eventos.');
    toast('Acesso Negado: Alunos não podem adicionar eventos.', 'error');
    return;
  }

  const editingId = document.getElementById('event-editing-id')?.value;
  if (editingId) {
    const existing = allCalendarEvents.find(e => String(e.id) === String(editingId));
    if (!existing || !canManageEvent(existing)) {
      showEventAlert('Acesso Negado: Não tem permissão para editar este evento.');
      return;
    }
  }

  const title = (eventTitleInput.value || '').trim();
  const category = eventCategorySelect.value;
  const eventDate = eventDateInput.value;
  const description = (eventDescInput.value || '').trim();
  const turmaValue = eventTurmaSelect.value;

  if (!title) {
    showEventAlert('Por favor, informe o título da avaliação ou evento.');
    return;
  }

  if (!eventDate) {
    showEventAlert('Por favor, selecione a data do evento.');
    return;
  }

  btnSubmitEvent.disabled = true;
  btnSubmitEvent.innerHTML = `
    <div class="spinner spinner-light" style="width: 16px; height: 16px; border-width: 2px;"></div>
    <span>${editingId ? 'A guardar alterações...' : 'A registar...'}</span>
  `;

  try {
    const targetTurma = turmaValue === 'todas' ? null : turmaValue;
    const cursoValue = eventCursoSelect ? eventCursoSelect.value : null;
    const targetCurso = cursoValue === 'todos' ? null : cursoValue;
    const classeValue = eventClasseSelect ? eventClasseSelect.value : null;
    const targetClasse = classeValue === 'todas' ? null : classeValue;

    if (editingId) {
      if (isConfigPlaceholder()) {
        updateLocalDemoEvent(editingId, {
          title,
          category,
          event_date: eventDate,
          description,
          curso: targetCurso,
          classe: targetClasse,
          turma: targetTurma
        });
      } else {
        const { error } = await sb
          .from('calendar_events')
          .update({
            title: title,
            category: category,
            event_date: eventDate,
            description: description,
            curso: targetCurso,
            classe: targetClasse,
            turma: targetTurma
          })
          .eq('id', editingId);

        if (error) throw error;
        await log('editar_evento', 'calendar_events', editingId, currentProfile?.nome || '');
      }
      toast('Evento atualizado com sucesso no calendário!', 'success');
      showEventAlert('Evento atualizado com sucesso no calendário!', 'success');
    } else {
      if (isConfigPlaceholder()) {
        const newEvent = {
          id: `ev-${Date.now()}`,
          title: title,
          category: category,
          event_date: eventDate,
          description: description,
          curso: targetCurso,
          classe: targetClasse,
          turma: targetTurma,
          created_at: new Date().toISOString()
        };
        saveLocalDemoEvent(newEvent);
      } else {
        const { data: insertedEvent, error } = await sb
          .from('calendar_events')
          .insert({
            title: title,
            category: category,
            event_date: eventDate,
            description: description,
            curso: targetCurso,
            classe: targetClasse,
            turma: targetTurma,
            created_by: currentProfile.id || currentUser.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        await log('criar_evento', 'calendar_events', insertedEvent?.id, currentProfile?.nome || '');
      }
      toast('Evento registado com sucesso no calendário!', 'success');
      showEventAlert('Evento registado com sucesso no calendário!', 'success');
    }

    setTimeout(() => {
      closeEventModal();
      loadCalendarEvents();
      switchTab('calendar');
    }, 700);

  } catch (err) {
    console.error('Erro ao processar evento:', err);
    showEventAlert(err.message || 'Não foi possível processar o evento.');
  } finally {
    btnSubmitEvent.disabled = false;
    btnSubmitEvent.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>${editingId ? 'Guardar Alterações' : 'Registar Evento'}</span>
    `;
  }
}

// ==========================================
// Atualização de Títulos e Filtros de Turma
// ==========================================
function updateTurmaDisplay() {
  const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';
  if (isAluno) {
    const alunoTurma = currentProfile.turma || 'A';
    const alunoCurso = currentProfile.curso || 'Curso Geral';
    const alunoClasse = currentProfile.classe || 'Classe Geral';

    if (studentTurmaDisplay) studentTurmaDisplay.textContent = `${alunoCurso} • ${alunoClasse} • Turma ${alunoTurma}`;
    if (muralMainTitle) muralMainTitle.textContent = `Mural & Calendário • ${alunoCurso} • ${alunoClasse} • Turma ${alunoTurma}`;
    if (muralMainDesc) muralMainDesc.textContent = `Avisos, notas de docentes e calendário pedagógico exclusivos para a sua turma (${alunoCurso} - ${alunoClasse} - Turma ${alunoTurma}).`;
    if (postsListHeading) postsListHeading.textContent = `Recados para ${alunoCurso} (${alunoClasse} Turma ${alunoTurma})`;
    if (currentTurmaIndicator) currentTurmaIndicator.textContent = `${alunoCurso} • ${alunoClasse} ${alunoTurma}`;
  } else {
    // Professor / Admin
    if (activeTurmaFilter === 'todas') {
      if (muralMainTitle) muralMainTitle.textContent = 'Mural & Calendário Escolar (Todas as Turmas)';
      if (muralMainDesc) muralMainDesc.textContent = 'Visão panorâmica de todos os avisos de turmas e eventos institucionais do IPPLN.';
      if (postsListHeading) postsListHeading.textContent = 'Todas as Publicações do IPPLN';
      if (currentTurmaIndicator) currentTurmaIndicator.textContent = 'Visão Geral';
    } else {
      if (muralMainTitle) muralMainTitle.textContent = `Mural & Calendário • Turma ${activeTurmaFilter}`;
      if (muralMainDesc) muralMainDesc.textContent = `Acompanhamento pedagógico e cronograma de provas da turma ${activeTurmaFilter}.`;
      if (postsListHeading) postsListHeading.textContent = `Recados da Turma ${activeTurmaFilter}`;
      if (currentTurmaIndicator) currentTurmaIndicator.textContent = `Turma ${activeTurmaFilter}`;
    }
  }
}

// ==========================================
// Inicialização da Página do Mural
// ==========================================
async function initMuralPage() {
  initSidebar();
  mouseTrack();

  // ACESSO: todos os perfis autenticados (aluno, professor, admin). Sem sessão, redirecciona para login.html.
  const profile = await requireAuth(['aluno', 'professor', 'admin']);
  if (!profile) return;

  currentProfile = profile;
  currentUser = profile;

  // 1. Configura a Sidebar e o Rodapé
  setupSidebarByRole(currentProfile.role, currentProfile.nome);
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }
  setupDemoRoleSwitcher(currentProfile.role);

  // 3. Lê Parâmetros da URL (?turma=..., ?aba=calendario, ?acao=publicar, ?acao=novo_evento)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTurma = urlParams.get('turma');
  const paramAba = urlParams.get('aba');
  const paramAcao = urlParams.get('acao');

  const isAluno = currentProfile.role === 'aluno' || currentProfile.role === 'student';

  // 4. Configuração Visual baseada no Perfil:
  if (isAluno) {
    // REGRAS ESTRITAS PARA ALUNO:
    // - Vê apenas o mural da sua própria turma, classe e curso
    // - Nenhum formulário ou botão de publicação visível
    if (studentTurmaBadgeWrap) studentTurmaBadgeWrap.style.display = 'block';
    if (teacherTurmaSelectorWrap) teacherTurmaSelectorWrap.style.display = 'none';
    if (teacherAdminActions) teacherAdminActions.style.display = 'none';

    // Remove do DOM ou esconde totalmente os modais de publicação para alunos
    if (modalNewPost) {
      modalNewPost.setAttribute('aria-hidden', 'true');
      modalNewPost.style.display = 'none';
    }
    if (modalNewEvent) {
      modalNewEvent.setAttribute('aria-hidden', 'true');
      modalNewEvent.style.display = 'none';
    }

    activeTurmaFilter = currentProfile.turma || 'A';
  } else {
    // REGRAS PARA PROFESSOR E ADMIN:
    // - Selector de turma no topo
    // - Botões de publicação visíveis
    if (studentTurmaBadgeWrap) studentTurmaBadgeWrap.style.display = 'none';
    if (teacherTurmaSelectorWrap) teacherTurmaSelectorWrap.style.display = 'flex';
    if (teacherAdminActions) teacherAdminActions.style.display = 'flex';

    await populateTurmaOptions();

    if (paramTurma && paramTurma.trim()) {
      activeTurmaFilter = paramTurma.trim();
      if (turmaFilterSelect) turmaFilterSelect.value = activeTurmaFilter;
    } else {
      activeTurmaFilter = 'todas';
      if (turmaFilterSelect) turmaFilterSelect.value = 'todas';
    }

    // Evento de alteração no seletor de turma
    if (turmaFilterSelect) {
      turmaFilterSelect.addEventListener('change', (e) => {
        activeTurmaFilter = e.target.value;
        updateTurmaDisplay();
        loadMuralPosts();
        loadCalendarEvents();
      });
    }

    // Configurar Modais de Publicação
    if (btnOpenPostModal) btnOpenPostModal.addEventListener('click', openPostModal);
    if (btnClosePostModal) btnClosePostModal.addEventListener('click', closePostModal);
    if (btnCancelPostModal) btnCancelPostModal.addEventListener('click', closePostModal);
    if (formCreatePost) formCreatePost.addEventListener('submit', handleCreatePostSubmit);

    if (btnOpenEventModal) btnOpenEventModal.addEventListener('click', openEventModal);
    if (btnCloseEventModal) btnCloseEventModal.addEventListener('click', closeEventModal);
    if (btnCancelEventModal) btnCancelEventModal.addEventListener('click', closeEventModal);
    if (formCreateEvent) formCreateEvent.addEventListener('submit', handleCreateEventSubmit);
  }

  // 5. Configurar Abas de Navegação (Mural vs Calendário) e Filtros
  if (tabBtnMural) tabBtnMural.addEventListener('click', () => switchTab('mural'));
  if (tabBtnCalendar) tabBtnCalendar.addEventListener('click', () => switchTab('calendar'));
  setupCalendarCategoryFilters();

  if (paramAba === 'calendario') {
    switchTab('calendar');
  }

  // 6. Atualizar Textos e Carregar Dados
  updateTurmaDisplay();
  await loadMuralPosts();
  await loadCalendarEvents();

  // 7. Ações directas via URL para professores/admin vindos do Dashboard
  if (currentProfile.role !== 'aluno') {
    if (paramAcao === 'publicar') {
      setTimeout(() => openPostModal(), 300);
    } else if (paramAcao === 'novo_evento') {
      setTimeout(() => openEventModal(), 300);
    }
  }

  // Ocultar Overlay de Sessão
  if (sessionOverlay) {
    sessionOverlay.classList.add('fade-out');
    setTimeout(() => {
      sessionOverlay.style.display = 'none';
    }, 300);
  }
}

// Fechar modais ao clicar no backdrop ou pressionar ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePostModal();
    closeEventModal();
  }
});

[modalNewPost, modalNewEvent].forEach(modal => {
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePostModal();
        closeEventModal();
      }
    });
  }
});

// Arrancar a aplicação
document.addEventListener('DOMContentLoaded', initMuralPage);
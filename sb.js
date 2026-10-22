import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const URL  = 'https://qdvodepwatjnoczgfjgv.supabase.co';
const ANON = 'sb_publishable_Fh8LqzjabeF9D77J1cyNrA_qDrX0ySg';

export const sb = createClient(URL, ANON);

// Cliente isolado (sem persistência) usado pelo admin para registar novas contas
// sem substituir a sessão actual do administrador no browser.
export function createIsolatedClient() {
  return createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'policloud-isolated-signup' }
  });
}

export const CURSOS  = ['Informática','Electrónica','Desenhador Projetista','Frio e Climatização','Mecânica','Perfuração e Petróleo','Energias Renováveis'];
export const CLASSES = ['10ª','11ª','12ª','13ª'];
export const TURMAS  = ['A', 'B', 'C', 'D'];
export const DISCIPLINAS = [
  'Redes de Computadores',
  'Sistemas Digitais',
  'Programação Web',
  'Técnicas e Linguagens de Programação',
  'Sistemas Operativos',
  'Máquinas Eléctricas',
  'Circuitos Electrónicos',
  'Electrotecnia Teórica',
  'Tecnologia dos Materiais',
  'Desenho Técnico',
  'Instalações Eléctricas',
  'Matemática',
  'Física',
  'Química',
  'Língua Portuguesa',
  'Língua Inglesa',
  'Educação Física',
  'Formação de Atitudes Integradoras',
  'Organização e Gestão Industrial'
];

export function normStr(s) {
  return (s || '').toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function cleanTurma(t) {
  if (!t) return '';
  let s = String(t).trim();
  if (/^turma\s+/i.test(s)) s = s.replace(/^turma\s+/i, '').trim();
  if (s.includes('-')) {
    const match = s.match(/([A-Za-zÀ-ÿ]+)$/);
    if (match) return match[1].toUpperCase();
  }
  return s;
}

export function sameCourse(c1, c2) {
  if (!c1 || !c2) return false;
  const s1 = normStr(c1).replace(/^tecnico de\s+/, '');
  const s2 = normStr(c2).replace(/^tecnico de\s+/, '');
  if (s1 === s2) return true;
  if ((s1 === 'eletricidade' || s1 === 'electricidade') && (s2 === 'eletricidade' || s2 === 'electricidade')) return true;
  if ((s1 === 'eletronica' || s1 === 'electronica') && (s2 === 'eletronica' || s2 === 'electronica')) return true;
  return false;
}

export function parseArrayField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? v.trim() : v).filter(Boolean);
  if (typeof val === 'string') {
    val = val.trim();
    if (!val) return [];
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    if (val.includes(',')) {
      return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [val];
  }
  return [];
}

export function enrichTeacherFromDisciplinas(profile, disciplinasDB = []) {
  if (!profile) return profile;
  const r = (profile.role || '').toLowerCase();
  if (r !== 'professor' && r !== 'teacher') return profile;

  let atrs = [];
  if (Array.isArray(profile.atribuicoes_curriculares)) {
    atrs = [...profile.atribuicoes_curriculares];
  } else if (typeof profile.atribuicoes_curriculares === 'string' && profile.atribuicoes_curriculares.trim().startsWith('[')) {
    try { atrs = JSON.parse(profile.atribuicoes_curriculares); } catch (e) { atrs = []; }
  }

  // Enriquecer com atribuições vindas da tabela disciplinas (professores_turmas)
  if (Array.isArray(disciplinasDB) && disciplinasDB.length > 0) {
    disciplinasDB.forEach(disc => {
      if (!disc || !disc.professores_turmas) return;
      let turmaMap = disc.professores_turmas;
      if (typeof turmaMap === 'string') {
        try { turmaMap = JSON.parse(turmaMap); } catch (e) { turmaMap = {}; }
      }
      if (!turmaMap || typeof turmaMap !== 'object') return;

      const matchedTurmas = [];
      Object.entries(turmaMap).forEach(([turmaKey, profVal]) => {
        if (!profVal) return;
        const profId = typeof profVal === 'object' ? profVal.id : String(profVal);
        const profNome = typeof profVal === 'object' ? profVal.nome : '';
        if (
          (profile.id && String(profId) === String(profile.id)) ||
          (profile.nome && profNome && normStr(profNome) === normStr(profile.nome))
        ) {
          const letter = cleanTurma(turmaKey);
          if (letter && !matchedTurmas.includes(letter)) matchedTurmas.push(letter);
        }
      });

      if (matchedTurmas.length > 0 && disc.curso) {
        const existingAtr = atrs.find(a =>
          sameCourse(a.curso, disc.curso) &&
          normStr(a.classe || '10ª') === normStr(disc.classe || '10ª') &&
          normStr(a.disciplina) === normStr(disc.nome)
        );
        if (existingAtr) {
          const tSet = new Set([...(existingAtr.turmas || []).map(cleanTurma), ...matchedTurmas]);
          existingAtr.turmas = Array.from(tSet);
        } else {
          atrs.push({
            disciplina: disc.nome,
            curso: disc.curso,
            classe: disc.classe && disc.classe !== 'Todas' ? disc.classe : '10ª',
            turmas: matchedTurmas
          });
        }
      }
    });
  }

  profile.atribuicoes_curriculares = atrs;

  const cursosSet = new Set(parseArrayField(profile.cursos || profile.curso).filter(c => normStr(c) !== 'geral' && normStr(c) !== 'todos'));
  const classesSet = new Set(parseArrayField(profile.classes || profile.classe).filter(c => normStr(c) !== 'todas' && normStr(c) !== 'geral'));
  const turmasSet = new Set(parseArrayField(profile.turmas || profile.turma).map(cleanTurma).filter(t => t && normStr(t) !== 'todas' && normStr(t) !== 'geral'));
  const discsSet = new Set(parseArrayField(profile.disciplinas || profile.disciplina));

  atrs.forEach(a => {
    if (a.curso && normStr(a.curso) !== 'geral' && normStr(a.curso) !== 'todos') cursosSet.add(a.curso);
    if (a.classe && normStr(a.classe) !== 'todas' && normStr(a.classe) !== 'geral') classesSet.add(a.classe);
    if (a.disciplina) discsSet.add(a.disciplina);
    if (Array.isArray(a.turmas)) {
      a.turmas.forEach(t => {
        const ct = cleanTurma(t);
        if (ct && normStr(ct) !== 'todas') turmasSet.add(ct);
      });
    }
  });

  profile.cursos = Array.from(cursosSet);
  profile.classes = Array.from(classesSet);
  profile.turmas = Array.from(turmasSet);
  profile.disciplinas = Array.from(discsSet);

  return profile;
}

export function normalizeAndHealProfile(profile, disciplinasDB = [], userMeta = null) {
  if (!profile) return profile;

  profile.nome = profile.full_name || profile.nome || (userMeta && (userMeta.full_name || userMeta.nome)) || '';

  const r = (profile.role || (userMeta && userMeta.role) || '').toLowerCase();
  if (r === 'student' || r === 'aluno') {
    profile.role = 'aluno';
  } else if (r === 'teacher' || r === 'professor') {
    profile.role = 'professor';
  } else if (r === 'admin') {
    profile.role = 'admin';
  }
  profile.rolePT = profile.role;

  // Fallback para user_metadata (caso o RPC admin_create_user_profile tenha falhado no enum curso_type)
  if (userMeta) {
    if (!profile.curso && userMeta.curso) profile.curso = userMeta.curso;
    if (!profile.classe && userMeta.classe) profile.classe = userMeta.classe;
    if (!profile.turma && userMeta.turma) profile.turma = cleanTurma(userMeta.turma);
    if ((!profile.cursos || profile.cursos.length === 0) && userMeta.cursos) profile.cursos = parseArrayField(userMeta.cursos);
    if ((!profile.classes || profile.classes.length === 0) && userMeta.classes) profile.classes = parseArrayField(userMeta.classes);
    if ((!profile.turmas || profile.turmas.length === 0) && userMeta.turmas) profile.turmas = parseArrayField(userMeta.turmas).map(cleanTurma).filter(Boolean);
    if ((!profile.disciplinas || profile.disciplinas.length === 0) && userMeta.disciplinas) profile.disciplinas = parseArrayField(userMeta.disciplinas);
    if (!profile.disciplina && userMeta.disciplina) profile.disciplina = userMeta.disciplina;
    if (!profile.atribuicoes_curriculares && userMeta.atribuicoes_curriculares) {
      profile.atribuicoes_curriculares = userMeta.atribuicoes_curriculares;
    }
  }

  // Recuperação de contas criadas antes da correção do enum curso_type no Supabase
  const emailLower = (profile.email || '').toLowerCase();
  if (!profile.curso && (profile.id === '3ec19464-5987-4df2-ad41-f6ec0069937e' || emailLower === 'svetlana@ippln.ao')) {
    profile.curso = 'Telecomunicações';
    profile.classe = profile.classe || '10ª';
    profile.turma = cleanTurma(profile.turma || 'A');
    profile._needsDbHeal = true;
  }
  if ((!profile.curso && (!profile.cursos || profile.cursos.length === 0)) && (profile.id === 'ed7ed6dc-6f00-4d9c-bf5f-c09612f6fb8e' || emailLower === 'alberto@ippln.ao')) {
    profile.curso = 'Telecomunicações';
    profile.classe = profile.classe || '10ª';
    profile.turma = cleanTurma(profile.turma || 'A');
    profile.cursos = ['Telecomunicações'];
    profile.classes = [profile.classe];
    profile.turmas = [profile.turma];
    if (!profile.disciplinas || profile.disciplinas.length === 0) {
      profile.disciplinas = ['Intro Telecomunicações'];
      profile.disciplina = 'Intro Telecomunicações';
    }
    profile._needsDbHeal = true;
  }

  if (profile.role === 'aluno') {
    if (profile.turma) {
      profile.turma = cleanTurma(profile.turma);
    }
  } else if (profile.role === 'professor') {
    enrichTeacherFromDisciplinas(profile, disciplinasDB);
  } else {
    profile.cursos = parseArrayField(profile.cursos || profile.curso);
    profile.classes = parseArrayField(profile.classes || profile.classe);
    profile.turmas = parseArrayField(profile.turmas || profile.turma).map(cleanTurma).filter(Boolean);
    profile.disciplinas = parseArrayField(profile.disciplinas || profile.disciplina);
  }

  return profile;
}

export async function getProfile() {
  try {
    const { data } = await sb.auth.getUser();
    const user = data ? data.user : null;
    if (!user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profile) {
      const dbCursoBefore = profile.curso;
      const dbClasseBefore = profile.classe;
      const dbTurmaBefore = profile.turma;

      let discsDB = [];
      const r = (profile.role || user.user_metadata?.role || '').toLowerCase();
      if (r === 'teacher' || r === 'professor') {
        try {
          const { data: dData } = await sb.from('disciplinas').select('nome, curso, classe, professores_turmas');
          if (Array.isArray(dData)) discsDB = dData;
        } catch (_) {}
      }

      normalizeAndHealProfile(profile, discsDB, user.user_metadata || {});

      // Auto-reparar na tabela profiles se faltavam campos que estavam em user_metadata ou disciplinas
      if (
        profile._needsDbHeal ||
        (!dbCursoBefore && profile.curso) ||
        (!dbClasseBefore && profile.classe) ||
        (!dbTurmaBefore && profile.turma)
      ) {
        const healPayload = {
          curso: profile.curso || (Array.isArray(profile.cursos) && profile.cursos.length > 0 ? profile.cursos.join(', ') : null),
          classe: profile.classe || (Array.isArray(profile.classes) && profile.classes.length > 0 ? profile.classes.join(', ') : null),
          turma: profile.turma || (Array.isArray(profile.turmas) && profile.turmas.length > 0 ? profile.turmas.join(', ') : null)
        };
        if (profile.role === 'professor') {
          healPayload.cursos = profile.cursos || [];
          healPayload.classes = profile.classes || [];
          healPayload.turmas = profile.turmas || [];
          healPayload.disciplinas = profile.disciplinas || [];
          healPayload.disciplina = (profile.disciplinas || []).join(', ') || profile.disciplina || null;
        }
        sb.from('profiles').update(healPayload).eq('id', user.id).then(() => {}).catch(() => {});
      }
    }
    return profile;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(roles = null) {
  const p = await getProfile();
  if (!p || !p.is_active) { await sb.auth.signOut(); location.href = 'login.html'; return null; }
  if (roles) {
    const userRole = (p.role || '').toLowerCase();
    const hasRole = roles.some(r => {
      const target = r.toLowerCase();
      if (userRole === target) return true;
      if (userRole === 'teacher' && target === 'professor') return true;
      if (userRole === 'professor' && target === 'teacher') return true;
      if (userRole === 'student' && target === 'aluno') return true;
      if (userRole === 'aluno' && target === 'student') return true;
      return false;
    });
    if (!hasRole) { location.href = 'login.html'; return null; }
  }
  return p;
}

export async function signOut() {
  try {
    const keysToRemove = [
      'policloud_chat_messages',
      'policloud_demo_files',
      'policloud_admin_users',
      'policloud_demo_mural_posts',
      'policloud_demo_calendar_events',
      'policloud_demo_mural',
      'policloud_seen_folders',
      'policloud_dismissed_push_notifications',
      'policloud_student_dismissed_notifications'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (_) {}
  await sb.auth.signOut();
  location.href = 'login.html';
}

export async function log(action, entity = null, eid = null, uname = '') {
  const { data:{ user } } = await sb.auth.getUser();
  if (!user) return;
  sb.from('activity_log').insert({ user_id: user.id, user_name: uname, action, entity_type: entity, entity_id: eid || null });
}

export function toast(msg, type = 'success') {
  let c = document.getElementById('toastBox');
  if (!c) { c = document.createElement('div'); c.id = 'toastBox'; c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span><span class="toast-x" onclick="this.parentElement.remove()">×</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideOutR .25s ease forwards'; setTimeout(() => t.remove(), 260); }, 4000);
}

export function initials(n = '') { return (n||'U').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
export function fDate(s) { if (!s) return ''; return new Date(s).toLocaleDateString('pt-AO',{day:'2-digit',month:'short',year:'numeric'}); }
let _lastFocusedElement = null;
const _activeModals = new Set();

export function openM(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  _lastFocusedElement = document.activeElement;
  _activeModals.add(id);

  modal.classList.remove('hidden');
  modal.classList.add('open');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'false');
  if (!modal.getAttribute('role')) {
    modal.setAttribute('role', 'dialog');
  }

  document.body.style.overflow = 'hidden';

  // Foco inicial automático
  requestAnimationFrame(() => {
    const focusable = modal.querySelectorAll('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      const firstInput = Array.from(focusable).find(el => ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) || focusable[0];
      firstInput.focus();
    }
  });

  // Fecha ao clicar fora do cartão modal
  if (!modal._hasBackdropListener) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeM(id);
      }
    });
    modal._hasBackdropListener = true;
  }
}

export function closeM(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.remove('open');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  _activeModals.delete(id);

  if (_activeModals.size === 0) {
    document.body.style.overflow = '';
  }

  // Retorna foco para o elemento de origem
  if (_lastFocusedElement && typeof _lastFocusedElement.focus === 'function') {
    _lastFocusedElement.focus();
    _lastFocusedElement = null;
  }
}

/**
 * Modal de Confirmação Institucional e Seguro (Substitui confirm() nativo do navegador)
 * @param {Object} options
 * @param {string} options.title - Título do modal
 * @param {string} options.message - Mensagem descritiva da confirmação
 * @param {string} [options.confirmText='Confirmar'] - Texto do botão de confirmação
 * @param {string} [options.cancelText='Cancelar'] - Texto do botão de cancelamento
 * @param {boolean} [options.danger=true] - Se é uma acção destrutiva (vermelho) ou normal (azul)
 * @returns {Promise<boolean>}
 */
export function confirmModal({
  title = 'Confirmação',
  message = 'Tem a certeza de que pretende continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = true
} = {}) {
  return new Promise((resolve) => {
    let modal = document.getElementById('policloud-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'policloud-confirm-modal';
      modal.className = 'admin-modal-backdrop hidden';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.zIndex = '100000';
      modal.innerHTML = `
        <div class="admin-modal-card" style="max-width: 440px; border-radius: var(--radius-xl, 20px); overflow: hidden; padding: 0; border: 1px solid var(--color-border-subtle); box-shadow: var(--shadow-lg);">
          <div style="padding: 30px 24px 20px; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div id="confirm-modal-icon-wrap" style="width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; flex-shrink: 0;"></div>
            <h2 id="confirm-modal-title" style="font-size: 18px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 8px; letter-spacing: -0.01em;"></h2>
            <p id="confirm-modal-message" style="font-size: 13.5px; color: var(--color-text-secondary); line-height: 1.5; margin: 0; white-space: pre-line; word-break: break-word;"></p>
          </div>
          <div style="padding: 16px 24px 24px; display: flex; gap: 12px; justify-content: center;">
            <button type="button" id="confirm-modal-btn-cancel" class="btn-modal-cancel" style="flex: 1; padding: 11px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
              Cancelar
            </button>
            <button type="button" id="confirm-modal-btn-confirm" class="btn-modal-submit" style="flex: 1; padding: 11px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
              Confirmar
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-message');
    const iconWrap = document.getElementById('confirm-modal-icon-wrap');
    const btnCancel = document.getElementById('confirm-modal-btn-cancel');
    const btnConfirm = document.getElementById('confirm-modal-btn-confirm');

    titleEl.textContent = title;
    msgEl.textContent = message;
    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    if (danger) {
      iconWrap.style.background = 'rgba(239, 68, 68, 0.12)';
      iconWrap.style.color = '#EF4444';
      iconWrap.style.border = '1px solid rgba(239, 68, 68, 0.25)';
      iconWrap.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `;
      btnConfirm.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
      btnConfirm.style.color = '#FFFFFF';
      btnConfirm.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.35)';
      btnConfirm.style.border = 'none';
    } else {
      iconWrap.style.background = 'rgba(37, 99, 235, 0.12)';
      iconWrap.style.color = 'var(--color-accent)';
      iconWrap.style.border = '1px solid rgba(37, 99, 235, 0.25)';
      iconWrap.innerHTML = `
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
      btnConfirm.style.background = 'var(--color-accent)';
      btnConfirm.style.color = '#FFFFFF';
      btnConfirm.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
      btnConfirm.style.border = 'none';
    }

    let isResolved = false;
    const cleanup = () => {
      btnConfirm.removeEventListener('click', onConfirm);
      btnCancel.removeEventListener('click', onCancel);
      modal.removeEventListener('click', onBackdrop);
      window.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
      closeM('policloud-confirm-modal');
    };

    const onConfirm = () => {
      if (isResolved) return;
      isResolved = true;
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      if (isResolved) return;
      isResolved = true;
      cleanup();
      resolve(false);
    };

    const onBackdrop = (e) => {
      if (e.target === modal) {
        onCancel();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    const observer = new MutationObserver(() => {
      if (modal.classList.contains('hidden') && !isResolved) {
        onCancel();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

    btnConfirm.addEventListener('click', onConfirm);
    btnCancel.addEventListener('click', onCancel);
    modal.addEventListener('click', onBackdrop);
    window.addEventListener('keydown', onKeyDown);

    openM('policloud-confirm-modal');

    // Foco inicial no Cancelar para segurança
    requestAnimationFrame(() => {
      if (btnCancel) btnCancel.focus();
    });
  });
}

// Listener global para fechar com Escape e trancar foco (focus trap)
if (typeof window !== 'undefined' && !window._modalGlobalListenersAttached) {
  window.addEventListener('keydown', (e) => {
    if (_activeModals.size === 0) return;

    // Fechar com Escape
    if (e.key === 'Escape') {
      const lastModalId = Array.from(_activeModals).pop();
      if (lastModalId) {
        e.preventDefault();
        closeM(lastModalId);
      }
      return;
    }

    // Focus Trap com Tab
    if (e.key === 'Tab') {
      const currentModalId = Array.from(_activeModals).pop();
      const currentModal = document.getElementById(currentModalId);
      if (!currentModal) return;

      const focusableElements = Array.from(currentModal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.offsetParent !== null);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });
  window._modalGlobalListenersAttached = true;
}

export function initSidebar() {
  const sb_ = document.querySelector('.sidebar-dark,.sidebar-light');
  const ov  = document.getElementById('sidebarOverlay');
  const hb  = document.getElementById('hb');
  if (!sb_ || !ov || !hb) return;
  hb.addEventListener('click', () => { sb_.classList.add('open'); ov.classList.add('open'); });
  ov.addEventListener('click', () => { sb_.classList.remove('open'); ov.classList.remove('open'); });
}

export function mouseTrack() {
  const page = document.querySelector('.dark-page');
  if (!page) return;
  document.addEventListener('mousemove', e => {
    page.style.setProperty('--mx', e.clientX + 'px');
    page.style.setProperty('--my', e.clientY + 'px');
  });
}

export function ftIcon(name) {
  const e = (name||'').split('.').pop().toLowerCase();
  const m = { pdf:['PDF','rgba(239,68,68,.15)','#F87171'], docx:['DOC','rgba(37,99,235,.15)','#60A5FA'], doc:['DOC','rgba(37,99,235,.15)','#60A5FA'], png:['IMG','rgba(168,85,247,.15)','#C084FC'], jpg:['IMG','rgba(168,85,247,.15)','#C084FC'], jpeg:['IMG','rgba(168,85,247,.15)','#C084FC'] };
  return m[e] || [e.toUpperCase()||'FILE','rgba(99,102,241,.15)','#A78BFA'];
}

export async function getCursosDB() {
  try {
    const { data, error } = await sb.from('cursos').select('*').order('nome', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const names = data.map(c => (c.nome || '').trim()).filter(Boolean);
      if (names.length > 0) {
        CURSOS.length = 0;
        CURSOS.push(...names);
      }
      return data;
    }
  } catch (e) {}
  return CURSOS.map(c => ({ id: null, nome: c }));
}

export async function getDisciplinasDB() {
  try {
    const { data, error } = await sb.from('disciplinas').select('*').order('nome', { ascending: true });
    if (!error && Array.isArray(data)) {
      return data;
    }
  } catch (e) {}
  return DISCIPLINAS.map(d => ({ id: d, nome: d, curso: 'Geral', classe: 'Todas', carga_horaria: '4h / semana' }));
}

export async function getTurmasDB() {
  try {
    const { data, error } = await sb.from('turmas_academicas').select('*').order('nome', { ascending: true });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (e) {}
  return TURMAS.map(t => ({ id: t, nome: t, curso: 'Informática', classe: '10ª' }));
}

export async function downloadStorageFile(storagePath, fileId = null, userName = '') {
  if (!storagePath) return;
  if (/^https?:\/\//i.test(storagePath) || storagePath.startsWith('data:')) {
    window.open(storagePath, '_blank', 'noopener,noreferrer');
    return;
  }
  toast('A preparar download seguro...', 'info');
  try {
    const { data, error } = await sb.storage.from('policloud').createSignedUrl(storagePath, 60, {
      download: true
    });
    if (error || !data?.signedUrl) throw error || new Error('URL indisponível');
    if (fileId) {
      try { await log('download_ficheiro', 'files', fileId, userName); } catch (_) {}
    }
    window.location.href = data.signedUrl;
  } catch (err) {
    console.error('Erro ao descarregar ficheiro:', err);
    toast('Erro ao descarregar ficheiro.', 'error');
  }
}

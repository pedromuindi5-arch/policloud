// PoliCloud - Intranet Escolar IPPLN
// Lógica do Dashboard do Aluno (dashboard-aluno.html)

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS, cleanTurma, sameCourse, normStr, downloadStorageFile } from './sb.js';
import { getStudentAlerts,
  initRealtimeMessages, dismissStudentAlert, dismissPushNotification, markMessagesAsReadForUser } from './messages-service.js';
import './theme.js';

// Elementos do DOM
const sessionOverlay = document.getElementById('session-check-overlay');
const studentAvatar = document.getElementById('student-avatar');
const studentName = document.getElementById('student-name');
const studentCourse = document.getElementById('student-course');
const studentClasse = document.getElementById('student-classe');
const studentTurma = document.getElementById('student-turma');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');

const newsContainer = document.getElementById('news-container');
const filesContainer = document.getElementById('files-container');
const muralContainer = document.getElementById('mural-container');

/**
 * Formata tempo decorrido relativo
 * @param {string} dateString 
 * @returns {string}
 */
function formatTimeRelative(dateString) {
  if (!dateString) return '';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hoje há poucos instantes';
    if (diffHours < 24) return `Hoje às ${new Date(dateString).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`;
    return fDate(dateString);
  } catch (e) {
    return fDate(dateString);
  }
}

/**
 * Carrega as notícias mais recentes (gerais para toda a escola)
 */
async function loadRecentNews() {
  if (!newsContainer) return;

  try {
    const { data: news, error } = await sb
      .from('news')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      newsContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar as notícias de momento.</span>
        </div>
      `;
      return;
    }

    if (!news || news.length === 0) {
      newsContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/>
            <path d="M15 18h-5"/>
            <path d="M10 6h8v4h-8V6Z"/>
          </svg>
          <span>Não existem notícias publicadas recentemente.</span>
        </div>
      `;
      return;
    }

    newsContainer.innerHTML = news.map(item => `
      <article class="news-item">
        <span class="news-item-date">${fDate(item.created_at)}</span>
        <h4 class="news-item-title">${escapeHtml(item.title || 'Comunicado Escolar')}</h4>
        <p class="news-item-desc">${escapeHtml(item.content || item.body || '')}</p>
      </article>
    `).join('');
  } catch (err) {
    newsContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar as notícias escolares.</span>
      </div>
    `;
  }
}

/**
 * Carrega os ficheiros recentes para o curso/turma do aluno
 * @param {any} profile
 */
async function loadStudentFiles(profile) {
  if (!filesContainer) return;

  try {
    const { data: rawFiles, error } = await sb
      .from('files')
      .select('id, name, file_url, size, curso, classe, turma, uploader_id, uploader_role, visibility, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar os ficheiros da nuvem.</span>
        </div>
      `;
      return;
    }

    const studentCurso = profile.curso || '';
    const studentClasse = profile.classe || '';
    const studentTurma = cleanTurma(profile.turma || '');

    const files = (rawFiles || []).filter(file => {
      if (!studentCurso || !file.curso || !sameCourse(file.curso, studentCurso)) return false;
      if (studentClasse && file.classe && normStr(file.classe) !== normStr(studentClasse)) return false;
      if (studentTurma && (!file.turma || normStr(cleanTurma(file.turma)) !== normStr(studentTurma))) return false;
      const isStudentUpload = file.uploader_role === 'aluno' || file.uploader_role === 'student' || file.visibility === 'professor';
      if (isStudentUpload && String(file.uploader_id || '') !== String(profile.id || '')) return false;
      return true;
    }).slice(0, 4);

    if (!files || files.length === 0) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>Nenhum ficheiro recente para a sua turma.</span>
        </div>
      `;
      return;
    }

    filesContainer.innerHTML = files.map(file => `
      <div class="file-item">
        <div class="file-info-group">
          <div class="file-type-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            </svg>
          </div>
          <div class="file-text-meta">
            <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name || 'Documento')}</span>
            <span class="file-details">${file.size ? formatFileSize(file.size) : 'Ficheiro'} • ${fDate(file.created_at)}</span>
          </div>
        </div>
        ${file.file_url ? `
          <button type="button" class="file-download-link" data-file-url="${escapeHtml(file.file_url)}" data-file-id="${escapeHtml(file.id)}" title="Transferir ficheiro" style="background:none;border:none;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `).join('');

    filesContainer.querySelectorAll('.file-download-link[data-file-url]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadStorageFile(btn.getAttribute('data-file-url'), btn.getAttribute('data-file-id'), profile.nome);
      });
    });
  } catch (err) {
    filesContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar ficheiros escolares.</span>
      </div>
    `;
  }
}

/**
 * Carrega a prévia dos últimos recados do mural da turma do aluno
 * @param {any} profile
 */
async function loadMuralPreview(profile) {
  if (!muralContainer) return;

  try {
    const { data: rawPosts, error } = await sb
      .from('mural_posts')
      .select('id, author_name, author_role, content, curso, classe, turma, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar os avisos do mural da turma.</span>
        </div>
      `;
      return;
    }

    const studentCurso = profile.curso || '';
    const studentClasse = profile.classe || '';
    const studentTurma = cleanTurma(profile.turma || '');

    const posts = (rawPosts || []).filter(post => {
      const pCurso = post.curso && post.curso !== 'todos' && post.curso !== 'Geral' ? post.curso : null;
      const pClasse = post.classe && post.classe !== 'todas' && post.classe !== 'Geral' ? post.classe : null;
      const pTurma = post.turma && post.turma !== 'todas' && post.turma !== 'Geral' ? cleanTurma(post.turma) : null;
      const isAdminGlobal = (post.author_role === 'admin' || (!pCurso && !pClasse && !pTurma && (post.author_name || '').toLowerCase().includes('admin')));

      if (isAdminGlobal && !pCurso && !pClasse && !pTurma) return true;
      if (!pCurso || !studentCurso || !sameCourse(pCurso, studentCurso)) return false;
      if (pClasse && studentClasse && normStr(pClasse) !== normStr(studentClasse)) return false;
      if (pTurma && studentTurma && normStr(pTurma) !== normStr(studentTurma)) return false;
      return true;
    }).slice(0, 3);

    if (!posts || posts.length === 0) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <span>O mural da turma está calmo. Nenhum aviso pendente.</span>
        </div>
      `;
      return;
    }

    muralContainer.innerHTML = posts.map(post => `
      <div class="mural-post-item">
        <div class="mural-post-meta">
          <span class="mural-author">${escapeHtml(post.author_name || 'Professor / Secretaria')}</span>
          <span class="mural-time">${formatTimeRelative(post.created_at)}</span>
        </div>
        <p class="mural-content-text">${escapeHtml(post.content || '')}</p>
      </div>
    `).join('');
  } catch (err) {
    muralContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao carregar os avisos do mural.</span>
      </div>
    `;
  }
}

/**
 * Utilitários auxiliares
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Inicialização do Dashboard do Aluno
 */
async function initStudentDashboard() {
  initSidebar();
  mouseTrack();

  const profile = await requireAuth(['aluno']);
  if (!profile) return;

  // Preenchimento dos dados do perfil no cabeçalho
  const displayName = profile.nome || profile.full_name || 'Estudante IPPLN';
  const displayInitials = initials(displayName);

  if (studentName) studentName.textContent = displayName;
  if (studentAvatar) studentAvatar.textContent = displayInitials;
  if (sidebarUserName) sidebarUserName.textContent = displayName;
  if (sidebarUserAvatar) sidebarUserAvatar.textContent = displayInitials;

  if (studentCourse) studentCourse.textContent = profile.curso ? `Curso: ${profile.curso}` : 'Curso Técnico';
  if (studentClasse) studentClasse.textContent = profile.classe ? `${profile.classe} Classe` : 'Ensino Técnico Médio';
  if (studentTurma) studentTurma.textContent = profile.turma ? `Turma: ${profile.turma}` : 'IPPLN';

  // Configurar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }

  // Carregar blocos do dashboard em paralelo
  await Promise.all([
    loadRecentNews(),
    loadStudentFiles(profile),
    loadMuralPreview(profile),
    loadStudentNotifications(profile)
  ]);

  // Ouvir mensagens atualizadas em tempo real
  window.addEventListener('policloud_chat_updated', async () => {
    await loadStudentNotifications(profile);
  });

  // Remove overlay
  if (sessionOverlay) {
    sessionOverlay.classList.add('hidden');
  }
}

/**
 * Carrega e exibe alertas/notificações push no topo do painel do aluno
 */
async function loadStudentNotifications(profile) {
  const container = document.getElementById('student-notifications-area');
  const badge = document.getElementById('sidebar-unread-badge');
  if (!container) return;

  try {
    const alerts = await getStudentAlerts(profile);

    if (alerts.length === 0) {
      container.innerHTML = '';
      if (badge) badge.classList.add('hidden');
      return;
    }

    if (badge) badge.classList.remove('hidden');

    container.innerHTML = alerts.map(a => {
      return `
        <div class="student-notification-banner" data-alert-id="${escapeHtml(a.id)}">
          <div class="alert-left">
            <div class="alert-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <div class="alert-title">${escapeHtml(a.title)}</div>
              <div class="alert-desc">${escapeHtml(a.description)}</div>
            </div>
          </div>
          <div class="alert-actions">
            <button type="button" class="btn btn-secondary btn-sm btn-dismiss-alert" style="padding: 6px 12px; font-size: 12px;">Dispensar</button>
            <a href="${a.link}" class="btn btn-primary btn-sm btn-view-alert" style="padding: 6px 14px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
              <span>Ver</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Listener para dispensar ou ver alerta
    container.querySelectorAll('.student-notification-banner').forEach(banner => {
      const alertId = banner.getAttribute('data-alert-id');
      const btnDismiss = banner.querySelector('.btn-dismiss-alert');
      const btnView = banner.querySelector('.btn-view-alert');

      if (btnDismiss) {
        btnDismiss.addEventListener('click', () => {
          dismissStudentAlert(alertId);
          if (alertId.startsWith('msg-')) {
            const rawId = alertId.replace('msg-', '');
            dismissPushNotification(rawId);
            if (profile?.id) markMessagesAsReadForUser(profile.id, [rawId]);
          }
          banner.remove();
          if (container.children.length === 0 && badge) {
            badge.classList.add('hidden');
          }
        });
      }

      if (btnView) {
        btnView.addEventListener('click', () => {
          dismissStudentAlert(alertId);
          if (alertId.startsWith('msg-')) {
            const rawId = alertId.replace('msg-', '');
            dismissPushNotification(rawId);
            if (profile?.id) markMessagesAsReadForUser(profile.id, [rawId]);
          }
        });
      }
    });

  } catch (err) {
    console.warn('Erro ao carregar notificações do aluno:', err);
  }
}

// Atualizar alertas quando a janela recebe foco (ex: volta do chat)
window.addEventListener('focus', async () => {
  const profile = await getProfile();
  if (profile) await loadStudentNotifications(profile);
});

initStudentDashboard();



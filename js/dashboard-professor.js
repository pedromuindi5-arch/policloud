// PoliCloud - Intranet Escolar IPPLN
// Lógica do Dashboard do Professor (dashboard-professor.html)

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
import { checkNewMessagePushForTeacher,
  initRealtimeMessages, dismissPushNotification, markMessagesAsReadForUser } from './messages-service.js';
import './theme.js';

// Elementos do DOM
const sessionOverlay = document.getElementById('session-check-overlay');
const teacherName = document.getElementById('teacher-name');
const teacherAvatar = document.getElementById('teacher-avatar');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');

const turmaSelect = document.getElementById('turma-select');
const muralContainer = document.getElementById('mural-container');
const filesContainer = document.getElementById('files-container');
const eventsContainer = document.getElementById('events-container');

// Links dos atalhos dinâmicos
const shortcutMural = document.getElementById('shortcut-mural');
const shortcutCloud = document.getElementById('shortcut-cloud');
const shortcutEvent = document.getElementById('shortcut-event');
const linkMuralViewAll = document.getElementById('link-mural-view-all');
const linkCloudViewAll = document.getElementById('link-cloud-view-all');
const linkEventViewAll = document.getElementById('link-event-view-all');

/**
 * Utilitários de escape e formato
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatTimeRelative(dateString) {
  if (!dateString) return '';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hoje há pouco';
    if (diffHours < 24) return `Hoje às ${new Date(dateString).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`;
    return fDate(dateString);
  } catch (e) {
    return fDate(dateString);
  }
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Atualiza os parâmetros de URL nos atalhos rápidos de acordo com a turma selecionada
 * @param {string} selectedTurma 
 */
function updateShortcutLinks(selectedTurma) {
  const turmaParam = selectedTurma && selectedTurma !== 'todas' ? `?turma=${encodeURIComponent(selectedTurma)}` : '';
  const modalParamMural = selectedTurma && selectedTurma !== 'todas' ? `?turma=${encodeURIComponent(selectedTurma)}&acao=publicar` : '?acao=publicar';
  const modalParamCloud = selectedTurma && selectedTurma !== 'todas' ? `?turma=${encodeURIComponent(selectedTurma)}&acao=carregar` : '?acao=carregar';
  const modalParamEvent = selectedTurma && selectedTurma !== 'todas' ? `?turma=${encodeURIComponent(selectedTurma)}&aba=calendario&acao=novo_evento` : '?aba=calendario&acao=novo_evento';

  if (shortcutMural) shortcutMural.href = `/mural.html${modalParamMural}`;
  if (shortcutCloud) shortcutCloud.href = `/cloud.html${modalParamCloud}`;
  if (shortcutEvent) shortcutEvent.href = `/mural.html${modalParamEvent}`;

  if (linkMuralViewAll) linkMuralViewAll.href = `/mural.html${turmaParam}`;
  if (linkCloudViewAll) linkCloudViewAll.href = `/cloud.html${turmaParam}`;
  if (linkEventViewAll) linkEventViewAll.href = `/mural.html${turmaParam ? turmaParam + '&aba=calendario' : '?aba=calendario'}`;
}

/**
 * Carrega a lista de turmas para o seletor a partir dos arrays padrão e registos da base de dados
 */
async function loadTurmasList(profile = null) {
  if (!turmaSelect) return;

  const teacherAssignedTurmas = profile && profile.turmas && profile.turmas.length > 0 ? profile.turmas : null;
  const turmasSet = new Set(teacherAssignedTurmas ? teacherAssignedTurmas : TURMAS);

  if (!teacherAssignedTurmas) {
    try {
      const { data: profiles, error } = await sb
        .from('profiles')
        .select('turma')
        .not('turma', 'is', null);

      if (!error && profiles) {
        profiles.forEach(p => {
          if (p.turma && p.turma.trim()) {
            turmasSet.add(p.turma.trim());
          }
        });
      }
    } catch (err) {
      // Mantém conjunto padrão
    }
  }

  const sortedTurmas = Array.from(turmasSet).sort();
  turmaSelect.innerHTML = `
    <option value="todas">Todas as Minhas Turmas</option>
    ${sortedTurmas.map(t => `<option value="${escapeHtml(t)}">Turma ${escapeHtml(t)}</option>`).join('')}
  `;
}

/**
 * Carrega posts recentes do mural da turma seleccionada
 * @param {string} selectedTurma 
 */
async function loadTurmaMural(selectedTurma) {
  if (!muralContainer) return;

  try {
    let query = sb
      .from('mural_posts')
      .select('id, author_name, content, turma, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    if (selectedTurma && selectedTurma !== 'todas') {
      query = query.or(`turma.eq.${selectedTurma},turma.is.null`);
    }

    const { data: posts, error } = await query;

    if (error) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar as publicações do mural de momento.</span>
        </div>
      `;
      return;
    }

    if (!posts || posts.length === 0) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <span>Nenhum recado ou aviso publicado nesta turma.</span>
        </div>
      `;
      return;
    }

    muralContainer.innerHTML = posts.map(post => `
      <div class="mural-post-item">
        <div class="mural-post-meta">
          <span class="mural-author">${escapeHtml(post.author_name || 'Docente')} ${post.turma ? `• Turma ${escapeHtml(post.turma)}` : '• Geral'}</span>
          <span class="mural-time">${formatTimeRelative(post.created_at)}</span>
        </div>
        <p class="mural-content-text">${escapeHtml(post.content || '')}</p>
      </div>
    `).join('');
  } catch (err) {
    muralContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar as publicações do mural.</span>
      </div>
    `;
  }
}

/**
 * Carrega ficheiros recentes partilhados para a turma seleccionada
 * @param {string} selectedTurma 
 */
async function loadTurmaFiles(selectedTurma) {
  if (!filesContainer) return;

  try {
    let query = sb
      .from('files')
      .select('id, name, file_url, size, curso, turma, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    if (selectedTurma && selectedTurma !== 'todas') {
      query = query.or(`turma.eq.${selectedTurma},turma.is.null`);
    }

    const { data: files, error } = await query;

    if (error) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível consultar os ficheiros desta turma.</span>
        </div>
      `;
      return;
    }

    if (!files || files.length === 0) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>Nenhum ficheiro partilhado para esta turma ainda.</span>
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
            <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name || 'Documento Pedagógico')}</span>
            <span class="file-details">${file.turma ? `Turma ${escapeHtml(file.turma)}` : 'Geral'} • ${file.size ? formatFileSize(file.size) : 'Ficheiro'} • ${fDate(file.created_at)}</span>
          </div>
        </div>
        ${file.file_url ? `
          <a href="${encodeURI(file.file_url)}" target="_blank" rel="noopener noreferrer" class="file-download-link" title="Descarregar ficheiro" download>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        ` : ''}
      </div>
    `).join('');
  } catch (err) {
    filesContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar ficheiros escolares.</span>
      </div>
    `;
  }
}

/**
 * Carrega próximos eventos do calendário escolar para a turma
 * @param {string} selectedTurma 
 */
async function loadTurmaEvents(selectedTurma) {
  if (!eventsContainer) return;

  try {
    let query = sb
      .from('calendar_events')
      .select('id, title, description, event_date, turma')
      .order('event_date', { ascending: true })
      .limit(4);

    if (selectedTurma && selectedTurma !== 'todas') {
      query = query.or(`turma.eq.${selectedTurma},turma.is.null`);
    }

    const { data: events, error } = await query;

    if (error) {
      eventsContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar os eventos da turma.</span>
        </div>
      `;
      return;
    }

    if (!events || events.length === 0) {
      eventsContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Sem avaliações ou eventos agendados para os próximos dias.</span>
        </div>
      `;
      return;
    }

    eventsContainer.innerHTML = events.map(event => {
      const dateObj = event.event_date ? new Date(event.event_date) : new Date();
      const day = isNaN(dateObj.getDate()) ? '15' : String(dateObj.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const month = isNaN(dateObj.getMonth()) ? 'Mês' : monthNames[dateObj.getMonth()];

      return `
        <div class="event-item">
          <div class="event-date-badge">
            <span class="event-date-day">${day}</span>
            <span class="event-date-month">${month}</span>
          </div>
          <div class="event-info">
            <h4 class="event-title">${escapeHtml(event.title || 'Atividade Académica')}</h4>
            <span class="event-meta-time">
              ${event.turma ? `Turma: ${escapeHtml(event.turma)}` : 'Geral IPPLN'}
            </span>
            ${event.description ? `<p class="event-desc">${escapeHtml(event.description)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    eventsContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar os eventos escolares.</span>
      </div>
    `;
  }
}

/**
 * Atualiza todos os blocos de dados ao mudar a turma seleccionada
 * @param {string} selectedTurma 
 */
async function refreshTurmaData(selectedTurma) {
  const loadingHtml = `
    <div class="state-loading">
      <div class="spinner spinner-light"></div>
      <span>A atualizar dados...</span>
    </div>
  `;
  if (muralContainer) muralContainer.innerHTML = loadingHtml;
  if (filesContainer) filesContainer.innerHTML = loadingHtml;
  if (eventsContainer) eventsContainer.innerHTML = loadingHtml;

  updateShortcutLinks(selectedTurma);

  await Promise.all([
    loadTurmaMural(selectedTurma),
    loadTurmaFiles(selectedTurma),
    loadTurmaEvents(selectedTurma)
  ]);
}

/**
 * Inicialização do Dashboard do Professor
 */
async function initTeacherDashboard() {
  initSidebar();
  mouseTrack();

  const profile = await requireAuth(['professor']);
  if (!profile) return;

  const displayName = profile.nome || profile.full_name || 'Professor IPPLN';
  const displayInitials = initials(displayName);

  if (teacherName) teacherName.textContent = displayName;
  if (teacherAvatar) teacherAvatar.textContent = displayInitials;
  if (sidebarUserName) sidebarUserName.textContent = displayName;
  if (sidebarUserAvatar) sidebarUserAvatar.textContent = displayInitials;

  // Configurar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }

  // Carregar turmas
  await loadTurmasList(profile);

  // Ouvir mudança de turma no selector
  if (turmaSelect) {
    turmaSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      refreshTurmaData(selected);
    });
  }

  const initialTurma = turmaSelect ? turmaSelect.value : 'todas';
  await refreshTurmaData(initialTurma);

  if (sessionOverlay) {
    sessionOverlay.classList.add('hidden');
  }

  // Verificação de Notificação Push de Nova Mensagem
  await checkAndShowPushNotification(profile);

  // Ouvir mensagens em tempo real enquanto o professor está no painel
  window.addEventListener('policloud_chat_updated', async () => {
    await checkAndShowPushNotification(profile);
  });
}

/**
 * Verifica mensagens de alunos e apresenta modal PUSH "NOVAS MENSAGENS"
 */
async function checkAndShowPushNotification(profile) {
  try {
    const unreadPush = await checkNewMessagePushForTeacher(profile);
    const badge = document.getElementById('sidebar-unread-badge');

    if (unreadPush && unreadPush.count > 0) {
      if (badge) badge.classList.remove('hidden');

      const pushModal = document.getElementById('push-message-modal');
      const pushAvatar = document.getElementById('push-sender-avatar');
      const pushName = document.getElementById('push-sender-name');
      const pushMeta = document.getElementById('push-sender-meta');
      const pushPreview = document.getElementById('push-message-preview');
      const btnOpenChat = document.getElementById('btn-open-push-chat');
      const btnCloseModal = document.getElementById('btn-close-push-modal');

      if (pushModal && pushName && pushPreview) {
        if (unreadPush.count === 1) {
          // Apenas uma mensagem
          const msg = unreadPush.latestMessage;
          if (pushAvatar) pushAvatar.textContent = initials(msg.sender_name);
          pushName.textContent = msg.sender_name || 'Aluno';
          if (pushMeta) {
            pushMeta.textContent = `Turma ${msg.turma || 'Geral'} • ${formatTimeRelative(msg.created_at)}`;
          }
          pushPreview.textContent = `"${msg.text}"`;
        } else {
          // Múltiplas mensagens
          if (pushAvatar) pushAvatar.textContent = '📬';
          pushName.textContent = `${unreadPush.count} Novas Mensagens`;
          if (pushMeta) {
            pushMeta.textContent = `De ${unreadPush.studentsCount} aluno(s)`;
          }
          pushPreview.textContent = `Pressione "Ler Mensagens" para ver as suas mensagens não lidas no chat.`;
        }

        if (btnOpenChat) {
          // Se for só uma, abre direto na conversa. Se forem várias, abre a janela principal de chat.
          const targetUrl = unreadPush.count === 1 
            ? `/mensagens.html?chat=${encodeURIComponent(unreadPush.latestMessage.conversation_id)}` 
            : `/mensagens.html`;
            
          btnOpenChat.href = targetUrl;
          btnOpenChat.onclick = () => {
            dismissPushNotification(unreadPush.idsToDismiss);
            if (profile?.id) markMessagesAsReadForUser(profile.id, unreadPush.idsToDismiss);
            if (badge) badge.classList.add('hidden');
          };
        }

        if (btnCloseModal) {
          btnCloseModal.onclick = () => {
            dismissPushNotification(unreadPush.idsToDismiss);
            if (profile?.id) markMessagesAsReadForUser(profile.id, unreadPush.idsToDismiss);
            closeM('push-message-modal');
            if (badge) badge.classList.add('hidden');
          };
        }

        // Abre o modal após pequeno delay para entrada suave
        setTimeout(() => {
          openM('push-message-modal');
        }, 600);
      }
    } else {
      if (badge) badge.classList.add('hidden');
    }
  } catch (e) {
    console.warn('Erro ao verificar push notification:', e);
  }
}

// Atualizar verificação quando a janela recebe foco (ex: volta do chat)
window.addEventListener('focus', async () => {
  const profile = await getProfile();
  if (profile) await checkAndShowPushNotification(profile);
});

initTeacherDashboard();



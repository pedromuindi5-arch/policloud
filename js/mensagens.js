// PoliCloud - Intranet Escolar IPPLN
// Lógica da Página de Mensagens & Chat (NetAcad Style) com Suporte a Anexos e Leitura

import { sb, getProfile, requireAuth, signOut, initials, fDate, initSidebar, mouseTrack, toast, ftIcon } from './sb.js';
import { 
  getConversationsListForUser, 
  getMessagesForConversation, 
  saveMessage,
  markConversationAsRead,
  dismissPushNotification,
  initRealtimeMessages,
  extractTurmaLetter,
  messageMatchesTurmaScope
} from './messages-service.js';
import './theme.js';

// Elementos do DOM
const sessionOverlay = document.getElementById('session-check-overlay');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserRole = document.getElementById('sidebar-user-role');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const navDashboardLink = document.getElementById('nav-dashboard-link');

const conversationsList = document.getElementById('conversations-list');
const chatSearchInput = document.getElementById('chat-search-input');
const chatTabBtns = document.querySelectorAll('.chat-tab-btn');

const chatActiveHeader = document.getElementById('chat-active-header');
const chatActiveAvatar = document.getElementById('chat-active-avatar');
const chatActiveTitle = document.getElementById('chat-active-title');
const chatActiveSubtitle = document.getElementById('chat-active-subtitle');
const chatActiveBadge = document.getElementById('chat-active-badge');

const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatEmptyState = document.getElementById('chat-empty-state');
const chatQuickReplies = document.getElementById('chat-quick-replies');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const btnSendMessage = document.getElementById('btn-send-message');

// Elementos de Anexo de Ficheiro
const btnAttachFile = document.getElementById('btn-attach-file');
const chatFileInput = document.getElementById('chat-file-input');
const chatAttachmentPreviewBar = document.getElementById('chat-attachment-preview-bar');
const chatAttachmentName = document.getElementById('chat-attachment-name');
const chatAttachmentSize = document.getElementById('chat-attachment-size');
const btnRemoveAttachment = document.getElementById('btn-remove-attachment');

// Estado
let currentProfile = null;
let allConversations = [];
let activeConversation = null;
let activeFilter = 'all';
let selectedAttachmentFile = null;

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

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoje às ${timeStr}`;
    return `${d.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })} ${timeStr}`;
  } catch (e) {
    return '';
  }
}

/**
 * Renderiza a lista de conversas
 */
function renderConversations() {
  if (!conversationsList) return;

  const query = (chatSearchInput?.value || '').toLowerCase().trim();

  let filtered = allConversations.filter(c => {
    // Filtro por Tab
    if (activeFilter === 'turma' && c.type !== 'turma') return false;
    if (activeFilter === 'direct' && c.type !== 'direct') return false;

    // Filtro por Texto
    if (query) {
      const matchTitle = (c.title || '').toLowerCase().includes(query);
      const matchSub = (c.subtitle || '').toLowerCase().includes(query);
      const matchMsg = (c.lastMessage || '').toLowerCase().includes(query);
      return matchTitle || matchSub || matchMsg;
    }

    return true;
  });

  if (filtered.length === 0) {
    conversationsList.innerHTML = `
      <div class="state-empty" style="padding: 30px 16px; text-align: center;">
        <span style="font-size: 13px; color: var(--color-text-secondary);">Nenhuma conversa encontrada.</span>
      </div>
    `;
    return;
  }

  conversationsList.innerHTML = filtered.map(c => {
    const isActive = activeConversation && activeConversation.id === c.id;
    const timeStr = c.lastTime ? formatChatTime(c.lastTime) : '';

    return `
      <div class="chat-conv-item ${isActive ? 'active' : ''}" data-conv-id="${c.id}" role="button" tabindex="0">
        <div class="chat-conv-avatar ${c.type === 'turma' ? 'avatar-turma' : 'avatar-direct'}">
          ${escapeHtml(c.avatar)}
        </div>
        <div class="chat-conv-info">
          <div class="chat-conv-header">
            <span class="chat-conv-name">${escapeHtml(c.title)}</span>
            <span class="chat-conv-time">${escapeHtml(timeStr)}</span>
          </div>
          <div class="chat-conv-sub">${escapeHtml(c.subtitle)}</div>
          <p class="chat-conv-preview">${escapeHtml(c.lastMessage)}</p>
        </div>
        ${c.unreadCount > 0 ? `<span class="chat-unread-badge">${c.unreadCount}</span>` : ''}
      </div>
    `;
  }).join('');

  // Adicionar eventos de clique
  conversationsList.querySelectorAll('.chat-conv-item').forEach(el => {
    el.addEventListener('click', () => {
      const convId = el.getAttribute('data-conv-id');
      selectConversation(convId);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const convId = el.getAttribute('data-conv-id');
        selectConversation(convId);
      }
    });
  });
}

/**
 * Seleciona uma conversa e carrega as mensagens
 */
async function selectConversation(convId) {
  const conv = allConversations.find(c => c.id === convId);
  if (!conv) return;

  activeConversation = conv;

  // Marca conversa como lida imediatamente
  conv.unreadCount = 0;
  await markConversationAsRead(conv.id, currentProfile);

  renderConversations();

  // Atualizar cabeçalho da conversa
  if (chatActiveAvatar) {
    chatActiveAvatar.textContent = conv.avatar;
    chatActiveAvatar.className = `chat-avatar-badge ${conv.type === 'turma' ? 'avatar-turma' : 'avatar-direct'}`;
  }
  if (chatActiveTitle) chatActiveTitle.textContent = conv.title;
  if (chatActiveSubtitle) chatActiveSubtitle.textContent = conv.subtitle;
  if (chatActiveBadge) {
    chatActiveBadge.textContent = conv.badge || (conv.type === 'turma' ? 'Canal Geral' : 'SMS Direto');
  }

  // Habilitar input e anexo
  if (chatInput) {
    chatInput.disabled = false;
    chatInput.placeholder = conv.type === 'turma' 
      ? `Enviar mensagem para a ${conv.title}...`
      : `Escreva uma mensagem direta para ${conv.title}...`;
    chatInput.focus();
  }
  if (btnSendMessage) {
    btnSendMessage.disabled = false;
  }
  if (btnAttachFile) {
    btnAttachFile.disabled = false;
  }

  // Limpa anexo pendente
  clearSelectedAttachment();

  await loadMessages();
}

/**
 * Carrega e renderiza as mensagens da conversa ativa com ordenação estritamente cronológica
 */
async function loadMessages() {
  if (!activeConversation || !chatMessagesContainer) return;

  const messages = await getMessagesForConversation(activeConversation.id, currentProfile);

  if (messages.length === 0) {
    chatMessagesContainer.innerHTML = `
      <div class="chat-empty-state" style="padding: 40px 20px;">
        <div class="chat-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>Início da Conversa</h3>
        <p>Ainda não foram enviadas mensagens. Seja o primeiro a escrever!</p>
      </div>
    `;
    return;
  }

  const currentUserId = currentProfile.id || `usr-${currentProfile.role}-session`;

  chatMessagesContainer.innerHTML = messages.map(m => {
    const isMine = m.sender_id === currentUserId || (m.sender_role === currentProfile.role && m.sender_name === currentProfile.nome);
    const bubbleClass = isMine ? 'chat-bubble-sent' : 'chat-bubble-received';
    const roleBadgeText = m.sender_role === 'professor' ? 'Docente' : (m.sender_role === 'aluno' ? 'Aluno' : 'Admin');
    const roleBadgeClass = m.sender_role === 'professor' ? 'role-tag-teacher' : 'role-tag-student';

    // Renderização de Anexo se existir
    let attachmentHtml = '';
    if (m.file_url) {
      const isImg = (m.file_type || '').startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(m.file_name || '');
      const ext = (m.file_name || '').split('.').pop().toUpperCase() || 'FILE';

      if (isImg) {
        attachmentHtml = `
          <div class="chat-attachment-box">
            <a href="${escapeHtml(m.file_url)}" target="_blank" rel="noopener noreferrer">
              <img src="${escapeHtml(m.file_url)}" alt="${escapeHtml(m.file_name || 'Imagem')}" class="chat-image-preview-attachment" />
            </a>
          </div>
        `;
      } else {
        attachmentHtml = `
          <a href="${escapeHtml(m.file_url)}" download="${escapeHtml(m.file_name || 'anexo')}" target="_blank" rel="noopener noreferrer" class="chat-file-card">
            <div class="chat-file-icon">${escapeHtml(ext)}</div>
            <div class="chat-file-info">
              <span class="chat-file-name">${escapeHtml(m.file_name || 'Ficheiro Anexo')}</span>
              <span class="chat-file-size">${formatFileSize(m.file_size)}</span>
            </div>
            <div class="chat-file-download-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </a>
        `;
      }
    }

    return `
      <div class="chat-message-row ${isMine ? 'msg-row-sent' : 'msg-row-received'}">
        ${!isMine ? `
          <div class="msg-avatar" aria-hidden="true">${initials(m.sender_name || 'U')}</div>
        ` : ''}
        <div class="chat-bubble ${bubbleClass}">
          ${!isMine ? `
            <div class="msg-author-header">
              <span class="msg-author-name">${escapeHtml(m.sender_name)}</span>
              <span class="msg-author-role ${roleBadgeClass}">${roleBadgeText}</span>
            </div>
          ` : ''}
          ${m.text ? `<div class="msg-text-body">${escapeHtml(m.text)}</div>` : ''}
          ${attachmentHtml}
          <div class="msg-meta-footer">
            <span class="msg-time">${formatChatTime(m.created_at)}</span>
            ${isMine ? `<span class="msg-check" title="Entregue">✓✓</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Rolar suavemente para a última mensagem (fundo)
  requestAnimationFrame(() => {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  });
}

/**
 * Limpa o anexo selecionado
 */
function clearSelectedAttachment() {
  selectedAttachmentFile = null;
  if (chatFileInput) chatFileInput.value = '';
  if (chatAttachmentPreviewBar) chatAttachmentPreviewBar.style.display = 'none';
}

/**
 * Converte ficheiro para Data URL (fallback de anexo)
 */
function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Envia uma nova mensagem com texto e/ou anexo
 */
async function handleSendMessage(e) {
  if (e) e.preventDefault();
  if (!activeConversation || !chatInput) return;

  const text = chatInput.value.trim();
  const file = selectedAttachmentFile;

  if (!text && !file) return;

  btnSendMessage.disabled = true;
  chatInput.value = '';

  let fileUrl = null;
  let fileName = null;
  let fileSize = null;
  let fileType = null;

  if (file) {
    fileName = file.name;
    fileSize = file.size;
    fileType = file.type || 'application/octet-stream';

    // 1. Tentar upload para Supabase Storage
    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `chat_anexos/${Date.now()}_${sanitized}`;
      const { data: uploadData, error: uploadErr } = await sb.storage
        .from('policloud')
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = sb.storage.from('policloud').getPublicUrl(storagePath);
        fileUrl = publicUrlData?.publicUrl || storagePath;
      } else {
        fileUrl = await readFileAsDataUrl(file);
      }
    } catch (err) {
      fileUrl = await readFileAsDataUrl(file);
    }
  }

  const newMsgObj = {
    id: `msg-${Date.now()}`,
    conversation_id: activeConversation.id,
    sender_id: currentProfile.id || `usr-${currentProfile.role}-session`,
    sender_name: currentProfile.nome || 'Utilizador PoliCloud',
    sender_role: currentProfile.role || 'aluno',
    recipient_id: activeConversation.type === 'direct' ? activeConversation.targetId : null,
    recipient_name: activeConversation.type === 'direct' ? activeConversation.targetName : null,
    turma: activeConversation.turma || currentProfile.turma || null,
    classe: activeConversation.classe || currentProfile.classe || null,
    curso: activeConversation.curso || currentProfile.curso || null,
    text: text || (fileName ? `Enviou um anexo: ${fileName}` : ''),
    file_url: fileUrl,
    file_name: fileName,
    file_size: fileSize,
    file_type: fileType,
    created_at: new Date().toISOString(),
    read_by_recipient: false
  };

  clearSelectedAttachment();

  await saveMessage(newMsgObj);

  // Atualiza conversa na lista e sobe para o topo
  activeConversation.lastMessage = newMsgObj.text;
  activeConversation.lastTime = newMsgObj.created_at;

  allConversations.sort((a, b) => {
    const timeA = a.lastTime ? new Date(a.lastTime).getTime() : 0;
    const timeB = b.lastTime ? new Date(b.lastTime).getTime() : 0;
    return timeB - timeA;
  });

  renderConversations();
  await loadMessages();

  btnSendMessage.disabled = false;
  chatInput.focus();
}

/**
 * Inicialização da página de Mensagens
 */
async function initMessagesPage() {
  initSidebar();
  mouseTrack();

  function hideSessionOverlay() {
    if (sessionOverlay) {
      sessionOverlay.classList.add('hidden');
      sessionOverlay.classList.add('fade-out');
      sessionOverlay.style.display = 'none';
    }
  }

  // Timer de segurança para nunca prender o utilizador no ecrã de carregamento
  setTimeout(hideSessionOverlay, 2000);

  try {
    currentProfile = await requireAuth();
    if (!currentProfile) {
      hideSessionOverlay();
      return;
    }

    // Ajustar link do Dashboard conforme o perfil
    if (navDashboardLink) {
      if (currentProfile.role === 'professor') {
        navDashboardLink.href = '/dashboard-professor.html';
      } else if (currentProfile.role === 'admin') {
        navDashboardLink.href = '/admin.html';
      } else {
        navDashboardLink.href = '/dashboard-aluno.html';
      }
    }

    // Preencher dados na barra lateral
    const displayName = currentProfile.nome || 'Utilizador';
    const roleMap = {
      admin: 'Administrador',
      professor: 'Docente',
      teacher: 'Docente',
      aluno: 'Estudante',
      student: 'Estudante'
    };
    const mappedRole = roleMap[currentProfile.role] || currentProfile.role;
    const roleLabel = `Perfil: ${mappedRole}`;

    if (sidebarUserName) sidebarUserName.textContent = displayName;
    if (sidebarUserRole) sidebarUserRole.textContent = roleLabel;
    if (sidebarUserAvatar) sidebarUserAvatar.textContent = initials(displayName);

    // Botão de Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut();
      });
    }

    // Carregar conversas
    allConversations = await getConversationsListForUser(currentProfile);
    renderConversations();

    // Remove overlay imediatamente após carregar canais
    hideSessionOverlay();

    // Iniciar Supabase Realtime (não-bloqueante)
    try {
      initRealtimeMessages();
    } catch(rtErr) {
      console.warn('Realtime init warning:', rtErr);
    }

    // Filtragem por Tab
    chatTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        chatTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        renderConversations();
      });
    });

    // Pesquisa
    if (chatSearchInput) {
      chatSearchInput.addEventListener('input', () => {
        renderConversations();
      });
    }

    // Handlers de Anexo de Ficheiro
    if (btnAttachFile && chatFileInput) {
      btnAttachFile.addEventListener('click', () => {
        chatFileInput.click();
      });

      chatFileInput.addEventListener('change', () => {
        if (chatFileInput.files && chatFileInput.files[0]) {
          selectedAttachmentFile = chatFileInput.files[0];
          if (chatAttachmentName) chatAttachmentName.textContent = selectedAttachmentFile.name;
          if (chatAttachmentSize) chatAttachmentSize.textContent = `(${formatFileSize(selectedAttachmentFile.size)})`;
          if (chatAttachmentPreviewBar) chatAttachmentPreviewBar.style.display = 'flex';
        }
      });
    }

    if (btnRemoveAttachment) {
      btnRemoveAttachment.addEventListener('click', clearSelectedAttachment);
    }

    // Formulário de Envio
    if (chatForm) {
      chatForm.addEventListener('submit', handleSendMessage);
    }

    // Sugestões de resposta rápida
    if (chatQuickReplies) {
      chatQuickReplies.querySelectorAll('.quick-reply-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const text = chip.getAttribute('data-text');
          if (chatInput && !chatInput.disabled) {
            chatInput.value = text;
            chatInput.focus();
          }
        });
      });
    }

    // Verificar se há parâmetros na URL (ex: ?chat=... ou ?turma=...)
    const params = new URLSearchParams(window.location.search);
    const targetConvId = params.get('chat');
    const targetTurma = params.get('turma');

    if (targetConvId) {
      selectConversation(targetConvId);
    } else if (targetTurma) {
      const turmaConv = allConversations.find(c => c.turma === targetTurma || c.id === `turma-${targetTurma}`);
      if (turmaConv) {
        selectConversation(turmaConv.id);
      } else if (allConversations.length > 0) {
        selectConversation(allConversations[0].id);
      }
    } else if (allConversations.length > 0) {
      selectConversation(allConversations[0].id);
    }

    // Ouvir mensagens atualizadas em Tempo Real ou outras janelas
    window.addEventListener('policloud_chat_updated', async (e) => {
      try {
        allConversations = await getConversationsListForUser(currentProfile);
        if (activeConversation) {
          const newMsg = e.detail;
          const isForActive = !newMsg || 
            newMsg.conversation_id === activeConversation.id ||
            (activeConversation.type === 'direct' && (newMsg.sender_id === activeConversation.targetId || newMsg.recipient_id === activeConversation.targetId)) ||
            (activeConversation.type === 'turma' && messageMatchesTurmaScope(newMsg, activeConversation));

          if (isForActive && (!newMsg || newMsg.sender_id !== currentProfile.id)) {
             await markConversationAsRead(activeConversation.id, currentProfile);
             allConversations = await getConversationsListForUser(currentProfile);
          }
          renderConversations();
          await loadMessages();
        } else {
          renderConversations();
        }
      } catch(e) {}
    });

    window.addEventListener('storage', async (e) => {
      if (e.key === 'policloud_chat_messages' && activeConversation) {
        await loadMessages();
      }
    });
  } catch (err) {
    console.error('Erro na inicialização de Mensagens:', err);
  } finally {
    hideSessionOverlay();
  }
}

initMessagesPage();

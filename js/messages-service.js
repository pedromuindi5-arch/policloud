// PoliCloud - Serviço Global de Mensagens e Notificações (Estilo NetAcad)
import { sb, getProfile } from './sb.js';

const STORAGE_MESSAGES_KEY = 'policloud_chat_messages';
const STORAGE_PUSH_DISMISSED_KEY = 'policloud_dismissed_push_notifications';
const STORAGE_STUDENT_DISMISSED_KEY = 'policloud_student_dismissed_notifications';
const STORAGE_USER_READ_PREFIX = 'policloud_reads_u_';

export function getUserReadSet(userId) {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`${STORAGE_USER_READ_PREFIX}${userId}`);
    if (raw) return new Set(JSON.parse(raw));
  } catch(e) {}
  return new Set();
}

export function markMessagesAsReadForUser(userId, messageIds) {
  if (!userId || !Array.isArray(messageIds) || messageIds.length === 0) return;
  const set = getUserReadSet(userId);
  messageIds.forEach(id => {
    if (id) {
      const sId = String(id);
      set.add(sId);
      dismissStudentAlert(sId);
      dismissStudentAlert(`msg-${sId}`);
      dismissPushNotification(sId);
      if (sId.startsWith('msg-')) {
        const raw = sId.replace(/^msg-/, '');
        set.add(raw);
        dismissStudentAlert(raw);
        dismissPushNotification(raw);
      }
    }
  });
  try {
    localStorage.setItem(`${STORAGE_USER_READ_PREFIX}${userId}`, JSON.stringify(Array.from(set)));
  } catch(e) {}
}

let messagesChannel = null;
let syncInterval = null;

export function initRealtimeMessages(callback) {
  if (messagesChannel) return; // already initialized
  
  // 1. WebSocket Oficial (Se o Supabase Realtime estiver ativado na tabela)
  try {
    messagesChannel = sb.channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          handleIncomingMessage(payload.new, callback);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime channel fallback:', err);
  }

  // 2. Polling de Fallback Invisível (A cada 4 segundos, caso o WebSocket falhe ou não esteja ativo no Dashboard do Supabase)
  if (!syncInterval) {
    syncInterval = setInterval(async () => {
      try {
        const { data, error } = await sb
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Busca apenas as 10 mais recentes para ser leve

        if (!error && data && data.length > 0) {
          const list = getLocalMessages();
          let newFound = false;

          data.reverse().forEach(dbMsg => {
            if (!list.find(m => m.id === dbMsg.id)) {
              list.push(dbMsg);
              newFound = true;
              if (callback) callback(dbMsg);
            }
          });

          if (newFound) {
            const sorted = sortMessagesChronological(list);
            try {
              localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(sorted));
            } catch(e) {}
            window.dispatchEvent(new CustomEvent('policloud_chat_updated'));
          }
        }
      } catch (e) {
        // Ignora erros silenciosamente
      }
    }, 4000);
  }
}

function handleIncomingMessage(newMsg, callback) {
  const list = getLocalMessages();
  if (!list.find(m => m.id === newMsg.id)) {
    list.push(newMsg);
    const sorted = sortMessagesChronological(list);
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(sorted));
    } catch(e) {}
    
    window.dispatchEvent(new CustomEvent('policloud_chat_updated', { detail: newMsg }));
    if (callback) callback(newMsg);
  }
}

/**
 * Extrai a letra pura da turma (ex: "Turma B" -> "B", "INF-10A" -> "A")
 */
export function extractTurmaLetter(t) {
  if (!t) return 'Todas';
  let s = String(t).toUpperCase().trim();
  s = s.replace('TURMA ', '');
  if (s.includes('-')) {
     const match = s.match(/([A-Z])$/);
     if (match) return match[1];
  }
  return s;
}

/**
 * Ordena mensagens cronologicamente (as mais antigas em cima, as mais recentes em baixo)
 */
function sortMessagesChronological(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Obtém todas as mensagens guardadas (com suporte a estado de leitura por utilizador)
 */
export async function getAllMessages(userProfile = null) {
  let list = [];
  try {
    const { data, error } = await sb
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      list = data;
    }
  } catch (e) {
    // Continua para o fallback local
  }

  if (list.length === 0) {
    list = getLocalMessages();
  } else {
    // Sincroniza localmente
    const local = getLocalMessages();
    const ids = new Set(list.map(m => m.id));
    local.forEach(l => {
      if (!ids.has(l.id)) list.push(l);
    });
  }

  // Aplica estado de leitura individual do utilizador
  const userId = userProfile?.id;
  if (userId) {
    const userReads = getUserReadSet(userId);
    list = list.map(m => {
      const isMine = m.sender_id === userId;
      const isRead = isMine || userReads.has(String(m.id)) || m.read_by_recipient === true;
      return {
        ...m,
        read_by_recipient: isRead
      };
    });
  }

  return sortMessagesChronological(list);
}

/**
 * Lê do LocalStorage com ordenação cronológica garantida
 */
export function getLocalMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sortMessagesChronological(parsed);
      }
    }
  } catch (e) {}

  return [];
}

/**
 * Guarda uma nova mensagem tanto no Supabase como localmente
 */
export async function saveMessage(messageObj) {
  // 1. Grava no LocalStorage imediatamente
  const list = getLocalMessages();
  list.push(messageObj);
  const sorted = sortMessagesChronological(list);
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(sorted));
  } catch (e) {}

  // 2. Dispara evento local
  window.dispatchEvent(new CustomEvent('policloud_chat_updated', { detail: messageObj }));

  // 3. Tenta gravar no Supabase de forma assíncrona
  try {
    await sb.from('messages').insert({
      id: messageObj.id,
      conversation_id: messageObj.conversation_id,
      sender_id: messageObj.sender_id,
      sender_name: messageObj.sender_name,
      sender_role: messageObj.sender_role,
      recipient_id: messageObj.recipient_id || null,
      recipient_name: messageObj.recipient_name || null,
      turma: messageObj.turma || null,
      classe: messageObj.classe || null,
      curso: messageObj.curso || null,
      text: messageObj.text,
      file_url: messageObj.file_url || null,
      file_name: messageObj.file_name || null,
      file_size: messageObj.file_size || null,
      file_type: messageObj.file_type || null,
      created_at: messageObj.created_at,
      read_by_recipient: false
    });
  } catch (e) {
    // Falha silenciosa no Supabase, garantido via localStorage
  }

  return messageObj;
}

/**
 * Marca uma conversa como lida pelo utilizador atual
 */
export async function markConversationAsRead(convId, userProfile) {
  if (!convId || !userProfile) return;

  const currentUserId = userProfile.id || `usr-${userProfile.role}-session`;
  const allMsgs = await getAllMessages();
  const readIds = [];

  allMsgs.forEach(m => {
    let isThisConv = m.conversation_id === convId;
    if (!isThisConv && convId.startsWith('direct-')) {
      const parts = convId.replace('direct-', '').split('-');
      if (parts.length >= 2) {
        const id1 = parts[0];
        const id2 = parts[1];
        if ((m.sender_id === id1 && m.recipient_id === id2) || 
            (m.sender_id === id2 && m.recipient_id === id1) ||
            m.conversation_id === `direct-${id1}-${id2}` ||
            m.conversation_id === `direct-${id2}-${id1}`) {
          isThisConv = true;
        }
      }
    } else if (!isThisConv && convId.startsWith('turma-')) {
      const mTurmaLetter = extractTurmaLetter(m.turma);
      const convParts = convId.replace('turma-', '').split('-');
      const convLetter = extractTurmaLetter(convParts[convParts.length - 1]);
      if (mTurmaLetter === convLetter || m.conversation_id === `turma-${mTurmaLetter}` || m.turma === convLetter) {
        isThisConv = true;
      }
    }

    if (isThisConv) {
      readIds.push(m.id);
    }
  });

  if (readIds.length > 0) {
    markMessagesAsReadForUser(currentUserId, readIds);
  }

  // Atualizar também no Supabase (em background sem travar a navegação)
  sb.from('messages')
    .update({ read_by_recipient: true })
    .eq('conversation_id', convId)
    .neq('sender_id', currentUserId)
    .then(() => {})
    .catch(() => {});

  window.dispatchEvent(new CustomEvent('policloud_chat_updated'));
}

/**
 * Gera lista de canais/conversas disponíveis para um dado perfil
 */
export async function getConversationsListForUser(profile) {
  if (!profile) return [];
  const messages = await getAllMessages(profile);
  let role = (profile.role || 'aluno').toLowerCase();
  if (role === 'student') role = 'aluno';
  if (role === 'teacher') role = 'professor';

  const currentUserId = profile.id || `usr-${profile.role}-session`;
  const conversations = [];

  // 1. Canais de Turma (Gerais / Scoped)
  let scopedTurmas = []; // { curso, classe, turma }

  if (role === 'aluno') {
    scopedTurmas.push({
      curso: profile.curso || 'Geral',
      classe: profile.classe || 'Todas',
      turma: profile.turma || 'A'
    });
  } else if (role === 'professor') {
    if (Array.isArray(profile.atribuicoes_curriculares) && profile.atribuicoes_curriculares.length > 0) {
      profile.atribuicoes_curriculares.forEach(atr => {
        const c = atr.curso || 'Geral';
        const cl = atr.classe || 'Todas';
        const turmas = Array.isArray(atr.turmas) ? atr.turmas : (atr.turma ? [atr.turma] : ['A']);
        turmas.forEach(t => {
          scopedTurmas.push({ curso: c, classe: cl, turma: t });
        });
      });
    } else {
      // Fallback: Cartesian product of legacy arrays
      const cArr = Array.isArray(profile.cursos) && profile.cursos.length > 0 ? profile.cursos : (profile.curso ? profile.curso.split(',').map(s=>s.trim()) : ['Geral']);
      const clArr = Array.isArray(profile.classes) && profile.classes.length > 0 ? profile.classes : (profile.classe ? profile.classe.split(',').map(s=>s.trim()) : ['Todas']);
      const tArr = Array.isArray(profile.turmas) && profile.turmas.length > 0 ? profile.turmas : (profile.turma ? profile.turma.split(',').map(s=>s.trim()) : ['A']);
      
      cArr.forEach(c => {
        clArr.forEach(cl => {
          tArr.forEach(t => {
            scopedTurmas.push({ curso: c, classe: cl, turma: t });
          });
        });
      });
    }
  } else {
    // Admin
    scopedTurmas.push({ curso: 'Geral', classe: 'Todas', turma: 'Geral IPPLN' });
  }

  // Remover duplicados (caso o professor tenha a mesma turma repetida em diferentes blocos)
  const uniqueScopedTurmas = [];
  const seenScopes = new Set();
  scopedTurmas.forEach(st => {
    const key = `${st.curso}-${st.classe}-${st.turma}`.toUpperCase();
    if (!seenScopes.has(key)) {
      seenScopes.add(key);
      uniqueScopedTurmas.push(st);
    }
  });

  uniqueScopedTurmas.forEach(st => {
    // Identificador único mundial para a turma
    const convId = `turma-${st.curso}-${st.classe}-${st.turma}`.replace(/\s+/g, '_').toLowerCase();
    
    // Título legível exigido pelo utilizador
    const title = `${st.curso} • ${st.classe} • Turma ${st.turma}`;

    const turmaMsgs = messages.filter(m => {
      if (m.recipient_id) return false;
      if (m.conversation_id === convId) return true;
      const mLetter = extractTurmaLetter(m.turma);
      const stLetter = extractTurmaLetter(st.turma);
      if (mLetter === stLetter) {
        if (!m.curso || m.curso.toLowerCase() === st.curso.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
    const sortedTurmaMsgs = sortMessagesChronological(turmaMsgs);
    const lastMsg = sortedTurmaMsgs.length > 0 ? sortedTurmaMsgs[sortedTurmaMsgs.length - 1] : null;

    const unreadCount = sortedTurmaMsgs.filter(m => 
      m.sender_id !== currentUserId && 
      m.read_by_recipient === false
    ).length;

    conversations.push({
      id: convId,
      type: 'turma',
      turma: st.turma,
      curso: st.curso,
      classe: st.classe,
      title: title,
      subtitle: 'Sala de Aula Virtual',
      badge: `Turma ${st.turma}`,
      avatar: st.turma.substring(0, 2).toUpperCase(),
      lastMessage: lastMsg ? (lastMsg.file_name ? `📎 [Ficheiro] ${lastMsg.file_name}` : lastMsg.text) : 'Sem mensagens ainda.',
      lastTime: lastMsg ? lastMsg.created_at : null,
      unreadCount: unreadCount
    });
  });

  // 2. Conversas Diretas (Aluno <-> Professor)
  if (role === 'aluno') {
    // Buscar todos os professores (com query segura para o enum Postgres)
    let professores = [];
    try {
      const { data, error } = await sb.from('profiles').select('*').eq('role', 'teacher');
      if (!error && data && data.length > 0) {
        professores = data;
      } else {
        const res = await sb.from('profiles').select('*');
        if (res.data) professores = res.data.filter(p => ['teacher', 'professor'].includes((p.role || '').toLowerCase()));
      }
    } catch(e) {
      try {
        const res = await sb.from('profiles').select('*');
        if (res.data) professores = res.data.filter(p => ['teacher', 'professor'].includes((p.role || '').toLowerCase()));
      } catch(e2) {}
    }
    
    // Normalizar nomes
    professores.forEach(prof => {
       if (!prof.nome && prof.full_name) prof.nome = prof.full_name;
    });

    const alunoCurso = profile.curso || 'Informática';
    const alunoClasse = profile.classe || '12ª';
    const alunoTurmaRaw = profile.turma || 'A';
    const alunoTurmaNorm = extractTurmaLetter(alunoTurmaRaw);

    professores.forEach(prof => {
      let matchesContext = false;
      const norm = (s) => (s || '').toString().toLowerCase().trim();
      const alunoCursoNorm = norm(alunoCurso);
      const alunoClasseNorm = norm(alunoClasse);
      const alunoTurmaNormStr = norm(alunoTurmaNorm);

      const profCursosArray = Array.isArray(prof.cursos) && prof.cursos.length > 0 
        ? prof.cursos 
        : (prof.curso ? prof.curso.split(',').map(s=>s.trim()) : ['Geral']);
      const profCursosNorm = profCursosArray.map(norm);
        
      const profClassesArray = Array.isArray(prof.classes) && prof.classes.length > 0 
        ? prof.classes 
        : (prof.classe ? prof.classe.split(',').map(s=>s.trim()) : ['Todas']);
      const profClassesNorm = profClassesArray.map(norm);

      const profTurmasArray = Array.isArray(prof.turmas) && prof.turmas.length > 0 
        ? prof.turmas 
        : (prof.turma ? prof.turma.split(',').map(s=>s.trim()) : ['Todas']);
      const profTurmasNorm = profTurmasArray.map(t => norm(extractTurmaLetter(t)));

      const cursoMatch = profCursosNorm.includes('geral') || profCursosNorm.includes('todos') || profCursosNorm.includes(alunoCursoNorm);
      const classeMatch = profClassesNorm.includes('todas') || profClassesNorm.includes(alunoClasseNorm);
      const turmaMatch = profTurmasNorm.includes('todas') || profTurmasNorm.includes(alunoTurmaNormStr);

      if (cursoMatch && classeMatch && turmaMatch) {
        matchesContext = true;
      }

      // Se o professor tiver atribuições curriculares complexas, verifica lá dentro também
      if (!matchesContext && Array.isArray(prof.atribuicoes_curriculares)) {
         matchesContext = prof.atribuicoes_curriculares.some(atr => {
           const cMatch = norm(atr.curso) === 'geral' || norm(atr.curso) === alunoCursoNorm;
           const clMatch = norm(atr.classe) === 'todas' || norm(atr.classe) === alunoClasseNorm;
           const tMatch = (atr.turmas || []).map(norm).includes('todas') || (atr.turmas || []).some(t => norm(extractTurmaLetter(t)) === alunoTurmaNormStr);
           return cMatch && clMatch && tMatch;
         });
      }

      if (!matchesContext) return; // Ignora o professor

      const convId = `direct-${currentUserId}-${prof.id}`;
      const convMsgs = messages.filter(m => 
        m.conversation_id === convId || 
        m.conversation_id === `direct-${prof.id}-${currentUserId}` ||
        (m.recipient_id === prof.id && m.sender_id === currentUserId) ||
        (m.recipient_id === currentUserId && m.sender_id === prof.id)
      );
      const sortedConvMsgs = sortMessagesChronological(convMsgs);
      const lastMsg = sortedConvMsgs.length > 0 ? sortedConvMsgs[sortedConvMsgs.length - 1] : null;

      const unreadCount = sortedConvMsgs.filter(m => 
        m.sender_id === prof.id && 
        m.read_by_recipient === false
      ).length;

      conversations.push({
        id: convId,
        type: 'direct',
        targetId: prof.id,
        targetName: prof.nome,
        targetRole: 'professor',
        title: prof.nome,
        subtitle: 'Professor',
        badge: 'Professor',
        avatar: (prof.nome || 'P').replace('Prof. ', '').substring(0, 2).toUpperCase(),
        lastMessage: lastMsg ? (lastMsg.file_name ? `📎 [Ficheiro] ${lastMsg.file_name}` : lastMsg.text) : 'Toque para iniciar mensagem direta (SMS)...',
        lastTime: lastMsg ? lastMsg.created_at : null,
        unreadCount: unreadCount
      });
    });
  } else if (role === 'professor') {
    // Buscar alunos (com query segura para o enum Postgres)
    let alunos = [];
    try {
      const { data, error } = await sb.from('profiles').select('*').eq('role', 'student');
      if (!error && data && data.length > 0) {
        alunos = data;
      } else {
        const res = await sb.from('profiles').select('*');
        if (res.data) alunos = res.data.filter(p => ['student', 'aluno'].includes((p.role || '').toLowerCase()));
      }
    } catch(e) {
      try {
        const res = await sb.from('profiles').select('*');
        if (res.data) alunos = res.data.filter(p => ['student', 'aluno'].includes((p.role || '').toLowerCase()));
      } catch(e2) {}
    }

    // Normalizar nomes
    alunos.forEach(al => {
       if (!al.nome && al.full_name) al.nome = al.full_name;
    });

    const norm = (s) => (s || '').toString().toLowerCase().trim();

    const profCursosArray = Array.isArray(profile.cursos) && profile.cursos.length > 0 
      ? profile.cursos 
      : (profile.curso ? profile.curso.split(',').map(s=>s.trim()) : ['Geral']);
    const profCursosNorm = profCursosArray.map(norm);
      
    const profClassesArray = Array.isArray(profile.classes) && profile.classes.length > 0 
      ? profile.classes 
      : (profile.classe ? profile.classe.split(',').map(s=>s.trim()) : ['Todas']);
    const profClassesNorm = profClassesArray.map(norm);

    const profTurmasArray = Array.isArray(profile.turmas) && profile.turmas.length > 0 
      ? profile.turmas 
      : (profile.turma ? profile.turma.split(',').map(s=>s.trim()) : ['Todas']);
    const profTurmasNorm = profTurmasArray.map(t => norm(extractTurmaLetter(t)));

    alunos.forEach(aluno => {
      // Regra Rígida de Visibilidade para o Professor:
      let matchesContext = false;
      const alunoCurso = aluno.curso || 'Informática';
      const alunoClasse = aluno.classe || '12ª';
      const alunoTurmaNormStr = norm(extractTurmaLetter(aluno.turma || 'A'));
      
      const alunoCursoNorm = norm(alunoCurso);
      const alunoClasseNorm = norm(alunoClasse);

      const cursoMatch = profCursosNorm.includes('geral') || profCursosNorm.includes('todos') || profCursosNorm.includes(alunoCursoNorm);
      const classeMatch = profClassesNorm.includes('todas') || profClassesNorm.includes(alunoClasseNorm);
      const turmaMatch = profTurmasNorm.includes('todas') || profTurmasNorm.includes(alunoTurmaNormStr);

      if (cursoMatch && classeMatch && turmaMatch) {
        matchesContext = true;
      }

      if (!matchesContext && Array.isArray(profile.atribuicoes_curriculares)) {
         matchesContext = profile.atribuicoes_curriculares.some(atr => {
           const cMatch = norm(atr.curso) === 'geral' || norm(atr.curso) === alunoCursoNorm;
           const clMatch = norm(atr.classe) === 'todas' || norm(atr.classe) === alunoClasseNorm;
           const tMatch = (atr.turmas || []).map(norm).includes('todas') || (atr.turmas || []).some(t => norm(extractTurmaLetter(t)) === alunoTurmaNormStr);
           return cMatch && clMatch && tMatch;
         });
      }

      if (!matchesContext) return; // Ignorar aluno

      const convId = `direct-${aluno.id}-${currentUserId}`;
      const convMsgs = messages.filter(m => 
        m.conversation_id === convId || 
        m.conversation_id === `direct-${currentUserId}-${aluno.id}` ||
        (m.recipient_id === aluno.id && m.sender_id === currentUserId) ||
        (m.recipient_id === currentUserId && m.sender_id === aluno.id)
      );
      const sortedConvMsgs = sortMessagesChronological(convMsgs);
      const lastMsg = sortedConvMsgs.length > 0 ? sortedConvMsgs[sortedConvMsgs.length - 1] : null;

      const unreadCount = sortedConvMsgs.filter(m => 
        m.sender_id === aluno.id && 
        m.read_by_recipient === false
      ).length;

      conversations.push({
        id: convId,
        type: 'direct',
        targetId: aluno.id,
        targetName: aluno.nome,
        targetRole: 'aluno',
        title: aluno.nome,
        subtitle: `Aluno • Turma ${aluno.turma || 'Geral'} (${aluno.curso || '—'})`,
        badge: `Turma ${aluno.turma || 'Geral'}`,
        avatar: (aluno.nome || 'A').substring(0, 2).toUpperCase(),
        lastMessage: lastMsg ? (lastMsg.file_name ? `📎 [Ficheiro] ${lastMsg.file_name}` : lastMsg.text) : 'Iniciar conversa direta com aluno...',
        lastTime: lastMsg ? lastMsg.created_at : null,
        unreadCount: unreadCount
      });
    });
  }

  // Ordena rigorosamente as conversas com a atividade mais recente no topo!
  conversations.sort((a, b) => {
    const timeA = a.lastTime ? new Date(a.lastTime).getTime() : 0;
    const timeB = b.lastTime ? new Date(b.lastTime).getTime() : 0;
    return timeB - timeA;
  });

  return conversations;
}

/**
 * Obtém mensagens de uma conversa específica com ordenação cronológica garantida
 * (Mais antigas no topo, mais recentes no fundo!)
 */
export async function getMessagesForConversation(convId, profile) {
  const all = await getAllMessages(profile);
  let msgs = [];
  
  if (convId.startsWith('turma-')) {
    const convParts = convId.replace('turma-', '').split('-');
    const convLetter = extractTurmaLetter(convParts[convParts.length - 1]);
    msgs = all.filter(m => {
      if (m.recipient_id) return false;
      if (m.conversation_id === convId) return true;
      const mLetter = extractTurmaLetter(m.turma);
      return mLetter === convLetter || m.conversation_id === `turma-${convLetter}`;
    });
  } else {
    msgs = all.filter(m => {
      if (m.conversation_id === convId) return true;
      if (convId.startsWith('direct-')) {
        const parts = convId.replace('direct-', '').split('-');
        if (parts.length >= 2) {
          const id1 = parts[0];
          const id2 = parts[1];
          return (m.sender_id === id1 && m.recipient_id === id2) || (m.sender_id === id2 && m.recipient_id === id1);
        }
      }
      return false;
    });
  }

  // SEMPRE ORDENAR CRONOLOGICAMENTE ASCENDENTE (ANTIGAS -> RECENTES)
  return sortMessagesChronological(msgs);
}

/**
 * Notificações Push para o Professor (Modal "NOVA MENSAGEM RECEBIDA")
 * Retorna um objeto consolidado de mensagens não lidas
 */
export async function checkNewMessagePushForTeacher(teacherProfile) {
  const role = (teacherProfile?.role || '').toLowerCase();
  if (role !== 'professor' && role !== 'teacher') {
    return null;
  }

  const dismissedIds = getDismissedPushIds();
  const readSet = getUserReadSet(teacherProfile?.id);
  const all = await getAllMessages(teacherProfile);
  const teacherId = teacherProfile.id || 'usr-prof-1';

  // Filtra mensagens não lidas, direcionadas a este professor, que não foram dispensadas
  const incoming = all.filter(m => {
    if (m.sender_role !== 'aluno' && m.sender_role !== 'student') return false;
    if (m.read_by_recipient === true || readSet.has(String(m.id))) return false;
    if (dismissedIds.includes(m.id)) return false;
    
    if (m.recipient_id === teacherId) return true;

    if (teacherProfile.turmas && teacherProfile.turmas.some(t => extractTurmaLetter(t) === extractTurmaLetter(m.turma)) && m.conversation_id?.startsWith('turma-')) {
      return true;
    }

    return false;
  });

  if (incoming.length === 0) return null;

  // Agrega dados: quantos alunos únicos, total de mensagens
  const uniqueStudents = new Set(incoming.map(m => m.sender_id));
  const idsToDismiss = incoming.map(m => m.id);

  incoming.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestMessage = incoming[0];

  return {
    count: incoming.length,
    studentsCount: uniqueStudents.size,
    latestMessage: latestMessage,
    idsToDismiss: idsToDismiss
  };
}

/**
 * Marca uma ou várias notificações push como dispensadas no modal do professor
 */
export function dismissPushNotification(messageIds) {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
  const list = getDismissedPushIds();
  let updated = false;
  
  ids.forEach(id => {
    if (!list.includes(id)) {
      list.push(id);
      updated = true;
    }
  });

  if (updated) {
    try {
      localStorage.setItem(STORAGE_PUSH_DISMISSED_KEY, JSON.stringify(list));
    } catch (e) {}
  }
}

function getDismissedPushIds() {
  try {
    const s = localStorage.getItem(STORAGE_PUSH_DISMISSED_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return [];
}

/**
 * Notificações para o Aluno (Novos comunicados, mensagens do professor ou matérias)
 */
export async function getStudentAlerts(studentProfile) {
  const role = (studentProfile?.role || '').toLowerCase();
  if (role !== 'aluno' && role !== 'student') {
    return [];
  }

  const alerts = [];
  const dismissed = getDismissedStudentAlerts();
  const readSet = getUserReadSet(studentProfile?.id);

  // 1. Mensagens recentes do professor para este aluno que AINDA NÃO FORAM LIDAS
  const msgs = await getAllMessages(studentProfile);
  const studentTurma = studentProfile.turma || 'A';
  const studentTurmaLetter = extractTurmaLetter(studentTurma);

  const recentTeacherMsgs = msgs.filter(m => {
    const isTeacher = m.sender_role === 'professor' || m.sender_role === 'teacher';
    if (!isTeacher) return false;

    let isForMe = false;
    if (m.recipient_id) {
      isForMe = m.recipient_id === studentProfile.id;
    } else {
      const matchTurma = extractTurmaLetter(m.turma) === studentTurmaLetter;
      const matchCurso = !m.curso || !studentProfile.curso || m.curso.toLowerCase() === 'geral' || m.curso.toLowerCase() === studentProfile.curso.toLowerCase();
      isForMe = matchTurma && matchCurso;
    }
    if (!isForMe) return false;

    // Se já foi lida pelo aluno ou se o ID já está dispensado, ignora
    const msgIdStr = String(m.id);
    if (m.read_by_recipient === true || readSet.has(msgIdStr)) return false;
    if (dismissed.includes(msgIdStr) || dismissed.includes(`msg-${msgIdStr}`)) return false;

    return true;
  });

  if (recentTeacherMsgs.length > 0) {
    const lastTeacherMsg = recentTeacherMsgs[recentTeacherMsgs.length - 1];
    const alertId = String(lastTeacherMsg.id).startsWith('msg-') ? lastTeacherMsg.id : `msg-${lastTeacherMsg.id}`;
    alerts.push({
      id: alertId,
      type: 'mensagem',
      title: 'Nova Mensagem do Professor',
      description: `${lastTeacherMsg.sender_name}: "${lastTeacherMsg.text.substring(0, 60)}..."`,
      link: lastTeacherMsg.conversation_id ? `/mensagens.html?chat=${encodeURIComponent(lastTeacherMsg.conversation_id)}` : '/mensagens.html',
      badge: 'SMS / Chat',
      time: lastTeacherMsg.created_at
    });
  }

  // 2. Novos avisos do mural da sua turma
  try {
    const savedMurais = localStorage.getItem('policloud_demo_mural');
    if (savedMurais) {
      const murais = JSON.parse(savedMurais);
      const turmaMurais = murais.filter(m => 
        (m.turma === studentTurma || !m.turma || m.turma === 'todas') &&
        !dismissed.includes(`mural-${m.id}`)
      );
      if (turmaMurais.length > 0) {
        const lastMural = turmaMurais[0];
        alerts.push({
          id: `mural-${lastMural.id}`,
          type: 'mural',
          title: 'Novo Comunicado no Mural da Turma',
          description: `${lastMural.title || 'Aviso da Turma'}: ${lastMural.content ? lastMural.content.substring(0, 55) + '...' : ''}`,
          link: '/mural.html',
          badge: 'Mural',
          time: lastMural.created_at
        });
      }
    }
  } catch (e) {}

  return alerts;
}

export function dismissStudentAlert(alertId) {
  const list = getDismissedStudentAlerts();
  if (!list.includes(alertId)) {
    list.push(alertId);
    try {
      localStorage.setItem(STORAGE_STUDENT_DISMISSED_KEY, JSON.stringify(list));
    } catch (e) {}
  }
}

function getDismissedStudentAlerts() {
  try {
    const s = localStorage.getItem(STORAGE_STUDENT_DISMISSED_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return [];
}

/**
 * Verifica se uma turma tem atividade recente (novo ficheiro ou SMS)
 * Usado para o badge "Novo" pulsante nas pastas da Cloud
 */
export function turmaHasNewActivity(turmaName) {
  if (!turmaName) return false;
  const msgs = getLocalMessages();
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 3600 * 1000;

  // Checa mensagens não lidas ou recentes
  const hasRecentMsg = msgs.some(m => {
    if (m.turma === turmaName || m.conversation_id === `turma-${turmaName}`) {
      const t = new Date(m.created_at).getTime();
      return t >= threeDaysAgo;
    }
    return false;
  });

  if (hasRecentMsg) return true;

  // Checa ficheiros da demo
  try {
    const files = JSON.parse(localStorage.getItem('policloud_demo_files') || '[]');
    const hasRecentFile = files.some(f => {
      if (f.turma === turmaName) {
        const t = new Date(f.created_at).getTime();
        return t >= threeDaysAgo;
      }
      return false;
    });
    if (hasRecentFile) return true;
  } catch (e) {}

  return false;
}

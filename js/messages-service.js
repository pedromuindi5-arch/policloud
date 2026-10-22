// PoliCloud - Serviço Global de Mensagens e Notificações (Estilo NetAcad)
import { sb, getProfile, cleanTurma, sameCourse, normStr, parseArrayField, enrichTeacherFromDisciplinas, getDisciplinasDB } from './sb.js';

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
  if (messagesChannel) return;
  
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

  if (!syncInterval) {
    syncInterval = setInterval(async () => {
      try {
        const { data, error } = await sb
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

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
      } catch (e) {}
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
  if (!t) return '';
  return cleanTurma(t);
}

/**
 * Constrói o ID canónico para um canal de turma: turma-<curso>-<classe>-<turma>
 */
export function buildTurmaConvId(curso, classe, turma) {
  const c = (curso || '').toString().trim();
  const cl = (classe || '').toString().trim();
  const t = extractTurmaLetter(turma);
  return `turma-${c}-${cl}-${t}`.replace(/\s+/g, '_').toLowerCase();
}

/**
 * Verifica estritamente se uma mensagem pertence a um escopo de turma { curso, classe, turma }
 */
export function messageMatchesTurmaScope(msg, scope) {
  if (!msg || !scope || msg.recipient_id) return false;
  const targetConvId = buildTurmaConvId(scope.curso, scope.classe, scope.turma);
  if (msg.conversation_id && normStr(msg.conversation_id) === normStr(targetConvId)) {
    return true;
  }
  // Exigir correspondência ESTRITA de curso, classe e turma (sem aceitar mensagens órfãs de outros cursos/anos)
  if (!msg.curso || !msg.classe || !msg.turma) return false;
  const sameC = sameCourse(msg.curso, scope.curso);
  const sameCl = normStr(msg.classe) === normStr(scope.classe);
  const sameT = normStr(extractTurmaLetter(msg.turma)) === normStr(extractTurmaLetter(scope.turma));
  return sameC && sameCl && sameT;
}

/**
 * Obtém os escopos de turma ({ curso, classe, turma }) exatos de um perfil
 */
export function getUserTurmaScopes(profile) {
  if (!profile) return [];
  let role = (profile.role || 'aluno').toLowerCase();
  if (role === 'student') role = 'aluno';
  if (role === 'teacher') role = 'professor';

  const scopes = [];
  if (role === 'aluno') {
    if (profile.curso && profile.classe && profile.turma) {
      scopes.push({
        curso: profile.curso.trim(),
        classe: profile.classe.trim(),
        turma: extractTurmaLetter(profile.turma)
      });
    }
  } else if (role === 'professor') {
    if (Array.isArray(profile.atribuicoes_curriculares) && profile.atribuicoes_curriculares.length > 0) {
      profile.atribuicoes_curriculares.forEach(atr => {
        if (!atr.curso || atr.curso === 'Geral') return;
        const c = atr.curso.trim();
        const cl = (atr.classe && atr.classe !== 'Todas') ? atr.classe.trim() : null;
        const turmas = Array.isArray(atr.turmas) ? atr.turmas : (atr.turma ? [atr.turma] : []);
        const classesList = cl ? [cl] : (Array.isArray(profile.classes) && profile.classes.length > 0 ? profile.classes : ['10ª', '11ª', '12ª']);
        classesList.forEach(classeItem => {
          turmas.forEach(t => {
            const cleanT = extractTurmaLetter(t);
            if (cleanT && cleanT !== 'TODAS') {
              scopes.push({ curso: c, classe: classeItem, turma: cleanT });
            }
          });
        });
      });
    } else {
      const cArr = parseArrayField(profile.cursos || profile.curso).filter(c => c && normStr(c) !== 'geral' && normStr(c) !== 'todos');
      const clArr = parseArrayField(profile.classes || profile.classe).filter(cl => cl && normStr(cl) !== 'todas');
      const tArr = parseArrayField(profile.turmas || profile.turma).map(t => extractTurmaLetter(t)).filter(t => t && normStr(t) !== 'todas');
      if (cArr.length > 0 && clArr.length > 0 && tArr.length > 0) {
        cArr.forEach(c => {
          clArr.forEach(cl => {
            tArr.forEach(t => {
              scopes.push({ curso: c, classe: cl, turma: t });
            });
          });
        });
      }
    }
  }

  // Deduplicar
  const unique = [];
  const seen = new Set();
  scopes.forEach(s => {
    const key = `${normStr(s.curso)}|${normStr(s.classe)}|${normStr(s.turma)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
  });
  return unique;
}

/**
 * Verifica se um professor leciona exatamente na turma do aluno ({ curso, classe, turma })
 */
export function teacherMatchesStudentScope(profProfile, studentProfile) {
  if (!profProfile || !studentProfile) return false;
  if (!studentProfile.curso || !studentProfile.classe || !studentProfile.turma) return false;

  const sCurso = studentProfile.curso;
  const sClasse = studentProfile.classe;
  const sTurma = extractTurmaLetter(studentProfile.turma);

  const profScopes = getUserTurmaScopes(profProfile);
  return profScopes.some(ps =>
    sameCourse(ps.curso, sCurso) &&
    normStr(ps.classe) === normStr(sClasse) &&
    normStr(ps.turma) === normStr(sTurma)
  );
}

/**
 * Ordena mensagens cronologicamente (as mais antigas em cima, as mais recentes em baixo)
 */
function sortMessagesChronological(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/**
 * Obtém todas as mensagens relevantes ao utilizador (com isolamento estrito por utilizador/turma)
 */
export async function getAllMessages(userProfile = null) {
  let list = [];
  try {
    const { data, error } = await sb
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data)) {
      list = data;
      try {
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(sortMessagesChronological(list)));
      } catch (e) {}
    } else {
      list = getLocalMessages();
    }
  } catch (e) {
    list = getLocalMessages();
  }

  // Filtrar rigorosamente as mensagens para o utilizador atual, se fornecido
  const userId = userProfile?.id;
  if (userProfile && userId) {
    const userScopes = getUserTurmaScopes(userProfile);
    const userReads = getUserReadSet(userId);

    list = list.filter(m => {
      // 1. Mensagem direta enviada ou recebida por este utilizador
      if (m.recipient_id) {
        return String(m.sender_id) === String(userId) || String(m.recipient_id) === String(userId);
      }
      if (m.conversation_id && m.conversation_id.startsWith('direct-')) {
        const parts = m.conversation_id.replace('direct-', '').split('-');
        return parts.includes(String(userId)) || String(m.sender_id) === String(userId) || String(m.recipient_id) === String(userId);
      }
      // 2. Mensagem de canal de turma: apenas se pertencer exatamente a um dos escopos (curso, classe, turma) do utilizador
      return userScopes.some(sc => messageMatchesTurmaScope(m, sc));
    });

    list = list.map(m => {
      const isMine = String(m.sender_id) === String(userId);
      const isDirect = Boolean(m.recipient_id) || (m.conversation_id && m.conversation_id.startsWith('direct-'));
      const isRead = isMine || userReads.has(String(m.id)) || (isDirect && m.read_by_recipient === true);
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
  const list = getLocalMessages();
  list.push(messageObj);
  const sorted = sortMessagesChronological(list);
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(sorted));
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('policloud_chat_updated', { detail: messageObj }));

  try {
    await sb.from('messages').insert({
      id: messageObj.id,
      conversation_id: messageObj.conversation_id,
      sender_id: messageObj.sender_id,
      sender_name: messageObj.sender_name,
      sender_role: messageObj.sender_role,
      recipient_id: messageObj.recipient_id || null,
      recipient_name: messageObj.recipient_name || null,
      turma: messageObj.turma ? extractTurmaLetter(messageObj.turma) : null,
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
  } catch (e) {}

  return messageObj;
}

/**
 * Marca uma conversa como lida pelo utilizador atual
 */
export async function markConversationAsRead(convId, userProfile) {
  if (!convId || !userProfile) return;

  const currentUserId = userProfile.id || `usr-${userProfile.role}-session`;
  const allMsgs = await getAllMessages(userProfile);
  const readIds = [];

  const userScopes = getUserTurmaScopes(userProfile);
  const matchedScope = userScopes.find(sc => buildTurmaConvId(sc.curso, sc.classe, sc.turma) === convId);

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
    } else if (!isThisConv && matchedScope) {
      isThisConv = messageMatchesTurmaScope(m, matchedScope);
    }

    if (isThisConv) {
      readIds.push(m.id);
    }
  });

  if (readIds.length > 0) {
    markMessagesAsReadForUser(currentUserId, readIds);
  }

  // Apenas para conversas diretas atualizamos read_by_recipient na BD (em canais de turma o estado de leitura é individual por aluno/professor)
  if (convId.startsWith('direct-')) {
    sb.from('messages')
      .update({ read_by_recipient: true })
      .eq('conversation_id', convId)
      .neq('sender_id', currentUserId)
      .then(() => {})
      .catch(() => {});
  }

  window.dispatchEvent(new CustomEvent('policloud_chat_updated'));
}

/**
 * Gera lista de canais/conversas disponíveis para um dado perfil (com isolamento estrito Curso + Classe + Turma)
 */
export async function getConversationsListForUser(profile) {
  if (!profile) return [];

  let role = (profile.role || 'aluno').toLowerCase();
  if (role === 'student') role = 'aluno';
  if (role === 'teacher') role = 'professor';

  // Garantir que as disciplinas da BD enriquecem o perfil do professor
  let allDisciplinas = [];
  try {
    allDisciplinas = await getDisciplinasDB();
  } catch (e) {}

  if (role === 'professor' && allDisciplinas.length > 0) {
    enrichTeacherFromDisciplinas(profile, allDisciplinas);
  }

  const messages = await getAllMessages(profile);
  const currentUserId = profile.id || `usr-${profile.role}-session`;
  const conversations = [];

  // 1. Canais de Turma (Estritamente filtrados pelos escopos do utilizador)
  const uniqueScopedTurmas = getUserTurmaScopes(profile);

  uniqueScopedTurmas.forEach(st => {
    const convId = buildTurmaConvId(st.curso, st.classe, st.turma);
    const title = `${st.curso} • ${st.classe} • Turma ${st.turma}`;

    const turmaMsgs = messages.filter(m => messageMatchesTurmaScope(m, st));
    const sortedTurmaMsgs = sortMessagesChronological(turmaMsgs);
    const lastMsg = sortedTurmaMsgs.length > 0 ? sortedTurmaMsgs[sortedTurmaMsgs.length - 1] : null;

    const unreadCount = sortedTurmaMsgs.filter(m => 
      String(m.sender_id) !== String(currentUserId) && 
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

  // 2. Conversas Diretas (Aluno <-> Professor estritamente do mesmo Curso, Classe e Turma)
  if (role === 'aluno') {
    let professores = [];
    try {
      const { data, error } = await sb.from('profiles').select('*');
      if (!error && data) {
        professores = data.filter(p => ['teacher', 'professor'].includes((p.role || '').toLowerCase()) && p.is_active !== false);
      }
    } catch(e) {}
    
    professores.forEach(prof => {
      prof.nome = prof.nome || prof.full_name || 'Professor';
      prof.cursos = parseArrayField(prof.cursos || prof.curso);
      prof.classes = parseArrayField(prof.classes || prof.classe);
      prof.turmas = parseArrayField(prof.turmas || prof.turma).map(t => cleanTurma(t)).filter(Boolean);
      if (allDisciplinas.length > 0) {
        enrichTeacherFromDisciplinas(prof, allDisciplinas);
      }
    });

    professores.forEach(prof => {
      if (!teacherMatchesStudentScope(prof, profile)) return;

      const convId = `direct-${currentUserId}-${prof.id}`;
      const convMsgs = messages.filter(m => 
        m.conversation_id === convId || 
        m.conversation_id === `direct-${prof.id}-${currentUserId}` ||
        (String(m.recipient_id) === String(prof.id) && String(m.sender_id) === String(currentUserId)) ||
        (String(m.recipient_id) === String(currentUserId) && String(m.sender_id) === String(prof.id))
      );
      const sortedConvMsgs = sortMessagesChronological(convMsgs);
      const lastMsg = sortedConvMsgs.length > 0 ? sortedConvMsgs[sortedConvMsgs.length - 1] : null;

      const unreadCount = sortedConvMsgs.filter(m => 
        String(m.sender_id) === String(prof.id) && 
        m.read_by_recipient === false
      ).length;

      // Descobrir disciplinas que este professor leciona a esta turma para exibir no subtítulo
      const profDiscs = Array.isArray(prof.atribuicoes_curriculares)
        ? prof.atribuicoes_curriculares
            .filter(a => sameCourse(a.curso, profile.curso) && normStr(a.classe) === normStr(profile.classe) && (a.turmas || []).some(t => normStr(cleanTurma(t)) === normStr(cleanTurma(profile.turma))))
            .map(a => a.disciplina)
            .filter(d => d && d !== 'Geral')
        : [];
      const discLabel = profDiscs.length > 0 ? `Docente • ${profDiscs.join(', ')}` : 'Professor da Turma';

      conversations.push({
        id: convId,
        type: 'direct',
        targetId: prof.id,
        targetName: prof.nome,
        targetRole: 'professor',
        title: prof.nome,
        subtitle: discLabel,
        badge: 'Professor',
        avatar: (prof.nome || 'P').replace(/^Prof\.?\s*/i, '').substring(0, 2).toUpperCase(),
        lastMessage: lastMsg ? (lastMsg.file_name ? `📎 [Ficheiro] ${lastMsg.file_name}` : lastMsg.text) : 'Toque para iniciar mensagem direta (SMS)...',
        lastTime: lastMsg ? lastMsg.created_at : null,
        unreadCount: unreadCount
      });
    });
  } else if (role === 'professor') {
    let alunos = [];
    try {
      const { data, error } = await sb.from('profiles').select('*');
      if (!error && data) {
        alunos = data.filter(p => ['student', 'aluno'].includes((p.role || '').toLowerCase()) && p.is_active !== false);
      }
    } catch(e) {}

    alunos.forEach(aluno => {
      aluno.nome = aluno.nome || aluno.full_name || 'Aluno';
      if (aluno.turma) aluno.turma = cleanTurma(aluno.turma);

      if (!teacherMatchesStudentScope(profile, aluno)) return;

      const convId = `direct-${aluno.id}-${currentUserId}`;
      const convMsgs = messages.filter(m => 
        m.conversation_id === convId || 
        m.conversation_id === `direct-${currentUserId}-${aluno.id}` ||
        (String(m.recipient_id) === String(aluno.id) && String(m.sender_id) === String(currentUserId)) ||
        (String(m.recipient_id) === String(currentUserId) && String(m.sender_id) === String(aluno.id))
      );
      const sortedConvMsgs = sortMessagesChronological(convMsgs);
      const lastMsg = sortedConvMsgs.length > 0 ? sortedConvMsgs[sortedConvMsgs.length - 1] : null;

      const unreadCount = sortedConvMsgs.filter(m => 
        String(m.sender_id) === String(aluno.id) && 
        m.read_by_recipient === false
      ).length;

      conversations.push({
        id: convId,
        type: 'direct',
        targetId: aluno.id,
        targetName: aluno.nome,
        targetRole: 'aluno',
        turma: aluno.turma,
        curso: aluno.curso,
        classe: aluno.classe,
        title: aluno.nome,
        subtitle: `Aluno • ${aluno.curso || '—'} • ${aluno.classe || '—'} Turma ${aluno.turma || '—'}`,
        badge: `${aluno.classe || ''} ${aluno.turma || ''}`.trim(),
        avatar: (aluno.nome || 'A').substring(0, 2).toUpperCase(),
        lastMessage: lastMsg ? (lastMsg.file_name ? `📎 [Ficheiro] ${lastMsg.file_name}` : lastMsg.text) : 'Iniciar conversa direta com aluno...',
        lastTime: lastMsg ? lastMsg.created_at : null,
        unreadCount: unreadCount
      });
    });
  }

  conversations.sort((a, b) => {
    const timeA = a.lastTime ? new Date(a.lastTime).getTime() : 0;
    const timeB = b.lastTime ? new Date(b.lastTime).getTime() : 0;
    return timeB - timeA;
  });

  return conversations;
}

/**
 * Obtém mensagens de uma conversa específica com ordenação cronológica garantida
 * e isolamento estrito de Curso + Classe + Turma
 */
export async function getMessagesForConversation(convId, profile) {
  const all = await getAllMessages(profile);
  let msgs = [];
  
  if (convId.startsWith('turma-')) {
    const userScopes = getUserTurmaScopes(profile);
    const matchedScope = userScopes.find(sc => buildTurmaConvId(sc.curso, sc.classe, sc.turma) === convId);
    msgs = all.filter(m => {
      if (m.recipient_id) return false;
      if (matchedScope) {
        return messageMatchesTurmaScope(m, matchedScope);
      }
      return m.conversation_id === convId;
    });
  } else {
    msgs = all.filter(m => {
      if (m.conversation_id === convId) return true;
      if (convId.startsWith('direct-')) {
        const parts = convId.replace('direct-', '').split('-');
        if (parts.length >= 2) {
          const id1 = parts[0];
          const id2 = parts[1];
          return (String(m.sender_id) === String(id1) && String(m.recipient_id) === String(id2)) ||
                 (String(m.sender_id) === String(id2) && String(m.recipient_id) === String(id1)) ||
                 m.conversation_id === `direct-${id1}-${id2}` ||
                 m.conversation_id === `direct-${id2}-${id1}`;
        }
      }
      return false;
    });
  }

  return sortMessagesChronological(msgs);
}

/**
 * Notificações Push para o Professor (Modal "NOVA MENSAGEM RECEBIDA")
 */
export async function checkNewMessagePushForTeacher(teacherProfile) {
  const role = (teacherProfile?.role || '').toLowerCase();
  if (role !== 'professor' && role !== 'teacher') {
    return null;
  }

  const dismissedIds = getDismissedPushIds();
  const readSet = getUserReadSet(teacherProfile?.id);
  const all = await getAllMessages(teacherProfile);
  const teacherId = teacherProfile.id;
  const teacherScopes = getUserTurmaScopes(teacherProfile);

  const incoming = all.filter(m => {
    if (m.sender_role !== 'aluno' && m.sender_role !== 'student') return false;
    if (m.read_by_recipient === true || readSet.has(String(m.id))) return false;
    if (dismissedIds.includes(m.id)) return false;
    
    if (String(m.recipient_id) === String(teacherId)) return true;

    if (!m.recipient_id && teacherScopes.some(sc => messageMatchesTurmaScope(m, sc))) {
      return true;
    }

    return false;
  });

  if (incoming.length === 0) return null;

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
 * Notificações para o Aluno (Novos comunicados, mensagens do professor ou matérias da sua turma exata)
 */
export async function getStudentAlerts(studentProfile) {
  const role = (studentProfile?.role || '').toLowerCase();
  if (role !== 'aluno' && role !== 'student') {
    return [];
  }

  const alerts = [];
  const dismissed = getDismissedStudentAlerts();
  const readSet = getUserReadSet(studentProfile?.id);

  const msgs = await getAllMessages(studentProfile);
  const studentScopes = getUserTurmaScopes(studentProfile);

  const recentTeacherMsgs = msgs.filter(m => {
    const isTeacher = m.sender_role === 'professor' || m.sender_role === 'teacher';
    if (!isTeacher) return false;

    let isForMe = false;
    if (m.recipient_id) {
      isForMe = String(m.recipient_id) === String(studentProfile.id);
    } else {
      isForMe = studentScopes.some(sc => messageMatchesTurmaScope(m, sc));
    }
    if (!isForMe) return false;

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
      description: `${lastTeacherMsg.sender_name}: "${(lastTeacherMsg.text || '').substring(0, 60)}..."`,
      link: lastTeacherMsg.conversation_id ? `/mensagens.html?chat=${encodeURIComponent(lastTeacherMsg.conversation_id)}` : '/mensagens.html',
      badge: 'SMS / Chat',
      time: lastTeacherMsg.created_at
    });
  }

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
 */
export function turmaHasNewActivity(turmaName, cursoName = null, classeName = null) {
  if (!turmaName) return false;
  const msgs = getLocalMessages();
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 3600 * 1000;
  const targetTurma = extractTurmaLetter(turmaName);

  const hasRecentMsg = msgs.some(m => {
    if (extractTurmaLetter(m.turma) === targetTurma) {
      if (cursoName && m.curso && !sameCourse(m.curso, cursoName)) return false;
      if (classeName && m.classe && normStr(m.classe) !== normStr(classeName)) return false;
      const t = new Date(m.created_at).getTime();
      return t >= threeDaysAgo;
    }
    return false;
  });

  return hasRecentMsg;
}

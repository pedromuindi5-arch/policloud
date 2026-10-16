const fs = require('fs');
let js = fs.readFileSync('js/mensagens.js', 'utf8');

// 1. Update imports
js = js.replace(
  'dismissPushNotification\n} from \'./messages-service.js\';', 
  'dismissPushNotification,\n  initRealtimeMessages\n} from \'./messages-service.js\';'
);

// 2. Add initRealtimeMessages to initMessagesPage
js = js.replace(
  '  allConversations = await getConversationsListForUser(currentProfile);\n  renderConversations();',
  '  allConversations = await getConversationsListForUser(currentProfile);\n  renderConversations();\n\n  // Iniciar Supabase Realtime\n  initRealtimeMessages();'
);

// 3. Update the event listener for policloud_chat_updated
const oldListener = `  // Ouvir mensagens atualizadas de outras janelas/abas
  window.addEventListener('policloud_chat_updated', async () => {
    if (activeConversation) {
      await loadMessages();
    }
  });`;

const newListener = `  // Ouvir mensagens atualizadas em Tempo Real ou outras janelas
  window.addEventListener('policloud_chat_updated', async (e) => {
    // Atualizar a lista lateral
    allConversations = await getConversationsListForUser(currentProfile);
    
    if (activeConversation) {
      // Se for uma mensagem que acaba de chegar da nossa conversa atual, marca-a como lida
      const newMsg = e.detail;
      if (newMsg && newMsg.conversation_id === activeConversation.id && newMsg.sender_id !== currentProfile.id) {
         await markConversationAsRead(activeConversation.id, currentProfile);
         // recarrega os dados locais atualizados após marcar
         allConversations = await getConversationsListForUser(currentProfile);
      }
      renderConversations();
      await loadMessages();
    } else {
      renderConversations();
    }
  });`;

js = js.replace(oldListener, newListener);

fs.writeFileSync('js/mensagens.js', js, 'utf8');
console.log('Updated mensagens.js!');

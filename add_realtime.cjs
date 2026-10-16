const fs = require('fs');
let js = fs.readFileSync('js/messages-service.js', 'utf8');

// Insert the new Realtime logic
const realtimeLogic = `
let messagesChannel = null;

export function initRealtimeMessages(callback) {
  if (messagesChannel) return; // already initialized
  
  messagesChannel = sb.channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const newMsg = payload.new;
        
        // Save to local storage
        const list = getLocalMessages();
        // check if already exists to prevent duplicate if we sent it
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
    )
    .subscribe();
}

/**
 * Ordena mensagens cronologicamente (as mais antigas em cima, as mais recentes em baixo)
 */
`;

js = js.replace('/**\n * Ordena mensagens cronologicamente (as mais antigas em cima, as mais recentes em baixo)\n */', realtimeLogic);
fs.writeFileSync('js/messages-service.js', js, 'utf8');
console.log('Added initRealtimeMessages!');

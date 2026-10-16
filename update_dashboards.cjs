const fs = require('fs');

function addRealtimeToDashboard(filename) {
  let js = fs.readFileSync(filename, 'utf8');
  
  if (!js.includes('initRealtimeMessages')) {
    // Import initRealtimeMessages
    js = js.replace(
      'getStudentAlerts', 
      'getStudentAlerts,\n  initRealtimeMessages'
    );
    js = js.replace(
      'checkNewMessagePushForTeacher', 
      'checkNewMessagePushForTeacher,\n  initRealtimeMessages'
    );
    
    // Call it in initDashboard
    js = js.replace(
      'await updateStudentAlerts();',
      'await updateStudentAlerts();\n  initRealtimeMessages();'
    );
    
    js = js.replace(
      'await checkTeacherPushes();',
      'await checkTeacherPushes();\n  initRealtimeMessages();'
    );
    
    // Add event listener for realtime push
    const listener = `
  window.addEventListener('policloud_chat_updated', async () => {
    if (typeof updateStudentAlerts === 'function') await updateStudentAlerts();
    if (typeof checkTeacherPushes === 'function') await checkTeacherPushes();
  });
`;
    js = js.replace('document.addEventListener(\'DOMContentLoaded\', initDashboard);', listener + '\\ndocument.addEventListener(\'DOMContentLoaded\', initDashboard);');
    
    fs.writeFileSync(filename, js, 'utf8');
    console.log('Updated ' + filename);
  }
}

addRealtimeToDashboard('js/dashboard-aluno.js');
addRealtimeToDashboard('js/dashboard-professor.js');

const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

const additionalStyles = `
/* ==========================================================================
   FINAL POLISH: Apple HIG Adjustments (Phase C)
   ========================================================================== */

/* Apple-style smooth tags/badges */
.role-badge-admin, .role-badge-professor, .role-badge-aluno, .role-tag-teacher, .role-tag-student {
  border-radius: 9999px !important;
  font-weight: 500 !important;
  letter-spacing: -0.01em;
  padding: 4px 10px !important;
  border: 1px solid rgba(0,0,0,0.05);
}

/* Ensure minimum touch target size on mobile */
@media (max-width: 768px) {
  .btn-primary, .btn-secondary, .btn-icon, .btn-outline, .btn-danger, .modal-tab-btn {
    min-height: 44px !important;
  }
  
  /* Add safe area insets for mobile devices (iPhone X/11/12/13/14/15) */
  .chat-composer, .app-sidebar, .mobile-bottom-nav {
    padding-bottom: max(env(safe-area-inset-bottom), 16px) !important;
  }

  /* Improve table scrolling on mobile */
  .table-responsive {
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--color-border-subtle);
    -webkit-overflow-scrolling: touch;
  }
  
  .table-responsive table th, .table-responsive table td {
    padding: 12px 16px;
  }
}

/* Modal Apple HIG refinements */
.modal-content {
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) !important;
}
[data-theme="dark"] .modal-content {
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) !important;
}

/* Chat Bubbles refined Apple iMessage style */
.chat-bubble {
  border-radius: 18px !important;
  padding: 10px 14px !important;
  line-height: 1.4 !important;
}
.chat-bubble-sent {
  border-bottom-right-radius: 4px !important;
}
.chat-bubble-received {
  border-bottom-left-radius: 4px !important;
}
`;

if (!css.includes('FINAL POLISH: Apple HIG Adjustments')) {
  css += additionalStyles;
  fs.writeFileSync('css/style.css', css, 'utf8');
  console.log('Appended Apple HIG adjustments to style.css');
} else {
  console.log('Apple HIG adjustments already exist.');
}

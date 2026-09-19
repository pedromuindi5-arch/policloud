// PoliCloud - Intranet Escolar IPPLN
// Verificação partilhada de sessão e protecção de páginas por perfil (role)

import { sb, requireAuth, signOut, getProfile, log, toast } from '../sb.js';
import { initThemeSystem, applyTheme, toggleTheme, getStoredTheme } from './theme.js';

export { initThemeSystem, applyTheme, toggleTheme, getStoredTheme, requireAuth, signOut, getProfile, log, toast };

export function isConfigPlaceholder() {
  return false;
}

export function setupLogoutButton(buttonId = 'logout-btn') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut();
  });
}


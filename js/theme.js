// PoliCloud - Intranet Escolar IPPLN
// Sistema de Tema Global (Apple HIG - Claro & Escuro)
// Persistência em localStorage sem interferir com autenticação ou Supabase

const STORAGE_KEY = 'policloud_theme';

const SUN_SVG = `<svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;

const MOON_SVG = `<svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;

/**
 * Obtém o tema preferido actualmente
 * @returns {'light' | 'dark'}
 */
export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {}

  // Se não houver preferência guardada, verifica a preferência do sistema
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Aplica o tema na página
 * @param {'light' | 'dark'} theme 
 * @param {boolean} [persist=true] 
 */
export function applyTheme(theme, persist = true) {
  const isDark = theme === 'dark';
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  if (body) {
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(isDark ? 'theme-dark' : 'theme-light');
  }

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  // Actualiza todos os botões de alternância de tema no documento
  document.querySelectorAll('.btn-theme-toggle').forEach(btn => {
    const iconContainer = btn.querySelector('.theme-toggle-icon') || btn;
    const labelSpan = btn.querySelector('.theme-toggle-label');

    btn.setAttribute('aria-label', isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    btn.setAttribute('title', isDark ? 'Activar modo claro' : 'Activar modo escuro');

    if (btn.querySelector('.theme-toggle-icon')) {
      iconContainer.innerHTML = isDark ? SUN_SVG : MOON_SVG;
    } else {
      btn.innerHTML = `${isDark ? SUN_SVG : MOON_SVG}${labelSpan ? `<span class="theme-toggle-label">${isDark ? 'Modo Claro' : 'Modo Escuro'}</span>` : ''}`;
    }
  });

  // Dispara evento personalizado para componentes que precisem de reagir visualmente
  window.dispatchEvent(new CustomEvent('policloud-theme-changed', { detail: { theme } }));
}

/**
 * Alterna entre tema claro e escuro
 */
export function toggleTheme() {
  const current = getStoredTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next, true);
  return next;
}

/**
 * Inicializa os botões de tema e injecta o controlo onde faltar
 */
export function initThemeSystem() {
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme, false);

  // Se o utilizador clicar em qualquer botão com a classe .btn-theme-toggle
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.btn-theme-toggle');
    if (toggleBtn) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Ouve mudanças do sistema operacional se o utilizador não tiver preferência explícita guardada
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const hasStored = localStorage.getItem(STORAGE_KEY);
      if (!hasStored) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  } catch (e) {}
}

// Execução imediata no carregamento do script
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSystem);
  } else {
    initThemeSystem();
  }
}

// PoliCloud - Intranet Escolar IPPLN
// Autenticação e controlo de sessão em login.html

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
import './theme.js';

// Elementos do DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const alertBox = document.getElementById('alert-box');
const alertMessage = document.getElementById('alert-message');
const sessionOverlay = document.getElementById('session-check-overlay');
const togglePasswordBtn = document.getElementById('toggle-password-btn');

/**
 * Exibe uma mensagem de erro na caixa de alerta
 * @param {string} message - Texto do erro
 * @param {'error' | 'warning'} [type='error']
 */
function showAlert(message, type = 'error') {
  if (alertBox && alertMessage) {
    alertBox.className = `alert-box visible alert-${type}`;
    alertMessage.textContent = message;
  }
  toast(message, type === 'warning' ? 'error' : type);
}

/**
 * Oculta a caixa de alerta
 */
function hideAlert() {
  if (!alertBox) return;
  alertBox.className = 'alert-box';
}

/**
 * Define o estado visual de carregamento do formulário
 * @param {boolean} isLoading 
 */
function setLoading(isLoading) {
  if (!submitBtn || !emailInput || !passwordInput) return;
  
  if (isLoading) {
    submitBtn.disabled = true;
    emailInput.disabled = true;
    passwordInput.disabled = true;
    if (btnText) btnText.textContent = 'A entrar...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
  } else {
    submitBtn.disabled = false;
    emailInput.disabled = false;
    passwordInput.disabled = false;
    if (btnText) btnText.textContent = 'Entrar na Intranet';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

/**
 * Redireciona o utilizador com base no perfil (role)
 * @param {string} role 
 */
function redirectByRole(role) {
  const normalizedRole = (role || '').trim().toLowerCase();
  
  if (normalizedRole === 'admin') {
    window.location.replace('admin.html');
  } else if (normalizedRole === 'professor' || normalizedRole === 'teacher') {
    window.location.replace('dashboard-professor.html');
  } else {
    window.location.replace('dashboard-aluno.html');
  }
}

/**
 * Verifica se já existe uma sessão activa ao carregar a página
 */
async function checkExistingSession() {
  const hideOverlay = () => {
    if (sessionOverlay) {
      sessionOverlay.classList.add('hidden');
      sessionOverlay.classList.add('fade-out');
      sessionOverlay.style.display = 'none';
    }
  };

  try {
    const profile = await Promise.race([
      getProfile(),
      new Promise(resolve => setTimeout(() => resolve(null), 2500))
    ]);

    if (profile && profile.is_active) {
      redirectByRole(profile.role);
      return;
    }
  } catch (err) {
    // Continua para o formulário
  } finally {
    hideOverlay();
  }
}

// Alternar visibilidade da senha
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe');
  });
}

// Submissão do formulário de autenticação
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      showAlert('Por favor, preencha o seu email institucional e palavra-passe.');
      return;
    }

    setLoading(true);

    try {
      // Autenticação com Supabase Auth
      const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setLoading(false);
        const errMsg = error.message ? error.message.toLowerCase() : '';
        if (errMsg.includes('invalid login credentials') || errMsg.includes('invalid_credentials')) {
          showAlert('Email ou palavra-passe incorretos. Por favor, verifique os seus dados.');
        } else if (errMsg.includes('email not confirmed')) {
          showAlert('O endereço de email ainda não foi confirmado pela secretaria.');
        } else if (errMsg.includes('network') || errMsg.includes('failed to fetch')) {
          showAlert('Não foi possível ligar ao servidor. Verifique a sua ligação à internet.');
        } else {
          showAlert('Não foi possível iniciar sessão. Verifique as suas credenciais.');
        }
        return;
      }

      const profile = await getProfile();

      if (!profile || !profile.is_active) {
        await signOut();
        setLoading(false);
        showAlert('A sua conta encontra-se desactivada ou não foi encontrada. Contacte a administração escolar do IPPLN.');
        return;
      }

      await log('login', 'profiles', profile.id, profile.nome || profile.email || '');
      toast(`Sessão iniciada com sucesso. Bem-vindo(a), ${profile.nome || ''}!`, 'success');
      redirectByRole(profile.role);
    } catch (err) {
      setLoading(false);
      showAlert('Ocorreu um erro inesperado ao tentar entrar. Tente novamente mais tarde.');
    }
  });
}

// Inicializações
initSidebar();
mouseTrack();
checkExistingSession();


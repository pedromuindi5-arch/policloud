// PoliCloud - Intranet Escolar IPPLN
// Lógica do Dashboard do Aluno (dashboard-aluno.html)

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
import './theme.js';

// Elementos do DOM
const sessionOverlay = document.getElementById('session-check-overlay');
const studentAvatar = document.getElementById('student-avatar');
const studentName = document.getElementById('student-name');
const studentCourse = document.getElementById('student-course');
const studentClasse = document.getElementById('student-classe');
const studentTurma = document.getElementById('student-turma');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');

const newsContainer = document.getElementById('news-container');
const filesContainer = document.getElementById('files-container');
const muralContainer = document.getElementById('mural-container');

/**
 * Formata tempo decorrido relativo
 * @param {string} dateString 
 * @returns {string}
 */
function formatTimeRelative(dateString) {
  if (!dateString) return '';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hoje há poucos instantes';
    if (diffHours < 24) return `Hoje às ${new Date(dateString).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`;
    return fDate(dateString);
  } catch (e) {
    return fDate(dateString);
  }
}

/**
 * Carrega as notícias mais recentes (gerais para toda a escola)
 */
async function loadRecentNews() {
  if (!newsContainer) return;

  try {
    const { data: news, error } = await sb
      .from('news')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      newsContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar as notícias de momento.</span>
        </div>
      `;
      return;
    }

    if (!news || news.length === 0) {
      newsContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/>
            <path d="M15 18h-5"/>
            <path d="M10 6h8v4h-8V6Z"/>
          </svg>
          <span>Não existem notícias publicadas recentemente.</span>
        </div>
      `;
      return;
    }

    newsContainer.innerHTML = news.map(item => `
      <article class="news-item">
        <span class="news-item-date">${fDate(item.created_at)}</span>
        <h4 class="news-item-title">${escapeHtml(item.title || 'Comunicado Escolar')}</h4>
        <p class="news-item-desc">${escapeHtml(item.content || '')}</p>
      </article>
    `).join('');
  } catch (err) {
    newsContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar as notícias escolares.</span>
      </div>
    `;
  }
}

/**
 * Carrega os ficheiros recentes para o curso/turma do aluno
 * @param {any} profile
 */
async function loadStudentFiles(profile) {
  if (!filesContainer) return;

  try {
    let query = sb
      .from('files')
      .select('id, name, file_url, size, curso, turma, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    if (profile.curso) {
      query = query.or(`curso.eq.${profile.curso},curso.is.null`);
    }

    const { data: files, error } = await query;

    if (error) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar os ficheiros da nuvem.</span>
        </div>
      `;
      return;
    }

    if (!files || files.length === 0) {
      filesContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          <span>Nenhum ficheiro recente partilhado para o seu curso.</span>
        </div>
      `;
      return;
    }

    filesContainer.innerHTML = files.map(file => `
      <div class="file-item">
        <div class="file-info-group">
          <div class="file-type-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            </svg>
          </div>
          <div class="file-text-meta">
            <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name || 'Documento')}</span>
            <span class="file-details">${file.size ? formatFileSize(file.size) : 'Ficheiro'} • ${fDate(file.created_at)}</span>
          </div>
        </div>
        ${file.file_url ? `
          <a href="${encodeURI(file.file_url)}" target="_blank" rel="noopener noreferrer" class="file-download-link" title="Transferir ficheiro" download>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        ` : ''}
      </div>
    `).join('');
  } catch (err) {
    filesContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao processar ficheiros escolares.</span>
      </div>
    `;
  }
}

/**
 * Carrega a prévia dos últimos recados do mural da turma do aluno
 * @param {any} profile
 */
async function loadMuralPreview(profile) {
  if (!muralContainer) return;

  try {
    let query = sb
      .from('mural_posts')
      .select('id, author_name, content, turma, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (profile.turma) {
      query = query.or(`turma.eq.${profile.turma},turma.is.null`);
    }

    const { data: posts, error } = await query;

    if (error) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <span>Não foi possível carregar os avisos do mural da turma.</span>
        </div>
      `;
      return;
    }

    if (!posts || posts.length === 0) {
      muralContainer.innerHTML = `
        <div class="state-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <span>O mural da turma está calmo. Nenhum aviso pendente.</span>
        </div>
      `;
      return;
    }

    muralContainer.innerHTML = posts.map(post => `
      <div class="mural-post-item">
        <div class="mural-post-meta">
          <span class="mural-author">${escapeHtml(post.author_name || 'Professor / Secretaria')}</span>
          <span class="mural-time">${formatTimeRelative(post.created_at)}</span>
        </div>
        <p class="mural-content-text">${escapeHtml(post.content || '')}</p>
      </div>
    `).join('');
  } catch (err) {
    muralContainer.innerHTML = `
      <div class="state-empty">
        <span>Erro ao carregar os avisos do mural.</span>
      </div>
    `;
  }
}

/**
 * Utilitários auxiliares
 */
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

/**
 * Inicialização do Dashboard do Aluno
 */
async function initStudentDashboard() {
  initSidebar();
  mouseTrack();

  const profile = await requireAuth(['aluno']);
  if (!profile) return;

  // Preenchimento dos dados do perfil no cabeçalho
  const displayName = profile.nome || profile.full_name || 'Estudante IPPLN';
  const displayInitials = initials(displayName);

  if (studentName) studentName.textContent = displayName;
  if (studentAvatar) studentAvatar.textContent = displayInitials;
  if (sidebarUserName) sidebarUserName.textContent = displayName;
  if (sidebarUserAvatar) sidebarUserAvatar.textContent = displayInitials;

  if (studentCourse) studentCourse.textContent = profile.curso ? `Curso: ${profile.curso}` : 'Curso Técnico';
  if (studentClasse) studentClasse.textContent = profile.classe ? `${profile.classe} Classe` : 'Ensino Técnico Médio';
  if (studentTurma) studentTurma.textContent = profile.turma ? `Turma: ${profile.turma}` : 'IPPLN';

  // Configurar botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }

  // Carregar blocos do dashboard em paralelo
  await Promise.all([
    loadRecentNews(),
    loadStudentFiles(profile),
    loadMuralPreview(profile)
  ]);

  // Remove overlay
  if (sessionOverlay) {
    sessionOverlay.classList.add('hidden');
  }
}

initStudentDashboard();


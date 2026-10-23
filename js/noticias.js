// PoliCloud - Intranet Escolar IPPLN
// Lógica da Página de Notícias (noticias.html)

import { sb, getProfile, requireAuth, signOut, log, toast, confirmModal, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
import './theme.js';

function isConfigPlaceholder() { return false; }

// Elementos do DOM - Sessão e Sidebar
const sessionOverlay = document.getElementById('session-check-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const appSidebar = document.getElementById('app-sidebar');
const navDashboardLink = document.getElementById('nav-dashboard-link');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
const sidebarUserRole = document.getElementById('sidebar-user-role');
const demoRoleSwitcher = document.getElementById('demo-role-switcher');

// Elementos do DOM - Notícias
const pinnedSection = document.getElementById('pinned-section');
const pinnedNewsContainer = document.getElementById('pinned-news-container');
const regularNewsContainer = document.getElementById('regular-news-container');
const totalNewsCount = document.getElementById('total-news-count');

// Elementos do DOM - Apenas Admin
const adminPublishSection = document.getElementById('admin-publish-section');
const btnOpenCreateNews = document.getElementById('btn-open-create-news');
const createNewsModal = document.getElementById('create-news-modal');
const btnCloseCreateNews = document.getElementById('btn-close-create-news');
const btnCancelCreateNews = document.getElementById('btn-cancel-create-news');
const createNewsForm = document.getElementById('create-news-form');
const newsTitleInput = document.getElementById('news-title');
const newsSubtitleInput = document.getElementById('news-subtitle');
const newsContentInput = document.getElementById('news-content');
const newsPinnedCheckbox = document.getElementById('news-pinned');
const btnSubmitNews = document.getElementById('btn-submit-news');

// Upload de Capa
const newsDropzone = document.getElementById('news-dropzone');
const newsCoverInput = document.getElementById('news-cover-input');
const imagePreviewCard = document.getElementById('image-preview-card');
const imagePreviewThumb = document.getElementById('image-preview-thumb');
const imagePreviewName = document.getElementById('image-preview-name');
const imagePreviewSize = document.getElementById('image-preview-size');
const btnRemoveImage = document.getElementById('btn-remove-image');

// Mensagens e Progresso
const uploadProgressBox = document.getElementById('upload-progress-box');
const uploadProgressText = document.getElementById('upload-progress-text');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const formAlert = document.getElementById('form-alert');

// Modal de Leitura Completa
const newsReaderModal = document.getElementById('news-reader-modal');
const btnCloseReader = document.getElementById('btn-close-reader');
const readerImageWrapper = document.getElementById('reader-image-wrapper');
const readerImage = document.getElementById('reader-image');
const readerDate = document.getElementById('reader-date');
const readerPinnedBadge = document.getElementById('reader-pinned-badge');
const readerTitle = document.getElementById('reader-title');
const readerSubtitle = document.getElementById('reader-subtitle');
const readerContent = document.getElementById('reader-content');

// Estado interno
let currentProfile = null;
let selectedCoverFile = null;
let localNewsStore = [];

// Constantes de validação
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Notícias de demonstração institucionais para o IPPLN
const DEFAULT_DEMO_NEWS = [
  {
    id: 'demo-1',
    title: 'Abertura Oficial do Ano Lectivo 2026/2027 e Directrizes Pedagógicas',
    subtitle: 'A Direcção do IPPLN saúda todos os estudantes, corpo docente e encarregados de educação.',
    content: `O Instituto Politécnico Pascoal Luvualu do Namibe (IPPLN) dá as boas-vindas a toda a comunidade escolar para o arranque de mais um ano de formação técnico-profissional de excelência.\n\nDurante este primeiro trimestre, apelamos ao rigor, assiduidade e máximo aproveitamento nas salas de aula e nos laboratórios práticos. As turmas das 10ªs, 11ªs, 12ªs e 13ªs classes devem consultar com regularidade o calendário de avaliações contínuas e o mural das respectivas turmas através do PoliCloud.\n\nA secretaria escolar informa ainda que a confirmação de matrículas pendentes decorre até ao final da corrente semana.`,
    cover_image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    pinned: true,
    category: 'direccao',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-2',
    title: 'Modernização das Oficinas e Laboratórios de Informática e Electricidade',
    subtitle: 'Novos equipamentos de rede e componentes práticos instalados no bloco técnico.',
    content: `No âmbito do plano de melhoria contínua das infraestruturas de ensino técnico do IPPLN, foram concluídos os trabalhos de instalação de novos computadores, bastidores de telecomunicações e postos de ensaio electrotécnicos.\n\nOs novos recursos estarão disponíveis a partir de quarta-feira para as turmas dos cursos de Informática, Electricidade e Mecânica, possibilitando um contacto ainda mais aprofundado com as tecnologias do mercado de trabalho angolano.`,
    cover_image_url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    category: 'oficinas',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-3',
    title: 'Inscrições Abertas para a Feira Provincial de Ciência e Robótica',
    subtitle: 'Estudantes com projectos de fim de curso podem candidatar-se na coordenação.',
    content: `Encontram-se abertas as inscrições para a edição anual da Feira Provincial de Inovação e Ciência Tecnológica do Namibe. Todos os alunos do IPPLN com projectos de automação, desenvolvimento de software, energias renováveis ou mecânica aplicada são convidados a submeter as suas propostas na sala de coordenação pedagógica até ao dia 30 do corrente mês.`,
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    category: 'eventos',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-4',
    title: 'Palestras sobre Segurança no Trabalho e Higiene Ocupacional',
    subtitle: 'Ciclo de formação obrigatório para alunos das oficinas industriais.',
    content: `Recordamos a todos os formandos das oficinas mecânicas e químicas que a participação nas sessões de segurança industrial é obrigatória antes do início das práticas laboratoriais intensivas deste semestre. Trazer equipamento de protecção individual regularizado.`,
    cover_image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    category: 'pedagogico',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
];

let activeNewsCategory = 'todas';

function getNewsCategoryConfig(category) {
  switch (category) {
    case 'direccao':
      return { label: 'Direcção & Secretaria', class: 'cat-direccao' };
    case 'pedagogico':
      return { label: 'Pedagógico & Aulas', class: 'cat-pedagogico' };
    case 'oficinas':
      return { label: 'Oficinas & Laboratórios', class: 'cat-oficinas' };
    case 'eventos':
      return { label: 'Eventos & Ciência', class: 'cat-eventos' };
    default:
      return { label: 'Comunicado Geral', class: 'cat-direccao' };
  }
}

/**
 * Utilitários
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Exibe alerta dentro do formulário admin
 */
function showFormAlert(message, type = 'error') {
  if (!formAlert) return;
  formAlert.className = `alert-box visible alert-${type}`;
  formAlert.innerHTML = `<span>${escapeHtml(message)}</span>`;
}

function hideFormAlert() {
  if (!formAlert) return;
  formAlert.className = 'alert-box';
  formAlert.innerHTML = '';
}

/**
 * Atualiza a barra de progresso durante o upload
 */
function setUploadProgress(percentage, statusText) {
  if (!uploadProgressBox || !uploadProgressBar || !uploadProgressText) return;
  uploadProgressBox.style.display = 'flex';
  uploadProgressBar.style.width = `${percentage}%`;
  uploadProgressText.textContent = statusText;
}

function hideUploadProgress() {
  if (!uploadProgressBox) return;
  uploadProgressBox.style.display = 'none';
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
}

/**
 * Trata o ficheiro de imagem seleccionado
 */
function handleFileSelection(file) {
  hideFormAlert();

  if (!file) return;

  // Validação de formato (PNG, JPG, JPEG, WEBP)
  const mimeType = (file.type || '').toLowerCase();
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mimeType);
  const isExtAllowed = ['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension);

  if (!isMimeAllowed && !isExtAllowed) {
    showFormAlert('Formato de ficheiro inválido. Apenas são aceites imagens nos formatos PNG, JPG, JPEG ou WEBP.');
    clearSelectedFile();
    return;
  }

  // Validação de tamanho máximo (15MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    showFormAlert(`A imagem excede o tamanho máximo de 15MB (seleccionou ${sizeMb} MB). Por favor escolha uma imagem mais leve.`);
    clearSelectedFile();
    return;
  }

  selectedCoverFile = file;

  // Atualiza pré-visualização
  if (imagePreviewCard && imagePreviewName && imagePreviewSize && imagePreviewThumb) {
    imagePreviewName.textContent = file.name;
    imagePreviewSize.textContent = formatFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewThumb.src = e.target.result;
      imagePreviewCard.style.display = 'flex';
      if (newsDropzone) newsDropzone.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }
}

function clearSelectedFile() {
  selectedCoverFile = null;
  if (newsCoverInput) newsCoverInput.value = '';
  if (imagePreviewCard) imagePreviewCard.style.display = 'none';
  if (newsDropzone) newsDropzone.style.display = 'block';
}

/**
 * Configurações da área de upload e drag-and-drop
 */
function setupUploadDropzone() {
  if (!newsDropzone || !newsCoverInput) return;

  // Clique na zona para abrir selector
  newsDropzone.addEventListener('click', () => {
    newsCoverInput.click();
  });

  // Mudança no input de ficheiro
  newsCoverInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  });

  // Drag and drop
  ['dragenter', 'dragover'].forEach(eventName => {
    newsDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      newsDropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    newsDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      newsDropzone.classList.remove('drag-over');
    });
  });

  newsDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files[0]) {
      handleFileSelection(dt.files[0]);
    }
  });

  // Botão remover imagem
  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', (e) => {
      e.preventDefault();
      clearSelectedFile();
    });
  }
}

/**
 * Abre o leitor de notícia completa
 */
function openNewsReader(newsItem) {
  if (!newsReaderModal) return;

  if (readerImageWrapper && readerImage) {
    const coverUrl = newsItem.cover_image_url || newsItem.image_url || newsItem.foto_capa;
    if (coverUrl) {
      readerImage.src = coverUrl;
      readerImageWrapper.style.display = 'block';
    } else {
      readerImageWrapper.style.display = 'none';
    }
  }

  const isPinned = newsItem.pinned === true || newsItem.is_pinned === true || newsItem.fixado === true;
  if (readerPinnedBadge) {
    readerPinnedBadge.style.display = isPinned ? 'inline-flex' : 'none';
  }

  const readerCategoryBadge = document.getElementById('reader-category-badge');
  const readerCategoryText = document.getElementById('reader-category-text');
  if (readerCategoryBadge) {
    const catConfig = getNewsCategoryConfig(newsItem.category || 'direccao');
    readerCategoryBadge.className = `news-category-tag ${catConfig.class}`;
    if (readerCategoryText) readerCategoryText.textContent = catConfig.label;
    readerCategoryBadge.style.display = 'inline-flex';
  }

  if (readerDate) readerDate.textContent = formatDate(newsItem.created_at);
  if (readerTitle) readerTitle.textContent = newsItem.title || 'Comunicado';
  if (readerSubtitle) {
    const sub = newsItem.subtitle || newsItem.subtitulo || '';
    readerSubtitle.textContent = sub;
    readerSubtitle.style.display = sub ? 'block' : 'none';
  }
  if (readerContent) readerContent.textContent = newsItem.content || newsItem.corpo || '';

  openM('news-reader-modal');
}

function closeNewsReader() {
  closeM('news-reader-modal');
}

/**
 * Verifica se o utilizador autenticado tem permissão para editar ou eliminar a notícia
 * - Admin: pode gerir notícias de todos
 * - Professor: pode gerir apenas as notícias dele
 * - Aluno: não pode gerir nenhuma notícia
 */
function canManageNews(item) {
  if (!currentProfile) return false;
  if (currentProfile.role === 'admin') return true;
  if (currentProfile.role === 'professor') {
    if (item.author_id && item.author_id === currentProfile.id) return true;
    if (item.created_by && item.created_by === currentProfile.id) return true;
    if (item.author_name && currentProfile.nome && (
      item.author_name.toLowerCase().includes(currentProfile.nome.toLowerCase()) ||
      currentProfile.nome.toLowerCase().includes(item.author_name.toLowerCase())
    )) return true;
    return false;
  }
  return false;
}

/**
 * Renderiza as notícias na página divididas entre fixadas e gerais
 */
function renderNews(newsList) {
  if (!pinnedSection || !pinnedNewsContainer || !regularNewsContainer) return;

  const filteredNews = activeNewsCategory === 'todas'
    ? newsList
    : newsList.filter(item => (item.category || 'direccao') === activeNewsCategory);

  if (totalNewsCount) {
    totalNewsCount.textContent = `${filteredNews.length} notícia${filteredNews.length === 1 ? '' : 's'}`;
  }

  // Separação de notícias fixadas e regulares
  const pinnedNews = [];
  const regularNews = [];

  filteredNews.forEach(item => {
    const isPinned = item.pinned === true || item.is_pinned === true || item.fixado === true;
    if (isPinned) {
      pinnedNews.push(item);
    } else {
      regularNews.push(item);
    }
  });

  // 1. Notícias Fixadas (Destaque Principal no Topo)
  if (pinnedNews.length > 0) {
    pinnedSection.style.display = 'block';
    pinnedNewsContainer.innerHTML = pinnedNews.map(item => {
      const coverUrl = item.cover_image_url || item.image_url || item.foto_capa;
      const subtitle = item.subtitle || item.subtitulo || '';
      const content = item.content || item.corpo || '';
      const catConfig = getNewsCategoryConfig(item.category || 'direccao');
      const canManage = canManageNews(item);

      return `
        <article class="news-featured-card" data-id="${escapeHtml(item.id)}">
          <div class="news-featured-image-wrapper">
            ${coverUrl ? `
              <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(item.title)}" class="news-featured-image" loading="lazy" />
            ` : `
              <div class="news-featured-image-fallback">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/>
                  <path d="M15 18h-5"/>
                  <path d="M10 6h8v4h-8V6Z"/>
                </svg>
                <span>Instituto Politécnico Pascoal Luvualu</span>
              </div>
            `}
          </div>
          <div class="news-featured-body">
            <div>
              <div class="news-featured-meta-top">
                <span class="pinned-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                  Fixado no Topo
                </span>
                <span class="news-category-tag ${catConfig.class}">
                  <span class="cat-dot" aria-hidden="true"></span>
                  ${escapeHtml(catConfig.label)}
                </span>
                <span class="news-date-text">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  ${formatDate(item.created_at)}
                </span>
              </div>
              <h3 class="news-featured-title">${escapeHtml(item.title)}</h3>
              ${subtitle ? `<h4 class="news-featured-subtitle">${escapeHtml(subtitle)}</h4>` : ''}
              <p class="news-featured-excerpt">${escapeHtml(content)}</p>
            </div>
            <div class="news-card-footer" style="padding-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="news-date-text">Gabinete de Comunicação • IPPLN</span>
              <div style="display: inline-flex; align-items: center; gap: 8px; margin-left: auto;">
                ${canManage ? `
                  <button type="button" class="btn-table-action btn-edit-news" data-id="${escapeHtml(item.id)}" title="Editar notícia">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button type="button" class="btn-table-action action-status-danger btn-delete-news" data-id="${escapeHtml(item.id)}" title="Eliminar notícia">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Eliminar</span>
                  </button>
                ` : ''}
                <button type="button" class="btn-read-news btn-read-item" data-id="${escapeHtml(item.id)}">
                  <span>Ver tudo</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } else {
    pinnedSection.style.display = 'none';
    pinnedNewsContainer.innerHTML = '';
  }

  // 2. Notícias Regulares (Grid de Cartões)
  if (regularNews.length > 0) {
    regularNewsContainer.innerHTML = regularNews.map(item => {
      const coverUrl = item.cover_image_url || item.image_url || item.foto_capa;
      const subtitle = item.subtitle || item.subtitulo || '';
      const content = item.content || item.corpo || '';
      const catConfig = getNewsCategoryConfig(item.category || 'direccao');
      const canManage = canManageNews(item);

      return `
        <article class="news-card" data-id="${escapeHtml(item.id)}">
          <div class="news-card-image-wrap">
            ${coverUrl ? `
              <img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(item.title)}" class="news-card-image" loading="lazy" />
            ` : `
              <div class="news-card-image-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                  <path d="M18 14h-8"/>
                  <path d="M15 18h-5"/>
                  <path d="M10 6h8v4h-8V6Z"/>
                </svg>
                <span>PoliCloud Notícias</span>
              </div>
            `}
          </div>
          <div class="news-card-content">
            <div class="news-card-top-row">
              <span class="news-category-tag ${catConfig.class}">
                <span class="cat-dot" aria-hidden="true"></span>
                ${escapeHtml(catConfig.label)}
              </span>
              <span class="news-date-text">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${formatDate(item.created_at)}
              </span>
            </div>
            <h3 class="news-card-title">${escapeHtml(item.title)}</h3>
            ${subtitle ? `<h4 class="news-card-subtitle">${escapeHtml(subtitle)}</h4>` : ''}
            <p class="news-card-excerpt">${escapeHtml(content)}</p>
            <div class="news-card-footer" style="padding-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="news-date-text">IPPLN</span>
              <div style="display: inline-flex; align-items: center; gap: 8px; margin-left: auto;">
                ${canManage ? `
                  <button type="button" class="btn-table-action btn-edit-news" data-id="${escapeHtml(item.id)}" title="Editar notícia">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button type="button" class="btn-table-action action-status-danger btn-delete-news" data-id="${escapeHtml(item.id)}" title="Eliminar notícia">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Eliminar</span>
                  </button>
                ` : ''}
                <button type="button" class="btn-read-news btn-read-item" data-id="${escapeHtml(item.id)}">
                  <span>Ver mais</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } else if (pinnedNews.length === 0) {
    regularNewsContainer.innerHTML = `
      <div class="state-empty" style="grid-column: 1 / -1; padding: 48px 24px;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
          <path d="M18 14h-8"/>
          <path d="M15 18h-5"/>
          <path d="M10 6h8v4h-8V6Z"/>
        </svg>
        <span>Não existem notícias publicadas nesta categoria.</span>
      </div>
    `;
  } else {
    regularNewsContainer.innerHTML = '';
  }

  // Adiciona listeners para botões de leitura
  document.querySelectorAll('.btn-read-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const item = newsList.find(n => String(n.id) === String(id));
      if (item) {
        openNewsReader(item);
      }
    });
  });

  // Listeners para editar notícias
  document.querySelectorAll('.btn-edit-news').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditNews(id);
    });
  });

  // Listeners para eliminar notícias
  document.querySelectorAll('.btn-delete-news').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      await deleteNews(id);
    });
  });
}

/**
 * Configura os botões de filtro por categoria de notícias
 */
function setupNewsCategoryFilters() {
  const pills = document.querySelectorAll('.news-category-pill');
  if (!pills || pills.length === 0) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeNewsCategory = pill.getAttribute('data-category') || 'todas';
      renderNews(localNewsStore);
    });
  });
}

/**
 * Normaliza campos do registo de notícia para garantir consistência
 */
function normalizeNewsItem(item) {
  if (!item) return item;
  const validCategories = ['direccao', 'pedagogico', 'oficinas', 'eventos'];
  let cat = item.category || item.categoria;
  if (!cat && item.body && validCategories.includes(item.body.toLowerCase().trim())) {
    cat = item.body.toLowerCase().trim();
  }
  item.category = cat || 'direccao';

  item.cover_image_url = item.cover_image_url || item.cover_url || item.image_url || item.foto_capa || null;
  item.pinned = item.pinned === true || item.is_pinned === true || item.fixado === true;
  item.content = item.content || (item.body && !validCategories.includes(item.body.toLowerCase().trim()) ? item.body : '') || '';

  if (!item.author_name) {
    if (item.profiles && typeof item.profiles === 'object') {
      item.author_name = item.profiles.nome || item.profiles.full_name || 'Direcção';
    } else {
      item.author_name = item.autor || item.author || 'Direcção';
    }
  }

  return item;
}

/**
 * Carrega a lista de notícias do Supabase
 */
async function loadNews() {
  try {
    const { data: news, error } = await sb
      .from('news')
      .select('*, profiles:author_id(id, nome, full_name, role)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Tentativa com join de profiles falhou, tentando select simples:', error.message);
      const { data: simpleNews, error: simpleErr } = await sb
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (simpleErr || !simpleNews || simpleNews.length === 0) {
        localNewsStore = DEFAULT_DEMO_NEWS.map(n => normalizeNewsItem(n));
        renderNews(localNewsStore);
        return;
      }
      localNewsStore = simpleNews.map(n => normalizeNewsItem(n));
      renderNews(localNewsStore);
      return;
    }

    if (!news || news.length === 0) {
      localNewsStore = DEFAULT_DEMO_NEWS.map(n => normalizeNewsItem(n));
      renderNews(localNewsStore);
      return;
    }

    localNewsStore = news.map(item => normalizeNewsItem(item));
    renderNews(localNewsStore);
  } catch (err) {
    console.error('Erro ao carregar notícias:', err);
    localNewsStore = DEFAULT_DEMO_NEWS.map(n => normalizeNewsItem(n));
    renderNews(localNewsStore);
  }
}

/**
 * Faz o upload do ficheiro de imagem para o bucket "policloud" do Supabase Storage
 * @param {File} file 
 * @returns {Promise<string | null>} URL pública da imagem
 */
async function uploadCoverImage(file) {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `news_cover_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `noticias/${fileName}`;

  setUploadProgress(25, 'A ligar ao servidor de ficheiros PoliCloud...');

  const { data, error } = await sb.storage
    .from('policloud')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error('Falha ao carregar imagem para o storage: ' + (error.message || 'Erro no servidor'));
  }

  setUploadProgress(70, 'A gerar hiperligação pública da foto...');

  const { data: publicUrlData } = sb.storage
    .from('policloud')
    .getPublicUrl(filePath);

  return publicUrlData?.publicUrl || null;
}

/**
 * Processo de submissão do formulário de criação de notícia (Apenas Admin)
 */
/**
 * Abre a modal para criar uma nova notícia
 */
function openCreateNews() {
  const editingInput = document.getElementById('news-editing-id');
  if (editingInput) editingInput.value = '';

  const modalTitle = document.getElementById('modal-create-title');
  if (modalTitle) modalTitle.textContent = 'Publicar Nova Notícia Oficial';

  const modalSub = document.querySelector('.admin-modal-sub');
  if (modalSub) modalSub.textContent = 'Gabinete de Comunicação e Direcção do IPPLN';

  if (createNewsForm) createNewsForm.reset();
  clearSelectedFile();
  hideFormAlert();
  hideUploadProgress();

  if (btnSubmitNews) {
    btnSubmitNews.disabled = false;
    btnSubmitNews.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Publicar Notícia</span>
    `;
  }

  openM('create-news-modal');
}

/**
 * Abre a modal para editar uma notícia existente
 */
function openEditNews(newsId) {
  const item = localNewsStore.find(n => String(n.id) === String(newsId));
  if (!item || !canManageNews(item)) {
    toast('Não tem permissão para editar esta notícia.', 'error');
    return;
  }

  hideFormAlert();
  hideUploadProgress();
  if (createNewsForm) createNewsForm.reset();
  clearSelectedFile();

  const editingInput = document.getElementById('news-editing-id');
  if (editingInput) editingInput.value = item.id;

  const modalTitle = document.getElementById('modal-create-title');
  if (modalTitle) modalTitle.textContent = 'Editar Notícia';

  const modalSub = document.querySelector('.admin-modal-sub');
  if (modalSub) modalSub.textContent = 'Atualize as informações e detalhes da publicação';

  if (newsTitleInput) newsTitleInput.value = item.title || '';
  if (newsSubtitleInput) newsSubtitleInput.value = item.subtitle || item.subtitulo || '';
  if (newsContentInput) newsContentInput.value = item.content || item.corpo || '';

  const newsCategorySelect = document.getElementById('news-category-select');
  if (newsCategorySelect) newsCategorySelect.value = item.category || 'direccao';

  if (newsPinnedCheckbox) newsPinnedCheckbox.checked = item.pinned === true || item.is_pinned === true || item.fixado === true;

  if (btnSubmitNews) {
    btnSubmitNews.disabled = false;
    btnSubmitNews.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      <span>Guardar Alterações</span>
    `;
  }

  openM('create-news-modal');
}

/**
 * Elimina uma notícia
 */
async function deleteNews(newsId) {
  const item = localNewsStore.find(n => String(n.id) === String(newsId));
  if (!item || !canManageNews(item)) {
    toast('Não tem permissão para eliminar esta notícia.', 'error');
    return;
  }

  const confirmed = await confirmModal({
    title: 'Eliminar Notícia Institucional',
    message: `Tem a certeza de que pretende eliminar a notícia "${item.title || ''}"? Esta ação é definitiva.`,
    confirmText: 'Sim, Eliminar',
    cancelText: 'Cancelar',
    danger: true
  });
  if (!confirmed) {
    return;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(newsId));
    if (isUuid) {
      const { error } = await sb.from('news').delete().eq('id', newsId);
      if (error) {
        throw new Error(error.message || 'Erro ao eliminar notícia.');
      }
    }

    localNewsStore = localNewsStore.filter(n => String(n.id) !== String(newsId));
    if (isUuid) {
      await log('eliminar_noticia', 'news', newsId, currentProfile?.nome || '');
    }
    toast('Notícia eliminada com sucesso!', 'success');
    renderNews(localNewsStore);
  } catch (err) {
    console.error('Erro ao eliminar notícia:', err);
    toast(err.message || 'Falha ao eliminar notícia.', 'error');
  }
}

/**
 * Processo de submissão do formulário de criação/edição de notícia
 */
async function handleCreateNewsSubmit(e) {
  e.preventDefault();
  hideFormAlert();

  // Validação estrita de perfil: apenas admin ou professor
  if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'professor')) {
    showFormAlert('Operação não autorizada. Apenas administradores e professores têm permissão.');
    return;
  }

  const editingId = document.getElementById('news-editing-id')?.value;
  if (editingId) {
    const existing = localNewsStore.find(n => String(n.id) === String(editingId));
    if (!existing || !canManageNews(existing)) {
      showFormAlert('Acesso Negado: Não tem autorização para editar esta notícia.');
      return;
    }
  }

  const title = newsTitleInput ? newsTitleInput.value.trim() : '';
  const subtitle = newsSubtitleInput ? newsSubtitleInput.value.trim() : '';
  const content = newsContentInput ? newsContentInput.value.trim() : '';
  const isPinned = newsPinnedCheckbox ? newsPinnedCheckbox.checked : false;

  if (!title) {
    showFormAlert('Por favor, indique o título da notícia.');
    if (newsTitleInput) newsTitleInput.focus();
    return;
  }

  if (!content) {
    showFormAlert('Por favor, escreva o corpo da notícia.');
    if (newsContentInput) newsContentInput.focus();
    return;
  }

  // Início do processo
  if (btnSubmitNews) {
    btnSubmitNews.disabled = true;
    btnSubmitNews.innerHTML = `
      <div class="spinner spinner-light" style="width: 16px; height: 16px; border-width: 2px;"></div>
      <span>${editingId ? 'A guardar alterações...' : 'A publicar...'}</span>
    `;
  }

  try {
    let coverUrl = null;

    // 1. Upload de Imagem de Capa se selecionada
    if (selectedCoverFile) {
      setUploadProgress(15, 'A carregar imagem de capa (0% / 15MB)...');
      coverUrl = await uploadCoverImage(selectedCoverFile);
    }

    const newsCategorySelect = document.getElementById('news-category-select');
    const category = newsCategorySelect ? newsCategorySelect.value : 'direccao';

    const isUuidEditing = editingId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(editingId));

    if (editingId) {
      // ATUALIZAÇÃO
      setUploadProgress(70, 'A atualizar comunicado na base de dados oficial...');

      const updatePayload = {
        title: title,
        subtitle: subtitle || null,
        content: content,
        body: category,
        pinned: isPinned,
        is_pinned: isPinned,
        updated_at: new Date().toISOString()
      };
      if (coverUrl) {
        updatePayload.cover_image_url = coverUrl;
        updatePayload.cover_url = coverUrl;
      }

      if (isUuidEditing) {
        let updateRes = await sb
          .from('news')
          .update(updatePayload)
          .eq('id', editingId)
          .select('*, profiles:author_id(id, nome, full_name, role)')
          .single();

        if (updateRes.error) {
          updateRes = await sb
            .from('news')
            .update(updatePayload)
            .eq('id', editingId)
            .select('*')
            .single();

          if (updateRes.error) {
            throw new Error('Não foi possível atualizar a notícia: ' + (updateRes.error.message || 'Erro na base de dados'));
          }
        }
      }

      const idx = localNewsStore.findIndex(n => String(n.id) === String(editingId));
      if (idx !== -1) {
        localNewsStore[idx] = normalizeNewsItem({
          ...localNewsStore[idx],
          ...updatePayload,
          category: category,
          content: content,
          cover_image_url: coverUrl || localNewsStore[idx].cover_image_url
        });
      }

      if (isUuidEditing) {
        await log('editar_noticia', 'news', editingId, currentProfile?.nome || '');
      }
      toast('Notícia atualizada com sucesso!', 'success');
      setUploadProgress(100, 'Notícia atualizada com sucesso!');
    } else {
      // INSERÇÃO NOVA
      setUploadProgress(85, 'A registar comunicado na base de dados oficial...');

      const isAuthorUuid = currentProfile && currentProfile.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(currentProfile.id));

      const newRecord = {
        title: title,
        subtitle: subtitle || null,
        content: content,
        body: category,
        cover_image_url: coverUrl || null,
        cover_url: coverUrl || null,
        pinned: isPinned,
        is_pinned: isPinned,
        author_id: isAuthorUuid ? currentProfile.id : null,
        created_at: new Date().toISOString()
      };

      let insertedData = null;
      let insertRes = await sb
        .from('news')
        .insert([newRecord])
        .select('*, profiles:author_id(id, nome, full_name, role)')
        .single();

      if (insertRes.error) {
        console.warn('Insert com profiles falhou, tentando insert simples:', insertRes.error.message);
        insertRes = await sb
          .from('news')
          .insert([newRecord])
          .select('*')
          .single();

        if (insertRes.error) {
          throw new Error('Não foi possível guardar a notícia na base de dados: ' + (insertRes.error.message || 'Verifique as permissões'));
        }
      }

      insertedData = insertRes.data;

      if (insertedData) {
        const normalized = normalizeNewsItem({
          ...insertedData,
          category: category,
          author_name: currentProfile?.nome || currentProfile?.full_name || 'Direcção'
        });
        localNewsStore.unshift(normalized);
        await log('publicar_noticia', 'news', insertedData.id, currentProfile?.nome || '');
        toast('Notícia publicada com sucesso!', 'success');
      }

      setUploadProgress(100, 'Notícia publicada com sucesso!');
    }

    // Limpar formulário e fechar modal
    setTimeout(() => {
      if (createNewsForm) createNewsForm.reset();
      const editingInput = document.getElementById('news-editing-id');
      if (editingInput) editingInput.value = '';
      clearSelectedFile();
      hideUploadProgress();
      closeM('create-news-modal');
      if (btnSubmitNews) {
        btnSubmitNews.disabled = false;
        btnSubmitNews.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Publicar Notícia</span>
        `;
      }
      renderNews(localNewsStore);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);

  } catch (err) {
    console.error('Erro ao guardar notícia:', err);
    hideUploadProgress();
    showFormAlert(err.message || 'Ocorreu um erro ao processar a notícia. Tente novamente.');
    if (btnSubmitNews) {
      btnSubmitNews.disabled = false;
      btnSubmitNews.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>${editingId ? 'Guardar Alterações' : 'Publicar Notícia'}</span>
      `;
    }
  }
}

/**
 * Configurações da Modal de Criação de Notícia
 */
function setupAdminModal() {
  if (!btnOpenCreateNews || !createNewsModal) return;

  btnOpenCreateNews.addEventListener('click', openCreateNews);

  if (btnCloseCreateNews) {
    btnCloseCreateNews.addEventListener('click', () => {
      closeM('create-news-modal');
    });
  }

  if (btnCancelCreateNews) {
    btnCancelCreateNews.addEventListener('click', () => {
      closeM('create-news-modal');
    });
  }

  if (createNewsForm) {
    createNewsForm.addEventListener('submit', handleCreateNewsSubmit);
  }

  setupUploadDropzone();
}

/**
 * Configura o link do dashboard na sidebar de acordo com o perfil
 */
function setupSidebarByRole(role, nome) {
  if (navDashboardLink) {
    if (role === 'admin') {
      navDashboardLink.href = '/admin.html';
    } else if (role === 'professor') {
      navDashboardLink.href = '/dashboard-professor.html';
    } else {
      navDashboardLink.href = '/dashboard-aluno.html';
    }
  }

  if (sidebarUserName) {
    sidebarUserName.textContent = nome || 'Utilizador';
  }

  if (sidebarUserRole) {
    if (role === 'admin') sidebarUserRole.textContent = 'Perfil: Administrador';
    else if (role === 'professor') sidebarUserRole.textContent = 'Perfil: Docente';
    else sidebarUserRole.textContent = 'Perfil: Aluno';
  }

  if (sidebarUserAvatar) {
    const initial = (nome || 'U').trim()[0].toUpperCase();
    sidebarUserAvatar.textContent = initial;
  }
}

/**
 * Alternador rápido de demonstração (para testar os três perfis em desenvolvimento)
 */
function setupDemoRoleSwitcher(activeRole) {
  if (!demoRoleSwitcher) return;
  if (!isConfigPlaceholder()) {
    demoRoleSwitcher.style.display = 'none';
    return;
  }

  demoRoleSwitcher.style.display = 'flex';
  demoRoleSwitcher.innerHTML = `
    <span>Teste de Perfil:</span>
    <div class="demo-role-buttons">
      <button type="button" class="demo-role-btn ${activeRole === 'admin' ? 'active' : ''}" data-role="admin">Admin</button>
      <button type="button" class="demo-role-btn ${activeRole === 'professor' ? 'active' : ''}" data-role="professor">Professor</button>
      <button type="button" class="demo-role-btn ${activeRole === 'aluno' ? 'active' : ''}" data-role="aluno">Aluno</button>
    </div>
  `;

  demoRoleSwitcher.querySelectorAll('.demo-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      localStorage.setItem('policloud_demo_role', targetRole);
      window.location.reload();
    });
  });
}

/**
 * Inicialização da Página de Notícias
 */
async function initNewsPage() {
  initSidebar();
  mouseTrack();

  // ACESSO: todos os perfis autenticados (aluno, professor, admin)
  const profile = await requireAuth(['aluno', 'professor', 'admin']);
  if (!profile) return;

  currentProfile = profile;

  // Ajusta a navegação e o perfil do utilizador
  setupSidebarByRole(profile.role, profile.nome);

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
    });
  }

  // Switcher de teste em modo de demonstração
  setupDemoRoleSwitcher(profile.role);

  // Modal de Leitura
  if (btnCloseReader) {
    btnCloseReader.addEventListener('click', closeNewsReader);
  }
  if (newsReaderModal) {
    newsReaderModal.addEventListener('click', (e) => {
      if (e.target === newsReaderModal) closeNewsReader();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNewsReader();
      closeM('create-news-modal');
    }
  });

  // VISIBILIDADE DO FORMULÁRIO DE PUBLICAÇÃO: ADMIN OU PROFESSOR
  if (profile.role === 'admin' || profile.role === 'professor') {
    if (adminPublishSection) adminPublishSection.style.display = 'block';
    setupAdminModal();
  } else {
    // Alunos: não vêem o botão de publicar nem o formulário
    if (adminPublishSection) adminPublishSection.style.display = 'none';
    if (createNewsModal) createNewsModal.remove(); // Remove completamente do DOM por segurança
  }

  // Configura filtros de categoria de notícias
  setupNewsCategoryFilters();

  // Carrega as notícias
  await loadNews();

  // Remove overlay de sessão
  if (sessionOverlay) {
    sessionOverlay.classList.add('hidden');
  }
}

initNewsPage();
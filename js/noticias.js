// PoliCloud - Intranet Escolar IPPLN
// Lógica da Página de Notícias (noticias.html)

import { sb, getProfile, requireAuth, signOut, log, toast, initials, fDate, openM, closeM, initSidebar, mouseTrack, ftIcon, CURSOS, CLASSES, TURMAS } from './sb.js';
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
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-2',
    title: 'Modernização das Oficinas e Laboratórios de Informática e Electricidade',
    subtitle: 'Novos equipamentos de rede e componentes práticos instalados no bloco técnico.',
    content: `No âmbito do plano de melhoria contínua das infraestruturas de ensino técnico do IPPLN, foram concluídos os trabalhos de instalação de novos computadores, bastidores de telecomunicações e postos de ensaio electrotécnicos.\n\nOs novos recursos estarão disponíveis a partir de quarta-feira para as turmas dos cursos de Informática, Electricidade e Mecânica, possibilitando um contacto ainda mais aprofundado com as tecnologias do mercado de trabalho angolano.`,
    cover_image_url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-3',
    title: 'Inscrições Abertas para a Feira Provincial de Ciência e Robótica',
    subtitle: 'Estudantes com projectos de fim de curso podem candidatar-se na coordenação.',
    content: `Encontram-se abertas as inscrições para a edição anual da Feira Provincial de Inovação e Ciência Tecnológica do Namibe. Todos os alunos do IPPLN com projectos de automação, desenvolvimento de software, energias renováveis ou mecânica aplicada são convidados a submeter as suas propostas na sala de coordenação pedagógica até ao dia 30 do corrente mês.`,
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-4',
    title: 'Palestras sobre Segurança no Trabalho e Higiene Ocupacional',
    subtitle: 'Ciclo de formação obrigatório para alunos das oficinas industriais.',
    content: `Recordamos a todos os formandos das oficinas mecânicas e químicas que a participação nas sessões de segurança industrial é obrigatória antes do início das práticas laboratoriais intensivas deste semestre. Trazer equipamento de protecção individual regularizado.`,
    cover_image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    pinned: false,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  }
];

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

  if (readerDate) readerDate.textContent = formatDate(newsItem.created_at);
  if (readerTitle) readerTitle.textContent = newsItem.title || 'Comunicado';
  if (readerSubtitle) {
    const sub = newsItem.subtitle || newsItem.subtitulo || '';
    readerSubtitle.textContent = sub;
    readerSubtitle.style.display = sub ? 'block' : 'none';
  }
  if (readerContent) readerContent.textContent = newsItem.content || newsItem.corpo || '';

  newsReaderModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeNewsReader() {
  if (!newsReaderModal) return;
  newsReaderModal.classList.add('hidden');
  document.body.style.overflow = '';
}

/**
 * Renderiza as notícias na página divididas entre fixadas e gerais
 */
function renderNews(newsList) {
  if (!pinnedSection || !pinnedNewsContainer || !regularNewsContainer) return;

  if (totalNewsCount) {
    totalNewsCount.textContent = `${newsList.length} notícia${newsList.length === 1 ? '' : 's'}`;
  }

  // Separação de notícias fixadas e regulares
  const pinnedNews = [];
  const regularNews = [];

  newsList.forEach(item => {
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
            <div class="news-card-footer">
              <span class="news-date-text">Gabinete de Comunicação • IPPLN</span>
              <button type="button" class="btn-read-news btn-read-item" data-id="${escapeHtml(item.id)}">
                <span>Ver tudo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
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
            <div class="news-card-footer" style="padding-top: 14px;">
              <span class="news-date-text">IPPLN</span>
              <button type="button" class="btn-read-news btn-read-item" data-id="${escapeHtml(item.id)}">
                <span>Ver mais</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
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
        <span>Não existem notícias publicadas de momento.</span>
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
}

/**
 * Carrega a lista de notícias do Supabase
 */
async function loadNews() {
  try {
    const { data: news, error } = await sb
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      localNewsStore = [...DEFAULT_DEMO_NEWS];
      renderNews(localNewsStore);
      return;
    }

    if (!news || news.length === 0) {
      localNewsStore = [...DEFAULT_DEMO_NEWS];
      renderNews(localNewsStore);
      return;
    }

    localNewsStore = news;
    renderNews(localNewsStore);
  } catch (err) {
    localNewsStore = [...DEFAULT_DEMO_NEWS];
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
async function handleCreateNewsSubmit(e) {
  e.preventDefault();
  hideFormAlert();

  // Validação estrita de perfil: apenas admin pode publicar
  if (!currentProfile || currentProfile.role !== 'admin') {
    showFormAlert('Operação não autorizada. Apenas administradores do IPPLN têm permissão para publicar notícias oficiais.');
    return;
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
      <span>A publicar...</span>
    `;
  }

  try {
    let coverUrl = null;

    // 1. Upload de Imagem de Capa se existir
    if (selectedCoverFile) {
      setUploadProgress(15, 'A carregar imagem de capa (0% / 15MB)...');
      coverUrl = await uploadCoverImage(selectedCoverFile);
    }

    // 2. Gravação na Tabela "news"
    setUploadProgress(85, 'A registar comunicado na base de dados oficial...');

    const newRecord = {
      title: title,
      subtitle: subtitle || null,
      content: content,
      cover_image_url: coverUrl || null,
      pinned: isPinned,
      created_at: new Date().toISOString()
    };

    // Inserção real no Supabase com validação protegida pela RLS da base de dados
    const { data, error } = await sb
      .from('news')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      throw new Error('Não foi possível guardar a notícia na base de dados: ' + (error.message || 'Verifique as permissões'));
    }

    if (data) {
      localNewsStore.unshift(data);
      await log('publicar_noticia', 'news', data.id, currentProfile?.nome || '');
      toast('Notícia publicada com sucesso!', 'success');
    }

    setUploadProgress(100, 'Notícia publicada com sucesso!');

    // Limpar formulário e fechar modal
    setTimeout(() => {
      if (createNewsForm) createNewsForm.reset();
      clearSelectedFile();
      hideUploadProgress();
      if (createNewsModal) createNewsModal.classList.add('hidden');
      document.body.style.overflow = '';
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
    console.error('Erro ao publicar notícia:', err);
    hideUploadProgress();
    showFormAlert(err.message || 'Ocorreu um erro ao publicar a notícia. Tente novamente.');
    if (btnSubmitNews) {
      btnSubmitNews.disabled = false;
      btnSubmitNews.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Publicar Notícia</span>
      `;
    }
  }
}

/**
 * Configurações da Modal de Criação de Notícia (Só Admin)
 */
function setupAdminModal() {
  if (!btnOpenCreateNews || !createNewsModal) return;

  btnOpenCreateNews.addEventListener('click', () => {
    hideFormAlert();
    hideUploadProgress();
    createNewsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (newsTitleInput) newsTitleInput.focus();
  });

  if (btnCloseCreateNews) {
    btnCloseCreateNews.addEventListener('click', () => {
      createNewsModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }

  if (btnCancelCreateNews) {
    btnCancelCreateNews.addEventListener('click', () => {
      createNewsModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }

  // Fechar ao clicar no fundo escuro
  createNewsModal.addEventListener('click', (e) => {
    if (e.target === createNewsModal) {
      createNewsModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

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
      if (createNewsModal) createNewsModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  // VISIBILIDADE DO FORMULÁRIO DE PUBLICAÇÃO: SÓ PARA ROLE === 'admin'
  if (profile.role === 'admin') {
    if (adminPublishSection) adminPublishSection.style.display = 'block';
    setupAdminModal();
  } else {
    // Alunos e professores: não vêem o botão de publicar nem o formulário
    if (adminPublishSection) adminPublishSection.style.display = 'none';
    if (createNewsModal) createNewsModal.remove(); // Remove completamente do DOM por segurança
  }

  // Carrega as notícias
  await loadNews();

  // Remove overlay de sessão
  if (sessionOverlay) {
    sessionOverlay.classList.add('hidden');
  }
}

initNewsPage();
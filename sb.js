import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const URL  = 'https://qdvodepwatjnoczgfjgv.supabase.co';
const ANON = 'sb_publishable_Fh8LqzjabeF9D77J1cyNrA_qDrX0ySg';

export const sb = createClient(URL, ANON);

export const CURSOS  = ['Informática','Electrónica','Desenhador Projetista','Frio e Climatização','Mecânica','Perfuração e Petróleo','Energias Renováveis'];
export const CLASSES = ['10ª','11ª','12ª','13ª'];
export const TURMAS  = ['A','B'];

export async function getProfile() {
  try {
    const { data } = await sb.auth.getUser();
    const user = data ? data.user : null;
    if (!user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profile) {
      // Alias: o código usa .nome mas a BD tem full_name
      profile.nome = profile.full_name || profile.nome || '';
      // Alias: converte roles BD (teacher/student) para PT (professor/aluno)
      profile.rolePT = profile.role === 'teacher' ? 'professor'
                     : profile.role === 'student'  ? 'aluno'
                     : profile.role || '';
    }
    return profile;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(roles = null) {
  const p = await getProfile();
  if (!p || !p.is_active) { await sb.auth.signOut(); location.href = 'login.html'; return null; }
  if (roles) {
    const userRole = (p.role || '').toLowerCase();
    const hasRole = roles.some(r => {
      const target = r.toLowerCase();
      if (userRole === target) return true;
      if (userRole === 'teacher' && target === 'professor') return true;
      if (userRole === 'professor' && target === 'teacher') return true;
      if (userRole === 'student' && target === 'aluno') return true;
      if (userRole === 'aluno' && target === 'student') return true;
      return false;
    });
    if (!hasRole) { location.href = 'login.html'; return null; }
  }
  return p;
}

export async function signOut() { await sb.auth.signOut(); location.href = 'login.html'; }

export async function log(action, entity = null, eid = null, uname = '') {
  const { data:{ user } } = await sb.auth.getUser();
  if (!user) return;
  sb.from('activity_log').insert({ user_id: user.id, user_name: uname, action, entity_type: entity, entity_id: eid || null });
}

export function toast(msg, type = 'success') {
  let c = document.getElementById('toastBox');
  if (!c) { c = document.createElement('div'); c.id = 'toastBox'; c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span><span class="toast-x" onclick="this.parentElement.remove()">×</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation = 'slideOutR .25s ease forwards'; setTimeout(() => t.remove(), 260); }, 4000);
}

export function initials(n = '') { return (n||'U').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
export function fDate(s) { if (!s) return ''; return new Date(s).toLocaleDateString('pt-AO',{day:'2-digit',month:'short',year:'numeric'}); }
export function openM(id)  { document.getElementById(id)?.classList.add('open'); }
export function closeM(id) { document.getElementById(id)?.classList.remove('open'); }

export function initSidebar() {
  const sb_ = document.querySelector('.sidebar-dark,.sidebar-light');
  const ov  = document.getElementById('sidebarOverlay');
  const hb  = document.getElementById('hb');
  if (!sb_ || !ov || !hb) return;
  hb.addEventListener('click', () => { sb_.classList.add('open'); ov.classList.add('open'); });
  ov.addEventListener('click', () => { sb_.classList.remove('open'); ov.classList.remove('open'); });
}

export function mouseTrack() {
  const page = document.querySelector('.dark-page');
  if (!page) return;
  document.addEventListener('mousemove', e => {
    page.style.setProperty('--mx', e.clientX + 'px');
    page.style.setProperty('--my', e.clientY + 'px');
  });
}

export function ftIcon(name) {
  const e = (name||'').split('.').pop().toLowerCase();
  const m = { pdf:['PDF','rgba(239,68,68,.15)','#F87171'], docx:['DOC','rgba(37,99,235,.15)','#60A5FA'], doc:['DOC','rgba(37,99,235,.15)','#60A5FA'], png:['IMG','rgba(168,85,247,.15)','#C084FC'], jpg:['IMG','rgba(168,85,247,.15)','#C084FC'], jpeg:['IMG','rgba(168,85,247,.15)','#C084FC'] };
  return m[e] || [e.toUpperCase()||'FILE','rgba(99,102,241,.15)','#A78BFA'];
}

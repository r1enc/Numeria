import { worlds, getStageQuestions } from './content.js';
import { firebaseReady, signInStudent, createStudent, signOutStudent, watchStudent, getStudentProgress, saveStudentProgress } from './firebase.js';
import './style.css';
import './map.css';
import './diorama.css';
import './navigation.css';
const GUEST_KEY = 'numeria-progress-v1';
let storageKey = GUEST_KEY, student = null, loginMode = 'login', authFlow = false;
function readProgress(key) { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; } }
const saved = readProgress(storageKey);
const progress = { done: saved.done || {}, stars: saved.stars || 0, current: null, question: 0, score: 0, correct: 0, answered: false, questions: [] };
const app = document.querySelector('#app');
let selectedWorld = null, guestSession = false;
const mapPoints = [[90,300],[230,170],[370,250],[510,120],[650,220],[790,100],[930,205],[1070,90],[1210,185],[1350,75]];
function save() { const data = { done: progress.done, stars: progress.stars }; try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch {} if (student && firebaseReady) saveStudentProgress(student.uid, data).catch(() => {}); }
function loadProgress(key, remote = {}) { storageKey = key; const local = readProgress(key); progress.done = { ...(remote.done || {}), ...(local.done || {}) }; progress.stars = Math.max(remote.stars || 0, local.stars || 0); save(); }
function unlocked(w, s) { return w === 0 && s === 0 || Boolean(progress.done[`${w}-${s-1}`]) || w > 0 && s === 0 && Boolean(progress.done[`${w-1}-9`]); }
function totalDone() { return Object.keys(progress.done).length; }
function renderHome() {
  progress.current = null;
  if (!location.hash) history.replaceState(null, '', '#/peta');
  const route = location.hash.match(/^#\/dunia\/(\d+)$/);
  if (route && worlds[Number(route[1]) - 1]) { const wi = Number(route[1]) - 1; if (wi > 0 && !progress.done[`${wi-1}-9`]) { renderGalaxy(); showMapNotice(`Selesaikan ${worlds[wi-1].name} untuk membuka planet ini.`); return; } if (!student && !guestSession) { selectedWorld = wi; renderLogin(); return; } return renderWorld(wi); }
  renderGalaxy();
}
function renderAccount() { return `<header class="topbar"><a class="brand" href="#/peta"><span class="brand-mark">N</span><span>numeria</span></a><div class="top-stats"><span class="stat"><span class="star">★</span> ${progress.stars}</span>${student ? `<button class="account-chip" id="account" aria-label="Keluar dari akun">${student.displayName || student.username} · Keluar</button>` : ''}</div></header>`; }
function bindAccount() { document.querySelector('#account')?.addEventListener('click', async () => { await signOutStudent(); student = null; guestSession = false; loadProgress(GUEST_KEY); navigate('#/peta'); }); }
function renderGalaxy() {
  app.innerHTML = `<main class="shell map-shell galaxy-level">${renderAccount()}<section class="map-intro galaxy-intro"><div><p class="eyebrow">NUMERIA · PETA GALAKSI</p><h1>Setiap angka <em>punya cerita.</em></h1><p>${totalDone()} stage selesai <span>·</span> geser peta lalu pilih dunia</p></div><div class="map-progress-badge"><strong>${totalDone()}<small>/${worlds.length*10}</small></strong><span>stage selesai</span></div></section><div class="galaxy-viewport" id="galaxy-viewport" tabindex="0" aria-label="Peta galaksi yang bisa digeser"><div class="galaxy-canvas"><svg class="galaxy-routes" viewBox="0 0 1120 460" aria-hidden="true"><path d="M140 230 C230 210 265 130 360 130 S485 190 570 280 S700 220 790 135 S910 170 1000 255"/><path class="route-dots" d="M140 230 C230 210 265 130 360 130 S485 190 570 280 S700 220 790 135 S910 170 1000 255"/><circle cx="255" cy="178" r="7"/><circle cx="475" cy="182" r="6"/><circle cx="690" cy="226" r="7"/><circle cx="895" cy="190" r="6"/></svg>${worlds.map((world, wi) => { const places = [[140,230],[360,130],[570,280],[790,135],[1000,255]], [x,y] = places[wi], locked = wi > 0 && !progress.done[`${wi-1}-9`], done = world.stages.filter((_, si) => progress.done[`${wi}-${si}`]).length; return `<button class="galaxy-planet ${world.color} ${locked ? 'locked' : ''}" style="--planet-x:${x}px;--planet-y:${y}px;--planet-delay:${wi*90}ms" data-planet="${wi}" aria-label="${world.name}, ${locked ? 'terkunci' : `${done} dari 10 stage selesai`}"><span class="planet-art">${planetDiorama(wi)}</span>${locked ? '<span class="planet-lock" aria-hidden="true">⌑</span>' : ''}<span class="planet-label"><small>DUNIA ${String(wi+1).padStart(2,'0')}</small><strong>${world.name}</strong><em>${locked ? 'Selesaikan dunia sebelumnya' : `${done}/10 stage`}</em></span></button>`; }).join('')}</div></div><div class="map-notice" id="map-notice" role="status" aria-live="polite"></div><footer><span>NUMERIA</span><span>Satu langkah, satu ide baru ✦</span></footer></main>`;
  bindAccount();
  document.querySelectorAll('[data-planet]').forEach(button => button.addEventListener('click', () => { if (!galaxyMoved) enterPlanet(Number(button.dataset.planet), button); }));
  bindGalaxyDrag();
}
function renderWorld(wi) {
  const world = worlds[wi], completedInWorld = world.stages.filter((_, si) => progress.done[`${wi}-${si}`]).length;
  app.innerHTML = `<main class="shell map-shell world-level">${renderAccount()}<div class="world-toolbar"><button class="back-button" id="back-galaxy" aria-label="Kembali ke peta galaksi">←</button><span>PETA GALAKSI <i>·</i> DUNIA ${String(wi+1).padStart(2,'0')}</span></div><section class="map-heading world-intro"><div><span class="world-kicker">${world.icon} DUNIA ${String(wi+1).padStart(2,'0')}</span><h1>${world.name}</h1><p>${world.subtitle}</p></div><span class="map-progress-label">${completedInWorld} / 10 <small>selesai</small></span></section><div class="world-map-scroll" id="world-map-scroll" tabindex="0" aria-label="Sepuluh stage di jalur dunia, geser ke samping"><div class="world-track">${worldCard(world, wi)}</div></div><div class="map-notice" id="map-notice" role="status" aria-live="polite"></div><footer><span>NUMERIA</span><span>Satu langkah, satu ide baru ✦</span></footer></main>`;
  bindAccount();
  document.querySelector('#back-galaxy').addEventListener('click', () => navigate('#/peta'));
  document.querySelectorAll('[data-stage-node]').forEach(button => button.addEventListener('click', () => { const w = +button.dataset.world, s = +button.dataset.stage, name = worlds[w].stages[s]; if (unlocked(w,s)) startStage(w,s); else showMapNotice(`Selesaikan Stage ${s} lebih dulu untuk membuka ${name}.`); }));
}
function navigate(hash) { if (location.hash === hash) renderHome(); else location.hash = hash; }
function enterPlanet(wi, button) { const locked = wi > 0 && !progress.done[`${wi-1}-9`]; if (locked) { showMapNotice(`Selesaikan ${worlds[wi-1].name} untuk membuka planet ini.`); return; } if (!student && !guestSession) { selectedWorld = wi; renderLogin(); return; } button?.classList.add('entering'); setTimeout(() => navigate(`#/dunia/${wi+1}`), 260); }
let galaxyPointer = null, galaxyMoved = false;
function bindGalaxyDrag() {
  const viewport = document.querySelector('#galaxy-viewport');
  viewport.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button')) return; galaxyPointer = { x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop }; galaxyMoved = false; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener('pointermove', event => { if (!galaxyPointer) return; const dx=event.clientX-galaxyPointer.x, dy=event.clientY-galaxyPointer.y; if (!galaxyMoved && Math.hypot(dx,dy)<8) return; galaxyMoved=true; viewport.scrollLeft=galaxyPointer.left-dx; viewport.scrollTop=galaxyPointer.top-dy; });
  viewport.addEventListener('pointerup', () => { if (galaxyMoved) { viewport.classList.add('dragged'); setTimeout(() => { viewport.classList.remove('dragged'); galaxyMoved=false; }, 80); } galaxyPointer=null; });
  viewport.addEventListener('pointercancel', () => { galaxyPointer=null; });
}
let mapNoticeTimer;
function showMapNotice(message) { const notice = document.querySelector('#map-notice'); if (!notice) return; notice.textContent = message; notice.classList.add('visible'); clearTimeout(mapNoticeTimer); mapNoticeTimer = setTimeout(() => notice.classList.remove('visible'), 2600); }
function renderLogin(message = '') {
  loginMode = 'login';
  let remembered = '';
  try { remembered = localStorage.getItem('numeria-remember-username') || ''; } catch {}
  app.innerHTML = `<main class="login-shell"><a class="brand" href="#/peta"><span class="brand-mark">N</span><span>numeria</span></a><section class="login-card"><a class="login-back" id="login-back" href="#/peta">← Kembali ke peta galaksi</a><p class="eyebrow">AKUN PENJELAJAH</p><h1 id="login-title">Masuk ke Numeria</h1><p class="login-copy">${selectedWorld === null ? 'Simpan petualanganmu dan lanjutkan di perangkat lain.' : `Masuk untuk membuka ${worlds[selectedWorld].name} dan menyimpan progresmu.`}</p><form id="account-form"><label>Nama pengguna<input name="username" required minlength="3" maxlength="16" pattern="[A-Za-z0-9_]+" autocomplete="username" placeholder="contoh: bintang7" value="${remembered}" /></label><label id="display-name-row" class="hidden">Nama panggilan<input name="displayName" minlength="1" maxlength="12" placeholder="Pakai nama panggilan" /></label><label id="grade-row" class="hidden">Kelompok kelas<select name="gradeGroup"><option value="1-2">Kelas 1–2</option><option value="3-4">Kelas 3–4</option><option value="5-6">Kelas 5–6</option></select></label><label>PIN 6 angka<input name="pin" type="password" required inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="current-password" placeholder="••••••" /></label><label class="remember-row" style="display:flex;align-items:center;gap:8px;flex-direction:row;font-weight:600;cursor:pointer"><input type="checkbox" name="remember" ${remembered ? 'checked' : ''} style="width:18px;height:18px;margin:0" />Ingat saya di perangkat ini</label><p class="login-error" role="status">${message || (!firebaseReady ? 'Login cloud belum disambungkan. Kamu masih bisa bermain sebagai tamu di perangkat ini.' : '')}</p><button class="login-submit" type="submit">Masuk</button></form><button class="login-switch" id="switch-mode">Belum punya akun? Buat akun</button>${firebaseReady ? '' : '<button class="guest-button" id="guest">Lanjut sebagai tamu · progres hanya di perangkat ini</button>'}</section><p class="login-note">Jangan pakai nama lengkap atau PIN yang mudah ditebak. Centang "Ingat saya" agar tidak perlu memasukkan PIN lagi.</p></main>`;
  document.querySelector('#login-back').addEventListener('click', event => { event.preventDefault(); selectedWorld = null; if (location.hash === '#/peta') renderHome(); else navigate('#/peta'); });
  document.querySelector('#guest')?.addEventListener('click', () => { guestSession = true; const destination = selectedWorld; selectedWorld = null; navigate(destination === null ? '#/peta' : `#/dunia/${destination+1}`); });
  document.querySelector('#switch-mode').addEventListener('click', () => { loginMode = loginMode === 'login' ? 'create' : 'login'; updateLoginMode(); });
  document.querySelector('#account-form').addEventListener('submit', submitLogin);
}
function updateLoginMode() { const create = loginMode === 'create'; document.querySelector('#login-title').textContent = create ? 'Buat akun penjelajah' : 'Masuk ke Numeria'; document.querySelector('#display-name-row').classList.toggle('hidden', !create); document.querySelector('#grade-row').classList.toggle('hidden', !create); document.querySelector('.login-submit').textContent = create ? 'Buat akun' : 'Masuk'; document.querySelector('#switch-mode').textContent = create ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Buat akun'; }
async function submitLogin(event) {
  event.preventDefault(); const form = new FormData(event.currentTarget), username = String(form.get('username')).trim().toLowerCase(), pin = String(form.get('pin'));
  const output = document.querySelector('.login-error');
  if (!firebaseReady) { output.textContent = 'Login belum aktif: Firebase perlu disiapkan dulu. Mode tamu tetap bisa dipakai.'; return; }
  authFlow = true;
  try {
    const user = loginMode === 'create' ? await createStudent(username, pin, { displayName: String(form.get('displayName')).trim(), gradeGroup: String(form.get('gradeGroup')) }) : await signInStudent(username, pin);
    try { if (form.get('remember')) localStorage.setItem('numeria-remember-username', username); else localStorage.removeItem('numeria-remember-username'); } catch {}
    student = { uid: user.uid, username, displayName: String(form.get('displayName') || username).trim() };
    const remote = await getStudentProgress(user.uid); student.displayName = remote.displayName || student.displayName; loadProgress(`numeria-progress-${user.uid}`, remote.progress || {});
    if (loginMode === 'create') await saveStudentProgress(user.uid, { done: {}, stars: 0 });
    authFlow = false; guestSession = false; const destination = selectedWorld; selectedWorld = null; navigate(destination === null ? '#/peta' : `#/dunia/${destination+1}`);
  } catch (error) { authFlow = false; output.textContent = error.code === 'auth/email-already-in-use' ? 'Nama pengguna ini sudah dipakai.' : error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 'Nama pengguna atau PIN tidak cocok.' : 'Belum berhasil. Periksa koneksi atau coba lagi.'; }
}
function worldCard(world, wi) {
  const isOpen = wi === 0 || Boolean(progress.done[`${wi-1}-9`]);
  const route = 'M90 300 C145 295 165 190 230 170 S315 160 370 250 S455 300 510 120 S595 90 650 220 S725 310 790 100 S875 85 930 205 S1015 280 1070 90 S1150 75 1210 185 S1295 255 1350 75';
  return `<article class="world-card map-scene ${world.color} ${isOpen ? '' : 'locked-world'}"><svg class="route" viewBox="0 0 1480 460" preserveAspectRatio="none" aria-hidden="true"><path d="${route}"/><path class="route-highlight" d="${route}"/></svg><div class="world-scenery" aria-hidden="true">✦　·　✧　　·　✦　　✧　·　✦</div>${world.stages.map((name, si) => { const [x,y] = mapPoints[si], open = isOpen && unlocked(wi,si), finished = Boolean(progress.done[`${wi}-${si}`]), active = open && !finished; return `<button class="map-stage ${si % 2 ? 'right' : 'left'} ${finished ? 'finished' : ''} ${active ? 'active' : ''} ${open ? '' : 'locked'}" style="--x:${x}px;--y:${y}px" data-stage-node data-stage="${si}" data-world="${wi}" aria-label="Stage ${si+1}: ${name}, ${finished ? 'selesai' : open ? 'terbuka' : 'terkunci'}"><span class="map-stage-orb" aria-hidden="true">${stageDiorama(wi,si)}</span><span class="map-stage-number">${finished ? '✓' : open ? String(si+1).padStart(2,'0') : '🔒'}</span><span class="map-stage-copy"><small>STAGE ${wi+1}-${si+1}</small><strong>${name}</strong>${active ? '<em>Mulai di sini →</em>' : ''}<span class="stage-stars" aria-label="${finished ? 'Selesai' : 'Belum selesai'}">${finished ? '★' : '☆'}</span></span></button>`; }).join('')}</article>`;
}
function planetDiorama(world) {
  const palettes = [['#a7ef9b','#26865d','#d8ffd1'],['#ffc38f','#d46f52','#fff0b6'],['#d2b6ff','#6959b7','#f5e5ff'],['#8de4e2','#378bb0','#dcffff'],['#ffe58b','#cf9143','#fff8cf']][world], id = `planet-${world}`;
  const land = [
    '<path d="M16 39q11-14 23-7t20-3q8 8 24 3v31q-13-8-25 0t-27-3q-8-5-15 1z" fill="#72ca78"/><circle cx="30" cy="56" r="5" fill="#dfff9d"/><circle cx="67" cy="43" r="4" fill="#fff0a3"/>',
    '<path d="M15 42q15-10 25 1t19-4q13-10 25 2v30q-13-10-27-2t-24-1q-10-7-18 0z" fill="#dc805c"/><path d="M23 59h54" stroke="#ffd88e" stroke-width="5" stroke-dasharray="5 5"/>',
    '<path d="M16 40q10-12 22-5t22-2q10 8 24 2v32q-14-8-27 0t-26-3q-8-6-15 0z" fill="#8472ca"/><path d="M26 59l9-15 9 15zm29 5 8-13 8 13z" fill="#e5d4ff"/>',
    '<path d="M15 42q13-12 26 0t22-5q10-7 21 1v31q-14-9-28-1t-25-3q-8-5-16 1z" fill="#55b7c2"/><path d="M25 52q10-7 20 0t20 0t17 0" fill="none" stroke="#dbfff4" stroke-width="4"/>',
    '<path d="M16 42q12-11 24-2t22-5q10 8 22 2v31q-12-9-26-1t-25-3q-9-6-17 0z" fill="#dca950"/><path d="M28 60V43h11v17m10 0V35h12v25m9 0V46h10v14" fill="#fff0b5"/>'
  ][world];
  return `<svg viewBox="0 0 100 100" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palettes[0]}"/><stop offset="1" stop-color="${palettes[1]}"/></linearGradient><clipPath id="clip-${id}"><circle cx="50" cy="50" r="42"/></clipPath></defs><ellipse cx="50" cy="53" rx="48" ry="14" fill="none" stroke="${palettes[2]}" stroke-width="2" opacity=".66" transform="rotate(-24 50 53)"/><circle cx="50" cy="50" r="39" fill="url(#${id})"/><g clip-path="url(#clip-${id})">${land}<ellipse cx="30" cy="28" rx="22" ry="7" fill="#fff" opacity=".22" transform="rotate(-28 30 28)"/></g><circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><circle cx="22" cy="24" r="2" fill="#fff"/></svg>`;
}
function stageDiorama(world, stage) {
  const id = `d${world}-${stage}`, tint = [['#d8f0bd','#72b881'],['#ffe3a7','#e99561'],['#dfd7ff','#8975c5'],['#c8f0ec','#57a9af'],['#fff0b3','#dcad50']][world];
  const scenery = [
    `<path d="M0 65 Q24 48 50 62T100 57V100H0" fill="#83c77e"/><path d="M0 78Q32 64 57 79T100 72V100H0" fill="#4f9c69"/><path d="M23 54l8-12 8 12zm38 4 7-11 8 11z" fill="#fff6da"/><rect x="25" y="59" width="14" height="13" rx="2" fill="#f4bd58"/><rect x="60" y="64" width="13" height="11" rx="2" fill="#f18f69"/><text x="28" y="68" font-size="7" fill="white">${(stage+1)%10}</text><circle cx="17" cy="45" r="4" fill="#fff"/>`,
    `<path d="M0 65Q25 54 50 66T100 62V100H0" fill="#7ed5cf"/><path d="M0 80Q24 68 51 81T100 75V100H0" fill="#45a5ae"/><path d="M15 58h70v8H15z" fill="#bb754b"/><path d="M20 58l7-17h46l8 17" fill="#e8a66b"/><path d="M28 56q0-14 9 0m13 0q0-14 9 0m13 0q0-14 9 0" fill="none" stroke="#fff0cf" stroke-width="3"/><circle cx="18" cy="40" r="5" fill="#ffe28c"/>`,
    `<path d="M0 70Q20 60 40 73T100 65V100H0" fill="#b9dfa2"/><path d="M20 62l12-27 12 27zm31 1 13-32 13 32z" fill="#548a69"/><path d="M31 45v20m33-25v27" stroke="#805f4b" stroke-width="4"/><g fill="#ffd36f"><circle cx="20" cy="76" r="3"/><circle cx="29" cy="76" r="3"/><circle cx="38" cy="76" r="3"/><circle cx="20" cy="85" r="3"/><circle cx="29" cy="85" r="3"/><circle cx="38" cy="85" r="3"/></g><circle cx="81" cy="41" r="8" fill="#fff5bb"/>`,
    `<path d="M0 68Q28 54 53 68T100 63V100H0" fill="#76c6d1"/><path d="M0 81Q28 69 53 82T100 77V100H0" fill="#479fae"/><path d="M50 37a22 22 0 1 0 0 44z" fill="#ffca70"/><path d="M50 37a22 22 0 0 1 19 11L50 59z" fill="#eb8b68"/><path d="M50 59l19-11a22 22 0 0 1 3 19H50z" fill="#a789cf"/><path d="M50 59h22a22 22 0 0 1-22 22z" fill="#7dbe91"/><circle cx="17" cy="39" r="5" fill="#fff5bd"/>`,
    `<path d="M0 71Q20 59 45 73T100 64V100H0" fill="#dfcb86"/><path d="M23 67V43h15v24m9 0V31h18v36m12 0V48h14v19" fill="#d28361"/><path d="M27 48h7m-7 8h7m18-17h7m-7 9h7m-7 9h7m18-2h6" stroke="#fff4cf" stroke-width="3"/><path d="M51 29l8-10 8 10" fill="#f0bb65"/><circle cx="17" cy="38" r="5" fill="#fff4bd"/>`
  ][world];
  return `<svg viewBox="0 0 100 100" focusable="false"><defs><linearGradient id="${id}" x2="0" y2="1"><stop stop-color="${tint[0]}"/><stop offset="1" stop-color="${tint[1]}"/></linearGradient><clipPath id="c${id}"><circle cx="50" cy="50" r="47"/></clipPath></defs><circle cx="50" cy="50" r="49" fill="url(#${id})"/><g clip-path="url(#c${id})">${scenery}<ellipse cx="76" cy="21" rx="21" ry="8" fill="#fff" opacity=".35" transform="rotate(-30 76 21)"/></g><circle cx="50" cy="50" r="47" fill="none" stroke="#fff" stroke-width="2.5" opacity=".9"/><path d="M19 22q12-13 25-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`;
}
function startStage(w, s) { progress.current = { w, s }; progress.questions = getStageQuestions(w, s + 1); progress.question = 0; progress.score = 0; progress.correct = 0; progress.answered = false; renderQuestion(); }
function renderQuestion() {
  const { w, s } = progress.current, world = worlds[w], question = progress.questions[progress.question], percent = progress.question / progress.questions.length * 100;
  app.innerHTML = `<main class="play-shell"><header class="play-top"><button class="back-button" id="back" aria-label="Kembali ke peta">←</button><div class="play-title"><span>DUNIA ${w+1} · STAGE ${s+1}</span><strong>${world.stages[s]}</strong></div><div class="play-stars">★ ${progress.score}</div></header><div class="progress-rail"><span style="width:${percent}%"></span></div><section class="question-card"><div class="question-meta"><span>SOAL ${progress.question+1} DARI ${progress.questions.length}</span><span class="brain-dot">✦</span></div><h1>${question.prompt}</h1>${question.visual ? `<div class="visual">${question.visual}</div>` : ''}<p class="think-hint">Pikirkan caramu, lalu pilih jawaban.</p><div class="answers">${question.choices.map((answer, i) => `<button class="answer" data-answer="${answer}"><span>${String.fromCharCode(65+i)}</span>${answer}</button>`).join('')}</div><div class="feedback" id="feedback"></div><button class="hint-toggle" id="hint">Butuh petunjuk?</button></section><div class="question-foot">💡 Jawaban benar itu bagus. Memahami caranya lebih hebat.</div></main>`;
  document.querySelector('#back').addEventListener('click', renderHome);
  document.querySelector('#hint').addEventListener('click', () => { const box = document.querySelector('#feedback'); box.className = 'feedback hint'; box.textContent = question.hint; });
  document.querySelectorAll('.answer').forEach(button => button.addEventListener('click', () => answer(button.dataset.answer)));
}
function answer(value) {
  if (progress.answered) return;
  progress.answered = true;
  const question = progress.questions[progress.question], correct = value === question.answer;
  if (correct) { progress.correct++; progress.score += 20; }
  document.querySelectorAll('.answer').forEach(button => { button.disabled = true; if (button.dataset.answer === question.answer) button.classList.add('right'); else if (button.dataset.answer === value) button.classList.add('wrong'); });
  const feedback = document.querySelector('#feedback'); feedback.className = `feedback ${correct ? 'good' : 'try-again'}`; feedback.innerHTML = `<strong>${correct ? 'Tepat! ✨' : 'Belum tepat, tak apa.'}</strong><span>${question.explain}</span>`;
  const next = document.querySelector('#hint'); next.textContent = 'Lanjut →'; next.onclick = nextQuestion;
}
function nextQuestion() { if (progress.question < progress.questions.length - 1) { progress.question++; progress.answered = false; renderQuestion(); } else finishStage(); }
function finishStage() {
  const { w, s } = progress.current, key = `${w}-${s}`, newlyDone = !progress.done[key]; progress.done[key] = true;
  const earned = progress.correct >= 4 ? 3 : progress.correct >= 2 ? 2 : 1; if (newlyDone) progress.stars += earned; save();
  app.innerHTML = `<main class="finish-shell"><div class="finish-confetti">✦</div><div class="finish-icon">${progress.correct >= 3 ? '✧' : '☀'}</div><p class="eyebrow">${worlds[w].name.toUpperCase()} · STAGE ${s+1}</p><h1>${progress.correct >= 3 ? 'Kamu menemukan caranya!' : 'Satu langkah makin paham.'}</h1><p class="finish-copy">Kamu menjawab <strong>${progress.correct} dari 5</strong> dengan benar. ${progress.correct < 5 ? 'Coba lagi kapan saja untuk menemukan cara lain.' : 'Keren, penjelajah!'}</p><div class="earned-stars">${'★'.repeat(earned)}${'☆'.repeat(3-earned)}</div><div class="finish-actions"><button class="primary" id="continue">${s < 9 ? 'Lanjut stage berikutnya' : w < 4 ? 'Dunia berikutnya' : 'Kembali ke peta'} <span>→</span></button><button class="secondary" id="map">Lihat peta</button></div></main>`;
  document.querySelector('#map').addEventListener('click', renderHome);
  document.querySelector('#continue').addEventListener('click', () => s < 9 ? startStage(w, s+1) : w < 4 ? navigate(`#/dunia/${w+2}`) : navigate('#/peta'));
}
window.addEventListener('hashchange', renderHome);
renderHome();
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js');
if (firebaseReady) watchStudent(async user => { if (!user || student || authFlow) return; student = { uid: user.uid, username: user.email?.split('@')[0] || 'penjelajah' }; const profile = await getStudentProgress(user.uid).catch(() => ({})); student.displayName = profile.displayName || student.username; loadProgress(`numeria-progress-${user.uid}`, profile.progress || {}); const destination = selectedWorld; selectedWorld = null; navigate(destination === null ? '#/peta' : `#/dunia/${destination+1}`); });

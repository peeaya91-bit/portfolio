const projectSlides = [
  { type: 'project', img: 'images/project-1.jpg', preview: 'uds-hero', title: 'UDS', openCase: 'uds', desc: 'Ускорение до\u00A0целевого действия' },
  { type: 'project', img: 'images/project-3.jpg', preview: 'video', video: 'images/case-top3000/preview.mp4', poster: 'images/case-top3000/preview-poster.jpg', kicker: 'Кейс / 02', title: 'TOP3000', openCase: 'top3000', desc: 'Онбординг нового игрока через три шага к\u00A03000\u00A0₽' },
  { type: 'project', img: 'images/project-2.jpg', preview: 'points-hero', title: 'UDS · баллы', openCase: 'points', desc: 'Как сделать механику баллов в\u00A0UDS понятной' },
  // скрыто, пока кейса нет: { type: 'project', img: 'images/project-2.jpg', title: 'Проект 2', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
  // скрыто, пока кейса нет: { type: 'project', img: 'images/project-4.jpg', title: 'Проект 4', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
  // скрыто, пока кейса нет: { type: 'project', img: 'images/project-5.jpg', title: 'Проект 5', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
];

const photoSlides = [
  { type: 'photo', img: 'images/photo-1.jpg', caption: 'Москва, 2024' },
  { type: 'photo', img: 'images/photo-2.jpg', caption: 'Чемпионат России, Москва, 2026' },
  { type: 'photo', img: 'images/photo-3.jpg', caption: 'Казань, 2024' },
];

const cardsEl = document.getElementById('cards');
const dotsEl = document.getElementById('dots');

let current = 0;
let cardEls = [];
let dotEls = [];
let activeSlides = [];

/* Превью кейса UDS: лоадер крутится бесконечно, фразы появляются по одному слову
   и сменяют друг друга по кругу */
const LOADER_PHRASES = [
  ['Ща, ща загрузится…', '…или нет'],
  ['Тут как раз кейс про ожидание'],
];
const LOADER_WORD_STEP = 220;   // пауза между словами, мс
const LOADER_LINE_PAUSE = 800;  // пауза перед второй строкой, мс
const LOADER_HOLD = 2600;       // сколько фраза висит целиком, мс
const LOADER_FADE = 400;        // исчезновение, мс
let loaderTimer = null;

function buildLoaderPreview(){
  const box = document.createElement('div');
  box.className = 'card-loader';
  box.innerHTML = `
    <svg class="card-loader-spinner" viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="18" />
    </svg>
    <div class="card-loader-text" aria-live="off">
      <div class="card-loader-line"></div>
      <div class="card-loader-line"></div>
    </div>`;
  const lines = box.querySelectorAll('.card-loader-line');
  const text = box.querySelector('.card-loader-text');
  let idx = 0;

  const show = () => {
    const pair = LOADER_PHRASES[idx];
    text.classList.remove('is-out');
    let n = 0, t = 0;
    lines.forEach((line, li) => {
      line.innerHTML = '';
      if (!pair[li]) return;            // во фразе может быть одна строка
      if (li > 0) t += LOADER_LINE_PAUSE;
      pair[li].split(' ').forEach((word) => {
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = word;
        w.style.animationDelay = `${t}ms`;
        t += LOADER_WORD_STEP;
        line.appendChild(w);
        line.appendChild(document.createTextNode(' '));
        n++;
      });
    });
    const shownAt = t + 300 + LOADER_HOLD;
    clearTimeout(loaderTimer);
    loaderTimer = setTimeout(() => {
      text.classList.add('is-out');
      loaderTimer = setTimeout(() => {
        idx = (idx + 1) % LOADER_PHRASES.length;
        show();
      }, LOADER_FADE);
    }, shownAt);
  };
  show();
  return box;
}

/* Превью кейса 03 (UDS, баллы): отзывы с аватарками появляются по очереди,
   затем на экране телефона запускается анимация приложения */
const POINTS_BUBBLES = [
  { side: 'r', x: 376, y: 179, w: 100, img: 'a1', text: 'Хотела списать баллы, а\u00A0они пропали' },
  { side: 'l', x: 24,  y: 195, w: 104, img: 'a2', text: 'Сделал покупку, а\u00A0баллы не\u00A0начислились' },
  { side: 'r', x: 376, y: 315, w: 100, img: 'a3', text: 'Пропали баллы!' },
  { side: 'l', x: 24,  y: 352, w: 104, img: 'a4', text: 'Баллы сгорели без предупреждения' },
  { side: 'r', x: 376, y: 419, w: 100, img: 'a5', text: 'Куда делись мои баллы?' },
];
const POINTS_STEP = 450;   // пауза между отзывами, мс
const POINTS_START = 300;  // задержка перед первым отзывом, мс
const POINTS_SCREEN_DELAY = POINTS_START + POINTS_STEP * (POINTS_BUBBLES.length - 1) + 600; // старт экрана

function buildPointsHero(){
  const box = document.createElement('div');
  box.className = 'uds-hero points-hero';
  const bubbles = POINTS_BUBBLES.map((b, i) => `
    <div class="ph-bubble ph-${b.side}" style="left:${b.x}px; top:${b.y}px; width:${b.w}px; --d:${POINTS_START + i * POINTS_STEP}ms">
      <div class="ph-msg"><span>${b.text}</span><i class="ph-tail"></i></div>
      <img class="ph-ava" src="images/case-points/${b.img}.jpg" alt="">
    </div>`).join('');
  box.innerHTML = `
    <div class="uds-hero-kicker">Кейс / 03</div>
    <div class="ph-title">Где мои баллы?</div>
    <img class="uds-hero-phone" src="images/case-qr/phone-uds.png" alt="">
    <div class="uds-hero-screen ph-screen">
      <video muted playsinline loop preload="auto">
        <source src="images/case-points/screen.mp4" type="video/mp4">
        <source src="Animation_case2_2.mp4" type="video/mp4">
      </video>
      <i class="uds-hero-island"></i>
    </div>
    <div class="uds-hero-chip">UDS</div>
    ${bubbles}
    <div class="ph-caption">Как сделать механику баллов в\u00A0UDS понятной</div>`;
  return box;
}

// запуск/сброс превью при смене активной карточки
function syncPointsHero(card, active){
  const box = card.querySelector('.points-hero');
  if (!box) return;
  if (active === (box.dataset.on === '1')) return;
  box.dataset.on = active ? '1' : '0';
  const v = box.querySelector('video');
  clearTimeout(box._t);
  if (active){
    box.classList.remove('is-playing'); void box.offsetWidth; // перезапуск CSS-анимаций
    box.classList.add('is-playing');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box._t = setTimeout(() => { try { v.currentTime = 0; } catch(e){} v.play().catch(() => {}); }, reduce ? 0 : POINTS_SCREEN_DELAY);
  } else {
    box.classList.remove('is-playing');
    v.pause();
  }
}

function buildUdsHero(){
  const box = document.createElement('div');
  box.className = 'uds-hero';
  box.innerHTML = `
    <div class="uds-hero-kicker">Кейс / 01</div>
    <div class="uds-hero-title">Ускорение целевого действия</div>
    <img class="uds-hero-phone" src="images/case-qr/phone-uds.png" alt="">
    <div class="uds-hero-screen">
      <video src="Animation_case2_2.mp4" autoplay loop muted playsinline></video>
      <i class="uds-hero-island"></i>
    </div>
    <div class="uds-hero-chip">UDS</div>
    <div class="uds-hero-note uds-hero-note-l">Ускорение целевого действия</div>
    <div class="uds-hero-note uds-hero-note-r">Показываем QR-код пока приложение загружается</div>`;
  return box;
}

function buildCards(slidesData){
  activeSlides = slidesData;
  cardsEl.innerHTML = '';
  dotsEl.innerHTML = '';
  cardEls = [];
  current = 0;

  slidesData.forEach((slide, i) => {
    const card = document.createElement('div');
card.className = slide.type === 'photo' ? 'card card-photo' : 'card';

    if (slide.preview === 'video') {
      // превью-ролик из Figma (500×580); пока ролика нет, виден постер
      card.classList.add('card-hero-card');
      const v = document.createElement('video');
      v.className = 'card-video';
      v.src = slide.video; v.poster = slide.poster;
      v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      card.appendChild(v);
      if (slide.kicker) {
        // номер кейса поверх ролика (в экспорте из Figma может стоять старый номер)
        const ov = document.createElement('div');
        ov.className = 'uds-hero card-video-overlay';
        ov.innerHTML = `<div class="uds-hero-kicker">${slide.kicker}</div>`;
        card.appendChild(ov);
      }
    } else if (slide.preview === 'points-hero') {
      card.classList.add('card-hero-card');
      card.appendChild(buildPointsHero());
    } else if (slide.preview === 'uds-hero') {
      // превью кейса UDS по макету 500×580: заголовок, телефон, анимация на экране
      card.classList.add('card-hero-card');
      card.appendChild(buildUdsHero());
    } else if (slide.preview === 'loader') {
      // анимированное превью кейса UDS: бесконечный лоадер + фразы по словам
      card.classList.add('card-loader-card');
      card.appendChild(buildLoaderPreview());
    } else {
    const img = document.createElement('img');
    img.src = slide.img;
    img.alt = slide.type === 'photo' ? slide.caption : slide.title;
    card.appendChild(img);

    const fallback = document.createElement('div');
    fallback.className = 'fallback';
    fallback.textContent = `Добавьте изображение: ${slide.img}`;
    card.appendChild(fallback);

    img.onload = () => { fallback.classList.add('hidden'); };
    img.onerror = () => { img.remove(); fallback.classList.remove('hidden'); };
    }

    if (slide.type === 'photo' && slide.caption) {
      const caption = document.createElement('div');
      caption.className = 'card-caption';
      caption.textContent = slide.caption;
      card.appendChild(caption);
    }
if (slide.type === 'project') {
  const projectCaption = document.createElement('div');
  projectCaption.className = 'project-caption';

  const textWrap = document.createElement('div');
  textWrap.className = 'project-caption-text';

  const titleEl = document.createElement('div');
  titleEl.className = 'project-caption-title';
  titleEl.textContent = slide.title;
  textWrap.appendChild(titleEl);

  const descEl = document.createElement('div');
  descEl.className = 'project-caption-desc';
  descEl.textContent = slide.desc || '';
  textWrap.appendChild(descEl);

  projectCaption.appendChild(textWrap);

  const arrowBtn = document.createElement('div');
  arrowBtn.className = 'project-caption-btn';
arrowBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';  projectCaption.appendChild(arrowBtn);

  card.appendChild(projectCaption);
}
    if (slide.openCase) {
      // кнопка «Подробнее» — появляется при наведении на карточку кейса
      const more = document.createElement('span');
      more.className = 'card-more';
      more.innerHTML = 'Подробнее<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5.833 9.166 10 5 14.167M11.25 5.833 15.416 10l-4.166 4.167" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      card.appendChild(more);
    }
    cardsEl.appendChild(card);
    cardEls.push(card);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  dotEls = [...dotsEl.children];
  render();
}

// Geometry per distance-from-center, modeled on the observed stack
// on gabrielbeaugonin.com: neighbours shrink to thin tilted bars,
// then widen slightly again further out, fading via the edge masks.
const LEVELS = [
  { ty: 0,   w: 1,     h: 1,     rot: 0,  z: 0 },    // center
  { ty: 300, w: 0.905, h: 0.122, rot: 24, z: -60 },  // ±1
  { ty: 336, w: 0.895, h: 0.147, rot: 34, z: -110 }, // ±2
  { ty: 372, w: 0.885, h: 0.169, rot: 42, z: -160 }, // ±3
];

function render() {
  const baseW = parseFloat(getComputedStyle(stackEl).getPropertyValue('--card-w')) || 420;
  const baseH = parseFloat(getComputedStyle(stackEl).getPropertyValue('--card-h')) || 500;

  cardEls.forEach((el, i) => {
    const isCurrent = i === current;

    el.style.width = `${baseW}px`;
    el.style.height = `${baseH}px`;
    const hero = el.querySelector('.uds-hero');
    if (hero) hero.style.transform = `scale(${baseW / 500}, ${baseH / 580})`;
    el.style.transform = 'translate(-50%, -50%)';
    el.style.opacity = isCurrent ? 1 : 0;
    el.style.pointerEvents = isCurrent ? 'auto' : 'none';
    el.style.zIndex = isCurrent ? 100 : 0;
    syncPointsHero(el, isCurrent);

    const label = el.querySelector('.label');
    if (label) label.style.opacity = isCurrent ? 1 : 0;
    const fallback = el.querySelector('.fallback');
    if (fallback) fallback.style.opacity = isCurrent ? 1 : 0;
  });

  dotEls.forEach((d, i) => d.classList.toggle('active', i === current));
}

function goTo(i) {
  current = Math.max(0, Math.min(cardEls.length - 1, i));
  render();
}

const stackEl = document.querySelector('.stack');
const viewportEl = document.getElementById('viewport');
const caseContentEl = document.getElementById('caseContent');

function showCase(id){
  // показываем нужный кейс, остальные прячем
  caseContentEl.querySelectorAll('.case-body').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.case === id);
  });
  stackEl.classList.add('case-open');
  caseContentEl.scrollTop = 0;
  if (window.caseCloseReset) window.caseCloseReset();
}

/* Открытие кейса: карточка плавно растёт до размера слайда,
   затем контент кейса проявляется через opacity */
const CASE_GROW_MS = 550;
let caseAnimating = false;
function openCase(id){
  if (caseAnimating) return;
  const card = cardEls[current];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!card || reduce) { showCase(id); caseContentEl.classList.add('is-shown'); return; }
  caseAnimating = true;

  const from = card.getBoundingClientRect();
  const sr = stackEl.getBoundingClientRect();
  const w = Math.min(720, sr.width);
  const to = { left: sr.left + (sr.width - w) / 2, top: sr.top + 32, width: w, height: window.innerHeight - 80 };

  const ghost = document.createElement('div');
  ghost.className = 'case-ghost';
  Object.assign(ghost.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
  document.body.appendChild(ghost);
  ghost.getBoundingClientRect(); // фиксируем стартовое положение
  ghost.classList.add('grow');
  Object.assign(ghost.style, { left: to.left + 'px', top: to.top + 'px', width: to.width + 'px', height: to.height + 'px' });

  setTimeout(() => {
    caseContentEl.classList.remove('is-shown');
    showCase(id);
    caseContentEl.getBoundingClientRect();
    caseContentEl.classList.add('is-shown');
    ghost.classList.add('out');
    setTimeout(() => { ghost.remove(); caseAnimating = false; }, 400);
  }, CASE_GROW_MS);
}
function closeCase(){
  if (caseAnimating) return;
  caseAnimating = true;
  caseContentEl.classList.remove('is-shown');
  setTimeout(() => {
    stackEl.classList.remove('case-open');
    caseAnimating = false;
  }, 300);
}


window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && stackEl.classList.contains('case-open')) closeCase();
});

let wheelLock = false;
stackEl.addEventListener('wheel', (e) => {
  if (stackEl.classList.contains('case-open')) return;
  e.preventDefault();
  if (wheelLock) return;
  if (Math.abs(e.deltaY) < 8) return;
  wheelLock = true;
  goTo(current + (e.deltaY > 0 ? 1 : -1));
  setTimeout(() => { wheelLock = false; }, 480);
}, { passive: false });

let dragStartY = null;
let dragStartX = null;
let dragMoved = false;
let dragLock = false;

// листаем по доминирующей оси: на десктопе вертикально, на мобильном — свайпом влево/вправо
function dragStart(x, y) {
  dragStartX = x;
  dragStartY = y;
  dragMoved = false;
  viewportEl.classList.add('grabbing');
}
function dragMove(x, y) {
  if (dragStartY === null || dragLock) return;
  const dx = dragStartX - x, dy = dragStartY - y;
  const diff = Math.abs(dx) > Math.abs(dy) ? dx : dy;
  if (Math.abs(diff) > 6) dragMoved = true;
  if (Math.abs(diff) > 50) {
    dragLock = true;
    goTo(current + (diff > 0 ? 1 : -1));
    dragStartX = x; dragStartY = y;
    setTimeout(() => { dragLock = false; }, 350);
  }
}
function dragEnd() {
  dragStartY = null;
  dragStartX = null;
  viewportEl.classList.remove('grabbing');
}

viewportEl.addEventListener('pointerdown', (e) => {
  viewportEl.setPointerCapture(e.pointerId);
  dragStart(e.clientX, e.clientY);
});
viewportEl.addEventListener('pointermove', (e) => {
  if (e.buttons === 0 && e.pointerType === 'mouse') return;
  dragMove(e.clientX, e.clientY);
});
viewportEl.addEventListener('pointerup', dragEnd);
viewportEl.addEventListener('pointercancel', dragEnd);

viewportEl.addEventListener('click', (e) => {
  if (dragMoved) { dragMoved = false; return; }

  const slide = activeSlides[current];
  if (!slide || !slide.openCase) return;

  const rect = cardEls[current].getBoundingClientRect();
  const insideCard = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (insideCard) openCase(slide.openCase);
});

window.addEventListener('keydown', (e) => {
  if (stackEl.classList.contains('case-open')) return;
  if (e.key === 'ArrowDown') goTo(current + 1);
  if (e.key === 'ArrowUp') goTo(current - 1);
});

window.addEventListener('resize', render);

buildCards(projectSlides);
const toggleBtn = document.getElementById('toggleBtn');
const toggleIcon = document.getElementById('toggleIcon');
const bubbleBtn = document.getElementById('bubbleBtn');
const bubbleIcon = document.getElementById('bubbleIcon');
const socials = document.getElementById('socials');
const aboutPanel = document.getElementById('aboutPanel');
const introTopEl = document.querySelector('.intro-top');

function centerIntro(){
  // на мобильном отступы задаёт CSS (имя сверху, как в макете)
  if (window.matchMedia('(max-width: 860px)').matches) { introTopEl.style.paddingTop = ''; return; }
  const heroHeight = document.querySelector('.hero').clientHeight;
  const introTopHeight = introTopEl.offsetHeight;
  const pad = Math.max(40, (heroHeight - introTopHeight) / 2);
  introTopEl.style.paddingTop = pad + 'px';
}
centerIntro();
window.addEventListener('resize', centerIntro);

const personIconSvg = `<path d="M5 19.1115C5 16.6984 6.69732 14.643 9.00404 14.2627L9.21182 14.2284C11.0589 13.9239 12.9411 13.9239 14.7882 14.2284L14.996 14.2627C17.3027 14.643 19 16.6984 19 19.1115C19 20.1545 18.1815 21 17.1719 21H6.82813C5.81848 21 5 20.1545 5 19.1115Z" stroke="currentColor" stroke-width="2"/><path d="M16.0834 6.9375C16.0834 9.11212 14.2552 10.875 12 10.875C9.74486 10.875 7.91669 9.11212 7.91669 6.9375C7.91669 4.76288 9.74486 3 12 3C14.2552 3 16.0834 4.76288 16.0834 6.9375Z" stroke="currentColor" stroke-width="2"/>`;

const bubbleIconSvg = `<path d="M8.69628 9.05793H14.7279M8.69628 12.5141H12.5346M13.1107 18.9268H14.1721C17.0589 18.9268 19.5701 16.8499 20.2476 13.9021C20.5841 12.4382 20.5841 10.9113 20.2476 9.44741L20.1588 9.06088C19.5057 6.21958 17.377 4.01204 14.6641 3.36264L14.283 3.27141C12.7712 2.90953 11.2013 2.90953 9.68953 3.27141L9.46648 3.32481C6.65677 3.99738 4.45212 6.28371 3.77571 9.22642C3.40585 10.8355 3.40923 12.5287 3.77909 14.1378C4.46607 17.1265 6.48688 19.6138 9.19777 20.7728L9.31593 20.8233C10.489 21.3249 11.8329 20.7208 12.3142 19.4902C12.4467 19.1515 12.7622 18.9268 13.1107 18.9268Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;

const closeIconSvg = `<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`;

const downloadIconSvg = `<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

/* смещение каждой кнопки контакта до бабла: из него они «вылетают» и в него же «собираются» */
function setGatherOffsets(){
  const b = bubbleBtn.getBoundingClientRect();
  socials.querySelectorAll('.icon-btn.extra').forEach((el) => {
    // меряем исходное положение кнопки без текущего сдвига
    el.style.transition = 'none'; el.style.transform = 'none';
    const r = el.getBoundingClientRect();
    el.style.transform = ''; el.getBoundingClientRect(); el.style.transition = '';
    el.style.setProperty('--dx', (b.left - r.left) + 'px');
  });
}
window.addEventListener('load', setGatherOffsets);
window.addEventListener('resize', setGatherOffsets);

bubbleBtn.addEventListener('click', function(e){
  if (socials.classList.contains('profile-open')) return; // в этом режиме кнопка = скачать CV, идём по ссылке как обычно
  e.preventDefault();
  setGatherOffsets();
  const isOpen = socials.classList.toggle('expanded');
  bubbleBtn.classList.toggle('active', isOpen);
  bubbleBtn.classList.toggle('round', isOpen);
  bubbleIcon.innerHTML = isOpen ? closeIconSvg : bubbleIconSvg;
});

toggleBtn.addEventListener('click', function(e){
  e.preventDefault();
  const isOpen = aboutPanel.classList.toggle('open');
  toggleBtn.classList.toggle('active', isOpen);
  toggleBtn.classList.toggle('round', isOpen);
  toggleIcon.innerHTML = isOpen ? closeIconSvg : personIconSvg;

  // если контакты были раскрыты — они «собираются» обратно в бабл, а бабл без кручения превращается в CV
  if (socials.classList.contains('expanded')) {
    setGatherOffsets();
    bubbleBtn.classList.add('no-spin');
    setTimeout(() => bubbleBtn.classList.remove('no-spin'), 700);
  }
  socials.classList.remove('expanded');
  bubbleBtn.classList.remove('active', 'round');
  socials.classList.toggle('profile-open', isOpen);
  bubbleIcon.innerHTML = isOpen ? downloadIconSvg : bubbleIconSvg;

  // вместо карточек кейсов показываем стопку фотографий
  // если был открыт кейс — закрываем его, иначе он остаётся рядом с фото
  if (isOpen && stackEl.classList.contains('case-open')) {
    stackEl.classList.remove('case-open');
    caseContentEl.classList.remove('is-shown');
  }
  // на мобильном фото сразу разложены веером, на десктопе — собраны в стопку
  // на мобильном фото сразу разложены веером, на десктопе — лежат стопкой и раскрываются по клику
  photoStack.classList.toggle('expanded', isMobileView());
  photoStack.querySelectorAll('.ps-item').forEach(x => x.classList.remove('is-front'));
  stackEl.classList.toggle('photos', isOpen);
});

/* Стопка фото «обо мне»: по клику фото разлетаются веером и собираются обратно */
const isMobileView = () => window.matchMedia('(max-width: 860px)').matches;
const photoStack = (() => {
  const box = document.createElement('div');
  box.className = 'photo-stack';
  box.setAttribute('aria-label', 'Фотографии');
  const COLLAPSED_ROT = [-7, 5, -3];      // лёгкий наклон в стопке
  const EXPANDED_ROT  = [-12, 8, -5];     // наклон, когда фото разложены
  photoSlides.forEach((ph, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ps-item';
    b.style.setProperty('--i', i);
    b.style.setProperty('--cr', COLLAPSED_ROT[i] + 'deg');
    b.style.setProperty('--er', EXPANDED_ROT[i] + 'deg');
    b.setAttribute('aria-label', 'Разложить или собрать фотографии');
    b.innerHTML = `<img src="${ph.img}" alt="${ph.caption || ''}"><span class="ps-caption">${ph.caption || ''}</span>`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isMobileView()) {
        // мобильный: тап поднимает фото на верхний слой
        box.querySelectorAll('.ps-item').forEach(x => x.classList.toggle('is-front', x === b));
        return;
      }
      const open = box.classList.toggle('expanded');
      box.querySelectorAll('.ps-item').forEach(x => x.setAttribute('aria-pressed', open));
    });
    box.appendChild(b);
  });
  stackEl.appendChild(box);
  return box;
})();

const phoneCopy = document.getElementById('phoneCopy');
const phoneBtn = phoneCopy.closest('.icon-btn');

phoneCopy.addEventListener('click', function(e){
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText('+7 (917) 935-46-95').then(function(){
    phoneCopy.classList.add('copied');
    phoneBtn.classList.add('show-tooltip');
    setTimeout(function(){
      phoneCopy.classList.remove('copied');
      phoneBtn.classList.remove('show-tooltip');
    }, 1500);
  });
});

const phoneNumberEl = document.querySelector('.phone-number');
const phoneCopyBtn = document.querySelector('.phone-copy');
const phoneText = phoneNumberEl.textContent;

phoneNumberEl.innerHTML = '';
phoneText.split('').forEach(function(char, i){
  const span = document.createElement('span');
  span.textContent = char === ' ' ? '\u00A0' : char;
  span.style.transitionDelay = (i * 0.02) + 's';
  phoneNumberEl.appendChild(span);
});

const copyDelay = phoneText.length * 0.02 + 0.15;
phoneCopyBtn.style.transitionDelay = copyDelay + 's';

const emailAddress = 'whygol@gmail.com';
const emailTextEl = document.querySelector('.email-text');
const emailCopyBtn = document.getElementById('emailCopy');
const emailBtn = emailCopyBtn.closest('.icon-btn');

emailTextEl.textContent = emailAddress;
const emailChars = emailAddress.split('');
emailTextEl.innerHTML = '';
emailChars.forEach(function(char, i){
  const span = document.createElement('span');
  span.textContent = char;
  span.style.transitionDelay = (i * 0.02) + 's';
  emailTextEl.appendChild(span);
});

const emailCopyDelay = emailChars.length * 0.02 + 0.15;
emailCopyBtn.style.transitionDelay = emailCopyDelay + 's';

emailCopyBtn.addEventListener('click', function(e){
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText(emailAddress).then(function(){
    emailCopyBtn.classList.add('copied');
    emailBtn.classList.add('show-tooltip');
    setTimeout(function(){
      emailCopyBtn.classList.remove('copied');
      emailBtn.classList.remove('show-tooltip');
    }, 1500);
  });
});

document.querySelectorAll('.about-job.has-list .about-job-header').forEach(function(header){
  header.addEventListener('click', function(){
    header.closest('.about-job').classList.toggle('open');
  });
});

const canvas = document.getElementById('cursor-thread');
const ctx = canvas.getContext('2d');

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const POINTS_COUNT = 16;
const points = Array.from({ length: POINTS_COUNT }, () => ({ x: 0, y: 0 }));
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let hasMoved = false;

window.addEventListener('mousemove', function(e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  hasMoved = true;
});

// на телефонах и планшетах (нет мыши) «хвост» курсора не нужен — канвас скрыт, анимация не крутится
const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function animateThread(){
  if (!hasMouse) return;
  if (!hasMoved){ requestAnimationFrame(animateThread); return; } // пока мышь не двигалась — ничего не рисуем (иначе точка в углу)
  if (hasMoved){
    points[0].x += (mouse.x - points[0].x) * 0.35;
    points[0].y += (mouse.y - points[0].y) * 0.35;

    for (let i = 1; i < points.length; i++){
      points[i].x += (points[i - 1].x - points[i].x) * 0.35;
      points[i].y += (points[i - 1].y - points[i].y) * 0.35;
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxWidth = 6;
  const minWidth = 0.5;

  for (let i = 0; i < points.length - 2; i++){
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];

    const midX1 = (p1.x + p2.x) / 2;
    const midY1 = (p1.y + p2.y) / 2;
    const midX2 = (p2.x + p3.x) / 2;
    const midY2 = (p2.y + p3.y) / 2;

    const t = i / (points.length - 3);
    const width = maxWidth - (maxWidth - minWidth) * t;
    const alpha = 0.85 - t * 0.5;

    ctx.beginPath();
    ctx.moveTo(midX1, midY1);
    ctx.quadraticCurveTo(p2.x, p2.y, midX2, midY2);
    ctx.strokeStyle = `rgba(29, 95, 209, ${alpha})`;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  requestAnimationFrame(animateThread);
}
animateThread();

const tgCopy = document.getElementById('tgCopy');
const tgBtn = tgCopy.closest('.icon-btn');

tgCopy.addEventListener('click', function(e){
  e.preventDefault();
  e.stopPropagation();
  navigator.clipboard.writeText('@Plotvi4ka').then(function(){
    tgCopy.classList.add('copied');
    tgBtn.classList.add('show-tooltip');
    setTimeout(function(){
      tgCopy.classList.remove('copied');
      tgBtn.classList.remove('show-tooltip');
    }, 1500);
  });
});
/* Анимации в кейсе: запускаются, когда блок целиком на экране,
   и сбрасываются, когда блок полностью уходит с экрана (чтобы проиграть снова).
   03 — прогресс-бары в таблице, 04 — скрины конкурентов, 07 — стрелки к телефону */
(() => {
  const blocks = document.querySelectorAll('.case-content .benchchart, .case-content .bench-shots, .case-content .sol-scheme, .case-content .t3k-flow, .case-content .pts-anim');
  if (!blocks.length) return;
  if (!('IntersectionObserver' in window)) { blocks.forEach(b => b.classList.add('is-animated')); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // схема на 07 высокая и может не влезть в экран целиком — ей хватает 60%
      const need = entry.target.classList.contains('sol-scheme') || entry.target.classList.contains('t3k-flow') || entry.target.classList.contains('pts-anim') ? 0.6 : 0.98;
      if (entry.intersectionRatio >= need) entry.target.classList.add('is-animated');
      else if (!entry.isIntersecting) entry.target.classList.remove('is-animated');
    });
  }, { threshold: [0, 0.6, 0.98] });

  blocks.forEach(b => io.observe(b));
})();


/* Кнопка закрытия кейса: слева от слайдов, следует за курсором по вертикали в пределах контейнера */
(() => {
  const btn = document.getElementById('caseClose');
  if (!btn) return;
  btn.addEventListener('click', (e) => { e.stopPropagation(); closeCase(); });

  const PAD = 32;                 // отступ от верха и низа контейнера
  const GAP = 16;                 // отступ кнопки от контейнера со слайдами

  // ставим кнопку слева от слайдов: левый край слайда − ширина кнопки − 16px
  const placeX = () => {
    if (window.matchMedia('(max-width: 860px)').matches) { btn.style.left = ''; return; } // на мобильном кнопка внизу по центру (CSS)
    const slide = caseContentEl.querySelector('.case-body.is-active section');
    if (!slide) return;
    const left = slide.getBoundingClientRect().left - stackEl.getBoundingClientRect().left;
    btn.style.left = `${left - btn.offsetWidth - GAP}px`;
  };
  let target = 0, y = 0, raf = null;

  const bounds = () => {
    const h = stackEl.clientHeight;
    return { min: PAD, max: h - PAD - btn.offsetHeight };
  };
  const clamp = (v) => { const b = bounds(); return Math.max(b.min, Math.min(b.max, v)); };
  const apply = () => { btn.style.transform = `translateY(${y}px)`; };

  const tick = () => {
    y += (target - y) * 0.18;     // плавное «догоняние» курсора
    apply();
    if (Math.abs(target - y) > 0.5) raf = requestAnimationFrame(tick);
    else { y = target; apply(); raf = null; }
  };

  // при открытии кейса кнопка стоит внизу
  window.caseCloseReset = () => { placeX(); target = y = bounds().max; apply(); };

  // пока курсор на кнопке (или в 12px рядом), она замирает — иначе она «уезжает» из-под курсора
  // между нажатием и отпусканием, и клик не срабатывает
  const freeze = () => { target = y; if (raf) { cancelAnimationFrame(raf); raf = null; } apply(); };
  btn.addEventListener('pointerdown', freeze);

  window.addEventListener('mousemove', (e) => {
    if (!stackEl.classList.contains('case-open')) return;
    const r = btn.getBoundingClientRect();
    if (e.clientX > r.left - 12 && e.clientX < r.right + 12 && e.clientY > r.top - 12 && e.clientY < r.bottom + 12) { freeze(); return; }
    const top = stackEl.getBoundingClientRect().top;
    target = clamp(e.clientY - top - btn.offsetHeight / 2);
    if (!raf) raf = requestAnimationFrame(tick);
  });
  window.addEventListener('resize', () => {
    if (!stackEl.classList.contains('case-open')) return;
    placeX(); target = clamp(target); y = clamp(y); apply();
  });
})();

/* Карусели в кейсах 02 и 03: листаются стрелками и свайпом (палец ведёт ленту, отпустил — доводим до слайда) */
document.querySelectorAll('.t3k-carousel, .pts-carousel').forEach((car) => {
  const track = car.querySelector('.t3k-track, .pts-track');
  const viewport = car.querySelector('.t3k-viewport, .pts-viewport');
  const items = [...track.children];
  const prev = car.querySelector('.t3k-prev');
  const next = car.querySelector('.t3k-next-btn');
  let idx = 0;
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0; // 16px на десктопе, 8px на мобильном
  const stepW = () => items[0].getBoundingClientRect().width + gap();
  const perView = () => {
    const w = items[0].getBoundingClientRect().width || 1;
    const vw = viewport.getBoundingClientRect().width;
    return Math.max(1, Math.round((vw + gap()) / (w + gap())));
  };
  const maxIdx = () => Math.max(0, items.length - perView());
  const update = (drag = 0) => {
    idx = Math.min(Math.max(idx, 0), maxIdx());
    track.style.transform = `translateX(${-idx * stepW() + drag}px)`;
    prev.disabled = idx === 0;
    next.disabled = idx >= maxIdx();
  };
  prev.addEventListener('click', (e) => { e.stopPropagation(); idx--; update(); });
  next.addEventListener('click', (e) => { e.stopPropagation(); idx++; update(); });

  // свайп: вертикальный скролл страницы оставляем браузеру (touch-action: pan-y в CSS)
  let sx = null, sy = null, dx = 0, horiz = null, t0 = 0;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    sx = e.clientX; sy = e.clientY; dx = 0; horiz = null; t0 = performance.now();
  });
  viewport.addEventListener('pointermove', (e) => {
    if (sx === null) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (horiz === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
      horiz = Math.abs(mx) > Math.abs(my);
      if (horiz) { viewport.setPointerCapture(e.pointerId); track.style.transition = 'none'; }
    }
    if (!horiz) return;
    dx = mx;
    // у краёв лента тянется с сопротивлением
    const edge = (idx === 0 && dx > 0) || (idx >= maxIdx() && dx < 0);
    update(edge ? dx / 3 : dx);
  });
  const end = () => {
    if (sx === null) return;
    if (horiz) {
      track.style.transition = '';
      const fast = Math.abs(dx) / Math.max(1, performance.now() - t0) > 0.4;
      if (Math.abs(dx) > stepW() * 0.25 || (fast && Math.abs(dx) > 20)) idx += dx < 0 ? 1 : -1;
      update();
    }
    sx = sy = null; horiz = null; dx = 0;
  };
  viewport.addEventListener('pointerup', end);
  viewport.addEventListener('pointercancel', end);

  window.addEventListener('resize', () => update());
  // пересчитать, когда кейс открыли (до этого он скрыт и ширины нулевые)
  new MutationObserver(() => update()).observe(stackEl, { attributes: true, attributeFilter: ['class'] });
  update();
});


/* Мобильный: скрины конкурентов (04 / Бенчмаркинг) листаются по одному стрелками */
(() => {
  const shots = document.querySelector('.case-content .bench-shots');
  const nav = document.querySelector('.case-content .bench-nav');
  if (!shots || !nav) return;
  const prev = nav.querySelector('.t3k-prev');
  const next = nav.querySelector('.t3k-next-btn');
  const go = (dir) => shots.scrollBy({ left: dir * shots.clientWidth, behavior: 'smooth' });
  // стрелка неактивна, если в эту сторону листать больше некуда
  const update = () => {
    const max = shots.scrollWidth - shots.clientWidth;
    prev.disabled = shots.scrollLeft <= 2;
    next.disabled = shots.scrollLeft >= max - 2;
  };
  prev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
  shots.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  new MutationObserver(update).observe(stackEl, { attributes: true, attributeFilter: ['class'] });
  update();
})();


/* Мобильный: блоки со скринами, которые листаются свайпом, + стрелки под ними (.scroll-nav) */
document.querySelectorAll('.case-content .scroll-nav').forEach((nav) => {
  const box = nav.previousElementSibling;
  if (!box) return;
  const prev = nav.querySelector('.t3k-prev');
  const next = nav.querySelector('.t3k-next-btn');
  const go = (dir) => box.scrollBy({ left: dir * box.clientWidth, behavior: 'smooth' });
  const update = () => {
    const max = box.scrollWidth - box.clientWidth;
    prev.disabled = box.scrollLeft <= 2;
    next.disabled = box.scrollLeft >= max - 2;
  };
  prev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
  box.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  new MutationObserver(update).observe(stackEl, { attributes: true, attributeFilter: ['class'] });
  update();
});


/* Просмотр полного флоу конкурента: кнопка под скрином открывает картинку поверх страницы.
   Картинка «вырастает» из скрина, закрывается по Esc, клику на фон, крестику или перетаскиванием в сторону. */
(() => {
  const btns = document.querySelectorAll('.lb-open');
  if (!btns.length) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = '<div class="lb-backdrop"></div><div class="lb-stage"><div class="lb-frame"><img alt=""></div></div><button type="button" class="lb-close" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
  document.body.appendChild(lb);
  const frame = lb.querySelector('.lb-frame');
  const img = lb.querySelector('img');
  let origin = null, open = false;
  const isMobile = () => window.matchMedia('(max-width: 860px)').matches;

  const flip = (fromRect) => {
    const to = frame.getBoundingClientRect();
    if (!fromRect || !to.width) return;
    const sx = fromRect.width / to.width, sy = fromRect.height / to.height;
    frame.style.transition = 'none';
    frame.style.transformOrigin = '0 0';
    frame.style.transform = `translate(${fromRect.left - to.left}px, ${fromRect.top - to.top}px) scale(${sx}, ${sy})`;
    frame.style.opacity = '0.4';
    frame.getBoundingClientRect();
    frame.style.transition = 'transform .34s cubic-bezier(.22,1,.36,1), opacity .2s ease';
    frame.style.transform = '';
    frame.style.opacity = '1';
  };

  const show = (btn) => {
    origin = btn.closest('figure').querySelector('img');
    img.src = btn.dataset.full; img.alt = btn.dataset.alt || '';
    lb.classList.add('is-open'); open = true;
    document.documentElement.style.overflow = 'hidden';
    const go = () => { if (!isMobile()) flip(origin.getBoundingClientRect()); };
    img.complete ? requestAnimationFrame(go) : img.addEventListener('load', go, { once: true });
    lb.querySelector('.lb-close').focus({ preventScroll: true });
  };
  const hide = () => {
    if (!open) return; open = false;
    frame.style.transition = 'transform .2s ease, opacity .2s ease';
    frame.style.opacity = '0';
    lb.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => { frame.style.transform = ''; frame.style.opacity = ''; frame.style.transition = ''; img.src = ''; }, 220);
  };

  btns.forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); show(b); }));
  lb.querySelector('.lb-backdrop').addEventListener('click', hide);
  lb.querySelector('.lb-stage').addEventListener('click', (e) => { if (e.target === e.currentTarget) hide(); });
  lb.querySelector('.lb-close').addEventListener('click', hide);
  document.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') { e.stopImmediatePropagation(); hide(); } }, true);

  // перетаскивание (десктоп): тянем картинку, отпускаем далеко или резко — закрывается
  let start = null, last = null;
  frame.addEventListener('pointerdown', (e) => {
    if (isMobile()) return;
    start = { x: e.clientX, y: e.clientY, t: performance.now() }; last = start;
    frame.setPointerCapture(e.pointerId); frame.style.transition = 'none'; frame.classList.add('dragging');
  });
  frame.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    const k = 0.6; // «резиновое» сопротивление
    frame.style.transform = `translate(${dx * k}px, ${dy * k}px) rotate(${Math.max(-2.5, Math.min(2.5, dx / 120))}deg)`;
    last = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  const end = () => {
    if (!start) return;
    const dx = last.x - start.x, dy = last.y - start.y;
    const dt = Math.max(1, last.t - start.t), v = Math.hypot(dx, dy) / dt * 1000;
    frame.classList.remove('dragging');
    start = null;
    if (Math.abs(dx) > 140 || Math.abs(dy) > 140 || v > 650) {
      frame.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
      frame.style.transform += ` translate(${dx * 0.5}px, ${dy * 0.5}px)`;
      hide();
    } else {
      frame.style.transition = 'transform .22s cubic-bezier(.22,1,.36,1)';
      frame.style.transform = '';
    }
  };
  frame.addEventListener('pointerup', end);
  frame.addEventListener('pointercancel', end);
})();


/* 05 · Десктоп: сценарий модалок регистрации, шаги слева кликабельны.
   Играют, когда картинка на 60% в экране; сбрасываются, когда блок уходит с экрана. */
(() => {
  const anims = document.querySelectorAll('.case-content .dsk-anim');
  if (!anims.length) return;
  // [мс, шаг] или [мс, 'tap', x%, y%] — координаты касания внутри модалки / колонки купона
  const SCRIPTS = {
    modals: [[0, 0], [900, 'tap', 50, 78.2], [1250, 1], [2350, 'tap', 50, 89.7], [2700, 2], [3800, 'tap', 50, 44.2], [4150, 3]]
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setStep = (el, n) => {
    el.dataset.step = n;
    el.querySelectorAll('.dsk-steps li').forEach((li, i) => { li.classList.toggle('is-on', i === n); li.classList.toggle('is-done', i < n); });
    el.querySelectorAll('.dm').forEach((m, i) => { m.classList.toggle('is-on', i === n); m.classList.toggle('is-past', i < n); });
    const nav = el.querySelector('.dsk-nav');
    if (nav) {
      nav.querySelector('.t3k-prev').disabled = n === 0;
      nav.querySelector('.t3k-next-btn').disabled = n >= el.querySelectorAll('.dm').length - 1;
    }
  };
  const tap = (el, x, y) => {
    const t = el.querySelector('.dsk-tap'); if (!t) return;
    t.style.left = x + '%'; t.style.top = y + '%';
    t.classList.remove('is-tapping'); void t.offsetWidth; t.classList.add('is-tapping');
  };
  const stop = (el) => {
    (el._timers || []).forEach(clearTimeout); el._timers = []; el._playing = false;
    const t = el.querySelector('.dsk-tap'); if (t) t.classList.remove('is-tapping');
    setStep(el, 0);
  };
  const play = (el) => {
    stop(el); el._playing = true;
    const script = SCRIPTS.modals;
    if (reduce) { setStep(el, script[script.length - 1][1]); return; }
    script.forEach(([ms, a, x, y]) => el._timers.push(setTimeout(() => (a === 'tap' ? tap(el, x, y) : setStep(el, a)), ms)));
  };

  anims.forEach((el) => setStep(el, 0));
  // шаги кликабельны, на мобильном ещё стрелки и свайп по модалке — всё останавливает автопроигрывание
  anims.forEach((el) => {
    const n = el.querySelectorAll('.dm').length;
    const goTo = (i) => {
      i = Math.max(0, Math.min(n - 1, i));
      (el._timers || []).forEach(clearTimeout); el._timers = []; el._playing = true; el._manual = true; setStep(el, i);
    };
    const cur = () => +el.dataset.step || 0;
    const nav = el.querySelector('.dsk-nav');
    if (nav) {
      nav.querySelector('.t3k-prev').addEventListener('click', (e) => { e.stopPropagation(); goTo(cur() - 1); });
      nav.querySelector('.t3k-next-btn').addEventListener('click', (e) => { e.stopPropagation(); goTo(cur() + 1); });
    }
    const stage = el.querySelector('.dsk-stage');
    let sx = null, sy = null;
    stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    stage.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const mx = e.clientX - sx, my = e.clientY - sy; sx = sy = null;
      if (Math.abs(mx) > 40 && Math.abs(mx) > Math.abs(my)) goTo(cur() + (mx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', () => { sx = sy = null; });
  });
  // шаги кликабельны: клик останавливает автопроигрывание и показывает нужную модалку
  anims.forEach((el) => {
    el.querySelectorAll('.dsk-steps li').forEach((li, i) => {
      const go = () => { (el._timers || []).forEach(clearTimeout); el._timers = []; el._playing = true; el._manual = true; setStep(el, i); };
      li.addEventListener('click', go);
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  });
  if (!('IntersectionObserver' in window)) { anims.forEach(play); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target.closest('.dsk-anim');
      if (el._manual) return; // после ручного выбора шага больше не перезапускаем
      if (entry.intersectionRatio >= 0.6 && !el._playing) play(el);
      else if (!entry.isIntersecting) stop(el);
    });
  }, { threshold: [0, 0.6] });
  anims.forEach((el) => io.observe(el.querySelector('.dsk-stage')));
})();

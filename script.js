const projectSlides = [
  { type: 'project', img: 'images/project-1.jpg', title: 'UDS', openCase: true, desc: 'Агрегатор программм лояльности для\u00A0малого и\u00A0среднего бизнеса' },
  { type: 'project', img: 'images/project-2.jpg', title: 'Проект 2', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
  { type: 'project', img: 'images/project-3.jpg', title: 'Проект 3', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
  { type: 'project', img: 'images/project-4.jpg', title: 'Проект 4', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
  { type: 'project', img: 'images/project-5.jpg', title: 'Проект 5', desc: 'Короткое описание проекта в одно-два предложения, которое расскажет о задаче и решении.' },
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

function buildCards(slidesData){
  activeSlides = slidesData;
  cardsEl.innerHTML = '';
  dotsEl.innerHTML = '';
  cardEls = [];
  current = 0;

  slidesData.forEach((slide, i) => {
    const card = document.createElement('div');
card.className = slide.type === 'photo' ? 'card card-photo' : 'card';

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
    el.style.transform = 'translate(-50%, -50%)';
    el.style.opacity = isCurrent ? 1 : 0;
    el.style.pointerEvents = isCurrent ? 'auto' : 'none';
    el.style.zIndex = isCurrent ? 100 : 0;

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

function openCase(){
  stackEl.classList.add('case-open');
  caseContentEl.scrollTop = 0;
}
function closeCase(){
  stackEl.classList.remove('case-open');
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
let dragMoved = false;
let dragLock = false;

function dragStart(y) {
  dragStartY = y;
  dragMoved = false;
  viewportEl.classList.add('grabbing');
}
function dragMove(y) {
  if (dragStartY === null || dragLock) return;
  const diff = dragStartY - y;
  if (Math.abs(diff) > 6) dragMoved = true;
  if (Math.abs(diff) > 70) {
    dragLock = true;
    goTo(current + (diff > 0 ? 1 : -1));
    dragStartY = y;
    setTimeout(() => { dragLock = false; }, 350);
  }
}
function dragEnd() {
  dragStartY = null;
  viewportEl.classList.remove('grabbing');
}

viewportEl.addEventListener('pointerdown', (e) => {
  viewportEl.setPointerCapture(e.pointerId);
  dragStart(e.clientY);
});
viewportEl.addEventListener('pointermove', (e) => {
  if (e.buttons === 0) return;
  dragMove(e.clientY);
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
  if (insideCard) openCase();
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

bubbleBtn.addEventListener('click', function(e){
  if (socials.classList.contains('profile-open')) return; // в этом режиме кнопка = скачать CV, идём по ссылке как обычно
  e.preventDefault();
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

  socials.classList.remove('expanded');
  bubbleBtn.classList.remove('active', 'round');
  socials.classList.toggle('profile-open', isOpen);
  bubbleIcon.innerHTML = isOpen ? downloadIconSvg : bubbleIconSvg;

  stackEl.classList.toggle('photos', isOpen);
  render();

  const currentCard = cardEls[current];

  function onGrowEnd(evt){
    if (evt.propertyName !== 'width') return;
    currentCard.removeEventListener('transitionend', onGrowEnd);

    cardsEl.classList.add('fading');

    function onFadeOutEnd(evt2){
      if (evt2.propertyName !== 'opacity') return;
      cardsEl.removeEventListener('transitionend', onFadeOutEnd);

      buildCards(isOpen ? photoSlides : projectSlides);
      cardsEl.classList.remove('fading');
    }
    cardsEl.addEventListener('transitionend', onFadeOutEnd);
  }
  currentCard.addEventListener('transitionend', onGrowEnd);
});

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

function animateThread(){
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
    ctx.strokeStyle = `rgba(36, 84, 166, ${alpha})`;
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
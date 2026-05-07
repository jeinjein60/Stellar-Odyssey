// ============================================================
// src/ui.js — DOM rendering, screen transitions, chat rendering
// ============================================================

import { planetFacts } from './planet-facts.js';

// --------------- DOM References ---------------

export const dom = {
  // Screens
  screenTitle:      () => document.getElementById('screen-title'),
  screenTransition: () => document.getElementById('screen-transition'),
  screenGame:       () => document.getElementById('screen-game'),
  screenEnd:        () => document.getElementById('screen-end'),

  // Transition screen
  transTravel:      () => document.querySelector('.transition-travelling'),
  transArrive:      () => document.querySelector('.transition-arrive'),
  transPlanetName:  () => document.getElementById('trans-planet-name'),
  transPlanetAvatar:() => document.getElementById('trans-planet-avatar'),
  transGreeting:    () => document.getElementById('trans-greeting'),
  transTopic:       () => document.getElementById('trans-topic'),
  transDifficulty:  () => document.getElementById('trans-difficulty'),
  transAttempts:    () => document.getElementById('trans-attempts'),

  // Briefing
  btnViewBriefing:  () => document.getElementById('btn-view-briefing'),
  briefingScreen:   () => document.getElementById('briefing-screen'),
  briefingAvatar:   () => document.getElementById('briefing-avatar'),
  briefingName:     () => document.getElementById('briefing-name'),
  briefingSubtitle: () => document.getElementById('briefing-subtitle'),
  briefingOverview: () => document.getElementById('briefing-overview'),
  briefingStats:    () => document.getElementById('briefing-stats'),
  briefingContext:  () => document.getElementById('briefing-context'),
  briefingThink:    () => document.getElementById('briefing-think'),

  // Game header
  headerDot:        () => document.getElementById('header-dot'),
  headerName:       () => document.getElementById('header-name'),
  headerLevel:      () => document.getElementById('header-level'),
  statAttempts:     () => document.getElementById('stat-attempts'),
  statScore:        () => document.getElementById('stat-score'),

  // Teacher panel
  teacherAvatar:    () => document.getElementById('teacher-avatar'),
  teacherName:      () => document.getElementById('teacher-name'),
  infoTopic:        () => document.getElementById('info-topic'),
  infoDifficulty:   () => document.getElementById('info-difficulty'),
  infoQuestion:     () => document.getElementById('info-question'),
  sidebarFacts:     () => document.getElementById('sidebar-facts'),

  // Chat
  chatMessages:     () => document.getElementById('chat-messages'),
  chatInput:        () => document.getElementById('chat-input'),

  // Buttons
  btnStart:         () => document.getElementById('btn-start'),
  btnEnterLab:      () => document.getElementById('btn-enter-lab'),
  btnSend:          () => document.getElementById('btn-send'),
  btnHint:          () => document.getElementById('btn-hint'),
  btnSubmitAnswer:  () => document.getElementById('btn-submit-answer'),
  btnGiveUp:        () => document.getElementById('btn-give-up'),
  btnCancelAnswer:  () => document.getElementById('btn-cancel-answer'),
  btnConfirmAnswer: () => document.getElementById('btn-confirm-answer'),
  btnNextPlanet:    () => document.getElementById('btn-next-planet'),
  btnRestart:       () => document.getElementById('btn-restart'),

  // Modals
  modalAnswer:      () => document.getElementById('modal-answer'),
  modalResult:      () => document.getElementById('modal-result'),
  modalQuestion:    () => document.getElementById('modal-question'),
  answerInput:      () => document.getElementById('answer-input'),
  resultIcon:       () => document.getElementById('result-icon'),
  resultTitle:      () => document.getElementById('result-title'),
  resultFeedback:   () => document.getElementById('result-feedback'),
  resultMeta:       () => document.getElementById('result-meta'),

  // End screen
  endScore:         () => document.getElementById('end-score'),
  endSummary:       () => document.getElementById('end-summary'),
};

// --------------- Screen Management ---------------

export function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screenMap = {
    title:      dom.screenTitle(),
    transition: dom.screenTransition(),
    game:       dom.screenGame(),
    end:        dom.screenEnd(),
  };
  const target = screenMap[screenName];
  if (target) target.classList.add('active');
}

// --------------- Planet Theming ---------------

export function applyPlanetTheme(planet) {
  document.documentElement.style.setProperty('--planet-color', planet.color);
  document.documentElement.style.setProperty('--planet-color-dark', planet.colorDark);
}

// --------------- Transition Screen ---------------

export function renderTransition(planet, attempts) {
  const travel = dom.transTravel();
  const arrive = dom.transArrive();
  const briefing = dom.briefingScreen();

  // Reset: show travel, hide arrive and briefing
  travel.classList.remove('hidden');
  arrive.classList.add('hidden');
  briefing.classList.add('hidden');
  dom.transPlanetName().textContent = planet.name;

  // After delay, show arrival
  return new Promise((resolve) => {
    setTimeout(() => {
      travel.classList.add('hidden');
      arrive.classList.remove('hidden');

      // Planet avatar
      const avatar = dom.transPlanetAvatar();
      avatar.textContent = planet.emoji;
      avatar.setAttribute('data-planet', planet.id);

      // Greeting
      dom.transGreeting().textContent = `"${planet.greeting}"`;

      // Meta badges
      dom.transTopic().textContent = `${planet.experiment.stemTopic}`;
      dom.transDifficulty().textContent = `Difficulty ${planet.experiment.difficulty}/8`;
      dom.transAttempts().textContent = `${attempts} questions`;

      // Pre-render briefing content
      renderBriefing(planet);

      resolve();
    }, 2000);
  });
}

// --------------- Science Briefing ---------------

export function renderBriefing(planet) {
  const facts = planetFacts[planet.id];
  if (!facts) return;

  // Avatar
  const avatar = dom.briefingAvatar();
  avatar.textContent = planet.emoji;
  avatar.style.background = `radial-gradient(circle at 35% 35%, ${planet.color}, ${planet.colorDark})`;
  avatar.style.boxShadow = `0 0 20px ${planet.color}`;

  // Title
  dom.briefingName().textContent = planet.name;
  dom.briefingName().style.color = planet.color;
  dom.briefingSubtitle().textContent = facts.subtitle;
  dom.briefingOverview().textContent = facts.overview;

  // Stats
  const statsEl = dom.briefingStats();
  statsEl.innerHTML = facts.stats.map(s => `
    <div class="briefing-stat-row">
      <span class="briefing-stat-icon">${s.icon}</span>
      <span class="briefing-stat-label">${s.label}</span>
      <span class="briefing-stat-value">${s.value}</span>
      ${s.note ? `<span class="briefing-stat-note">(${s.note})</span>` : ''}
    </div>
  `).join('');

  // Context
  const contextEl = dom.briefingContext();
  contextEl.innerHTML = facts.keyContext.map(c => `<li>${c}</li>`).join('');

  // Think about
  dom.briefingThink().textContent = facts.thinkAbout;
}

export function showBriefing() {
  dom.transArrive().classList.add('hidden');
  dom.briefingScreen().classList.remove('hidden');
}

// --------------- Sidebar Facts (during gameplay) ---------------

export function renderSidebarFacts(planet) {
  const facts = planetFacts[planet.id];
  if (!facts) return;

  const container = dom.sidebarFacts();
  let html = '';

  // Compact stats
  html += `<div class="sidebar-section-label" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin-bottom:0.3rem;">📊 Key Data</div>`;
  facts.stats.forEach(s => {
    html += `
      <div class="sidebar-stat-row">
        <span class="sidebar-stat-icon">${s.icon}</span>
        <span class="sidebar-stat-label">${s.label}</span>
        <span class="sidebar-stat-value">${s.value}</span>
      </div>
    `;
  });

  // Key context
  html += `<div class="sidebar-section-label" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-dim);margin-top:0.6rem;margin-bottom:0.3rem;">🔍 Key Facts</div>`;
  facts.keyContext.forEach(c => {
    html += `<div class="sidebar-context-item">${c}</div>`;
  });

  container.innerHTML = html;
}

// --------------- Teacher Panel Tabs ---------------

export function initTeacherTabs() {
  const tabs = document.querySelectorAll('.teacher-tab');
  const contents = document.querySelectorAll('.teacher-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });
}

// --------------- Game Screen ---------------

export function renderGameHeader(planet, level, total, attempts, score) {
  dom.headerDot().style.background = planet.color;
  dom.headerDot().style.boxShadow = `0 0 8px ${planet.color}`;
  dom.headerName().textContent = planet.name;
  dom.headerLevel().textContent = `Level ${level} / ${total}`;
  dom.statAttempts().textContent = attempts;
  dom.statScore().textContent = score;
}

export function renderTeacherPanel(planet) {
  const avatar = dom.teacherAvatar();
  avatar.textContent = planet.emoji;
  avatar.setAttribute('data-planet', planet.id);

  dom.teacherName().textContent = planet.name;
  dom.teacherName().style.color = planet.color;
  dom.infoTopic().textContent = planet.experiment.stemTopic;
  dom.infoQuestion().textContent = planet.experiment.question;

  // Difficulty dots
  const dotsContainer = dom.infoDifficulty();
  dotsContainer.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i < planet.experiment.difficulty) dot.classList.add('filled');
    dotsContainer.appendChild(dot);
  }

  // Render sidebar facts
  renderSidebarFacts(planet);

  // Reset tabs to experiment tab
  document.querySelectorAll('.teacher-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.teacher-tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('.teacher-tab[data-tab="experiment"]').classList.add('active');
  document.getElementById('tab-experiment').classList.add('active');
}

export function updateAttempts(attempts) {
  dom.statAttempts().textContent = attempts;

  // Flash animation
  const el = dom.statAttempts();
  el.style.transition = 'transform 0.2s';
  el.style.transform = 'scale(1.3)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

export function updateScore(score) {
  dom.statScore().textContent = score;
}

// --------------- Chat Messages ---------------

export function clearChat() {
  dom.chatMessages().innerHTML = '';
}

export function addChatMessage(msg) {
  const container = dom.chatMessages();
  const div = document.createElement('div');
  div.classList.add('chat-msg', msg.type);

  if (msg.type === 'system') {
    div.textContent = msg.text;
  } else {
    const sender = document.createElement('div');
    sender.classList.add('msg-sender');
    sender.textContent = msg.type === 'teacher'
      ? `${msg.emoji || ''} ${msg.sender}`
      : `${msg.sender} 👨‍🚀`;

    const body = document.createElement('div');
    body.textContent = msg.text;

    div.appendChild(sender);
    div.appendChild(body);
  }

  container.appendChild(div);
  scrollChatToBottom();
  return div;
}

export function addTypingIndicator() {
  const container = dom.chatMessages();
  const div = document.createElement('div');
  div.classList.add('typing-indicator');
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(div);
  scrollChatToBottom();
}

export function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function scrollChatToBottom() {
  const container = dom.chatMessages();
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// --------------- Input State ---------------

export function disableInput() {
  dom.chatInput().disabled = true;
  dom.btnSend().disabled = true;
  dom.btnHint().disabled = true;
}

export function enableInput() {
  dom.chatInput().disabled = false;
  dom.btnSend().disabled = false;
  dom.btnHint().disabled = false;
  dom.chatInput().focus();
}

export function clearInput() {
  dom.chatInput().value = '';
}

export function getInputValue() {
  return dom.chatInput().value.trim();
}

// --------------- Modals ---------------

export function showAnswerModal(question) {
  dom.modalQuestion().textContent = question;
  dom.answerInput().value = '';
  dom.modalAnswer().classList.remove('hidden');
  dom.answerInput().focus();
}

export function hideAnswerModal() {
  dom.modalAnswer().classList.add('hidden');
}

export function getAnswerValue() {
  return dom.answerInput().value.trim();
}

export function showResultModal(correct, feedback, planet, isLast) {
  dom.resultIcon().textContent = correct ? '✅' : '❌';
  dom.resultTitle().textContent = correct ? 'Correct!' : 'Not Quite!';
  dom.resultFeedback().textContent = feedback;
  dom.resultMeta().textContent = correct
    ? '+1 question attempt on the next planet!'
    : '-1 question attempt on the next planet.';

  dom.btnNextPlanet().textContent = isLast ? 'See Results' : 'Next Planet →';
  dom.modalResult().classList.remove('hidden');
}

export function hideResultModal() {
  dom.modalResult().classList.add('hidden');
}

// --------------- End Screen ---------------

export function renderEndScreen(stats) {
  dom.endScore().textContent = stats.score;

  const summary = dom.endSummary();
  summary.innerHTML = '';

  stats.results.forEach(r => {
    const chip = document.createElement('div');
    chip.classList.add('end-planet-chip', r.correct ? 'correct' : 'wrong');
    chip.innerHTML = `${r.emoji} ${r.planetName} ${r.correct ? '✓' : '✗'}`;
    summary.appendChild(chip);
  });
}

// --------------- Mobile Chat Data Attrs ---------------

export function setChatDataAttrs(planet) {
  const msgs = dom.chatMessages();
  msgs.setAttribute('data-planet-emoji', planet.emoji);
  msgs.setAttribute('data-planet-name', planet.name);
}
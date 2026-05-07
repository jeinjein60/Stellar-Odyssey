// ============================================================
// src/main.js — App entry point, event binding, game flow
// Integrates Q&A chat with simulation unlock system
// ============================================================

import * as game from './game.js';
import * as chat from './chat.js';
import * as ui from './ui.js';
import { renderSimulation } from './sim-renderers.js';
import { initPortalBridge, fetchGameData, saveGameData } from './portalBridge.js';

// ===================== TUTORIAL DATA =====================

const TUTORIAL_DATA = {
  systemPrompt: `You are the Sun, a warm and patient star teacher in a tutorial for a space science lab game for students.

PERSONALITY: Warm, radiant, encouraging. Use light and warmth metaphors. Be simple and clear — this is a beginner tutorial.

THE TUTORIAL QUESTION: "Why is the Sun a star and not a planet?"
THE ANSWER — students must cover these 3 key concepts:
1. Nuclear Fusion — The Sun produces its own energy by fusing hydrogen into helium. Planets cannot do this.
2. Gravity — The Sun's enormous mass creates gravity that holds all planets in orbit around it.
3. Light and Heat Radiation — The Sun emits its own light and thermal energy. Planets only reflect the Sun's light, they don't produce it.

YOUR ROLE:
- Be very clear, simple, and encouraging (this is a beginner tutorial)
- Guide the student toward ALL THREE concepts: nuclear fusion, gravity, and light/heat radiation
- If they haven't mentioned all 3 yet, gently nudge them: "Have you thought about how I produce my energy? Or what my light and heat are called?"
- Keep responses to 2-3 sentences
- Celebrate when they mention a concept: "Yes! That's one of the key ideas!"
- When they seem to understand all 3, say: "You've discovered all three key concepts — nuclear fusion, gravity, and radiation! Go ahead and submit your answer using the button below!"`,

  keyConcepts: [
    {
      label: '⚛️ Nuclear Fusion',
      keywords: ['fusion', 'nuclear', 'hydrogen', 'helium', 'fuse', 'fusing', 'energy'],
      labTitle: '⚛️ Nuclear Fusion Lab',
      labDesc: 'Nuclear Fusion is how the Sun produces energy — by fusing hydrogen atoms into helium at extremely high temperatures and pressure. This process releases enormous amounts of energy as light and heat. This is what makes the Sun (and all stars) fundamentally different from planets — planets cannot create energy through nuclear fusion!',
    },
    {
      label: '🌀 Gravity',
      keywords: ['gravity', 'gravitational', 'mass', 'orbit', 'orbiting', 'massive'],
      labTitle: '🌀 Gravity Lab',
      labDesc: "The Sun's mass is about 333,000 times Earth's mass, so enormous that its gravitational pull keeps all 8 planets in orbit. The Sun contains 99.86% of all the mass in our solar system! Without the Sun's gravity, every planet would fly off into deep space.",
    },
    {
      label: '💡 Light & Heat Radiation',
      keywords: ['light', 'heat', 'radiation', 'radiat', 'emit', 'glow', 'shine', 'bright', 'thermal'],
      labTitle: '💡 Radiation Lab',
      labDesc: "The Sun emits light and heat (thermal energy) that travels 93 million miles across space to reach Earth. This is called electromagnetic radiation. Crucially, planets don't produce their own light — they only reflect the Sun's light! That's why planets are visible in the sky but don't twinkle like stars do.",
    },
  ],
};

// Keyword sets for tracking the first 3 key concepts per planet
const PLANET_CONCEPT_KEYWORDS = {
  mercury: [
    ['gravity', 'gravitational', 'mass'],       // low gravity
    ['escape', 'velocity'],                       // escape velocity
    ['solar wind', 'solar', 'wind'],             // solar wind
  ],
  venus: [
    ['greenhouse', 'green house'],               // greenhouse effect
    ['co2', 'carbon', 'dioxide'],               // CO2
    ['atmosphere', 'atmospheric'],               // thick atmosphere
  ],
  earth: [
    ['tidal', 'tide', 'tides'],                 // tidal force
    ['cube', 'cubed', 'inverse cube'],          // inverse cube law
    ['gravity', 'gravitational', 'pull'],        // gravitational pull
  ],
  mars: [
    ['perchlorate', 'toxic', 'poison'],         // perchlorates
    ['atmosphere', 'pressure', 'thin'],         // thin atmosphere
    ['water', 'liquid'],                         // no liquid water
  ],
  jupiter: [
    ['surface', 'land', 'solid'],               // no solid surface
    ['friction'],                                // no friction from land
    ['heat', 'internal'],                        // internal heat
  ],
  saturn: [
    ['roche'],                                   // Roche limit
    ['tidal', 'tides'],                         // tidal forces
    ['ice', 'icy', 'frozen'],                   // ice particles
  ],
  uranus: [
    ['impact', 'collision', 'crash', 'collide'], // giant impact
    ['angular', 'momentum'],                     // angular momentum
    ['tilt', 'axis', 'axial'],                  // axial tilt
  ],
  neptune: [
    ['heat', 'internal'],                        // internal heat
    ['contraction', 'contracting'],              // gravitational contraction
    ['friction'],                                // low friction
  ],
};

// ===================== SAVE HELPER =====================

function persist(extraFields = {}) {
  saveGameData({ ...game.getSaveData(), ...extraFields });
}

// ===================== TUTORIAL STATE =====================

let tutorialConceptsDetected = new Set();
let tutorialChatHistory = [];
let tutorialCompleted = false;

// ===================== GAME CONCEPT TRACKING STATE =====================

let gameConceptsDetected = new Set();

function resetGameConcepts() {
  gameConceptsDetected = new Set();
}

// ===================== INIT =====================

async function init() {
  bindEvents();
  initPortalBridge();

  // Attempt to load saved progress from the portal
  let saved = {};
  try {
    saved = await fetchGameData(4000);
  } catch {
    // Not inside iframe, no data yet, or portal timed out — start fresh
  }

  if (saved && typeof saved.currentPlanetIndex === 'number') {
    // Restore completed-tutorial flag
    if (saved.tutorialCompleted) tutorialCompleted = true;

    // Restore game state
    game.restoreState(saved);

    // Resume at the right screen
    const screen = saved.screen;
    if (screen === 'end') {
      ui.renderEndScreen(game.getFinalStats());
      ui.showScreen('end');
    } else if (screen === 'game' || screen === 'transition') {
      const planet = game.currentPlanet();
      ui.applyPlanetTheme(planet);
      ui.showScreen('transition');
      ui.renderTransition(planet, game.state.attempts);
    } else {
      ui.showScreen('title');
    }
  } else {
    ui.showScreen('title');
  }
}

// ===================== EVENT BINDING =====================

function bindEvents() {
  // Title screen
  ui.dom.btnStart().addEventListener('click', handleStart);

  // Tutorial events
  document.getElementById('tutorial-btn-skip').addEventListener('click', handleTutorialSkip);
  document.getElementById('tutorial-btn-start-mission').addEventListener('click', handleTutorialComplete);
  document.getElementById('tutorial-btn-send').addEventListener('click', handleTutorialSend);
  document.getElementById('tutorial-chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTutorialSend(); }
  });
  document.getElementById('tutorial-btn-submit').addEventListener('click', handleTutorialOpenAnswer);
  document.querySelectorAll('.tutorial-lab-btn').forEach(btn => {
    btn.addEventListener('click', () => openTutorialLab(parseInt(btn.dataset.lab)));
  });
  document.getElementById('tutorial-lab-close').addEventListener('click', () => {
    document.getElementById('modal-tutorial-lab').classList.add('hidden');
  });
  document.getElementById('tutorial-btn-cancel-answer').addEventListener('click', () => {
    document.getElementById('modal-tutorial-answer').classList.add('hidden');
  });
  document.getElementById('tutorial-btn-confirm-answer').addEventListener('click', handleTutorialSubmitAnswer);

  // Transition screen — "View Science Briefing" button
  ui.dom.btnViewBriefing().addEventListener('click', handleViewBriefing);

  // Briefing screen — "Enter the Lab" button
  ui.dom.btnEnterLab().addEventListener('click', handleEnterLab);

  // Game screen
  ui.dom.btnSend().addEventListener('click', handleSendQuestion);
  ui.dom.chatInput().addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  });
  ui.dom.btnHint().addEventListener('click', handleHint);
  ui.dom.btnSubmitAnswer().addEventListener('click', handleOpenAnswerModal);
  ui.dom.btnGiveUp().addEventListener('click', handleGiveUp);

  // Answer modal
  ui.dom.btnCancelAnswer().addEventListener('click', () => ui.hideAnswerModal());
  ui.dom.btnConfirmAnswer().addEventListener('click', handleSubmitAnswer);
  ui.dom.modalAnswer().querySelector('.modal-backdrop').addEventListener('click', () => ui.hideAnswerModal());

  // Result modal
  ui.dom.btnNextPlanet().addEventListener('click', handleNextPlanet);

  // End screen
  ui.dom.btnRestart().addEventListener('click', handleRestart);

  // Teacher panel tabs
  ui.initTeacherTabs();
}

// ===================== FLOW HANDLERS =====================

// --- Start Game (shows tutorial first, skips if already seen) ---
function handleStart() {
  if (tutorialCompleted) {
    startRealGame();
  } else {
    openTutorial();
  }
}

async function startRealGame() {
  game.startGame();
  persist({ tutorialCompleted });
  const planet = game.currentPlanet();
  ui.applyPlanetTheme(planet);
  ui.showScreen('transition');
  await ui.renderTransition(planet, game.state.attempts);
}

// --- View Science Briefing ---
function handleViewBriefing() {
  ui.showBriefing();
}

// --- Enter Lab ---
function handleEnterLab() {
  resetGameConcepts();
  const planet = game.currentPlanet();
  const progress = game.getProgress();

  // Render game screen
  ui.renderGameHeader(planet, progress.current, progress.total, progress.attempts, progress.score);
  ui.renderTeacherPanel(planet);
  ui.setChatDataAttrs(planet);
  ui.clearChat();

  // Render initial simulation panel (empty — all tools hidden)
  renderSimPanel();

  // Get initial messages
  const messages = game.enterLab();
  messages.forEach(msg => {
    ui.addChatMessage({
      ...msg,
      emoji: msg.type === 'teacher' ? planet.emoji : undefined,
    });
  });

  ui.showScreen('game');
  ui.enableInput();

  // Reset hint button
  const hintBtn = ui.dom.btnHint();
  hintBtn.disabled = false;
  hintBtn.textContent = 'Ask for a Hint';
}

// --- Send Question ---
async function handleSendQuestion() {
  const input = ui.getInputValue();
  if (!input || !game.canAsk()) return;

  // Use an attempt
  game.useAttempt();
  ui.clearInput();
  ui.updateAttempts(game.state.attempts);

  // Show student message
  const planet = game.currentPlanet();
  ui.addChatMessage({
    type: 'student',
    sender: 'You',
    text: input,
  });

  // *** CHECK FOR SIMULATION UNLOCKS ***
  const newlyUnlocked = game.checkForUnlocks(input);
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(tool => {
      ui.addChatMessage({
        type: 'system',
        text: `Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
      });
    });
    // Re-render the simulation panel
    renderSimPanel();
  }

  // Disable while waiting
  ui.disableInput();
  ui.addTypingIndicator();

  // Build messages and call API
  const messages = game.buildAIMessages(input);
  const result = await chat.sendQuestion(messages);

  ui.removeTypingIndicator();

  // Show AI response
  game.recordAIResponse(result.reply);
  ui.addChatMessage({
    type: 'teacher',
    sender: planet.name,
    emoji: planet.emoji,
    text: result.reply,
  });

  // Check user's message for key concept mentions and show progress
  checkGameConceptProgress(input);

  // Also check the AI's response for unlock triggers (sometimes the AI
  // mentions concepts that should unlock tools)
  const aiUnlocks = game.checkForUnlocks(result.reply);
  if (aiUnlocks.length > 0) {
    aiUnlocks.forEach(tool => {
      ui.addChatMessage({
        type: 'system',
        text: `Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
      });
    });
    renderSimPanel();
  }

  // Update unlock progress in header
  updateUnlockBadge();

  // Check if out of attempts
  if (!game.canAsk()) {
    ui.addChatMessage({
      type: 'system',
      text: "No questions left! Submit your answer now, or give up to move on.",
    });
    ui.disableInput();
  } else {
    ui.enableInput();
  }
}

// --- Hint ---
function handleHint() {
  const hint = game.useHint();

  if (hint === null) {
    ui.addChatMessage({
      type: 'system',
      text: "You've already used your hint for this planet!",
    });
    return;
  }

  if (hint === false) {
    ui.addChatMessage({
      type: 'system',
      text: "No questions left to spend on a hint!",
    });
    return;
  }

  const planet = game.currentPlanet();
  ui.updateAttempts(game.state.attempts);

  ui.addChatMessage({
    type: 'system',
    text: "Hint requested! (cost: 1 question)",
  });

  ui.addChatMessage({
    type: 'teacher',
    sender: planet.name,
    emoji: planet.emoji,
    text: hint,
  });

  // Hint text might also trigger unlocks
  const unlocks = game.checkForUnlocks(hint);
  if (unlocks.length > 0) {
    unlocks.forEach(tool => {
      ui.addChatMessage({
        type: 'system',
        text: `Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
      });
    });
    renderSimPanel();
  }

  ui.dom.btnHint().disabled = true;
  ui.dom.btnHint().textContent = 'Hint Used';

  if (!game.canAsk()) {
    ui.addChatMessage({
      type: 'system',
      text: "No questions left! Submit your answer or give up.",
    });
    ui.disableInput();
  }
}

// --- Open Answer Modal ---
function handleOpenAnswerModal() {
  const planet = game.currentPlanet();
  ui.showAnswerModal(planet.experiment.question);
}

// --- Submit Answer ---
async function handleSubmitAnswer() {
  const answer = ui.getAnswerValue();
  if (!answer) return;

  const planet = game.currentPlanet();
  ui.hideAnswerModal();

  ui.addChatMessage({
    type: 'student',
    sender: 'You',
    text: `My answer: ${answer}`,
  });

  ui.disableInput();
  ui.addTypingIndicator();

  const result = await chat.evaluateAnswer(answer, planet, planet.experiment);

  ui.removeTypingIndicator();

  game.recordResult(result.correct);
  persist({ tutorialCompleted });

  ui.addChatMessage({
    type: 'teacher',
    sender: planet.name,
    emoji: planet.emoji,
    text: result.feedback,
  });

  const isLast = game.isLastPlanet();
  ui.showResultModal(result.correct, result.feedback, planet, isLast);
}

// --- Give Up ---
function handleGiveUp() {
  const planet = game.currentPlanet();

  game.recordResult(false);
  persist({ tutorialCompleted });

  ui.addChatMessage({
    type: 'system',
    text: "No worries — here's what you were looking for:",
  });
  ui.addChatMessage({
    type: 'teacher',
    sender: planet.name,
    emoji: planet.emoji,
    text: planet.experiment.acceptableAnswer,
  });

  const isLast = game.isLastPlanet();
  ui.showResultModal(
    false,
    `The answer was about ${planet.experiment.stemTopic.toLowerCase()}. Don't give up on your journey — every planet teaches you something new!`,
    planet,
    isLast
  );
}

// --- Next Planet ---
async function handleNextPlanet() {
  ui.hideResultModal();
  const next = game.advanceToNextPlanet();
  persist({ tutorialCompleted });

  if (next === 'end') {
    const stats = game.getFinalStats();
    ui.renderEndScreen(stats);
    ui.showScreen('end');
  } else {
    const planet = game.currentPlanet();
    ui.applyPlanetTheme(planet);
    ui.showScreen('transition');
    await ui.renderTransition(planet, game.state.attempts);
  }
}

// --- Restart ---
function handleRestart() {
  game.resetGame();
  tutorialCompleted = false;
  persist({ tutorialCompleted: false });
  ui.showScreen('title');
}

// ===================== SIMULATION PANEL =====================

function renderSimPanel() {
  const panel = document.getElementById('sim-panel');
  if (!panel) return;

  const tools = game.getCurrentToolStates();
  const { unlocked, total } = game.getUnlockProgress();

  // Header — only show count if at least one tool has been discovered
  let html = '';
  if (unlocked === 0) {
    html += `
      <div class="sim-header">
        <h3>Lab Tools</h3>
      </div>
      <p class="sim-empty-msg">No tools discovered yet.<br/>Ask the right questions to uncover hidden experiments!</p>
    `;
  } else {
    html += `
      <div class="sim-header">
        <h3>Lab Tools</h3>
        <span class="sim-unlock-count">${unlocked} discovered</span>
      </div>
    `;
  }

  // Only show UNLOCKED tools — locked tools are completely hidden
  tools.forEach(tool => {
    if (tool.unlocked) {
      html += `
        <div class="sim-tool-card unlocked" data-tool-id="${tool.id}">
          <div class="sim-tool-header">
            <span class="sim-tool-icon">${tool.icon}</span>
            <span class="sim-tool-name">${tool.name}</span>
            <span class="sim-tool-badge">NEW</span>
          </div>
          <p class="sim-tool-desc">${tool.description}</p>
          <button class="sim-tool-open btn-secondary" data-tool-id="${tool.id}">Open Tool →</button>
        </div>
      `;
    }
  });

  panel.innerHTML = html;

  // Bind "Open Tool" buttons
  panel.querySelectorAll('.sim-tool-open').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolId = btn.dataset.toolId;
      openSimModal(toolId, tools.find(t => t.id === toolId));
    });
  });

  updateUnlockBadge();
}

function openSimModal(toolId, tool) {
  let modal = document.getElementById('modal-sim');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-sim';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-card sim-modal-card">
        <div class="sim-modal-header">
          <h3 id="sim-modal-title"></h3>
          <button class="sim-modal-close btn-secondary">✕ Close</button>
        </div>
        <div id="sim-modal-body" class="sim-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    modal.querySelector('.sim-modal-close').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  modal.querySelector('#sim-modal-title').textContent = `${tool.icon} ${tool.name}`;
  const body = modal.querySelector('#sim-modal-body');
  renderSimulation(toolId, body);
  modal.classList.remove('hidden');
}

function updateUnlockBadge() {
  const { unlocked } = game.getUnlockProgress();
  const badge = document.getElementById('header-unlock-badge');
  if (badge) {
    badge.textContent = unlocked > 0 ? `🧪 ${unlocked}` : `🧪 —`;
  }
}

// ===================== TUTORIAL FUNCTIONS =====================

function openTutorial() {
  tutorialConceptsDetected = new Set();
  tutorialChatHistory = [];

  // Reset phases
  document.getElementById('tutorial-travel').classList.remove('hidden');
  document.getElementById('tutorial-interface').classList.add('hidden');
  document.getElementById('modal-tutorial').classList.remove('hidden');

  // Show travel animation for 2s then switch to tutorial interface
  setTimeout(showTutorialInterface, 2000);
}

function showTutorialInterface() {
  document.getElementById('tutorial-travel').classList.add('hidden');
  document.getElementById('tutorial-interface').classList.remove('hidden');

  // Reset footer buttons
  document.getElementById('tutorial-btn-submit').classList.remove('hidden');
  document.getElementById('tutorial-btn-start-mission').classList.add('hidden');

  // Clear and populate chat
  document.getElementById('tutorial-chat-messages').innerHTML = '';

  addTutorialMessage('teacher', '☀️ The Sun',
    "Welcome, space explorer! Before your real mission begins, let's practice here together. " +
    "Your question: Why am I a star and not a planet? " +
    "A complete answer covers 3 key concepts — try the lab buttons above or ask me questions to discover them. " +
    "When you're ready, hit \"Submit My Answer\"!");

  addTutorialMessage('teacher', '☀️ The Sun',
    "Here's a hint to get you started: think about where I get my energy, what my huge mass does to the planets around me, " +
    "and what kind of energy I send out into space. Ask me about any of these!");
}

function addTutorialMessage(type, sender, text) {
  const container = document.getElementById('tutorial-chat-messages');
  const div = document.createElement('div');
  div.classList.add('chat-msg', type);

  if (type === 'teacher' || type === 'student') {
    const senderEl = document.createElement('div');
    senderEl.classList.add('msg-sender');
    senderEl.textContent = type === 'teacher' ? sender : `${sender} 👨‍🚀`;
    const bodyEl = document.createElement('div');
    bodyEl.textContent = text;
    div.appendChild(senderEl);
    div.appendChild(bodyEl);
  } else {
    div.textContent = text;
  }

  container.appendChild(div);
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function setTutorialInputEnabled(enabled) {
  const input = document.getElementById('tutorial-chat-input');
  const sendBtn = document.getElementById('tutorial-btn-send');
  if (input) input.disabled = !enabled;
  if (sendBtn) sendBtn.disabled = !enabled;
}

function addTutorialTypingIndicator() {
  const container = document.getElementById('tutorial-chat-messages');
  const div = document.createElement('div');
  div.classList.add('typing-indicator');
  div.id = 'tutorial-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(div);
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function removeTutorialTypingIndicator() {
  const el = document.getElementById('tutorial-typing');
  if (el) el.remove();
}

async function handleTutorialSend() {
  const input = document.getElementById('tutorial-chat-input');
  const text = input.value.trim();
  if (!text || input.disabled) return;

  input.value = '';
  addTutorialMessage('student', 'You', text);
  checkTutorialConceptProgress(text);

  setTutorialInputEnabled(false);
  addTutorialTypingIndicator();

  tutorialChatHistory.push({ role: 'user', content: text });
  const messages = [
    { role: 'system', content: TUTORIAL_DATA.systemPrompt },
    ...tutorialChatHistory,
  ];

  const result = await chat.sendQuestion(messages);

  removeTutorialTypingIndicator();
  tutorialChatHistory.push({ role: 'assistant', content: result.reply });
  addTutorialMessage('teacher', '☀️ The Sun', result.reply);

  setTutorialInputEnabled(true);
  document.getElementById('tutorial-chat-input').focus();
}

function checkTutorialConceptProgress(message) {
  const lower = message.toLowerCase();
  const prevCount = tutorialConceptsDetected.size;

  TUTORIAL_DATA.keyConcepts.forEach((concept, idx) => {
    if (!tutorialConceptsDetected.has(idx) && concept.keywords.some(kw => lower.includes(kw))) {
      tutorialConceptsDetected.add(idx);
    }
  });

  const newCount = tutorialConceptsDetected.size;
  if (newCount > prevCount) {
    const labels = [...tutorialConceptsDetected].map(i => TUTORIAL_DATA.keyConcepts[i].label).join(' + ');
    const div = document.createElement('div');
    if (newCount >= 3) {
      div.classList.add('chat-msg', 'concept-complete');
      div.textContent = `✅ You've identified all 3 concepts: ${labels}! Submit your answer below!`;
    } else {
      div.classList.add('chat-msg', 'concept-progress');
      div.textContent = `🔬 ${newCount}/3 concepts identified: ${labels}${newCount === 2 ? ' — almost there!' : ' — keep exploring!'}`;
    }
    const container = document.getElementById('tutorial-chat-messages');
    container.appendChild(div);
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
  }
}

function openTutorialLab(conceptIndex) {
  const concept = TUTORIAL_DATA.keyConcepts[conceptIndex];
  if (!concept) return;
  document.getElementById('tutorial-lab-title').textContent = concept.labTitle;
  document.getElementById('tutorial-lab-desc').textContent = concept.labDesc;
  document.getElementById('modal-tutorial-lab').classList.remove('hidden');
}

function handleTutorialOpenAnswer() {
  document.getElementById('tutorial-answer-input').value = '';
  document.getElementById('modal-tutorial-answer').classList.remove('hidden');
}

function handleTutorialSubmitAnswer() {
  const answer = document.getElementById('tutorial-answer-input').value.trim();
  if (!answer) return;

  document.getElementById('modal-tutorial-answer').classList.add('hidden');
  addTutorialMessage('student', 'You', `My answer: ${answer}`);

  const result = evaluateTutorialAnswer(answer);
  const emoji = result.found >= 3 ? '✅' : result.found >= 2 ? '🟡' : '⚠️';
  addTutorialMessage('teacher', '☀️ The Sun', `${emoji} ${result.feedback}`);

  // Switch footer to "Start Mission" button
  document.getElementById('tutorial-btn-submit').classList.add('hidden');
  document.getElementById('tutorial-btn-start-mission').classList.remove('hidden');
}

function evaluateTutorialAnswer(answer) {
  const lower = answer.toLowerCase();
  let found = 0;
  const foundLabels = [];
  const missing = [];

  TUTORIAL_DATA.keyConcepts.forEach((concept) => {
    if (concept.keywords.some(kw => lower.includes(kw))) {
      found++;
      foundLabels.push(concept.label);
    } else {
      missing.push(concept.label);
    }
  });

  if (found === 3) {
    return {
      found,
      feedback: "Excellent! You covered all 3 key ideas — nuclear fusion, gravity, and light/heat radiation! That's exactly what makes me a star. You're ready for your real mission!",
    };
  } else if (found === 2) {
    return {
      found,
      feedback: `Good effort! You mentioned ${foundLabels.join(' and ')}, but a complete answer also covers ${missing[0]}. You've got the idea — let's start your mission!`,
    };
  } else {
    return {
      found,
      feedback: `Good try! The 3 key reasons I'm a star: (1) nuclear fusion — I make my own energy, (2) gravity — my huge mass holds the solar system together, (3) I emit light and heat radiation. Let's head to your real mission!`,
    };
  }
}

function handleTutorialSkip() {
  tutorialCompleted = true;
  document.getElementById('modal-tutorial').classList.add('hidden');
  startRealGame();
}

async function handleTutorialComplete() {
  tutorialCompleted = true;
  document.getElementById('modal-tutorial').classList.add('hidden');
  await startRealGame();
}

// ===================== GAME CONCEPT TRACKING =====================

function checkGameConceptProgress(userMessage) {
  const planet = game.currentPlanet();
  const keywords = PLANET_CONCEPT_KEYWORDS[planet.id];
  if (!keywords) return;

  const lower = userMessage.toLowerCase();
  const prevCount = gameConceptsDetected.size;

  keywords.forEach((kws, idx) => {
    if (!gameConceptsDetected.has(idx) && kws.some(kw => lower.includes(kw.toLowerCase()))) {
      gameConceptsDetected.add(idx);
    }
  });

  const newCount = gameConceptsDetected.size;
  if (newCount <= prevCount) return;

  const container = ui.dom.chatMessages();
  const div = document.createElement('div');

  if (newCount >= 3) {
    div.classList.add('chat-msg', 'concept-complete');
    div.textContent = '✅ You\'ve identified all 3 key concepts! Hit "Submit My Answer" to lock in your final answer!';
  } else {
    div.classList.add('chat-msg', 'concept-progress');
    div.textContent = `🔬 ${newCount}/3 key concepts identified in your exploration!${newCount === 2 ? ' Almost there!' : ' Keep investigating...'}`;
  }

  container.appendChild(div);
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

// ===================== BOOT =====================

document.addEventListener('DOMContentLoaded', init);
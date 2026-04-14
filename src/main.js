// ============================================================
// src/main.js — App entry point, event binding, game flow
// Integrates Q&A chat with simulation unlock system
// ============================================================

import * as game from './game.js';
import * as chat from './chat.js';
import * as ui from './ui.js';
import { renderSimulation } from './sim-renderers.js';

// ===================== INIT =====================

function init() {
  bindEvents();
  ui.showScreen('title');
}

// ===================== EVENT BINDING =====================

function bindEvents() {
  // Title screen
  ui.dom.btnStart().addEventListener('click', handleStart);

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

// --- Start Game ---
async function handleStart() {
  game.startGame();
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
  hintBtn.textContent = '💡 Ask for a Hint';
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
        text: `🔓 Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
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

  // Also check the AI's response for unlock triggers (sometimes the AI
  // mentions concepts that should unlock tools)
  const aiUnlocks = game.checkForUnlocks(result.reply);
  if (aiUnlocks.length > 0) {
    aiUnlocks.forEach(tool => {
      ui.addChatMessage({
        type: 'system',
        text: `🔓 Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
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
      text: "⚠️ No questions left! Submit your answer now, or give up to move on.",
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
      text: "💡 You've already used your hint for this planet!",
    });
    return;
  }

  if (hint === false) {
    ui.addChatMessage({
      type: 'system',
      text: "⚠️ No questions left to spend on a hint!",
    });
    return;
  }

  const planet = game.currentPlanet();
  ui.updateAttempts(game.state.attempts);

  ui.addChatMessage({
    type: 'system',
    text: "💡 Hint requested! (cost: 1 question)",
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
        text: `🔓 Lab Tool Unlocked: ${tool.icon} ${tool.name}!`,
      });
    });
    renderSimPanel();
  }

  ui.dom.btnHint().disabled = true;
  ui.dom.btnHint().textContent = '💡 Hint Used';

  if (!game.canAsk()) {
    ui.addChatMessage({
      type: 'system',
      text: "⚠️ No questions left! Submit your answer or give up.",
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
    text: `📝 My answer: ${answer}`,
  });

  ui.disableInput();
  ui.addTypingIndicator();

  const result = await chat.evaluateAnswer(answer, planet);

  ui.removeTypingIndicator();

  game.recordResult(result.correct);

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

  ui.addChatMessage({
    type: 'system',
    text: "🏳️ No worries — here's what you were looking for:",
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
        <h3>🧪 Lab Tools</h3>
      </div>
      <p class="sim-empty-msg">No tools discovered yet.<br/>Ask the right questions to uncover hidden experiments!</p>
    `;
  } else {
    html += `
      <div class="sim-header">
        <h3>🧪 Lab Tools</h3>
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

// ===================== BOOT =====================

document.addEventListener('DOMContentLoaded', init);
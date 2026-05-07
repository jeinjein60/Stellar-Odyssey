// ============================================================
// src/game.js — Core game state machine & logic
// ============================================================

import { planets } from './planets.js';
import { checkUnlocks, resetTools, resetAllTools, getToolStates, getUnlockedCount } from './simulations.js';

const BASE_ATTEMPTS = 10;
const MIN_ATTEMPTS = 3;

// Game state — single source of truth
export const state = {
  currentPlanetIndex: 0,
  attempts: BASE_ATTEMPTS,
  score: 0,
  results: [],          // { planetId, planetName, emoji, correct, attemptsUsed }
  chatHistory: [],      // { role: 'user'|'assistant'|'system', content }
  questionsAsked: 0,
  hintUsed: false,
  screen: 'title',      // 'title' | 'transition' | 'game' | 'end'
};

// --------------- Getters ---------------

export function currentPlanet() {
  return planets[state.currentPlanetIndex];
}

export function isLastPlanet() {
  return state.currentPlanetIndex >= planets.length - 1;
}

export function canAsk() {
  return state.attempts > 0;
}

export function getProgress() {
  return {
    current: state.currentPlanetIndex + 1,
    total: planets.length,
    planet: currentPlanet(),
    attempts: state.attempts,
    score: state.score,
  };
}

// --------------- Actions ---------------

export function startGame() {
  state.currentPlanetIndex = 0;
  state.attempts = BASE_ATTEMPTS;
  state.score = 0;
  state.results = [];
  state.chatHistory = [];
  state.questionsAsked = 0;
  state.hintUsed = false;
  state.screen = 'transition';
  resetAllTools();
}

export function enterLab() {
  const planet = currentPlanet();
  // Reset chat for this planet
  state.chatHistory = [];
  state.questionsAsked = 0;
  state.hintUsed = false;
  state.screen = 'game';

  // Build initial chat messages for display
  return [
    { type: 'teacher', sender: planet.name, text: planet.greeting },
    { type: 'system', text: `Lab Question: "${planet.experiment.question}"` },
    { type: 'teacher', sender: planet.name, text: getOpeningPrompt(planet) },
  ];
}

function getOpeningPrompt(planet) {
  const openers = [
    `Go ahead — ask me anything to start investigating! You have ${state.attempts} questions. When you think you know the answer, hit "Submit My Answer."`,
    `Start asking questions to figure this out! You've got ${state.attempts} tries. I'll guide you, but I won't just GIVE you the answer...`,
    `Your mission: figure out the answer by questioning me. ${state.attempts} questions available. I'll point you in the right direction!`,
  ];
  return openers[planet.experiment.difficulty % openers.length];
}

export function useAttempt() {
  if (state.attempts > 0) {
    state.attempts--;
    state.questionsAsked++;
    return true;
  }
  return false;
}

export function useHint() {
  if (state.attempts > 0 && !state.hintUsed) {
    state.attempts--;
    state.hintUsed = true;
    return currentPlanet().experiment.hint;
  } else if (state.hintUsed) {
    return null; // already used
  }
  return false; // no attempts
}

export function recordResult(correct) {
  const planet = currentPlanet();
  state.results.push({
    planetId: planet.id,
    planetName: planet.name,
    emoji: planet.emoji,
    correct,
    questionsUsed: state.questionsAsked,
  });

  if (correct) {
    state.score++;
  }
}

export function advanceToNextPlanet() {
  const lastResult = state.results[state.results.length - 1];
  const wasCorrect = lastResult?.correct ?? false;

  // Each level resets to BASE_ATTEMPTS, then ±1 based on previous result
  const adjustment = wasCorrect ? 1 : -1;
  state.attempts = Math.max(MIN_ATTEMPTS, BASE_ATTEMPTS + adjustment);

  if (isLastPlanet()) {
    state.screen = 'end';
    return 'end';
  }

  state.currentPlanetIndex++;
  state.chatHistory = [];
  state.questionsAsked = 0;
  state.hintUsed = false;
  state.screen = 'transition';
  resetTools(currentPlanet().id);
  return 'transition';
}

export function resetGame() {
  state.currentPlanetIndex = 0;
  state.attempts = BASE_ATTEMPTS;
  state.score = 0;
  state.results = [];
  state.chatHistory = [];
  state.questionsAsked = 0;
  state.hintUsed = false;
  state.screen = 'title';
  resetAllTools();
}

// --------------- Simulation Unlock Helpers ---------------

// Check a student message for tool unlock triggers
// Returns array of newly unlocked tools
export function checkForUnlocks(message) {
  const planet = currentPlanet();
  return checkUnlocks(planet.id, message);
}

// Get current tool states for the active planet
export function getCurrentToolStates() {
  return getToolStates(currentPlanet().id);
}

// Get unlock progress for the active planet
export function getUnlockProgress() {
  return getUnlockedCount(currentPlanet().id);
}

// --------------- AI Message Helpers ---------------

// Build the messages array for the OpenAI API call
export function buildAIMessages(userMessage) {
  const planet = currentPlanet();

  // System message with planet personality + experiment context
  const systemMsg = {
    role: 'system',
    content: planet.systemPrompt,
  };

  // Append the new user message to history
  state.chatHistory.push({ role: 'user', content: userMessage });

  // Build full messages array
  const messages = [systemMsg, ...state.chatHistory];

  return messages;
}

// Store the AI's response in history
export function recordAIResponse(response) {
  state.chatHistory.push({ role: 'assistant', content: response });
}

// Get the final stats for end screen
export function getFinalStats() {
  return {
    score: state.score,
    total: planets.length,
    results: state.results,
    percentage: Math.round((state.score / planets.length) * 100),
  };
}

// Return a plain object safe to persist via the portal bridge
export function getSaveData() {
  return {
    currentPlanetIndex: state.currentPlanetIndex,
    score: state.score,
    results: state.results,
    attempts: state.attempts,
    questionsAsked: state.questionsAsked,
    hintUsed: state.hintUsed,
    screen: state.screen,
  };
}

// Restore state from a portal save payload
export function restoreState(saved) {
  state.currentPlanetIndex = typeof saved.currentPlanetIndex === 'number' ? saved.currentPlanetIndex : 0;
  state.score             = typeof saved.score === 'number'             ? saved.score             : 0;
  state.results           = Array.isArray(saved.results)                ? saved.results           : [];
  state.attempts          = typeof saved.attempts === 'number'          ? saved.attempts          : BASE_ATTEMPTS;
  state.questionsAsked    = typeof saved.questionsAsked === 'number'    ? saved.questionsAsked    : 0;
  state.hintUsed          = typeof saved.hintUsed === 'boolean'         ? saved.hintUsed          : false;
  state.chatHistory       = [];
  state.screen            = saved.screen ?? 'title';
  resetAllTools();
}
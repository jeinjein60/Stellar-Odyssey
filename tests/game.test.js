// ============================================================
// tests/game.test.js — Test 1: Game runs correctly
// Verifies the core state machine, attempt logic, and scoring.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  state,
  startGame,
  resetGame,
  useAttempt,
  useHint,
  recordResult,
  advanceToNextPlanet,
  isLastPlanet,
  getProgress,
  currentPlanet,
  enterLab,
  buildAIMessages,
  recordAIResponse,
  getFinalStats,
} from '../src/game.js';
import { planets } from '../src/planets.js';

describe('Test 1 — Game runs correctly', () => {
  beforeEach(() => resetGame());

  // --- Startup ---

  it('startGame sets 10 attempts, score 0, planet 0, screen transition', () => {
    startGame();
    expect(state.attempts).toBe(10);
    expect(state.currentPlanetIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.results).toHaveLength(0);
    expect(state.screen).toBe('transition');
  });

  it('resetGame returns to title screen with fully clean state', () => {
    startGame();
    state.score = 5;
    state.currentPlanetIndex = 3;
    resetGame();
    expect(state.score).toBe(0);
    expect(state.currentPlanetIndex).toBe(0);
    expect(state.screen).toBe('title');
    expect(state.attempts).toBe(10);
    expect(state.results).toHaveLength(0);
  });

  // --- Attempts ---

  it('useAttempt decrements attempts by 1 and returns true', () => {
    startGame();
    const before = state.attempts;
    const result = useAttempt();
    expect(result).toBe(true);
    expect(state.attempts).toBe(before - 1);
    expect(state.questionsAsked).toBe(1);
  });

  it('useAttempt returns false when attempts are already 0', () => {
    startGame();
    state.attempts = 0;
    expect(useAttempt()).toBe(false);
    expect(state.attempts).toBe(0);
  });

  it('useHint costs 1 attempt, returns the hint text, marks hintUsed', () => {
    startGame();
    const before = state.attempts;
    const hint = useHint();
    expect(hint).toBe(planets[0].experiment.hint);
    expect(state.attempts).toBe(before - 1);
    expect(state.hintUsed).toBe(true);
  });

  it('useHint returns null when hint was already used', () => {
    startGame();
    useHint();
    expect(useHint()).toBeNull();
  });

  // --- Scoring ---

  it('recordResult(true) increments score and stores correct result', () => {
    startGame();
    recordResult(true);
    expect(state.score).toBe(1);
    expect(state.results).toHaveLength(1);
    expect(state.results[0].correct).toBe(true);
    expect(state.results[0].planetName).toBe(planets[0].name);
  });

  it('recordResult(false) does not increment score, stores wrong result', () => {
    startGame();
    recordResult(false);
    expect(state.score).toBe(0);
    expect(state.results[0].correct).toBe(false);
  });

  // --- Attempt adjustment on planet advance ---

  it('correct answer → next planet starts with 11 attempts (10 + 1)', () => {
    startGame();
    recordResult(true);
    advanceToNextPlanet();
    expect(state.attempts).toBe(11);
  });

  it('wrong answer → next planet starts with 9 attempts (10 - 1)', () => {
    startGame();
    recordResult(false);
    advanceToNextPlanet();
    expect(state.attempts).toBe(9);
  });

  it('attempts always reset from BASE 10 — not cumulative across planets', () => {
    startGame();
    // Planet 1 correct → 11
    recordResult(true);
    advanceToNextPlanet();
    expect(state.attempts).toBe(11);
    // Planet 2 wrong → should be 10-1=9, not 11-1=10
    recordResult(false);
    advanceToNextPlanet();
    expect(state.attempts).toBe(9);
  });

  it('attempts never go below MIN_ATTEMPTS (3)', () => {
    startGame();
    state.attempts = 0;
    recordResult(false);
    advanceToNextPlanet();
    expect(state.attempts).toBeGreaterThanOrEqual(3);
  });

  // --- Navigation ---

  it('isLastPlanet returns false at planet 0', () => {
    startGame();
    expect(isLastPlanet()).toBe(false);
  });

  it('isLastPlanet returns true at last planet index', () => {
    startGame();
    state.currentPlanetIndex = planets.length - 1;
    expect(isLastPlanet()).toBe(true);
  });

  it('advanceToNextPlanet returns "end" and sets screen to end on last planet', () => {
    startGame();
    state.currentPlanetIndex = planets.length - 1;
    recordResult(true);
    const next = advanceToNextPlanet();
    expect(next).toBe('end');
    expect(state.screen).toBe('end');
  });

  it('advanceToNextPlanet increments planet index and returns "transition"', () => {
    startGame();
    recordResult(true);
    const next = advanceToNextPlanet();
    expect(next).toBe('transition');
    expect(state.currentPlanetIndex).toBe(1);
  });

  // --- Getters ---

  it('currentPlanet returns the planet at currentPlanetIndex', () => {
    startGame();
    expect(currentPlanet()).toBe(planets[0]);
    state.currentPlanetIndex = 4;
    expect(currentPlanet()).toBe(planets[4]);
  });

  it('getProgress returns correct current/total/attempts/score', () => {
    startGame();
    const p = getProgress();
    expect(p.current).toBe(1);
    expect(p.total).toBe(planets.length);
    expect(p.attempts).toBe(10);
    expect(p.score).toBe(0);
  });

  it('enterLab resets chat and returns greeting messages', () => {
    startGame();
    const messages = enterLab();
    expect(state.screen).toBe('game');
    expect(state.chatHistory).toHaveLength(0);
    expect(messages).toHaveLength(3);
    expect(messages[0].type).toBe('teacher');
    expect(messages[1].type).toBe('system');
  });

  // --- AI message building ---

  it('buildAIMessages adds user message to history and prepends system prompt', () => {
    startGame();
    state.chatHistory = [];
    const msgs = buildAIMessages('What is gravity?');
    expect(msgs[0].role).toBe('system');
    expect(msgs[msgs.length - 1].role).toBe('user');
    expect(msgs[msgs.length - 1].content).toBe('What is gravity?');
  });

  it('recordAIResponse appends assistant message to chatHistory', () => {
    startGame();
    state.chatHistory = [];
    recordAIResponse('Interesting question about gravity!');
    expect(state.chatHistory).toHaveLength(1);
    expect(state.chatHistory[0]).toEqual({ role: 'assistant', content: 'Interesting question about gravity!' });
  });

  // --- Final stats ---

  it('getFinalStats returns score, total, results, and percentage', () => {
    startGame();
    recordResult(true);
    recordResult(false);
    const stats = getFinalStats();
    expect(stats.score).toBe(1);
    expect(stats.total).toBe(planets.length);
    expect(Array.isArray(stats.results)).toBe(true);
    expect(typeof stats.percentage).toBe('number');
  });
});

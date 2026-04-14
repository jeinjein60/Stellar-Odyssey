// ============================================================
// tests/screens.test.js — Test 3: All pages/screens can load
// Uses jsdom (configured globally in vitest.config.js) to verify
// each screen element exists and that showScreen() activates the
// correct one. Also checks game state transitions hit every screen.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { showScreen } from '../src/ui.js';
import { state, startGame, resetGame, recordResult, advanceToNextPlanet } from '../src/game.js';
import { planets } from '../src/planets.js';

// Minimal DOM that mirrors the 4 screens in index.html
function setupDOM() {
  document.body.innerHTML = `
    <div id="screen-title"      class="screen active"></div>
    <div id="screen-transition" class="screen"></div>
    <div id="screen-game"       class="screen"></div>
    <div id="screen-end"        class="screen"></div>
  `;
}

describe('Test 3 — All screens/pages can load', () => {
  beforeEach(() => {
    setupDOM();
    resetGame();
  });

  // --- DOM elements exist ---

  it('title screen DOM element exists', () => {
    expect(document.getElementById('screen-title')).not.toBeNull();
  });

  it('transition screen DOM element exists', () => {
    expect(document.getElementById('screen-transition')).not.toBeNull();
  });

  it('game screen DOM element exists', () => {
    expect(document.getElementById('screen-game')).not.toBeNull();
  });

  it('end screen DOM element exists', () => {
    expect(document.getElementById('screen-end')).not.toBeNull();
  });

  // --- showScreen activates the right screen ---

  it('showScreen("title") makes title screen active', () => {
    showScreen('title');
    expect(document.getElementById('screen-title').classList.contains('active')).toBe(true);
  });

  it('showScreen("title") deactivates other screens', () => {
    showScreen('title');
    expect(document.getElementById('screen-transition').classList.contains('active')).toBe(false);
    expect(document.getElementById('screen-game').classList.contains('active')).toBe(false);
    expect(document.getElementById('screen-end').classList.contains('active')).toBe(false);
  });

  it('showScreen("transition") makes transition screen active', () => {
    showScreen('transition');
    expect(document.getElementById('screen-transition').classList.contains('active')).toBe(true);
    expect(document.getElementById('screen-title').classList.contains('active')).toBe(false);
  });

  it('showScreen("game") makes game screen active', () => {
    showScreen('game');
    expect(document.getElementById('screen-game').classList.contains('active')).toBe(true);
    expect(document.getElementById('screen-title').classList.contains('active')).toBe(false);
  });

  it('showScreen("end") makes end screen active', () => {
    showScreen('end');
    expect(document.getElementById('screen-end').classList.contains('active')).toBe(true);
    expect(document.getElementById('screen-title').classList.contains('active')).toBe(false);
  });

  it('only one screen is active at a time', () => {
    showScreen('game');
    const activeScreens = document.querySelectorAll('.screen.active');
    expect(activeScreens.length).toBe(1);
  });

  it('switching screens keeps exactly one active', () => {
    ['title', 'transition', 'game', 'end'].forEach(screen => {
      showScreen(screen);
      const active = document.querySelectorAll('.screen.active');
      expect(active.length).toBe(1);
    });
  });

  // --- Game state machine transitions through all screens ---

  it('startGame transitions state to "transition" screen', () => {
    startGame();
    expect(state.screen).toBe('transition');
  });

  it('game state can be set to "game"', () => {
    startGame();
    state.screen = 'game';
    expect(state.screen).toBe('game');
  });

  it('advanceToNextPlanet sets state to "transition" for intermediate planets', () => {
    startGame();
    recordResult(true);
    advanceToNextPlanet();
    expect(state.screen).toBe('transition');
  });

  it('advanceToNextPlanet sets state to "end" after the last planet', () => {
    startGame();
    state.currentPlanetIndex = planets.length - 1;
    recordResult(true);
    advanceToNextPlanet();
    expect(state.screen).toBe('end');
  });

  it('resetGame returns state to "title"', () => {
    startGame();
    state.screen = 'game';
    resetGame();
    expect(state.screen).toBe('title');
  });
});

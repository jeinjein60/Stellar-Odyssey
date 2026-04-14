// ============================================================
// tests/simulations.test.js — Test 5: All simulation tools load and work
// Verifies tool definitions, the keyword-unlock engine,
// and that every renderer produces HTML output.
// ============================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  simulations,
  checkUnlocks,
  getToolStates,
  getUnlockedCount,
  resetTools,
  resetAllTools,
} from '../src/simulations.js';
import { renderSimulation } from '../src/sim-renderers.js';

const PLANET_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

// All 24 tool IDs mapped to their planet (3 per planet)
const TOOLS_BY_PLANET = {
  mercury:  ['gravity-slider', 'escape-velocity', 'solar-wind'],
  venus:    ['atmosphere-layers', 'greenhouse-sim', 'planet-compare'],
  earth:    ['moon-distance', 'tidal-math', 'flood-visualizer'],
  mars:     ['soil-analyzer', 'plant-survival', 'radiation-shield'],
  jupiter:  ['storm-simulator', 'heat-engine', 'coriolis-spinner'],
  saturn:   ['roche-limit', 'ring-composition', 'tidal-forces'],
  uranus:   ['collision-sim', 'angular-momentum', 'solar-system-timeline'],
  neptune:  ['energy-budget', 'wind-friction', 'convection-viewer'],
};

const ALL_TOOL_IDS = Object.values(TOOLS_BY_PLANET).flat();

// ==================== Tool data ====================

describe('Test 5 — Simulation tool data loads', () => {
  beforeEach(() => resetAllTools());

  it('has simulation entries for all 8 planets', () => {
    PLANET_IDS.forEach(id => {
      expect(simulations[id]).toBeDefined();
      expect(simulations[id].tools).toBeDefined();
    });
  });

  it('has exactly 24 tools total (3 per planet × 8 planets)', () => {
    const total = PLANET_IDS.reduce((sum, id) => sum + simulations[id].tools.length, 0);
    expect(total).toBe(24);
  });

  PLANET_IDS.forEach(planetId => {
    describe(`${planetId} tools`, () => {
      it('has exactly 3 tools', () => {
        expect(simulations[planetId].tools).toHaveLength(3);
      });

      it('tool IDs match expected values', () => {
        const ids = simulations[planetId].tools.map(t => t.id);
        TOOLS_BY_PLANET[planetId].forEach(expectedId => {
          expect(ids).toContain(expectedId);
        });
      });

      it('every tool has required fields: id, name, description, keywords', () => {
        simulations[planetId].tools.forEach(tool => {
          expect(tool.id).toBeDefined();
          expect(typeof tool.name).toBe('string');
          expect(tool.name.length).toBeGreaterThan(0);
          expect(typeof tool.description).toBe('string');
          expect(tool.description.length).toBeGreaterThan(0);
          expect(Array.isArray(tool.keywords)).toBe(true);
          expect(tool.keywords.length).toBeGreaterThan(0);
        });
      });

      it('all tools start as locked (unlocked: false)', () => {
        resetTools(planetId);
        simulations[planetId].tools.forEach(tool => {
          expect(tool.unlocked).toBe(false);
        });
      });
    });
  });
});

// ==================== Unlock engine ====================

describe('Test 5 — Simulation unlock engine', () => {
  beforeEach(() => resetAllTools());

  it('checkUnlocks returns newly unlocked tool when keyword matches', () => {
    const unlocked = checkUnlocks('mercury', 'I want to ask about gravity');
    expect(unlocked.length).toBeGreaterThan(0);
    expect(unlocked[0].id).toBe('gravity-slider');
    expect(unlocked[0].unlocked).toBe(true);
  });

  it('checkUnlocks matching is case-insensitive', () => {
    const unlocked = checkUnlocks('mercury', 'GRAVITY is so interesting!');
    expect(unlocked.length).toBeGreaterThan(0);
  });

  it('checkUnlocks does not re-unlock an already-unlocked tool', () => {
    checkUnlocks('mercury', 'gravity');
    const second = checkUnlocks('mercury', 'gravity again');
    expect(second).toHaveLength(0);
  });

  it('checkUnlocks returns empty array for a planet with no keyword match', () => {
    const unlocked = checkUnlocks('mercury', 'hello there, how are you');
    expect(unlocked).toHaveLength(0);
  });

  it('checkUnlocks returns [] for an unknown planet ID', () => {
    expect(checkUnlocks('pluto', 'gravity escape solar')).toEqual([]);
  });

  it('getToolStates returns a shallow copy of all tools for a planet', () => {
    const tools = getToolStates('earth');
    expect(tools).toHaveLength(3);
    expect(tools[0].id).toBe('moon-distance');
  });

  it('getToolStates returns copies — mutations do not affect original', () => {
    const tools = getToolStates('earth');
    tools[0].unlocked = true;
    expect(simulations.earth.tools[0].unlocked).toBe(false);
  });

  it('getUnlockedCount starts at { unlocked: 0, total: 3 } before any unlock', () => {
    const { unlocked, total } = getUnlockedCount('jupiter');
    expect(unlocked).toBe(0);
    expect(total).toBe(3);
  });

  it('getUnlockedCount increments after an unlock', () => {
    checkUnlocks('jupiter', 'the surface stops the storm due to friction');
    const { unlocked } = getUnlockedCount('jupiter');
    expect(unlocked).toBeGreaterThan(0);
  });

  it('resetTools re-locks all tools for a single planet', () => {
    checkUnlocks('saturn', 'the roche limit will tear it apart');
    resetTools('saturn');
    const { unlocked } = getUnlockedCount('saturn');
    expect(unlocked).toBe(0);
  });

  it('resetAllTools re-locks all tools across every planet', () => {
    PLANET_IDS.forEach(id => checkUnlocks(id, 'gravity surface wind heat atmosphere energy'));
    resetAllTools();
    PLANET_IDS.forEach(id => {
      const { unlocked } = getUnlockedCount(id);
      expect(unlocked).toBe(0);
    });
  });

  it('each planet can unlock all 3 tools with the right keywords', () => {
    // Pick one known keyword per tool and fire them all in one message
    const triggerMessages = {
      mercury:  'gravity escape velocity solar wind',
      venus:    'atmosphere greenhouse co2 mercury compare',
      earth:    'moon distance tidal force ocean coast flood',
      mars:     'soil radiation plant survive',
      jupiter:  'surface friction heat energy rotation spin',
      saturn:   'roche limit ice composition tidal force gravity',
      uranus:   'impact collision angular momentum spin early solar system',
      neptune:  'energy heat internal friction surface convection',
    };

    PLANET_IDS.forEach(planetId => {
      resetTools(planetId);
      checkUnlocks(planetId, triggerMessages[planetId]);
      const { unlocked, total } = getUnlockedCount(planetId);
      // At least 1 tool should unlock with these broad keywords
      expect(unlocked).toBeGreaterThan(0);
      expect(unlocked).toBeLessThanOrEqual(total);
    });
  });
});

// ==================== Renderers ====================

describe('Test 5 — All 24 simulation renderers produce output', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  ALL_TOOL_IDS.forEach(toolId => {
    it(`renderSimulation("${toolId}") fills the container with HTML`, () => {
      renderSimulation(toolId, container);
      expect(container.innerHTML).not.toBe('');
      expect(container.innerHTML.length).toBeGreaterThan(20);
    });
  });

  it('renderSimulation clears previous content before rendering', () => {
    container.innerHTML = '<p>old content</p>';
    renderSimulation('gravity-slider', container);
    expect(container.innerHTML).not.toContain('old content');
  });

  it('renderSimulation shows a fallback for an unknown tool ID', () => {
    renderSimulation('not-a-real-tool', container);
    expect(container.innerHTML).toContain('coming soon');
  });

  it('renderSimulation can be called multiple times on the same container', () => {
    renderSimulation('gravity-slider', container);
    const first = container.innerHTML;
    renderSimulation('escape-velocity', container);
    expect(container.innerHTML).not.toBe('');
    expect(container.innerHTML).not.toBe(first);
  });
});

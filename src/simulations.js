// ============================================================
// src/simulations.js — Simulation definitions & unlock logic
// ============================================================
// Each planet has 2-3 interactive tools that start LOCKED.
// Tools unlock when the student asks about the right concepts.
// The AI checks each student message for keyword triggers.
// ============================================================

export const simulations = {
  mercury: {
    tools: [
      {
        id: 'gravity-slider',
        name: 'Gravity Well Launcher',
        icon: '🎯',
        description: 'Launch gas molecules and see if they escape Mercury\'s gravity.',
        unlockHint: 'Ask about gravity or mass...',
        keywords: ['gravity', 'mass', 'weight', 'pull', 'gravitational', 'heavy', 'light', 'attract'],
        unlocked: false,
      },
      {
        id: 'escape-velocity',
        name: 'Escape Velocity Calculator',
        icon: '🚀',
        description: 'Compare escape velocities across planets.',
        unlockHint: 'Ask about escape velocity or speed...',
        keywords: ['escape velocity', 'escape speed', 'fast enough', 'break free', 'leave the planet', 'velocity', 'speed to escape'],
        unlocked: false,
      },
      {
        id: 'solar-wind',
        name: 'Solar Wind Visualizer',
        icon: '☀️',
        description: 'See how solar wind strips away atmospheric particles.',
        unlockHint: 'Ask about the Sun\'s effect or solar wind...',
        keywords: ['solar wind', 'sun', 'radiation', 'strip', 'blow away', 'magnetic field', 'magnetosphere', 'solar'],
        unlocked: false,
      }
    ]
  },
  venus: {
    tools: [
      {
        id: 'atmosphere-layers',
        name: 'Atmosphere Builder',
        icon: '🌫️',
        description: 'Add/remove CO₂ layers and watch the temperature respond.',
        unlockHint: 'Ask about Venus\'s atmosphere...',
        keywords: ['atmosphere', 'co2', 'carbon dioxide', 'air', 'thick', 'dense', 'pressure', 'gas'],
        unlocked: false,
      },
      {
        id: 'greenhouse-sim',
        name: 'Greenhouse Effect Simulator',
        icon: '🌡️',
        description: 'Watch sunlight enter and infrared radiation get trapped.',
        unlockHint: 'Ask about heat trapping or the greenhouse effect...',
        keywords: ['greenhouse', 'trap', 'heat', 'infrared', 'radiation', 'warm', 'temperature', 'hot', 'blanket'],
        unlocked: false,
      },
      {
        id: 'planet-compare',
        name: 'Mercury vs Venus Comparison',
        icon: '⚖️',
        description: 'Side-by-side temperature comparison with atmosphere toggle.',
        unlockHint: 'Ask why Mercury is cooler despite being closer...',
        keywords: ['mercury', 'closer', 'compare', 'farther', 'distance', 'difference', 'both'],
        unlocked: false,
      }
    ]
  },
  earth: {
    tools: [
      {
        id: 'moon-distance',
        name: 'Moon Distance Slider',
        icon: '🌙',
        description: 'Drag the Moon closer and watch tidal bulges change.',
        unlockHint: 'Ask about the Moon\'s distance or gravity...',
        keywords: ['moon', 'distance', 'closer', 'far', 'gravity', 'pull', 'gravitational'],
        unlocked: false,
      },
      {
        id: 'tidal-math',
        name: 'Tidal Force Calculator',
        icon: '📐',
        description: 'See the inverse cube law in action with live math.',
        unlockHint: 'Ask about tidal forces or how they work...',
        keywords: ['tidal', 'tide', 'force', 'cube', 'inverse', 'formula', 'math', 'calculate', 'equation', 'law'],
        unlocked: false,
      },
      {
        id: 'flood-visualizer',
        name: 'Coastal Impact Simulator',
        icon: '🌊',
        description: 'See how extreme tides would affect coastlines.',
        unlockHint: 'Ask about what would happen to oceans or coasts...',
        keywords: ['ocean', 'coast', 'flood', 'water', 'sea level', 'shore', 'wave', 'damage', 'impact'],
        unlocked: false,
      }
    ]
  },
  mars: {
    tools: [
      {
        id: 'soil-analyzer',
        name: 'Soil Composition Scanner',
        icon: '🔬',
        description: 'Analyze Martian soil and discover what\'s in it.',
        unlockHint: 'Ask about Mars\'s soil or dirt...',
        keywords: ['soil', 'dirt', 'regolith', 'ground', 'mineral', 'composition', 'perchlorate', 'toxic', 'chemical'],
        unlocked: false,
      },
      {
        id: 'plant-survival',
        name: 'Plant Survival Lab',
        icon: '🌱',
        description: 'Toggle conditions and see if your plant survives.',
        unlockHint: 'Ask about what plants need to grow...',
        keywords: ['plant', 'grow', 'water', 'atmosphere', 'pressure', 'oxygen', 'photosynthesis', 'survive', 'greenhouse', 'dome'],
        unlocked: false,
      },
      {
        id: 'radiation-shield',
        name: 'UV Radiation Meter',
        icon: '☢️',
        description: 'Measure UV exposure on Mars vs Earth.',
        unlockHint: 'Ask about radiation or Mars\'s atmosphere protection...',
        keywords: ['radiation', 'uv', 'ultraviolet', 'ozone', 'shield', 'protect', 'sunlight', 'exposure'],
        unlocked: false,
      }
    ]
  },
  jupiter: {
    tools: [
      {
        id: 'storm-simulator',
        name: 'Storm Decay Simulator',
        icon: '🌪️',
        description: 'Toggle surface/friction and watch storms live or die.',
        unlockHint: 'Ask about what stops storms or surface...',
        keywords: ['surface', 'land', 'solid', 'friction', 'stop', 'die', 'decay', 'dissipate', 'storm', 'hurricane'],
        unlocked: false,
      },
      {
        id: 'heat-engine',
        name: 'Internal Heat Engine',
        icon: '🔥',
        description: 'Adjust internal heat and see atmospheric energy change.',
        unlockHint: 'Ask about Jupiter\'s energy source or heat...',
        keywords: ['heat', 'energy', 'internal', 'core', 'warm', 'contraction', 'source', 'power', 'fuel'],
        unlocked: false,
      },
      {
        id: 'coriolis-spinner',
        name: 'Coriolis Effect Spinner',
        icon: '🔄',
        description: 'Change rotation speed and see vortex stability.',
        unlockHint: 'Ask about Jupiter\'s rotation or spin...',
        keywords: ['rotation', 'spin', 'fast', 'day', 'coriolis', 'vortex', 'rotate', 'hours', '10 hour'],
        unlocked: false,
      }
    ]
  },
  saturn: {
    tools: [
      {
        id: 'roche-limit',
        name: 'Roche Limit Visualizer',
        icon: '💥',
        description: 'Drag a moon toward Saturn and watch it survive or shatter.',
        unlockHint: 'Ask about why rings don\'t form moons...',
        keywords: ['roche', 'limit', 'boundary', 'distance', 'close', 'tear', 'apart', 'break', 'shatter', 'form', 'clump'],
        unlocked: false,
      },
      {
        id: 'ring-composition',
        name: 'Ring Material Scanner',
        icon: '💎',
        description: 'Examine what the rings are actually made of.',
        unlockHint: 'Ask about what the rings are made of...',
        keywords: ['ice', 'rock', 'material', 'made of', 'composition', 'particle', 'dust', 'chunk', 'debris'],
        unlocked: false,
      },
      {
        id: 'tidal-forces',
        name: 'Tidal Force Tug-of-War',
        icon: '🤜',
        description: 'Visualize self-gravity vs tidal disruption forces.',
        unlockHint: 'Ask about gravity or forces on ring particles...',
        keywords: ['tidal force', 'gravity', 'self-gravity', 'pull', 'force', 'differential', 'near side', 'far side'],
        unlocked: false,
      }
    ]
  },
  uranus: {
    tools: [
      {
        id: 'collision-sim',
        name: 'Impact Simulator',
        icon: '☄️',
        description: 'Aim a protoplanet at Uranus and see the resulting tilt.',
        unlockHint: 'Ask about collisions or impacts...',
        keywords: ['impact', 'collision', 'hit', 'crash', 'smash', 'protoplanet', 'collide', 'strike', 'object'],
        unlocked: false,
      },
      {
        id: 'angular-momentum',
        name: 'Angular Momentum Lab',
        icon: '🔄',
        description: 'See how transferred momentum changes a planet\'s spin axis.',
        unlockHint: 'Ask about spin, momentum, or rotation...',
        keywords: ['angular momentum', 'momentum', 'spin', 'axis', 'tilt', 'rotation', 'conservation', 'transfer'],
        unlocked: false,
      },
      {
        id: 'solar-system-timeline',
        name: 'Early Solar System Timeline',
        icon: '⏳',
        description: 'Explore what the chaotic early solar system looked like.',
        unlockHint: 'Ask about when this happened or the early solar system...',
        keywords: ['early', 'young', 'formation', 'billion', 'years ago', 'when', 'history', 'solar system form', 'origin'],
        unlocked: false,
      }
    ]
  },
  neptune: {
    tools: [
      {
        id: 'energy-budget',
        name: 'Energy Budget Dashboard',
        icon: '📊',
        description: 'Compare solar input vs internal heat output.',
        unlockHint: 'Ask about Neptune\'s energy or heat...',
        keywords: ['energy', 'heat', 'internal', 'radiate', 'output', 'input', 'budget', 'more energy', 'less energy', 'sun energy'],
        unlocked: false,
      },
      {
        id: 'wind-friction',
        name: 'Wind & Friction Simulator',
        icon: '💨',
        description: 'Adjust surface friction and see wind speeds change.',
        unlockHint: 'Ask about friction, surface, or wind...',
        keywords: ['friction', 'surface', 'solid', 'wind', 'fast', 'speed', 'slow down', 'drag', 'resistance'],
        unlocked: false,
      },
      {
        id: 'convection-viewer',
        name: 'Convection Cell Viewer',
        icon: '🔃',
        description: 'Watch heat drive convection currents that power winds.',
        unlockHint: 'Ask about how heat creates wind or movement...',
        keywords: ['convection', 'current', 'circulation', 'movement', 'flow', 'rise', 'sink', 'cycle', 'drive', 'create wind'],
        unlocked: false,
      }
    ]
  }
};

// ============================================================
// Unlock Engine
// ============================================================

// Check a student's message against all locked tools for the current planet
// Returns an array of newly unlocked tool IDs
export function checkUnlocks(planetId, message) {
  const planetSims = simulations[planetId];
  if (!planetSims) return [];

  const msg = message.toLowerCase();
  const newlyUnlocked = [];

  planetSims.tools.forEach(tool => {
    if (tool.unlocked) return; // already unlocked

    const matched = tool.keywords.some(keyword => msg.includes(keyword));
    if (matched) {
      tool.unlocked = true;
      newlyUnlocked.push(tool);
    }
  });

  return newlyUnlocked;
}

// Get the current unlock state for a planet
export function getToolStates(planetId) {
  const planetSims = simulations[planetId];
  if (!planetSims) return [];
  return planetSims.tools.map(t => ({ ...t }));
}

// Count unlocked tools for a planet
export function getUnlockedCount(planetId) {
  const planetSims = simulations[planetId];
  if (!planetSims) return { unlocked: 0, total: 0 };
  const unlocked = planetSims.tools.filter(t => t.unlocked).length;
  return { unlocked, total: planetSims.tools.length };
}

// Reset all tools to locked (call when starting a new planet)
export function resetTools(planetId) {
  const planetSims = simulations[planetId];
  if (!planetSims) return;
  planetSims.tools.forEach(t => { t.unlocked = false; });
}

// Reset ALL planets' tools (call on game restart)
export function resetAllTools() {
  Object.keys(simulations).forEach(resetTools);
}
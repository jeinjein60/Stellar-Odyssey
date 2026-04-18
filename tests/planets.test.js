import { describe, it, expect } from 'vitest';
import { planets } from '../src/planets.js';
import { planetFacts } from '../src/planet-facts.js';

const PLANET_IDS = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const REQUIRED_PLANET_FIELDS = ['id', 'name', 'emoji', 'color', 'greeting', 'experiment', 'systemPrompt'];
const REQUIRED_EXPERIMENT_FIELDS = ['question', 'hint', 'keyConcepts', 'acceptableAnswer', 'difficulty'];
const REQUIRED_FACTS_FIELDS = ['subtitle', 'overview', 'stats', 'keyContext', 'thinkAbout'];

// tests for planets.js data structure and content
describe('Test 4 — Planet data (planets.js)', () => {
  it('exports exactly 8 planets', () => {
    expect(planets).toHaveLength(8);
  });

  it('covers all 8 solar system planets by ID', () => {
    const ids = planets.map(p => p.id);
    PLANET_IDS.forEach(id => expect(ids).toContain(id));
  });

  planets.forEach((planet) => {
    describe(`${planet.name || planet.id}`, () => {
      REQUIRED_PLANET_FIELDS.forEach(field => {
        it(`has required field: ${field}`, () => {
          expect(planet[field]).toBeDefined();
          expect(planet[field]).not.toBe('');
        });
      });

      REQUIRED_EXPERIMENT_FIELDS.forEach(field => {
        it(`experiment.${field} is defined`, () => {
          expect(planet.experiment[field]).toBeDefined();
        });
      });

      it('experiment.keyConcepts is a non-empty array', () => {
        expect(Array.isArray(planet.experiment.keyConcepts)).toBe(true);
        expect(planet.experiment.keyConcepts.length).toBeGreaterThan(0);
      });

      it('experiment.difficulty is a positive number', () => {
        expect(typeof planet.experiment.difficulty).toBe('number');
        expect(planet.experiment.difficulty).toBeGreaterThan(0);
      });

      it('systemPrompt is a meaningful string (> 50 characters)', () => {
        expect(typeof planet.systemPrompt).toBe('string');
        expect(planet.systemPrompt.length).toBeGreaterThan(50);
      });

      it('greeting is a non-empty string', () => {
        expect(typeof planet.greeting).toBe('string');
        expect(planet.greeting.length).toBeGreaterThan(0);
      });

      it('emoji is a single character / emoji string', () => {
        expect(typeof planet.emoji).toBe('string');
        expect(planet.emoji.length).toBeGreaterThan(0);
      });
    });
  });
});

// test cases for planet-facts.js data structure and content

describe('Test 4 — Planet facts (planet-facts.js)', () => {
  it('planetFacts has entries for all 8 planets', () => {
    expect(Object.keys(planetFacts)).toHaveLength(8);
  });

  it('planetFacts keys match planet IDs', () => {
    const factIds = Object.keys(planetFacts);
    PLANET_IDS.forEach(id => expect(factIds).toContain(id));
  });

  PLANET_IDS.forEach(id => {
    describe(`Facts: ${id}`, () => {
      it('entry exists', () => {
        expect(planetFacts[id]).toBeDefined();
      });

      REQUIRED_FACTS_FIELDS.forEach(field => {
        it(`has required field: ${field}`, () => {
          expect(planetFacts[id][field]).toBeDefined();
          expect(planetFacts[id][field]).not.toBe('');
        });
      });

      it('stats is a non-empty array', () => {
        expect(Array.isArray(planetFacts[id].stats)).toBe(true);
        expect(planetFacts[id].stats.length).toBeGreaterThan(0);
      });

      it('every stat entry has a label and value', () => {
        planetFacts[id].stats.forEach(stat => {
          expect(typeof stat.label).toBe('string');
          expect(stat.label.length).toBeGreaterThan(0);
          expect(typeof stat.value).toBe('string');
          expect(stat.value.length).toBeGreaterThan(0);
        });
      });

      it('keyContext is a non-empty array of strings', () => {
        expect(Array.isArray(planetFacts[id].keyContext)).toBe(true);
        expect(planetFacts[id].keyContext.length).toBeGreaterThan(0);
        planetFacts[id].keyContext.forEach(fact => {
          expect(typeof fact).toBe('string');
          expect(fact.length).toBeGreaterThan(0);
        });
      });

      it('thinkAbout is a non-empty string', () => {
        expect(typeof planetFacts[id].thinkAbout).toBe('string');
        expect(planetFacts[id].thinkAbout.length).toBeGreaterThan(0);
      });

      it('subtitle is a non-empty string', () => {
        expect(typeof planetFacts[id].subtitle).toBe('string');
        expect(planetFacts[id].subtitle.length).toBeGreaterThan(0);
      });
    });
  });
});

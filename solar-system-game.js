// ============================================================
// SOLAR SYSTEM LAB GAME — Full Project Setup
// ============================================================
// Tech: Vite + Vanilla JS + OpenAI API
// Hosting target: Render
// ============================================================

// ========================
// 📁 PROJECT STRUCTURE
// ========================
/*
solar-system-lab/
├── .env                  ← your OpenAI key (never committed)
├── .gitignore
├── package.json
├── vite.config.js
├── server.js             ← Express backend (proxies OpenAI calls)
├── index.html            ← Entry point
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js           ← App bootstrap
│   ├── game.js           ← Core game state & logic
│   ├── planets.js        ← Planet data & experiment configs
│   ├── chat.js           ← Chat UI + OpenAI integration
│   ├── ui.js             ← DOM rendering helpers
│   └── style.css         ← All styles
*/

// ========================
// 1. package.json
// ========================
const packageJson = {
  "name": "solar-system-lab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"node server.js\" \"vite\"",
    "build": "vite build",
    "start": "node server.js",
    "preview": "vite preview"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "concurrently": "^8.2.0"
  }
};

// ========================
// 2. .env (create this yourself — NEVER commit it)
// ========================
/*
OPENAI_API_KEY=sk-your-key-here
PORT=3001
*/

// ========================
// 3. .gitignore
// ========================
/*
node_modules
.env
dist
*/

// ========================
// 4. vite.config.js
// ========================
/*
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
*/

// ========================
// 5. server.js — Express backend (proxies OpenAI, keeps key safe)
// ========================
/*
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve built frontend in production
app.use(express.static(join(__dirname, 'dist')));

// POST /api/chat — proxy to OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, planet } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI proxy error:', err);
    res.status(500).json({ error: 'Failed to reach AI service.' });
  }
});

// POST /api/evaluate — check if the student's final answer is correct
app.post('/api/evaluate', async (req, res) => {
  try {
    const { answer, planet, experiment } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a science teacher evaluating a student's answer to a lab experiment about ${planet.name}.

The experiment question: "${experiment.question}"
The key concepts the answer MUST touch on: ${experiment.keyConcepts.join(', ')}
Acceptable answer summary: "${experiment.acceptableAnswer}"

Evaluate whether the student demonstrates understanding of the core concept.
Be encouraging but accurate. They don't need perfect wording — just the right idea.

Respond in this JSON format ONLY:
{
  "correct": true/false,
  "feedback": "your encouraging feedback here (2-3 sentences max)"
}`
          },
          {
            role: 'user',
            content: `Student's answer: "${answer}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Parse the JSON response
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer.' });
  }
});

// Catch-all for SPA routing in production
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
*/

// ========================
// 6. src/planets.js — All planet data + experiments
// ========================
/*
export const planets = [
  {
    id: 'mercury',
    name: 'Mercury',
    emoji: '🪨',
    color: '#b0b0b0',
    colorDark: '#6b6b6b',
    personality: 'Quick-talking, a bit jittery, always in a rush (fastest orbit!)',
    greeting: "Whew, you caught me! I zip around the Sun so fast I barely have time to chat. Welcome to my lab — it's a bit... barren out here.",
    experiment: {
      question: "Why does Mercury have almost no atmosphere despite being closest to the Sun?",
      hint: "Think about what it takes for a planet to hold onto gas molecules. What two forces are at play?",
      keyConcepts: ['low gravity', 'escape velocity', 'solar wind', 'small mass'],
      acceptableAnswer: "Mercury's gravity is too weak to hold onto gas molecules. Its low escape velocity means solar wind and heat easily strip away any atmosphere.",
      difficulty: 1,
      stemTopic: "Escape Velocity & Gravity"
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    emoji: '🌋',
    color: '#e8a735',
    colorDark: '#c4811a',
    personality: 'Dramatic, intense, a bit vain ("I AM the brightest planet in your sky!")',
    greeting: "Darling, welcome to my gorgeous, SCORCHING paradise! They say I'm Earth's twin, but honestly? I'm the hotter one. Let's see if you can figure out why...",
    experiment: {
      question: "Why is Venus hotter than Mercury, even though Venus is farther from the Sun?",
      hint: "I have something Mercury doesn't — a VERY thick atmosphere made mostly of CO₂. What does CO₂ do to heat?",
      keyConcepts: ['greenhouse effect', 'CO2', 'thick atmosphere', 'trapped heat', 'infrared radiation'],
      acceptableAnswer: "Venus's thick CO₂ atmosphere creates a runaway greenhouse effect — sunlight gets in, but infrared heat can't escape, trapping heat and making surface temps reach ~465°C.",
      difficulty: 2,
      stemTopic: "Greenhouse Effect & Atmospheric Science"
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    emoji: '🌍',
    color: '#4a90d9',
    colorDark: '#2d6db5',
    personality: 'Warm, nurturing, a bit worried about the environment',
    greeting: "Hey there, neighbor! You already live on me, but I bet there's a lot you don't know about how I work. Let's talk about my relationship with the Moon...",
    experiment: {
      question: "If the Moon were suddenly twice as close to Earth, what would happen to the ocean tides?",
      hint: "Tidal force doesn't just double when distance halves. There's a specific mathematical relationship — it involves the cube of something...",
      keyConcepts: ['tidal force', 'inverse cube law', 'gravitational pull', 'distance', 'eight times stronger'],
      acceptableAnswer: "Tidal forces follow an inverse cube law. If the Moon were half the distance, tides would be roughly 8 times stronger (2³ = 8), causing massive coastal flooding.",
      difficulty: 3,
      stemTopic: "Gravitational Tidal Forces"
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    emoji: '🔴',
    color: '#d44a2e',
    colorDark: '#a83520',
    personality: 'Rugged, adventurous, hopeful about visitors ("You ARE coming to visit, right?")',
    greeting: "Welcome to the Red Planet, future colonist! Everyone talks about living here, but nobody asks the hard questions. Let's do some real science about what it'd actually take...",
    experiment: {
      question: "Could we grow plants directly in Martian soil? What key challenges would we face?",
      hint: "Think about three things plants need: nutrients in soil, what's in the atmosphere, and... there's something toxic in my dirt.",
      keyConcepts: ['perchlorates', 'toxic soil', 'thin atmosphere', 'low CO2 pressure', 'no liquid water', 'radiation'],
      acceptableAnswer: "Martian soil contains toxic perchlorates that would need to be removed. The thin atmosphere has low pressure and minimal shielding from UV radiation. There's no liquid water on the surface. You'd need to process the soil and grow in a pressurized greenhouse.",
      difficulty: 4,
      stemTopic: "Soil Chemistry & Astrobiology"
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    emoji: '🟠',
    color: '#d4915e',
    colorDark: '#b06d3a',
    personality: 'Booming voice, confident, "largest in the room" energy',
    greeting: "WELCOME, tiny creature! I am the KING of planets. You could fit 1,300 of your little Earths inside me. Now, see that big red spot? It's been raging for centuries. Curious why?",
    experiment: {
      question: "Why has Jupiter's Great Red Spot storm lasted for hundreds of years without dying out?",
      hint: "On Earth, storms lose energy when they hit land or lose their heat source. What's different about me? Think about friction, energy sources, and my size...",
      keyConcepts: ['no solid surface', 'no friction from land', 'internal heat', 'Coriolis effect', 'fluid dynamics', 'energy from interior'],
      acceptableAnswer: "Jupiter has no solid surface to create friction, so storms don't lose energy to landfall. Internal heat from gravitational compression provides continuous energy, and Jupiter's rapid rotation creates strong Coriolis forces that stabilize large vortices.",
      difficulty: 5,
      stemTopic: "Fluid Dynamics & Atmospheric Physics"
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    emoji: '💍',
    color: '#e8d282',
    colorDark: '#c4a84e',
    personality: 'Elegant, proud of the rings, a bit of a show-off',
    greeting: "Ah, an admirer! Everyone loves my rings — and they should. But beauty and science go hand in hand. Do you know WHY I have rings instead of just another moon?",
    experiment: {
      question: "What are Saturn's rings made of, and why don't they clump together to form a moon?",
      hint: "There's a specific distance from any planet where tidal forces prevent objects from clumping. It has a name... and my rings sit right inside it.",
      keyConcepts: ['Roche limit', 'tidal forces', 'ice particles', 'orbital mechanics', 'gravity vs tidal disruption'],
      acceptableAnswer: "Saturn's rings are mostly ice and rock fragments orbiting within the Roche limit — the distance where Saturn's tidal forces are stronger than the self-gravity that would pull particles together into a moon. Inside this limit, any moon-sized body would be torn apart.",
      difficulty: 6,
      stemTopic: "Roche Limit & Orbital Mechanics"
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    emoji: '🫧',
    color: '#7de8e8',
    colorDark: '#4ab8b8',
    personality: 'Quirky, a bit sideways (literally), dry humor',
    greeting: "Yes yes, get the jokes out of your system. Done? Good. Now, notice anything odd about me? I'm literally rolling around the Sun on my side. Want to figure out why?",
    experiment: {
      question: "Why does Uranus rotate on its side with an axial tilt of ~98 degrees?",
      hint: "Something catastrophic must have happened long ago. Think about what could change an entire planet's spin axis, and what physics principle governs rotation...",
      keyConcepts: ['giant impact', 'angular momentum', 'axial tilt', 'collision', 'early solar system'],
      acceptableAnswer: "The leading theory is that a massive Earth-sized protoplanet collided with Uranus during the early solar system, transferring enough angular momentum to knock it onto its side. This would conserve angular momentum while dramatically changing the tilt axis.",
      difficulty: 7,
      stemTopic: "Angular Momentum & Planetary Formation"
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    emoji: '🌀',
    color: '#4466ee',
    colorDark: '#2244bb',
    personality: 'Mysterious, intense, speaks in a low whisper',
    greeting: "You've come far, traveler... all the way to the edge. I'm dark and cold out here, yet inside me rages something fierce. My winds are the fastest in the solar system. Can you figure out how?",
    experiment: {
      question: "How can Neptune have the fastest winds in the solar system (~2,100 km/h) when it receives so little energy from the Sun?",
      hint: "I radiate MORE heat than I receive from the Sun. Where is that extra energy coming from? And how does low friction play into wind speed?",
      keyConcepts: ['internal heat', 'gravitational contraction', 'low friction', 'thermodynamics', 'convection', 'energy budget'],
      acceptableAnswer: "Neptune generates ~2.6x more heat than it receives from the Sun through slow gravitational contraction and possibly radioactive decay. This internal heat drives powerful convection currents, and the extremely low surface friction (no solid surface) allows winds to reach extreme speeds with minimal energy loss.",
      difficulty: 8,
      stemTopic: "Thermodynamics & Energy Transfer"
    }
  }
];
*/

// ========================
// Summary of the game mechanics
// ========================
/*
GAME RULES:
- Start with 10 question attempts on Mercury
- Each planet: student asks AI questions to form a hypothesis
- "Submit Answer" to lock in their hypothesis
- Correct answer: +1 attempt for next planet
- Give up: -1 attempt for next planet
- Questions get harder each planet
- Game tracks: planets completed, total score, attempts remaining

UI:
- Left side: planet character (teacher) — styled as a circle with face, planet colors
- Right side: chat area — student messages right-aligned, planet teacher left-aligned
- Bottom: input field + "Ask Question" button + "Submit Answer" button + "Give Up" button
- Top bar: current planet, attempts remaining, score
- Transition screen between planets with facts

NEXT STEPS:
1. ✅ Project structure & planet data (this file)
2. Next: index.html + style.css (the UI shell)
3. Next: main.js + game.js + chat.js + ui.js (the logic)
4. Final: Polish, test, deploy instructions for Render
*/

console.log("Project structure ready! Let's build it step by step.");

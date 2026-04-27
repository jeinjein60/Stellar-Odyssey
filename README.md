# Stellar Odyssey Lab

An interactive, AI-powered educational game where students travel the solar system, ask questions, and form scientific hypotheses through conversation with each planet.

---

## What is it?

Stellar Odyssey Lab puts you in the role of an astronaut-researcher visiting each of the 8 planets. Every planet has a unique personality and a real STEM experiment question. Instead of multiple choice or lectures, you learn by **asking questions** in a live chat with the planet — which responds using the Claude AI — and gradually forming your own hypothesis.

Hidden lab tools unlock as you explore the right concepts, giving you interactive simulations to visualize the science. At the end of each planet, you submit your hypothesis and get evaluated by the AI.

---

## Features

- **8 planets, 8 experiments** — each with a distinct personality, difficulty level, and real science topic
- **AI-powered Socratic tutoring** — planets guide you with questions, never just giving you the answer
- **Unlockable lab tools** — ask about the right concepts to reveal interactive simulations (gravity launchers, greenhouse sliders, tide calculators, and more)
- **Hypothesis submission + AI grading** — your final answer is evaluated against key concepts
- **Science briefings** — each planet has a full data sheet before you enter the lab
- **Dynamic scoring** — correct answers grant bonus questions on the next planet; wrong answers cost one
- **HUD sci-fi UI** — full blue/dark space aesthetic with animated transitions

---

## The Planets & Experiments

| Planet | STEM Topic | Difficulty |
|--------|-----------|------------|
| 🪨 Mercury | Escape Velocity & Gravity | ⭐ |
| 🌋 Venus | Greenhouse Effect & Atmospheric Science | ⭐⭐ |
| 🌍 Earth | Gravitational Tidal Forces | ⭐⭐⭐ |
| 🔴 Mars | Soil Chemistry & Astrobiology | ⭐⭐⭐⭐ |
| 🌕 Jupiter | Fluid Dynamics & Atmospheric Physics | ⭐⭐⭐⭐⭐ |
| 🪐 Saturn | Roche Limit & Orbital Mechanics | ⭐⭐⭐⭐⭐⭐ |
| 🫧 Uranus | Angular Momentum & Planetary Formation | ⭐⭐⭐⭐⭐⭐⭐ |
| 🌑 Neptune | Thermodynamics & Energy Transfer | ⭐⭐⭐⭐⭐⭐⭐⭐ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS + Vite |
| Backend | Node.js + Express |
| AI | Claude API (Anthropic) |
| Styling | CSS (custom HUD theme) |
| Testing | Vitest |
| Hosting | Render |

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/your-username/stellar-odyssey.git
cd stellar-odyssey
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Running Locally

```bash
npm run dev
```

This starts both the Express backend and the Vite dev server concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
stellar-odyssey/
├── src/
│   ├── main.js          # App entry point, event binding, game flow
│   ├── game.js          # Game state, scoring, unlock logic
│   ├── ui.js            # DOM rendering and screen transitions
│   ├── chat.js          # API calls to Claude (chat + answer evaluation)
│   ├── planets.js       # All planet data, experiment questions, AI prompts
│   ├── planet-facts.js  # Science briefing content for each planet
│   ├── sim-renderers.js # Interactive simulation widgets
│   └── style.css        # Full stylesheet
├── server.js            # Express server — proxies requests to Claude API
├── index.html
└── package.json
```

---

## Running Tests

```bash
npm test
```

Tests cover: game initialization, AI API connectivity, page/screen loading, planet facts, and simulation tool rendering.

---

## How to Play

1. **Begin Mission** — start on Mercury and work your way to Neptune
2. **Read the Briefing** — review the planet's key data before entering the lab
3. **Ask questions** — type anything in the chat; the planet responds using AI
4. **Unlock lab tools** — ask about the right scientific concepts to reveal interactive simulations
5. **Use the tools** — experiment with the simulations to build your understanding
6. **Submit your hypothesis** — when ready, click "Submit My Answer" and write your explanation
7. **Move on** — correct answers give you a bonus question on the next planet

You have a limited number of questions per planet, so use them wisely. You can also ask for one hint per planet (costs 1 question).

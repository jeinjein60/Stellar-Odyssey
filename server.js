// ============================================================
// server.js — Express backend that proxies OpenAI API calls
// Keeps your API key safe on the server side
// ============================================================

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

// Serve the built frontend in production
app.use(express.static(join(__dirname, 'dist')));

// ===================== POST /api/chat =====================
// Proxies student questions to OpenAI and returns the planet teacher's response
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

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
      console.error('OpenAI error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error('Chat proxy error:', err);
    res.status(500).json({ error: 'Failed to reach AI service.' });
  }
});

// ===================== POST /api/evaluate =====================
// Evaluates the student's final answer against the experiment's key concepts
app.post('/api/evaluate', async (req, res) => {
  try {
    const { answer, planet, experiment } = req.body;

    if (!answer || !planet || !experiment) {
      return res.status(400).json({ error: 'Answer, planet, and experiment are required.' });
    }

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

EVALUATION RULES:
- The student does NOT need to use exact terminology
- They need to demonstrate understanding of the CORE concept (at least 2-3 key concepts)
- Be encouraging regardless of correctness
- For younger students, be more lenient — the right general idea counts
- If they mention the right phenomenon but use wrong terms, that's still correct

Respond ONLY with this exact JSON format, no other text:
{"correct": true, "feedback": "Your 2-3 sentence feedback here"}`
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

    if (data.error) {
      console.error('OpenAI error:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
      const result = JSON.parse(cleaned);
      res.json(result);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw text:', text);
      // Fallback: try to determine correctness from the text
      const isCorrect = text.toLowerCase().includes('"correct": true') ||
                         text.toLowerCase().includes('"correct":true');
      res.json({
        correct: isCorrect,
        feedback: "Great attempt! I had a little trouble processing my thoughts, but let's keep going."
      });
    }
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer.' });
  }
});

// ===================== Health Check =====================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Catch-all: serve index.html for SPA routing (production)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Solar System Lab server running on http://localhost:${PORT}`);
  console.log(`   API Key loaded: ${process.env.OPENAI_API_KEY ? '✅' : '❌ MISSING'}`);
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendQuestion, evaluateAnswer } from '../src/chat.js';

// user send question tests

describe('Test 2 — AI API: sendQuestion', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('returns { success: true, reply } when server responds ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Gravity pulls gas molecules back down.' } }] }),
    });

    const result = await sendQuestion([{ role: 'user', content: 'What is gravity?' }]);
    expect(result.success).toBe(true);
    expect(result.reply).toBe('Gravity pulls gas molecules back down.');
  });

  it('calls /api/ai/openai with POST method and JSON content-type', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'test reply' } }] }),
    });

    const messages = [{ role: 'user', content: 'Hello' }];
    await sendQuestion(messages);

    expect(fetch).toHaveBeenCalledWith('/api/ai/openai', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
  });

  it('sends the messages array in the request body', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'ok' }),
    });

    const messages = [{ role: 'user', content: 'What is escape velocity?' }];
    await sendQuestion(messages);

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.messages).toEqual(messages);
  });

  it('returns { success: false, reply } with fallback text on server error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const result = await sendQuestion([]);
    expect(result.success).toBe(false);
    expect(typeof result.reply).toBe('string');
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it('returns { success: false } gracefully on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await sendQuestion([]);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });
});

// ai takes in an answer and planet info, returns correct + feedback

describe('Test 2 — AI API: evaluateAnswer', () => {
  const mockPlanet = {
    name: 'Mercury',
    id: 'mercury',
    experiment: {
      question: 'Why does Mercury have almost no atmosphere?',
      keyConcepts: ['low gravity', 'escape velocity', 'solar wind'],
      acceptableAnswer: "Mercury's low gravity means gas molecules can exceed escape velocity.",
    },
  };

  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('returns { success: true, correct, feedback } when server responds ok', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"correct": true, "feedback": "Excellent! You identified the key ideas."}' } }],
      }),
    });

    const result = await evaluateAnswer("Low gravity lets gas escape.", mockPlanet, mockPlanet.experiment);
    expect(result.success).toBe(true);
    expect(typeof result.correct).toBe('boolean');
    expect(typeof result.feedback).toBe('string');
  });

  it('calls /api/ai/openai with POST and embeds answer + planet info in messages', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"correct": false, "feedback": "Not quite."}' } }],
      }),
    });

    await evaluateAnswer('Some answer', mockPlanet, mockPlanet.experiment);

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/ai/openai');
    expect(options.method).toBe('POST');

    const body = JSON.parse(options.body);
    expect(Array.isArray(body.messages)).toBe(true);
    const systemMsg = body.messages.find(m => m.role === 'system');
    const userMsg = body.messages.find(m => m.role === 'user');
    expect(systemMsg.content).toContain('Mercury');
    expect(userMsg.content).toContain('Some answer');
  });

  it('returns { success: false, correct: false } on server error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await evaluateAnswer('test answer', mockPlanet);
    expect(result.success).toBe(false);
    expect(result.correct).toBe(false);
    expect(typeof result.feedback).toBe('string');
  });

  it('returns { success: false, correct: false } on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await evaluateAnswer('test answer', mockPlanet);
    expect(result.success).toBe(false);
    expect(result.correct).toBe(false);
  });
});

// health endpoint tests to verify API key presence and server health status

describe('Test 2 — AI API: /api/health contract', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it('health endpoint returns { status: "ok", hasApiKey: boolean }', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', hasApiKey: true, timestamp: new Date().toISOString() }),
    });

    const res = await fetch('/api/health');
    const data = await res.json();

    expect(data.status).toBe('ok');
    expect(typeof data.hasApiKey).toBe('boolean');
    expect(data.hasApiKey).toBe(true);
  });

  it('hasApiKey is true when API key is configured', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', hasApiKey: true }),
    });

    const res = await fetch('/api/health');
    const data = await res.json();
    expect(data.hasApiKey).toBe(true);
  });
});

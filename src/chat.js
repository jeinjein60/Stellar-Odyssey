const AI_PROXY = '/api/ai/openai';

export async function sendQuestion(messages) {
  try {
    const response = await fetch(AI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response from AI');
    return { success: true, reply };
  } catch (err) {
    console.error('Chat API error:', err);
    return {
      success: false,
      reply: "Hmm, my signal's a bit scrambled out here in space. Could you try asking again? 📡",
      error: err.message,
    };
  }
}

export async function evaluateAnswer(answer, planet, experiment) {
  try {
    const response = await fetch(AI_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
- If they mention the right phenomenon but use wrong terms, that's still correct

Respond ONLY with this exact JSON format, no other text:
{"correct": true, "feedback": "Your 2-3 sentence feedback here"}`,
          },
          {
            role: 'user',
            content: `Student's answer: "${answer}"`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();

    try {
      const result = JSON.parse(cleaned);
      return { success: true, correct: result.correct, feedback: result.feedback };
    } catch {
      const isCorrect = cleaned.includes('"correct": true') || cleaned.includes('"correct":true');
      return {
        success: true,
        correct: isCorrect,
        feedback: "Great attempt! I had a little trouble processing my thoughts, but let's keep going.",
      };
    }
  } catch (err) {
    console.error('Evaluate API error:', err);
    return {
      success: false,
      correct: false,
      feedback: "I had trouble evaluating your answer — but don't worry, let's move forward! Try the next planet.",
      error: err.message,
    };
  }
}

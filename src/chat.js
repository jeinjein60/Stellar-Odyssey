const API_BASE = '/api';

// Send a student question and get the planet teacher's response
export async function sendQuestion(messages) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, reply: data.reply };
  } catch (err) {
    console.error('Chat API error:', err);
    return {
      success: false,
      reply: "Hmm, my signal's a bit scrambled out here in space. Could you try asking again? 📡",
      error: err.message,
    };
  }
}

// Evaluate the student's final answer/hypothesis
export async function evaluateAnswer(answer, planet) {
  try {
    const response = await fetch(`${API_BASE}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer,
        planet: { name: planet.name, id: planet.id },
        experiment: {
          question: planet.experiment.question,
          keyConcepts: planet.experiment.keyConcepts,
          acceptableAnswer: planet.experiment.acceptableAnswer,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      correct: data.correct,
      feedback: data.feedback,
    };
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
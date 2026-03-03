/**
 * Reading Section — Task selection, AI-generated passages, multiple-choice practice, auto-scoring.
 */

import { chatCompletionJSON, hasApiKey } from './openaiClient.js';
import { navigate, renderHeader, bindNavListeners, renderBackButton, renderTimer, startTimer } from './main.js';

const READING_TASKS = [
    { id: 1, name: 'Reading Correspondence', description: 'Understand written correspondence (e.g., emails, letters).', questions: 11 },
    { id: 2, name: 'Reading to Apply a Diagram', description: 'Interpret diagrams, tables, or visual information.', questions: 9 },
    { id: 3, name: 'Reading for Information', description: 'Extract key details from informational passages.', questions: 9 },
    { id: 4, name: 'Reading for Viewpoints', description: 'Analyse and compare opinions or viewpoints in written texts.', questions: 10 },
];

const READING_DURATION = 55 * 60; // 55 minutes total

/* ============================================
   Section Overview
   ============================================ */
export function renderReadingSection(container) {
    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Home')}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">📖 Reading Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a reading part to practise, or try all parts together.</p>

      <div class="task-list">
        ${READING_TASKS.map(task => `
          <div class="task-item" data-task-id="${task.id}">
            <div class="task-info">
              <h4>Part ${task.id}: ${task.name}</h4>
              <p>${task.description}</p>
            </div>
            <div class="task-meta">
              <div>${task.questions} questions</div>
            </div>
          </div>
        `).join('')}
      </div>
    </main>
  `;

    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('home'));
    container.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
            const taskId = parseInt(item.dataset.taskId);
            navigate('reading-practice', { taskId });
        });
    });
}

/* ============================================
   Practice View
   ============================================ */
export async function renderReadingPractice(container, params = {}) {
    const taskId = params.taskId || 1;
    const task = READING_TASKS.find(t => t.id === taskId) || READING_TASKS[0];
    const duration = Math.floor(READING_DURATION / 4); // ~14 min per part

    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Reading')}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating reading passage and questions...</p>
      </div>
    </main>
  `;
    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('reading'));

    let data;
    try {
        data = await generateReadingContent(taskId);
    } catch (err) {
        data = getFallbackReading(taskId);
    }

    const userAnswers = {};

    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${renderBackButton('Reading')}
          <h2 style="margin-top: var(--space-2);">Part ${task.id}: ${task.name}</h2>
        </div>
        <div id="timer-display">${renderTimer(duration)}</div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-reading);">Passage</h3>
        <div style="line-height: 1.8; white-space: pre-wrap;">${data.passage}</div>
      </div>

      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Questions</h3>
      <div class="task-list" id="questions-container">
        ${data.questions.map((q, i) => `
          <div class="card" style="padding: var(--space-5);" id="question-${i}">
            <p style="font-weight: 600; margin-bottom: var(--space-3);">${i + 1}. ${q.question}</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${q.options.map((opt, oi) => `
                <label style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer; transition: background var(--transition-fast);" class="option-label">
                  <input type="radio" name="q${i}" value="${oi}" style="accent-color: var(--color-primary);" />
                  <span style="font-size: var(--font-size-sm);">${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btn-submit">Submit Answers</button>
      </div>
    </main>
  `;

    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => {
        if (stopTimer) stopTimer();
        navigate('reading');
    });

    // Collect answers
    container.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const name = e.target.name;
            userAnswers[name] = parseInt(e.target.value);
        });
    });

    // Timer
    const timerDisplay = document.getElementById('timer-display');
    const stopTimer = startTimer(duration, (remaining) => {
        timerDisplay.innerHTML = renderTimer(remaining);
    }, () => {
        submitReadingAnswers(container, taskId, data, userAnswers);
    });

    document.getElementById('btn-submit').addEventListener('click', () => {
        stopTimer();
        submitReadingAnswers(container, taskId, data, userAnswers);
    });
}

/* ============================================
   Results
   ============================================ */
function submitReadingAnswers(container, taskId, data, userAnswers) {
    const task = READING_TASKS.find(t => t.id === taskId);
    let correct = 0;
    const results = data.questions.map((q, i) => {
        const userAns = userAnswers[`q${i}`];
        const isCorrect = userAns === q.correct;
        if (isCorrect) correct++;
        return { ...q, userAnswer: userAns, isCorrect, index: i };
    });

    const score = Math.round((correct / data.questions.length) * 9 + 3); // Map to 3-12 scale
    const clamped = Math.min(12, Math.max(3, score));

    container.innerHTML = `
    ${renderHeader()}
    <main class="container results-container">
      ${renderBackButton('Reading')}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">📖 Reading Results</h2>

      <div class="score-display">
        <div class="score-value">${clamped}</div>
        <div class="score-label">Estimated CLB Score · ${correct}/${data.questions.length} correct</div>
      </div>

      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Question Review</h3>
      <div class="task-list">
        ${results.map((r, i) => `
          <div class="card" style="padding: var(--space-5); border-left: 3px solid ${r.isCorrect ? 'var(--color-success)' : 'var(--color-error)'};">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">${i + 1}. ${r.question}</p>
            <p style="font-size: var(--font-size-sm); color: ${r.isCorrect ? 'var(--color-success)' : 'var(--color-error)'};">
              ${r.isCorrect ? '✓ Correct' : `✗ Your answer: ${r.options[r.userAnswer] || 'No answer'}`}
            </p>
            ${!r.isCorrect ? `<p style="font-size: var(--font-size-sm); color: var(--color-success); margin-top: var(--space-1);">Correct answer: ${r.options[r.correct]}</p>` : ''}
            ${r.explanation ? `<p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">${r.explanation}</p>` : ''}
          </div>
        `).join('')}
      </div>

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-reading">← Back to Reading</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${(() => { const next = READING_TASKS.find(t => t.id === taskId + 1); return next ? '<button class="btn btn-primary" id="btn-continue-task">Continue → Part ' + (taskId + 1) + ': ' + next.name + '</button>' : ''; })()}
      </div>
    </main>
  `;

    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('reading'));
    document.getElementById('btn-back-reading')?.addEventListener('click', () => navigate('reading'));
    document.getElementById('btn-retry')?.addEventListener('click', () => navigate('reading-practice', { taskId }));
    document.getElementById('btn-continue-task')?.addEventListener('click', () => navigate('reading-practice', { taskId: taskId + 1 }));

    saveToHistory('reading', taskId, { overall_score: clamped });
}

/* ============================================
   AI Content Generation
   ============================================ */
async function generateReadingContent(taskId) {
    const task = READING_TASKS.find(t => t.id === taskId);
    const systemPrompt = `You are a CELPIP exam question writer. Generate a Reading Part ${taskId} (${task.name}) exercise.
Create a reading passage (200-350 words) and ${task.questions} multiple-choice questions.
The content should involve realistic Canadian contexts and use Canadian English spelling.

Return JSON:
{
  "passage": "the reading passage text",
  "questions": [
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct": <index 0-3>,
      "explanation": "why this answer is correct"
    }
  ]
}`;

    return await chatCompletionJSON([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a new CELPIP reading exercise for Part ${taskId}.` },
    ], { max_tokens: 3000 });
}

function getFallbackReading(taskId) {
    return {
        passage: `Dear Neighbour,\n\nI am writing to let you know about some upcoming changes in our neighbourhood. The City of Toronto has approved a plan to build a new community centre on Maple Street, which is expected to open by next summer.\n\nThe centre will include a swimming pool, a gymnasium, meeting rooms, and a small library. Construction will begin next month and may cause some noise and traffic disruptions. The city has assured us that work will only take place between 7:00 a.m. and 6:00 p.m. on weekdays.\n\nIf you have any concerns, the city is holding an information session at the local library this Saturday at 2:00 p.m. Everyone is welcome to attend and ask questions.\n\nBest regards,\nSarah Thompson\nNeighbourhood Association President`,
        questions: [
            { question: "What is the main purpose of this letter?", options: ["To complain about noise", "To inform neighbours about a new project", "To invite people to a party", "To request volunteers"], correct: 1, explanation: "The letter informs neighbours about the new community centre construction." },
            { question: "When will the community centre open?", options: ["Next month", "This Saturday", "Next summer", "Next year"], correct: 2, explanation: "The passage states it is 'expected to open by next summer'." },
            { question: "What will NOT be included in the community centre?", options: ["Swimming pool", "Gymnasium", "Restaurant", "Library"], correct: 2, explanation: "The passage mentions a pool, gym, meeting rooms, and library — but no restaurant." },
            { question: "When will construction noise occur?", options: ["All day every day", "Weekdays 7 a.m. to 6 p.m.", "Only on weekends", "Only at night"], correct: 1, explanation: "The city assured work will be between 7:00 a.m. and 6:00 p.m. on weekdays." },
        ],
    };
}

function saveToHistory(section, taskId, evaluation) {
    try {
        const history = JSON.parse(localStorage.getItem('celpip_history') || '[]');
        history.push({ section, taskId, score: evaluation.overall_score, date: new Date().toISOString() });
        localStorage.setItem('celpip_history', JSON.stringify(history));
    } catch (e) { }
}

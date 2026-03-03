/**
 * Listening Section — AI-generated dialogues with TTS audio, multiple-choice practice, auto-scoring.
 */

import { chatCompletionJSON, textToSpeech, hasApiKey } from './openaiClient.js';
import { navigate, renderHeader, bindNavListeners, renderBackButton, renderTimer, startTimer } from './main.js';

const LISTENING_TASKS = [
    { id: 1, name: 'Listening to Problem Solving', description: 'Understand a conversation about a problem and determine the best solution.', questions: 8 },
    { id: 2, name: 'Listening to a Daily Life Conversation', description: 'Comprehend a conversation about everyday topics.', questions: 5 },
    { id: 3, name: 'Listening for Information', description: 'Extract specific details from an informational dialogue.', questions: 6 },
    { id: 4, name: 'Listening to a News Item', description: 'Understand the main ideas and details from a news-style report.', questions: 6 },
    { id: 5, name: 'Listening to a Discussion', description: 'Follow views and opinions in a discussion.', questions: 6 },
    { id: 6, name: 'Listening to Viewpoints', description: 'Identify and compare opinions from multiple speakers.', questions: 7 },
];

/* ============================================
   Section Overview
   ============================================ */
export function renderListeningSection(container) {
    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Home')}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">🎧 Listening Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a listening part to practise. Audio plays only once, just like the real exam.</p>

      <div class="task-list">
        ${LISTENING_TASKS.map(task => `
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
            navigate('listening-practice', { taskId });
        });
    });
}

/* ============================================
   Practice View
   ============================================ */
export async function renderListeningPractice(container, params = {}) {
    const taskId = params.taskId || 1;
    const task = LISTENING_TASKS.find(t => t.id === taskId) || LISTENING_TASKS[0];

    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Listening')}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);" id="loading-status">Generating dialogue script...</p>
      </div>
    </main>
  `;
    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('listening'));

    let data, audioUrl = null;
    try {
        data = await generateListeningContent(taskId);
        document.getElementById('loading-status').textContent = 'Generating audio...';
        audioUrl = await textToSpeech(data.dialogue_text || data.passage);
    } catch (err) {
        data = getFallbackListening(taskId);
        // No audio in fallback mode
    }

    renderListeningUI(container, task, data, audioUrl);
}

function renderListeningUI(container, task, data, audioUrl) {
    const userAnswers = {};
    const duration = 10 * 60; // 10 minutes per part for answering

    container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${renderBackButton('Listening')}
          <h2 style="margin-top: var(--space-2);">Part ${task.id}: ${task.name}</h2>
        </div>
        <div id="timer-display">${renderTimer(duration)}</div>
      </div>

      <!-- Audio Player -->
      <div class="card" style="margin-bottom: var(--space-6); text-align: center;">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-listening);">🔊 Listen to the Audio</h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-4);">The audio will play once. Listen carefully before answering the questions.</p>
        ${audioUrl ? `
          <audio id="listening-audio" src="${audioUrl}" style="width: 100%;"></audio>
          <button class="btn btn-primary" id="btn-play-audio" style="margin-top: var(--space-3);">▶ Play Audio</button>
          <p id="audio-status" style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-2);">Audio has not been played yet</p>
        ` : `
          <div style="padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm);">
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);"><strong>Transcript (audio unavailable):</strong></p>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.7; white-space: pre-wrap;">${data.dialogue_text || data.passage || ''}</p>
          </div>
        `}
      </div>

      <!-- Questions -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Questions</h3>
      <div class="task-list" id="questions-container">
        ${data.questions.map((q, i) => `
          <div class="card" style="padding: var(--space-5);">
            <p style="font-weight: 600; margin-bottom: var(--space-3);">${i + 1}. ${q.question}</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${q.options.map((opt, oi) => `
                <label style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer;">
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
        navigate('listening');
    });

    // Audio play-once
    let audioPlayed = false;
    const playBtn = document.getElementById('btn-play-audio');
    const audioEl = document.getElementById('listening-audio');
    if (playBtn && audioEl) {
        playBtn.addEventListener('click', () => {
            if (audioPlayed) return;
            audioPlayed = true;
            audioEl.play();
            playBtn.disabled = true;
            playBtn.textContent = '🔊 Playing...';
            playBtn.classList.remove('btn-primary');
            playBtn.classList.add('btn-secondary');
            document.getElementById('audio-status').textContent = 'Audio is playing...';
            audioEl.addEventListener('ended', () => {
                playBtn.textContent = '✓ Audio finished';
                document.getElementById('audio-status').textContent = 'Audio has been played (cannot replay)';
            });
        });
    }

    // Collect answers
    container.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', (e) => {
            userAnswers[e.target.name] = parseInt(e.target.value);
        });
    });

    // Timer
    const timerDisplay = document.getElementById('timer-display');
    const stopTimer = startTimer(duration, (remaining) => {
        timerDisplay.innerHTML = renderTimer(remaining);
    }, () => {
        submitListeningAnswers(container, task.id, data, userAnswers);
    });

    document.getElementById('btn-submit').addEventListener('click', () => {
        stopTimer();
        submitListeningAnswers(container, task.id, data, userAnswers);
    });
}

/* ============================================
   Results
   ============================================ */
function submitListeningAnswers(container, taskId, data, userAnswers) {
    let correct = 0;
    const results = data.questions.map((q, i) => {
        const userAns = userAnswers[`q${i}`];
        const isCorrect = userAns === q.correct;
        if (isCorrect) correct++;
        return { ...q, userAnswer: userAns, isCorrect };
    });

    const score = Math.round((correct / data.questions.length) * 9 + 3);
    const clamped = Math.min(12, Math.max(3, score));

    container.innerHTML = `
    ${renderHeader()}
    <main class="container results-container">
      ${renderBackButton('Listening')}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">🎧 Listening Results</h2>

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
        <button class="btn btn-secondary" id="btn-back-listening">← Back to Listening</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${(() => { const next = LISTENING_TASKS.find(t => t.id === taskId + 1); return next ? '<button class="btn btn-primary" id="btn-continue-task">Continue → Part ' + (taskId + 1) + ': ' + next.name + '</button>' : ''; })()}
      </div>
    </main>
  `;

    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('listening'));
    document.getElementById('btn-back-listening')?.addEventListener('click', () => navigate('listening'));
    document.getElementById('btn-retry')?.addEventListener('click', () => navigate('listening-practice', { taskId }));
    document.getElementById('btn-continue-task')?.addEventListener('click', () => navigate('listening-practice', { taskId: taskId + 1 }));

    saveToHistory('listening', taskId, { overall_score: clamped });
}

/* ============================================
   AI Content Generation
   ============================================ */
async function generateListeningContent(taskId) {
    const task = LISTENING_TASKS.find(t => t.id === taskId);
    const systemPrompt = `You are a CELPIP exam question writer. Generate a Listening Part ${taskId} (${task.name}) exercise.
Create a dialogue or monologue script (150-300 words) and ${task.questions} multiple-choice questions.
The content should involve realistic Canadian contexts and use Canadian English.

The dialogue_text should be written in a natural conversational style suitable for text-to-speech conversion.
Use speaker labels like "Speaker 1:" and "Speaker 2:" for dialogues, or no labels for monologues (Part 4).

Return JSON:
{
  "dialogue_text": "the full dialogue/monologue script for TTS",
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
        { role: 'user', content: `Generate a new CELPIP listening exercise for Part ${taskId}.` },
    ], { max_tokens: 3000 });
}

function getFallbackListening(taskId) {
    return {
        dialogue_text: "Speaker 1: Hi, I'm having trouble with my internet connection. It's been really slow for the past few days.\n\nSpeaker 2: I'm sorry to hear that. Let me look into this for you. Can I have your account number?\n\nSpeaker 1: Sure, it's 4-5-7-8-2-3.\n\nSpeaker 2: Thank you. I can see there was some maintenance work in your area last week. That might have affected your connection. I can reset your modem remotely, or we can send a technician to check the wiring.\n\nSpeaker 1: I'd prefer if someone could come and check it. When would that be possible?\n\nSpeaker 2: We have availability this Thursday afternoon between 2 and 5 p.m. Would that work?\n\nSpeaker 1: That's perfect. Thank you very much.",
        passage: null,
        questions: [
            { question: "What is the caller's problem?", options: ["Their phone is broken", "Their internet is slow", "They need a new modem", "Their bill is too high"], correct: 1, explanation: "The caller says their internet connection has been really slow." },
            { question: "What caused the problem?", options: ["A storm", "Maintenance work", "A broken modem", "An unpaid bill"], correct: 1, explanation: "The agent mentions maintenance work in the area last week." },
            { question: "What solution does the caller choose?", options: ["Remote modem reset", "A technician visit", "Cancelling the service", "Upgrading the plan"], correct: 1, explanation: "The caller says they'd prefer someone to come and check it." },
            { question: "When is the technician available?", options: ["Monday morning", "Wednesday evening", "Thursday afternoon", "Friday morning"], correct: 2, explanation: "The agent offers Thursday afternoon between 2 and 5 p.m." },
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

/**
 * Writing Section — Task selection, practice UI, evaluation, and results.
 */

import { chatCompletionJSON, hasApiKey } from './openaiClient.js';
import { navigate, renderHeader, bindNavListeners, renderBackButton, renderTimer, startTimer } from './main.js';

const WRITING_TASKS = [
  { id: 1, name: 'Writing an Email', description: 'Write a formal or informal email responding to a given situation.', duration: 27 * 60, wordTarget: '150–200 words' },
  { id: 2, name: 'Responding to Survey Questions', description: 'Choose an option and explain your decision in a written response.', duration: 26 * 60, wordTarget: '150–200 words' },
];

/* ============================================
   Section Overview (Task Selector)
   ============================================ */
export function renderWritingSection(container) {
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Home')}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">✏️ Writing Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a task type to practise. Each task is timed to match real exam conditions.</p>

      <div class="task-list">
        ${WRITING_TASKS.map(task => `
          <div class="task-item" data-task-id="${task.id}">
            <div class="task-info">
              <h4>Task ${task.id}: ${task.name}</h4>
              <p>${task.description}</p>
            </div>
            <div class="task-meta">
              <div>${Math.floor(task.duration / 60)} min</div>
              <div>${task.wordTarget}</div>
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
      navigate('writing-practice', { taskId });
    });
  });
}

/* ============================================
   Practice View
   ============================================ */
export async function renderWritingPractice(container, params = {}) {
  const taskId = params.taskId || 1;
  const task = WRITING_TASKS.find(t => t.id === taskId) || WRITING_TASKS[0];

  // Show loading while generating prompt
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Writing')}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating your writing prompt...</p>
      </div>
    </main>
  `;
  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('writing'));

  // Generate prompt via OpenAI
  let prompt;
  try {
    prompt = await generateWritingPrompt(taskId);
  } catch (err) {
    prompt = getFallbackPrompt(taskId);
  }

  // Render practice UI
  let stopTimer;
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${renderBackButton('Writing')}
          <h2 style="margin-top: var(--space-2);">Task ${task.id}: ${task.name}</h2>
        </div>
        <div id="timer-display">${renderTimer(task.duration)}</div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-writing);">Prompt</h3>
        <p style="line-height: 1.7;">${prompt.prompt}</p>
        ${prompt.options ? `
          <div style="margin-top: var(--space-4); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm);">
            <p style="font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-3);">Select one option:</p>
            ${prompt.options.map((opt, i) => `
              <label style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); cursor: pointer; border-radius: var(--radius-sm); transition: background var(--transition-fast);" class="option-label">
                <input type="radio" name="survey-option" value="${i}" style="margin-top: 3px; accent-color: var(--color-primary); width: 18px; height: 18px; flex-shrink: 0;" />
                <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Option ${i + 1}: ${opt}</span>
              </label>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
        <label style="font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-secondary);">Your Response</label>
        <div class="word-counter" id="word-counter">0 words</div>
      </div>
      <textarea class="writing-area" id="writing-input" placeholder="Start writing your response here..."></textarea>

      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-4);">
        <button class="btn btn-primary btn-lg" id="btn-submit">Submit Response</button>
      </div>
    </main>
  `;

  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => {
    if (stopTimer) stopTimer();
    navigate('writing');
  });

  // Word counter
  const textarea = document.getElementById('writing-input');
  const wordCounter = document.getElementById('word-counter');
  textarea.addEventListener('input', () => {
    const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
    wordCounter.textContent = `${words} words`;
  });
  textarea.focus();

  // Timer
  const timerDisplay = document.getElementById('timer-display');
  stopTimer = startTimer(task.duration, (remaining) => {
    timerDisplay.innerHTML = renderTimer(remaining);
  }, () => {
    const selectedOpt = document.querySelector('input[name="survey-option"]:checked');
    const selectedOptionIndex = selectedOpt ? parseInt(selectedOpt.value) : null;
    submitWritingResponse(container, taskId, prompt, textarea.value, selectedOptionIndex);
  });

  // Submit
  document.getElementById('btn-submit').addEventListener('click', () => {
    // For Task 2, validate option selection
    if (taskId === 2 && prompt.options) {
      const selectedOption = document.querySelector('input[name="survey-option"]:checked');
      if (!selectedOption) {
        alert('Please select an option before submitting your response.');
        return;
      }
    }
    if (stopTimer) stopTimer();
    const selectedOpt = document.querySelector('input[name="survey-option"]:checked');
    const selectedOptionIndex = selectedOpt ? parseInt(selectedOpt.value) : null;
    submitWritingResponse(container, taskId, prompt, textarea.value, selectedOptionIndex);
  });
}

/* ============================================
   Evaluation & Results
   ============================================ */
async function submitWritingResponse(container, taskId, prompt, response, selectedOptionIndex = null) {
  if (!response.trim()) {
    alert('Please write a response before submitting.');
    return;
  }

  // Show loading
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Evaluating your response...</p>
      </div>
    </main>
  `;

  let evaluation;
  try {
    evaluation = await evaluateWritingResponse(taskId, prompt, response, selectedOptionIndex);
  } catch (err) {
    container.innerHTML = `
      ${renderHeader()}
      <main class="container results-container">
        ${renderBackButton('Writing')}
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <p style="color: var(--color-error); margin-bottom: var(--space-4);">❌ Evaluation failed: ${err.message}</p>
          <button class="btn btn-primary" id="btn-retry">Try Again</button>
        </div>
      </main>
    `;
    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('writing'));
    document.getElementById('btn-retry')?.addEventListener('click', () => navigate('writing-practice', { taskId }));
    return;
  }

  renderWritingResults(container, taskId, prompt, response, evaluation);
}

function renderWritingResults(container, taskId, prompt, response, evaluation) {
  const task = WRITING_TASKS.find(t => t.id === taskId);
  const nextTask = WRITING_TASKS.find(t => t.id === taskId + 1);
  let continueBtn = '';
  if (nextTask) {
    continueBtn = `<button class="btn btn-primary" id="btn-continue-task">Continue → Task ${nextTask.id}: ${nextTask.name}</button>`;
  }

  container.innerHTML = `
    ${renderHeader()}
    <main class="container results-container">
      ${renderBackButton('Writing')}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">📝 Writing Evaluation</h2>

      <!-- Overall Score -->
      <div class="score-display">
        <div class="score-value">${evaluation.overall_score}</div>
        <div class="score-label">CLB / CELPIP Score (out of 12)</div>
      </div>

      <!-- Rubric Breakdown -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Rubric Breakdown</h3>
      <div class="rubric-grid">
        ${(evaluation.rubric || []).map(r => `
          <div class="rubric-item">
            <div class="rubric-name">${r.criterion}</div>
            <div class="rubric-score">${r.score}</div>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">${r.comment || ''}</p>
          </div>
        `).join('')}
      </div>

      <!-- Strengths -->
      ${evaluation.strengths ? `
        <div class="card" style="margin-bottom: var(--space-6); border-left: 3px solid var(--color-success);">
          <h3 style="font-size: var(--font-size-base); font-weight: 600; color: var(--color-success); margin-bottom: var(--space-3);">💪 Strengths</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
            ${evaluation.strengths.map(s => `<li style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">✓ ${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Suggestions -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">💡 Improvement Suggestions</h3>
      ${(evaluation.suggestions || []).map((s, i) => `
        <div class="suggestion-card">
          <div class="suggestion-header">Suggestion ${i + 1} (${s.criterion})</div>
          <div class="original-text">"${s.original}"</div>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">${s.explanation}</p>
          <div class="improved-text">"${s.improved}"</div>
        </div>
      `).join('')}

      <!-- Model Answer -->
      ${evaluation.model_answer ? `
        <div class="model-answer">
          <h3>📄 Model Answer</h3>
          <p style="white-space: pre-wrap;">${evaluation.model_answer}</p>
        </div>
      ` : ''}

      <!-- Your Response -->
      <div class="card" style="margin-top: var(--space-6);">
        <h3 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-3);">Your Response</h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.7; white-space: pre-wrap;">${response}</p>
      </div>

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-writing">← Back to Writing</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${continueBtn}
      </div>
    </main>
  `;

  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('writing'));
  document.getElementById('btn-back-writing')?.addEventListener('click', () => navigate('writing'));
  document.getElementById('btn-retry')?.addEventListener('click', () => navigate('writing-practice', { taskId }));
  document.getElementById('btn-continue-task')?.addEventListener('click', () => {
    navigate('writing-practice', { taskId: taskId + 1 });
  });

  // Save to session history
  saveToHistory('writing', taskId, evaluation);
}

/* ============================================
   OpenAI Prompt Generation
   ============================================ */
async function generateWritingPrompt(taskId) {
  const systemPrompt = taskId === 1
    ? `You are a CELPIP exam question writer. Generate a Writing Task 1 (Email Writing) prompt. 
       The scenario should involve a realistic Canadian context (workplace, community, neighbourhood, municipal services, etc.). 
       Use Canadian English spelling. 
       Return JSON with: { "prompt": "the full prompt text instructing the test-taker", "type": "formal" | "informal" }`
    : `You are a CELPIP exam question writer. Generate a Writing Task 2 (Survey Response) prompt. 
       The topic should be relevant to Canadian daily life. Provide two clear options to choose from. 
       Use Canadian English spelling. 
       Return JSON with: { "prompt": "the survey question", "options": ["Option A description", "Option B description"] }`;

  return await chatCompletionJSON([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Generate a new unique CELPIP writing prompt.' },
  ]);
}

async function evaluateWritingResponse(taskId, prompt, response, selectedOptionIndex = null) {
  let optionContext = '';
  if (taskId === 2 && selectedOptionIndex !== null && prompt.options) {
    optionContext = `\nThe test-taker selected: Option ${selectedOptionIndex + 1}: "${prompt.options[selectedOptionIndex]}"\nEvaluate whether their response effectively supports and explains their chosen option.`;
  }

  const systemPrompt = `You are a certified CELPIP examiner evaluating a Writing Task ${taskId} response.
Use official CELPIP scoring criteria. Score on a scale of 3–12 (CLB levels).

Evaluate on these four criteria:
1. Content / Coherence — logical flow, relevance, completeness of ideas
2. Vocabulary — range, precision, and appropriateness of word choice  
3. Readability — sentence structure, grammar, and punctuation
4. Task Fulfillment — whether the response addresses all parts of the prompt${optionContext}

Provide 3–5 concrete improvement suggestions. Each must:
- Quote a specific phrase from the response
- Explain what is wrong or could be better
- Provide a rewritten version
- Name which criterion it relates to

IMPORTANT — Model Answer Requirements:
- The model answer must be exactly 150–200 words.
- It must be written in multiple separate paragraphs (use \n\n between paragraphs).
- Each paragraph should serve a clear purpose (introduction, body, conclusion).

Return JSON:
{
  "overall_score": <number 3-12>,
  "rubric": [
    { "criterion": "Content / Coherence", "score": <3-12>, "comment": "..." },
    { "criterion": "Vocabulary", "score": <3-12>, "comment": "..." },
    { "criterion": "Readability", "score": <3-12>, "comment": "..." },
    { "criterion": "Task Fulfillment", "score": <3-12>, "comment": "..." }
  ],
  "strengths": ["strength 1", "strength 2"],
  "suggestions": [
    { "criterion": "...", "original": "quoted text", "explanation": "...", "improved": "rewritten version" }
  ],
  "model_answer": "A model response of 150–200 words with separate paragraphs (use \\n\\n between each paragraph)"
}`;

  return await chatCompletionJSON([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Prompt given to the test-taker:\n${JSON.stringify(prompt)}\n\nTest-taker's response:\n${response}` },
  ], { max_tokens: 3000 });
}

/* ============================================
   Fallback Prompts
   ============================================ */
function getFallbackPrompt(taskId) {
  if (taskId === 1) {
    return {
      prompt: "You recently moved to a new neighbourhood. Write an email to your neighbour introducing yourself. Include information about who you are, why you moved, and suggest a time to meet. Write approximately 150–200 words.",
      type: "informal"
    };
  }
  return {
    prompt: "Your local community centre is considering extending its hours to include evenings and weekends. Do you think this is a good idea?",
    options: [
      "Yes, the community centre should extend its hours.",
      "No, the current hours are sufficient."
    ]
  };
}

/* ============================================
   Session History Helper
   ============================================ */
function saveToHistory(section, taskId, evaluation) {
  try {
    const history = JSON.parse(localStorage.getItem('celpip_history') || '[]');
    history.push({
      section,
      taskId,
      score: evaluation.overall_score,
      date: new Date().toISOString(),
    });
    localStorage.setItem('celpip_history', JSON.stringify(history));
  } catch (e) {
    // silently fail
  }
}

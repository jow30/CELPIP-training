/**
 * CELPIP Exam Coach — Main Application Entry Point
 * Handles routing, navigation, and renders the home screen.
 */

import { hasApiKey, getApiKey, setApiKey, removeApiKey, getModel, setModel } from './openaiClient.js';
import { renderWritingSection, renderWritingPractice } from './writingSection.js';
import { renderSpeakingSection, renderSpeakingPractice } from './speakingSection.js';
import { renderReadingSection, renderReadingPractice } from './readingSection.js';
import { renderListeningSection, renderListeningPractice } from './listeningSection.js';

const app = document.getElementById('app');

/* ============================================
   Router
   ============================================ */
const routes = {};
let currentView = null;

export function navigate(path, params = {}) {
  window.history.pushState({ path, params }, '', `#${path}`);
  renderRoute(path, params);
}

function renderRoute(path, params = {}) {
  currentView = path;
  const handler = routes[path];
  if (handler) {
    handler(params);
  } else {
    renderHome();
  }
}

window.addEventListener('popstate', (e) => {
  const state = e.state || {};
  renderRoute(state.path || 'home', state.params || {});
});

/* ============================================
   Route Definitions
   ============================================ */
routes['home'] = () => renderHome();
routes['settings'] = () => openSettings();
routes['writing'] = () => renderWritingSection(app);
routes['writing-practice'] = (p) => renderWritingPractice(app, p);
routes['speaking'] = () => renderSpeakingSection(app);
routes['speaking-practice'] = (p) => renderSpeakingPractice(app, p);
routes['reading'] = () => renderReadingSection(app);
routes['reading-practice'] = (p) => renderReadingPractice(app, p);
routes['listening'] = () => renderListeningSection(app);
routes['listening-practice'] = (p) => renderListeningPractice(app, p);

/* ============================================
   Header
   ============================================ */
function renderHeader() {
  return `
    <header class="app-header">
      <div class="app-logo" id="nav-home">
        <div class="logo-icon">🍁</div>
        <span>CELPIP Coach</span>
      </div>
      <div class="nav-actions">
        <button class="btn btn-ghost" id="nav-history">📊 History</button>
        <button class="btn btn-secondary" id="nav-settings">⚙️ Settings</button>
      </div>
    </header>
  `;
}

/* ============================================
   Home Screen
   ============================================ */
function renderHome() {
  const needsKey = !hasApiKey();

  app.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${needsKey ? `
        <div class="api-key-banner">
          <span>⚠️ No API key configured. Add your OpenAI API key to start practising with AI-generated questions.</span>
          <button class="btn btn-secondary" id="banner-settings">Configure</button>
        </div>
      ` : ''}

      <section class="home-hero">
        <h1>Master Your CELPIP Exam</h1>
        <p>Practise with AI-generated questions, get instant feedback, and track your progress — all tailored to the Canadian English exam.</p>
      </section>

      <section class="section-grid">
        <div class="card section-card card-accent-listening" id="section-listening">
          <div class="section-icon listening">🎧</div>
          <h3>Listening</h3>
          <p>Comprehend spoken Canadian English across everyday and professional contexts.</p>
          <span class="task-count">6 parts · ~38 questions</span>
        </div>

        <div class="card section-card card-accent-reading" id="section-reading">
          <div class="section-icon reading">📖</div>
          <h3>Reading</h3>
          <p>Understand written texts, correspondence, and viewpoints in Canadian English.</p>
          <span class="task-count">4 parts · ~38 questions</span>
        </div>

        <div class="card section-card card-accent-writing" id="section-writing">
          <div class="section-icon writing">✏️</div>
          <h3>Writing</h3>
          <p>Compose emails and survey responses with clear structure and strong vocabulary.</p>
          <span class="task-count">2 tasks · 53 min</span>
        </div>

        <div class="card section-card card-accent-speaking" id="section-speaking">
          <div class="section-icon speaking">🎤</div>
          <h3>Speaking</h3>
          <p>Respond to prompts with fluency, coherence, and natural Canadian English.</p>
          <span class="task-count">8 tasks · 20 min</span>
        </div>
      </section>
    </main>
  `;

  // Event listeners
  bindNavListeners();

  document.getElementById('section-listening')?.addEventListener('click', () => navigate('listening'));
  document.getElementById('section-reading')?.addEventListener('click', () => navigate('reading'));
  document.getElementById('section-writing')?.addEventListener('click', () => navigate('writing'));
  document.getElementById('section-speaking')?.addEventListener('click', () => navigate('speaking'));
  document.getElementById('banner-settings')?.addEventListener('click', () => openSettings());
}

/* ============================================
   Settings Modal
   ============================================ */
function openSettings() {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const currentKey = getApiKey() || '';
  const maskedKey = currentKey ? currentKey.slice(0, 7) + '...' + currentKey.slice(-4) : '';
  const currentModel = getModel();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>⚙️ Settings</h2>

      <div class="form-group">
        <label for="settings-api-key">OpenAI API Key</label>
        <input type="password" id="settings-api-key" placeholder="sk-..." value="${currentKey}" />
        ${maskedKey ? `<small style="color: var(--color-text-muted); margin-top: 4px; display: block;">Current: ${maskedKey}</small>` : ''}
      </div>

      <div class="form-group">
        <label for="settings-model">Chat Model</label>
        <select id="settings-model">
          <option value="gpt-4o-mini" ${currentModel === 'gpt-4o-mini' ? 'selected' : ''}>gpt-4o-mini (faster, cheaper)</option>
          <option value="gpt-4o" ${currentModel === 'gpt-4o' ? 'selected' : ''}>gpt-4o (higher quality)</option>
        </select>
      </div>

      <div class="form-actions">
        ${currentKey ? '<button class="btn btn-ghost" id="settings-remove" style="margin-right: auto; color: var(--color-error);">Remove Key</button>' : ''}
        <button class="btn btn-ghost" id="settings-cancel">Cancel</button>
        <button class="btn btn-primary" id="settings-save">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings(overlay);
  });

  document.getElementById('settings-cancel').addEventListener('click', () => closeSettings(overlay));

  document.getElementById('settings-save').addEventListener('click', () => {
    const keyInput = document.getElementById('settings-api-key').value;
    const modelInput = document.getElementById('settings-model').value;
    setApiKey(keyInput);
    setModel(modelInput);
    closeSettings(overlay);
    // Re-render current view to reflect changes
    renderRoute(currentView || 'home');
  });

  document.getElementById('settings-remove')?.addEventListener('click', () => {
    removeApiKey();
    closeSettings(overlay);
    renderRoute(currentView || 'home');
  });
}

function closeSettings(overlay) {
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

/* ============================================
   Shared Nav Listeners
   ============================================ */
function bindNavListeners() {
  document.getElementById('nav-home')?.addEventListener('click', () => navigate('home'));
  document.getElementById('nav-settings')?.addEventListener('click', () => openSettings());
  document.getElementById('nav-history')?.addEventListener('click', () => openHistory());
}

/* ============================================
   History Modal
   ============================================ */
function openHistory() {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const history = JSON.parse(localStorage.getItem('celpip_history') || '[]').reverse();

  const sectionLabels = {
    writing: '✏️ Writing',
    speaking: '🎤 Speaking',
    reading: '📖 Reading',
    listening: '🎧 Listening',
  };

  const taskNames = {
    writing: { 1: 'Writing an Email', 2: 'Survey Response' },
    speaking: { 1: 'Giving Advice', 2: 'Personal Experience', 3: 'Describing a Scene', 4: 'Making Predictions', 5: 'Comparing & Persuading', 6: 'Difficult Situation', 7: 'Expressing Opinions', 8: 'Unusual Situation' },
    reading: { 1: 'Correspondence', 2: 'Apply a Diagram', 3: 'For Information', 4: 'For Viewpoints' },
    listening: { 1: 'Problem Solving', 2: 'Daily Life', 3: 'For Information', 4: 'News Item', 5: 'Discussion', 6: 'Viewpoints' },
  };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-height: 80vh; display: flex; flex-direction: column;">
      <h2>📊 Practice History</h2>

      ${history.length === 0 ? `
        <div style="text-align: center; padding: var(--space-8) 0; color: var(--color-text-muted);">
          <p style="font-size: var(--font-size-xl); margin-bottom: var(--space-3);">📭</p>
          <p>No practice sessions yet.</p>
          <p style="font-size: var(--font-size-sm); margin-top: var(--space-2);">Complete a practice session to see your scores here.</p>
        </div>
      ` : `
        <div style="overflow-y: auto; flex: 1; margin: var(--space-4) 0; display: flex; flex-direction: column; gap: var(--space-3);">
          ${history.map(entry => {
    const sectionLabel = sectionLabels[entry.section] || entry.section;
    const taskName = taskNames[entry.section]?.[entry.taskId] || `Task ${entry.taskId}`;
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
    const scoreColor = entry.score >= 9 ? 'var(--color-success)' : entry.score >= 6 ? 'var(--color-warning)' : 'var(--color-error)';
    return `
                <div style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm); border-left: 3px solid ${scoreColor};">
                  <div style="font-size: var(--font-size-xl); font-weight: 700; color: ${scoreColor}; min-width: 40px; text-align: center;">${entry.score}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: var(--font-size-sm);">${sectionLabel} — ${taskName}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">${dateStr} at ${timeStr}</div>
                  </div>
                </div>
              `;
  }).join('')}
        </div>
      `}

      <div class="form-actions" style="margin-top: var(--space-4);">
        ${history.length > 0 ? '<button class="btn btn-ghost" id="history-clear" style="margin-right: auto; color: var(--color-error);">Clear History</button>' : ''}
        <button class="btn btn-primary" id="history-close">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay);
  });

  document.getElementById('history-close').addEventListener('click', () => closeModal(overlay));

  document.getElementById('history-clear')?.addEventListener('click', () => {
    localStorage.removeItem('celpip_history');
    closeModal(overlay);
    // Re-open to show empty state
    openHistory();
  });
}

function closeModal(overlay) {
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

/* ============================================
   Shared Utilities
   ============================================ */
export function renderBackButton(label = 'Back') {
  return `<button class="btn btn-ghost" id="btn-back">← ${label}</button>`;
}

export function renderTimer(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const cls = seconds < 60 ? 'danger' : seconds < 120 ? 'warning' : '';
  return `<div class="timer ${cls}">⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>`;
}

export function startTimer(durationSeconds, onTick, onComplete) {
  let remaining = durationSeconds;
  onTick(remaining);

  const interval = setInterval(() => {
    remaining--;
    onTick(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      onComplete();
    }
  }, 1000);

  return () => clearInterval(interval);
}

export { bindNavListeners, renderHeader };
/* ============================================
   Boot
   ============================================ */
renderHome();

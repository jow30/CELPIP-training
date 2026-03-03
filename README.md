# CELPIP Exam Coach

An AI-powered practice tool for the **CELPIP-General** English exam. Generate fresh questions, practise under timed exam conditions, and receive detailed scoring with actionable feedback. Built with **Vite** and the **OpenAI API** (`gpt-4o-mini` by default, switchable to `gpt-4o` in Settings).

**Live app:** [https://jow30.github.io/CELPIP-training/](https://jow30.github.io/CELPIP-training/)

---

## Features

| Feature | Description |
|---------|-------------|
| **AI-generated questions** | Every session produces unique content via the OpenAI API — no repeated material |
| **All 4 sections** | Listening (6 parts, TTS audio), Reading (4 parts), Writing (2 tasks), Speaking (8 tasks) |
| **Timed sessions** | Official CELPIP time limits enforced per task |
| **Writing evaluation** | Rubric-based score (CLB 3–12), 3–5 concrete suggestions, and a model answer (150–200 words with paragraphs) |
| **Speaking evaluation** | Whisper-powered transcript + rubric-based score + 3–5 suggestions |
| **AI scene images** | DALL-E generates unique scene images for Speaking Tasks 3, 4, and 8 (100+ scene categories) |
| **Continue to next task** | Seamless progression through tasks in every section |
| **Progress tracking** | Session history with scores per task type |

---

## Prerequisites

| Requirement | Minimum | How to check |
|-------------|:-------:|-------------|
| macOS | 12 (Monterey) | `sw_vers` |
| Node.js | 18 LTS | `node -v` |
| npm | 9+ | `npm -v` |
| OpenAI API key | — | [Get one here](https://platform.openai.com/api-keys) |

> **Don't have Node.js?** Install it with [Homebrew](https://brew.sh):
> ```bash
> brew install node
> ```

---

## Installation & Local Usage

```bash
# 1. Clone the repository
git clone git@github.com:jow30/CELPIP-training.git
cd CELPIP-training

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app opens automatically at **http://localhost:5173**. Enter your OpenAI API key in the **Settings** panel (gear icon) to enable AI features.

---

## API Key

| Method | Details |
|--------|---------|
| **In-app Settings** | Enter the key in the Settings panel; saved to `localStorage` |
| **`.env` file** | Set `VITE_OPENAI_API_KEY=sk-...` (loaded at build time) |

The in-app key takes priority. If no key is configured, the app uses a local fallback question bank (limited content, no AI evaluation).

> ⚠️ Your API key is stored locally and never sent anywhere except the OpenAI API.

---

## Maintainer Guide

### Project Structure

```
CELPIP-training/
├── index.html               # Entry point
├── vite.config.js           # Vite config (includes GitHub Pages base path)
├── package.json             # Dependencies and scripts
├── .env.example             # API key template
├── AGENTS.md                # AI agent guidance for development
├── app/
│   ├── scripts/
│   │   ├── main.js              # Router, navigation, home page
│   │   ├── listeningSection.js  # Listening: 6 parts, TTS audio
│   │   ├── readingSection.js    # Reading: 4 parts, passages + MCQ
│   │   ├── writingSection.js    # Writing: 2 tasks, evaluation + model answer
│   │   ├── speakingSection.js   # Speaking: 8 tasks, Whisper + DALL-E images
│   │   └── openaiClient.js      # OpenAI API wrapper (chat, TTS, image, whisper)
│   └── styles/
│       └── index.css            # All styles (design tokens, components, layout)
└── dist/                        # Production build output (deployed to GitHub Pages)
```

### Key Architecture Notes

- **Single-page app** — all routing handled by `main.js` via hash-based navigation.
- **No backend** — everything runs client-side. API calls go directly to OpenAI from the browser.
- **Scene images for Speaking:**
  - Tasks 3/4 — image generated first from 100 random scene seeds, prompt is generic ("describe what you see").
  - Task 8 — prompt generated first from 25 unusual scene seeds, image generated to match the prompt (single GPT call produces both).
  - Task 3 → 4 shares the same image.
- **"Continue → Next Task" buttons** — all 4 sections have a continue button on the results page (hidden on the last task/part of each section).

### Deploying to GitHub Pages

After making code changes, run these 3 steps:

```bash
# 1. Build the production bundle
npm run build

# 2. Deploy dist/ folder to the gh-pages branch
npx gh-pages -d dist

# 3. Push source code to main branch
git add -A && git commit -m "describe your changes" && git push
```

The app will be live at **https://jow30.github.io/CELPIP-training/** within 1–2 minutes.

> **Important:** The `base: '/CELPIP-training/'` setting in `vite.config.js` is required for GitHub Pages. If you rename the repo, update this value to match.

### Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Create production bundle in `dist/` |
| `npx gh-pages -d dist` | Deploy `dist/` to GitHub Pages |

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `node: command not found` | Install Node.js: `brew install node` |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then run `npm install` again |
| Microphone not working | Go to **System Preferences → Privacy & Security → Microphone** and allow your browser |
| API errors (401) | Check that your API key is correct and has available credits |
| Port 5173 in use | Change port in `vite.config.js` or use `npx vite --port 5174` |
| GitHub Pages shows 404 | Ensure `base` in `vite.config.js` matches your repo name, then rebuild and redeploy |

---

## Licence

This project is for personal educational use.

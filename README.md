# CELPIP Exam Coach

An AI-powered practice tool for the **CELPIP-General** English exam. Generate fresh questions, practise under timed exam conditions, and receive detailed scoring with actionable feedback — all running locally on your Mac. Built with **Vite** and the **OpenAI API** (`gpt-4o-mini` by default).

---

## Features

| Feature | Description |
|---------|-------------|
| **AI-generated questions** | Every session produces unique questions via the OpenAI API — no repeated content |
| **All 4 sections** | Listening (6 parts, TTS audio), Reading (4 parts), Writing (2 tasks), Speaking (8 tasks) |
| **Independent practice** | Practise any section or individual task type on its own |
| **Timed sessions** | Official CELPIP time limits enforced per task |
| **Writing evaluation** | Rubric-based score (CLB 3–12) + 3–5 concrete improvement suggestions |
| **Speaking evaluation** | Whisper-powered transcript + rubric-based score + 3–5 suggestions |
| **AI scene images** | DALL-E generates a unique scene picture for Speaking Task 3 every time |
| **Progress tracking** | Session history with scores per task type to track improvement |

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

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/CELPIP-training.git
cd CELPIP-training

# 2. Install dependencies
npm install

# 3. Set up your OpenAI API key
cp .env.example .env
```

Open the `.env` file and add your key:

```
OPENAI_API_KEY=sk-your-key-here
```

> You can also enter the key later through the **Settings** panel in the app.

---

## Usage

### Start the app

```bash
npm run dev
```

The app opens automatically at **http://localhost:5173**.

### Practise a section

1. On the home screen, choose a section: **Listening**, **Reading**, **Writing**, or **Speaking**.
2. Select a specific task type (e.g., "Email Writing") or practise the full section.
3. Complete the timed exercise.
4. Review your evaluation: score, strengths, improvement suggestions, and a model answer.

> **Tip:** Use the **Quick Start** buttons on the home screen for instant access to Writing and Speaking practice.

### Speaking practice

1. Choose a Speaking task (e.g., Task 3 — Describing a Scene).
2. An AI-generated scene image appears on screen (for Task 3).
3. Use the preparation time to plan your response.
4. Record your answer when the timer starts.
5. After submission, review your **transcript**, score, and 3–5 suggestions for improvement.

### Writing practice

1. Choose a Writing task (Email or Survey Response).
2. Read the AI-generated prompt.
3. Write your response (a word counter tracks your progress).
4. After submission, review your score, 3–5 concrete suggestions quoting your own text, and a model answer.

---

## Available Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm test` | Run all unit tests |
| `npm run build` | Create a production bundle (optional) |

---

## API Key

You can provide your OpenAI API key in two ways:

| Method | Details |
|--------|---------|
| **`.env` file** | Set `OPENAI_API_KEY=sk-...` (recommended) |
| **In-app Settings** | Enter the key in the Settings panel; saved to `localStorage` |

The in-app key takes priority. If no key is configured, the app uses a local fallback question bank (limited content, no AI evaluation).

> ⚠️ Your API key is stored locally and never sent anywhere except the OpenAI API.

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `node: command not found` | Install Node.js: `brew install node` |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then run `npm install` again |
| Microphone not working | Go to **System Preferences → Privacy & Security → Microphone** and allow your browser |
| API errors (401) | Check that your API key is correct and has available credits |
| Port 3000 in use | Use a different port: `PORT=3001 npm run dev` |

---

## Project Structure

```
CELPIP-training/
├── app/                  # Web application (HTML, CSS, JS)
│   ├── index.html        # Entry point
│   ├── styles/           # Stylesheets
│   ├── scripts/          # Core modules (question gen, evaluation, audio, etc.)
│   └── components/       # Reusable UI components
├── data/
│   ├── question-bank/    # Fallback questions (offline mode)
│   ├── scene-gallery/    # Fallback scene images (offline mode)
│   ├── prompts/          # OpenAI system prompts per section
│   └── rubrics/          # Scoring rubrics (JSON)
├── tests/                # Automated tests
├── docs/                 # Additional documentation
├── .env.example          # API key template
├── package.json          # Dependencies and scripts
└── AGENTS.md             # Agent guidance (for AI-assisted development)
```

---

## Licence

This project is for personal educational use.

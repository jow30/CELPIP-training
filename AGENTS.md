# CELPIP Exam Coach — Project Overview

## Purpose

This repository contains an AI-powered **CELPIP (Canadian English Language Proficiency Index Program)** exam coach. It helps users prepare for the CELPIP-General Test by generating realistic practice questions, providing an interactive practice environment, and delivering detailed feedback aligned with official CELPIP scoring criteria.

---

## Target Exam: CELPIP-General

The CELPIP-General Test evaluates four language skills — **Listening, Reading, Writing, and Speaking** — and is used for Canadian permanent residency applications and professional certifications. It is fully computer-delivered and takes approximately 3 hours.

Scores are reported on a **12-point scale** (M, 3–12), directly aligned with the **Canadian Language Benchmarks (CLB)**.

---

## Core Features

### 1. AI-Powered Question Generation (OpenAI API)

All questions are **dynamically generated in real time** via the **OpenAI API**, ensuring a fresh, unique set of practice material on every session. No two practice runs will be the same.

- **API key configuration** — the user provides their own OpenAI API key (stored locally, never transmitted elsewhere). The app includes a settings panel to enter, update, or remove the key.
- **Model selection** — defaults to **`gpt-4o-mini`** for cost efficiency. Users can switch to **`gpt-4o`** in the Settings panel for higher-quality output. The app also uses **`whisper-1`** (speech-to-text), **`dall-e-3`** (image generation), and **`tts-1`** (text-to-speech for Listening audio).
- **Prompt engineering** — each section uses carefully crafted system prompts that instruct the model to produce questions matching CELPIP format, difficulty, and Canadian English context.
- **Fallback question bank** — a local bank of pre-written questions is available as a fallback when the API is unreachable or the key is not configured.

Generate exam-style questions for all four CELPIP sections:

#### Listening (6 parts, ~38 questions)
| Part | Task | Description |
|------|------|-------------|
| 1 | Listening to Problem Solving | Understand a conversation about a problem and determine the best solution |
| 2 | Listening to a Daily Life Conversation | Comprehend a conversation about everyday topics |
| 3 | Listening for Information | Extract specific details from an informational dialogue |
| 4 | Listening to a News Item | Understand the main ideas and details from a news-style report |
| 5 | Listening to a Discussion | Follow views and opinions in a discussion |
| 6 | Listening to Viewpoints | Identify and compare opinions from multiple speakers |

#### Reading (4 parts, ~38 questions)
| Part | Task | Description |
|------|------|-------------|
| 1 | Reading Correspondence | Understand written correspondence (e.g., emails, letters) |
| 2 | Reading to Apply a Diagram | Interpret diagrams, tables, or visual information |
| 3 | Reading for Information | Extract key details from informational passages |
| 4 | Reading for Viewpoints | Analyse and compare opinions or viewpoints in written texts |

#### Writing (2 tasks)
| Task | Type | Details |
|------|------|---------|
| 1 | Writing an Email | Write a formal or informal email (~150–200 words, 27 min) |
| 2 | Responding to Survey Questions | Select one option via checkbox, then provide a written explanation (~150–200 words, 26 min) |

#### Speaking (8 tasks, ~15–20 min total)

Each task includes a **preparation period** (30–60 seconds) followed by a **response period** (60–90 seconds). Exact times vary by task.

| Task | Type | Prep | Response | Details |
|------|------|:----:|:--------:|--------|
| 1 | Giving Advice | 30 s | 90 s | Offer advice on a personal situation |
| 2 | Talking About a Personal Experience | 30 s | 60 s | Describe a past experience |
| 3 | **Describing a Scene** ★ | 30 s | 60 s | Describe what is happening in an **AI-generated image** (see below) |
| 4 | Making Predictions ★ | 30 s | 60 s | Based on the **same scene image from Task 3**, predict what will happen in the next few minutes |
| 5 | Comparing and Persuading | 60 s | 60 s | Compare two options and persuade the listener |
| 6 | Dealing With a Difficult Situation | 60 s | 60 s | Handle a challenging interpersonal scenario |
| 7 | Expressing Opinions | 30 s | 90 s | Share and defend a viewpoint |
| 8 | Describing an Unusual Situation | 30 s | 60 s | Explain an unexpected or unusual scenario |

##### ★ AI-Generated Scene Images (Speaking Tasks 3 & 4)

For **Describing a Scene (Task 3)**, the app uses the **OpenAI DALL-E API** to generate a unique scene image. For **Making Predictions (Task 4)**, the **same image from Task 3** is reused, and the user must predict what will happen next.

**Image generation workflow:**
1. The app generates a scene description prompt (e.g., *"A busy Canadian farmers' market on a Saturday morning with diverse vendors and shoppers"*) using GPT, with Canadian context.
2. The prompt is sent to the **DALL-E API** to produce a realistic, detailed scene image.
3. The image is displayed in the exam interface during preparation and response.
4. After Task 3, a **"Continue → Task 4"** button passes the same image and scene metadata to Task 4.
5. The evaluation references key elements in the image to assess completeness (Task 3) or plausibility of predictions (Task 4).

**Image requirements:**
- Scenes should depict **everyday Canadian life** — parks, offices, transit, markets, community events, classrooms, etc.
- Images must contain **multiple people, actions, and details** so the candidate has rich content to describe.
- A variety of settings (indoor/outdoor, urban/rural, seasonal) should be rotated across sessions.

##### Speaking Task Flow — Continue to Next Task

After reviewing results for any speaking task, a **"Continue → Task N+1"** button advances the user to the next task. When continuing from Task 3 to Task 4, the scene image and description are passed automatically so the same picture is reused.

---

### 2. Practice Environment

Provide an interactive, timed practice experience that mirrors the real exam. The home screen offers **two modes**:

#### 🎓 Exam Mode

A sequential, full-exam simulation that mirrors the real CELPIP test:
- Sections are completed in order: **Listening → Reading → Writing → Speaking**
- Each section auto-advances to the next with a "Continue to next section" prompt
- **No back button** — the user cannot return to a previous section once advanced
- All tasks within each section are completed in sequence

#### 📝 Practice Mode

Free-form practice where the user can select any individual section and task:
- Choose any section (Listening, Reading, Writing, Speaking) from the section grid
- Within each section, pick a specific task type to drill
- Track scores per task type in session history

> **Writing & Speaking** receive enhanced support as they are the most challenging for many test-takers, with targeted drills, rubric-based evaluation, and concrete improvement suggestions.

#### General Practice Features

- **Timed sessions** — enforce official time limits per section and task
- **Audio playback for Listening** — audio clips are **generated dynamically via the OpenAI TTS API** (`tts-1`) from AI-generated dialogue scripts; each clip plays only once (matching exam conditions)
- **Text input for Writing** — include a built-in word counter; for Task 2, a **radio button** lets the user select their option before writing
- **Voice recording for Speaking** — capture user audio responses with a preparation countdown timer; if transcription fails, show an error and do NOT evaluate placeholder text
- **AI-generated scene display for Speaking Tasks 3 & 4** — show the DALL-E-generated image prominently in the exam interface
- **Multiple-choice interface for Listening & Reading** — present options in a clear, exam-like UI

---

### 3. Answer Evaluation

Evaluate user responses with targeted, criteria-based feedback:

#### Listening & Reading (Objective)
- Automatic scoring against answer keys
- Per-question feedback explaining correct answers and common traps

#### Writing
Evaluate on official CELPIP criteria:
| Criterion | What Is Assessed |
|-----------|-----------------|
| **Content / Coherence** | Logical flow, relevance, and completeness of ideas |
| **Vocabulary** | Range, precision, and appropriateness of word choice |
| **Readability** | Sentence structure, grammar, and punctuation |
| **Task Fulfillment** | Whether the response addresses all parts of the prompt |

**Writing-specific: Concrete Improvement Suggestions**

In addition to the rubric-based score, every Writing evaluation must include **3–5 concrete, actionable improvement suggestions**. Each suggestion should:
- Quote or reference a **specific sentence or phrase** from the user's response
- Explain **what is wrong or could be better** (e.g., grammar error, vague vocabulary, weak transition)
- Provide a **rewritten example** showing the improved version
- Indicate which **scoring criterion** the suggestion addresses

Example format:
> **Suggestion 1 (Vocabulary):** You wrote *"The place is very good."* — this is vague. Consider: *"The neighbourhood offers excellent amenities, including well-maintained parks and a vibrant community centre."*

#### Speaking
Evaluate on official CELPIP criteria:
| Criterion | What Is Assessed |
|-----------|-----------------|
| **Content / Coherence** | Organization and relevance of ideas |
| **Vocabulary** | Range and accuracy of vocabulary |
| **Listenability** | Pronunciation, intonation, pace, and fluency |
| **Task Fulfillment** | Completeness and appropriateness of the response |

**Speaking-specific: Transcript Generation**

After the user finishes recording, the audio is sent to the **OpenAI Whisper API** for speech-to-text transcription. The full transcript is:
- **Displayed to the user** alongside the evaluation results, so they can review exactly what they said
- **Used as input** for the AI evaluator to score the response on the rubric criteria above
- **Stored in session history** for future reference and progress tracking

**Speaking-specific: Concrete Improvement Suggestions**

Based on the transcript, every Speaking evaluation must include **3–5 concrete, actionable improvement suggestions**. Each suggestion should:
- Quote or reference a **specific phrase or sentence** from the transcript
- Explain **what is wrong or could be better** (e.g., filler words, limited vocabulary, disorganised ideas, incomplete task coverage)
- Provide a **rephrased example** showing how to express the same idea more effectively
- Indicate which **scoring criterion** the suggestion addresses

Example format:
> **Suggestion 1 (Vocabulary):** You said *"The thing is very good and people like it."* — this is vague. Consider: *"The community programme has been highly beneficial, attracting residents of all ages."*
>
> **Suggestion 2 (Listenability):** You said *"um... so... I think... uh..."* — frequent filler words reduce fluency. Try pausing silently instead of filling gaps with filler sounds.

Each evaluation should provide:
- The **full transcript** of the user's spoken response
- An estimated **CLB/CELPIP score** (3–12 scale)
- **Strengths** highlighted in the response
- **3–5 concrete improvement suggestions** based on the transcript (as described above)
- A **model answer** or key points for comparison (150–200 words with separate paragraphs for Writing tasks)

---

## Technical Architecture (Proposed)

```
CELPIP-training/
├── AGENTS.md                  # This file — project overview and agent guidance
├── README.md                  # User-facing documentation
├── package.json               # npm dependencies and scripts (dev, test, build)
├── vite.config.js             # Vite configuration (dev server, build, env)
├── .env.example               # Template for environment variables (OPENAI_API_KEY)
├── .gitignore                 # Ignores node_modules/, .env, dist/, etc.
├── app/                       # Main web application
│   ├── index.html             # Entry point (Vite root)
│   ├── styles/                # CSS / design system
│   ├── scripts/               # JavaScript ES modules
│   │   ├── openaiClient.js        # OpenAI API wrapper (key mgmt, model selection, requests)
│   │   ├── imageGenerator.js      # DALL-E 3 scene image generation for Speaking Task 3
│   │   ├── ttsGenerator.js        # TTS API audio generation for Listening section
│   │   ├── questionGenerator.js   # AI-powered question creation per section
│   │   ├── practiceEngine.js      # Manages timed practice sessions
│   │   ├── evaluator.js           # AI-powered scoring and feedback
│   │   ├── writingSuggestions.js   # Generates 3–5 concrete writing improvements
│   │   ├── speechTranscriber.js   # Whisper API speech-to-text for Speaking responses
│   │   ├── speakingSuggestions.js  # Generates 3–5 concrete speaking improvements from transcript
│   │   └── audioManager.js        # Handles audio playback & recording
│   └── components/            # Reusable UI components
│       ├── sectionSelector.js     # Section picker with quick-start for Writing & Speaking
│       └── sessionHistory.js      # Progress tracking and score history
├── data/
│   ├── question-bank/         # Fallback question templates (offline mode)
│   │   ├── listening/
│   │   ├── reading/
│   │   ├── writing/
│   │   └── speaking/
│   ├── scene-gallery/         # Fallback scene images for Speaking Task 3 (offline mode)
│   ├── prompts/               # OpenAI system prompts per section & task
│   │   ├── listening-prompts.json
│   │   ├── reading-prompts.json
│   │   ├── writing-prompts.json
│   │   └── speaking-prompts.json
│   └── rubrics/               # Scoring rubrics and criteria definitions
│       ├── writing-rubric.json
│       └── speaking-rubric.json
├── tests/                     # Automated tests
└── docs/                      # Additional documentation
    ├── scoring-guide.md
    └── question-design.md
```

---

## Local Setup (macOS)

The app must be easy to install and run on a Mac with a single sequence of terminal commands. No Docker, no external databases, no complex build pipelines.

### Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|:-:|---|
| **macOS** | 12 (Monterey) or later | `sw_vers` |
| **Node.js** | 18 LTS | `node -v` |
| **npm** | 9+ | `npm -v` |
| **Microphone access** | — | System Preferences → Privacy & Security → Microphone |

> [!NOTE]
> If Node.js is not installed, the agent should install it via Homebrew: `brew install node`

### Install & Run

```bash
# 1. Clone the repository (if not already cloned)
git clone https://github.com/<user>/CELPIP-training.git
cd CELPIP-training

# 2. Install dependencies
npm install

# 3. Configure the OpenAI API key
cp .env.example .env
# Then edit .env and paste your API key:
#   OPENAI_API_KEY=sk-...

# 4. Start the local dev server
npm run dev
# → App opens at http://localhost:3000
```

The `npm run dev` command uses **Vite** and will:
- Start the Vite development server with **hot module replacement (HMR)**
- Automatically open the default browser to `http://localhost:5173` (Vite default)
- Reflect code changes instantly without manual refresh

### Key npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the local development server with hot reload |
| `npm test` | Run all unit tests |
| `npm run build` | (Optional) Create a production bundle |

### API Key Configuration

The user can configure their OpenAI API key in **two ways**:
1. **`.env` file** — set `OPENAI_API_KEY=sk-...` (recommended for development)
2. **In-app settings panel** — enter the key in the UI; it is saved to `localStorage`

The in-app key takes precedence over the `.env` key. If neither is set, the app falls back to the local question bank and shows a prompt asking the user to configure a key.

### Troubleshooting

| Issue | Solution |
|-------|---------|
| `node: command not found` | Install Node.js: `brew install node` |
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then retry |
| Microphone not working | Grant microphone permission in System Preferences → Privacy & Security → Microphone for your browser |
| API calls fail with 401 | Verify your `OPENAI_API_KEY` is correct and has sufficient credits |
| Port 3000 already in use | Stop the other process or set a custom port: `PORT=3001 npm run dev` |

---

## Scoring Reference

| CELPIP Score | CLB Level | Proficiency Description |
|:---:|:---:|---|
| 12 | 12 | Advanced proficiency |
| 11 | 11 | Advanced proficiency |
| 10 | 10 | Highly competent |
| 9 | 9 | Competent |
| 8 | 8 | Good |
| 7 | 7 | Adequate (common immigration minimum) |
| 6 | 6 | Developing |
| 5 | 5 | Acquiring |
| 4 | 4 | Below adequate |
| 3 | 3 | Initial |
| M | — | Minimal |

---

## Testing

When building or modifying the app, the agent must run the following tests to verify correctness.

### 1. Unit Tests

Run automated unit tests covering core logic modules:

| Module | What to Test |
|--------|-------------|
| `questionGenerator.js` | Output structure matches expected CELPIP format per section/task |
| `evaluator.js` | Scoring logic produces valid CLB 3–12 ratings |
| `writingSuggestions.js` | Returns 3–5 suggestions, each with a quote, explanation, rewrite, and criterion |
| `speechTranscriber.js` | Whisper API call returns a valid transcript string from audio input |
| `speakingSuggestions.js` | Returns 3–5 suggestions referencing specific transcript phrases |
| `imageGenerator.js` | Prompt construction produces valid DALL-E prompts with Canadian context |
| `practiceEngine.js` | Timer logic, section routing, and state management |
| `audioManager.js` | Recording start/stop, playback controls |

```bash
# Run all unit tests
npm test
```

### 2. OpenAI API Integration Tests

These tests verify live API calls for question generation, answer evaluation, and image generation.

> [!IMPORTANT]
> **The agent does not have an API key.** Before running integration tests, the agent must **ask the user to provide their OpenAI API key**. The key should be set as an environment variable or entered in the app's settings panel. Never hard-code or log the key.

Tests to run:
- **Question generation** — call the API for each section (Listening, Reading, Writing, Speaking) and validate the response structure
- **Writing evaluation** — submit a sample Writing response and verify that the returned evaluation includes a score, rubric breakdown, 3–5 suggestions, and a model answer
- **Speech transcription** — submit a sample audio recording to Whisper and verify a valid transcript is returned
- **Speaking evaluation** — submit a transcript and verify the evaluation includes a score, rubric breakdown, 3–5 transcript-based suggestions, and a model answer
- **DALL-E image generation** — request a scene image and verify a valid image URL is returned
- **Error handling** — confirm graceful fallback to the local question bank / scene gallery when the API key is missing or the request fails

### 3. UI / Browser Tests

Open the app in the browser and verify:
- Home screen renders with Exam Mode and Practice Mode buttons and the section grid
- Each section launches independently and displays the correct task types
- Timer starts, counts down, and stops the session when time expires
- Writing text area shows a live word counter
- Speaking Task 3 displays an AI-generated scene image before recording starts
- Settings panel allows entering, updating, and removing the API key
- Session history page shows past scores per task type

### 4. End-to-End Workflow Tests

Complete a full practice flow for each priority section:

**Writing E2E:**
1. Select Writing → Task 1 (Email Writing)
2. Verify a fresh prompt is generated via OpenAI
3. Type a sample response
4. Submit and confirm evaluation returns: score, rubric breakdown, 3–5 concrete suggestions, and model answer

**Speaking E2E:**
1. Select Speaking → Task 3 (Describing a Scene)
2. Verify a DALL-E scene image is generated and displayed
3. Record an audio response
4. Submit and confirm:
   - A **full transcript** of the spoken response is displayed
   - Evaluation returns: score, rubric breakdown, 3–5 transcript-based suggestions, and model answer

---

## Agent Guidelines

When working in this repository, the AI agent should:

1. **Follow CELPIP standards** — all generated questions and evaluations must align with the official exam format and scoring rubrics described above.
2. **Use Canadian English** — spelling, cultural context, and scenarios should reflect Canadian norms (e.g., "colour" not "color", references to Canadian cities, institutions, and daily life).
3. **Maintain difficulty parity** — generated questions should match the difficulty range of the actual CELPIP exam (CLB 3–12).
4. **Provide constructive feedback** — evaluations should be encouraging, specific, and actionable, pointing users toward concrete improvements.
5. **Respect time constraints** — the practice environment must enforce realistic time limits to prepare users for test-day pressure.
6. **Prioritise accessibility** — the UI should be clean, readable, and usable across devices.
7. **Protect the API key** — the OpenAI API key must be stored locally only (e.g., `localStorage` or `.env`). It must never be hard-coded, logged to the console, committed to version control, or transmitted to any server other than the OpenAI API.

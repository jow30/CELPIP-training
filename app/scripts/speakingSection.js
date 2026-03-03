/**
 * Speaking Section — Task selection, DALL-E scene images, audio recording,
 * Whisper transcription, AI evaluation with suggestions, and results.
 */

import { chatCompletionJSON, generateImage, transcribeAudio, hasApiKey } from './openaiClient.js';
import { navigate, renderHeader, bindNavListeners, renderBackButton, renderTimer, startTimer } from './main.js';

const SPEAKING_TASKS = [
  { id: 1, name: 'Giving Advice', description: 'Offer advice on a personal situation.', prep: 30, response: 90 },
  { id: 2, name: 'Talking About a Personal Experience', description: 'Describe a past experience.', prep: 30, response: 60 },
  { id: 3, name: 'Describing a Scene', description: 'Describe what is happening in an AI-generated image.', prep: 30, response: 60, hasImage: true },
  { id: 4, name: 'Making Predictions', description: 'Based on the same scene image, predict what will happen next.', prep: 30, response: 60, hasImage: true, usesTask3Image: true },
  { id: 5, name: 'Comparing and Persuading', description: 'Compare two options and persuade the listener.', prep: 60, response: 60 },
  { id: 6, name: 'Dealing With a Difficult Situation', description: 'Handle a challenging interpersonal scenario.', prep: 60, response: 60 },
  { id: 7, name: 'Expressing Opinions', description: 'Share and defend a viewpoint.', prep: 30, response: 90 },
  { id: 8, name: 'Describing an Unusual Situation', description: 'Explain an unexpected or unusual scenario shown in an image.', prep: 30, response: 60, hasImage: true },
];

/* ============================================
   Section Overview (Task Selector)
   ============================================ */
export function renderSpeakingSection(container) {
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Home')}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">🎤 Speaking Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a task to practise. Each includes preparation and recording time.</p>

      <div class="task-list">
        ${SPEAKING_TASKS.map(task => `
          <div class="task-item" data-task-id="${task.id}">
            <div class="task-info">
              <h4>Task ${task.id}: ${task.name} ${task.hasImage ? '🖼️' : ''}</h4>
              <p>${task.description}</p>
            </div>
            <div class="task-meta">
              <div>Prep: ${task.prep}s</div>
              <div>Response: ${task.response}s</div>
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
      navigate('speaking-practice', { taskId });
    });
  });
}

/* ============================================
   Practice View
   ============================================ */
export async function renderSpeakingPractice(container, params = {}) {
  const taskId = params.taskId || 1;
  const task = SPEAKING_TASKS.find(t => t.id === taskId) || SPEAKING_TASKS[0];

  // Check if scene data was passed from a previous task (Task 3 → Task 4)
  let sceneImageUrl = params.sceneImageUrl || null;
  let sceneDescription = params.sceneDescription || null;

  // Loading state
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      ${renderBackButton('Speaking')}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating your speaking prompt${task.hasImage && !sceneImageUrl ? ' and scene image' : ''}...</p>
      </div>
    </main>
  `;
  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('speaking'));

  // Generate prompt and image
  let prompt;
  try {
    if (taskId === 8) {
      // Task 8: use a single random scene seed for BOTH prompt and image
      const result = await generateTask8PromptAndImage();
      prompt = { prompt: result.prompt };
      sceneImageUrl = result.imageUrl;
      sceneDescription = result.sceneDescription;
    } else {
      // Tasks 3/4: generate image first, then prompt references it
      if (task.hasImage && !sceneImageUrl) {
        const sceneResult = await generateSceneImage(taskId);
        sceneImageUrl = sceneResult.imageUrl;
        sceneDescription = sceneResult.sceneDescription;
      }
      prompt = await generateSpeakingPrompt(taskId, sceneDescription);
    }
  } catch (err) {
    prompt = getFallbackSpeakingPrompt(taskId);
  }

  // Render preparation phase
  renderPrepPhase(container, task, prompt, sceneImageUrl, sceneDescription);
}

/* ============================================
   Preparation Phase
   ============================================ */
function renderPrepPhase(container, task, prompt, sceneImageUrl, sceneDescription) {
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${renderBackButton('Speaking')}
          <h2 style="margin-top: var(--space-2);">Task ${task.id}: ${task.name}</h2>
        </div>
        <div>
          <span class="badge badge-warning">Preparation</span>
          <span id="timer-display" style="margin-left: var(--space-2);">${renderTimer(task.prep)}</span>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-speaking);">Prompt</h3>
        <p style="line-height: 1.7;">${prompt.prompt}</p>
      </div>

      ${sceneImageUrl ? `
        <div class="scene-image-container">
          <img src="${sceneImageUrl}" alt="Scene to describe" />
        </div>
      ` : ''}

      <div style="text-align: center; padding: var(--space-4);">
        <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin-bottom: var(--space-4);">Use this time to plan your response. Recording will start automatically.</p>
        <button class="btn btn-primary btn-lg" id="btn-start-recording">Start Recording Now</button>
      </div>
    </main>
  `;

  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('speaking'));

  const timerDisplay = document.getElementById('timer-display');
  const stopTimer = startTimer(task.prep, (remaining) => {
    timerDisplay.innerHTML = renderTimer(remaining);
  }, () => {
    renderRecordingPhase(container, task, prompt, sceneImageUrl, sceneDescription);
  });

  document.getElementById('btn-start-recording')?.addEventListener('click', () => {
    stopTimer();
    renderRecordingPhase(container, task, prompt, sceneImageUrl, sceneDescription);
  });
}

/* ============================================
   Recording Phase
   ============================================ */
async function renderRecordingPhase(container, task, prompt, sceneImageUrl, sceneDescription) {
  let mediaRecorder, audioChunks = [], audioBlob = null;

  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div class="practice-header">
        <div>
          <h2>Task ${task.id}: ${task.name}</h2>
        </div>
        <div>
          <span class="badge badge-error">● Recording</span>
          <span id="timer-display" style="margin-left: var(--space-2);">${renderTimer(task.response)}</span>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <p style="line-height: 1.7;">${prompt.prompt}</p>
      </div>

      ${sceneImageUrl ? `
        <div class="scene-image-container">
          <img src="${sceneImageUrl}" alt="Scene to describe" />
        </div>
      ` : ''}

      <div class="recording-controls">
        <div class="record-btn recording" id="record-indicator">🎙️</div>
        <p style="color: var(--color-error); font-weight: 600;">Recording in progress...</p>
        <button class="btn btn-primary btn-lg" id="btn-stop-recording">Stop & Submit</button>
      </div>
    </main>
  `;

  // Start recording
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.start();
  } catch (err) {
    alert('Microphone access is required for speaking practice. Please allow microphone access in your browser settings.');
    navigate('speaking');
    return;
  }

  // Timer
  const timerDisplay = document.getElementById('timer-display');
  const stopTimer = startTimer(task.response, (remaining) => {
    timerDisplay.innerHTML = renderTimer(remaining);
  }, () => {
    finishRecording();
  });

  function finishRecording() {
    stopTimer();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
      processResponse(container, task, prompt, sceneImageUrl, sceneDescription, audioBlob);
    };
  }

  document.getElementById('btn-stop-recording')?.addEventListener('click', finishRecording);
}

/* ============================================
   Process Response (Transcription + Evaluation)
   ============================================ */
async function processResponse(container, task, prompt, sceneImageUrl, sceneDescription, audioBlob) {
  container.innerHTML = `
    ${renderHeader()}
    <main class="container">
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);" id="processing-status">Transcribing your response...</p>
      </div>
    </main>
  `;

  let transcript = '';
  try {
    transcript = await transcribeAudio(audioBlob);
  } catch (err) {
    transcript = '';
  }

  // If transcription failed or returned empty, show error — do NOT evaluate placeholder text
  if (!transcript || transcript.trim().length === 0) {
    container.innerHTML = `
      ${renderHeader()}
      <main class="container results-container">
        ${renderBackButton('Speaking')}
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <p style="font-size: var(--font-size-xl); margin-bottom: var(--space-3);">🎙️</p>
          <p style="color: var(--color-error); font-weight: 600; margin-bottom: var(--space-3);">No speech detected</p>
          <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-6);">We couldn't detect any speech in your recording. Please make sure your microphone is working and try speaking clearly.</p>
          <div style="display: flex; gap: var(--space-3); justify-content: center;">
            <button class="btn btn-secondary" id="btn-back-speaking">← Back to Speaking</button>
            <button class="btn btn-primary" id="btn-retry">Try Again</button>
          </div>
        </div>
      </main>
    `;
    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('speaking'));
    document.getElementById('btn-back-speaking')?.addEventListener('click', () => navigate('speaking'));
    document.getElementById('btn-retry')?.addEventListener('click', () => navigate('speaking-practice', { taskId: task.id }));
    return;
  }

  document.getElementById('processing-status').textContent = 'Evaluating your response...';

  let evaluation;
  try {
    evaluation = await evaluateSpeakingResponse(task.id, prompt, transcript, sceneDescription);
  } catch (err) {
    container.innerHTML = `
      ${renderHeader()}
      <main class="container results-container">
        ${renderBackButton('Speaking')}
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <p style="color: var(--color-error); margin-bottom: var(--space-4);">❌ Evaluation failed: ${err.message}</p>
          <button class="btn btn-primary" id="btn-retry">Try Again</button>
        </div>
      </main>
    `;
    bindNavListeners();
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('speaking'));
    document.getElementById('btn-retry')?.addEventListener('click', () => navigate('speaking-practice', { taskId: task.id }));
    return;
  }

  renderSpeakingResults(container, task, prompt, transcript, audioBlob, evaluation, sceneImageUrl, sceneDescription);
}

/* ============================================
   Results View
   ============================================ */
function renderSpeakingResults(container, task, prompt, transcript, audioBlob, evaluation, sceneImageUrl, sceneDescription) {
  const audioUrl = URL.createObjectURL(audioBlob);
  const nextTask = SPEAKING_TASKS.find(t => t.id === task.id + 1);

  // Build continue button — pass scene data when going Task 3 → Task 4
  let continueBtn = '';
  if (nextTask) {
    continueBtn = `<button class="btn btn-primary" id="btn-continue-task">Continue → Task ${nextTask.id}: ${nextTask.name}</button>`;
  }

  container.innerHTML = `
    ${renderHeader()}
    <main class="container results-container">
      ${renderBackButton('Speaking')}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">🎤 Speaking Evaluation</h2>

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

      <!-- Transcript -->
      <div class="transcript-box">
        <h3>Your Transcript</h3>
        <p class="transcript-text">${transcript}</p>
        <audio controls src="${audioUrl}" style="width: 100%; margin-top: var(--space-3);"></audio>
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
          <p>${evaluation.model_answer}</p>
        </div>
      ` : ''}

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-speaking">← Back to Speaking</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${continueBtn}
      </div>
    </main>
  `;

  bindNavListeners();
  document.getElementById('btn-back')?.addEventListener('click', () => navigate('speaking'));
  document.getElementById('btn-back-speaking')?.addEventListener('click', () => navigate('speaking'));
  document.getElementById('btn-retry')?.addEventListener('click', () => navigate('speaking-practice', { taskId: task.id }));

  // Continue to next task — pass scene data from Task 3 to Task 4
  document.getElementById('btn-continue-task')?.addEventListener('click', () => {
    const nextParams = { taskId: task.id + 1 };
    // If continuing from Task 3, pass the scene image and description to Task 4
    if (task.id === 3 && sceneImageUrl && sceneDescription) {
      nextParams.sceneImageUrl = sceneImageUrl;
      nextParams.sceneDescription = sceneDescription;
    }
    navigate('speaking-practice', nextParams);
  });

  saveToHistory('speaking', task.id, evaluation);
}

/* ============================================
   OpenAI Prompt Generation
   ============================================ */
async function generateSpeakingPrompt(taskId, sceneDescription = null) {
  const taskDesc = SPEAKING_TASKS.find(t => t.id === taskId);

  // Task 4 uses the same scene image as Task 3
  if (taskId === 4 && sceneDescription) {
    return {
      prompt: `Look at the image carefully. Based on what you see happening in this scene, what do you think will happen in the next few minutes? Make predictions about the people, their actions, and the situation. Explain why you think those things will happen.`
    };
  }

  // Task 3 prompt is always about describing the scene
  if (taskId === 3) {
    return {
      prompt: `Look at the image and describe what you see. Include as many details as possible about the people, their actions, the objects, and the setting. Try to describe the scene completely.`
    };
  }

  // Task 8 is handled by generateTask8PromptAndImage() — skip here

  const systemPrompt = `You are a CELPIP exam question writer. Generate a Speaking Task ${taskId} (${taskDesc.name}) prompt.
The scenario should be realistic and set in a Canadian context (workplace, community, neighbourhood, school, etc.).
Use Canadian English spelling.
Return JSON: { "prompt": "the full prompt text for the test-taker" }`;

  return await chatCompletionJSON([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Generate a new unique CELPIP speaking prompt.' },
  ]);
}

async function generateTask8PromptAndImage() {
  // Pick ONE random unusual scene — use it for BOTH the speaking prompt AND the image
  const UNUSUAL_SCENES = [
    { setting: 'a kitchen', event: 'the sink started overflowing with foam and water, someone slipped on the wet floor, a cat jumped onto the counter and started eating from a pot, and smoke began rising from a burnt pan' },
    { setting: 'a living room', event: 'a large tree branch crashed through the window during a storm, rain started pouring in, and someone was frantically trying to cover furniture with plastic sheets while a child chased a dog through the mess' },
    { setting: 'an office', event: 'the ceiling tiles suddenly collapsed, papers scattered everywhere, the fire sprinkler turned on spraying water, and employees were scrambling to save their laptops' },
    { setting: 'a busy street', event: 'a delivery truck tipped over spilling hundreds of oranges, people started slipping on them, a dog ran away with one, and traffic backed up for blocks' },
    { setting: 'a backyard barbecue', event: 'the grill caught fire, someone started spraying it with a garden hose, a large dog knocked over the food table, and all the guests ran in different directions' },
    { setting: 'a classroom', event: 'a science experiment exploded with colourful smoke filling the room, one student was covered in foam, glass beakers crashed to the floor, and the teacher looked completely shocked' },
    { setting: 'a parking lot', event: 'a shopping cart rolled into a car, groceries scattered across the ground, a bird swooped down and stole a loaf of bread, and someone chased a rolling watermelon across the pavement' },
    { setting: 'a restaurant', event: 'a waiter tripped and sent plates of food flying through the air, diners jumped out of the way, soup dripped off a tablecloth, and the chef peeked horrified through the kitchen window' },
    { setting: 'a wedding outdoors', event: 'a strong gust of wind blew away all the decorations, the wedding cake started tilting dangerously, the ring bearer chased a ring rolling across the grass, and guests grabbed at flying napkins' },
    { setting: 'a zoo', event: 'a monkey escaped its enclosure and sat on a visitor\'s head, a zookeeper tried to lure it down with a banana, children were laughing and pointing, and someone\'s ice cream fell on the ground' },
    { setting: 'a supermarket', event: 'one shelf toppled over like a domino knocking over two more, cans rolled everywhere across the floor, a customer got stuck in the aisle, and the manager was yelling into a phone' },
    { setting: 'a laundromat', event: 'three washing machines started overflowing with suds at the same time, someone\'s red sock dyed all their white clothes bright pink, a child was sliding across the soapy floor, and one machine was shaking violently' },
    { setting: 'a library', event: 'a towering stack of books fell like dominoes across multiple tables, a student got buried under a pile of encyclopedias, the librarian was shushing everyone frantically, and a toddler was cheerfully ripping pages from a picture book' },
    { setting: 'an airport baggage area', event: 'suitcases were piling up and falling off the carousel, a dog escaped from a pet carrier and ran loose through the hall, a child climbed onto the conveyor belt, and a security guard was speaking urgently into a radio' },
    { setting: 'a public swimming pool', event: 'someone did an enormous cannonball that splashed the fully-clothed lifeguard, pool floats scattered in every direction, a child\'s goggles flew off their face, and an elderly swimmer clutched the lane rope in surprise' },
    { setting: 'a hair salon', event: 'a client\'s hair dye turned bright green instead of blonde, another client\'s hair dryer sent curlers flying across the room, a mirror fell off the wall, and the stylist put her hands up in total disbelief' },
    { setting: 'a bowling alley', event: 'the ball return machine started spitting out balls rapidly in all directions, someone slipped on the oiled lane, pins scattered beyond the back curtain, and an employee was crawling toward the emergency stop button' },
    { setting: 'a campsite', event: 'a bear tore open a cooler and started eating everything inside, marshmallows roasting on the fire caught flame, a tent collapsed on someone still sleeping inside, and two raccoons dragged a bag of chips into the bushes' },
    { setting: 'a science fair', event: 'a volcano model erupted too aggressively and sprayed red goop all over the judges, a robot project rolled off the table, a solar system model started losing planet pieces, and a parent tried to photograph the whole chaotic scene' },
    { setting: 'a movie theatre', event: 'a giant soda spilled and cascaded down the stadium seating rows, popcorn scattered across the aisle, someone\'s phone started ringing loudly during the quiet scene, and an usher was shining a flashlight trying to find who it belonged to' },
    { setting: 'a gym', event: 'someone dropped a heavy barbell that cracked the floor, a treadmill was running with nobody on it and launched a towel across the room, a water fountain started spraying sideways, and a yoga class in the corner tried to continue their session peacefully' },
    { setting: 'a food truck festival', event: 'a giant inflatable taco decoration deflated and fell onto the crowd, condiment bottles burst open, a small dog got tangled in the decoration flags, and a musician on stage accidentally knocked a speaker into a puddle' },
    { setting: 'a dentist\'s waiting room', event: 'a ceiling pipe burst and water started raining down on everyone, magazines floated across the floor, the receptionist climbed onto her chair to avoid the water, and one patient opened an umbrella right there indoors' },
    { setting: 'a playground', event: 'the merry-go-round was spinning way too fast, a swing wrapped completely around the top bar, a juice box sprayed all over a parent\'s white shirt, and a squirrel stole a granola bar right out of a stroller' },
    { setting: 'a car dealership showroom', event: 'a test-drive car rolled straight through the glass entrance doors into the showroom, balloons started popping everywhere, a salesman dove behind a desk for cover, and the driver stood outside frozen with the keys in hand' },
  ];

  const scene = UNUSUAL_SCENES[Math.floor(Math.random() * UNUSUAL_SCENES.length)];

  // Generate BOTH prompt and image description from the SAME scene in a single API call
  const result = await chatCompletionJSON([
    { role: 'system', content: 'You are a CELPIP exam question writer AND a scene illustrator. Based on the unusual situation described below, generate TWO things:\n\n1. A speaking prompt for CELPIP Speaking Task 8 (Describing an Unusual Situation). Frame it as: "You were at [setting] when [event happened]. Describe what you saw to a friend."\n\n2. A detailed visual description of this EXACT same scene for generating an illustration. Include specific visual details: people\'s expressions, body positions, clothing, objects, colours, and the environment.\n\nThe setting is: ' + JSON.stringify(scene.setting) + '\nThe event is: ' + JSON.stringify(scene.event) + '\n\nReturn JSON:\n{\n  "prompt": "the full speaking prompt for the test-taker",\n  "description": "a detailed visual scene description for DALL-E",\n  "key_elements": ["element 1", "element 2", ...]\n}' },
    { role: 'user', content: 'Generate the speaking prompt and matching scene description.' },
  ]);

  // Generate image from the description
  const imagePrompt = 'A detailed, realistic illustration: ' + result.description + '. The scene should clearly depict something unusual, unexpected, or chaotic happening. The image should be colourful, well-lit, and show diverse people of various ages. Style: clean digital illustration suitable for an English language exam, with clear visual details that can be described verbally.';
  const imageUrl = await generateImage(imagePrompt);

  return {
    prompt: result.prompt,
    imageUrl,
    sceneDescription: { description: result.description, key_elements: result.key_elements },
  };
}

async function generateSceneImage(taskId = 3) {
  // 100 diverse everyday scene settings for Tasks 3/4
  const SCENE_SETTINGS_NORMAL = [
    // ─── Indoor: Home & Residential ───
    'a family kitchen where a parent is cooking pasta, a teenager is doing homework at the table, a toddler is drawing on the fridge with magnets, and a grandparent is reading a recipe book',
    'a living room on movie night with someone setting up a projector, kids making a blanket fort, a person carrying a bowl of popcorn, and a cat sleeping on the couch',
    'a home garage converted into a workshop with someone building a bookshelf, another person sharpening tools, a child handing nails, and a neighbour peeking in to chat',
    'a laundry room where someone is folding clothes, a child is hiding inside a laundry basket, shirts are hanging on a drying rack, and a washing machine is vibrating loudly',
    'a dining room during a birthday party with someone blowing out candles, guests clapping, a child reaching for cake, and someone taking a photo',
    'a home office where a parent is on a video call, a child is tugging their sleeve, a dog is sleeping under the desk, and a delivery person is ringing the doorbell',
    'a bathroom where a parent is giving a toddler a bath, rubber ducks are floating, an older sibling is brushing teeth, and a towel is falling off the rack',
    'a basement being renovated with someone painting walls, another person laying floor tiles, an electrician checking wires, and a radio playing on a stepladder',

    // ─── Indoor: Workplace ───
    'an open-plan office with someone presenting a slideshow, colleagues taking notes, a person refilling coffee at the break station, and a janitor vacuuming near the entrance',
    'a coworking space with freelancers on laptops, two people brainstorming on a whiteboard, someone on a phone call in a booth, and a barista making coffee at the in-house café',
    'a corporate boardroom with executives debating around a table, an assistant distributing printed reports, someone drawing a chart on a flip board, and a video call participant on screen',
    'a small bakery kitchen with a baker kneading dough, an apprentice decorating cupcakes, someone pulling bread from an oven, and a delivery driver loading boxes at the back door',
    'a newsroom with journalists typing at desks, an editor reviewing a story on a screen, a camera crew preparing for a live broadcast, and someone pinning headlines on a corkboard',
    'a dental office with a hygienist cleaning a patient\'s teeth, a dentist reviewing x-rays, a receptionist scheduling appointments, and a nervous child in the waiting area holding a toy',
    'a hair salon with a stylist cutting hair, another washing a client\'s hair at the basin, someone sweeping cut hair off the floor, and a customer flipping through a magazine',
    'a real estate office with an agent showing floor plans to a couple, a colleague on the phone, someone printing listing sheets, and a whiteboard showing weekly sales targets',

    // ─── Indoor: Retail & Commercial ───
    'a busy pharmacy with a pharmacist counting pills, a customer asking about vitamins, someone waiting for a prescription, and a technician stocking shelves',
    'a clothing store with shoppers browsing racks, someone trying on a jacket in front of a mirror, a cashier folding items at the counter, and a staff member hanging new arrivals',
    'a hardware store with a customer comparing paint swatches, an employee carrying lumber on a cart, someone testing a power drill, and a family looking at light fixtures',
    'an electronics store with a salesperson demonstrating a laptop, teenagers trying out headphones, someone returning a product at the service desk, and a technician repairing a phone',
    'a pet store with a child watching fish in a tank, someone buying dog food, an employee trimming a poodle, and a parrot repeating words from its cage',
    'a bookstore with a customer reading in a comfy chair, a staff member arranging a display table, someone searching shelves with a list, and a children\'s reading circle in the corner',

    // ─── Indoor: Education ───
    'a high school chemistry lab with students wearing goggles conducting experiments, a teacher supervising, a student writing observations, and someone carefully pouring liquid into a beaker',
    'a university lecture hall with a professor pointing at a slide, students typing on laptops, someone raising a hand, and a late arrival tiptoeing to a seat',
    'a kindergarten classroom with children sitting in a circle for story time, a teacher holding up a book, a child painting at an easel, and another stacking blocks',
    'a music room with a student playing piano, another practising violin, a teacher conducting a small ensemble, and someone arranging sheet music on a stand',
    'a school cafeteria at lunch with students carrying trays, friends sharing a table, a cafeteria worker serving soup, and a teacher monitoring the room',
    'a computer lab with students working on assignments, a teacher helping someone debug code, a printer spitting out pages, and a student plugging in a USB drive',

    // ─── Indoor: Healthcare ───
    'a hospital corridor with a nurse pushing a wheelchair, a doctor reviewing a chart on a tablet, a family visiting with flowers, and a janitor mopping the floor near the elevator',
    'a physiotherapy clinic with a patient doing stretching exercises, a therapist applying tape to a knee, someone lifting small weights, and a receptionist booking the next session',
    'an optometrist\'s office with a patient reading an eye chart, the optometrist adjusting equipment, someone trying on frames at the display wall, and a technician cleaning lenses',
    'a walk-in clinic waiting room with people filling out forms, a nurse calling a name, a mother comforting a sick child, and a TV showing the weather forecast on the wall',

    // ─── Indoor: Recreation & Social ───
    'an indoor swimming pool with swimmers doing laps, a lifeguard on a high chair, children splashing in the shallow end, and a parent wrapping a towel around a shivering kid',
    'a bowling alley with a group high-fiving after a strike, someone selecting a ball from the rack, a child using bumper rails, and a server delivering nachos to a lane',
    'a yoga studio with participants in warrior pose, an instructor adjusting someone\'s posture, candles flickering near the front, and someone unrolling a mat at the back',
    'a community centre pottery class with people shaping clay on wheels, an instructor demonstrating glazing, finished pots drying on shelves, and someone washing their hands at a sink',
    'an ice skating rink with a couple skating hand-in-hand, a child clinging to the boards, a figure skater practising spins in the centre, and a Zamboni waiting at the gate',
    'a karate dojo with students in white uniforms practising kicks, a sensei demonstrating a move, parents watching through a glass window, and trophies displayed in a cabinet',
    'an escape room lobby with a group getting instructions from a game master, another group celebrating their escape, someone taking a group selfie, and a leaderboard on the wall',

    // ─── Indoor: Food & Dining ───
    'a sushi restaurant with a chef slicing fish behind a counter, a server delivering a boat of sushi, diners using chopsticks, and a couple studying the menu',
    'a busy pizza shop with a cook tossing dough in the air, another spreading sauce, a customer waiting at the pick-up counter, and a delivery driver grabbing an order',
    'a dim sum restaurant with carts being pushed between tables, a waiter lifting the lid off a steamer, a family pointing at dishes they want, and a child blowing on a hot dumpling',
    'a coffee shop with a barista pouring latte art, a student studying with earbuds in, two friends laughing at a window seat, and someone ordering at the counter',

    // ─── Outdoor: Streets & Urban ───
    'a downtown sidewalk with a food truck selling tacos, office workers eating on benches, a cyclist locking a bike to a rack, and a street artist painting a mural on a wall',
    'a residential cul-de-sac with kids playing road hockey, a mail carrier delivering packages, a neighbour washing a car in the driveway, and someone trimming a hedge',
    'a crosswalk at a busy city intersection with a crossing guard stopping traffic, students crossing with backpacks, a taxi waiting at the light, and a window washer on scaffolding above',
    'an alley behind restaurants with a chef taking out garbage, a delivery person unloading crates, a cat sitting on a dumpster lid, and graffiti art covering one wall',
    'a suburban sidewalk in autumn with someone raking leaves, a child jumping into a leaf pile, a dog walker passing by, and a postal worker sliding mail into a mailbox',
    'a city bus stop with commuters checking their phones, an elderly person sitting on the bench, a bus approaching in the distance, and a busker playing harmonica nearby',
    'a moving day on a residential street with movers carrying boxes into a truck, a neighbour bringing over a welcome plate, a child riding a tricycle on the sidewalk, and a for-sale sign with a SOLD sticker',

    // ─── Outdoor: Parks & Nature (non-picnic) ───
    'a community garden with people planting seedlings, someone watering tomato plants, a volunteer turning a compost pile, and a child chasing a butterfly along the path',
    'a dog park with owners chatting while dogs play, someone throwing a frisbee, a small dog digging a hole, and a person cleaning up with a bag',
    'a riverside walking trail with joggers, someone fishing from the bank, a family feeding ducks, and a photographer taking pictures of wildflowers',
    'a botanical garden with visitors admiring flowers, a guide leading a tour group, someone sketching a sculpture, and a maintenance worker pruning roses',

    // ─── Outdoor: Sports & Athletics ───
    'a soccer field during a community match with players running, a referee blowing a whistle, parents cheering from the sideline, and a coach talking to substitutes on the bench',
    'a tennis court with two players rallying, a ball boy retrieving a stray ball, someone stretching near the net post, and spectators sitting on bleachers',
    'a basketball court at a neighbourhood park with teenagers playing a pick-up game, someone sitting on the bench tying shoes, a kid shooting alone at the next hoop, and a man walking his dog past the fence',
    'a ski lodge base area with skiers clicking into bindings, a family eating lunch on a patio, a snowboarder adjusting goggles, and a ski patrol member driving a snowmobile',
    'a running track at a public stadium with sprinters racing, a coach timing with a stopwatch, someone doing hurdles, and a group of seniors power-walking the outer lane',
    'a skateboard park with a teenager performing a kickflip, a young child in full pads rolling cautiously, a parent filming on a phone, and a graffitied half-pipe in the background',

    // ─── Outdoor: Markets & Events ───
    'a craft fair in a town square with artisans selling handmade jewellery, a potter demonstrating at a wheel, a face-painter decorating a child, and a balloon artist making animals',
    'a winter holiday market with a vendor selling hot chocolate, couples browsing ornament stalls, a choir singing carols on a small stage, and fairy lights strung between booths',
    'a car boot sale in a church parking lot with people browsing tables of second-hand items, someone haggling over a lamp, a child looking at old toys, and a volunteer selling baked goods',
    'a food festival with tents offering cuisines from different countries, a chef giving a live cooking demo, visitors sampling dishes, and a band playing on a small stage',
    'a flea market under a highway overpass with vendors displaying vintage clothing, someone examining antique cameras, a couple debating over a painting, and a kid riding on a parent\'s shoulders',

    // ─── Outdoor: Transit & Travel ───
    'an airport departure hall with travellers checking in at kiosks, someone hugging family goodbye, a security officer checking passports, and a child pointing at planes through the window',
    'a ferry terminal with passengers boarding with bicycles, a crew member tying rope to a cleat, seagulls on the dock, and someone purchasing a ticket at the booth',
    'a taxi stand outside a hotel with a doorman opening a car door, guests loading luggage into a trunk, a bellhop wheeling bags, and a cyclist waiting at the traffic light',
    'a highway rest stop with families stretching beside their cars, someone walking a dog on a leash, a trucker refuelling, and a vendor selling coffee from a trailer',
    'a bike-share station downtown with someone scanning a QR code to unlock a bike, a tourist consulting a map, a courier making a delivery, and a street sweeper cleaning the curb',

    // ─── Outdoor: Construction & Maintenance ───
    'a road construction zone with a flagger directing traffic, an excavator digging, workers pouring asphalt, and pedestrians detoured to a temporary sidewalk',
    'a house under construction with framers hammering on the roof, an electrician running wire, a plumber fitting pipes, and a supervisor reviewing blueprints on the tailgate of a truck',
    'a hydro crew repairing a power line with a bucket truck raised, a worker in a safety harness, traffic cones blocking the lane, and a curious neighbour watching from a porch',

    // ─── Outdoor: Water & Beach (non-picnic) ───
    'a marina with someone hosing down a sailboat, a family boarding a small motorboat, a fisherman sorting tackle on the dock, and a seagull perching on a post',
    'a public outdoor pool with children jumping off a diving board, a lifeguard scanning the water, seniors doing aquafit, and a parent applying sunscreen to a child',
    'a lake beach with kayakers launching from shore, someone building a sandcastle with a bucket, a stand-up paddleboarder balancing, and a couple walking barefoot along the waterline',

    // ─── Outdoor: Rural & Suburban ───
    'a farm with a tractor ploughing a field, a farmer feeding chickens, children collecting eggs, and a border collie herding sheep near a red barn',
    'a vineyard during harvest with workers picking grapes, a tour guide leading visitors, someone tasting wine at an outdoor bar, and a truck being loaded with crates',
    'a country road with a cyclist riding past a cornfield, a farmer checking a fence, a family at a roadside fruit stand, and a tractor parked near a silo',

    // ─── Outdoor: Winter & Seasonal ───
    'a snowy neighbourhood with someone shovelling a driveway, children building a snowman, a snowplough clearing the street, and a mail carrier in a parka delivering letters',
    'an outdoor ice rink in a town centre with skaters gliding, a hot chocolate stand with a queue, a father tying his daughter\'s skates on a bench, and string lights overhead',
    'a rainy city street with commuters under umbrellas, a puddle splashing as a bus passes, a barista setting out a sandwich board, and someone dashing into a doorway',
    'a spring garden centre with customers loading flats of flowers into carts, an employee watering hanging baskets, a couple choosing a tree, and a child sitting in an empty wheelbarrow',

    // ─── Services & Everyday Errands ───
    'a post office with a clerk weighing a parcel, a customer filling out a customs form, someone buying stamps, and a child dropping a letter into the outgoing mail slot',
    'a bank branch with a teller counting bills, a customer at the ATM, someone sitting with an advisor at a desk, and a security guard standing near the door',
    'a laundromat with people loading machines, someone folding sheets on a table, a student studying while waiting, and a repair technician fixing a dryer',
    'a fire station with firefighters polishing a truck, one sliding down the pole, a Dalmatian lying on the floor, and a school group on a tour taking photos',
    'a car wash with an attendant guiding a sedan onto the track, someone vacuuming their trunk in the self-serve bay, a kid watching the spinning brushes through the window, and an employee drying a finished car',
    'a gas station with a driver filling up, someone buying a bag of ice from a cooler outside, a squeegee being used on a windshield, and a tow truck pulling in with a flat-tired car',

    // ─── Cultural & Community ───
    'a Chinatown street with lanterns overhead, a dim sum restaurant with a queue outside, a herbalist shop with jars in the window, a tai chi class in a small square, and tourists taking photos',
    'a community mural-painting event with volunteers of all ages brushing colour onto a wall, a coordinator pointing at a sketch, kids mixing paint, and a photographer documenting the progress',
    'a cultural festival with dancers in traditional costumes on a stage, audience members clapping, food stalls serving international dishes, and children getting henna tattoos',
    'a public art installation unveiling with the artist speaking into a microphone, a crowd gathered around a large sculpture, a journalist taking notes, and a child sitting on a parent\'s shoulders to see',
    'a church pancake breakfast with volunteers flipping pancakes on a griddle, families seated at long folding tables, a child pouring syrup, and someone making fresh orange juice',
    'a seniors\' centre with elderly people playing cards at one table, others doing gentle stretches in a fitness circle, a volunteer serving tea, and someone teaching a tablet class',
  ];

  // 30 unusual / chaotic scene settings for Task 8
  const SCENE_SETTINGS_UNUSUAL = [
    'a kitchen where the sink is overflowing with foam and water, someone slips on the wet floor, a cat sits on the counter eating from a pot, and smoke rises from a burnt pan on the stove',
    'a living room where a large tree branch has crashed through the window during a storm, rain is pouring in, and someone is covering furniture with plastic sheets while a child chases a dog through the mess',
    'an office where ceiling tiles have collapsed, papers are scattered everywhere, the sprinkler is spraying water, and employees are scrambling to save their laptops',
    'a street where a delivery truck has tipped over spilling hundreds of oranges, people are slipping on them, a dog is running away with one, and traffic is backed up for blocks',
    'a backyard barbecue gone wrong: the grill is on fire, someone is spraying it with a garden hose, a table of food has been knocked over by a large dog, and guests are running in all directions',
    'a classroom where a science experiment has exploded with colourful smoke filling the room, a student is covered in foam, glass beakers are on the floor, and the teacher looks shocked',
    'a parking lot where a shopping cart has rolled into a car, groceries are scattered on the ground, a bird is stealing bread, and someone is chasing a rolling watermelon across the pavement',
    'a dentist\'s waiting room where a ceiling pipe has burst and water is raining down, magazines are floating, the receptionist is standing on her chair, and a patient is using an umbrella indoors',
    'a subway platform where a suitcase has popped open spilling clothes on the tracks, a busker\'s guitar has snapped a string, and pigeons are chasing someone holding a sandwich',
    'a gym where a barbell has dropped creating a crack in the floor, a treadmill is running empty and throwing off a towel, a water fountain is spraying sideways, and a yoga class is trying to continue',
    'a beach where seagulls have stolen an entire picnic spread, a sandcastle has collapsed from a wave, someone\'s inflatable is blowing away, and a lifeguard is chasing a runaway beach umbrella',
    'a restaurant where a waiter has tripped and sent plates flying, diners are dodging food mid-air, soup is dripping off a tablecloth, and the chef is peering horrified through the kitchen window',
    'a wedding ceremony outdoors where the wind has blown away the decorations, the cake is tilting on a table, a ring bearer is chasing a runaway ring, and guests are grabbing for flying napkins',
    'a zoo where a monkey has escaped its enclosure and is sitting on a visitor\'s head, a zookeeper is trying to lure it down with a banana, children are laughing, and an ice cream cone is on the ground',
    'a supermarket where a shelf has toppled like a domino knocking over two more, cans are rolling everywhere, a customer is stuck in the aisle, and a manager is on the phone with wide eyes',
    'a laundromat where machines are overflowing with suds, someone\'s red sock has dyed all their white clothes pink, a child is sliding across the soapy floor, and a machine is shaking violently',
    'a movie theatre where a large soda has spilled down the stadium seats, popcorn is scattered in the aisle, someone\'s phone is ringing loudly, and an usher is shining a flashlight trying to find the source',
    'a public pool where someone has done an enormous cannonball splashing the fully-clothed lifeguard, floaties are scattered, a child\'s goggles are flying off, and an elderly swimmer is clutching the lane rope in surprise',
    'a library where a towering stack of books has fallen like a domino chain across multiple tables, a student is buried under a pile, the librarian is shushing frantically, and a toddler is cheerfully tearing pages',
    'an airport baggage carousel where suitcases are piling up and falling off, a dog has escaped a carrier and is running loose, a child is riding the belt, and a security guard is speaking urgently into a radio',
    'a school hallway where a locker door has popped off its hinges launching a backpack, someone has tripped over a mop bucket spilling grey water, paper airplanes are everywhere, and the principal is sprinting around the corner',
    'a garden where an automatic sprinkler system has gone haywire spraying in random directions, a surprised cat is on a fence, a barbecue has been abandoned, and a child in rain boots is dancing in the spray',
    'a hair salon where a client\'s dye has turned bright green instead of blonde, another client\'s hair dryer has sent rollers flying, a mirror has fallen, and the stylist is holding up her hands in disbelief',
    'an elevator that has opened to reveal people standing in ankle-deep water from a burst pipe above, someone is holding a soggy newspaper, a dog is splashing happily, and the buttons are sparking',
    'a food truck festival where a giant inflatable taco has deflated onto a crowd, condiment bottles have burst, a small dog is tangled in bunting flags, and a musician on stage has dropped a speaker into a puddle',
    'a car dealership where a test-drive car has rolled into the showroom through the glass doors, balloons are popping, a salesman has jumped behind a desk, and the driver is standing outside with keys in hand looking shocked',
    'a bowling alley where the ball return machine is spitting out balls rapidly, someone has slipped on the oiled lane, pins are scattered beyond the curtain, and an employee is crawling to reach the emergency stop button',
    'a camping site where a bear has torn open a cooler, marshmallows are roasting unattended and catching fire, a tent has collapsed with someone inside, and two raccoons are dragging a bag of chips into the bushes',
    'a playground where a merry-go-round is spinning too fast and kids are flying off safely onto rubber mulch, a swing has wrapped around the top bar, a juice box has sprayed on a parent\'s shirt, and a squirrel has stolen a granola bar from a stroller',
    'a science fair where a volcano model has erupted too aggressively spraying red goop on the judges, a robot project is rolling off the table, a solar system model is losing planets, and a parent is trying to photograph the chaos',
  ];

  // Tasks 3/4: pick a random seed setting and generate image from it
  const isUnusual = taskId === 8;
  const settings = isUnusual ? SCENE_SETTINGS_UNUSUAL : SCENE_SETTINGS_NORMAL;
  const randomSetting = settings[Math.floor(Math.random() * settings.length)];

  const taskLabel = isUnusual ? 'an unusual / unexpected situation' : 'an everyday scene in Canadian life';

  // Generate a scene description via GPT, strictly based on the random seed
  const sceneDescription = await chatCompletionJSON([
    { role: 'system', content: `You MUST generate a scene description based on EXACTLY this setting: "${randomSetting}". Do NOT change the location or general activity. Add vivid sensory details (colours, clothing, expressions, objects) to make it suitable as a DALL-E image prompt. Include 5-8 distinct activities or elements. Return JSON: { "description": "A detailed scene description suitable as a DALL-E prompt", "key_elements": ["element 1", "element 2", ...] }` },
    { role: 'user', content: 'Expand this setting into a vivid, detailed scene description.' },
  ]);

  const styleNote = isUnusual
    ? 'The scene should clearly depict something unusual, unexpected, or chaotic happening.'
    : 'The scene should depict normal everyday life with multiple distinct activities.';

  const imagePrompt = `A detailed, realistic illustration: ${sceneDescription.description}. ${styleNote} The image should be colourful, well-lit, and show diverse people of various ages. Style: clean digital illustration suitable for an English language exam, with clear visual details that can be described verbally.`;

  const imageUrl = await generateImage(imagePrompt);
  return { imageUrl, sceneDescription };
}

async function evaluateSpeakingResponse(taskId, prompt, transcript, sceneDescription = null) {
  const taskDesc = SPEAKING_TASKS.find(t => t.id === taskId);

  // Build scene context for Tasks 3 and 4
  let sceneContext = '';
  if (sceneDescription && (taskId === 3 || taskId === 4 || taskId === 8)) {
    const elements = sceneDescription.key_elements ? sceneDescription.key_elements.join(', ') : '';
    sceneContext = `\n\nIMPORTANT — The image shown to the test-taker depicted the following scene:\n"${sceneDescription.description}"\nKey elements visible in the image: ${elements}\n\nYour model answer MUST describe/reference these specific elements from the image. For Task 3, the model answer should describe the scene. For Task 4, the model answer should predict what will happen next based on these scene elements. For Task 8, the model answer should describe the unusual situation depicted in the image.`;
  }

  const systemPrompt = `You are a certified CELPIP examiner evaluating a Speaking Task ${taskId} (${taskDesc.name}) response.
The test-taker's audio has been transcribed into text. Evaluate based on the transcript.

Use official CELPIP speaking criteria. Score on a scale of 3–12 (CLB levels).

Evaluate on these four criteria:
1. Content / Coherence — organization and relevance of ideas
2. Vocabulary — range and accuracy of vocabulary
3. Listenability — assess from transcript: filler words, repetition, incomplete sentences, flow
4. Task Fulfillment — completeness and appropriateness of the response${sceneContext}

Provide 3–5 concrete improvement suggestions. Each must:
- Quote a specific phrase from the transcript
- Explain what is wrong or could be better (filler words, limited vocabulary, disorganised ideas, etc.)
- Provide a rephrased version
- Name which criterion it relates to

Return JSON:
{
  "overall_score": <number 3-12>,
  "rubric": [
    { "criterion": "Content / Coherence", "score": <3-12>, "comment": "..." },
    { "criterion": "Vocabulary", "score": <3-12>, "comment": "..." },
    { "criterion": "Listenability", "score": <3-12>, "comment": "..." },
    { "criterion": "Task Fulfillment", "score": <3-12>, "comment": "..." }
  ],
  "strengths": ["strength 1", "strength 2"],
  "suggestions": [
    { "criterion": "...", "original": "quoted transcript text", "explanation": "...", "improved": "rephrased version" }
  ],
  "model_answer": "A model spoken response that would score 10-12. ${taskId === 3 ? 'Must describe the specific elements shown in the image.' : taskId === 4 ? 'Must make predictions based on the specific scene shown in the image.' : ''}"
}`;

  return await chatCompletionJSON([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Prompt given to the test-taker:\n${prompt.prompt}\n\nTranscript of the test-taker's spoken response:\n${transcript}` },
  ], { max_tokens: 3000 });
}

/* ============================================
   Fallbacks
   ============================================ */
function getFallbackSpeakingPrompt(taskId) {
  const fallbacks = {
    1: { prompt: "Your friend is thinking about moving to a new city for work. They are nervous about starting over. Give them advice on how to settle in and make the transition smoother." },
    2: { prompt: "Describe a memorable trip you took. Where did you go, what did you do, and why was it special?" },
    3: { prompt: "Look at the image and describe what you see. Include details about the people, activities, objects, and setting." },
    4: { prompt: "Look at the image. Based on what you see happening in this scene, what do you think will happen in the next few minutes? Make predictions about the people, their actions, and the situation." },
    5: { prompt: "A friend is deciding between joining a gym or exercising outdoors. Compare both options and try to persuade them to choose one." },
    6: { prompt: "You ordered furniture online, but the wrong items were delivered. Call the customer service line to explain the problem and ask for a resolution." },
    7: { prompt: "Some people think remote work is better than working in an office. Do you agree or disagree? Explain your opinion." },
    8: { prompt: "You arrive at the office on Monday morning and find that all the furniture has been rearranged overnight. Describe the situation to your colleague and discuss what might have happened." },
  };
  return fallbacks[taskId] || fallbacks[1];
}

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
  } catch (e) { }
}

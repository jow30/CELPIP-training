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
    // ─── Home & Domestic ───
    { setting: 'a kitchen', event: 'the sink started overflowing with foam and water, someone slipped on the wet floor, a cat jumped onto the counter and started eating from a pot, and smoke began rising from a burnt pan' },
    { setting: 'a living room', event: 'a large tree branch crashed through the window during a storm, rain started pouring in, and someone was frantically trying to cover furniture with plastic sheets while a child chased a dog through the mess' },
    { setting: 'a backyard barbecue', event: 'the grill caught fire, someone started spraying it with a garden hose, a large dog knocked over the food table, and all the guests ran in different directions' },
    { setting: 'a kitchen', event: 'a blender exploded sending smoothie across the ceiling and walls, the dog started licking the floor, a smoke alarm went off from burnt toast, and a child was crying because their cereal was ruined' },
    { setting: 'a garage', event: 'a shelf of paint cans collapsed, spilling colourful paint all over a car, someone stepped in wet paint and tracked footprints across the driveway, and the garage door jammed halfway open' },
    { setting: 'a backyard', event: 'an inflatable pool burst suddenly flooding the yard, lawn chairs floated away, a garden gnome toppled over, and a neighbour peered over the fence in complete surprise' },
    { setting: 'a living room', event: 'a child accidentally launched a remote-controlled car into the fish tank, water poured onto the carpet, the fish were flopping on the floor, and the cat watched everything from the bookshelf' },
    { setting: 'a bathroom', event: 'the shower head popped off and was spraying water uncontrollably at the ceiling, someone was yelling for help, towels were soaking wet on the floor, and the family dog ran in and started playing in the water' },
    { setting: 'a home kitchen', event: 'a pressure cooker lid blew off and hit the ceiling, soup splattered across every surface, the fire alarm began blaring, and a startled visitor dropped a casserole dish on the floor' },
    { setting: 'a dining room', event: 'a Thanksgiving turkey slid off the platter and rolled across the table knocking over wine glasses, cranberry sauce splashed on a guest white shirt, and the dog grabbed the turkey and ran under the table' },
    { setting: 'a laundry room', event: 'a washing machine started bouncing violently across the floor, it yanked the hose from the wall spraying water everywhere, clothes were flung out of the open top, and a child tried riding on the shaking machine' },
    { setting: 'a basement', event: 'a pipe burst during a house party flooding the entire basement, people were wading through ankle-deep water trying to save electronics, someone was standing on a couch holding a laptop above their head, and the DJ equipment was sparking' },

    // ─── Workplace & Office ───
    { setting: 'an office', event: 'the ceiling tiles suddenly collapsed, papers scattered everywhere, the fire sprinkler turned on spraying water, and employees were scrambling to save their laptops' },
    { setting: 'an office tower lobby', event: 'the revolving door jammed with three people stuck inside, the security gate kept beeping even when nobody walked through, a courier dropped a stack of packages that burst open, and the elevator doors kept opening and closing on the wrong floor' },
    { setting: 'a shared office kitchen', event: 'someone microwaved fish and the entire floor smelled terrible, then the coffee machine started spraying hot water everywhere, a coworker slipped on spilled milk, and the fire alarm went off' },
    { setting: 'a conference room', event: 'the projector screen snapped up suddenly scaring the presenter, their laptop slid off the podium and crashed on the floor, the whiteboard fell off the wall, and the CEO walked in at exactly that moment' },
    { setting: 'a warehouse', event: 'a forklift bumped into a shelf causing a chain reaction of boxes falling, bubble wrap popped loudly like gunshots, a stack of fragile items crashed to the ground, and workers ran for the exits' },
    { setting: 'an open-plan office', event: 'someone accidentally activated the emergency PA system playing a fire alarm audio clip, everyone started evacuating, coffee cups were abandoned mid-sentence, and it took ten minutes to figure out it was a false alarm' },

    // ─── Restaurants & Food ───
    { setting: 'a restaurant', event: 'a waiter tripped and sent plates of food flying through the air, diners jumped out of the way, soup dripped off a tablecloth, and the chef peeked horrified through the kitchen window' },
    { setting: 'a pizza restaurant', event: 'a chef tossed pizza dough too high and it stuck to the ceiling, another pizza caught fire in the oven, a delivery driver slipped on flour on the floor, and customers at the counter stared open-mouthed' },
    { setting: 'a sushi restaurant', event: 'the conveyor belt started running backwards, plates crashed into each other, soy sauce bottles tipped over in a chain reaction, and a piece of sushi flew off a plate and landed in a customer hair' },
    { setting: 'a buffet restaurant', event: 'the ice sculpture centrepiece melted and collapsed into the shrimp tray, water flooded the dessert section, a child slipped and fell into the chocolate fountain, and the manager was mopping frantically' },
    { setting: 'a food truck festival', event: 'a giant inflatable taco decoration deflated and fell onto the crowd, condiment bottles burst open, a small dog got tangled in the decoration flags, and a musician on stage accidentally knocked a speaker into a puddle' },
    { setting: 'a bakery', event: 'an entire wedding cake toppled off the counter, frosting splattered across the display case, a tray of fresh croissants rolled onto the floor, and a customer birthday cake slid into the arms of a shocked passerby' },
    { setting: 'a coffee shop', event: 'the espresso machine exploded spraying steam everywhere, a barista slipped on spilled oat milk, the display case of pastries crashed open, and hot chocolate overflowed from the automatic dispenser flooding the counter' },
    { setting: 'a dim sum restaurant', event: 'a server trolley rolled down a ramp gaining speed and crashed into a table, steamer baskets flew open mid-air, dumplings scattered across the floor, and a family at the next table caught a pot of tea just in time' },
    { setting: 'an ice cream parlour', event: 'the entire freezer case malfunctioned and ice cream started melting everywhere, cones collapsed in customers hands, a waffle cone machine shot batter across the counter, and a child slipped in a river of melted chocolate' },

    // ─── Education ───
    { setting: 'a classroom', event: 'a science experiment exploded with colourful smoke filling the room, one student was covered in foam, glass beakers crashed to the floor, and the teacher looked completely shocked' },
    { setting: 'a science fair', event: 'a volcano model erupted too aggressively and sprayed red goop all over the judges, a robot project rolled off the table, a solar system model started losing planet pieces, and a parent tried to photograph the whole chaotic scene' },
    { setting: 'a school gymnasium', event: 'the basketball scoreboard fell off the wall during a game, the bleachers started folding up with people still sitting on them, a runaway basketball hit the fire extinguisher and set it off, and foam sprayed everywhere' },
    { setting: 'a university lecture hall', event: 'a student laptop caught fire in the middle of a lecture, smoke filled the front row, the professor tried to put it out with a water bottle, everyone rushed to the exits, and the fire alarm started blaring' },
    { setting: 'a school hallway', event: 'all the lockers on one side suddenly popped open at the same time, textbooks and gym clothes spilled into the hallway, students tripped over the mess, and a teacher dropped their coffee in shock' },
    { setting: 'a school art room', event: 'a student accidentally knocked over a shelf of paint jars causing a rainbow-coloured flood across the floor, someone slipped and sat in red paint, clay sculptures toppled like dominoes, and the art teacher held her head in her hands' },
    { setting: 'a kindergarten', event: 'a finger-painting activity went horribly wrong when a child opened all the paint bottles at once, every surface was covered in bright handprints, the classroom hamster escaped during the chaos, and the teacher found paint in her hair' },
    { setting: 'a music room', event: 'a tuba player sneezed and blasted a note so loud that a music stand toppled over, causing a chain reaction of stands falling like dominoes, sheet music flew everywhere, and a violin string snapped' },

    // ─── Shopping & Retail ───
    { setting: 'a supermarket', event: 'one shelf toppled over like a domino knocking over two more, cans rolled everywhere across the floor, a customer got stuck in the aisle, and the manager was yelling into a phone' },
    { setting: 'a parking lot', event: 'a shopping cart rolled into a car, groceries scattered across the ground, a bird swooped down and stole a loaf of bread, and someone chased a rolling watermelon across the pavement' },
    { setting: 'a car dealership showroom', event: 'a test-drive car rolled straight through the glass entrance doors into the showroom, balloons started popping everywhere, a salesman dove behind a desk for cover, and the driver stood outside frozen with the keys in hand' },
    { setting: 'a department store', event: 'a mannequin display collapsed in a domino effect sending plastic limbs across the floor, a child screamed thinking they were real, a shopper tripped over a mannequin arm, and an employee started collecting body parts in a shopping cart' },
    { setting: 'a furniture store', event: 'a customer sat on a display sofa and it collapsed, causing the shelf behind it to wobble and drop picture frames, a lamp shattered on the floor, and a display kitchen set started leaning dangerously' },
    { setting: 'a toy store', event: 'a shelf of bouncy balls tipped over sending hundreds rolling in every direction across the store, customers were stumbling, employees tried to catch them, and a remote-control helicopter display activated and flew into a stack of board games' },
    { setting: 'a hardware store', event: 'a paint-mixing machine malfunctioned and started spraying green paint across the aisle, a customer ladder collapsed, tool bins cascaded off a shelf, and the fire alarm triggered from the commotion' },
    { setting: 'a clothing store', event: 'the entire sale rack collapsed under the weight of too many hangers, clothes scattered across the floor, a customer was buried under a pile of winter coats, and the changing room curtain fell down revealing a surprised shopper' },

    // ─── Sports & Recreation ───
    { setting: 'a gym', event: 'someone dropped a heavy barbell that cracked the floor, a treadmill was running with nobody on it and launched a towel across the room, a water fountain started spraying sideways, and a yoga class in the corner tried to continue their session peacefully' },
    { setting: 'a bowling alley', event: 'the ball return machine started spitting out balls rapidly in all directions, someone slipped on the oiled lane, pins scattered beyond the back curtain, and an employee was crawling toward the emergency stop button' },
    { setting: 'a public swimming pool', event: 'someone did an enormous cannonball that splashed the fully-clothed lifeguard, pool floats scattered in every direction, a child goggles flew off their face, and an elderly swimmer clutched the lane rope in surprise' },
    { setting: 'a skating rink', event: 'the Zamboni broke down in the middle of the ice, a hockey player crashed into the boards sending water bottles flying, a figure skater tripped over a pylon, and the PA system started playing children birthday music at full volume' },
    { setting: 'a tennis court', event: 'a ball machine malfunctioned and started firing tennis balls at double speed in random directions, players dove for cover, balls bounced off the fence into the parking lot, and someone ball hit a spectator coffee cup' },
    { setting: 'a soccer field', event: 'a sprinkler system turned on in the middle of the match soaking all the players, the ball got stuck in a mud puddle, the referee slipped and blew the whistle accidentally, and the scoreboard started flashing random numbers' },
    { setting: 'a mini-golf course', event: 'a windmill obstacle fell apart mid-swing, a golf ball ricocheted off a rock and hit a garden gnome, a family putt went through a water feature and splashed everyone, and an animatronic dinosaur started moving erratically' },
    { setting: 'a rock climbing gym', event: 'a hold broke off the wall and a climber swung sideways crashing into the chalk bag station, chalk dust billowed like a cloud, someone on auto-belay got stuck halfway and kept bouncing, and the receptionist rang the emergency bell' },

    // ─── Transportation ───
    { setting: 'a busy street', event: 'a delivery truck tipped over spilling hundreds of oranges, people started slipping on them, a dog ran away with one, and traffic backed up for blocks' },
    { setting: 'an airport baggage area', event: 'suitcases were piling up and falling off the carousel, a dog escaped from a pet carrier and ran loose through the hall, a child climbed onto the conveyor belt, and a security guard was speaking urgently into a radio' },
    { setting: 'a subway car', event: 'the emergency brake activated suddenly throwing standing passengers forward, someone grocery bag ripped open and apples rolled all down the aisle, a busker guitar hit a pole and the strings twanged loudly, and the lights flickered on and off' },
    { setting: 'a city bus', event: 'the emergency exit popped open while the bus was moving, everyone papers and bags started flying out, the driver slammed the brakes, passengers piled forward, and someone umbrella opened inside hitting three people' },
    { setting: 'a taxi stand', event: 'a taxi trunk popped open and luggage fell into the street, another taxi bumped a hydrant and water started gushing, a tourist chased their suitcase rolling downhill, and a traffic officer was blowing a whistle frantically' },
    { setting: 'a ferry', event: 'the gift shop display fell over during a big wave, postcards and magnets scattered across the deck, passengers coffee cups slid off tables simultaneously, and a seagull flew inside the cabin and started flying in circles' },
    { setting: 'a train platform', event: 'a gust of wind from an arriving express train blew everyone newspapers and hats away, a coffee cup flew out of someone hand, a display board fell off the wall, and a busker music sheet blew onto the tracks' },
    { setting: 'a bicycle path', event: 'a cyclist swerved to avoid a squirrel and crashed into a row of rental bikes causing a domino chain, helmets rolled across the path, a jogger jumped over the wreckage, and a delivery robot got tangled in a wheel' },

    // ─── Health & Medical ───
    { setting: 'a dentist waiting room', event: 'a ceiling pipe burst and water started raining down on everyone, magazines floated across the floor, the receptionist climbed onto her chair to avoid the water, and one patient opened an umbrella right there indoors' },
    { setting: 'a hospital cafeteria', event: 'the tray return conveyor malfunctioned and started ejecting trays across the room, a doctor in scrubs was hit by a flying jello cup, the salad bar sneeze guard collapsed, and someone soup splashed all over the cash register' },
    { setting: 'a pharmacy', event: 'a shelf of vitamins collapsed and hundreds of bottles rolled across the floor like marbles, a customer slipped and grabbed a display rack for support which also fell, pill bottles scattered everywhere, and the pharmacist was on the phone yelling for help' },
    { setting: 'a physiotherapy clinic', event: 'an exercise ball bounced off a patient and crashed into a mirror, the resistance band machine snapped and flung a handle across the room, a hot pack burst and leaked blue gel on the floor, and a patient on crutches tried to dodge everything' },
    { setting: 'a veterinary clinic', event: 'a large dog broke free from its leash and chased a cat through the waiting room, knocked over a display of pet food, the cat climbed the receptionist computer screen, and three other dogs started barking and pulling their owners around' },

    // ─── Entertainment & Culture ───
    { setting: 'a movie theatre', event: 'a giant soda spilled and cascaded down the stadium seating rows, popcorn scattered across the aisle, someone phone started ringing loudly during the quiet scene, and an usher was shining a flashlight trying to find who it belonged to' },
    { setting: 'a museum', event: 'a visitor leaned on a rope barrier and it collapsed, causing a domino effect of stanchions across the gallery, a priceless vase wobbled on its pedestal, a security guard sprinted across the room yelling stop, and a tour group froze in horror' },
    { setting: 'an art gallery opening', event: 'a guest backed into a sculpture and knocked it off its base, someone spilled red wine on a white canvas painting, the artist fainted, and a photographer flash startled everyone causing more drinks to spill' },
    { setting: 'a concert hall', event: 'a speaker blew out mid-performance with a deafening pop, the drummer drum rolled off the stage into the front row, feedback screeched through the monitors, and the lead singer microphone stand collapsed' },
    { setting: 'a comedy club', event: 'a spotlight fixture fell and crashed on stage just missing the comedian, sparks flew from the wiring, the audience thought it was part of the act and laughed, drinks spilled from the vibration, and the fire alarm went off' },
    { setting: 'a magic show', event: 'the magician trick went wrong and doves flew out early into the audience, a rabbit escaped the hat and hopped across the stage, a table collapsed revealing the hidden compartments, and the assistant got stuck in the box and was yelling for help' },
    { setting: 'a karaoke bar', event: 'someone grabbed the microphone too hard and yanked the cord from the speaker, feedback screamed through the room, a disco ball fell from the ceiling and shattered on a table, and a waiter dropped a tray of drinks from the shock' },

    // ─── Outdoor & Nature ───
    { setting: 'a campsite', event: 'a bear tore open a cooler and started eating everything inside, marshmallows roasting on the fire caught flame, a tent collapsed on someone still sleeping inside, and two raccoons dragged a bag of chips into the bushes' },
    { setting: 'a playground', event: 'the merry-go-round was spinning way too fast, a swing wrapped completely around the top bar, a juice box sprayed all over a parent white shirt, and a squirrel stole a granola bar right out of a stroller' },
    { setting: 'a zoo', event: 'a monkey escaped its enclosure and sat on a visitor head, a zookeeper tried to lure it down with a banana, children were laughing and pointing, and someone ice cream fell on the ground' },
    { setting: 'a beach', event: 'a rogue wave crashed much farther than expected soaking everyone sunbathing on their towels, beach umbrellas flew into the air, a sandcastle competition was completely destroyed, and a cooler floated out towards the ocean' },
    { setting: 'a hiking trail', event: 'a tree fell across the path just after the group passed, a hiker backpack strap broke and their supplies tumbled down the hill, a swarm of bees appeared near the rest area, and someone fell into the creek while trying to cross on stepping stones' },
    { setting: 'a botanical garden', event: 'the automatic sprinkler system activated during a wedding photo session soaking the entire bridal party, guests ran for cover under trees, the photographer camera bag got drenched, and a peacock wandered into the scene' },
    { setting: 'a neighbourhood park', event: 'a drone got tangled in a tree and tried to fly out breaking branches that fell on a picnic below, a dog caught a frisbee and refused to return it running circles around its owner, and the ice cream truck drove over a garden sprinkler causing a geyser' },
    { setting: 'a petting zoo', event: 'a goat ate a child map and then chewed through the fence, three goats escaped and ran through the gift shop, a llama spat on a visitor, and a potbellied pig knocked over the feed dispenser causing a stampede of chickens' },
    { setting: 'a fishing dock', event: 'someone cast too hard and their rod flew into the lake, someone else pulled up an old boot instead of a fish, a pelican stole a fish right off a hook, and a cooler tipped into the water sending ice and sandwiches floating away' },

    // ─── Events & Celebrations ───
    { setting: 'a wedding outdoors', event: 'a strong gust of wind blew away all the decorations, the wedding cake started tilting dangerously, the ring bearer chased a ring rolling across the grass, and guests grabbed at flying napkins' },
    { setting: 'a birthday party', event: 'the piata broke on the first swing and candy flew everywhere before the kids were ready, the birthday cake candles set the tablecloth on fire, a balloon arch collapsed, and a clown car prop fell apart in the driveway' },
    { setting: 'a New Year Eve party', event: 'the champagne cork shot across the room and hit a picture frame which shattered, someone tripped over a streamer and pulled down the decorations, the countdown clock malfunctioned showing midnight three hours early, and glitter cannons went off prematurely' },
    { setting: 'a graduation ceremony', event: 'a gust of wind blew all the graduation caps into a pond, the podium microphone gave painful feedback, the dean tripped on the stage steps, and a beach ball bounced across the seated graduates' },
    { setting: 'a community parade', event: 'a float lost a wheel and veered into a fire hydrant, water shot into the air soaking marching band members, their instruments went out of tune, candy meant for throwing fell off the float in one giant dump, and children scrambled in every direction' },
    { setting: 'a retirement party', event: 'the slideshow malfunctioned and showed embarrassing baby photos instead of career highlights, the cake had the wrong name on it, the balloon release tangled in a ceiling fan, and the guest of honour chair collapsed when they sat down' },
    { setting: 'a surprise party', event: 'guests jumped out too early and surprised the pizza delivery person instead, the real guest of honour walked in the back door and saw the mess, deflated balloons were everywhere, and the cake said Happy Birthday instead of Happy Anniversary' },

    // ─── Services & Public Spaces ───
    { setting: 'a laundromat', event: 'three washing machines started overflowing with suds at the same time, someone red sock dyed all their white clothes bright pink, a child was sliding across the soapy floor, and one machine was shaking violently' },
    { setting: 'a hair salon', event: 'a client hair dye turned bright green instead of blonde, another client hair dryer sent curlers flying across the room, a mirror fell off the wall, and the stylist put her hands up in total disbelief' },
    { setting: 'a library', event: 'a towering stack of books fell like dominoes across multiple tables, a student got buried under a pile of encyclopedias, the librarian was shushing everyone frantically, and a toddler was cheerfully ripping pages from a picture book' },
    { setting: 'a post office', event: 'the package sorting machine jammed and started ejecting parcels across the room, a box of bubble wrap burst open popping loudly, an ink stamp pad flew off a counter and left marks on a customer coat, and the queue number display started spinning randomly' },
    { setting: 'a bank', event: 'the pneumatic tube system shot a canister across the lobby, the rope barriers collapsed like dominoes, the ATM started beeping loudly and spitting out receipt paper endlessly, and a customer toddler pressed the emergency button under the counter' },
    { setting: 'a car wash', event: 'the brushes detached from the machine and kept spinning on the ground, soap sprayed outside the tunnel onto pedestrians, a car got stuck halfway through, the dryer blew a side mirror off another car, and an employee was running around with a giant wrench' },
    { setting: 'a fire station', event: 'during an open house event, a child accidentally turned on the fire hose which sprayed across the parking lot soaking visitors and food tables, the dalmatian ran through the crowd trailing the hose, and a firefighter slid down the pole and landed in a puddle' },
    { setting: 'a dry cleaner', event: 'the automated clothing rack started spinning out of control, garment bags were flying off hooks like a carousel, someone grabbed their jacket and it ripped, plastic wrap tangled around a customer, and the pressing machine released a giant cloud of steam' },

    // ─── Hotels & Accommodation ───
    { setting: 'a hotel lobby', event: 'a luggage cart rolled across the marble floor and hit the check-in desk, suitcases tumbled everywhere, the chandelier swayed from the impact, a bellhop tripped over bags chasing it, and a business traveller coffee went flying' },
    { setting: 'a hotel breakfast buffet', event: 'the waffle iron started smoking, someone bumped the orange juice dispenser and it wouldn stop pouring, toast popped aggressively out of the toaster and arced across the counter, and a guest tray slipped sending eggs and bacon across the floor' },
    { setting: 'a hotel elevator', event: 'the doors opened on every floor without stopping, a guest suitcase wheels got stuck in the gap, someone pressed every button at once, the emergency phone started ringing on its own, and a room service cart rolled in with no one pushing it' },

    // ─── Construction & Maintenance ───
    { setting: 'a construction site', event: 'a portable toilet tipped over in the wind, a wheelbarrow full of cement rolled down a ramp and splashed into a puddle coating workers boots, scaffolding planks slid off a platform, and the site supervisor hard hat blew into the excavation pit' },
    { setting: 'a house being painted', event: 'the scaffold collapsed sending paint cans tumbling, each can burst open a different colour creating a rainbow flood in the driveway, a ladder fell against a freshly painted wall leaving marks, and a painter was left dangling from a window ledge' },
    { setting: 'a road construction zone', event: 'a traffic cone was launched by a passing truck into a caution sign, wet cement was walked through by a lost tourist, a jackhammer vibrated a lunch cooler off a barrier wall, and a steam roller started moving with nobody at the controls' },

    // ─── Weather & Seasonal Chaos ───
    { setting: 'a farmers market', event: 'a sudden downpour collapsed a vendor tent, tomatoes rolled off a now-tilted table into the muddy path, a wind gust sent paper bags and napkins swirling, a jar of honey smashed and attracted bees, and shoppers scrambled under leaking awnings' },
    { setting: 'a Canada Day event', event: 'a firework launched sideways instead of up and exploded at ground level, everyone ducked, sparklers lit the decorative bunting on fire, a food vendor inflatable maple leaf deflated onto the crowd, and the MC microphone shocked him' },
    { setting: 'a winter parking lot', event: 'someone slipped on black ice and slid under a truck, a shopping cart rolled across the icy lot crashing into another car, a salt truck driver spilled the entire load in one spot, and car doors were frozen shut forcing owners to climb through trunks' },
    { setting: 'a bus stop in a snowstorm', event: 'the bus shelter roof collapsed under the weight of snow, everyone was suddenly covered, a bus arrived but couldn stop on the icy road and slid past the stop, someone umbrella inverted, and a snowplough sprayed slush on the waiting passengers' },
    { setting: 'a windy rooftop patio', event: 'napkins, menus, and a tablecloth blew off all at once, a plate of nachos landed on a diner at the next table, a potted plant rolled across the patio, and the awning ripped off its hinges flapping wildly like a flag' },
    { setting: 'a summer picnic', event: 'ants invaded the entire spread and formed a line carrying away a whole sandwich, a wasp nest was disturbed under the picnic table causing everyone to run, a child dropped a watermelon which exploded on impact, and a sprinkler turned on soaking the blankets' },

    // ─── Technology & Modern ───
    { setting: 'a tech company office', event: 'a demo robot went rogue and started bumping into desks, someone laptop screen cracked during a product launch rehearsal, the smart lights started flickering disco colours, and the automated coffee machine dispensed soup into everyone mugs' },
    { setting: 'a phone store', event: 'a display table collapsed sending thirty smartphones cascading to the floor, alarm sensors triggered a deafening screech, a customer charging cable got tangled with twelve other cables, and the giant screen TV on the wall started playing random cat videos' },
    { setting: 'a photo studio', event: 'the backdrop stand collapsed during a family portrait, studio lights toppled and flickered, a fog machine activated filling the room with thick haze, a child knocked over the photographer tripod, and the flash kept going off randomly' },
    { setting: 'a printing shop', event: 'the main printer jammed and started ejecting crumpled pages at high speed across the room, ink cartridges leaked blue dye on the counter, the laminator melted a customer poster, and a paper cutter blade fell off its mount' },
    { setting: 'a self-checkout area', event: 'every machine started saying unexpected item in the bagging area at the same time, one screen froze with a blue error, a customer bag ripped spilling produce, and the single station attendant was running between eight machines trying to fix them all' },

    // ─── Animals & Pets ───
    { setting: 'a dog park', event: 'one dog dug under the fence and escaped, three dogs started chasing a squirrel into the human picnic area, someone lunch was stolen by a golden retriever, a terrier jumped into the water fountain, and the gate latch broke trapping everyone inside' },
    { setting: 'a pet grooming salon', event: 'a large wet dog shook off spraying water on every customer in the lobby, a nervous cat scratched the groomer and leapt onto the ceiling fan, a chihuahua howled so loudly that the glass door vibrated, and a hamster escaped its travel cage under the seats' },
    { setting: 'a neighbourhood street', event: 'a mail carrier was chased by three dogs at once, dropped the mail bag and letters blew everywhere, a bird swooped down and stole a letter, the carrier climbed on top of a car, and all the dogs circled below barking' },

    // ─── Miscellaneous ───
    { setting: 'a community garage sale', event: 'a card table buckled and all the items crashed to the driveway, a customer stepped back into a kiddie pool filled with toys, a stack of old records shattered, and a cat escaped from a box labelled free kittens and ran up a tree' },
    { setting: 'a charity auction', event: 'the auctioneer gavel broke on the first swing, a donated painting fell off the easel, someone bid a thousand dollars by accident while sneezing, the bidding paddles got mixed up, and the winning item turned out to be an empty box' },
    { setting: 'a neighbourhood block party', event: 'the DJ turntable skipped and blasted static, the bouncy castle deflated with children still inside, a tug-of-war rope snapped sending both teams tumbling, and the pie-eating contest table collapsed under the weight of twenty pies' },
    { setting: 'a hotel conference', event: 'the presenter laser pointer was actually a cat toy and a stray cat in the room started chasing the red dot on the screen, knocking over the speaker water glass, unplugging the projector, and running across the keyboard which sent a gibberish email to the whole company' },
    { setting: 'an elevator', event: 'the elevator got stuck between floors with eight people crammed inside, someone claustrophobia kicked in and they started pressing all the buttons, the emergency phone rang and it was a spam call, the lights flickered, and someone balloon popped making everyone scream' },
    { setting: 'a garden centre', event: 'a display of stacked flower pots collapsed when a customer pulled one from the bottom, the sprinkler system malfunctioned and soaked the seed aisle, a cart full of soil bags tipped over blocking the exit, and a bird got trapped inside and started flying between the aisles' },
    { setting: 'a community bake sale', event: 'a table leg snapped and two dozen cupcakes slid onto the ground, a toddler faceplanted into a pie, someone allergic to peanuts discovered the wrong label on a brownie tray, and the donation jar rolled under a parked car' },
    { setting: 'a flea market', event: 'a vintage lamp short-circuited and sparked, scaring a vendor who knocked over a shelf of glass ornaments, a customer tripped on a rug for sale and tumbled into a rack of vintage coats, and a parrot in a cage started screaming fire' },
    { setting: 'a public washroom', event: 'every automatic hand dryer turned on simultaneously and would not stop, the soap dispenser squirted across the mirror, a toilet kept flushing on its own, paper towels ejected from the dispenser like a ticker tape parade, and the door lock jammed trapping someone inside' },
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

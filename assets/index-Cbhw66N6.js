(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();const B={},A="celpip_openai_api_key",H="celpip_openai_model",J="gpt-4o-mini";function I(){const e=localStorage.getItem(A);if(e)return e;const t=B==null?void 0:B.VITE_OPENAI_API_KEY;return t&&t!=="sk-your-key-here"?t:null}function K(e){e?localStorage.setItem(A,e.trim()):localStorage.removeItem(A)}function F(){localStorage.removeItem(A)}function W(){return localStorage.getItem(H)||J}function V(e){localStorage.setItem(H,e)}function Q(){return!!I()}async function X(e,t={}){var s;const a=I();if(!a)throw new Error("OpenAI API key is not configured.");const i=t.model||W(),n=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:i,messages:e,temperature:t.temperature??.7,max_tokens:t.max_tokens??2048,...t.response_format?{response_format:t.response_format}:{}})});if(!n.ok){const l=await n.json().catch(()=>({}));throw new Error(((s=l.error)==null?void 0:s.message)||`OpenAI API error: ${n.status}`)}return(await n.json()).choices[0].message.content}async function $(e,t={}){const a=await X(e,{...t,response_format:{type:"json_object"}});return JSON.parse(a)}async function U(e,t={}){var o;const a=I();if(!a)throw new Error("OpenAI API key is not configured.");const i=await fetch("https://api.openai.com/v1/images/generations",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:"dall-e-3",prompt:e,n:1,size:t.size||"1024x1024",quality:t.quality||"standard"})});if(!i.ok){const s=await i.json().catch(()=>({}));throw new Error(((o=s.error)==null?void 0:o.message)||`DALL-E API error: ${i.status}`)}return(await i.json()).data[0].url}async function Z(e){var o;const t=I();if(!t)throw new Error("OpenAI API key is not configured.");const a=new FormData;a.append("file",e,"recording.webm"),a.append("model","whisper-1"),a.append("language","en");const i=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:`Bearer ${t}`},body:a});if(!i.ok){const s=await i.json().catch(()=>({}));throw new Error(((o=s.error)==null?void 0:o.message)||`Whisper API error: ${i.status}`)}return(await i.json()).text}async function ee(e,t={}){var o;const a=I();if(!a)throw new Error("OpenAI API key is not configured.");const i=await fetch("https://api.openai.com/v1/audio/speech",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a}`},body:JSON.stringify({model:"tts-1",input:e,voice:t.voice||"alloy",response_format:"mp3"})});if(!i.ok){const s=await i.json().catch(()=>({}));throw new Error(((o=s.error)==null?void 0:o.message)||`TTS API error: ${i.status}`)}const n=await i.blob();return URL.createObjectURL(n)}const L=[{id:1,name:"Writing an Email",description:"Write a formal or informal email responding to a given situation.",duration:1620,wordTarget:"150–200 words"},{id:2,name:"Responding to Survey Questions",description:"Choose an option and explain your decision in a written response.",duration:1560,wordTarget:"150–200 words"}];function te(e){var t;e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Home")}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">✏️ Writing Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a task type to practise. Each task is timed to match real exam conditions.</p>

      <div class="task-list">
        ${L.map(a=>`
          <div class="task-item" data-task-id="${a.id}">
            <div class="task-info">
              <h4>Task ${a.id}: ${a.name}</h4>
              <p>${a.description}</p>
            </div>
            <div class="task-meta">
              <div>${Math.floor(a.duration/60)} min</div>
              <div>${a.wordTarget}</div>
            </div>
          </div>
        `).join("")}
      </div>
    </main>
  `,y(),(t=document.getElementById("btn-back"))==null||t.addEventListener("click",()=>d("home")),e.querySelectorAll(".task-item").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.dataset.taskId);d("writing-practice",{taskId:i})})})}async function ae(e,t={}){var h,u;const a=t.taskId||1,i=L.find(c=>c.id===a)||L[0];e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Writing")}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating your writing prompt...</p>
      </div>
    </main>
  `,y(),(h=document.getElementById("btn-back"))==null||h.addEventListener("click",()=>d("writing"));let n;try{n=await ie(a)}catch{n=se(a)}let o;e.innerHTML=`
    ${v()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${f("Writing")}
          <h2 style="margin-top: var(--space-2);">Task ${i.id}: ${i.name}</h2>
        </div>
        <div id="timer-display">${k(i.duration)}</div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-writing);">Prompt</h3>
        <p style="line-height: 1.7;">${n.prompt}</p>
        ${n.options?`
          <div style="margin-top: var(--space-4); padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm);">
            <p style="font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-3);">Select one option:</p>
            ${n.options.map((c,r)=>`
              <label style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); cursor: pointer; border-radius: var(--radius-sm); transition: background var(--transition-fast);" class="option-label">
                <input type="radio" name="survey-option" value="${r}" style="margin-top: 3px; accent-color: var(--color-primary); width: 18px; height: 18px; flex-shrink: 0;" />
                <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Option ${r+1}: ${c}</span>
              </label>
            `).join("")}
          </div>
        `:""}
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
  `,y(),(u=document.getElementById("btn-back"))==null||u.addEventListener("click",()=>{o&&o(),d("writing")});const s=document.getElementById("writing-input"),l=document.getElementById("word-counter");s.addEventListener("input",()=>{const c=s.value.trim()?s.value.trim().split(/\s+/).length:0;l.textContent=`${c} words`}),s.focus();const p=document.getElementById("timer-display");o=P(i.duration,c=>{p.innerHTML=k(c)},()=>{const c=document.querySelector('input[name="survey-option"]:checked'),r=c?parseInt(c.value):null;j(e,a,n,s.value,r)}),document.getElementById("btn-submit").addEventListener("click",()=>{if(a===2&&n.options&&!document.querySelector('input[name="survey-option"]:checked')){alert("Please select an option before submitting your response.");return}o&&o();const c=document.querySelector('input[name="survey-option"]:checked'),r=c?parseInt(c.value):null;j(e,a,n,s.value,r)})}async function j(e,t,a,i,n=null){var s,l;if(!i.trim()){alert("Please write a response before submitting.");return}e.innerHTML=`
    ${v()}
    <main class="container">
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Evaluating your response...</p>
      </div>
    </main>
  `;let o;try{o=await oe(t,a,i,n)}catch(p){e.innerHTML=`
      ${v()}
      <main class="container results-container">
        ${f("Writing")}
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <p style="color: var(--color-error); margin-bottom: var(--space-4);">❌ Evaluation failed: ${p.message}</p>
          <button class="btn btn-primary" id="btn-retry">Try Again</button>
        </div>
      </main>
    `,y(),(s=document.getElementById("btn-back"))==null||s.addEventListener("click",()=>d("writing")),(l=document.getElementById("btn-retry"))==null||l.addEventListener("click",()=>d("writing-practice",{taskId:t}));return}ne(e,t,a,i,o)}function ne(e,t,a,i,n){var l,p,h,u;L.find(c=>c.id===t);const o=L.find(c=>c.id===t+1);let s="";o&&(s=`<button class="btn btn-primary" id="btn-continue-task">Continue → Task ${o.id}: ${o.name}</button>`),e.innerHTML=`
    ${v()}
    <main class="container results-container">
      ${f("Writing")}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">📝 Writing Evaluation</h2>

      <!-- Overall Score -->
      <div class="score-display">
        <div class="score-value">${n.overall_score}</div>
        <div class="score-label">CLB / CELPIP Score (out of 12)</div>
      </div>

      <!-- Rubric Breakdown -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Rubric Breakdown</h3>
      <div class="rubric-grid">
        ${(n.rubric||[]).map(c=>`
          <div class="rubric-item">
            <div class="rubric-name">${c.criterion}</div>
            <div class="rubric-score">${c.score}</div>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">${c.comment||""}</p>
          </div>
        `).join("")}
      </div>

      <!-- Strengths -->
      ${n.strengths?`
        <div class="card" style="margin-bottom: var(--space-6); border-left: 3px solid var(--color-success);">
          <h3 style="font-size: var(--font-size-base); font-weight: 600; color: var(--color-success); margin-bottom: var(--space-3);">💪 Strengths</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
            ${n.strengths.map(c=>`<li style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">✓ ${c}</li>`).join("")}
          </ul>
        </div>
      `:""}

      <!-- Suggestions -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">💡 Improvement Suggestions</h3>
      ${(n.suggestions||[]).map((c,r)=>`
        <div class="suggestion-card">
          <div class="suggestion-header">Suggestion ${r+1} (${c.criterion})</div>
          <div class="original-text">"${c.original}"</div>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">${c.explanation}</p>
          <div class="improved-text">"${c.improved}"</div>
        </div>
      `).join("")}

      <!-- Model Answer -->
      ${n.model_answer?`
        <div class="model-answer">
          <h3>📄 Model Answer</h3>
          <p style="white-space: pre-wrap;">${n.model_answer}</p>
        </div>
      `:""}

      <!-- Your Response -->
      <div class="card" style="margin-top: var(--space-6);">
        <h3 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-3);">Your Response</h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.7; white-space: pre-wrap;">${i}</p>
      </div>

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-writing">← Back to Writing</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${s}
      </div>
    </main>
  `,y(),(l=document.getElementById("btn-back"))==null||l.addEventListener("click",()=>d("writing")),(p=document.getElementById("btn-back-writing"))==null||p.addEventListener("click",()=>d("writing")),(h=document.getElementById("btn-retry"))==null||h.addEventListener("click",()=>d("writing-practice",{taskId:t})),(u=document.getElementById("btn-continue-task"))==null||u.addEventListener("click",()=>{d("writing-practice",{taskId:t+1})}),re("writing",t,n)}async function ie(e){return await $([{role:"system",content:e===1?`You are a CELPIP exam question writer. Generate a Writing Task 1 (Email Writing) prompt. 
       The scenario should involve a realistic Canadian context (workplace, community, neighbourhood, municipal services, etc.). 
       Use Canadian English spelling. 
       Return JSON with: { "prompt": "the full prompt text instructing the test-taker", "type": "formal" | "informal" }`:`You are a CELPIP exam question writer. Generate a Writing Task 2 (Survey Response) prompt. 
       The topic should be relevant to Canadian daily life. Provide two clear options to choose from. 
       Use Canadian English spelling. 
       Return JSON with: { "prompt": "the survey question", "options": ["Option A description", "Option B description"] }`},{role:"user",content:"Generate a new unique CELPIP writing prompt."}])}async function oe(e,t,a,i=null){let n="";e===2&&i!==null&&t.options&&(n=`
The test-taker selected: Option ${i+1}: "${t.options[i]}"
Evaluate whether their response effectively supports and explains their chosen option.`);const o=`You are a certified CELPIP examiner evaluating a Writing Task ${e} response.
Use official CELPIP scoring criteria. Score on a scale of 3–12 (CLB levels).

Evaluate on these four criteria:
1. Content / Coherence — logical flow, relevance, completeness of ideas
2. Vocabulary — range, precision, and appropriateness of word choice  
3. Readability — sentence structure, grammar, and punctuation
4. Task Fulfillment — whether the response addresses all parts of the prompt${n}

Provide 3–5 concrete improvement suggestions. Each must:
- Quote a specific phrase from the response
- Explain what is wrong or could be better
- Provide a rewritten version
- Name which criterion it relates to

IMPORTANT — Model Answer Requirements:
- The model answer must be exactly 150–200 words.
- It must be written in multiple separate paragraphs (use 

 between paragraphs).
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
}`;return await $([{role:"system",content:o},{role:"user",content:`Prompt given to the test-taker:
${JSON.stringify(t)}

Test-taker's response:
${a}`}],{max_tokens:3e3})}function se(e){return e===1?{prompt:"You recently moved to a new neighbourhood. Write an email to your neighbour introducing yourself. Include information about who you are, why you moved, and suggest a time to meet. Write approximately 150–200 words.",type:"informal"}:{prompt:"Your local community centre is considering extending its hours to include evenings and weekends. Do you think this is a good idea?",options:["Yes, the community centre should extend its hours.","No, the current hours are sufficient."]}}function re(e,t,a){try{const i=JSON.parse(localStorage.getItem("celpip_history")||"[]");i.push({section:e,taskId:t,score:a.overall_score,date:new Date().toISOString()}),localStorage.setItem("celpip_history",JSON.stringify(i))}catch{}}const E=[{id:1,name:"Giving Advice",description:"Offer advice on a personal situation.",prep:30,response:90},{id:2,name:"Talking About a Personal Experience",description:"Describe a past experience.",prep:30,response:60},{id:3,name:"Describing a Scene",description:"Describe what is happening in an AI-generated image.",prep:30,response:60,hasImage:!0},{id:4,name:"Making Predictions",description:"Based on the same scene image, predict what will happen next.",prep:30,response:60,hasImage:!0,usesTask3Image:!0},{id:5,name:"Comparing and Persuading",description:"Compare two options and persuade the listener.",prep:60,response:60},{id:6,name:"Dealing With a Difficult Situation",description:"Handle a challenging interpersonal scenario.",prep:60,response:60},{id:7,name:"Expressing Opinions",description:"Share and defend a viewpoint.",prep:30,response:90},{id:8,name:"Describing an Unusual Situation",description:"Explain an unexpected or unusual scenario shown in an image.",prep:30,response:60,hasImage:!0}];function ce(e){var t;e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Home")}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">🎤 Speaking Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a task to practise. Each includes preparation and recording time.</p>

      <div class="task-list">
        ${E.map(a=>`
          <div class="task-item" data-task-id="${a.id}">
            <div class="task-info">
              <h4>Task ${a.id}: ${a.name} ${a.hasImage?"🖼️":""}</h4>
              <p>${a.description}</p>
            </div>
            <div class="task-meta">
              <div>Prep: ${a.prep}s</div>
              <div>Response: ${a.response}s</div>
            </div>
          </div>
        `).join("")}
      </div>
    </main>
  `,y(),(t=document.getElementById("btn-back"))==null||t.addEventListener("click",()=>d("home")),e.querySelectorAll(".task-item").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.dataset.taskId);d("speaking-practice",{taskId:i})})})}async function le(e,t={}){var l;const a=t.taskId||1,i=E.find(p=>p.id===a)||E[0];let n=t.sceneImageUrl||null,o=t.sceneDescription||null;e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Speaking")}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating your speaking prompt${i.hasImage&&!n?" and scene image":""}...</p>
      </div>
    </main>
  `,y(),(l=document.getElementById("btn-back"))==null||l.addEventListener("click",()=>d("speaking"));let s;try{if(a===8){const p=await ue();s={prompt:p.prompt},n=p.imageUrl,o=p.sceneDescription}else{if(i.hasImage&&!n){const p=await me(a);n=p.imageUrl,o=p.sceneDescription}s=await he(a,o)}}catch{s=ye(a)}de(e,i,s,n,o)}function de(e,t,a,i,n){var l,p;e.innerHTML=`
    ${v()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${f("Speaking")}
          <h2 style="margin-top: var(--space-2);">Task ${t.id}: ${t.name}</h2>
        </div>
        <div>
          <span class="badge badge-warning">Preparation</span>
          <span id="timer-display" style="margin-left: var(--space-2);">${k(t.prep)}</span>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-speaking);">Prompt</h3>
        <p style="line-height: 1.7;">${a.prompt}</p>
      </div>

      ${i?`
        <div class="scene-image-container">
          <img src="${i}" alt="Scene to describe" />
        </div>
      `:""}

      <div style="text-align: center; padding: var(--space-4);">
        <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin-bottom: var(--space-4);">Use this time to plan your response. Recording will start automatically.</p>
        <button class="btn btn-primary btn-lg" id="btn-start-recording">Start Recording Now</button>
      </div>
    </main>
  `,y(),(l=document.getElementById("btn-back"))==null||l.addEventListener("click",()=>d("speaking"));const o=document.getElementById("timer-display"),s=P(t.prep,h=>{o.innerHTML=k(h)},()=>{N(e,t,a,i,n)});(p=document.getElementById("btn-start-recording"))==null||p.addEventListener("click",()=>{s(),N(e,t,a,i,n)})}async function N(e,t,a,i,n){var c;let o,s=[],l=null;e.innerHTML=`
    ${v()}
    <main class="container">
      <div class="practice-header">
        <div>
          <h2>Task ${t.id}: ${t.name}</h2>
        </div>
        <div>
          <span class="badge badge-error">● Recording</span>
          <span id="timer-display" style="margin-left: var(--space-2);">${k(t.response)}</span>
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <p style="line-height: 1.7;">${a.prompt}</p>
      </div>

      ${i?`
        <div class="scene-image-container">
          <img src="${i}" alt="Scene to describe" />
        </div>
      `:""}

      <div class="recording-controls">
        <div class="record-btn recording" id="record-indicator">🎙️</div>
        <p style="color: var(--color-error); font-weight: 600;">Recording in progress...</p>
        <button class="btn btn-primary btn-lg" id="btn-stop-recording">Stop & Submit</button>
      </div>
    </main>
  `;try{const r=await navigator.mediaDevices.getUserMedia({audio:!0});o=new MediaRecorder(r),s=[],o.ondataavailable=g=>{g.data.size>0&&s.push(g.data)},o.start()}catch{alert("Microphone access is required for speaking practice. Please allow microphone access in your browser settings."),d("speaking");return}const p=document.getElementById("timer-display"),h=P(t.response,r=>{p.innerHTML=k(r)},()=>{u()});function u(){h(),o&&o.state==="recording"&&o.stop(),o.onstop=()=>{l=new Blob(s,{type:"audio/webm"}),o.stream.getTracks().forEach(r=>r.stop()),pe(e,t,a,i,n,l)}}(c=document.getElementById("btn-stop-recording"))==null||c.addEventListener("click",u)}async function pe(e,t,a,i,n,o){var p,h,u,c,r;e.innerHTML=`
    ${v()}
    <main class="container">
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);" id="processing-status">Transcribing your response...</p>
      </div>
    </main>
  `;let s="";try{s=await Z(o)}catch{s=""}if(!s||s.trim().length===0){e.innerHTML=`
      ${v()}
      <main class="container results-container">
        ${f("Speaking")}
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
    `,y(),(p=document.getElementById("btn-back"))==null||p.addEventListener("click",()=>d("speaking")),(h=document.getElementById("btn-back-speaking"))==null||h.addEventListener("click",()=>d("speaking")),(u=document.getElementById("btn-retry"))==null||u.addEventListener("click",()=>d("speaking-practice",{taskId:t.id}));return}document.getElementById("processing-status").textContent="Evaluating your response...";let l;try{l=await ve(t.id,a,s,n)}catch(g){e.innerHTML=`
      ${v()}
      <main class="container results-container">
        ${f("Speaking")}
        <div class="card" style="text-align: center; padding: var(--space-8);">
          <p style="color: var(--color-error); margin-bottom: var(--space-4);">❌ Evaluation failed: ${g.message}</p>
          <button class="btn btn-primary" id="btn-retry">Try Again</button>
        </div>
      </main>
    `,y(),(c=document.getElementById("btn-back"))==null||c.addEventListener("click",()=>d("speaking")),(r=document.getElementById("btn-retry"))==null||r.addEventListener("click",()=>d("speaking-practice",{taskId:t.id}));return}ge(e,t,a,s,o,l,i,n)}function ge(e,t,a,i,n,o,s,l){var c,r,g,b;const p=URL.createObjectURL(n),h=E.find(m=>m.id===t.id+1);let u="";h&&(u=`<button class="btn btn-primary" id="btn-continue-task">Continue → Task ${h.id}: ${h.name}</button>`),e.innerHTML=`
    ${v()}
    <main class="container results-container">
      ${f("Speaking")}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">🎤 Speaking Evaluation</h2>

      <!-- Overall Score -->
      <div class="score-display">
        <div class="score-value">${o.overall_score}</div>
        <div class="score-label">CLB / CELPIP Score (out of 12)</div>
      </div>

      <!-- Rubric Breakdown -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Rubric Breakdown</h3>
      <div class="rubric-grid">
        ${(o.rubric||[]).map(m=>`
          <div class="rubric-item">
            <div class="rubric-name">${m.criterion}</div>
            <div class="rubric-score">${m.score}</div>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: var(--space-2);">${m.comment||""}</p>
          </div>
        `).join("")}
      </div>

      <!-- Transcript -->
      <div class="transcript-box">
        <h3>Your Transcript</h3>
        <p class="transcript-text">${i}</p>
        <audio controls src="${p}" style="width: 100%; margin-top: var(--space-3);"></audio>
      </div>

      <!-- Strengths -->
      ${o.strengths?`
        <div class="card" style="margin-bottom: var(--space-6); border-left: 3px solid var(--color-success);">
          <h3 style="font-size: var(--font-size-base); font-weight: 600; color: var(--color-success); margin-bottom: var(--space-3);">💪 Strengths</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
            ${o.strengths.map(m=>`<li style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">✓ ${m}</li>`).join("")}
          </ul>
        </div>
      `:""}

      <!-- Suggestions -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">💡 Improvement Suggestions</h3>
      ${(o.suggestions||[]).map((m,Y)=>`
        <div class="suggestion-card">
          <div class="suggestion-header">Suggestion ${Y+1} (${m.criterion})</div>
          <div class="original-text">"${m.original}"</div>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">${m.explanation}</p>
          <div class="improved-text">"${m.improved}"</div>
        </div>
      `).join("")}

      <!-- Model Answer -->
      ${o.model_answer?`
        <div class="model-answer">
          <h3>📄 Model Answer</h3>
          <p>${o.model_answer}</p>
        </div>
      `:""}

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-speaking">← Back to Speaking</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${u}
      </div>
    </main>
  `,y(),(c=document.getElementById("btn-back"))==null||c.addEventListener("click",()=>d("speaking")),(r=document.getElementById("btn-back-speaking"))==null||r.addEventListener("click",()=>d("speaking")),(g=document.getElementById("btn-retry"))==null||g.addEventListener("click",()=>d("speaking-practice",{taskId:t.id})),(b=document.getElementById("btn-continue-task"))==null||b.addEventListener("click",()=>{const m={taskId:t.id+1};t.id===3&&s&&l&&(m.sceneImageUrl=s,m.sceneDescription=l),d("speaking-practice",m)}),fe("speaking",t.id,o)}async function he(e,t=null){const a=E.find(n=>n.id===e);if(e===4&&t)return{prompt:"Look at the image carefully. Based on what you see happening in this scene, what do you think will happen in the next few minutes? Make predictions about the people, their actions, and the situation. Explain why you think those things will happen."};if(e===3)return{prompt:"Look at the image and describe what you see. Include as many details as possible about the people, their actions, the objects, and the setting. Try to describe the scene completely."};const i=`You are a CELPIP exam question writer. Generate a Speaking Task ${e} (${a.name}) prompt.
The scenario should be realistic and set in a Canadian context (workplace, community, neighbourhood, school, etc.).
Use Canadian English spelling.
Return JSON: { "prompt": "the full prompt text for the test-taker" }`;return await $([{role:"system",content:i},{role:"user",content:"Generate a new unique CELPIP speaking prompt."}])}async function ue(){const e=[{setting:"a kitchen",event:"the sink started overflowing with foam and water, someone slipped on the wet floor, a cat jumped onto the counter and started eating from a pot, and smoke began rising from a burnt pan"},{setting:"a living room",event:"a large tree branch crashed through the window during a storm, rain started pouring in, and someone was frantically trying to cover furniture with plastic sheets while a child chased a dog through the mess"},{setting:"an office",event:"the ceiling tiles suddenly collapsed, papers scattered everywhere, the fire sprinkler turned on spraying water, and employees were scrambling to save their laptops"},{setting:"a busy street",event:"a delivery truck tipped over spilling hundreds of oranges, people started slipping on them, a dog ran away with one, and traffic backed up for blocks"},{setting:"a backyard barbecue",event:"the grill caught fire, someone started spraying it with a garden hose, a large dog knocked over the food table, and all the guests ran in different directions"},{setting:"a classroom",event:"a science experiment exploded with colourful smoke filling the room, one student was covered in foam, glass beakers crashed to the floor, and the teacher looked completely shocked"},{setting:"a parking lot",event:"a shopping cart rolled into a car, groceries scattered across the ground, a bird swooped down and stole a loaf of bread, and someone chased a rolling watermelon across the pavement"},{setting:"a restaurant",event:"a waiter tripped and sent plates of food flying through the air, diners jumped out of the way, soup dripped off a tablecloth, and the chef peeked horrified through the kitchen window"},{setting:"a wedding outdoors",event:"a strong gust of wind blew away all the decorations, the wedding cake started tilting dangerously, the ring bearer chased a ring rolling across the grass, and guests grabbed at flying napkins"},{setting:"a zoo",event:"a monkey escaped its enclosure and sat on a visitor's head, a zookeeper tried to lure it down with a banana, children were laughing and pointing, and someone's ice cream fell on the ground"},{setting:"a supermarket",event:"one shelf toppled over like a domino knocking over two more, cans rolled everywhere across the floor, a customer got stuck in the aisle, and the manager was yelling into a phone"},{setting:"a laundromat",event:"three washing machines started overflowing with suds at the same time, someone's red sock dyed all their white clothes bright pink, a child was sliding across the soapy floor, and one machine was shaking violently"},{setting:"a library",event:"a towering stack of books fell like dominoes across multiple tables, a student got buried under a pile of encyclopedias, the librarian was shushing everyone frantically, and a toddler was cheerfully ripping pages from a picture book"},{setting:"an airport baggage area",event:"suitcases were piling up and falling off the carousel, a dog escaped from a pet carrier and ran loose through the hall, a child climbed onto the conveyor belt, and a security guard was speaking urgently into a radio"},{setting:"a public swimming pool",event:"someone did an enormous cannonball that splashed the fully-clothed lifeguard, pool floats scattered in every direction, a child's goggles flew off their face, and an elderly swimmer clutched the lane rope in surprise"},{setting:"a hair salon",event:"a client's hair dye turned bright green instead of blonde, another client's hair dryer sent curlers flying across the room, a mirror fell off the wall, and the stylist put her hands up in total disbelief"},{setting:"a bowling alley",event:"the ball return machine started spitting out balls rapidly in all directions, someone slipped on the oiled lane, pins scattered beyond the back curtain, and an employee was crawling toward the emergency stop button"},{setting:"a campsite",event:"a bear tore open a cooler and started eating everything inside, marshmallows roasting on the fire caught flame, a tent collapsed on someone still sleeping inside, and two raccoons dragged a bag of chips into the bushes"},{setting:"a science fair",event:"a volcano model erupted too aggressively and sprayed red goop all over the judges, a robot project rolled off the table, a solar system model started losing planet pieces, and a parent tried to photograph the whole chaotic scene"},{setting:"a movie theatre",event:"a giant soda spilled and cascaded down the stadium seating rows, popcorn scattered across the aisle, someone's phone started ringing loudly during the quiet scene, and an usher was shining a flashlight trying to find who it belonged to"},{setting:"a gym",event:"someone dropped a heavy barbell that cracked the floor, a treadmill was running with nobody on it and launched a towel across the room, a water fountain started spraying sideways, and a yoga class in the corner tried to continue their session peacefully"},{setting:"a food truck festival",event:"a giant inflatable taco decoration deflated and fell onto the crowd, condiment bottles burst open, a small dog got tangled in the decoration flags, and a musician on stage accidentally knocked a speaker into a puddle"},{setting:"a dentist's waiting room",event:"a ceiling pipe burst and water started raining down on everyone, magazines floated across the floor, the receptionist climbed onto her chair to avoid the water, and one patient opened an umbrella right there indoors"},{setting:"a playground",event:"the merry-go-round was spinning way too fast, a swing wrapped completely around the top bar, a juice box sprayed all over a parent's white shirt, and a squirrel stole a granola bar right out of a stroller"},{setting:"a car dealership showroom",event:"a test-drive car rolled straight through the glass entrance doors into the showroom, balloons started popping everywhere, a salesman dove behind a desk for cover, and the driver stood outside frozen with the keys in hand"}],t=e[Math.floor(Math.random()*e.length)],a=await $([{role:"system",content:`You are a CELPIP exam question writer AND a scene illustrator. Based on the unusual situation described below, generate TWO things:

1. A speaking prompt for CELPIP Speaking Task 8 (Describing an Unusual Situation). Frame it as: "You were at [setting] when [event happened]. Describe what you saw to a friend."

2. A detailed visual description of this EXACT same scene for generating an illustration. Include specific visual details: people's expressions, body positions, clothing, objects, colours, and the environment.

The setting is: `+JSON.stringify(t.setting)+`
The event is: `+JSON.stringify(t.event)+`

Return JSON:
{
  "prompt": "the full speaking prompt for the test-taker",
  "description": "a detailed visual scene description for DALL-E",
  "key_elements": ["element 1", "element 2", ...]
}`},{role:"user",content:"Generate the speaking prompt and matching scene description."}]),i="A detailed, realistic illustration: "+a.description+". The scene should clearly depict something unusual, unexpected, or chaotic happening. The image should be colourful, well-lit, and show diverse people of various ages. Style: clean digital illustration suitable for an English language exam, with clear visual details that can be described verbally.",n=await U(i);return{prompt:a.prompt,imageUrl:n,sceneDescription:{description:a.description,key_elements:a.key_elements}}}async function me(e=3){const t=["a family kitchen where a parent is cooking pasta, a teenager is doing homework at the table, a toddler is drawing on the fridge with magnets, and a grandparent is reading a recipe book","a living room on movie night with someone setting up a projector, kids making a blanket fort, a person carrying a bowl of popcorn, and a cat sleeping on the couch","a home garage converted into a workshop with someone building a bookshelf, another person sharpening tools, a child handing nails, and a neighbour peeking in to chat","a laundry room where someone is folding clothes, a child is hiding inside a laundry basket, shirts are hanging on a drying rack, and a washing machine is vibrating loudly","a dining room during a birthday party with someone blowing out candles, guests clapping, a child reaching for cake, and someone taking a photo","a home office where a parent is on a video call, a child is tugging their sleeve, a dog is sleeping under the desk, and a delivery person is ringing the doorbell","a bathroom where a parent is giving a toddler a bath, rubber ducks are floating, an older sibling is brushing teeth, and a towel is falling off the rack","a basement being renovated with someone painting walls, another person laying floor tiles, an electrician checking wires, and a radio playing on a stepladder","an open-plan office with someone presenting a slideshow, colleagues taking notes, a person refilling coffee at the break station, and a janitor vacuuming near the entrance","a coworking space with freelancers on laptops, two people brainstorming on a whiteboard, someone on a phone call in a booth, and a barista making coffee at the in-house café","a corporate boardroom with executives debating around a table, an assistant distributing printed reports, someone drawing a chart on a flip board, and a video call participant on screen","a small bakery kitchen with a baker kneading dough, an apprentice decorating cupcakes, someone pulling bread from an oven, and a delivery driver loading boxes at the back door","a newsroom with journalists typing at desks, an editor reviewing a story on a screen, a camera crew preparing for a live broadcast, and someone pinning headlines on a corkboard","a dental office with a hygienist cleaning a patient's teeth, a dentist reviewing x-rays, a receptionist scheduling appointments, and a nervous child in the waiting area holding a toy","a hair salon with a stylist cutting hair, another washing a client's hair at the basin, someone sweeping cut hair off the floor, and a customer flipping through a magazine","a real estate office with an agent showing floor plans to a couple, a colleague on the phone, someone printing listing sheets, and a whiteboard showing weekly sales targets","a busy pharmacy with a pharmacist counting pills, a customer asking about vitamins, someone waiting for a prescription, and a technician stocking shelves","a clothing store with shoppers browsing racks, someone trying on a jacket in front of a mirror, a cashier folding items at the counter, and a staff member hanging new arrivals","a hardware store with a customer comparing paint swatches, an employee carrying lumber on a cart, someone testing a power drill, and a family looking at light fixtures","an electronics store with a salesperson demonstrating a laptop, teenagers trying out headphones, someone returning a product at the service desk, and a technician repairing a phone","a pet store with a child watching fish in a tank, someone buying dog food, an employee trimming a poodle, and a parrot repeating words from its cage","a bookstore with a customer reading in a comfy chair, a staff member arranging a display table, someone searching shelves with a list, and a children's reading circle in the corner","a high school chemistry lab with students wearing goggles conducting experiments, a teacher supervising, a student writing observations, and someone carefully pouring liquid into a beaker","a university lecture hall with a professor pointing at a slide, students typing on laptops, someone raising a hand, and a late arrival tiptoeing to a seat","a kindergarten classroom with children sitting in a circle for story time, a teacher holding up a book, a child painting at an easel, and another stacking blocks","a music room with a student playing piano, another practising violin, a teacher conducting a small ensemble, and someone arranging sheet music on a stand","a school cafeteria at lunch with students carrying trays, friends sharing a table, a cafeteria worker serving soup, and a teacher monitoring the room","a computer lab with students working on assignments, a teacher helping someone debug code, a printer spitting out pages, and a student plugging in a USB drive","a hospital corridor with a nurse pushing a wheelchair, a doctor reviewing a chart on a tablet, a family visiting with flowers, and a janitor mopping the floor near the elevator","a physiotherapy clinic with a patient doing stretching exercises, a therapist applying tape to a knee, someone lifting small weights, and a receptionist booking the next session","an optometrist's office with a patient reading an eye chart, the optometrist adjusting equipment, someone trying on frames at the display wall, and a technician cleaning lenses","a walk-in clinic waiting room with people filling out forms, a nurse calling a name, a mother comforting a sick child, and a TV showing the weather forecast on the wall","an indoor swimming pool with swimmers doing laps, a lifeguard on a high chair, children splashing in the shallow end, and a parent wrapping a towel around a shivering kid","a bowling alley with a group high-fiving after a strike, someone selecting a ball from the rack, a child using bumper rails, and a server delivering nachos to a lane","a yoga studio with participants in warrior pose, an instructor adjusting someone's posture, candles flickering near the front, and someone unrolling a mat at the back","a community centre pottery class with people shaping clay on wheels, an instructor demonstrating glazing, finished pots drying on shelves, and someone washing their hands at a sink","an ice skating rink with a couple skating hand-in-hand, a child clinging to the boards, a figure skater practising spins in the centre, and a Zamboni waiting at the gate","a karate dojo with students in white uniforms practising kicks, a sensei demonstrating a move, parents watching through a glass window, and trophies displayed in a cabinet","an escape room lobby with a group getting instructions from a game master, another group celebrating their escape, someone taking a group selfie, and a leaderboard on the wall","a sushi restaurant with a chef slicing fish behind a counter, a server delivering a boat of sushi, diners using chopsticks, and a couple studying the menu","a busy pizza shop with a cook tossing dough in the air, another spreading sauce, a customer waiting at the pick-up counter, and a delivery driver grabbing an order","a dim sum restaurant with carts being pushed between tables, a waiter lifting the lid off a steamer, a family pointing at dishes they want, and a child blowing on a hot dumpling","a coffee shop with a barista pouring latte art, a student studying with earbuds in, two friends laughing at a window seat, and someone ordering at the counter","a downtown sidewalk with a food truck selling tacos, office workers eating on benches, a cyclist locking a bike to a rack, and a street artist painting a mural on a wall","a residential cul-de-sac with kids playing road hockey, a mail carrier delivering packages, a neighbour washing a car in the driveway, and someone trimming a hedge","a crosswalk at a busy city intersection with a crossing guard stopping traffic, students crossing with backpacks, a taxi waiting at the light, and a window washer on scaffolding above","an alley behind restaurants with a chef taking out garbage, a delivery person unloading crates, a cat sitting on a dumpster lid, and graffiti art covering one wall","a suburban sidewalk in autumn with someone raking leaves, a child jumping into a leaf pile, a dog walker passing by, and a postal worker sliding mail into a mailbox","a city bus stop with commuters checking their phones, an elderly person sitting on the bench, a bus approaching in the distance, and a busker playing harmonica nearby","a moving day on a residential street with movers carrying boxes into a truck, a neighbour bringing over a welcome plate, a child riding a tricycle on the sidewalk, and a for-sale sign with a SOLD sticker","a community garden with people planting seedlings, someone watering tomato plants, a volunteer turning a compost pile, and a child chasing a butterfly along the path","a dog park with owners chatting while dogs play, someone throwing a frisbee, a small dog digging a hole, and a person cleaning up with a bag","a riverside walking trail with joggers, someone fishing from the bank, a family feeding ducks, and a photographer taking pictures of wildflowers","a botanical garden with visitors admiring flowers, a guide leading a tour group, someone sketching a sculpture, and a maintenance worker pruning roses","a soccer field during a community match with players running, a referee blowing a whistle, parents cheering from the sideline, and a coach talking to substitutes on the bench","a tennis court with two players rallying, a ball boy retrieving a stray ball, someone stretching near the net post, and spectators sitting on bleachers","a basketball court at a neighbourhood park with teenagers playing a pick-up game, someone sitting on the bench tying shoes, a kid shooting alone at the next hoop, and a man walking his dog past the fence","a ski lodge base area with skiers clicking into bindings, a family eating lunch on a patio, a snowboarder adjusting goggles, and a ski patrol member driving a snowmobile","a running track at a public stadium with sprinters racing, a coach timing with a stopwatch, someone doing hurdles, and a group of seniors power-walking the outer lane","a skateboard park with a teenager performing a kickflip, a young child in full pads rolling cautiously, a parent filming on a phone, and a graffitied half-pipe in the background","a craft fair in a town square with artisans selling handmade jewellery, a potter demonstrating at a wheel, a face-painter decorating a child, and a balloon artist making animals","a winter holiday market with a vendor selling hot chocolate, couples browsing ornament stalls, a choir singing carols on a small stage, and fairy lights strung between booths","a car boot sale in a church parking lot with people browsing tables of second-hand items, someone haggling over a lamp, a child looking at old toys, and a volunteer selling baked goods","a food festival with tents offering cuisines from different countries, a chef giving a live cooking demo, visitors sampling dishes, and a band playing on a small stage","a flea market under a highway overpass with vendors displaying vintage clothing, someone examining antique cameras, a couple debating over a painting, and a kid riding on a parent's shoulders","an airport departure hall with travellers checking in at kiosks, someone hugging family goodbye, a security officer checking passports, and a child pointing at planes through the window","a ferry terminal with passengers boarding with bicycles, a crew member tying rope to a cleat, seagulls on the dock, and someone purchasing a ticket at the booth","a taxi stand outside a hotel with a doorman opening a car door, guests loading luggage into a trunk, a bellhop wheeling bags, and a cyclist waiting at the traffic light","a highway rest stop with families stretching beside their cars, someone walking a dog on a leash, a trucker refuelling, and a vendor selling coffee from a trailer","a bike-share station downtown with someone scanning a QR code to unlock a bike, a tourist consulting a map, a courier making a delivery, and a street sweeper cleaning the curb","a road construction zone with a flagger directing traffic, an excavator digging, workers pouring asphalt, and pedestrians detoured to a temporary sidewalk","a house under construction with framers hammering on the roof, an electrician running wire, a plumber fitting pipes, and a supervisor reviewing blueprints on the tailgate of a truck","a hydro crew repairing a power line with a bucket truck raised, a worker in a safety harness, traffic cones blocking the lane, and a curious neighbour watching from a porch","a marina with someone hosing down a sailboat, a family boarding a small motorboat, a fisherman sorting tackle on the dock, and a seagull perching on a post","a public outdoor pool with children jumping off a diving board, a lifeguard scanning the water, seniors doing aquafit, and a parent applying sunscreen to a child","a lake beach with kayakers launching from shore, someone building a sandcastle with a bucket, a stand-up paddleboarder balancing, and a couple walking barefoot along the waterline","a farm with a tractor ploughing a field, a farmer feeding chickens, children collecting eggs, and a border collie herding sheep near a red barn","a vineyard during harvest with workers picking grapes, a tour guide leading visitors, someone tasting wine at an outdoor bar, and a truck being loaded with crates","a country road with a cyclist riding past a cornfield, a farmer checking a fence, a family at a roadside fruit stand, and a tractor parked near a silo","a snowy neighbourhood with someone shovelling a driveway, children building a snowman, a snowplough clearing the street, and a mail carrier in a parka delivering letters","an outdoor ice rink in a town centre with skaters gliding, a hot chocolate stand with a queue, a father tying his daughter's skates on a bench, and string lights overhead","a rainy city street with commuters under umbrellas, a puddle splashing as a bus passes, a barista setting out a sandwich board, and someone dashing into a doorway","a spring garden centre with customers loading flats of flowers into carts, an employee watering hanging baskets, a couple choosing a tree, and a child sitting in an empty wheelbarrow","a post office with a clerk weighing a parcel, a customer filling out a customs form, someone buying stamps, and a child dropping a letter into the outgoing mail slot","a bank branch with a teller counting bills, a customer at the ATM, someone sitting with an advisor at a desk, and a security guard standing near the door","a laundromat with people loading machines, someone folding sheets on a table, a student studying while waiting, and a repair technician fixing a dryer","a fire station with firefighters polishing a truck, one sliding down the pole, a Dalmatian lying on the floor, and a school group on a tour taking photos","a car wash with an attendant guiding a sedan onto the track, someone vacuuming their trunk in the self-serve bay, a kid watching the spinning brushes through the window, and an employee drying a finished car","a gas station with a driver filling up, someone buying a bag of ice from a cooler outside, a squeegee being used on a windshield, and a tow truck pulling in with a flat-tired car","a Chinatown street with lanterns overhead, a dim sum restaurant with a queue outside, a herbalist shop with jars in the window, a tai chi class in a small square, and tourists taking photos","a community mural-painting event with volunteers of all ages brushing colour onto a wall, a coordinator pointing at a sketch, kids mixing paint, and a photographer documenting the progress","a cultural festival with dancers in traditional costumes on a stage, audience members clapping, food stalls serving international dishes, and children getting henna tattoos","a public art installation unveiling with the artist speaking into a microphone, a crowd gathered around a large sculpture, a journalist taking notes, and a child sitting on a parent's shoulders to see","a church pancake breakfast with volunteers flipping pancakes on a griddle, families seated at long folding tables, a child pouring syrup, and someone making fresh orange juice","a seniors' centre with elderly people playing cards at one table, others doing gentle stretches in a fitness circle, a volunteer serving tea, and someone teaching a tablet class"],a=["a kitchen where the sink is overflowing with foam and water, someone slips on the wet floor, a cat sits on the counter eating from a pot, and smoke rises from a burnt pan on the stove","a living room where a large tree branch has crashed through the window during a storm, rain is pouring in, and someone is covering furniture with plastic sheets while a child chases a dog through the mess","an office where ceiling tiles have collapsed, papers are scattered everywhere, the sprinkler is spraying water, and employees are scrambling to save their laptops","a street where a delivery truck has tipped over spilling hundreds of oranges, people are slipping on them, a dog is running away with one, and traffic is backed up for blocks","a backyard barbecue gone wrong: the grill is on fire, someone is spraying it with a garden hose, a table of food has been knocked over by a large dog, and guests are running in all directions","a classroom where a science experiment has exploded with colourful smoke filling the room, a student is covered in foam, glass beakers are on the floor, and the teacher looks shocked","a parking lot where a shopping cart has rolled into a car, groceries are scattered on the ground, a bird is stealing bread, and someone is chasing a rolling watermelon across the pavement","a dentist's waiting room where a ceiling pipe has burst and water is raining down, magazines are floating, the receptionist is standing on her chair, and a patient is using an umbrella indoors","a subway platform where a suitcase has popped open spilling clothes on the tracks, a busker's guitar has snapped a string, and pigeons are chasing someone holding a sandwich","a gym where a barbell has dropped creating a crack in the floor, a treadmill is running empty and throwing off a towel, a water fountain is spraying sideways, and a yoga class is trying to continue","a beach where seagulls have stolen an entire picnic spread, a sandcastle has collapsed from a wave, someone's inflatable is blowing away, and a lifeguard is chasing a runaway beach umbrella","a restaurant where a waiter has tripped and sent plates flying, diners are dodging food mid-air, soup is dripping off a tablecloth, and the chef is peering horrified through the kitchen window","a wedding ceremony outdoors where the wind has blown away the decorations, the cake is tilting on a table, a ring bearer is chasing a runaway ring, and guests are grabbing for flying napkins","a zoo where a monkey has escaped its enclosure and is sitting on a visitor's head, a zookeeper is trying to lure it down with a banana, children are laughing, and an ice cream cone is on the ground","a supermarket where a shelf has toppled like a domino knocking over two more, cans are rolling everywhere, a customer is stuck in the aisle, and a manager is on the phone with wide eyes","a laundromat where machines are overflowing with suds, someone's red sock has dyed all their white clothes pink, a child is sliding across the soapy floor, and a machine is shaking violently","a movie theatre where a large soda has spilled down the stadium seats, popcorn is scattered in the aisle, someone's phone is ringing loudly, and an usher is shining a flashlight trying to find the source","a public pool where someone has done an enormous cannonball splashing the fully-clothed lifeguard, floaties are scattered, a child's goggles are flying off, and an elderly swimmer is clutching the lane rope in surprise","a library where a towering stack of books has fallen like a domino chain across multiple tables, a student is buried under a pile, the librarian is shushing frantically, and a toddler is cheerfully tearing pages","an airport baggage carousel where suitcases are piling up and falling off, a dog has escaped a carrier and is running loose, a child is riding the belt, and a security guard is speaking urgently into a radio","a school hallway where a locker door has popped off its hinges launching a backpack, someone has tripped over a mop bucket spilling grey water, paper airplanes are everywhere, and the principal is sprinting around the corner","a garden where an automatic sprinkler system has gone haywire spraying in random directions, a surprised cat is on a fence, a barbecue has been abandoned, and a child in rain boots is dancing in the spray","a hair salon where a client's dye has turned bright green instead of blonde, another client's hair dryer has sent rollers flying, a mirror has fallen, and the stylist is holding up her hands in disbelief","an elevator that has opened to reveal people standing in ankle-deep water from a burst pipe above, someone is holding a soggy newspaper, a dog is splashing happily, and the buttons are sparking","a food truck festival where a giant inflatable taco has deflated onto a crowd, condiment bottles have burst, a small dog is tangled in bunting flags, and a musician on stage has dropped a speaker into a puddle","a car dealership where a test-drive car has rolled into the showroom through the glass doors, balloons are popping, a salesman has jumped behind a desk, and the driver is standing outside with keys in hand looking shocked","a bowling alley where the ball return machine is spitting out balls rapidly, someone has slipped on the oiled lane, pins are scattered beyond the curtain, and an employee is crawling to reach the emergency stop button","a camping site where a bear has torn open a cooler, marshmallows are roasting unattended and catching fire, a tent has collapsed with someone inside, and two raccoons are dragging a bag of chips into the bushes","a playground where a merry-go-round is spinning too fast and kids are flying off safely onto rubber mulch, a swing has wrapped around the top bar, a juice box has sprayed on a parent's shirt, and a squirrel has stolen a granola bar from a stroller","a science fair where a volcano model has erupted too aggressively spraying red goop on the judges, a robot project is rolling off the table, a solar system model is losing planets, and a parent is trying to photograph the chaos"],i=e===8,n=i?a:t,o=n[Math.floor(Math.random()*n.length)],s=await $([{role:"system",content:`You MUST generate a scene description based on EXACTLY this setting: "${o}". Do NOT change the location or general activity. Add vivid sensory details (colours, clothing, expressions, objects) to make it suitable as a DALL-E image prompt. Include 5-8 distinct activities or elements. Return JSON: { "description": "A detailed scene description suitable as a DALL-E prompt", "key_elements": ["element 1", "element 2", ...] }`},{role:"user",content:"Expand this setting into a vivid, detailed scene description."}]),l=i?"The scene should clearly depict something unusual, unexpected, or chaotic happening.":"The scene should depict normal everyday life with multiple distinct activities.",p=`A detailed, realistic illustration: ${s.description}. ${l} The image should be colourful, well-lit, and show diverse people of various ages. Style: clean digital illustration suitable for an English language exam, with clear visual details that can be described verbally.`;return{imageUrl:await U(p),sceneDescription:s}}async function ve(e,t,a,i=null){const n=E.find(l=>l.id===e);let o="";if(i&&(e===3||e===4||e===8)){const l=i.key_elements?i.key_elements.join(", "):"";o=`

IMPORTANT — The image shown to the test-taker depicted the following scene:
"${i.description}"
Key elements visible in the image: ${l}

Your model answer MUST describe/reference these specific elements from the image. For Task 3, the model answer should describe the scene. For Task 4, the model answer should predict what will happen next based on these scene elements. For Task 8, the model answer should describe the unusual situation depicted in the image.`}const s=`You are a certified CELPIP examiner evaluating a Speaking Task ${e} (${n.name}) response.
The test-taker's audio has been transcribed into text. Evaluate based on the transcript.

Use official CELPIP speaking criteria. Score on a scale of 3–12 (CLB levels).

Evaluate on these four criteria:
1. Content / Coherence — organization and relevance of ideas
2. Vocabulary — range and accuracy of vocabulary
3. Listenability — assess from transcript: filler words, repetition, incomplete sentences, flow
4. Task Fulfillment — completeness and appropriateness of the response${o}

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
  "model_answer": "A model spoken response that would score 10-12. ${e===3?"Must describe the specific elements shown in the image.":e===4?"Must make predictions based on the specific scene shown in the image.":""}"
}`;return await $([{role:"system",content:s},{role:"user",content:`Prompt given to the test-taker:
${t.prompt}

Transcript of the test-taker's spoken response:
${a}`}],{max_tokens:3e3})}function ye(e){const t={1:{prompt:"Your friend is thinking about moving to a new city for work. They are nervous about starting over. Give them advice on how to settle in and make the transition smoother."},2:{prompt:"Describe a memorable trip you took. Where did you go, what did you do, and why was it special?"},3:{prompt:"Look at the image and describe what you see. Include details about the people, activities, objects, and setting."},4:{prompt:"Look at the image. Based on what you see happening in this scene, what do you think will happen in the next few minutes? Make predictions about the people, their actions, and the situation."},5:{prompt:"A friend is deciding between joining a gym or exercising outdoors. Compare both options and try to persuade them to choose one."},6:{prompt:"You ordered furniture online, but the wrong items were delivered. Call the customer service line to explain the problem and ask for a resolution."},7:{prompt:"Some people think remote work is better than working in an office. Do you agree or disagree? Explain your opinion."},8:{prompt:"You arrive at the office on Monday morning and find that all the furniture has been rearranged overnight. Describe the situation to your colleague and discuss what might have happened."}};return t[e]||t[1]}function fe(e,t,a){try{const i=JSON.parse(localStorage.getItem("celpip_history")||"[]");i.push({section:e,taskId:t,score:a.overall_score,date:new Date().toISOString()}),localStorage.setItem("celpip_history",JSON.stringify(i))}catch{}}const S=[{id:1,name:"Reading Correspondence",description:"Understand written correspondence (e.g., emails, letters).",questions:11},{id:2,name:"Reading to Apply a Diagram",description:"Interpret diagrams, tables, or visual information.",questions:9},{id:3,name:"Reading for Information",description:"Extract key details from informational passages.",questions:9},{id:4,name:"Reading for Viewpoints",description:"Analyse and compare opinions or viewpoints in written texts.",questions:10}],be=3300;function we(e){var t;e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Home")}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">📖 Reading Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a reading part to practise, or try all parts together.</p>

      <div class="task-list">
        ${S.map(a=>`
          <div class="task-item" data-task-id="${a.id}">
            <div class="task-info">
              <h4>Part ${a.id}: ${a.name}</h4>
              <p>${a.description}</p>
            </div>
            <div class="task-meta">
              <div>${a.questions} questions</div>
            </div>
          </div>
        `).join("")}
      </div>
    </main>
  `,y(),(t=document.getElementById("btn-back"))==null||t.addEventListener("click",()=>d("home")),e.querySelectorAll(".task-item").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.dataset.taskId);d("reading-practice",{taskId:i})})})}async function ke(e,t={}){var h,u;const a=t.taskId||1,i=S.find(c=>c.id===a)||S[0],n=Math.floor(be/4);e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Reading")}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);">Generating reading passage and questions...</p>
      </div>
    </main>
  `,y(),(h=document.getElementById("btn-back"))==null||h.addEventListener("click",()=>d("reading"));let o;try{o=await xe(a)}catch{o=$e()}const s={};e.innerHTML=`
    ${v()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${f("Reading")}
          <h2 style="margin-top: var(--space-2);">Part ${i.id}: ${i.name}</h2>
        </div>
        <div id="timer-display">${k(n)}</div>
      </div>

      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-reading);">Passage</h3>
        <div style="line-height: 1.8; white-space: pre-wrap;">${o.passage}</div>
      </div>

      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Questions</h3>
      <div class="task-list" id="questions-container">
        ${o.questions.map((c,r)=>`
          <div class="card" style="padding: var(--space-5);" id="question-${r}">
            <p style="font-weight: 600; margin-bottom: var(--space-3);">${r+1}. ${c.question}</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${c.options.map((g,b)=>`
                <label style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer; transition: background var(--transition-fast);" class="option-label">
                  <input type="radio" name="q${r}" value="${b}" style="accent-color: var(--color-primary);" />
                  <span style="font-size: var(--font-size-sm);">${g}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btn-submit">Submit Answers</button>
      </div>
    </main>
  `,y(),(u=document.getElementById("btn-back"))==null||u.addEventListener("click",()=>{p&&p(),d("reading")}),e.querySelectorAll('input[type="radio"]').forEach(c=>{c.addEventListener("change",r=>{const g=r.target.name;s[g]=parseInt(r.target.value)})});const l=document.getElementById("timer-display"),p=P(n,c=>{l.innerHTML=k(c)},()=>{_(e,a,o,s)});document.getElementById("btn-submit").addEventListener("click",()=>{p(),_(e,a,o,s)})}function _(e,t,a,i){var p,h,u,c;S.find(r=>r.id===t);let n=0;const o=a.questions.map((r,g)=>{const b=i[`q${g}`],m=b===r.correct;return m&&n++,{...r,userAnswer:b,isCorrect:m,index:g}}),s=Math.round(n/a.questions.length*9+3),l=Math.min(12,Math.max(3,s));e.innerHTML=`
    ${v()}
    <main class="container results-container">
      ${f("Reading")}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">📖 Reading Results</h2>

      <div class="score-display">
        <div class="score-value">${l}</div>
        <div class="score-label">Estimated CLB Score · ${n}/${a.questions.length} correct</div>
      </div>

      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Question Review</h3>
      <div class="task-list">
        ${o.map((r,g)=>`
          <div class="card" style="padding: var(--space-5); border-left: 3px solid ${r.isCorrect?"var(--color-success)":"var(--color-error)"};">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">${g+1}. ${r.question}</p>
            <p style="font-size: var(--font-size-sm); color: ${r.isCorrect?"var(--color-success)":"var(--color-error)"};">
              ${r.isCorrect?"✓ Correct":`✗ Your answer: ${r.options[r.userAnswer]||"No answer"}`}
            </p>
            ${r.isCorrect?"":`<p style="font-size: var(--font-size-sm); color: var(--color-success); margin-top: var(--space-1);">Correct answer: ${r.options[r.correct]}</p>`}
            ${r.explanation?`<p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">${r.explanation}</p>`:""}
          </div>
        `).join("")}
      </div>

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-reading">← Back to Reading</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${(()=>{const r=S.find(g=>g.id===t+1);return r?'<button class="btn btn-primary" id="btn-continue-task">Continue → Part '+(t+1)+": "+r.name+"</button>":""})()}
      </div>
    </main>
  `,y(),(p=document.getElementById("btn-back"))==null||p.addEventListener("click",()=>d("reading")),(h=document.getElementById("btn-back-reading"))==null||h.addEventListener("click",()=>d("reading")),(u=document.getElementById("btn-retry"))==null||u.addEventListener("click",()=>d("reading-practice",{taskId:t})),(c=document.getElementById("btn-continue-task"))==null||c.addEventListener("click",()=>d("reading-practice",{taskId:t+1})),Ee("reading",t,{overall_score:l})}async function xe(e){const t=S.find(i=>i.id===e),a=`You are a CELPIP exam question writer. Generate a Reading Part ${e} (${t.name}) exercise.
Create a reading passage (200-350 words) and ${t.questions} multiple-choice questions.
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
}`;return await $([{role:"system",content:a},{role:"user",content:`Generate a new CELPIP reading exercise for Part ${e}.`}],{max_tokens:3e3})}function $e(e){return{passage:`Dear Neighbour,

I am writing to let you know about some upcoming changes in our neighbourhood. The City of Toronto has approved a plan to build a new community centre on Maple Street, which is expected to open by next summer.

The centre will include a swimming pool, a gymnasium, meeting rooms, and a small library. Construction will begin next month and may cause some noise and traffic disruptions. The city has assured us that work will only take place between 7:00 a.m. and 6:00 p.m. on weekdays.

If you have any concerns, the city is holding an information session at the local library this Saturday at 2:00 p.m. Everyone is welcome to attend and ask questions.

Best regards,
Sarah Thompson
Neighbourhood Association President`,questions:[{question:"What is the main purpose of this letter?",options:["To complain about noise","To inform neighbours about a new project","To invite people to a party","To request volunteers"],correct:1,explanation:"The letter informs neighbours about the new community centre construction."},{question:"When will the community centre open?",options:["Next month","This Saturday","Next summer","Next year"],correct:2,explanation:"The passage states it is 'expected to open by next summer'."},{question:"What will NOT be included in the community centre?",options:["Swimming pool","Gymnasium","Restaurant","Library"],correct:2,explanation:"The passage mentions a pool, gym, meeting rooms, and library — but no restaurant."},{question:"When will construction noise occur?",options:["All day every day","Weekdays 7 a.m. to 6 p.m.","Only on weekends","Only at night"],correct:1,explanation:"The city assured work will be between 7:00 a.m. and 6:00 p.m. on weekdays."}]}}function Ee(e,t,a){try{const i=JSON.parse(localStorage.getItem("celpip_history")||"[]");i.push({section:e,taskId:t,score:a.overall_score,date:new Date().toISOString()}),localStorage.setItem("celpip_history",JSON.stringify(i))}catch{}}const T=[{id:1,name:"Listening to Problem Solving",description:"Understand a conversation about a problem and determine the best solution.",questions:8},{id:2,name:"Listening to a Daily Life Conversation",description:"Comprehend a conversation about everyday topics.",questions:5},{id:3,name:"Listening for Information",description:"Extract specific details from an informational dialogue.",questions:6},{id:4,name:"Listening to a News Item",description:"Understand the main ideas and details from a news-style report.",questions:6},{id:5,name:"Listening to a Discussion",description:"Follow views and opinions in a discussion.",questions:6},{id:6,name:"Listening to Viewpoints",description:"Identify and compare opinions from multiple speakers.",questions:7}];function Se(e){var t;e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Home")}
      <h2 style="margin: var(--space-6) 0 var(--space-2); font-size: var(--font-size-2xl); font-weight: 700;">🎧 Listening Practice</h2>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-6);">Choose a listening part to practise. Audio plays only once, just like the real exam.</p>

      <div class="task-list">
        ${T.map(a=>`
          <div class="task-item" data-task-id="${a.id}">
            <div class="task-info">
              <h4>Part ${a.id}: ${a.name}</h4>
              <p>${a.description}</p>
            </div>
            <div class="task-meta">
              <div>${a.questions} questions</div>
            </div>
          </div>
        `).join("")}
      </div>
    </main>
  `,y(),(t=document.getElementById("btn-back"))==null||t.addEventListener("click",()=>d("home")),e.querySelectorAll(".task-item").forEach(a=>{a.addEventListener("click",()=>{const i=parseInt(a.dataset.taskId);d("listening-practice",{taskId:i})})})}async function Ie(e,t={}){var s;const a=t.taskId||1,i=T.find(l=>l.id===a)||T[0];e.innerHTML=`
    ${v()}
    <main class="container">
      ${f("Listening")}
      <div style="text-align: center; padding: var(--space-16) 0;">
        <div class="loading-spinner" style="width: 40px; height: 40px; margin: 0 auto var(--space-4);"></div>
        <p style="color: var(--color-text-secondary);" id="loading-status">Generating dialogue script...</p>
      </div>
    </main>
  `,y(),(s=document.getElementById("btn-back"))==null||s.addEventListener("click",()=>d("listening"));let n,o=null;try{n=await Te(a),document.getElementById("loading-status").textContent="Generating audio...",o=await ee(n.dialogue_text||n.passage)}catch{n=Pe()}Le(e,i,n,o)}function Le(e,t,a,i){var c;const n={};e.innerHTML=`
    ${v()}
    <main class="container">
      <div class="practice-header">
        <div>
          ${f("Listening")}
          <h2 style="margin-top: var(--space-2);">Part ${t.id}: ${t.name}</h2>
        </div>
        <div id="timer-display">${k(600)}</div>
      </div>

      <!-- Audio Player -->
      <div class="card" style="margin-bottom: var(--space-6); text-align: center;">
        <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-3); color: var(--color-accent-listening);">🔊 Listen to the Audio</h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-4);">The audio will play once. Listen carefully before answering the questions.</p>
        ${i?`
          <audio id="listening-audio" src="${i}" style="width: 100%;"></audio>
          <button class="btn btn-primary" id="btn-play-audio" style="margin-top: var(--space-3);">▶ Play Audio</button>
          <p id="audio-status" style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: var(--space-2);">Audio has not been played yet</p>
        `:`
          <div style="padding: var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm);">
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);"><strong>Transcript (audio unavailable):</strong></p>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.7; white-space: pre-wrap;">${a.dialogue_text||a.passage||""}</p>
          </div>
        `}
      </div>

      <!-- Questions -->
      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Questions</h3>
      <div class="task-list" id="questions-container">
        ${a.questions.map((r,g)=>`
          <div class="card" style="padding: var(--space-5);">
            <p style="font-weight: 600; margin-bottom: var(--space-3);">${g+1}. ${r.question}</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${r.options.map((b,m)=>`
                <label style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer;">
                  <input type="radio" name="q${g}" value="${m}" style="accent-color: var(--color-primary);" />
                  <span style="font-size: var(--font-size-sm);">${b}</span>
                </label>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btn-submit">Submit Answers</button>
      </div>
    </main>
  `,y(),(c=document.getElementById("btn-back"))==null||c.addEventListener("click",()=>{u&&u(),d("listening")});let s=!1;const l=document.getElementById("btn-play-audio"),p=document.getElementById("listening-audio");l&&p&&l.addEventListener("click",()=>{s||(s=!0,p.play(),l.disabled=!0,l.textContent="🔊 Playing...",l.classList.remove("btn-primary"),l.classList.add("btn-secondary"),document.getElementById("audio-status").textContent="Audio is playing...",p.addEventListener("ended",()=>{l.textContent="✓ Audio finished",document.getElementById("audio-status").textContent="Audio has been played (cannot replay)"}))}),e.querySelectorAll('input[type="radio"]').forEach(r=>{r.addEventListener("change",g=>{n[g.target.name]=parseInt(g.target.value)})});const h=document.getElementById("timer-display"),u=P(600,r=>{h.innerHTML=k(r)},()=>{D(e,t.id,a,n)});document.getElementById("btn-submit").addEventListener("click",()=>{u(),D(e,t.id,a,n)})}function D(e,t,a,i){var p,h,u,c;let n=0;const o=a.questions.map((r,g)=>{const b=i[`q${g}`],m=b===r.correct;return m&&n++,{...r,userAnswer:b,isCorrect:m}}),s=Math.round(n/a.questions.length*9+3),l=Math.min(12,Math.max(3,s));e.innerHTML=`
    ${v()}
    <main class="container results-container">
      ${f("Listening")}
      <h2 style="margin: var(--space-4) 0 var(--space-6); font-size: var(--font-size-2xl); font-weight: 700;">🎧 Listening Results</h2>

      <div class="score-display">
        <div class="score-value">${l}</div>
        <div class="score-label">Estimated CLB Score · ${n}/${a.questions.length} correct</div>
      </div>

      <h3 style="font-size: var(--font-size-base); font-weight: 600; margin-bottom: var(--space-4);">Question Review</h3>
      <div class="task-list">
        ${o.map((r,g)=>`
          <div class="card" style="padding: var(--space-5); border-left: 3px solid ${r.isCorrect?"var(--color-success)":"var(--color-error)"};">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">${g+1}. ${r.question}</p>
            <p style="font-size: var(--font-size-sm); color: ${r.isCorrect?"var(--color-success)":"var(--color-error)"};">
              ${r.isCorrect?"✓ Correct":`✗ Your answer: ${r.options[r.userAnswer]||"No answer"}`}
            </p>
            ${r.isCorrect?"":`<p style="font-size: var(--font-size-sm); color: var(--color-success); margin-top: var(--space-1);">Correct answer: ${r.options[r.correct]}</p>`}
            ${r.explanation?`<p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">${r.explanation}</p>`:""}
          </div>
        `).join("")}
      </div>

      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-6); justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-back-listening">← Back to Listening</button>
        <button class="btn btn-secondary" id="btn-retry">Practise Again</button>
        ${(()=>{const r=T.find(g=>g.id===t+1);return r?'<button class="btn btn-primary" id="btn-continue-task">Continue → Part '+(t+1)+": "+r.name+"</button>":""})()}
      </div>
    </main>
  `,y(),(p=document.getElementById("btn-back"))==null||p.addEventListener("click",()=>d("listening")),(h=document.getElementById("btn-back-listening"))==null||h.addEventListener("click",()=>d("listening")),(u=document.getElementById("btn-retry"))==null||u.addEventListener("click",()=>d("listening-practice",{taskId:t})),(c=document.getElementById("btn-continue-task"))==null||c.addEventListener("click",()=>d("listening-practice",{taskId:t+1})),ze("listening",t,{overall_score:l})}async function Te(e){const t=T.find(i=>i.id===e),a=`You are a CELPIP exam question writer. Generate a Listening Part ${e} (${t.name}) exercise.
Create a dialogue or monologue script (150-300 words) and ${t.questions} multiple-choice questions.
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
}`;return await $([{role:"system",content:a},{role:"user",content:`Generate a new CELPIP listening exercise for Part ${e}.`}],{max_tokens:3e3})}function Pe(e){return{dialogue_text:`Speaker 1: Hi, I'm having trouble with my internet connection. It's been really slow for the past few days.

Speaker 2: I'm sorry to hear that. Let me look into this for you. Can I have your account number?

Speaker 1: Sure, it's 4-5-7-8-2-3.

Speaker 2: Thank you. I can see there was some maintenance work in your area last week. That might have affected your connection. I can reset your modem remotely, or we can send a technician to check the wiring.

Speaker 1: I'd prefer if someone could come and check it. When would that be possible?

Speaker 2: We have availability this Thursday afternoon between 2 and 5 p.m. Would that work?

Speaker 1: That's perfect. Thank you very much.`,passage:null,questions:[{question:"What is the caller's problem?",options:["Their phone is broken","Their internet is slow","They need a new modem","Their bill is too high"],correct:1,explanation:"The caller says their internet connection has been really slow."},{question:"What caused the problem?",options:["A storm","Maintenance work","A broken modem","An unpaid bill"],correct:1,explanation:"The agent mentions maintenance work in the area last week."},{question:"What solution does the caller choose?",options:["Remote modem reset","A technician visit","Cancelling the service","Upgrading the plan"],correct:1,explanation:"The caller says they'd prefer someone to come and check it."},{question:"When is the technician available?",options:["Monday morning","Wednesday evening","Thursday afternoon","Friday morning"],correct:2,explanation:"The agent offers Thursday afternoon between 2 and 5 p.m."}]}}function ze(e,t,a){try{const i=JSON.parse(localStorage.getItem("celpip_history")||"[]");i.push({section:e,taskId:t,score:a.overall_score,date:new Date().toISOString()}),localStorage.setItem("celpip_history",JSON.stringify(i))}catch{}}const x=document.getElementById("app"),w={};let R=null;function d(e,t={}){window.history.pushState({path:e,params:t},"",`#${e}`),C(e,t)}function C(e,t={}){R=e;const a=w[e];a?a(t):O()}window.addEventListener("popstate",e=>{const t=e.state||{};C(t.path||"home",t.params||{})});w.home=()=>O();w.settings=()=>M();w.writing=()=>te(x);w["writing-practice"]=e=>ae(x,e);w.speaking=()=>ce(x);w["speaking-practice"]=e=>le(x,e);w.reading=()=>we(x);w["reading-practice"]=e=>ke(x,e);w.listening=()=>Se(x);w["listening-practice"]=e=>Ie(x,e);function v(){return`
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
  `}function O(){var t,a,i,n,o;const e=!Q();x.innerHTML=`
    ${v()}
    <main class="container">
      ${e?`
        <div class="api-key-banner">
          <span>⚠️ No API key configured. Add your OpenAI API key to start practising with AI-generated questions.</span>
          <button class="btn btn-secondary" id="banner-settings">Configure</button>
        </div>
      `:""}

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
  `,y(),(t=document.getElementById("section-listening"))==null||t.addEventListener("click",()=>d("listening")),(a=document.getElementById("section-reading"))==null||a.addEventListener("click",()=>d("reading")),(i=document.getElementById("section-writing"))==null||i.addEventListener("click",()=>d("writing")),(n=document.getElementById("section-speaking"))==null||n.addEventListener("click",()=>d("speaking")),(o=document.getElementById("banner-settings"))==null||o.addEventListener("click",()=>M())}function M(){var o;const e=document.querySelector(".modal-overlay");e&&e.remove();const t=I()||"",a=t?t.slice(0,7)+"..."+t.slice(-4):"",i=W(),n=document.createElement("div");n.className="modal-overlay",n.innerHTML=`
    <div class="modal">
      <h2>⚙️ Settings</h2>

      <div class="form-group">
        <label for="settings-api-key">OpenAI API Key</label>
        <input type="password" id="settings-api-key" placeholder="sk-..." value="${t}" />
        ${a?`<small style="color: var(--color-text-muted); margin-top: 4px; display: block;">Current: ${a}</small>`:""}
      </div>

      <div class="form-group">
        <label for="settings-model">Chat Model</label>
        <select id="settings-model">
          <option value="gpt-4o-mini" ${i==="gpt-4o-mini"?"selected":""}>gpt-4o-mini (faster, cheaper)</option>
          <option value="gpt-4o" ${i==="gpt-4o"?"selected":""}>gpt-4o (higher quality)</option>
        </select>
      </div>

      <div class="form-actions">
        ${t?'<button class="btn btn-ghost" id="settings-remove" style="margin-right: auto; color: var(--color-error);">Remove Key</button>':""}
        <button class="btn btn-ghost" id="settings-cancel">Cancel</button>
        <button class="btn btn-primary" id="settings-save">Save</button>
      </div>
    </div>
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("active")),n.addEventListener("click",s=>{s.target===n&&z(n)}),document.getElementById("settings-cancel").addEventListener("click",()=>z(n)),document.getElementById("settings-save").addEventListener("click",()=>{const s=document.getElementById("settings-api-key").value,l=document.getElementById("settings-model").value;K(s),V(l),z(n),C(R||"home")}),(o=document.getElementById("settings-remove"))==null||o.addEventListener("click",()=>{F(),z(n),C(R||"home")})}function z(e){e.classList.remove("active"),setTimeout(()=>e.remove(),300)}function y(){var e,t,a;(e=document.getElementById("nav-home"))==null||e.addEventListener("click",()=>d("home")),(t=document.getElementById("nav-settings"))==null||t.addEventListener("click",()=>M()),(a=document.getElementById("nav-history"))==null||a.addEventListener("click",()=>G())}function G(){var o;const e=document.querySelector(".modal-overlay");e&&e.remove();const t=JSON.parse(localStorage.getItem("celpip_history")||"[]").reverse(),a={writing:"✏️ Writing",speaking:"🎤 Speaking",reading:"📖 Reading",listening:"🎧 Listening"},i={writing:{1:"Writing an Email",2:"Survey Response"},speaking:{1:"Giving Advice",2:"Personal Experience",3:"Describing a Scene",4:"Making Predictions",5:"Comparing & Persuading",6:"Difficult Situation",7:"Expressing Opinions",8:"Unusual Situation"},reading:{1:"Correspondence",2:"Apply a Diagram",3:"For Information",4:"For Viewpoints"},listening:{1:"Problem Solving",2:"Daily Life",3:"For Information",4:"News Item",5:"Discussion",6:"Viewpoints"}},n=document.createElement("div");n.className="modal-overlay",n.innerHTML=`
    <div class="modal" style="max-height: 80vh; display: flex; flex-direction: column;">
      <h2>📊 Practice History</h2>

      ${t.length===0?`
        <div style="text-align: center; padding: var(--space-8) 0; color: var(--color-text-muted);">
          <p style="font-size: var(--font-size-xl); margin-bottom: var(--space-3);">📭</p>
          <p>No practice sessions yet.</p>
          <p style="font-size: var(--font-size-sm); margin-top: var(--space-2);">Complete a practice session to see your scores here.</p>
        </div>
      `:`
        <div style="overflow-y: auto; flex: 1; margin: var(--space-4) 0; display: flex; flex-direction: column; gap: var(--space-3);">
          ${t.map(s=>{var g;const l=a[s.section]||s.section,p=((g=i[s.section])==null?void 0:g[s.taskId])||`Task ${s.taskId}`,h=new Date(s.date),u=h.toLocaleDateString("en-CA",{month:"short",day:"numeric",year:"numeric"}),c=h.toLocaleTimeString("en-CA",{hour:"2-digit",minute:"2-digit"}),r=s.score>=9?"var(--color-success)":s.score>=6?"var(--color-warning)":"var(--color-error)";return`
                <div style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--color-surface); border-radius: var(--radius-sm); border-left: 3px solid ${r};">
                  <div style="font-size: var(--font-size-xl); font-weight: 700; color: ${r}; min-width: 40px; text-align: center;">${s.score}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: var(--font-size-sm);">${l} — ${p}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">${u} at ${c}</div>
                  </div>
                </div>
              `}).join("")}
        </div>
      `}

      <div class="form-actions" style="margin-top: var(--space-4);">
        ${t.length>0?'<button class="btn btn-ghost" id="history-clear" style="margin-right: auto; color: var(--color-error);">Clear History</button>':""}
        <button class="btn btn-primary" id="history-close">Close</button>
      </div>
    </div>
  `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("active")),n.addEventListener("click",s=>{s.target===n&&q(n)}),document.getElementById("history-close").addEventListener("click",()=>q(n)),(o=document.getElementById("history-clear"))==null||o.addEventListener("click",()=>{localStorage.removeItem("celpip_history"),q(n),G()})}function q(e){e.classList.remove("active"),setTimeout(()=>e.remove(),300)}function f(e="Back"){return`<button class="btn btn-ghost" id="btn-back">← ${e}</button>`}function k(e){const t=Math.floor(e/60),a=e%60;return`<div class="timer ${e<60?"danger":e<120?"warning":""}">⏱ ${String(t).padStart(2,"0")}:${String(a).padStart(2,"0")}</div>`}function P(e,t,a){let i=e;t(i);const n=setInterval(()=>{i--,t(i),i<=0&&(clearInterval(n),a())},1e3);return()=>clearInterval(n)}O();

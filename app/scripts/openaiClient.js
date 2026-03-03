/**
 * OpenAI API Client
 * Handles API key management, model selection, and all OpenAI API calls.
 */

const STORAGE_KEY_API = 'celpip_openai_api_key';
const STORAGE_KEY_MODEL = 'celpip_openai_model';
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Get the active API key (localStorage takes precedence over .env).
 */
export function getApiKey() {
    const stored = localStorage.getItem(STORAGE_KEY_API);
    if (stored) return stored;
    // Vite exposes VITE_ env vars to the client
    const envKey = import.meta.env?.VITE_OPENAI_API_KEY;
    if (envKey && envKey !== 'sk-your-key-here') return envKey;
    return null;
}

/**
 * Save the API key to localStorage.
 */
export function setApiKey(key) {
    if (key) {
        localStorage.setItem(STORAGE_KEY_API, key.trim());
    } else {
        localStorage.removeItem(STORAGE_KEY_API);
    }
}

/**
 * Remove the API key from localStorage.
 */
export function removeApiKey() {
    localStorage.removeItem(STORAGE_KEY_API);
}

/**
 * Get the selected chat model.
 */
export function getModel() {
    return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
}

/**
 * Set the chat model (gpt-4o-mini or gpt-4o).
 */
export function setModel(model) {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
}

/**
 * Check whether an API key is configured.
 */
export function hasApiKey() {
    return !!getApiKey();
}

/**
 * Send a chat completion request to the OpenAI API.
 */
export async function chatCompletion(messages, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured.');

    const model = options.model || getModel();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens ?? 2048,
            ...(options.response_format ? { response_format: options.response_format } : {}),
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Send a chat completion request and parse JSON response.
 */
export async function chatCompletionJSON(messages, options = {}) {
    const raw = await chatCompletion(messages, {
        ...options,
        response_format: { type: 'json_object' },
    });
    return JSON.parse(raw);
}

/**
 * Generate an image using DALL-E 3.
 */
export async function generateImage(prompt, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured.');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: options.size || '1024x1024',
            quality: options.quality || 'standard',
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `DALL-E API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
}

/**
 * Transcribe audio using Whisper.
 */
export async function transcribeAudio(audioBlob) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured.');

    // Determine file extension from blob MIME type (Safari uses mp4, Chrome uses webm)
    const ext = audioBlob.type.includes('mp4') ? 'mp4'
      : audioBlob.type.includes('aac') ? 'aac'
      : audioBlob.type.includes('wav') ? 'wav'
      : 'webm';
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.' + ext);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
}

/**
 * Generate speech audio using TTS.
 */
export async function textToSpeech(text, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('OpenAI API key is not configured.');

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: options.voice || 'alloy',
            response_format: 'mp3',
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `TTS API error: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

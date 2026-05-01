/**
 * AI Orchestrator
 * All AI calls happen client-side using the user's stored API key.
 * Keys are read from localStorage and never sent to the server.
 */

const PROVIDER_STORAGE_KEY = 'wandr_ai_provider'
const KEY_STORAGE_PREFIX = 'wandr_api_key_'

export const PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini'],
    defaultModel: 'gpt-4o',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-opus-4-5', 'claude-sonnet-4-5'],
    defaultModel: 'claude-sonnet-4-5',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-1.5-pro',
    placeholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
}

export function getStoredProvider() {
  return localStorage.getItem(PROVIDER_STORAGE_KEY) || 'openai'
}

export function setStoredProvider(provider) {
  localStorage.setItem(PROVIDER_STORAGE_KEY, provider)
}

export function getStoredKey(provider) {
  return localStorage.getItem(`${KEY_STORAGE_PREFIX}${provider}`) || ''
}

export function setStoredKey(provider, key) {
  localStorage.setItem(`${KEY_STORAGE_PREFIX}${provider}`, key)
}

export function clearStoredKey(provider) {
  localStorage.removeItem(`${KEY_STORAGE_PREFIX}${provider}`)
}

export function hasValidKey(provider) {
  const key = getStoredKey(provider)
  return key && key.length > 10
}

const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite'
];

// ── Core call function ──────────────────────────────────────────────────────

async function callAI(systemPrompt, userPrompt) {
  const provider = getStoredProvider()
  const key = getStoredKey(provider)

  if (!key) throw new Error(`No API key set for ${PROVIDERS[provider].name}`)

  if (provider === 'openai') return callOpenAI(key, systemPrompt, userPrompt)
  if (provider === 'anthropic') return callAnthropic(key, systemPrompt, userPrompt)
  if (provider === 'gemini') return callGemini(key, systemPrompt, userPrompt)

  throw new Error(`Unknown provider: ${provider}`)
}

async function callOpenAI(key, systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: PROVIDERS.openai.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `OpenAI error: ${res.status}`)
  }
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content)
}

async function callAnthropic(key, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: PROVIDERS.anthropic.defaultModel,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Anthropic error: ${res.status}`)
  }
  const data = await res.json()
  const text = data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*}/)
  if (!jsonMatch) throw new Error('No JSON found in Anthropic response')
  return JSON.parse(jsonMatch[0])
}

async function callGemini(key, systemPrompt, userPrompt) {
  let lastError

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { response_mime_type: 'application/json', temperature: 0.8 },
        }),
      }
    )

    if (res.status === 429) {
      const err = await res.json().catch(() => ({}))
      lastError = new Error(err.error?.message || `Rate limited on ${model}`)
      continue
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Gemini error: ${res.status}`)
    }

    const data = await res.json()
    const text = data.candidates[0].content.parts[0].text
    return JSON.parse(text)
  }

  throw lastError ?? new Error('All Gemini models exhausted')
}

// ── Prompt builders ─────────────────────────────────────────────────────────

const JSON_SYSTEM = `You are a knowledgeable travel expert. Always respond with valid JSON only — no markdown, no explanation, no preamble.`

export async function generatePlaces(destination, dates, interests) {
  const prompt = `Generate 20 must-visit places/attractions for ${destination}.
Travel dates: ${dates}
Traveller interests: ${interests || 'general sightseeing'}

Respond with this exact JSON:
{
  "places": [
    {
      "name": "Place name",
      "category": "Museum | Nature | Food | History | Art | Adventure | Nightlife | Shopping",
      "description": "2-3 sentence engaging description",
      "bestTime": "Best time to visit (e.g. early morning, sunset)",
      "estimatedDuration": "e.g. 2-3 hours",
      "priceRange": "Free | $ | $$ | $$$",
      "tip": "One local insider tip"
    }
  ]
}`
  return callAI(JSON_SYSTEM, prompt)
}

export async function generateFlights(origin, destination, startDate, endDate, budget) {
  const prompt = `Provide flight cost estimates and tips for travelling from ${origin} to ${destination}.
Outbound: ${startDate}, Return: ${endDate}
Budget: ${budget || 'flexible'}

Important: these are knowledge-based estimates, not live prices.

Respond with this exact JSON:
{
  "summary": "2 sentence overview of flight options",
  "routes": [
    {
      "type": "Direct | 1 Stop | 2 Stops",
      "airline": "Example airline(s) that commonly serve this route",
      "estimatedPrice": { "min": 120, "max": 280, "currency": "INR" },
      "duration": "e.g. 2h 30m",
      "notes": "Any useful note about this option"
    }
  ],
  "bestBookingTips": ["tip 1", "tip 2", "tip 3"],
  "cheapestMonths": ["Month1", "Month2"],
  "disclaimer": "Prices are estimates based on typical ranges and may vary significantly."
}`
  return callAI(JSON_SYSTEM, prompt)
}

export async function generateHotels(destination, startDate, endDate, budget, groupSize) {
  const prompt = `Suggest reasonable accommodation options in ${destination}.
Check-in: ${startDate}, Check-out: ${endDate}
Budget: ${budget || 'flexible'}, Group size: ${groupSize || 1}

Respond with this exact JSON:
{
  "summary": "2 sentence overview of accommodation in this destination",
  "options": [
    {
      "type": "Luxury Hotel | Boutique Hotel | Budget Hotel | Hostel | Apartment | Guesthouse",
      "name": "A real or representative example property name",
      "neighbourhood": "Area/neighbourhood name",
      "estimatedPrice": { "min": 30, "max": 80, "currency": "INR", "per": "night" },
      "highlights": ["highlight 1", "highlight 2"],
      "bestFor": "Solo | Couples | Groups | Families | Backpackers",
      "bookingTip": "One useful booking tip"
    }
  ],
  "neighbourhoodGuide": "2 sentences on which areas are best to stay",
  "disclaimer": "Prices are estimates based on typical ranges and may vary significantly."
}`
  return callAI(JSON_SYSTEM, prompt)
}

// ── Follow-up chat ──────────────────────────────────────────────────────────

export async function chatFollowUp(tripContext, chatHistory, userMessage) {
  const system = `You are a friendly, expert travel assistant helping plan a trip to ${tripContext.destination}.
Trip details: ${JSON.stringify(tripContext)}
Be concise, helpful, and conversational. You can reference the trip context to give specific advice.`

  const messages = [
    ...chatHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ]

  const provider = getStoredProvider()
  const key = getStoredKey(provider)
  if (!key) throw new Error(`No API key set for ${PROVIDERS[provider].name}`)

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: PROVIDERS.openai.defaultModel,
        messages: [{ role: 'system', content: system }, ...messages],
        temperature: 0.9,
      }),
    })
    const data = await res.json()
    return data.choices[0].message.content
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: PROVIDERS.anthropic.defaultModel,
        max_tokens: 1024,
        system,
        messages,
      }),
    })
    const data = await res.json()
    return data.content[0].text
  }

  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        }),
      }
    )
    const data = await res.json()
    return data.candidates[0].content.parts[0].text
  }
}

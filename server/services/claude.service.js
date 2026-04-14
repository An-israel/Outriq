import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const HAIKU  = 'claude-haiku-4-5-20251001'
const SONNET = 'claude-sonnet-4-6'

async function ask(model, prompt, maxTokens = 1024) {
  const msg = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  })
  return msg.content[0].text
}

function pipSummary(product) {
  const pip = product.pip_json ? JSON.parse(product.pip_json) : {}
  return `
Product: ${product.name}
Category: ${product.category}
Location: ${product.location}
Description: ${product.description}
Target Customer: ${product.target_customer || 'General public'}
Value Proposition: ${pip.valueProp || product.description}
Pain Points Solved: ${(pip.painPoints || []).join(', ') || 'N/A'}
Search Terms: ${(pip.searchTerms || []).join(', ') || 'N/A'}
Emotional Triggers: ${(pip.emotionalTriggers || []).join(', ') || 'N/A'}
`.trim()
}

// ── Generate Product Intelligence Profile ────────────────────
export async function generatePIP(productData) {
  const prompt = `You are an AI marketing strategist specialising in Nigerian markets.

Given this product, generate a comprehensive Product Intelligence Profile (PIP) as JSON.

Product Name: ${productData.name}
Category: ${productData.category}
Location: ${productData.location}
Description: ${productData.description}
Target Customer: ${productData.target_customer || ''}

Return ONLY valid JSON with this exact structure:
{
  "valueProp": "one sentence value proposition",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3", "pain point 4"],
  "searchTerms": ["term1", "term2", "term3", "term4", "term5", "term6"],
  "platforms": ["platform1", "platform2", "platform3"],
  "emotionalTriggers": ["trigger1", "trigger2", "trigger3"],
  "targetPersona": "2-3 sentence description of ideal customer",
  "uniqueAdvantages": ["advantage1", "advantage2", "advantage3"],
  "objections": ["common objection 1", "common objection 2"]
}`

  const raw = await ask(HAIKU, prompt, 800)
  const match = raw.match(/\{[\s\S]*\}/)
  return match ? JSON.parse(match[0]) : {}
}

// ── Score a signal against a product ─────────────────────────
export async function scoreSignal(signalText, product) {
  const prompt = `You are an AI marketing engine. Score how relevant this social media signal is to the product.

${pipSummary(product)}

Signal: "${signalText}"

Return ONLY valid JSON:
{
  "score": <integer 0-100>,
  "type": "<question|need|complaint|search>",
  "reasoning": "<one sentence why>"
}`

  const raw = await ask(HAIKU, prompt, 200)
  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    const parsed = JSON.parse(match[0])
    return { score: parsed.score || 50, type: parsed.type || 'question', reasoning: parsed.reasoning || '' }
  }
  return { score: 50, type: 'question', reasoning: '' }
}

// ── Simulate realistic intent signals ────────────────────────
export async function simulateSignals(product, platform, count = 3) {
  const platformContext = {
    nairaland: 'Nigerian forum Nairaland. Write in Nigerian English with local slang occasionally.',
    twitter:   'X/Twitter. Keep under 280 chars. Casual Nigerian English.',
    reddit:    'Reddit. Standard English, community-style questions.',
    linkedin:  'LinkedIn. Professional tone, business context.',
    instagram: 'Instagram comment. Casual, often short.',
    google:    'Google search query. Short, keyword-focused.',
    quora:     'Quora question. Complete sentence, looking for advice.',
    email:     'Email inquiry. Formal, specific request.'
  }

  const ctx = platformContext[platform] || 'social media post'

  const prompt = `You are simulating real user intent signals from ${platform}.

${pipSummary(product)}

Generate ${count} realistic user posts/messages from ${ctx} that show buying intent, need, or curiosity related to this product.

Each signal should feel genuine — different tones, different pain points, natural language.

Return ONLY valid JSON array:
[
  {
    "text": "<the actual post/message text>",
    "type": "<question|need|complaint|search>",
    "score": <integer 65-98>
  }
]`

  const raw = await ask(HAIKU, prompt, 600)
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) return []
  const signals = JSON.parse(match[0])
  return signals.slice(0, count)
}

// ── Generate conversational response to a signal ─────────────
export async function generateResponse(signal, product) {
  const platformVoice = {
    nairaland: 'Nigerian forum reply — helpful, warm, local flavour',
    twitter:   'Tweet reply — concise, genuine, no hard sell',
    reddit:    'Reddit comment — genuinely helpful, no spam',
    linkedin:  'LinkedIn reply — professional, value-first',
    instagram: 'Instagram comment — friendly, brief',
    quora:     'Quora answer — thorough, authoritative',
    default:   'helpful, genuine reply'
  }
  const voice = platformVoice[signal.platform] || platformVoice.default

  const prompt = `You are an AI marketing agent responding to a potential customer on behalf of a business.

${pipSummary(product)}

Platform: ${signal.platform_label}
User's message: "${signal.text}"

Write a ${voice}. Be genuinely helpful. Mention the product naturally — don't be spammy.
Max 3 sentences for short-form platforms, up to 150 words for long-form.
Do NOT use hashtags unless it's Instagram/Twitter.
Return only the response text, no extra formatting.`

  return ask(SONNET, prompt, 300)
}

// ── Generate SEO article ──────────────────────────────────────
export async function generateSEOArticle(product, keyword) {
  const pip = product.pip_json ? JSON.parse(product.pip_json) : {}
  const kw = keyword || (pip.searchTerms?.[0] ?? product.name)

  const prompt = `You are an expert SEO content writer for Nigerian markets.

${pipSummary(product)}

Write a 1,500-word SEO-optimised article targeting the keyword: "${kw}"

Structure:
- H1 title (include keyword)
- Introduction (150 words, hook + problem)
- H2: The Problem [describe pain point vividly]
- H2: The Solution [introduce product naturally]
- H2: Key Benefits [3-4 bullet points]
- H2: How It Works [simple 3-step process]
- H2: Who Is It For [target customer personas]
- H2: Why Choose [product name]
- Conclusion with soft CTA (no aggressive selling)

Use Nigerian context where relevant. Write naturally — not keyword-stuffed.
Return the full article in clean Markdown.`

  return ask(SONNET, prompt, 2000)
}

// ── Generate GEO optimisation content ────────────────────────
export async function generateGEO(product) {
  const prompt = `You are an AI search optimisation specialist (GEO — Generative Engine Optimisation).

${pipSummary(product)}

Generate content to make this product highly visible in AI-powered search engines (ChatGPT, Perplexity, Google AI Overview, Claude).

Return ONLY valid JSON:
{
  "schemaMarkup": "<complete JSON-LD schema markup as a string>",
  "aiDescription": "<150-word authoritative description optimised for AI citation>",
  "faqItems": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "topicalAuthority": ["topic cluster 1", "topic cluster 2", "topic cluster 3"]
}`

  const raw = await ask(SONNET, prompt, 1200)
  const match = raw.match(/\{[\s\S]*\}/)
  return match ? JSON.parse(match[0]) : {}
}

// ── Generate personalised outreach message ───────────────────
export async function generateOutreach(product, prospectContext) {
  const prompt = `You are an AI outreach specialist for a Nigerian business.

${pipSummary(product)}

Prospect context: ${prospectContext || 'Small business owner who may benefit from this product'}

Write a short, genuine personalised outreach message (email or DM).
Rules:
- 3-4 short paragraphs max
- Reference a specific pain point from the PIP
- No fake urgency ("limited time offer")
- End with a single soft CTA question
- Sounds human, not robotic
- Appropriate for Nigerian business culture

Return only the message text.`

  return ask(SONNET, prompt, 400)
}

// ── Generate landing page HTML ────────────────────────────────
export async function generateLandingPage(product) {
  const pip = product.pip_json ? JSON.parse(product.pip_json) : {}

  const prompt = `You are an expert conversion-focused landing page designer.

${pipSummary(product)}

Generate a complete, self-contained HTML landing page for this product.

Requirements:
- Dark theme matching: background #000, accent violet (#8b5cf6), text white
- Sections: Hero (headline + subheadline + CTA button), Benefits (3 cards), How It Works (3 steps), Social Proof (2 testimonials), FAQ (3 items), Final CTA
- Nigerian market context
- Clean, modern CSS embedded in <style> tag
- No external dependencies
- Mobile responsive
- CTA buttons say "Get Started Today"

Use these specifics:
- Value prop: ${pip.valueProp || product.description}
- Key benefits: ${(pip.painPoints || []).slice(0, 3).join(' | ')}
- Unique advantages: ${(pip.uniqueAdvantages || []).join(' | ')}

Return complete valid HTML document.`

  return ask(SONNET, prompt, 4000)
}

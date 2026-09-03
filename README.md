# DeckMind AI
### The Flagship AI Chat-to-Presentation Intelligence & Multi-Format Synthesis Engine

DeckMind AI is an advanced Manifest V3 Chrome Extension and client-side orchestration suite that seamlessly captures conversational threads from web LLM interfaces and automatically synthesizes executive-ready, luxury-grade **Microsoft PowerPoint (`.pptx`) presentations**, multi-format documentation, procedural architectural diagrams, and verbatim-grounded source evidence ledgers.

---

## Core System Architecture & Features

| Capability | DeckMind AI Specification |
|---|---|
| **Thread Ingestion** | Real-time DOM scrapers and mutation observers across 12+ AI web platforms |
| **Storytelling Engine** | 12 structured narrative frameworks (Executive, Technical, Pitch Deck, Academic, etc.) |
| **Source Grounding** | Verbatim citation mapping (`[Turn #3: Assistant]`) with 1-click live tab teleportation |
| **Design System** | Hand-crafted luxury design palettes (Rose Cream, Noir & Blush, Warm Editorial, Nordic Slate) |
| **Visual Architecture** | Procedural SVG diagrams & direct HTML5 Canvas 2D rasterization for guaranteed PPTX embedding |
| **Speaker Scripting** | Comprehensive presenter talking points and time-targeted rehearsal assistant |
| **Multi-Format Export** | Native 16:9 `.pptx`, Word `.docx`, Excel `.xlsx`, Flowcharts `.svg`, and Markdown/`.txt` |
| **Privacy & Security** | **100% Zero-Trust Client-Side Sandbox** with in-memory credential sanitization |

---

## Key Features

### 1. Multi-Platform Conversational Ingestion
Native, real-time scrapers and DOM mutation observers built specifically for:
- **ChatGPT & OpenAI** (`chatgpt.com`, `openai.com`)
- **Anthropic Claude** (`claude.ai`)
- **Google Gemini & AI Studio** (`gemini.google.com`, `aistudio.google.com`)
- **DeepSeek** (`deepseek.com`, `chat.deepseek.com`)
- **Perplexity AI** (`perplexity.ai`)
- **Microsoft Copilot** (`copilot.microsoft.com`, `copilot.bing.com`)
- **xAI Grok** (`grok.com`, `x.com/i/grok`)
- **Mistral Le Chat** (`mistral.ai`, `chat.mistral.ai`)
- **Meta AI** (`meta.ai`)
- **Open-WebUI & Local Ollama** (`localhost`, `127.0.0.1`)
- **Generic Semantic Fallback** for any custom AI chat interface

### 2. Executive Storyboarding & Layout Engine
DeckMind AI intelligently structures unorganized conversational transcripts into distinct executive slide layouts:
- `hero_title`: High-impact presentation cover with clean category tags
- `three_card_grid`: 3 structured glassmorphism insight pillars
- `split_comparison`: Side-by-side comparative analysis (e.g. Legacy Architecture vs AI Paradigm)
- `metrics_kpi`: Bold numerical callouts (`10x Velocity`, `99.4% Precision`)
- `timeline_steps`: 4-milestone execution roadmap (`01`, `02`, `03`, `04`)
- `architecture_blueprint`: Multi-tier system blueprint diagram
- `knowledge_graph`: Semantic concept topology and relational bridges
- `citations_sources`: Verbatim source evidence ledger with grounded turn quotes
- `conclusion`: Strategic takeaways and immediate action items

### 3. Verbatim Turn Grounding & Teleportation Engine
- Every metric, architectural pillar, and bullet point is linked to its exact conversation turn index.
- Click **"Teleport in Chat Tab"** in Deck Studio to smoothly scroll and highlight the exact message bubble in the live chat tab.
- Integrated **Multi-Source Knowledge Workspace** allowing you to merge additional research notes, technical PRDs, and transcripts.

### 4. Curated Luxury Design Palettes
1. **Rose Cream Luxury (Default)**: Warm luxury cream, crisp white cards, jet black text & delicate light pink accents.
2. **Noir & Blush Pink (Dark Luxury)**: Velvet black luxury with pure white typography & luminous light pink accents.
3. **Ivory & Ballet Pink**: Soft ivory cream, pure white containers & delicate rose quartz highlights.
4. **Monochrome & Rose Gold**: Minimalist white & jet black with high-fashion light pink accents.
5. **Warm Editorial (Thought Leadership)**: Thought leadership with espresso, warm cream, terracotta & rose accents.
6. **Nordic Slate & Cobalt**: Clean arctic slate white with deep navy & electric cobalt highlights.

### 5. Open-Source Model Orchestration & Multimodal Synthesis
- **In-Browser Zero-Trust Engine**: 100% client-side synthesis with zero server setup required.
- **Local Ollama Integration**: Connect to `http://localhost:11434` for LLaMA 3.3, Mistral NeMo, or DeepSeek-R1.
- **Local Stable Diffusion / SDXL**: Connect to `http://localhost:7860` (AUTOMATIC1111/ComfyUI) for bespoke AI-generated presentation visuals.

---

## Installation & Setup

### Install in Chrome / Chromium Browsers (Edge, Brave, Arc):
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** (top right toggle).
4. Click **"Load unpacked"** and select the `src/` directory in this repo.
5. Open any AI chat tab (ChatGPT, Claude, Gemini, DeepSeek, etc.) and observe the **DeckMind Action Pill** in the bottom-right corner.

### Keyboard Shortcuts:
- **Instant PPT Generation**: `Alt + Shift + P`
- **Open Deck Studio**: `Alt + Shift + D`

---

## Repository Architecture

```
DECKMIND_AI/
├── src/                          # Chrome Extension (Manifest V3)
│   ├── manifest.json             # Manifest V3 configuration (Title: 44 chars, Desc: 121 chars)
│   ├── background.js             # Service worker & local model proxy
│   ├── content.js                # Chat observer & draggable HUD injector
│   ├── hud.css                   # Floating HUD & message highlight styles
│   ├── chat_parsers.js           # Multi-platform DOM scrapers
│   ├── deck_extractor.js         # Semantic extractor & citation grounding engine
│   ├── storyboard_engine.js      # Storyboarding & narrative structuring engine
│   ├── visual_engine.js          # Procedural 16:9 SVG diagrams & theme palettes
│   ├── pptx_generator.js         # Native PptxGenJS 16:9 PPTX generator
│   ├── popup.html / .js / .css   # Action popup interface with store rating & privacy tag
│   ├── deck_studio.html / .js / .css # Fullscreen studio with onboarding modal & review engine
│   ├── options.html / .js / .css # Extension options & model configuration
│   ├── lib/pptxgen.bundle.js     # Bundled standalone PPTX engine
│   └── icons/                    # Extension icons (16, 32, 48, 128)
├── site/                         # Product-Led SEO Website (Fast, Semantic, 0 Dependencies)
│   ├── index.html                # Main landing page (SoftwareApplication & FAQ schema)
│   ├── chatgpt-to-powerpoint.html# High-intent ChatGPT to PPT programmatic page
│   ├── claude-to-presentation.html# Claude to Slides programmatic page
│   ├── deepseek-to-ppt.html      # DeepSeek to PPT programmatic page
│   ├── features.html             # 12 Storytelling Frameworks & Design Palettes
│   ├── how-it-works.html         # Quickstart guide & keyboard shortcuts
│   ├── compare.html              # Competitor comparison matrix
│   ├── privacy.html              # Zero-Trust Privacy Policy
│   ├── security.html             # Enterprise Security Architecture
│   ├── docs.html                 # Technical Documentation & Local LLM Setup
│   ├── faq.html                  # Search-Intent FAQ (FAQPage schema)
│   ├── sitemap.xml               # XML Sitemap with canonical URLs
│   ├── robots.txt                # Search engine crawl directives
│   └── css/site.css              # Dark-luxury responsive design system
├── cws_listing/                  # Chrome Web Store Optimization Kit
│   └── cws_listing.md            # Metadata, scored descriptions, long copy, and 5-screenshot visual storyboard
├── dist/                         # Packaged Extension Archive
│   └── deckmind-ai-chrome-store-upload.zip
├── package_cws.js                # Chrome Web Store preflight packaging script
├── build.ps1                     # Packaging script
├── LICENSE
├── PRIVACY.md                    # Privacy Policy & Security Guarantee
└── README.md
```

---

## Zero-Trust Privacy Guarantee

- **Zero Paid APIs / Zero External Cloud**: Your conversations are never transmitted to third-party commercial APIs.
- **Client-Side Secret Sanitization**: High-risk credentials (AWS keys, OpenAI/Anthropic tokens, private keys, JWTs) are automatically redacted before slide generation.
- **Manifest V3 Sandbox**: Complies with strict Chrome Web Store security standards.

---

*DeckMind AI v2.1.2 — Transforming AI conversations into executive presentations.*

/**
 * DeckMind AI — Multi-Platform Chat Parser
 * 
 * High-accuracy DOM extraction engine for AI conversational interfaces:
 * - ChatGPT (chatgpt.com / openai.com)
 * - Claude (claude.ai)
 * - Gemini & Google AI Studio (gemini.google.com / aistudio.google.com)
 * - DeepSeek (deepseek.com)
 * - Perplexity (perplexity.ai)
 * - Microsoft Copilot (copilot.microsoft.com / bing.com)
 * - Grok (grok.com / x.com)
 * - Mistral (mistral.ai / chat.mistral.ai)
 * - Meta AI (meta.ai)
 * - Poe (poe.com)
 * - Local Ollama Web interfaces (Open-WebUI, Ollama-UI, etc.)
 * - Generic Semantic Parser (fallback for any AI web client)
 */

'use strict';

(function (root) {
  const DeckMindParsers = {};

  /**
   * Detect current active platform
   */
  DeckMindParsers.detectPlatform = function (doc = (typeof document !== 'undefined' ? document : null), url = '') {
    const locHref = (doc && doc.location && doc.location.href) || (typeof window !== 'undefined' && window.location ? window.location.href : url) || '';
    const docTitle = (doc && doc.title ? doc.title : '').toLowerCase();
    const host = (locHref || '').toLowerCase();
    
    if (host.includes('chatgpt.com') || host.includes('openai.com') || docTitle.includes('chatgpt')) return 'chatgpt';
    if (host.includes('claude.ai') || docTitle.includes('claude')) return 'claude';
    if (host.includes('aistudio.google.com') || docTitle.includes('aistudio')) return 'aistudio';
    if (host.includes('gemini.google.com') || docTitle.includes('gemini')) return 'gemini';
    if (host.includes('deepseek.com') || docTitle.includes('deepseek')) return 'deepseek';
    if (host.includes('perplexity.ai') || docTitle.includes('perplexity')) return 'perplexity';
    if (host.includes('copilot.microsoft.com') || host.includes('microsoftcopilot.com') || host.includes('copilot.bing.com') || docTitle.includes('copilot')) return 'copilot';
    if (host.includes('grok.com') || (host.includes('x.com') && host.includes('grok')) || docTitle.includes('grok')) return 'grok';
    if (host.includes('mistral.ai') || docTitle.includes('mistral')) return 'mistral';
    if (host.includes('meta.ai') || docTitle.includes('meta ai')) return 'meta';
    if (host.includes('poe.com') || docTitle.includes('poe')) return 'poe';
    if (host.includes('sarvam.ai') || docTitle.includes('sarvam')) return 'sarvam';
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('openwebui')) return 'openwebui';
    return 'generic';
  };

  /**
   * Helper to sanitize and normalize text
   */
  function cleanText(text) {
    if (!text) return '';
    return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  }

  /**
   * Filter out reasoning scratchpad traces (DeepSeek-R1, OpenAI o1/o3, Claude thinking)
   * and UI noise (copy buttons, feedback actions, icon text) from message text.
   */
  function extractCleanMessageText(element) {
    if (!element) return '';
    try {
      const clone = element.cloneNode(true);
      // Strip reasoning/thought containers
      const reasoningNodes = clone.querySelectorAll('.ds-thought, details.ds-thought, div[class*="thought"], div[class*="reasoning"], details[class*="reasoning"], [data-is-thought="true"], [data-testid*="thought"]');
      reasoningNodes.forEach(node => node.remove());

      // Strip UI buttons, action bars, copy buttons
      const uiNoise = clone.querySelectorAll('button, [role="button"], .copy-button, nav, svg, [class*="action-bar"], [class*="feedback"], [class*="copy"]');
      uiNoise.forEach(node => node.remove());

      return cleanText(clone.textContent);
    } catch (e) {
      return cleanText(element.textContent);
    }
  }

  /**
   * Filter a collection of matched elements so that if any element is a child/descendant
   * of another matched element, it is discarded to prevent duplicate turn extraction.
   */
  function deduplicateNestedElements(elements) {
    const list = Array.from(elements || []);
    return list.filter((el, idx) => {
      return !list.some((other, oIdx) => oIdx !== idx && other.contains(el));
    });
  }

  /**
   * Extract code blocks from element
   */
  function extractCodeBlocks(element) {
    if (!element || !element.querySelectorAll) return [];
    const codeBlocks = [];
    const preTags = element.querySelectorAll('pre, pre code, div[class*="code-block"], div[class*="syntax-highlighter"]');
    
    preTags.forEach((pre, idx) => {
      let lang = 'code';
      const codeEl = (pre.querySelector && pre.querySelector('code')) || pre;
      const classList = Array.from(codeEl.classList || []).concat(Array.from(pre.classList || []));
      
      for (const cls of classList) {
        if (cls.startsWith('language-') || cls.startsWith('lang-')) {
          lang = cls.replace(/^(language-|lang-)/, '');
          break;
        }
      }
      
      if (lang === 'code' && pre.querySelector) {
        const langHeader = pre.querySelector('[class*="language-"], [class*="header"], span, div.flex.items-center');
        if (langHeader && langHeader.textContent && langHeader.textContent.trim().length < 20) {
          lang = langHeader.textContent.trim().toLowerCase();
        }
      }

      const codeContent = (codeEl.textContent || pre.textContent || '').trim();
      if (codeContent.length > 0) {
        codeBlocks.push({
          id: `code_${idx}`,
          language: lang.slice(0, 15) || 'snippet',
          code: codeContent,
          lineCount: codeContent.split('\n').length
        });
      }
    });
    return codeBlocks;
  }

  /**
   * Extract headings, bullet lists, bold takeaway sentences, and tables
   */
  function extractStructuralElements(element) {
    if (!element) return { headings: [], bullets: [], tables: [], boldHighlights: [] };
    const headings = [];
    const bullets = [];
    const tables = [];
    const boldHighlights = [];

    // Headings
    const hEls = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    hEls.forEach(h => {
      const text = cleanText(h.textContent);
      if (text.length > 2 && text.length < 120) headings.push(text);
    });

    // List items
    const liEls = element.querySelectorAll('li');
    liEls.forEach((li, i) => {
      if (i < 15) {
        const text = cleanText(li.textContent);
        if (text.length > 4 && text.length < 200) bullets.push(text);
      }
    });

    // Bold highlights / strong insights
    const strongEls = element.querySelectorAll('strong, b');
    strongEls.forEach(s => {
      const text = cleanText(s.textContent);
      if (text.length >= 6 && text.length <= 100 && !headings.includes(text)) {
        boldHighlights.push(text);
      }
    });

    // Tables
    const tableEls = element.querySelectorAll('table');
    tableEls.forEach((tbl, tIdx) => {
      const headers = Array.from(tbl.querySelectorAll('th')).map(th => cleanText(th.textContent));
      const rows = [];
      tbl.querySelectorAll('tbody tr, tr').forEach(tr => {
        const rowCells = Array.from(tr.querySelectorAll('td')).map(td => cleanText(td.textContent));
        if (rowCells.length > 0) rows.push(rowCells);
      });
      if (rows.length > 0 || headers.length > 0) {
        tables.push({ id: `tbl_${tIdx}`, headers, rows: rows.slice(0, 8) });
      }
    });

    return { headings, bullets, tables, boldHighlights };
  }

  /* =========================================================================
   * PLATFORM ADAPTERS
   * ========================================================================= */

  // 1. ChatGPT
  function parseChatGPT(doc) {
    const turns = [];
    let title = doc.title.replace(' - ChatGPT', '').replace('ChatGPT', '').trim();
    const titleEl = doc.querySelector('nav h2, [class*="header"] h1, [data-testid="conversation-title"], header h1');
    if (titleEl && titleEl.textContent) title = cleanText(titleEl.textContent);

    const rawArticles = doc.querySelectorAll('article[data-testid^="conversation-turn-"], [data-message-author-role], div[data-message-id]');
    const articles = deduplicateNestedElements(rawArticles);
    if (articles.length > 0) {
      articles.forEach((art, index) => {
        const roleAttr = art.getAttribute('data-message-author-role');
        let role = 'assistant';
        if (roleAttr === 'user') {
          role = 'user';
        } else if (roleAttr === 'assistant') {
          role = 'assistant';
        } else {
          const isUser = art.querySelector('[data-message-author-role="user"]') ||
                         art.getAttribute('data-testid')?.includes('turn-user') ||
                         art.querySelector('img[alt*="User"], [class*="user"]');
          role = isUser ? 'user' : 'assistant';
        }

        const textContainer = art.querySelector('.whitespace-pre-wrap, .markdown, [class*="text-message"]') || art;
        const text = extractCleanMessageText(textContainer);
        if (!text || text.length < 2) return;

        const codeBlocks = extractCodeBlocks(art);
        const { headings, bullets, tables, boldHighlights } = extractStructuralElements(art);

        turns.push({
          id: `turn_${index}`,
          index: index + 1,
          role,
          text,
          headings,
          bullets,
          tables,
          boldHighlights,
          codeBlocks,
          elementRef: art,
          timestamp: Date.now()
        });
      });
    }

    return { title: title || 'ChatGPT Intelligence Session', platform: 'ChatGPT', turns };
  }

  // 2. Claude
  function parseClaude(doc) {
    const turns = [];
    let title = doc.title.replace(' - Claude', '').replace('Claude', '').trim();
    const titleEl = doc.querySelector('[data-testid="chat-title"], header button span, header h1, h1');
    if (titleEl && titleEl.textContent) title = cleanText(titleEl.textContent);

    const raw = doc.querySelectorAll('[data-is-streaming], .font-claude-message, .font-user-message, div[class*="Message_content"], div[class*="message-container"], div[class*="Message"]');
    const messageElements = deduplicateNestedElements(raw);

    messageElements.forEach((el, index) => {
      const isUser = el.classList.contains('font-user-message') ||
                     el.querySelector('.font-user-message') ||
                     el.getAttribute('data-test-render-count') === 'user' ||
                     el.querySelector('div[class*="UserIcon"], div[class*="avatar"]');
      const role = isUser ? 'user' : 'assistant';
      const text = extractCleanMessageText(el);
      if (!text || text.length < 2) return;

      const codeBlocks = extractCodeBlocks(el);
      const { headings, bullets, tables, boldHighlights } = extractStructuralElements(el);

      turns.push({
        id: `turn_${index}`,
        index: index + 1,
        role,
        text,
        headings,
        bullets,
        tables,
        boldHighlights,
        codeBlocks,
        elementRef: el,
        timestamp: Date.now()
      });
    });

    return { title: title || 'Claude Architectural Session', platform: 'Claude', turns };
  }

  // 3. Gemini & AI Studio
  function parseGemini(doc) {
    const turns = [];
    let title = doc.title.replace(' - Gemini', '').replace('Gemini', '').trim();
    const titleEl = doc.querySelector('.conversation-title, [data-test-id="conversation-title"], header h1, span.chat-title');
    if (titleEl && titleEl.textContent) title = cleanText(titleEl.textContent);

    const raw = doc.querySelectorAll('user-query, model-response, ms-user-query, ms-chat-turn, div[class*="query-container"], div[class*="response-container"], div.conversation-container > div');
    const items = deduplicateNestedElements(raw);

    items.forEach((el, index) => {
      const tagName = el.tagName.toLowerCase();
      let role = 'assistant';
      if (tagName.includes('user') || el.className.toString().includes('user') || el.getAttribute('data-is-user') === 'true') {
        role = 'user';
      }

      const text = extractCleanMessageText(el);
      if (!text || text.length < 2) return;

      const codeBlocks = extractCodeBlocks(el);
      const { headings, bullets, tables, boldHighlights } = extractStructuralElements(el);

      turns.push({
        id: `turn_${index}`,
        index: index + 1,
        role,
        text,
        headings,
        bullets,
        tables,
        boldHighlights,
        codeBlocks,
        elementRef: el,
        timestamp: Date.now()
      });
    });

    return { title: title || 'Gemini Executive Session', platform: 'Gemini', turns };
  }

  // 4. DeepSeek
  function parseDeepSeek(doc) {
    const turns = [];
    let title = doc.title.replace(' - DeepSeek', '').replace('DeepSeek', '').trim();
    const raw = doc.querySelectorAll('div[class*="chat-message"], div[class*="message-item"], div[class*="_chat-item"], div.ds-chat-item');
    const messageContainers = deduplicateNestedElements(raw);

    messageContainers.forEach((el, index) => {
      const isUser = el.className.includes('user') || el.querySelector('[class*="user-avatar"], [class*="user-icon"]');
      const role = isUser ? 'user' : 'assistant';
      const text = extractCleanMessageText(el);
      if (!text || text.length < 2) return;

      const codeBlocks = extractCodeBlocks(el);
      const { headings, bullets, tables, boldHighlights } = extractStructuralElements(el);

      turns.push({
        id: `turn_${index}`,
        index: index + 1,
        role,
        text,
        headings,
        bullets,
        tables,
        boldHighlights,
        codeBlocks,
        elementRef: el,
        timestamp: Date.now()
      });
    });

    return { title: title || 'DeepSeek Research Session', platform: 'DeepSeek', turns };
  }

  // 5. Perplexity
  function parsePerplexity(doc) {
    const turns = [];
    let title = doc.title.replace(' - Perplexity', '').replace('Perplexity', '').trim();
    const raw = doc.querySelectorAll('div[class*="queryWrapper"], div[class*="thread-item"], div[class*="relative col-span-"], div.default.font-sans');
    const queryWrappers = deduplicateNestedElements(raw);

    queryWrappers.forEach((el, index) => {
      const isUser = el.querySelector('[class*="user"], [data-role="user"]') || (index % 2 === 0);
      const role = isUser ? 'user' : 'assistant';
      const text = extractCleanMessageText(el);
      if (!text || text.length < 2) return;

      const codeBlocks = extractCodeBlocks(el);
      const { headings, bullets, tables, boldHighlights } = extractStructuralElements(el);

      turns.push({
        id: `turn_${index}`,
        index: index + 1,
        role,
        text,
        headings,
        bullets,
        tables,
        boldHighlights,
        codeBlocks,
        elementRef: el,
        timestamp: Date.now()
      });
    });

    return { title: title || 'Perplexity Research Thread', platform: 'Perplexity', turns };
  }

  // 6. Generic & Open-WebUI Fallback
  function parseGeneric(doc) {
    const turns = [];
    const title = (doc.title || 'AI Thought Thread').replace(/[-|].*$/, '').trim();

    const raw = doc.querySelectorAll('article, section[class*="message"], div[class*="message"], div[class*="chat-turn"], div[class*="turn"], div[class*="bubble"], div[class*="chat-item"]');
    const candidates = deduplicateNestedElements(raw);

    if (candidates.length >= 1) {
      candidates.forEach((el, index) => {
        if (el.children && el.children.length > 30 && el.className && !el.className.includes('message')) return;
        const text = extractCleanMessageText(el);
        if (text.length < 5) return;

        const cls = (el.className || '').toString().toLowerCase();
        const isUser = cls.includes('user') ||
                       cls.includes('human') ||
                       cls.includes('prompt') ||
                       (el.getAttribute && el.getAttribute('data-role') === 'user');
        const role = isUser ? 'user' : 'assistant';
        const codeBlocks = extractCodeBlocks(el);
        const { headings, bullets, tables, boldHighlights } = extractStructuralElements(el);

        turns.push({
          id: `turn_${index}`,
          index: index + 1,
          role,
          text,
          headings,
          bullets,
          tables,
          boldHighlights,
          codeBlocks,
          elementRef: el,
          timestamp: Date.now()
        });
      });
    }

    return { title: title || 'AI Intelligence Session', platform: 'AI Web Interface', turns };
  }

  /**
   * Main extract function
   */
  DeckMindParsers.extractCurrentChat = function (doc = (typeof document !== 'undefined' ? document : null)) {
    if (!doc) return { title: 'Untitled AI Chat', platform: 'Unknown', turns: [] };
    
    const platform = DeckMindParsers.detectPlatform(doc);
    let result;

    switch (platform) {
      case 'chatgpt':
        result = parseChatGPT(doc);
        break;
      case 'claude':
        result = parseClaude(doc);
        break;
      case 'gemini':
      case 'aistudio':
        result = parseGemini(doc);
        break;
      case 'deepseek':
        result = parseDeepSeek(doc);
        break;
      case 'perplexity':
        result = parsePerplexity(doc);
        break;
      default:
        result = parseGeneric(doc);
        break;
    }

    if (!result || !result.turns || result.turns.length === 0) {
      result = parseGeneric(doc);
    }

    // Polish title if document title was generic
    if (result.turns && result.turns.length > 0 && (!result.title || result.title.includes('AI') || result.title.length < 3)) {
      const firstUserTurn = result.turns.find(t => t.role === 'user');
      if (firstUserTurn) {
        result.title = firstUserTurn.text.slice(0, 50).trim() + (firstUserTurn.text.length > 50 ? '...' : '');
      }
    }

    return result;
  };

  // Export for browser and node
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckMindParsers;
  } else {
    root.DeckMindParsers = DeckMindParsers;
  }
})(typeof self !== 'undefined' ? self : this);

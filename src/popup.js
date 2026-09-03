/**
 * DeckMind AI — Advanced Popup Logic Controller
 * Supports 1-Click Multi-Format Exports: PPTX, DOCX, XLSX, Flowchart, TXT
 */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  let targetSlideCount = 8;
  let activeTheme = 'rose_cream';
  let activeFramework = 'auto';
  let activeAudience = 'general';
  let activeChatPayload = null;

  const platformNameEl = document.getElementById('platform-name');
  const turnSummaryEl = document.getElementById('turn-summary');
  const badgeTextEl = document.getElementById('badge-text');
  const frameworkSelectEl = document.getElementById('framework-select');
  const audienceSelectEl = document.getElementById('audience-select');
  const themeSelectEl = document.getElementById('theme-select');
  const segmentedBtns = document.querySelectorAll('.segmented-btn');
  const btnOpenStudio = document.getElementById('btn-open-studio');
  const btnQuickPptx = document.getElementById('btn-quick-pptx');
  const btnQuickDocx = document.getElementById('btn-quick-docx');
  const btnQuickXlsx = document.getElementById('btn-quick-xlsx');
  const btnQuickFlow = document.getElementById('btn-quick-flow');
  const btnQuickTxt = document.getElementById('btn-quick-txt');
  const linkOptions = document.getElementById('link-options');

  // Load saved preferences
  const saved = await chrome.storage.local.get(['prefTheme', 'prefSlideCount', 'prefFramework', 'prefAudience']);
  if (saved.prefTheme) {
    activeTheme = saved.prefTheme;
    themeSelectEl.value = activeTheme;
  }
  if (saved.prefFramework && frameworkSelectEl) {
    activeFramework = saved.prefFramework;
    frameworkSelectEl.value = activeFramework;
  }
  if (saved.prefAudience && audienceSelectEl) {
    activeAudience = saved.prefAudience;
    audienceSelectEl.value = activeAudience;
  }
  if (saved.prefSlideCount) {
    targetSlideCount = saved.prefSlideCount;
    segmentedBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-slides')) === targetSlideCount);
    });
  }

  // Slide count selector
  segmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segmentedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      targetSlideCount = parseInt(btn.getAttribute('data-slides'));
      chrome.storage.local.set({ prefSlideCount: targetSlideCount });
    });
  });

  // Framework selector
  if (frameworkSelectEl) {
    frameworkSelectEl.addEventListener('change', (e) => {
      activeFramework = e.target.value;
      chrome.storage.local.set({ prefFramework: activeFramework });
    });
  }

  // Audience selector
  if (audienceSelectEl) {
    audienceSelectEl.addEventListener('change', (e) => {
      activeAudience = e.target.value;
      chrome.storage.local.set({ prefAudience: activeAudience });
    });
  }

  // Theme selector
  themeSelectEl.addEventListener('change', (e) => {
    activeTheme = e.target.value;
    chrome.storage.local.set({ prefTheme: activeTheme });
  });

  // Settings link
  linkOptions.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  // Fetch current active tab and chat data
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_CURRENT_CHAT' }, (response) => {
        if (chrome.runtime.lastError || !response || !response.data) {
          platformNameEl.textContent = 'Active Web Tab';
          turnSummaryEl.textContent = 'Open an AI chat (ChatGPT, Claude, Gemini, etc.)';
          badgeTextEl.textContent = 'Standby';
          badgeTextEl.parentElement.style.borderColor = '#64748B';
          badgeTextEl.parentElement.style.color = '#94A3B8';
          return;
        }

        const data = response.data;
        activeChatPayload = data;
        const turnCount = (data.turns || []).length;

        platformNameEl.textContent = data.platform ? `${data.platform} Thread` : 'AI Conversation';
        turnSummaryEl.textContent = `${turnCount} turns • "${(data.title || 'Session').slice(0, 30)}..."`;
        badgeTextEl.textContent = `${turnCount} Turns`;
      });
    }
  } catch (err) {
    console.warn('[DeckMind AI] Popup tab query error:', err);
  }

  function getEffectiveChat() {
    if (activeChatPayload && activeChatPayload.turns && activeChatPayload.turns.length > 0) {
      return activeChatPayload;
    }
    return {
      title: 'Executive Technical Architecture & Strategy',
      platform: 'DeckMind Intelligence',
      turns: [
        {
          id: 'turn_0',
          index: 1,
          role: 'user',
          text: 'How can we design an enterprise Chrome extension that transforms multi-turn AI chat threads into luxury presentations and documents?'
        },
        {
          id: 'turn_1',
          index: 2,
          role: 'assistant',
          text: 'We architect a 3-tier system: Content script parsers for multi-platform DOM scraping, in-browser semantic extractor for verbatim citation grounding, and multi-format export engines for PPTX, DOCX, XLSX, Flowcharts, and TXT.'
        }
      ]
    };
  }

  // Action: Open Studio
  btnOpenStudio.addEventListener('click', async () => {
    const chat = getEffectiveChat();
    const serializable = {
      title: chat.title,
      platform: chat.platform,
      turns: (chat.turns || []).map(t => ({
        id: t.id,
        index: t.index,
        role: t.role,
        text: t.text,
        headings: t.headings,
        bullets: t.bullets,
        tables: t.tables,
        boldHighlights: t.boldHighlights,
        codeBlocks: t.codeBlocks
      })),
      theme: activeTheme,
      framework: activeFramework,
      audience: activeAudience,
      targetSlideCount
    };
    await chrome.storage.local.set({ activeChatData: serializable, currentDeckPayload: null });
    chrome.tabs.create({ url: chrome.runtime.getURL('deck_studio.html') });
    window.close();
  });

  // Action: 1-Click Quick PPTX Download
  if (btnQuickPptx) {
    btnQuickPptx.addEventListener('click', async () => {
      btnQuickPptx.disabled = true;
      try {
        const chat = getEffectiveChat();
        const analyzed = window.DeckMindExtractor.analyzeChat(chat);
        const deck = window.DeckMindStoryboard.generateDeck(analyzed, {
          targetSlideCount,
          theme: activeTheme,
          framework: activeFramework,
          audience: activeAudience
        });
        await window.DeckMindPPTX.downloadPresentation(deck);
      } catch (err) {
        console.error('[DeckMind AI] Quick PPTX error:', err);
      } finally {
        btnQuickPptx.disabled = false;
      }
    });
  }

  // Action: 1-Click Quick DOCX Download
  if (btnQuickDocx) {
    btnQuickDocx.addEventListener('click', async () => {
      btnQuickDocx.disabled = true;
      try {
        const chat = getEffectiveChat();
        await window.DeckMindExport.generateDocx(chat);
      } catch (err) {
        console.error('[DeckMind AI] Quick DOCX error:', err);
      } finally {
        btnQuickDocx.disabled = false;
      }
    });
  }

  // Action: 1-Click Quick XLSX Download
  if (btnQuickXlsx) {
    btnQuickXlsx.addEventListener('click', async () => {
      btnQuickXlsx.disabled = true;
      try {
        const chat = getEffectiveChat();
        await window.DeckMindExport.generateXlsx(chat);
      } catch (err) {
        console.error('[DeckMind AI] Quick XLSX error:', err);
      } finally {
        btnQuickXlsx.disabled = false;
      }
    });
  }

  // Action: 1-Click Quick Flowchart Download
  if (btnQuickFlow) {
    btnQuickFlow.addEventListener('click', () => {
      const chat = getEffectiveChat();
      window.DeckMindExport.downloadFlowchart(chat);
    });
  }

  // Action: 1-Click Quick TXT Download
  if (btnQuickTxt) {
    btnQuickTxt.addEventListener('click', () => {
      const chat = getEffectiveChat();
      window.DeckMindExport.generateSummaryTxt(chat);
    });
  }
});

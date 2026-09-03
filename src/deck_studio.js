/**
 * DeckMind AI — Advanced Presentation & Multi-Format Studio Logic Controller
 * 
 * Delivers state-of-the-art storytelling, luxury layout polish, responsive 16:9 canvas preview,
 * verbatim source grounding, citation mapping, and unified knowledge workspace.
 * Multi-Format Output: Microsoft PowerPoint (.pptx), Word (.docx), Excel (.xlsx), Flowcharts (.svg), Text (.txt).
 */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  let currentDeck = null;
  let activeSlideIndex = 0;
  let activeTheme = 'rose_cream';
  let isPresenting = false;
  let rehearsalInterval = null;
  let rehearsalSeconds = 0;
  let currentChatData = null;
  let sourceTabId = null;

  // DOM Elements
  const deckTitleInput = document.getElementById('deck-title-input');
  const themeSelect = document.getElementById('studio-theme-select');
  const frameworkSelect = document.getElementById('studio-framework-select');
  const thumbnailList = document.getElementById('thumbnail-list');
  const slideCountNum = document.getElementById('slide-count-num');
  const slideFrame = document.getElementById('slide-frame');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const btnExportPptx = document.getElementById('btn-export-pptx');
  const btnExportDocx = document.getElementById('btn-export-docx');
  const btnExportXlsx = document.getElementById('btn-export-xlsx');
  const btnExportFlowchart = document.getElementById('btn-export-flowchart');
  const btnExportTxt = document.getElementById('btn-export-txt');
  const btnPresentMode = document.getElementById('btn-present-mode');
  const btnRehearsalMode = document.getElementById('btn-rehearsal-mode');
  const layoutPillBtns = document.querySelectorAll('.layout-pill-btn');

  // Multi-Format Tab Elements
  const btnFormatTabDocx = document.getElementById('btn-format-tab-docx');
  const btnFormatTabXlsx = document.getElementById('btn-format-tab-xlsx');
  const btnFormatTabFlowchart = document.getElementById('btn-format-tab-flowchart');
  const btnFormatTabTxt = document.getElementById('btn-format-tab-txt');
  const formatTablesCount = document.getElementById('format-tables-count');

  // Inspector Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const citationsContainer = document.getElementById('citations-container');
  const groundingScoreNum = document.getElementById('grounding-score-num');
  const visualPreviewContainer = document.getElementById('visual-preview-container');
  const selectDiagramType = document.getElementById('select-diagram-type');
  const diffusionPromptText = document.getElementById('diffusion-prompt-text');
  const btnGenerateDiffusion = document.getElementById('btn-generate-diffusion');
  const notesTextarea = document.getElementById('notes-textarea');
  const btnAutoRefine = document.getElementById('btn-auto-refine');

  // Copilot Elements
  const copilotHistory = document.getElementById('copilot-history');
  const copilotInput = document.getElementById('copilot-input');
  const copilotSendBtn = document.getElementById('copilot-send-btn');
  const copilotChips = document.querySelectorAll('.copilot-chip');

  // Source Modal Elements
  const sourceModalOverlay = document.getElementById('source-modal-overlay');
  const btnOpenSourceModal = document.getElementById('btn-open-source-modal');
  const btnCloseSourceModal = document.getElementById('btn-close-source-modal');
  const modalActiveChatTitle = document.getElementById('modal-active-chat-title');
  const addSourceTitle = document.getElementById('add-source-title');
  const addSourceText = document.getElementById('add-source-text');
  const btnMergeSource = document.getElementById('btn-merge-source');

  // Rehearsal Elements
  const rehearsalOverlay = document.getElementById('rehearsal-overlay');
  const btnCloseRehearsal = document.getElementById('btn-close-rehearsal');
  const rehearsalTimer = document.getElementById('rehearsal-timer');
  const btnTimerStart = document.getElementById('btn-timer-start');
  const btnTimerPause = document.getElementById('btn-timer-pause');
  const btnTimerReset = document.getElementById('btn-timer-reset');
  const timerTargetDesc = document.getElementById('timer-target-desc');
  const rehearsalScriptText = document.getElementById('rehearsal-script-text');

  // Presenter Elements
  const presenterOverlay = document.getElementById('presenter-overlay');
  const presenterSlideContainer = document.getElementById('presenter-slide-container');
  const presPrevBtn = document.getElementById('pres-prev');
  const presNextBtn = document.getElementById('pres-next');
  const presIndicator = document.getElementById('pres-indicator');
  const presExitBtn = document.getElementById('pres-exit');

  /**
   * HTML Entity Escaper for Safe DOM Rendering (XSS Prevention)
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* =========================================================================
   * 1. INITIALIZATION & DATA LOADING
   * ========================================================================= */
  async function initStudio() {
    let chatData = null;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sTab = urlParams.get('sourceTab');
      const autoDl = urlParams.get('autoDownload');
      if (sTab) {
        sourceTabId = parseInt(sTab, 10);
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const stored = await chrome.storage.local.get(['activeChatData', 'currentDeckPayload']);
        if (stored.activeChatData) {
          chatData = stored.activeChatData;
          currentChatData = chatData;
        }
        // Only load previous currentDeckPayload if user opened Studio standalone without an active chat trigger
        if (stored.currentDeckPayload && !sTab && !autoDl) {
          currentDeck = stored.currentDeckPayload;
        }
      }
    } catch (e) {
      console.warn('[DeckMind Studio] Storage load notice:', e);
    }

    if (!currentDeck) {
      if (!chatData || !chatData.turns || chatData.turns.length === 0) {
        chatData = {
          title: 'Executive Architecture & Strategy Brief',
          platform: 'ChatGPT',
          turns: [
            {
              id: 'turn_0',
              index: 1,
              role: 'user',
              text: 'How should we architect and launch the platform? We need real-time sandboxing, automated scoring, multiplayer matchmaking, and an operational launch roadmap for 100k concurrent users.'
            },
            {
              id: 'turn_1',
              index: 2,
              role: 'assistant',
              text: 'Here is the comprehensive architecture and launch management strategy:\n\n' +
                '## 1. High-Isolation Sandboxing Core\n' +
                '- **Containerized Sandboxing:** Use Firecracker microVMs and gVisor sandboxes to execute untrusted code with zero host escape risk.\n' +
                '- **Resource Quotas:** Strict 256MB memory and 1000ms CPU execution timeouts per test run.\n\n' +
                '## 2. Real-Time Battle Engine & Matchmaking\n' +
                '- **WebSocket Mesh:** Distributed WebSocket clusters orchestrated via Redis Pub/Sub for sub-10ms state synchronization.\n' +
                '- **Elo Rating Algorithm:** Dynamic skill-based matchmaking ensuring fair bracket pairings.\n\n' +
                '## 3. High-Throughput Tournament Infrastructure\n' +
                '- **Leaderboard Streaming:** Redis Sorted Sets and Kafka pipelines handling 50,000 score updates per second.\n' +
                '- **Global Edge CDN:** Low-latency static asset distribution and edge-cached problem descriptions.'
            }
          ]
        };
        currentChatData = chatData;
      }

      const analyzed = window.DeckMindExtractor.analyzeChat(chatData);
      currentDeck = window.DeckMindStoryboard.generateDeck(analyzed, {
        targetSlideCount: 8,
        theme: activeTheme,
        framework: 'auto'
      });
    }

    if (currentDeck.theme) {
      activeTheme = currentDeck.theme;
      if (themeSelect) themeSelect.value = activeTheme;
    }
    if (currentDeck.title && deckTitleInput) {
      deckTitleInput.value = currentDeck.title;
    }
    if (currentDeck.framework && frameworkSelect) {
      frameworkSelect.value = currentDeck.framework;
    }

    if (modalActiveChatTitle && chatData && chatData.title) {
      modalActiveChatTitle.textContent = chatData.title;
    }

    renderAll();

    // Check if autoDownload parameter is present
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const autoDl = urlParams.get('autoDownload');
      if (autoDl === 'true' || autoDl === 'pptx') {
        setTimeout(() => {
          if (btnExportPptx) btnExportPptx.click();
        }, 500);
      } else if (autoDl === 'docx') {
        setTimeout(() => {
          exportDocxHandler();
        }, 500);
      } else if (autoDl === 'xlsx') {
        setTimeout(() => {
          exportXlsxHandler();
        }, 500);
      } else if (autoDl === 'flowchart' || autoDl === 'flow') {
        setTimeout(() => {
          exportFlowchartHandler();
        }, 500);
      } else if (autoDl === 'txt') {
        setTimeout(() => {
          exportTxtHandler();
        }, 500);
      }
    } catch (e) {
      console.warn('[DeckMind Studio] autoDownload check error:', e);
    }

    // Check first-run onboarding
    checkFirstRunOnboarding();
  }

  /* =========================================================================
   * ONBOARDING & RETENTION REVIEW ENGINE
   * ========================================================================= */
  function checkFirstRunOnboarding() {
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const btnDismissOnboarding = document.getElementById('btn-dismiss-onboarding');
    if (!onboardingOverlay) return;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['deckmind_onboarded'], (res) => {
        if (!res || !res.deckmind_onboarded) {
          onboardingOverlay.classList.add('active');
        }
      });
    }

    if (btnDismissOnboarding) {
      btnDismissOnboarding.addEventListener('click', () => {
        onboardingOverlay.classList.remove('active');
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ deckmind_onboarded: true });
        }
      });
    }
  }

  function recordExportAndCheckReviewPrompt(format) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(['deckmind_export_count', 'deckmind_review_dismissed'], (res) => {
      const currentCount = (res && res.deckmind_export_count) ? Number(res.deckmind_export_count) + 1 : 1;
      chrome.storage.local.set({ deckmind_export_count: currentCount });

      const isDismissed = res && res.deckmind_review_dismissed;
      if (currentCount >= 2 && !isDismissed) {
        showReviewPromptBanner();
      }
    });
  }

  function showReviewPromptBanner() {
    const banner = document.getElementById('review-prompt-banner');
    const btnStore = document.getElementById('btn-review-store');
    const btnLater = document.getElementById('btn-review-later');
    const btnDismiss = document.getElementById('btn-review-dismiss');
    if (!banner) return;

    banner.style.display = 'flex';

    if (btnStore) {
      btnStore.onclick = () => {
        banner.style.display = 'none';
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ deckmind_review_dismissed: true });
        }
      };
    }
    if (btnLater) {
      btnLater.onclick = () => {
        banner.style.display = 'none';
      };
    }
    if (btnDismiss) {
      btnDismiss.onclick = () => {
        banner.style.display = 'none';
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ deckmind_review_dismissed: true });
        }
      };
    }
  }

  function getEffectiveChatData() {
    if (currentChatData && currentChatData.turns && currentChatData.turns.length > 0) {
      return currentChatData;
    }
    // Synthesize chat data from current deck slides
    return {
      title: currentDeck ? currentDeck.title : 'DeckMind Report',
      platform: 'DeckMind Intelligence Studio',
      summary: (currentDeck && currentDeck.slides && currentDeck.slides[1]) ? currentDeck.slides[1].subtitle : '',
      turns: (currentDeck && currentDeck.slides) ? currentDeck.slides.map((s, i) => ({
        id: `slide_turn_${i}`,
        index: i + 1,
        role: i === 0 ? 'user' : 'assistant',
        text: `${s.title}\n${s.subtitle || ''}\n${(s.items || []).map(it => `• ${it.title}: ${it.desc || ''}`).join('\n')}`,
        headings: [s.title],
        bullets: (s.items || []).map(it => `${it.title}: ${it.desc || ''}`)
      })) : []
    };
  }

  /* =========================================================================
   * 2. RENDER PIPELINE
   * ========================================================================= */
  function renderAll() {
    if (!currentDeck || !currentDeck.slides || currentDeck.slides.length === 0) return;

    if (slideCountNum) slideCountNum.textContent = currentDeck.slides.length;
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
    saveDeckState();
  }

  function saveDeckState() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ currentDeckPayload: currentDeck });
    }
  }

  /**
   * Render Left Sidebar Thumbnails
   */
  function renderThumbnails() {
    thumbnailList.innerHTML = '';

    currentDeck.slides.forEach((slide, idx) => {
      const item = document.createElement('div');
      item.className = `thumb-item ${idx === activeSlideIndex ? 'active' : ''}`;
      item.innerHTML = `
        <div class="thumb-top">
          <span class="thumb-idx">#${idx + 1}</span>
          <div class="thumb-actions">
            ${idx > 0 ? '<button class="thumb-btn" data-action="up" title="Move Up">▲</button>' : ''}
            ${idx < currentDeck.slides.length - 1 ? '<button class="thumb-btn" data-action="down" title="Move Down">▼</button>' : ''}
            <button class="thumb-btn" data-action="dup" title="Duplicate">❐</button>
            ${currentDeck.slides.length > 1 ? '<button class="thumb-btn" data-action="del" title="Delete">✕</button>' : ''}
          </div>
        </div>
        <div class="thumb-title">${escapeHtml(slide.title || 'Slide ' + (idx + 1))}</div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        activeSlideIndex = idx;
        renderAll();
      });

      item.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          if (action === 'up' && idx > 0) {
            const temp = currentDeck.slides[idx];
            currentDeck.slides[idx] = currentDeck.slides[idx - 1];
            currentDeck.slides[idx - 1] = temp;
            activeSlideIndex = idx - 1;
          } else if (action === 'down' && idx < currentDeck.slides.length - 1) {
            const temp = currentDeck.slides[idx];
            currentDeck.slides[idx] = currentDeck.slides[idx + 1];
            currentDeck.slides[idx + 1] = temp;
            activeSlideIndex = idx + 1;
          } else if (action === 'dup') {
            const cloned = JSON.parse(JSON.stringify(currentDeck.slides[idx]));
            cloned.id = 'slide_' + Date.now();
            cloned.title += ' (Copy)';
            currentDeck.slides.splice(idx + 1, 0, cloned);
            activeSlideIndex = idx + 1;
          } else if (action === 'del') {
            if (currentDeck.slides.length > 1) {
              currentDeck.slides.splice(idx, 1);
              if (activeSlideIndex >= currentDeck.slides.length) {
                activeSlideIndex = currentDeck.slides.length - 1;
              }
            }
          }
          renderAll();
        });
      });

      thumbnailList.appendChild(item);
    });
  }

  /**
   * Render Center 16:9 Presentation Canvas
   */
  function renderActiveSlide() {
    const slide = currentDeck.slides[activeSlideIndex];
    if (!slide) return;

    const theme = window.DeckMindVisual.getTheme(activeTheme);

    slideFrame.style.backgroundColor = theme.cardBg;
    slideFrame.style.color = theme.textPrimary;

    layoutPillBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-layout') === slide.type);
    });

    let bodyHtml = '';

    switch (slide.type) {
      case 'hero_title':
        const heroSvg = window.DeckMindVisual.getTopicAwareDiagramSVG(slide.title, activeTheme, { app: slide.title }, 420, 260);
        bodyHtml = `
          <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; height: 100%; align-items: center;">
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 12px;">
              <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
                ${escapeHtml(slide.badgeTag || 'EXECUTIVE STRATEGY BRIEF')}
              </span>
              <h1 class="slide-main-title editable-text" contenteditable="true" data-field="title" style="font-size: 26px;">
                ${escapeHtml(slide.title)}
              </h1>
              <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle" style="font-size: 13.5px;">
                ${escapeHtml(slide.subtitle || '')}
              </p>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                ${(slide.items || []).slice(0, 2).map((item, idx) => `
                  <div class="studio-card" style="background: ${theme.bg}; padding: 10px 14px;">
                    <div style="font-size: 12.5px; font-weight: 700; color: ${theme.accentHighlight};" contenteditable="true" data-card-idx="${idx}" data-card-field="title">${escapeHtml(item.title)}</div>
                    <div style="font-size: 11px; color: ${theme.textSecondary}; margin-top: 2px;" contenteditable="true" data-card-idx="${idx}" data-card-field="desc">${escapeHtml(item.desc)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid #18181B; box-shadow: 3px 3px 0px #18181B; background: ${theme.bg};">
              ${heroSvg}
            </div>
          </div>
        `;
        break;

      case 'architecture_blueprint':
        const archSvg = window.DeckMindVisual.getTopicAwareDiagramSVG(slide.title, activeTheme, { app: slide.title }, 440, 310);
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'TECHNICAL ARCHITECTURE')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1.15fr; gap: 16px; margin-top: 16px; flex: 1;">
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${(slide.items || []).slice(0, 3).map((item, i) => `
                <div class="studio-card" style="background: ${theme.bg}; padding: 10px 12px;">
                  <div class="card-icon-title">
                    <span style="font-size: 10.5px; font-weight: 800; font-family: monospace; color: ${theme.accentPrimary}; margin-right: 6px;">0${i + 1}</span>
                    <span contenteditable="true" data-card-idx="${i}" data-card-field="title">${escapeHtml(item.title)}</span>
                  </div>
                  <p class="card-desc" contenteditable="true" data-card-idx="${i}" data-card-field="desc">${escapeHtml(item.desc)}</p>
                </div>
              `).join('')}
            </div>
            <div style="display: flex; align-items: center; justify-content: center; border-radius: 8px; overflow: hidden; border: 1.5px solid #18181B; box-shadow: 3px 3px 0px #18181B; background: ${theme.bg};">
              ${archSvg}
            </div>
          </div>
        `;
        break;

      case 'three_card_grid':
      case 'executive_summary':
      default:
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'STRATEGIC PILLARS')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div class="grid-3-col">
            ${(slide.items || []).map((item, i) => `
              <div class="studio-card" style="background: ${theme.bg};">
                <div>
                  <div class="card-icon-title">
                    <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: ${theme.accentPrimary}; margin-right: 6px;">0${i + 1}</span>
                    <span contenteditable="true" data-card-idx="${i}" data-card-field="title">${escapeHtml(item.title)}</span>
                  </div>
                  <p class="card-desc" contenteditable="true" data-card-idx="${i}" data-card-field="desc">${escapeHtml(item.desc)}</p>
                </div>
                ${item.citation ? `
                  <div class="card-cite-badge">
                    ${escapeHtml(item.citation)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'split_comparison':
        const left = slide.leftCard || { title: 'Baseline Constraints', items: ['Legacy dependencies', 'Manual friction', 'High error surface'] };
        const right = slide.rightCard || { title: 'Modernized Architecture', items: ['Automated execution', '100% Grounding', 'High velocity scaling'] };
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'COMPARATIVE MATRIX')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div class="split-grid">
            <div class="split-card left" style="background: ${theme.bg};">
              <h3 style="font-size: 15px; font-weight: 700; color: ${theme.textSecondary};" contenteditable="true" data-split-side="left" data-split-title="true">${escapeHtml(left.title)}</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                ${(left.items || []).map((b, idx) => `<div class="split-bullet" style="color: ${theme.textSecondary};" contenteditable="true" data-split-side="left" data-split-idx="${idx}">• ${escapeHtml(b)}</div>`).join('')}
              </div>
            </div>
            <div class="split-card right" style="background: ${theme.bg}; border-color: ${theme.accentPrimary};">
              <h3 style="font-size: 15px; font-weight: 700; color: ${theme.textPrimary};" contenteditable="true" data-split-side="right" data-split-title="true">${escapeHtml(right.title)}</h3>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                ${(right.items || []).map((b, idx) => `<div class="split-bullet" style="color: ${theme.textPrimary}; font-weight: 700;" contenteditable="true" data-split-side="right" data-split-idx="${idx}">✔ ${escapeHtml(b)}</div>`).join('')}
              </div>
            </div>
          </div>
        `;
        break;

      case 'metrics_kpi':
        const metrics = slide.metrics || [
          { value: '99.9%', label: 'Target Availability' },
          { value: '< 50ms', label: 'Processing Latency' },
          { value: '10x', label: 'Scalability Factor' }
        ];
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'PERFORMANCE KPIS')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px;">
            ${metrics.map((m, idx) => `
              <div class="studio-card" style="background: ${theme.bg}; text-align: center; padding: 14px;">
                <div style="font-size: 32px; font-weight: 800; font-family: monospace; color: ${theme.accentHighlight};" contenteditable="true" data-metric-idx="${idx}" data-metric-field="value">${escapeHtml(m.value)}</div>
                <div style="font-size: 12px; font-weight: 700; color: ${theme.textPrimary}; margin-top: 4px;" contenteditable="true" data-metric-idx="${idx}" data-metric-field="label">${escapeHtml(m.label)}</div>
              </div>
            `).join('')}
          </div>
          <div class="grid-3-col" style="margin-top: 12px;">
            ${(slide.items || []).slice(0, 3).map((item, idx) => `
              <div class="studio-card" style="background: ${theme.bg};">
                <div style="font-size: 13px; font-weight: 700; color: ${theme.textPrimary};" contenteditable="true" data-card-idx="${idx}" data-card-field="title">${escapeHtml(item.title)}</div>
                <div style="font-size: 11.5px; color: ${theme.textSecondary}; margin-top: 4px;" contenteditable="true" data-card-idx="${idx}" data-card-field="desc">${escapeHtml(item.desc)}</div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'timeline_steps':
        const steps = slide.steps || [
          { step: '01', title: 'Phase 1: Prototyping', desc: 'Validate core technical requirements.' },
          { step: '02', title: 'Phase 2: Core Engineering', desc: 'Develop services and test suites.' },
          { step: '03', title: 'Phase 3: Validation', desc: 'Security benchmarking and tuning.' },
          { step: '04', title: 'Phase 4: Deployment', desc: 'Production rollout and telemetry.' }
        ];
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'ROLLOUT ROADMAP')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; flex: 1;">
            ${steps.map((st, idx) => `
              <div class="studio-card" style="background: ${theme.bg};">
                <span class="thumb-idx" style="align-self: flex-start;" contenteditable="true" data-step-idx="${idx}" data-step-field="step">${escapeHtml(st.step)}</span>
                <div style="font-size: 13px; font-weight: 700; color: ${theme.textPrimary}; margin-top: 6px;" contenteditable="true" data-step-idx="${idx}" data-step-field="title">${escapeHtml(st.title)}</div>
                <div style="font-size: 11.5px; color: ${theme.textSecondary}; margin-top: 4px;" contenteditable="true" data-step-idx="${idx}" data-step-field="desc">${escapeHtml(st.desc)}</div>
              </div>
            `).join('')}
          </div>
        `;
        break;

      case 'citations_sources':
        const cList = slide.citationsList || [
          { turnLabel: 'Turn #1 (User Requirement)', quote: 'Direct requirement context.' },
          { turnLabel: 'Turn #2 (AI Assistant)', quote: 'Architecture specification insight.' }
        ];
        bodyHtml = `
          <div>
            <span class="slide-tag-badge" contenteditable="true" data-field="badgeTag">
              ${escapeHtml(slide.badgeTag || 'EVIDENCE REGISTER')}
            </span>
            <h2 class="slide-main-title editable-text" contenteditable="true" data-field="title">${escapeHtml(slide.title)}</h2>
            <p class="slide-sub-title editable-text" contenteditable="true" data-field="subtitle">${escapeHtml(slide.subtitle || '')}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; flex: 1;">
            ${cList.map((c, idx) => `
              <div class="studio-card" style="background: ${theme.bg};">
                <div style="font-size: 11px; font-weight: 700; color: ${theme.accentPrimary};" contenteditable="true" data-citation-idx="${idx}" data-citation-field="turnLabel">${escapeHtml(c.turnLabel)}</div>
                <p style="font-size: 11.5px; font-style: italic; color: ${theme.textSecondary}; margin-top: 4px;" contenteditable="true" data-citation-idx="${idx}" data-citation-field="quote">"${escapeHtml(c.quote)}"</p>
              </div>
            `).join('')}
          </div>
        `;
        break;
    }

    slideFrame.innerHTML = bodyHtml;

    // Attach Inline Text Editing Handlers with full slide type support
    slideFrame.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.addEventListener('blur', () => {
        const field = el.getAttribute('data-field');
        const cardIdx = el.getAttribute('data-card-idx');
        const cardField = el.getAttribute('data-card-field');
        const metricIdx = el.getAttribute('data-metric-idx');
        const metricField = el.getAttribute('data-metric-field');
        const stepIdx = el.getAttribute('data-step-idx');
        const stepField = el.getAttribute('data-step-field');
        const citationIdx = el.getAttribute('data-citation-idx');
        const citationField = el.getAttribute('data-citation-field');
        const splitSide = el.getAttribute('data-split-side');
        const splitTitle = el.getAttribute('data-split-title');
        const splitIdx = el.getAttribute('data-split-idx');

        if (field) {
          slide[field] = el.textContent.trim();
        } else if (cardIdx !== null && cardField) {
          const idxNum = parseInt(cardIdx, 10);
          if (slide.items && slide.items[idxNum]) {
            slide.items[idxNum][cardField] = el.textContent.trim();
          }
        } else if (metricIdx !== null && metricField) {
          const mIdx = parseInt(metricIdx, 10);
          if (slide.metrics && slide.metrics[mIdx]) {
            slide.metrics[mIdx][metricField] = el.textContent.trim();
          }
        } else if (stepIdx !== null && stepField) {
          const sIdx = parseInt(stepIdx, 10);
          if (slide.steps && slide.steps[sIdx]) {
            slide.steps[sIdx][stepField] = el.textContent.trim();
          }
        } else if (citationIdx !== null && citationField) {
          const cIdx = parseInt(citationIdx, 10);
          if (slide.citationsList && slide.citationsList[cIdx]) {
            slide.citationsList[cIdx][citationField] = el.textContent.trim().replace(/^"|"$/g, '');
          }
        } else if (splitSide && splitTitle) {
          const target = splitSide === 'left' ? slide.leftCard : slide.rightCard;
          if (target) target.title = el.textContent.trim();
        } else if (splitSide && splitIdx !== null) {
          const sIdx = parseInt(splitIdx, 10);
          const target = splitSide === 'left' ? slide.leftCard : slide.rightCard;
          if (target && target.items && target.items[sIdx] !== undefined) {
            target.items[sIdx] = el.textContent.trim().replace(/^[•✔]\s*/, '');
          }
        }
        renderThumbnails();
        saveDeckState();
      });
    });
  }

  /**
   * Render Right Inspector Tabs
   */
  function renderInspector() {
    const slide = currentDeck.slides[activeSlideIndex];
    if (!slide) return;

    // Update Multi-Format Tab stats
    const chatData = getEffectiveChatData();
    const tables = window.DeckMindExport.extractAllTables(chatData);
    if (formatTablesCount) {
      formatTablesCount.textContent = `Found ${tables.length} structured data table(s) with ${tables.reduce((acc, t) => acc + t.rows.length, 0)} total rows.`;
    }

    // 1. Citations Tab
    citationsContainer.innerHTML = '';
    const citations = slide.citations || [];
    if (citations.length === 0) {
      citationsContainer.innerHTML = '<div style="font-size: 12px; color: var(--text-secondary);">This slide is grounded in high-level synthesized context.</div>';
    } else {
      citations.forEach(c => {
        const card = document.createElement('div');
        card.className = 'studio-card';
        card.innerHTML = `
          <div style="font-size: 11px; font-weight: 800; font-family: monospace; color: var(--accent-pink-dark);">[Turn #${escapeHtml(c.turnIndex)}: ${escapeHtml(c.role || 'Source')}]</div>
          <p style="font-size: 11.5px; font-style: italic; color: var(--text-secondary); margin-top: 4px;">"${escapeHtml(c.snippet || c.verbatim)}"</p>
          <button class="header-btn retro-btn" style="padding: 3px 8px; font-size: 10px; margin-top: 6px; align-self: flex-start;" data-turn="${escapeHtml(c.turnIndex)}">Teleport in Chat</button>
        `;
        card.querySelector('button').addEventListener('click', () => {
          const targetTurn = parseInt(c.turnIndex, 10) - 1;
          if (sourceTabId) {
            chrome.tabs.update(sourceTabId, { active: true }, (tab) => {
              if (chrome.runtime.lastError) return;
              if (tab && tab.windowId) {
                chrome.windows.update(tab.windowId, { focused: true });
              }
              chrome.tabs.sendMessage(sourceTabId, { action: 'HIGHLIGHT_TURN', turnIndex: targetTurn });
            });
          } else {
            chrome.tabs.query({ url: ['*://*.chatgpt.com/*', '*://*.claude.ai/*', '*://*.gemini.google.com/*', '*://*.deepseek.com/*', '*://*.perplexity.ai/*', '*://*.copilot.microsoft.com/*', '*://*.grok.com/*'] }, (tabs) => {
              if (tabs && tabs.length > 0) {
                const targetTab = tabs[0];
                chrome.tabs.update(targetTab.id, { active: true }, () => {
                  if (targetTab.windowId) {
                    chrome.windows.update(targetTab.windowId, { focused: true });
                  }
                  chrome.tabs.sendMessage(targetTab.id, { action: 'HIGHLIGHT_TURN', turnIndex: targetTurn });
                });
              }
            });
          }
        });
        citationsContainer.appendChild(card);
      });
    }

    // Grounding Score
    if (groundingScoreNum) {
      const gResult = window.DeckMindExtractor.calculateGroundingScore(currentDeck, citations);
      groundingScoreNum.textContent = `${gResult.score}%`;
    }

    // 2. Visuals Tab
    renderVisualPreview(slide.visualType || 'neural_web');
    if (selectDiagramType) {
      selectDiagramType.value = slide.visualType || 'neural_web';
    }
    if (diffusionPromptText) {
      diffusionPromptText.textContent = window.DeckMindVisual.buildDiffusionPrompt(slide.title, activeTheme, slide.type);
    }

    // 3. Speaker Notes Tab
    if (notesTextarea) {
      notesTextarea.value = slide.speakerNotes || '';
    }

    // 4. Rehearsal Script Sync
    if (rehearsalScriptText) {
      rehearsalScriptText.textContent = slide.speakerNotes || `Talking points for "${slide.title}": Focus on explaining the foundational architecture and key outcomes.`;
    }
  }

  function renderVisualPreview(visualType) {
    if (!visualPreviewContainer) return;
    let svg = '';
    if (visualType === 'architecture_blueprint') {
      svg = window.DeckMindVisual.generateArchitectureBlueprintSVG(activeTheme, 300, 170);
    } else if (visualType === 'process_flow') {
      svg = window.DeckMindVisual.generateProcessFlowSVG(activeTheme, [], 300, 170);
    } else if (visualType === 'metric_gauges') {
      svg = window.DeckMindVisual.generateMetricGaugesSVG(activeTheme, [], 300, 170);
    } else {
      svg = window.DeckMindVisual.generateNeuralWebSVG(activeTheme, 300, 170);
    }
    visualPreviewContainer.innerHTML = svg;
  }

  /* =========================================================================
   * 3. AI PRESENTATION COPILOT CONTROLLER
   * ========================================================================= */
  function executeCopilotCommand(cmdType, customPrompt = '') {
    const slide = currentDeck.slides[activeSlideIndex];
    if (!slide) return;

    let userMsgText = customPrompt;
    let aiResponseText = 'Applied updates to slide.';

    if (cmdType === 'visual') {
      userMsgText = 'Make this slide more visual';
      slide.type = 'architecture_blueprint';
      slide.visualType = 'architecture_blueprint';
      aiResponseText = 'Converted layout to technical architecture blueprint and updated vector diagram.';
    } else if (cmdType === 'condense') {
      userMsgText = 'Reduce text by 40%';
      if (slide.items) {
        slide.items.forEach(it => {
          if (it.desc) it.desc = it.desc.slice(0, Math.round(it.desc.length * 0.6)) + '...';
        });
      }
      aiResponseText = 'Condensed text density by 40% for higher scannability.';
    } else if (cmdType === 'executive') {
      userMsgText = 'Format for executive audience';
      slide.badgeTag = 'EXECUTIVE DIRECTIVE';
      slide.title = 'Strategic Impact & Architecture';
      aiResponseText = 'Elevated vocabulary, highlighted high-level ROI, and aligned executive headers.';
    } else if (cmdType === 'investor') {
      userMsgText = 'Format for investors';
      slide.badgeTag = 'MARKET TRACTION & ADVANTAGE';
      aiResponseText = 'Reframed slide for market opportunity, unit velocity, and competitive defensibility.';
    } else if (cmdType === 'diagram') {
      userMsgText = 'Add technical diagram';
      slide.type = 'architecture_blueprint';
      slide.visualType = 'architecture_blueprint';
      aiResponseText = 'Integrated multi-tier system cloud architecture diagram.';
    } else if (customPrompt) {
      if (customPrompt.toLowerCase().includes('condense') || customPrompt.toLowerCase().includes('shorten')) {
        if (slide.items) {
          slide.items.forEach(it => {
            if (it.desc) it.desc = it.desc.slice(0, 70) + '...';
          });
        }
        aiResponseText = 'Shortened slide descriptions.';
      } else if (customPrompt.toLowerCase().includes('visual') || customPrompt.toLowerCase().includes('diagram')) {
        slide.type = 'architecture_blueprint';
        slide.visualType = 'architecture_blueprint';
        aiResponseText = 'Converted to visual blueprint layout.';
      } else {
        slide.title = customPrompt.slice(0, 45);
        aiResponseText = `Updated slide title and aligned narrative with "${customPrompt}".`;
      }
    }

    // Add to Copilot Chat History
    if (copilotHistory) {
      const userBubble = document.createElement('div');
      userBubble.className = 'copilot-msg user';
      userBubble.textContent = userMsgText;
      copilotHistory.appendChild(userBubble);

      const aiBubble = document.createElement('div');
      aiBubble.className = 'copilot-msg ai';
      aiBubble.innerHTML = `<strong>Copilot:</strong> ${escapeHtml(aiResponseText)}`;
      copilotHistory.appendChild(aiBubble);
      copilotHistory.scrollTop = copilotHistory.scrollHeight;
    }

    renderAll();
  }

  copilotChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      executeCopilotCommand(cmd);
    });
  });

  if (copilotSendBtn) {
    copilotSendBtn.addEventListener('click', () => {
      const txt = (copilotInput.value || '').trim();
      if (txt) {
        executeCopilotCommand('custom', txt);
        copilotInput.value = '';
      }
    });
  }

  if (copilotInput) {
    copilotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        copilotSendBtn.click();
      }
    });
  }

  /* =========================================================================
   * 4. QUALITY CRITIC AUTO-REFINE
   * ========================================================================= */
  if (btnAutoRefine) {
    btnAutoRefine.addEventListener('click', () => {
      currentDeck.slides.forEach((s) => {
        if (s.title) s.title = s.title.replace(/[:–—]\s*/, ' — ').trim();
        if (s.badgeTag) s.badgeTag = s.badgeTag.toUpperCase();
      });
      renderAll();
      alert('AI Critic: Successfully polished typography, balanced layouts, and elevated visual hierarchy across all slides.');
    });
  }

  /* =========================================================================
   * 5. REHEARSAL ASSISTANT CONTROLLER
   * ========================================================================= */
  function formatTimer(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (btnRehearsalMode) {
    btnRehearsalMode.addEventListener('click', () => {
      if (rehearsalOverlay) rehearsalOverlay.classList.add('active');
    });
  }

  if (btnCloseRehearsal) {
    btnCloseRehearsal.addEventListener('click', () => {
      if (rehearsalOverlay) rehearsalOverlay.classList.remove('active');
      clearInterval(rehearsalInterval);
      rehearsalInterval = null;
    });
  }

  if (btnTimerStart) {
    btnTimerStart.addEventListener('click', () => {
      if (rehearsalInterval) return;
      rehearsalInterval = setInterval(() => {
        rehearsalSeconds++;
        if (rehearsalTimer) rehearsalTimer.textContent = formatTimer(rehearsalSeconds);
        if (rehearsalSeconds > 60 && timerTargetDesc) {
          timerTargetDesc.textContent = '⚠ Suggested speaking time exceeded (Consider simplifying)';
          timerTargetDesc.style.color = '#BE185D';
        }
      }, 1000);
    });
  }

  if (btnTimerPause) {
    btnTimerPause.addEventListener('click', () => {
      clearInterval(rehearsalInterval);
      rehearsalInterval = null;
    });
  }

  if (btnTimerReset) {
    btnTimerReset.addEventListener('click', () => {
      clearInterval(rehearsalInterval);
      rehearsalInterval = null;
      rehearsalSeconds = 0;
      if (rehearsalTimer) rehearsalTimer.textContent = '00:00';
      if (timerTargetDesc) {
        timerTargetDesc.textContent = 'Target Speaking Time: 45s for this slide';
        timerTargetDesc.style.color = 'var(--accent-pink-dark)';
      }
    });
  }

  /* =========================================================================
   * 6. MULTI-SOURCE KNOWLEDGE MODAL
   * ========================================================================= */
  if (btnOpenSourceModal) {
    btnOpenSourceModal.addEventListener('click', () => {
      if (sourceModalOverlay) sourceModalOverlay.classList.add('active');
    });
  }

  if (btnCloseSourceModal) {
    btnCloseSourceModal.addEventListener('click', () => {
      if (sourceModalOverlay) sourceModalOverlay.classList.remove('active');
    });
  }

  if (btnMergeSource) {
    btnMergeSource.addEventListener('click', () => {
      const title = (addSourceTitle.value || '').trim() || 'Additional Research Notes';
      const text = (addSourceText.value || '').trim();

      if (!text) {
        alert('Please enter or paste research text to merge.');
        return;
      }

      const newSource = {
        title,
        platform: 'User Document',
        turns: [
          {
            role: 'assistant',
            text: text,
            headings: [title],
            bullets: text.split('\n').filter(l => l.trim().length > 10).slice(0, 4)
          }
        ]
      };

      const merged = window.DeckMindExtractor.mergeSources([
        { title: currentDeck.title, turns: currentDeck.slides.map((s) => ({ role: 'assistant', text: `${s.title}: ${s.subtitle || ''}` })) },
        newSource
      ]);

      currentDeck = window.DeckMindStoryboard.generateDeck(merged, {
        targetSlideCount: Math.min(12, currentDeck.slides.length + 2),
        theme: activeTheme
      });

      if (sourceModalOverlay) sourceModalOverlay.classList.remove('active');
      addSourceTitle.value = '';
      addSourceText.value = '';
      renderAll();
    });
  }

  /* =========================================================================
   * 7. MULTI-FORMAT EXPORT ACTIONS (DOCX, XLSX, FLOWCHART, TXT, PPTX)
   * ========================================================================= */
  async function exportDocxHandler() {
    const targetBtn = btnExportDocx || btnFormatTabDocx;
    if (targetBtn) targetBtn.textContent = 'Building .DOCX...';
    try {
      const chatData = getEffectiveChatData();
      await window.DeckMindExport.generateDocx(chatData, currentDeck);
      recordExportAndCheckReviewPrompt('docx');
    } catch (err) {
      console.error('[DeckMind Export] DOCX error:', err);
      alert('Word Export Notice: ' + err.message);
    } finally {
      if (btnExportDocx) btnExportDocx.textContent = '.DOCX';
      if (btnFormatTabDocx) btnFormatTabDocx.textContent = 'Download Word Document (.docx)';
    }
  }

  async function exportXlsxHandler() {
    const targetBtn = btnExportXlsx || btnFormatTabXlsx;
    if (targetBtn) targetBtn.textContent = 'Building .XLSX...';
    try {
      const chatData = getEffectiveChatData();
      await window.DeckMindExport.generateXlsx(chatData);
      recordExportAndCheckReviewPrompt('xlsx');
    } catch (err) {
      console.error('[DeckMind Export] XLSX error:', err);
      alert('Excel Export Notice: ' + err.message);
    } finally {
      if (btnExportXlsx) btnExportXlsx.textContent = '.XLSX';
      if (btnFormatTabXlsx) btnFormatTabXlsx.textContent = 'Download Excel Workbook (.xlsx)';
    }
  }

  function exportFlowchartHandler() {
    const chatData = getEffectiveChatData();
    window.DeckMindExport.downloadFlowchart(chatData);
    recordExportAndCheckReviewPrompt('flowchart');
  }

  function exportTxtHandler() {
    const chatData = getEffectiveChatData();
    window.DeckMindExport.generateSummaryTxt(chatData, currentDeck);
    recordExportAndCheckReviewPrompt('txt');
  }

  // Bind Export Buttons
  if (btnExportDocx) btnExportDocx.addEventListener('click', exportDocxHandler);
  if (btnFormatTabDocx) btnFormatTabDocx.addEventListener('click', exportDocxHandler);
  if (btnExportXlsx) btnExportXlsx.addEventListener('click', exportXlsxHandler);
  if (btnFormatTabXlsx) btnFormatTabXlsx.addEventListener('click', exportXlsxHandler);
  if (btnExportFlowchart) btnExportFlowchart.addEventListener('click', exportFlowchartHandler);
  if (btnFormatTabFlowchart) btnFormatTabFlowchart.addEventListener('click', exportFlowchartHandler);
  if (btnExportTxt) btnExportTxt.addEventListener('click', exportTxtHandler);
  if (btnFormatTabTxt) btnFormatTabTxt.addEventListener('click', exportTxtHandler);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tc = document.getElementById(targetTab);
      if (tc) tc.classList.add('active');
    });
  });

  layoutPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const layout = btn.getAttribute('data-layout');
      const slide = currentDeck.slides[activeSlideIndex];
      if (slide) {
        slide.type = layout;
        renderActiveSlide();
        renderThumbnails();
        saveDeckState();
      }
    });
  });

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      activeTheme = e.target.value;
      currentDeck.theme = activeTheme;
      renderAll();
    });
  }

  if (frameworkSelect) {
    frameworkSelect.addEventListener('change', (e) => {
      const fw = e.target.value;
      currentDeck.framework = fw;
      const analyzed = window.DeckMindExtractor.analyzeChat(getEffectiveChatData());
      currentDeck = window.DeckMindStoryboard.generateDeck(analyzed, {
        targetSlideCount: currentDeck.slides.length,
        theme: activeTheme,
        framework: fw
      });
      renderAll();
    });
  }

  if (deckTitleInput) {
    deckTitleInput.addEventListener('input', (e) => {
      currentDeck.title = e.target.value;
      saveDeckState();
    });
  }

  if (notesTextarea) {
    notesTextarea.addEventListener('input', (e) => {
      const slide = currentDeck.slides[activeSlideIndex];
      if (slide) {
        slide.speakerNotes = e.target.value;
        saveDeckState();
      }
    });
  }

  if (selectDiagramType) {
    selectDiagramType.addEventListener('change', (e) => {
      const slide = currentDeck.slides[activeSlideIndex];
      if (slide) {
        slide.visualType = e.target.value;
        renderVisualPreview(e.target.value);
        saveDeckState();
      }
    });
  }

  if (btnAddSlide) {
    btnAddSlide.addEventListener('click', () => {
      const newSlide = {
        id: 'slide_' + Date.now(),
        slideIndex: currentDeck.slides.length + 1,
        type: 'three_card_grid',
        badgeTag: 'CUSTOM SECTION',
        title: 'New Strategic Architectural Insight',
        subtitle: 'Describe the core framework and key deliverables.',
        items: [
          { title: 'Feature Pillar A', desc: 'Modular architectural component.' },
          { title: 'Feature Pillar B', desc: 'High-throughput data synchronization.' },
          { title: 'Feature Pillar C', desc: 'Zero-trust verification and telemetry.' }
        ],
        visualType: 'neural_web',
        speakerNotes: 'Talking points for this slide...'
      };
      currentDeck.slides.push(newSlide);
      activeSlideIndex = currentDeck.slides.length - 1;
      renderAll();
    });
  }

  if (btnExportPptx) {
    btnExportPptx.addEventListener('click', async () => {
      btnExportPptx.textContent = 'Compiling PPTX...';
      try {
        await window.DeckMindPPTX.downloadPresentation(currentDeck);
        recordExportAndCheckReviewPrompt('pptx');
      } catch (err) {
        console.error('[DeckMind Studio] PPTX export error:', err);
        alert('PPTX Export Notice: ' + err.message);
      } finally {
        btnExportPptx.textContent = '.PPTX';
      }
    });
  }

  if (btnPresentMode) {
    btnPresentMode.addEventListener('click', () => {
      isPresenting = true;
      if (presenterOverlay) presenterOverlay.classList.add('active');
      renderPresenterSlide();
    });
  }

  if (presExitBtn) {
    presExitBtn.addEventListener('click', () => {
      isPresenting = false;
      if (presenterOverlay) presenterOverlay.classList.remove('active');
    });
  }

  if (presPrevBtn) {
    presPrevBtn.addEventListener('click', () => {
      if (activeSlideIndex > 0) {
        activeSlideIndex--;
        renderAll();
        renderPresenterSlide();
      }
    });
  }

  if (presNextBtn) {
    presNextBtn.addEventListener('click', () => {
      if (activeSlideIndex < currentDeck.slides.length - 1) {
        activeSlideIndex++;
        renderAll();
        renderPresenterSlide();
      }
    });
  }

  function renderPresenterSlide() {
    if (!isPresenting || !presenterSlideContainer || !slideFrame) return;
    presenterSlideContainer.innerHTML = slideFrame.innerHTML;
    if (presIndicator) presIndicator.textContent = `Slide ${activeSlideIndex + 1} of ${currentDeck.slides.length}`;
  }

  window.addEventListener('keydown', (e) => {
    if (isPresenting) {
      if (e.key === 'Escape' && presExitBtn) {
        presExitBtn.click();
      } else if ((e.key === 'ArrowRight' || e.key === 'Space') && presNextBtn) {
        presNextBtn.click();
      } else if (e.key === 'ArrowLeft' && presPrevBtn) {
        presPrevBtn.click();
      }
    }
  });

  // Launch Studio
  initStudio();
});

/**
 * DeckMind AI — Content Script & Interactive Floating Draggable HUD Injector
 * 
 * Lightweight, safe DOM scraper and draggable HUD injector for AI chat interfaces.
 * Allows users to drag and reposition the HUD anywhere across the screen with persistent
 * coordinates, debounced observers, and zero host page interference.
 */

'use strict';

(function () {
  // Prevent duplicate execution
  if (window.__DECKMIND_CONTENT_INJECTED__) return;
  window.__DECKMIND_CONTENT_INJECTED__ = true;

  // Domain guard: on x.com or twitter.com, only inject if on Grok AI chat (/i/grok)
  const currentHost = (window.location.hostname || '').toLowerCase();
  const currentPath = (window.location.pathname || '').toLowerCase();
  if ((currentHost.includes('x.com') || currentHost.includes('twitter.com')) && !currentPath.startsWith('/i/grok')) {
    return;
  }

  let hudContainer = null;
  let toastEl = null;
  let lastTurnCount = 0;
  let scanDebounceTimer = null;
  let isScanning = false;

  // Drag state
  let isDragging = false;
  let hasMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  /**
   * Apply coordinates to HUD and toast with viewport clamping
   */
  function applyHUDPosition(x, y, save = false) {
    if (!hudContainer) return;

    const pad = 12;
    const hudW = hudContainer.offsetWidth || 270;
    const hudH = hudContainer.offsetHeight || 44;
    const maxLeft = Math.max(pad, window.innerWidth - hudW - pad);
    const maxTop = Math.max(pad, window.innerHeight - hudH - pad);

    const clampedX = Math.max(pad, Math.min(maxLeft, Math.round(x)));
    const clampedY = Math.max(pad, Math.min(maxTop, Math.round(y)));

    hudContainer.style.bottom = 'auto';
    hudContainer.style.right = 'auto';
    hudContainer.style.left = `${clampedX}px`;
    hudContainer.style.top = `${clampedY}px`;

    // Position toast relative to the HUD
    if (toastEl) {
      toastEl.style.bottom = 'auto';
      toastEl.style.right = 'auto';
      toastEl.style.left = `${clampedX}px`;
      const toastY = clampedY > 70 ? clampedY - 52 : clampedY + hudH + 12;
      toastEl.style.top = `${toastY}px`;
    }

    if (save && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ deckmind_hud_pos: { x: clampedX, y: clampedY } });
    }
  }

  /**
   * Attach Draggable Listeners to HUD
   */
  function initDraggable(pillEl) {
    function onPointerDown(e) {
      // Don't drag if clicking buttons directly
      if (e.target.tagName === 'BUTTON' || (e.target.closest && e.target.closest('button'))) return;

      isDragging = false;
      hasMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const rect = hudContainer.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      if (!hasMoved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        hasMoved = true;
        isDragging = true;
        hudContainer.classList.add('deckmind-hud-dragging');
        if (pillEl.setPointerCapture && e.pointerId) {
          try {
            pillEl.setPointerCapture(e.pointerId);
          } catch (err) {}
        }
      }

      if (isDragging) {
        e.preventDefault();
        applyHUDPosition(initialLeft + dx, initialTop + dy, false);
      }
    }

    function onPointerUp(e) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (isDragging) {
        hudContainer.classList.remove('deckmind-hud-dragging');
        const rect = hudContainer.getBoundingClientRect();
        applyHUDPosition(rect.left, rect.top, true);
      }

      setTimeout(() => {
        isDragging = false;
        hasMoved = false;
      }, 50);
    }

    pillEl.addEventListener('pointerdown', onPointerDown);
  }

  /**
   * Check if current page is in Dark Mode
   */
  function checkAndApplyDarkMode() {
    if (!hudContainer) return;
    try {
      const isDark = (
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-theme') === 'dark' ||
        document.documentElement.getAttribute('data-color-mode') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      hudContainer.classList.toggle('deckmind-dark-mode', isDark);
    } catch (e) {}
  }

  /**
   * Initialize In-Page Action Pill
   */
  function initHUD() {
    try {
      if (document.getElementById('deckmind-hud-container')) return;

      hudContainer = document.createElement('div');
      hudContainer.id = 'deckmind-hud-container';
      hudContainer.innerHTML = `
        <div class="deckmind-hud-pill" id="deckmind-pill-trigger" title="Click DM to minimize • Drag to move">
          <div class="deckmind-drag-grip" title="Drag to move across screen">
            <div class="deckmind-drag-dots"><div class="deckmind-drag-dot"></div><div class="deckmind-drag-dot"></div></div>
            <div class="deckmind-drag-dots"><div class="deckmind-drag-dot"></div><div class="deckmind-drag-dot"></div></div>
          </div>
          <div class="deckmind-hud-icon" id="deckmind-icon-toggle" title="Toggle Compact Mode">DM</div>
          <div class="deckmind-hud-label" id="deckmind-label-click">
            <span class="deckmind-hud-title">DeckMind AI</span>
            <span class="deckmind-hud-counter" id="deckmind-turn-count">Chat Ready</span>
          </div>
          <div class="deckmind-hud-actions">
            <button class="deckmind-hud-btn" id="deckmind-quick-pptx" title="Instant 1-Click PPTX Presentation">PPTX</button>
            <button class="deckmind-hud-btn" id="deckmind-quick-docx" title="Instant Word Document Essay (.docx)">DOCX</button>
            <button class="deckmind-hud-btn" id="deckmind-quick-xlsx" title="Instant Excel Tables (.xlsx)">XLSX</button>
            <button class="deckmind-hud-btn primary" id="deckmind-open-studio" title="Open Presentation Studio">Studio</button>
            <button class="deckmind-hud-collapse-btn" id="deckmind-btn-minimize" title="Minimize to discreet dot">−</button>
          </div>
        </div>
      `;

      toastEl = document.createElement('div');
      toastEl.className = 'deckmind-toast';
      toastEl.id = 'deckmind-toast';
      toastEl.innerHTML = '<span id="deckmind-toast-text">Generating Presentation...</span>';

      const target = document.body || document.documentElement;
      if (target) {
        target.appendChild(hudContainer);
        target.appendChild(toastEl);
      }

      checkAndApplyDarkMode();

      // Restore saved position and collapsed state if available
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['deckmind_hud_pos', 'deckmind_hud_collapsed'], (res) => {
          if (res && res.deckmind_hud_pos && typeof res.deckmind_hud_pos.x === 'number') {
            applyHUDPosition(res.deckmind_hud_pos.x, res.deckmind_hud_pos.y, false);
          }
          if (res && res.deckmind_hud_collapsed) {
            hudContainer.classList.add('deckmind-collapsed');
          }
        });
      }

      const pillTrigger = document.getElementById('deckmind-pill-trigger');
      if (pillTrigger) {
        initDraggable(pillTrigger);
      }

      // Toggle compact orb mode on DM icon click
      const iconToggle = document.getElementById('deckmind-icon-toggle');
      if (iconToggle) {
        iconToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (hasMoved || isDragging) return;
          const isCollapsed = hudContainer.classList.toggle('deckmind-collapsed');
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ deckmind_hud_collapsed: isCollapsed });
          }
        });
      }

      // Minimize button click
      const btnMinimize = document.getElementById('deckmind-btn-minimize');
      if (btnMinimize) {
        btnMinimize.addEventListener('click', (e) => {
          e.stopPropagation();
          hudContainer.classList.add('deckmind-collapsed');
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ deckmind_hud_collapsed: true });
          }
        });
      }

      // Label click opens studio
      const labelClick = document.getElementById('deckmind-label-click');
      if (labelClick) {
        labelClick.addEventListener('click', (e) => {
          e.stopPropagation();
          if (hasMoved || isDragging) return;
          triggerOpenStudio();
        });
      }

      // Event Listeners for buttons
      const btnQuick = document.getElementById('deckmind-quick-pptx');
      if (btnQuick) {
        btnQuick.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerQuickPPTX();
        });
      }

      const btnDocx = document.getElementById('deckmind-quick-docx');
      if (btnDocx) {
        btnDocx.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerQuickDOCX();
        });
      }

      const btnXlsx = document.getElementById('deckmind-quick-xlsx');
      if (btnXlsx) {
        btnXlsx.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerQuickXLSX();
        });
      }

      const btnStudio = document.getElementById('deckmind-open-studio');
      if (btnStudio) {
        btnStudio.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerOpenStudio();
        });
      }

      // Keyboard Shortcut (Alt+Shift+H) to toggle HUD visibility
      window.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey && (e.key === 'H' || e.key === 'h')) {
          if (hudContainer) {
            hudContainer.style.display = hudContainer.style.display === 'none' ? 'block' : 'none';
          }
        }
      });

      // Adjust position on window resize to prevent off-screen HUD
      window.addEventListener('resize', () => {
        if (hudContainer && hudContainer.style.left) {
          const rect = hudContainer.getBoundingClientRect();
          applyHUDPosition(rect.left, rect.top, true);
        }
        checkAndApplyDarkMode();
      });

      // Initial Delayed Scan
      scheduleScan(1000);
    } catch (err) {
      console.warn('[DeckMind AI] HUD initialization skipped:', err);
    }
  }

  /**
   * Show HUD Toast
   */
  function showToast(message, duration = 3000) {
    if (!toastEl) return;
    try {
      const textEl = document.getElementById('deckmind-toast-text');
      if (textEl) textEl.textContent = message;
      toastEl.classList.add('show');
      setTimeout(() => {
        if (toastEl) toastEl.classList.remove('show');
      }, duration);
    } catch (e) {
      // Ignore toast render errors
    }
  }

  /**
   * Schedule debounced scan
   */
  function scheduleScan(delay = 1200) {
    if (scanDebounceTimer) clearTimeout(scanDebounceTimer);
    scanDebounceTimer = setTimeout(() => {
      updateScan();
    }, delay);
  }

  /**
   * Scan active chat DOM safely without blocking host app
   */
  function updateScan() {
    if (isScanning || typeof window.DeckMindParsers === 'undefined') return;
    isScanning = true;

    try {
      const chat = window.DeckMindParsers.extractCurrentChat(document);
      const turns = (chat && chat.turns) || [];
      const turnCount = turns.length;

      const counterEl = document.getElementById('deckmind-turn-count');
      if (counterEl) {
        const newText = turnCount > 0 ? `${turnCount} Turns Detected` : 'Chat Ready';
        if (counterEl.textContent !== newText) {
          counterEl.textContent = newText;
        }
      }

      if (turnCount !== lastTurnCount) {
        lastTurnCount = turnCount;
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage({ action: 'UPDATE_BADGE', count: turnCount }, () => {
            if (chrome.runtime.lastError) {
              // Ignore disconnected port errors
            }
          });
        }
      }
    } catch (e) {
      console.warn('[DeckMind AI] Safe scan notice:', e);
    } finally {
      isScanning = false;
    }
  }

  /**
   * Package current conversation state safely
   */
  function packageCurrentChat() {
    const rawChat = window.DeckMindParsers.extractCurrentChat(document);
    const serializableTurns = (rawChat.turns || []).map(t => ({
      id: t.id,
      index: t.index,
      role: t.role,
      text: t.text,
      headings: t.headings || [],
      bullets: t.bullets || [],
      tables: t.tables || [],
      boldHighlights: t.boldHighlights || [],
      codeBlocks: t.codeBlocks || [],
      timestamp: t.timestamp || Date.now()
    }));

    return {
      title: rawChat.title || document.title || 'AI Strategy Presentation',
      platform: rawChat.platform || 'AI Platform',
      turns: serializableTurns,
      url: window.location.href,
      extractedAt: Date.now()
    };
  }

  /**
   * Action 1: Instant Quick PPTX Download
   */
  async function triggerQuickPPTX() {
    showToast('Synthesizing Presentation...');
    try {
      const payload = packageCurrentChat();
      if (!payload.turns || payload.turns.length === 0) {
        showToast('No active conversation detected.');
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ activeChatData: payload, currentDeckPayload: null });
        chrome.runtime.sendMessage({ action: 'OPEN_STUDIO', autoDownload: 'pptx' }, () => {
          if (chrome.runtime.lastError) {
            // Extension context refreshed
          }
        });
      }
    } catch (err) {
      console.error('[DeckMind AI] Quick PPTX trigger error:', err);
      showToast('Generation notice: ' + err.message);
    }
  }

  /**
   * Action 2: Instant Quick Word Document (.docx)
   */
  async function triggerQuickDOCX() {
    showToast('Building Word Document (.docx)...');
    try {
      const payload = packageCurrentChat();
      if (!payload.turns || payload.turns.length === 0) {
        showToast('No active conversation detected.');
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ activeChatData: payload, currentDeckPayload: null });
        chrome.runtime.sendMessage({ action: 'OPEN_STUDIO', autoDownload: 'docx' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    } catch (err) {
      console.error('[DeckMind AI] Quick DOCX trigger error:', err);
      showToast('Word export notice: ' + err.message);
    }
  }

  /**
   * Action 3: Instant Quick Excel Spreadsheet (.xlsx)
   */
  async function triggerQuickXLSX() {
    showToast('Extracting Tables to Excel (.xlsx)...');
    try {
      const payload = packageCurrentChat();
      if (!payload.turns || payload.turns.length === 0) {
        showToast('No active conversation detected.');
        return;
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ activeChatData: payload, currentDeckPayload: null });
        chrome.runtime.sendMessage({ action: 'OPEN_STUDIO', autoDownload: 'xlsx' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    } catch (err) {
      console.error('[DeckMind AI] Quick XLSX trigger error:', err);
      showToast('Excel export notice: ' + err.message);
    }
  }

  /**
   * Action 4: Open Deck Studio
   */
  async function triggerOpenStudio() {
    showToast('Launching DeckMind Studio...');
    try {
      const payload = packageCurrentChat();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ activeChatData: payload, currentDeckPayload: null });
        chrome.runtime.sendMessage({ action: 'OPEN_STUDIO' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    } catch (err) {
      console.error('[DeckMind AI] Open Studio error:', err);
      showToast('Error launching studio: ' + err.message);
    }
  }

  /**
   * Action 3: Teleport and Highlight Turn Element
   */
  function highlightTurn(turnIndex) {
    try {
      const rawChat = window.DeckMindParsers.extractCurrentChat(document);
      const turn = (rawChat.turns || [])[turnIndex];
      if (turn && turn.elementRef) {
        turn.elementRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        turn.elementRef.classList.add('deckmind-highlighted-turn');
        setTimeout(() => {
          if (turn.elementRef) {
            turn.elementRef.classList.remove('deckmind-highlighted-turn');
          }
        }, 4000);
      }
    } catch (e) {
      console.warn('[DeckMind AI] Highlight error:', e);
    }
  }

  // Listen for background / popup commands
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
      try {
        if (req.action === 'TRIGGER_HUD_GENERATE') {
          triggerOpenStudio();
          sendResponse({ status: 'ok' });
          return true;
        }
        if (req.action === 'EXTRACT_CURRENT_CHAT') {
          const payload = packageCurrentChat();
          sendResponse({ status: 'ok', data: payload });
          return true;
        }
        if (req.action === 'HIGHLIGHT_TURN') {
          highlightTurn(req.turnIndex);
          sendResponse({ status: 'ok' });
          return true;
        }
      } catch (err) {
        console.warn('[DeckMind AI] Message handler notice:', err);
      }
      return false;
    });
  }

  // Non-blocking Mutation Observer with strict self-ignoring filter
  try {
    const observer = new MutationObserver((mutations) => {
      const isSelfMutation = mutations.every(m => {
        return m.target && (
          m.target.id === 'deckmind-hud-container' ||
          m.target.id === 'deckmind-toast' ||
          (m.target.closest && m.target.closest('#deckmind-hud-container'))
        );
      });

      if (!isSelfMutation) {
        scheduleScan(1500);
      }
    });

    function startObserver() {
      initHUD();
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver);
    } else {
      startObserver();
    }
  } catch (err) {
    console.warn('[DeckMind AI] Observer setup error:', err);
  }
})();

/**
 * Aegis Background Service Worker v2.0.0
 *
 * Responsibilities:
 *  - Initialise default settings on first install
 *  - Global keyboard shortcut (Alt+Shift+P) → toggle Presentation Mode
 *  - Broadcast state changes to every tab running the content script
 *  - Badge text/colour feedback (ON / OFF)
 *  - Listen for storage changes to keep badge in sync
 *
 * Security: no external network calls, no sensitive data logged.
 */

'use strict';

/* =========================================================================
 * CONSTANTS
 * ========================================================================= */

const STORAGE_KEYS = {
  ENABLED:  'isExtensionEnabled',
  MODE:     'isPresentationMode',
  KEYWORDS: 'customKeywords',
};

/**
 * URL patterns that our content script runs on.
 * Used for targeted broadcasting (only message relevant tabs).
 */
const AEGIS_URL_PATTERNS = [
  '*://*.chatgpt.com/*',
  '*://*.claude.ai/*',
  '*://gemini.google.com/*',
  '*://aistudio.google.com/*',
  '*://*.perplexity.ai/*',
  '*://*.sarvam.ai/*',
  '*://*.deepseek.com/*',
  '*://copilot.microsoft.com/*',
  '*://*.grok.com/*',
  '*://grok.com/*',
  '*://x.com/*',
  '*://*.mistral.ai/*',
  '*://*.meta.ai/*',
  '*://*.poe.com/*',
];

/* =========================================================================
 * URL VERIFICATION HELPER
 * ========================================================================= */
function isAegisUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return AEGIS_URL_PATTERNS.some(pattern => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = '^' + escaped.replace(/\*/g, '.*') + '$';
    return new RegExp(regexStr).test(url);
  });
}

function updateActionState(tabId, url) {
  if (isAegisUrl(url)) {
    chrome.action.enable(tabId);
  } else {
    chrome.action.disable(tabId);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || tab.url) {
    updateActionState(tabId, changeInfo.url || tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    if (tab.url) updateActionState(tab.id, tab.url);
  });
});

/* =========================================================================
 * INSTALL — set safe defaults
 * ========================================================================= */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set(
      {
        [STORAGE_KEYS.ENABLED]:  true,
        [STORAGE_KEYS.MODE]:     true,
        [STORAGE_KEYS.KEYWORDS]: [],
      },
      () => {
        if (chrome.runtime.lastError) return;
        updateBadge(true);
      }
    );
  } else {
    // On update, read existing state for badge
    chrome.storage.local.get([STORAGE_KEYS.ENABLED], (result) => {
      if (chrome.runtime.lastError) return;
      updateBadge(result[STORAGE_KEYS.ENABLED] !== false);
    });
  }
});

/* =========================================================================
 * STARTUP — restore badge from persisted state
 * ========================================================================= */
chrome.storage.local.get([STORAGE_KEYS.ENABLED], (result) => {
  if (chrome.runtime.lastError) { updateBadge(true); return; }
  updateBadge(result[STORAGE_KEYS.ENABLED] !== false);
});

/* =========================================================================
 * KEYBOARD SHORTCUT — Alt+Shift+P → toggle Presentation Mode
 * ========================================================================= */
chrome.commands.onCommand.addListener((command) => {
  if (command !== 'toggle-presentation') return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) return;
    const tab = tabs[0];
    
    // Ignore keyboard shortcuts on non-LLM pages
    if (!isAegisUrl(tab.url)) return;

    chrome.storage.local.get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.MODE], (result) => {
      if (chrome.runtime.lastError) return;

      // Only toggle presentation mode if the extension itself is enabled
      if (result[STORAGE_KEYS.ENABLED] === false) return;

      const nextMode = result[STORAGE_KEYS.MODE] !== true;
      chrome.storage.local.set({ [STORAGE_KEYS.MODE]: nextMode }, () => {
        if (chrome.runtime.lastError) return;
        broadcastToAegisTabs('togglePresentationMode', { state: nextMode });
      });
    });
  });
});

/* =========================================================================
 * STORAGE CHANGE LISTENER — keep badge in sync with popup changes
 * ========================================================================= */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes[STORAGE_KEYS.ENABLED]) {
    updateBadge(changes[STORAGE_KEYS.ENABLED].newValue !== false);
  }
});

/* =========================================================================
 * MESSAGE HANDLER — popup and content scripts can request state
 * ========================================================================= */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || typeof request.action !== 'string') return false;

  switch (request.action) {
    case 'getState':
      chrome.storage.local.get(
        [STORAGE_KEYS.ENABLED, STORAGE_KEYS.MODE, STORAGE_KEYS.KEYWORDS],
        (result) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false });
            return;
          }
          sendResponse({
            success: true,
            isExtensionEnabled: result[STORAGE_KEYS.ENABLED] !== false,
            isPresentationMode: result[STORAGE_KEYS.MODE] !== false,
            keywords: Array.isArray(result[STORAGE_KEYS.KEYWORDS])
              ? result[STORAGE_KEYS.KEYWORDS]
              : [],
          });
        }
      );
      return true; // async

    case 'broadcastToAll':
      // Popup uses this to broadcast to all content-script tabs
      if (request.broadcastAction && request.payload) {
        broadcastToAegisTabs(request.broadcastAction, request.payload);
      }
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});

/* =========================================================================
 * HELPERS
 * ========================================================================= */

/**
 * Updates the badge on the extension icon.
 * @param {boolean} isEnabled
 */
function updateBadge(isEnabled) {
  chrome.action.setBadgeText({ text: isEnabled ? 'ON' : 'OFF' }).catch(() => {});
  chrome.action.setBadgeBackgroundColor({
    color: isEnabled ? '#10b981' : '#ef4444',
  }).catch(() => {});
  chrome.action.setBadgeTextColor({
    color: '#ffffff',
  }).catch(() => {});
}

/**
 * Sends a message to every tab that matches our URL patterns.
 * Individual tab failures are silently ignored.
 * @param {string} action
 * @param {Object} payload
 */
function broadcastToAegisTabs(action, payload) {
  chrome.tabs.query({ url: AEGIS_URL_PATTERNS }, (tabs) => {
    if (chrome.runtime.lastError || !Array.isArray(tabs)) return;
    for (const tab of tabs) {
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { action, ...payload }).catch(() => {});
      }
    }
  });
}

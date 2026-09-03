/**
 * DeckMind AI — Manifest V3 Background Service Worker
 * 
 * Orchestrates message routing, open-source model proxying (Ollama, SD WebUI, Python backend),
 * context menus, keyboard shortcuts, and presentation state synchronization.
 */

'use strict';

// 1. Extension Lifecycle & Context Menus
chrome.runtime.onInstalled.addListener(() => {
  console.log('[DeckMind AI] Service worker initialized.');

  // Create Context Menus
  chrome.contextMenus.create({
    id: 'deckmind_generate_chat',
    title: '⚡ Generate PPT Presentation from this AI Chat',
    contexts: ['page', 'selection']
  });

  chrome.contextMenus.create({
    id: 'deckmind_open_studio',
    title: '✨ Open DeckMind Presentation Studio',
    contexts: ['action']
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'deckmind_generate_chat' && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_HUD_GENERATE' }, (response) => {
      if (chrome.runtime.lastError) {
        // Tab might need page refresh or studio direct launch
        openDeckStudio(tab.id);
      }
    });
  } else if (info.menuItemId === 'deckmind_open_studio') {
    openDeckStudio();
  }
});

// Handle Keyboard Commands (Alt+Shift+P / Alt+Shift+D)
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (command === 'generate-deck' && tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_HUD_GENERATE' }, () => {
      if (chrome.runtime.lastError) {
        openDeckStudio(tab.id);
      }
    });
  } else if (command === 'open-deck-studio') {
    openDeckStudio();
  }
});

// Helper to Open Deck Studio
function openDeckStudio(sourceTabId = null, autoDownload = null) {
  const params = [];
  if (sourceTabId) params.push(`sourceTab=${sourceTabId}`);
  if (autoDownload) {
    if (typeof autoDownload === 'string') {
      params.push(`autoDownload=${autoDownload}`);
    } else {
      params.push('autoDownload=pptx');
    }
  }
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  const studioUrl = chrome.runtime.getURL('deck_studio.html') + query;
  chrome.tabs.create({ url: studioUrl });
}

// 2. Message Bus & Orchestration
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const action = message.action;

  if (action === 'OPEN_STUDIO') {
    openDeckStudio(sender.tab ? sender.tab.id : null, message.autoDownload || false);
    sendResponse({ status: 'ok' });
    return true;
  }

  if (action === 'UPDATE_BADGE') {
    const count = message.count || 0;
    if (sender.tab && sender.tab.id) {
      chrome.action.setBadgeText({
        tabId: sender.tab.id,
        text: count > 0 ? String(count) : ''
      });
      chrome.action.setBadgeBackgroundColor({
        tabId: sender.tab.id,
        color: '#38BDF8'
      });
    }
    sendResponse({ status: 'ok' });
    return true;
  }

  if (action === 'CALL_LOCAL_OLLAMA') {
    handleOllamaRequest(message.prompt, message.model || 'llama3.2')
      .then(res => sendResponse({ status: 'success', data: res }))
      .catch(err => sendResponse({ status: 'error', message: err.message }));
    return true;
  }

  if (action === 'CALL_DIFFUSION_IMAGE') {
    handleStableDiffusionRequest(message.prompt)
      .then(res => sendResponse({ status: 'success', imageBase64: res }))
      .catch(err => sendResponse({ status: 'error', message: err.message }));
    return true;
  }

  return false;
});

// 3. Local Open-Source LLM Connector (Ollama http://localhost:11434)
async function handleOllamaRequest(prompt, model = 'llama3.2') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Ollama returned status ${response.status}`);
    const data = await response.json();
    return data.response;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DeckMind AI] Ollama endpoint notice:', err.message);
    throw err;
  }
}

// 4. Local Stable Diffusion Connector (AUTOMATIC1111 / ComfyUI http://localhost:7860)
async function handleStableDiffusionRequest(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        steps: 20,
        width: 768,
        height: 432, // 16:9 ratio
        cfg_scale: 7
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`SD WebUI returned status ${response.status}`);
    const data = await response.json();
    if (data.images && data.images.length > 0) {
      return data.images[0];
    }
    throw new Error('No image returned by SD WebUI');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DeckMind AI] SD WebUI endpoint notice:', err.message);
    throw err;
  }
}

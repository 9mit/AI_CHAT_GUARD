document.addEventListener('DOMContentLoaded', () => {
  const extensionEnabledToggle = document.getElementById('extensionEnabled');
  const presentationModeToggle = document.getElementById('presentationMode');
  const keywordInput = document.getElementById('keywordInput');
  const kwMeta = document.getElementById('kwMeta');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const platformsGrid = document.getElementById('platformsGrid');

  // Load state
  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response && response.success) {
      extensionEnabledToggle.checked = response.isExtensionEnabled;
      presentationModeToggle.checked = response.isPresentationMode;
      keywordInput.value = (response.keywords || []).join(', ');
      
      updateStatusUI(response.isExtensionEnabled);
      toggleSecondaryControls(response.isExtensionEnabled);
    }
  });

  // Highlight active platform logic
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      const url = tabs[0].url;
      let detected = null;
      if (url.includes('chatgpt.com')) detected = 'chatgpt';
      else if (url.includes('claude.ai')) detected = 'claude';
      else if (url.includes('gemini.google.com') || url.includes('aistudio.google.com')) detected = 'gemini';
      else if (url.includes('perplexity.ai')) detected = 'perplexity';
      else if (url.includes('deepseek.com')) detected = 'deepseek';
      else if (url.includes('copilot.microsoft.com')) detected = 'copilot';
      else if (url.includes('grok.com') || url.includes('x.com')) detected = 'grok';
      else if (url.includes('mistral.ai')) detected = 'mistral';
      else if (url.includes('meta.ai')) detected = 'meta';
      else if (url.includes('poe.com')) detected = 'poe';
      else if (url.includes('sarvam.ai')) detected = 'sarvam';
      
      if (detected && platformsGrid) {
        const chip = platformsGrid.querySelector(`[data-platform="${detected}"]`);
        if (chip) chip.classList.add('current');
      }
    }
  });

  // Event Listeners
  if (extensionEnabledToggle) {
    extensionEnabledToggle.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      chrome.storage.local.set({ isExtensionEnabled: isEnabled }, () => {
        updateStatusUI(isEnabled);
        toggleSecondaryControls(isEnabled);
        broadcast('toggleExtension', { state: isEnabled });
        
        // Broadcast presentation mode just in case
        if (isEnabled && presentationModeToggle) {
          broadcast('togglePresentationMode', { state: presentationModeToggle.checked });
        }
      });
    });
  }

  if (presentationModeToggle) {
    presentationModeToggle.addEventListener('change', (e) => {
      const isMode = e.target.checked;
      chrome.storage.local.set({ isPresentationMode: isMode }, () => {
        broadcast('togglePresentationMode', { state: isMode });
      });
    });
  }

  if (keywordInput) {
    let timeoutId;
    keywordInput.addEventListener('input', (e) => {
      clearTimeout(timeoutId);
      if (kwMeta) {
        kwMeta.textContent = 'Saving...';
        kwMeta.className = '';
      }
      
      timeoutId = setTimeout(() => {
        const val = e.target.value;
        const keywords = val.split(',').map(k => k.trim()).filter(k => k.length > 0);
        
        chrome.storage.local.set({ customKeywords: keywords }, () => {
          if (kwMeta) {
            kwMeta.textContent = 'Keywords saved successfully';
            kwMeta.className = 'success';
          }
          broadcast('updateKeywords', { keywords });
          
          setTimeout(() => {
            if(kwMeta && kwMeta.textContent === 'Keywords saved successfully') {
              kwMeta.textContent = '';
            }
          }, 2000);
        });
      }, 500);
    });
  }

  function updateStatusUI(isEnabled) {
    if (statusDot && statusText) {
      if (isEnabled) {
        statusDot.className = 'status-dot active';
        statusText.className = 'status-text active';
        statusText.textContent = 'Extension Active';
      } else {
        statusDot.className = 'status-dot inactive';
        statusText.className = 'status-text inactive';
        statusText.textContent = 'Extension Disabled';
      }
    }
  }

  function toggleSecondaryControls(isEnabled) {
    if (presentationModeToggle && keywordInput) {
      presentationModeToggle.disabled = !isEnabled;
      keywordInput.disabled = !isEnabled;
      if (!isEnabled) {
        presentationModeToggle.closest('.switch').style.opacity = '0.5';
        keywordInput.style.opacity = '0.5';
      } else {
        presentationModeToggle.closest('.switch').style.opacity = '1';
        keywordInput.style.opacity = '1';
      }
    }
  }

  function broadcast(action, payload) {
    chrome.runtime.sendMessage({
      action: 'broadcastToAll',
      broadcastAction: action,
      payload: payload
    });
  }
});

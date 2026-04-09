'use strict';

let currentState = {
  isExtensionEnabled: true,
  isPresentationMode: true,
  keywords: []
};

// Initial state load
chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
  if (response && response.success) {
    currentState.isExtensionEnabled = response.isExtensionEnabled;
    currentState.isPresentationMode = response.isPresentationMode;
    currentState.keywords = response.keywords || [];
    applyState();
  }
});

// Listen for updates from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request) return;
  
  if (request.action === 'togglePresentationMode') {
    currentState.isPresentationMode = request.state;
    applyState();
  } else if (request.action === 'toggleExtension') {
    currentState.isExtensionEnabled = request.state;
    applyState();
  } else if (request.action === 'updateKeywords') {
    currentState.keywords = request.keywords;
    applyState();
    triggerRedaction(); // re-evaluate redaction immediately
  }
});

function applyState() {
  if (currentState.isExtensionEnabled && currentState.isPresentationMode) {
    document.body.classList.add('guard-presentation-mode');
  } else {
    document.body.classList.remove('guard-presentation-mode');
  }
}

// Redaction of custom keywords using TreeWalker
let debounceTimer;
function triggerRedaction() {
  if (!currentState.isExtensionEnabled || currentState.keywords.length === 0) return;
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    redactKeywords();
  }, 300);
}

function redactKeywords() {
  if (!currentState.isExtensionEnabled || currentState.keywords.length === 0) return;
  
  const keywords = currentState.keywords;
  // Create an explicit regex that avoids partial word matching where possible, but is case-insensitive
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${keywords.map(k => escapeRegExp(k)).join('|')})\\b`, 'gi');
  
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      if (node.parentNode.nodeName === 'SCRIPT' || 
          node.parentNode.nodeName === 'STYLE' || 
          node.parentNode.nodeName === 'NOSCRIPT' || 
          node.parentNode.classList.contains('guard-secret-mask')) {
        return NodeFilter.FILTER_REJECT;
      }
      return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });

  const nodesToReplace = [];
  let node;
  while ((node = walker.nextNode())) {
    nodesToReplace.push(node);
  }

  nodesToReplace.forEach(textNode => {
    const parent = textNode.parentNode;
    const content = textNode.nodeValue;
    
    // Safety check - if parent is gone, ignore
    if (!parent || !document.body.contains(parent)) return;
    
    // Don't recursively apply
    if (parent.classList.contains('guard-secret-mask')) return;
    
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    regex.lastIndex = 0; // reset
    let match;
    while ((match = regex.exec(content)) !== null) {
       // text before match
       if (match.index > lastIndex) {
         fragment.appendChild(document.createTextNode(content.substring(lastIndex, match.index)));
       }
       
       // match wrapped
       const span = document.createElement('span');
       span.className = 'guard-secret-mask';
       span.textContent = match[0];
       fragment.appendChild(span);
       
       lastIndex = regex.lastIndex;
    }
    
    // text after last match
    if (lastIndex < content.length) {
       fragment.appendChild(document.createTextNode(content.substring(lastIndex)));
    }
    
    parent.replaceChild(fragment, textNode);
  });
}

// Observe DOM mutations for continuous redaction
const observer = new MutationObserver((mutations) => {
  let needsRedaction = false;
  for (const record of mutations) {
    if (record.addedNodes.length > 0) {
      needsRedaction = true;
      break;
    }
  }
  if (needsRedaction && currentState.isExtensionEnabled && currentState.keywords.length > 0) {
    triggerRedaction();
  }
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
} else {
  // If loaded before body exists
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });
}

// --- Active Input DLP Monitor ---
// Monitors what the user is typing into the LLM chat box to prevent accidental leakages.
document.addEventListener('input', (e) => {
  if (!currentState.isExtensionEnabled || currentState.keywords.length === 0) return;
  const target = e.target;
  
  // Specifically target inputs, textareas, and rich contenteditables used by ChatGPT/Claude/etc.
  if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable) {
    const text = target.value || target.innerText || target.textContent || '';
    if (!text) return;

    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${currentState.keywords.map(k => escapeRegExp(k)).join('|')})\\b`, 'i');
    
    let alertBox = document.getElementById('guard-dlp-alert');
    
    if (regex.test(text)) {
      if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'guard-dlp-alert';
        alertBox.innerHTML = `<span>🚨 <strong>Privacy Guard Warning:</strong> Protected secret detected in your input! Delete it before sending.</span>`;
        document.body.appendChild(alertBox);
      }
      alertBox.style.display = 'flex';
    } else {
      if (alertBox) {
        alertBox.style.display = 'none';
      }
    }
  }
}, true);

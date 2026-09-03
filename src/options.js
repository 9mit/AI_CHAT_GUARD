/**
 * DeckMind AI — Options Page Controller
 */

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const optEngine = document.getElementById('opt-engine');
  const optOllamaModel = document.getElementById('opt-ollama-model');
  const optVisualMode = document.getElementById('opt-visual-mode');
  const optSdEndpoint = document.getElementById('opt-sd-endpoint');
  const optDefaultTheme = document.getElementById('opt-default-theme');
  const optDefaultSlides = document.getElementById('opt-default-slides');
  const optSanitizeSecrets = document.getElementById('opt-sanitize-secrets');

  const btnTestOllama = document.getElementById('btn-test-ollama');
  const statusOllama = document.getElementById('status-ollama');
  const btnTestSd = document.getElementById('btn-test-sd');
  const statusSd = document.getElementById('status-sd');
  const btnSaveSettings = document.getElementById('btn-save-settings');

  // Load Saved Options
  const saved = await chrome.storage.local.get([
    'prefEngine',
    'prefOllamaModel',
    'prefVisualMode',
    'prefSdEndpoint',
    'prefTheme',
    'prefSlideCount',
    'prefSanitizeSecrets'
  ]);

  if (saved.prefEngine) optEngine.value = saved.prefEngine;
  if (saved.prefOllamaModel) optOllamaModel.value = saved.prefOllamaModel;
  if (saved.prefVisualMode) optVisualMode.value = saved.prefVisualMode;
  if (saved.prefSdEndpoint) optSdEndpoint.value = saved.prefSdEndpoint;
  if (saved.prefTheme) optDefaultTheme.value = saved.prefTheme;
  if (saved.prefSlideCount) optDefaultSlides.value = String(saved.prefSlideCount);
  if (typeof saved.prefSanitizeSecrets === 'boolean') {
    optSanitizeSecrets.checked = saved.prefSanitizeSecrets;
  }

  // Save Settings
  btnSaveSettings.addEventListener('click', async () => {
    await chrome.storage.local.set({
      prefEngine: optEngine.value,
      prefOllamaModel: optOllamaModel.value.trim(),
      prefVisualMode: optVisualMode.value,
      prefSdEndpoint: optSdEndpoint.value.trim(),
      prefTheme: optDefaultTheme.value,
      prefSlideCount: parseInt(optDefaultSlides.value),
      prefSanitizeSecrets: optSanitizeSecrets.checked
    });

    btnSaveSettings.textContent = 'Settings Saved';
    setTimeout(() => {
      btnSaveSettings.textContent = 'Save Settings';
    }, 2000);
  });

  // Test Ollama Connection
  btnTestOllama.addEventListener('click', async () => {
    statusOllama.textContent = 'Testing connection...';
    statusOllama.style.color = '#94A3B8';

    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map(m => m.name).join(', ');
        statusOllama.textContent = `Connected. Available: ${models || 'None'}`;
        statusOllama.style.color = '#10B981';
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (e) {
      statusOllama.textContent = 'Ollama not reachable on localhost:11434';
      statusOllama.style.color = '#F59E0B';
    }
  });

  // Test SD Connection
  btnTestSd.addEventListener('click', async () => {
    statusSd.textContent = 'Testing SD endpoint...';
    statusSd.style.color = '#94A3B8';

    const url = optSdEndpoint.value.trim() || 'http://localhost:7860';
    try {
      const res = await fetch(`${url}/sdapi/v1/options`);
      if (res.ok) {
        statusSd.textContent = 'Stable Diffusion API Connected';
        statusSd.style.color = '#10B981';
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (e) {
      statusSd.textContent = `Cannot reach SD WebUI at ${url}`;
      statusSd.style.color = '#F59E0B';
    }
  });
});

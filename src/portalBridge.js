// ============================================================
// src/portalBridge.js — postMessage bridge to the portal host
// Implements Protocol A (PORTAL_*) from ADDGAMEDATAREADME.md
// ============================================================

let portalOrigin = null;
const loadListeners = new Set();

function isInsideIframe() {
  try { return window.self !== window.top; } catch { return true; }
}

function postToPortal(type, payload = {}) {
  if (!isInsideIframe()) return;
  window.parent.postMessage({ type, payload }, portalOrigin || '*');
}

function handleMessage(event) {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (!portalOrigin) portalOrigin = event.origin;
  if (data.type === 'PORTAL_GAME_DATA_LOADED') {
    const payload = (data.payload && typeof data.payload === 'object') ? data.payload : {};
    loadListeners.forEach(fn => fn(payload));
  }
}

export function initPortalBridge() {
  window.addEventListener('message', handleMessage);
}

export function fetchGameData(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      loadListeners.delete(onLoaded);
      reject(new Error('Timed out waiting for portal save data'));
    }, timeoutMs);

    function onLoaded(payload) {
      clearTimeout(timer);
      loadListeners.delete(onLoaded);
      resolve(payload);
    }

    loadListeners.add(onLoaded);
    postToPortal('PORTAL_GAME_DATA_LOAD_REQUEST');
  });
}

export function saveGameData(data) {
  postToPortal('PORTAL_GAME_DATA_SAVE', data);
}

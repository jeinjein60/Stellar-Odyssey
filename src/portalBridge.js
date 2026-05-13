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
  if (!isInsideIframe()) {
    console.warn('[PortalBridge] Not inside iframe — message not sent:', type);
    return;
  }
  console.log('[PortalBridge] Sending →', type, payload);
  window.parent.postMessage({ type, payload }, portalOrigin || '*');
}

function handleMessage(event) {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (!portalOrigin) {
    portalOrigin = event.origin;
    console.log('[PortalBridge] Portal origin set to:', portalOrigin);
  }
  if (data.type === 'PORTAL_GAME_DATA_LOADED') {
    console.log('[PortalBridge] Received PORTAL_GAME_DATA_LOADED:', data.payload);
    const payload = (data.payload && typeof data.payload === 'object') ? data.payload : {};
    loadListeners.forEach(fn => fn(payload));
  }
}

export function initPortalBridge() {
  window.addEventListener('message', handleMessage);
  console.log('[PortalBridge] Initialized. In iframe:', isInsideIframe());
}

export function fetchGameData(timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      loadListeners.delete(onLoaded);
      console.warn('[PortalBridge] Timed out waiting for PORTAL_GAME_DATA_LOADED');
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
  console.log('[PortalBridge] Saving →', data);
  postToPortal('PORTAL_GAME_DATA_SAVE', data);
}

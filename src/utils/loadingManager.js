import { DefaultLoadingManager } from 'three';

let _onProgress = null;
let _onLoad = null;
let _onError = null;

DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const pct = Math.round((itemsLoaded / itemsTotal) * 100);
  _onProgress?.(pct, url);
};

DefaultLoadingManager.onLoad = () => {
  _onLoad?.();
};

DefaultLoadingManager.onError = (url) => {
  console.error('[LoadingManager] Failed to load:', url);
  _onError?.(url);
};

/**
 * Register callbacks for the global Three.js loading manager.
 * @param {{ onProgress?, onLoad?, onError? }} callbacks
 */
export function registerLoadingCallbacks({ onProgress, onLoad, onError } = {}) {
  _onProgress = onProgress ?? null;
  _onLoad = onLoad ?? null;
  _onError = onError ?? null;
}

export { DefaultLoadingManager as loadingManager };

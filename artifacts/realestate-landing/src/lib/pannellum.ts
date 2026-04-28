// Lazily load Pannellum from CDN exactly once (no paid APIs, no npm install).
// Pannellum is open-source (MIT) and works as a browser global.

const PANNELLUM_VERSION = "2.5.6";
const CSS_URL = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.css`;
const JS_URL = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.js`;

let loadPromise: Promise<PannellumGlobal> | null = null;

interface PannellumViewer {
  destroy: () => void;
  getPitch: () => number;
  getYaw: () => number;
  loadScene: (sceneId: string) => void;
  mouseEventToCoords: (event: MouseEvent) => [number, number];
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler?: (...args: unknown[]) => void) => void;
}

interface PannellumGlobal {
  viewer: (container: HTMLElement | string, config: Record<string, unknown>) => PannellumViewer;
}

declare global {
  interface Window {
    pannellum?: PannellumGlobal;
  }
}

export function loadPannellum(): Promise<PannellumGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Pannellum requires a browser environment"));
  }
  if (window.pannellum) return Promise.resolve(window.pannellum);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<PannellumGlobal>((resolve, reject) => {
    if (!document.querySelector(`link[data-pannellum]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      link.setAttribute("data-pannellum", "1");
      document.head.appendChild(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[data-pannellum]`);
    const onReady = () => {
      if (window.pannellum) resolve(window.pannellum);
      else reject(new Error("Pannellum failed to initialise"));
    };
    if (existing) {
      if (window.pannellum) onReady();
      else existing.addEventListener("load", onReady, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = JS_URL;
    script.async = true;
    script.setAttribute("data-pannellum", "1");
    script.onload = onReady;
    script.onerror = () => reject(new Error("Failed to load Pannellum from CDN"));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export type { PannellumViewer, PannellumGlobal };

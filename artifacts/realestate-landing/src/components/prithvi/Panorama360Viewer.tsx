import React, { useEffect, useRef, useState } from "react";
import { Compass, Play } from "lucide-react";
import { loadPannellum, type PannellumViewer } from "@/lib/pannellum";
import type { PrithviPanoramaScenes } from "@/store/prithviStore";

interface Panorama360ViewerProps {
  data: PrithviPanoramaScenes;
  height?: number | string;
  /** Optional poster image shown before the user starts the tour. */
  poster?: string;
  className?: string;
}

/**
 * Read-only 360° viewer with multi-scene navigation.
 *
 * Defers the heavy work — loading the Pannellum library and downloading the
 * equirectangular panoramas — until the user explicitly starts the tour.
 * On mobile / slow networks this avoids burning multi-MB of bandwidth on a
 * detail-page visit that may never engage with the tour.
 */
export default function Panorama360Viewer({
  data,
  height = 460,
  poster,
  className = "",
}: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sceneIds = Object.keys(data.scenes ?? {});
  const firstSceneId =
    data.firstScene && data.scenes[data.firstScene] ? data.firstScene : sceneIds[0];
  const firstScene = firstSceneId ? data.scenes[firstSceneId] : null;
  const posterSrc = poster || firstScene?.panorama;

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    const container = containerRef.current;
    if (!container || sceneIds.length === 0 || !firstSceneId) {
      setError("No scenes available");
      return;
    }
    setLoading(true);

    const pannellumScenes: Record<string, unknown> = {};
    for (const [id, scene] of Object.entries(data.scenes)) {
      pannellumScenes[id] = {
        title: scene.title,
        type: "equirectangular",
        panorama: scene.panorama,
        // Only the first scene autoloads; others stream in on hotspot navigation
        // (massive bandwidth saving on multi-scene tours).
        autoLoad: id === firstSceneId,
        hotSpots: (scene.hotSpots || []).map((h) => ({
          pitch: h.pitch,
          yaw: h.yaw,
          type: "scene",
          text: h.text,
          sceneId: h.sceneId,
        })),
      };
    }

    loadPannellum()
      .then((pannellum) => {
        if (cancelled || !container) return;
        try {
          viewerRef.current = pannellum.viewer(container, {
            default: {
              firstScene: firstSceneId,
              autoLoad: true,
              sceneFadeDuration: 800,
              compass: false,
              showZoomCtrl: true,
              showFullscreenCtrl: true,
              hfov: 110,
              // Browser will lazy-load extra scene panoramas only when their hotspot is clicked.
              preview: posterSrc,
            },
            scenes: pannellumScenes,
          });
          setLoading(false);
        } catch (err) {
          setError((err as Error).message || "Failed to initialise viewer");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load Pannellum");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      try {
        viewerRef.current?.destroy();
      } catch {
        // ignore cleanup errors
      }
      viewerRef.current = null;
    };
  }, [started, data, firstSceneId, posterSrc]);

  return (
    <div
      className={`relative w-full bg-black rounded-xl overflow-hidden ${className}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="absolute inset-0 group flex items-center justify-center text-white"
          aria-label="Start 360° tour"
        >
          {posterSrc && (
            // Poster image – lazy + async so the browser deprioritises it on slow networks.
            <img
              src={posterSrc}
              alt="360° tour preview"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          <div className="relative flex flex-col items-center gap-3 px-6 text-center">
            <div className="bg-white/15 backdrop-blur-sm rounded-full p-5 border border-white/30 group-hover:bg-white/25 group-hover:scale-105 transition-all">
              <Play className="w-8 h-8 fill-white" />
            </div>
            <div>
              <p className="font-bold text-base flex items-center justify-center gap-1.5">
                <Compass className="w-4 h-4" /> Start 360° Virtual Tour
              </p>
              <p className="text-xs text-white/80 mt-1">
                {sceneIds.length} scene{sceneIds.length === 1 ? "" : "s"} · loads on demand to save data
              </p>
            </div>
          </div>
        </button>
      ) : (
        <>
          <div ref={containerRef} className="absolute inset-0" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none bg-black/40">
              Loading 360° tour…
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-red-200 text-sm bg-black/80">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

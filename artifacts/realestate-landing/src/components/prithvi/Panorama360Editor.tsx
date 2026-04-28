import React, { useEffect, useRef, useState, useCallback } from "react";
import { Plus, Trash2, Image as ImageIcon, Crosshair, Check, X, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loadPannellum, type PannellumViewer } from "@/lib/pannellum";
import type {
  PrithviPanoramaScenes,
  PrithviPanoramaScene,
  PrithviHotSpot,
} from "@/store/prithviStore";
import { api } from "@/api/client";

interface Panorama360EditorProps {
  value: PrithviPanoramaScenes | null | undefined;
  onChange: (next: PrithviPanoramaScenes | null) => void;
  maxScenes?: number;
}

function emptyScenes(): PrithviPanoramaScenes {
  return { scenes: {}, firstScene: undefined };
}

function generateSceneId() {
  return `scene-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Admin editor for multi-scene 360° tours.
 * - Upload panorama images (saved under /uploads/360/)
 * - Add/rename/delete scenes
 * - Click on the panorama to capture pitch/yaw and create scene-link hotspots
 */
export default function Panorama360Editor({
  value,
  onChange,
  maxScenes = 5,
}: Panorama360EditorProps) {
  const data = value && Object.keys(value.scenes || {}).length > 0 ? value : emptyScenes();
  const sceneIds = Object.keys(data.scenes);
  const [activeId, setActiveId] = useState<string | null>(sceneIds[0] ?? null);

  // Keep the active scene valid as scenes are added/removed.
  useEffect(() => {
    if (sceneIds.length === 0) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    if (!activeId || !data.scenes[activeId]) {
      setActiveId(sceneIds[0]);
    }
  }, [sceneIds.join("|"), activeId]);

  const updateScenes = useCallback(
    (mutator: (next: PrithviPanoramaScenes) => void) => {
      const next: PrithviPanoramaScenes = {
        scenes: { ...data.scenes },
        firstScene: data.firstScene,
      };
      mutator(next);
      const ids = Object.keys(next.scenes);
      if (ids.length === 0) {
        onChange(null);
        return;
      }
      if (!next.firstScene || !next.scenes[next.firstScene]) {
        next.firstScene = ids[0];
      }
      onChange(next);
    },
    [data, onChange]
  );

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddScene = async (file: File) => {
    if (sceneIds.length >= maxScenes) {
      alert(`Maximum ${maxScenes} scenes per property.`);
      return;
    }
    setUploading(true);
    try {
      const url = await api.uploadPanorama(file);
      const id = generateSceneId();
      updateScenes((next) => {
        next.scenes[id] = {
          title: file.name.replace(/\.[^.]+$/, "") || `Scene ${Object.keys(next.scenes).length + 1}`,
          panorama: url,
          hotSpots: [],
        };
        if (!next.firstScene) next.firstScene = id;
      });
      setActiveId(id);
    } catch (err) {
      alert(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRenameScene = (id: string, title: string) => {
    updateScenes((next) => {
      if (next.scenes[id]) next.scenes[id] = { ...next.scenes[id], title };
    });
  };

  const handleDeleteScene = (id: string) => {
    if (!confirm("Delete this scene? Hotspots pointing to it will also be removed.")) return;
    updateScenes((next) => {
      delete next.scenes[id];
      // Remove hotspots that point to the deleted scene
      for (const sid of Object.keys(next.scenes)) {
        next.scenes[sid] = {
          ...next.scenes[sid],
          hotSpots: next.scenes[sid].hotSpots.filter((h) => h.sceneId !== id),
        };
      }
      if (next.firstScene === id) next.firstScene = Object.keys(next.scenes)[0];
    });
  };

  const handleSetFirstScene = (id: string) => {
    updateScenes((next) => {
      next.firstScene = id;
    });
  };

  const handleAddHotspot = (sceneId: string, hotspot: PrithviHotSpot) => {
    updateScenes((next) => {
      const scene = next.scenes[sceneId];
      if (!scene) return;
      next.scenes[sceneId] = {
        ...scene,
        hotSpots: [...scene.hotSpots, hotspot],
      };
    });
  };

  const handleDeleteHotspot = (sceneId: string, index: number) => {
    updateScenes((next) => {
      const scene = next.scenes[sceneId];
      if (!scene) return;
      next.scenes[sceneId] = {
        ...scene,
        hotSpots: scene.hotSpots.filter((_, i) => i !== index),
      };
    });
  };

  const activeScene: PrithviPanoramaScene | null = activeId ? data.scenes[activeId] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Scenes ({sceneIds.length}/{maxScenes})</p>
          <p className="text-xs text-gray-400">Upload equirectangular panoramas. Click the viewer to add hotspots.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAddScene(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sceneIds.length >= maxScenes}
            className="bg-green-700 hover:bg-green-800 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload Scene"}
          </Button>
        </div>
      </div>

      {sceneIds.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 opacity-40" />
          No 360° scenes yet. Upload an equirectangular panorama to get started.
        </div>
      ) : (
        <>
          <SceneList
            data={data}
            activeId={activeId}
            onSelect={setActiveId}
            onRename={handleRenameScene}
            onDelete={handleDeleteScene}
            onSetFirst={handleSetFirstScene}
          />
          {activeScene && activeId && (
            <SceneEditor
              key={activeId}
              sceneId={activeId}
              scene={activeScene}
              allScenes={data.scenes}
              onAddHotspot={(h) => handleAddHotspot(activeId, h)}
              onDeleteHotspot={(i) => handleDeleteHotspot(activeId, i)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Scene List ─────────────────────────────────────────────────────────────────
function SceneList({
  data,
  activeId,
  onSelect,
  onRename,
  onDelete,
  onSetFirst,
}: {
  data: PrithviPanoramaScenes;
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onSetFirst: (id: string) => void;
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Object.entries(data.scenes).map(([id, scene]) => {
        const isActive = id === activeId;
        const isFirst = id === data.firstScene;
        const isRenaming = id === renamingId;
        return (
          <div
            key={id}
            className={`border rounded-xl overflow-hidden bg-white transition-all ${
              isActive ? "border-green-500 ring-2 ring-green-100" : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="block w-full text-left"
            >
              <div className="relative h-24 bg-gray-100">
                <img
                  src={scene.panorama}
                  alt={scene.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                {isFirst && (
                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Start
                  </span>
                )}
                <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {scene.hotSpots.length} link{scene.hotSpots.length === 1 ? "" : "s"}
                </span>
              </div>
            </button>
            <div className="p-2.5 space-y-1.5">
              {isRenaming ? (
                <div className="flex gap-1">
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (renameValue.trim()) onRename(id, renameValue.trim());
                        setRenamingId(null);
                      } else if (e.key === "Escape") {
                        setRenamingId(null);
                      }
                    }}
                    className="text-xs h-7"
                  />
                  <button
                    type="button"
                    className="text-green-600 hover:text-green-800 p-1"
                    onClick={() => {
                      if (renameValue.trim()) onRename(id, renameValue.trim());
                      setRenamingId(null);
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-800 truncate">{scene.title}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                {!isFirst ? (
                  <button
                    type="button"
                    onClick={() => onSetFirst(id)}
                    className="text-green-700 hover:text-green-900 font-medium"
                  >
                    Set as start
                  </button>
                ) : (
                  <span className="text-amber-600 font-medium">Start scene</span>
                )}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRenameValue(scene.title);
                      setRenamingId(id);
                    }}
                    className="text-gray-400 hover:text-gray-700 p-1"
                    title="Rename"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Delete scene"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Scene Editor (viewer + click-to-add-hotspot) ───────────────────────────────
function SceneEditor({
  sceneId,
  scene,
  allScenes,
  onAddHotspot,
  onDeleteHotspot,
}: {
  sceneId: string;
  scene: PrithviPanoramaScene;
  allScenes: Record<string, PrithviPanoramaScene>;
  onAddHotspot: (h: PrithviHotSpot) => void;
  onDeleteHotspot: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const [pending, setPending] = useState<{ pitch: number; yaw: number } | null>(null);
  const [text, setText] = useState("");
  const [targetSceneId, setTargetSceneId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const otherSceneIds = Object.keys(allScenes).filter((id) => id !== sceneId);

  // Initialize viewer for this scene only.
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);
    setPending(null);

    loadPannellum()
      .then((pannellum) => {
        if (cancelled || !container) return;
        try {
          viewerRef.current = pannellum.viewer(container, {
            type: "equirectangular",
            panorama: scene.panorama,
            autoLoad: true,
            compass: false,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            hfov: 110,
            hotSpots: scene.hotSpots.map((h) => ({
              pitch: h.pitch,
              yaw: h.yaw,
              type: "info",
              text: `${h.text} → ${allScenes[h.sceneId]?.title || h.sceneId}`,
            })),
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
        // ignore
      }
      viewerRef.current = null;
    };
  }, [sceneId, scene.panorama, JSON.stringify(scene.hotSpots), JSON.stringify(allScenes)]);

  // Capture click on the panorama → pitch/yaw.
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      const coords = viewer.mouseEventToCoords(e.nativeEvent);
      if (!coords || coords.length !== 2) return;
      const [pitch, yaw] = coords;
      if (!Number.isFinite(pitch) || !Number.isFinite(yaw)) return;
      setPending({ pitch: Math.round(pitch * 100) / 100, yaw: Math.round(yaw * 100) / 100 });
      if (otherSceneIds.length > 0 && !targetSceneId) {
        setTargetSceneId(otherSceneIds[0]);
      }
    } catch {
      // ignore – click outside the panorama
    }
  };

  const handleSaveHotspot = () => {
    if (!pending) return;
    if (!targetSceneId) {
      alert("Please choose a target scene.");
      return;
    }
    onAddHotspot({
      pitch: pending.pitch,
      yaw: pending.yaw,
      type: "scene",
      text: text.trim() || allScenes[targetSceneId]?.title || "Go",
      sceneId: targetSceneId,
    });
    setPending(null);
    setText("");
  };

  return (
    <div className="space-y-3 border border-gray-200 rounded-2xl p-4 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-green-600" />
          Editing: <span className="text-green-700">{scene.title}</span>
        </h4>
        <p className="text-xs text-gray-500">Click anywhere on the view to place a hotspot</p>
      </div>

      <div
        className="relative w-full bg-black rounded-xl overflow-hidden cursor-crosshair"
        style={{ height: 380 }}
        onClick={handleContainerClick}
      >
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none">
            Loading panorama…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-200 text-sm bg-black/80">
            {error}
          </div>
        )}
      </div>

      {pending && (
        <div className="bg-white border border-green-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Add hotspot</p>
              <p className="text-xs text-gray-500 font-mono">
                pitch {pending.pitch.toFixed(2)} · yaw {pending.yaw.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                setText("");
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Label</label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Living Room"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Target scene</label>
              {otherSceneIds.length === 0 ? (
                <p className="text-xs text-amber-600 italic py-2">
                  Add another scene first to link to it.
                </p>
              ) : (
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white text-gray-800 text-sm px-3 py-2"
                  value={targetSceneId}
                  onChange={(e) => setTargetSceneId(e.target.value)}
                >
                  {otherSceneIds.map((id) => (
                    <option key={id} value={id}>
                      {allScenes[id].title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveHotspot}
            disabled={otherSceneIds.length === 0}
            className="bg-green-700 hover:bg-green-800"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Save Hotspot
          </Button>
        </div>
      )}

      {scene.hotSpots.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Hotspots in this scene ({scene.hotSpots.length})
          </p>
          <div className="space-y-1.5">
            {scene.hotSpots.map((h, i) => (
              <div
                key={`${h.sceneId}-${i}`}
                className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">
                    {h.text || "(no label)"} →{" "}
                    <span className="text-green-700">
                      {allScenes[h.sceneId]?.title || h.sceneId}
                    </span>
                  </p>
                  <p className="text-gray-400 font-mono">
                    pitch {h.pitch.toFixed(2)} · yaw {h.yaw.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteHotspot(i)}
                  className="text-red-400 hover:text-red-600 p-1 shrink-0"
                  title="Delete hotspot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

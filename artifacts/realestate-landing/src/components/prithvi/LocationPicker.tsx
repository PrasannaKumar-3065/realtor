import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, Navigation } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const pickerIcon = new L.DivIcon({
  html: `<div style="width:24px;height:24px;background:#15803d;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  iconAnchor: [12, 24],
  iconSize: [24, 24],
  className: "",
});

const DEFAULT_CENTER: [number, number] = [9.9252, 78.1198];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15, { duration: 1 }); }, [lat, lng, map]);
  return null;
}

export interface LocationPickerProps {
  lat?: number;
  lng?: number;
  onPick: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onPick }: LocationPickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePick = (pickLat: number, pickLng: number) => {
    onPick(pickLat, pickLng);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      onPick(latitude, longitude);
      setFlyTarget([latitude, longitude]);
    });
  };

  const center: [number, number] = lat != null && lng != null ? [lat, lng] : DEFAULT_CENTER;
  const zoom = lat != null ? 15 : 11;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        height: isFullscreen ? "100vh" : 320,
        borderRadius: isFullscreen ? 0 : "0.75rem",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        cursor: "crosshair",
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        {flyTarget && <FlyTo lat={flyTarget[0]} lng={flyTarget[1]} />}
        {lat != null && lng != null && (
          <Marker
            position={[lat, lng]}
            draggable={true}
            icon={pickerIcon}
            eventHandlers={{
              dragend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                handlePick(pos.lat, pos.lng);
              },
            }}
          />
        )}
      </MapContainer>

      {/* Controls overlay */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          style={{ background: "white", border: "none", borderRadius: 6, padding: "7px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
        <button
          type="button"
          onClick={handleMyLocation}
          title="Use my current location"
          style={{ background: "white", border: "none", borderRadius: 6, padding: "7px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Navigation size={15} />
        </button>
      </div>

      {/* Hint */}
      {lat == null && (
        <div style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, background: "rgba(0,0,0,0.65)", color: "white",
          fontSize: 12, padding: "6px 16px", borderRadius: 20, pointerEvents: "none",
          whiteSpace: "nowrap",
        }}>
          Click anywhere on the map to pin location
        </div>
      )}
    </div>
  );
}

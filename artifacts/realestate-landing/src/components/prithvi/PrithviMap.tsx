import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, ExternalLink } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface MapProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
}

function getCenter(props: MapProperty[]): [number, number] {
  if (props.length === 0) return [9.9252, 78.1198];
  if (props.length === 1) return [props[0].lat, props[0].lng];
  const sumLat = props.reduce((s, p) => s + p.lat, 0);
  const sumLng = props.reduce((s, p) => s + p.lng, 0);
  return [sumLat / props.length, sumLng / props.length];
}

function getZoom(props: MapProperty[]): number {
  if (props.length === 1) return 15;
  if (props.length <= 3) return 12;
  return 11;
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

interface PrithviMapProps {
  properties: MapProperty[];
  showDetailLink?: boolean;
  height?: string;
  showGoogleMapsLink?: boolean;
}

export default function PrithviMap({
  properties,
  showDetailLink = true,
  height = "420px",
  showGoogleMapsLink = false,
}: PrithviMapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const center = getCenter(properties);
  const zoom = getZoom(properties);

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

  const singleProp = properties.length === 1 ? properties[0] : null;
  const googleMapsUrl = singleProp
    ? `https://www.google.com/maps?q=${singleProp.lat},${singleProp.lng}`
    : null;

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={wrapperRef}
        style={{
          height: isFullscreen ? "100vh" : height,
          width: "100%",
          borderRadius: isFullscreen ? 0 : "1rem",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} zoom={zoom} />
          {properties.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div style={{ minWidth: 190 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: "#166534" }}>{p.title}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#15803d", marginBottom: 2 }}>{p.price}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{p.location}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {showDetailLink && (
                      <a
                        href={`/prithvi/property/${p.id}`}
                        style={{ fontSize: 12, color: "#166534", fontWeight: 600, textDecoration: "underline" }}
                      >
                        View Details →
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 500, textDecoration: "underline" }}
                    >
                      Open in Google Maps ↗
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          style={{
            position: "absolute", top: 10, right: 10, zIndex: 1000,
            background: "white", border: "none", borderRadius: 6,
            padding: "7px", cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Google Maps external link below the map (for single-property detail view) */}
      {showGoogleMapsLink && googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          View in Google Maps
        </a>
      )}
    </div>
  );
}

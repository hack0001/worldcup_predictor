"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { uploadAvatar } from "@/lib/storage";

const EMOJI_AVATARS = [
  "⚽", "🏆", "🥇", "🦁", "🐯", "🦊", "🐺", "🦅", "🧢",
  "👑", "🎯", "🔥", "⚡", "💪", "🏅", "🚀", "🌟", "💎",
  "🎭", "🦄", "🐉", "🦸", "🧙", "🤴", "👸", "🎪", "🃏",
];

interface Props {
  playerId: string;
  currentUrl: string;
  playerName: string;
  onUpdate: (url: string) => void;
}

// ─────────────────────────────────────────────────────────
// CropTool — canvas-based so preview === output exactly
// ─────────────────────────────────────────────────────────
const CANVAS_SIZE = 280; // display size of the canvas element

function CropTool({ imageSrc, onConfirm, onCancel }: {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // offset = top-left of the image in canvas coords
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [ready, setReady] = useState(false);

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Load image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const mz = CANVAS_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      setMinZoom(mz);
      setZoom(mz);
      // Centre image
      const w = img.naturalWidth * mz;
      const h = img.naturalHeight * mz;
      setOffset({ x: (CANVAS_SIZE - w) / 2, y: (CANVAS_SIZE - h) / 2 });
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Clamp so image always covers the full canvas
  const clamp = useCallback((ox: number, oy: number, z: number) => {
    if (!imgRef.current) return { x: ox, y: oy };
    const w = imgRef.current.naturalWidth * z;
    const h = imgRef.current.naturalHeight * z;
    return {
      x: Math.min(0, Math.max(CANVAS_SIZE - w, ox)),
      y: Math.min(0, Math.max(CANVAS_SIZE - h, oy)),
    };
  }, []);

  // Draw to canvas every time offset/zoom/ready changes
  useEffect(() => {
    if (!ready || !imgRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw image
    const w = imgRef.current.naturalWidth * zoom * dpr;
    const h = imgRef.current.naturalHeight * zoom * dpr;
    const ox = offset.x * dpr;
    const oy = offset.y * dpr;
    ctx.drawImage(imgRef.current, ox, oy, w, h);
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#00966d";
    ctx.lineWidth = 3 * dpr;
    ctx.stroke();
  }, [offset, zoom, ready]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setOffset(prev => clamp(prev.x + dx, prev.y + dy, zoom));
    };
    const up = () => { dragging.current = false; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [zoom, clamp]);

  // Touch events
  const lastTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setOffset(prev => clamp(prev.x + dx, prev.y + dy, zoom));
  };

  const handleZoom = (newZoom: number) => {
    if (!imgRef.current) return;
    // Keep canvas centre stable while zooming
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const ratio = newZoom / zoom;
    const newOx = cx - (cx - offset.x) * ratio;
    const newOy = cy - (cy - offset.y) * ratio;
    setZoom(newZoom);
    setOffset(clamp(newOx, newOy, newZoom));
  };

  // Export: canvas already shows exactly what we want — just export it
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(blob => { if (blob) onConfirm(blob); }, "image/jpeg", 0.93);
  };

  // Set up canvas with devicePixelRatio
  const canvasStyle = { width: CANVAS_SIZE, height: CANVAS_SIZE, cursor: "grab", borderRadius: "50%", display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>Position your photo</p>
        <p style={{ fontSize: "12px", color: "var(--text-2)" }}>Drag to reposition · slider to zoom · what you see is what gets saved</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <canvas
          ref={el => {
            (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
            if (el) {
              const dpr = window.devicePixelRatio || 1;
              el.width = CANVAS_SIZE * dpr;
              el.height = CANVAS_SIZE * dpr;
            }
          }}
          style={canvasStyle}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { dragging.current = false; }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px" }}>🔍</span>
        <input
          type="range"
          min={minZoom}
          max={minZoom * 4}
          step={0.001}
          value={zoom}
          onChange={e => handleZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--green)" }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-3)", minWidth: "36px", textAlign: "right" }}>
          {Math.round((zoom / minZoom) * 100)}%
        </span>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button className="btn-primary" type="button" onClick={handleConfirm} style={{ flex: 1, justifyContent: "center" }}>
          ✓ Use This Photo
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main AvatarPicker
// ─────────────────────────────────────────────────────────
export default function AvatarPicker({ playerId, currentUrl, playerName, onUpdate }: Props) {
  const [tab, setTab] = useState<"upload" | "emoji">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEmoji = currentUrl?.startsWith("emoji:");
  const emojiChar = isEmoji ? currentUrl.replace("emoji:", "") : "";

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropped = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    const file = new File([blob], `avatar-${playerId}.jpg`, { type: "image/jpeg" });
    const url = await uploadAvatar(playerId, file);
    if (url) onUpdate(url);
    else setError("Upload failed — check your Supabase storage bucket is public.");
    setUploading(false);
  };

  return (
    <div>
      <label className="label">Profile Picture</label>

      {/* Preview */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <AvatarDisplay url={currentUrl} name={playerName} size={64} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{playerName || "Your name"}</p>
          <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
            {isEmoji ? "Emoji avatar" : currentUrl ? "Photo uploaded ✓" : "No photo set yet"}
          </p>
        </div>
      </div>

      {cropSrc ? (
        <CropTool imageSrc={cropSrc} onConfirm={handleCropped} onCancel={() => setCropSrc(null)} />
      ) : (
        <>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "14px" }}>
            <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>📷 Upload Photo</button>
            <button className={`tab ${tab === "emoji" ? "active" : ""}`} onClick={() => setTab("emoji")}>😀 Pick Emoji</button>
          </div>

          {tab === "upload" && (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChosen} style={{ display: "none" }} />
              <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%" }}>
                {uploading ? "Uploading..." : currentUrl && !isEmoji ? "Change Photo" : "Choose Photo"}
              </button>
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>
                JPG, PNG or GIF · max 10MB · drag and zoom to position after selecting
              </p>
              {error && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "6px" }}>{error}</p>}
            </div>
          )}

          {tab === "emoji" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "6px" }}>
              {EMOJI_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onUpdate(`emoji:${emoji}`)}
                  style={{
                    fontSize: "24px", padding: "8px", lineHeight: 1,
                    border: "2px solid",
                    borderColor: emojiChar === emoji ? "var(--green)" : "var(--border)",
                    borderRadius: "8px",
                    background: emojiChar === emoji ? "var(--green-light)" : "var(--surface)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Reusable display used across the app
// ─────────────────────────────────────────────────────────
export function AvatarDisplay({ url, name, size = 36 }: { url: string; name: string; size?: number }) {
  const isEmoji = url?.startsWith("emoji:");
  const emojiChar = isEmoji ? url.replace("emoji:", "") : "";
  const isPhoto = url && !isEmoji;

  if (isPhoto) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", flexShrink: 0 }}>
        <img
          src={url}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
    );
  }
  if (isEmoji) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--green-light)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, flexShrink: 0 }}>
        {emojiChar}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "white", flexShrink: 0 }}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

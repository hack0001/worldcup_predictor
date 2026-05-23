"use client";
import { useState, useRef, useCallback, useEffect } from "react";
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

// ── Crop Tool ─────────────────────────────────────────────
function CropTool({ imageSrc, onCrop, onCancel }: { imageSrc: string; onCrop: (blob: Blob) => void; onCancel: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const CROP_SIZE = 260;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      // Start centred
      const scale = CROP_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      setZoom(scale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.onload = () => {
      const displayedW = imgSize.w * zoom;
      const displayedH = imgSize.h * zoom;
      // Centre of crop window in display coords
      const cropCX = CROP_SIZE / 2;
      const cropCY = CROP_SIZE / 2;
      // Top-left of image in display coords
      const imgLeft = offset.x + CROP_SIZE / 2 - displayedW / 2;
      const imgTop = offset.y + CROP_SIZE / 2 - displayedH / 2;
      // Crop region in image natural coords
      const srcX = (cropCX - imgLeft) / zoom - 150 / zoom;
      const srcY = (cropCY - imgTop) / zoom - 150 / zoom;
      const srcSize = 300 / zoom;
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, 300, 300);
      canvas.toBlob((blob) => { if (blob) onCrop(blob); }, "image/jpeg", 0.92);
    };
    img.src = imageSrc;
  };

  const displayedW = imgSize.w * zoom;
  const displayedH = imgSize.h * zoom;
  const imgLeft = offset.x + CROP_SIZE / 2 - displayedW / 2;
  const imgTop = offset.y + CROP_SIZE / 2 - displayedH / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <p style={{ fontSize: "13px", fontWeight: 600 }}>Position your photo</p>
      <p style={{ fontSize: "12px", color: "var(--text-2)" }}>Drag to reposition · Use the slider to zoom</p>

      {/* Crop window */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          ref={containerRef}
          style={{ position: "relative", width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", border: "3px solid var(--green)", userSelect: "none", boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)", flexShrink: 0 }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => setDragging(false)}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="crop"
              draggable={false}
              style={{ position: "absolute", width: displayedW, height: displayedH, left: imgLeft, top: imgTop, pointerEvents: "none" }}
            />
          )}
        </div>
      </div>

      {/* Zoom slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>🔍−</span>
        <input
          type="range"
          min={imgSize.w ? CROP_SIZE / Math.max(imgSize.w, imgSize.h) : 0.5}
          max={4}
          step={0.01}
          value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--green)" }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>+</span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button className="btn-primary" type="button" onClick={handleCrop} style={{ flex: 1, justifyContent: "center" }}>✓ Use This</button>
        <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main AvatarPicker ─────────────────────────────────────
export default function AvatarPicker({ playerId, currentUrl, playerName, onUpdate }: Props) {
  const [tab, setTab] = useState<"upload" | "emoji">("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEmoji = currentUrl.startsWith("emoji:");
  const emojiChar = isEmoji ? currentUrl.replace("emoji:", "") : "";

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
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
        <CropTool imageSrc={cropSrc} onCrop={handleCropped} onCancel={() => setCropSrc(null)} />
      ) : (
        <>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "14px" }}>
            <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>📷 Upload Photo</button>
            <button className={`tab ${tab === "emoji" ? "active" : ""}`} onClick={() => setTab("emoji")}>😀 Pick Avatar</button>
          </div>

          {tab === "upload" && (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChosen} style={{ display: "none" }} />
              <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%" }}>
                {uploading ? "Uploading..." : currentUrl && !isEmoji ? "Change Photo" : "Choose Photo"}
              </button>
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>JPG, PNG or GIF · max 10MB · you'll be able to crop after choosing</p>
              {error && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "6px" }}>{error}</p>}
            </div>
          )}

          {tab === "emoji" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "6px" }}>
              {EMOJI_AVATARS.map((emoji) => (
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

// ── Reusable display ──────────────────────────────────────
export function AvatarDisplay({ url, name, size = 36 }: { url: string; name: string; size?: number }) {
  const isEmoji = url?.startsWith("emoji:");
  const emojiChar = isEmoji ? url.replace("emoji:", "") : "";
  const isPhoto = url && !isEmoji;

  if (isPhoto) {
    return (
      <img src={url} alt={name} width={size} height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
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

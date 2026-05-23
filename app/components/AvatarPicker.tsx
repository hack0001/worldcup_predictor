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

const CROP_SIZE = 260; // px — the circular viewport shown to the user
const OUTPUT_SIZE = 300; // px — final exported image

// ── Crop Tool ─────────────────────────────────────────────
function CropTool({ imageSrc, onCrop, onCancel }: {
  imageSrc: string;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}) {
  // imgPos is the top-left of the image relative to the crop container
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ mx: 0, my: 0, ix: 0, iy: 0 });

  // Load image, set initial zoom so it fills the circle
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      setNaturalSize({ w, h });
      const initialZoom = CROP_SIZE / Math.min(w, h);
      setZoom(initialZoom);
      // Centre the image in the crop window
      const displayW = w * initialZoom;
      const displayH = h * initialZoom;
      setImgPos({ x: (CROP_SIZE - displayW) / 2, y: (CROP_SIZE - displayH) / 2 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Displayed image size at current zoom
  const displayW = naturalSize.w * zoom;
  const displayH = naturalSize.h * zoom;

  // Clamp so image always covers the crop circle
  const clamp = useCallback((pos: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(CROP_SIZE - displayW, pos.x)),
    y: Math.min(0, Math.max(CROP_SIZE - displayH, pos.y)),
  }), [displayW, displayH]);

  // When zoom changes, re-centre while keeping the crop covered
  const handleZoom = (newZoom: number) => {
    const newW = naturalSize.w * newZoom;
    const newH = naturalSize.h * newZoom;
    // Keep the centre of the visible area stable
    const cx = CROP_SIZE / 2;
    const cy = CROP_SIZE / 2;
    const ratioX = (cx - imgPos.x) / displayW;
    const ratioY = (cy - imgPos.y) / displayH;
    const newX = cx - ratioX * newW;
    const newY = cy - ratioY * newH;
    setZoom(newZoom);
    setImgPos({
      x: Math.min(0, Math.max(CROP_SIZE - newW, newX)),
      y: Math.min(0, Math.max(CROP_SIZE - newH, newY)),
    });
  };

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ix: imgPos.x, iy: imgPos.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragOrigin.current.mx;
    const dy = e.clientY - dragOrigin.current.my;
    setImgPos(clamp({ x: dragOrigin.current.ix + dx, y: dragOrigin.current.iy + dy }));
  }, [dragging, clamp]);
  const onMouseUp = useCallback(() => setDragging(false), []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragOrigin.current = { mx: t.clientX, my: t.clientY, ix: imgPos.x, iy: imgPos.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragOrigin.current.mx;
    const dy = t.clientY - dragOrigin.current.my;
    setImgPos(clamp({ x: dragOrigin.current.ix + dx, y: dragOrigin.current.iy + dy }));
  };

  // Export: draw the visible crop region onto a canvas
  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d")!;

    // Circular clip
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.onload = () => {
      // imgPos.x/y is where the top-left of the displayed image sits in the crop container.
      // The crop window's top-left is at (0,0) in container coords.
      // Source region in natural image pixels:
      const srcX = (0 - imgPos.x) / zoom;
      const srcY = (0 - imgPos.y) / zoom;
      const srcW = CROP_SIZE / zoom;
      const srcH = CROP_SIZE / zoom;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      canvas.toBlob((blob) => { if (blob) onCrop(blob); }, "image/jpeg", 0.93);
    };
    img.src = imageSrc;
  };

  const minZoom = naturalSize.w ? CROP_SIZE / Math.min(naturalSize.w, naturalSize.h) : 0.5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>Position your photo</p>
        <p style={{ fontSize: "12px", color: "var(--text-2)" }}>Drag inside the circle to reposition · use the slider to zoom</p>
      </div>

      {/* Crop window */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: CROP_SIZE, height: CROP_SIZE, flexShrink: 0 }}>
          {/* Dark overlay with circular hole */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(circle ${CROP_SIZE / 2}px at center, transparent ${CROP_SIZE / 2}px, rgba(0,0,0,0.55) ${CROP_SIZE / 2}px)`,
          }} />
          {/* Circle border */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            borderRadius: "50%", border: "2.5px solid var(--green)",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
          }} />
          {/* Draggable image layer */}
          <div
            style={{ position: "absolute", inset: 0, overflow: "hidden", cursor: dragging ? "grabbing" : "grab", borderRadius: "4px" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setDragging(false)}
          >
            {imageSrc && naturalSize.w > 0 && (
              <img
                src={imageSrc}
                alt="crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  left: imgPos.x,
                  top: imgPos.y,
                  width: displayW,
                  height: displayH,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Zoom slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px", lineHeight: 1 }}>🔍</span>
        <input
          type="range"
          min={minZoom}
          max={minZoom * 4}
          step={0.001}
          value={zoom}
          onChange={e => handleZoom(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "var(--green)" }}
        />
        <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600, minWidth: "40px" }}>
          {Math.round((zoom / minZoom) * 100)}%
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button className="btn-primary" type="button" onClick={handleCrop} style={{ flex: 1, justifyContent: "center" }}>
          ✓ Use This Photo
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
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

  const isEmoji = currentUrl?.startsWith("emoji:");
  const emojiChar = isEmoji ? currentUrl.replace("emoji:", "") : "";

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
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
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>
                JPG, PNG or GIF · max 10MB · crop and position after selecting
              </p>
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

// ── Reusable AvatarDisplay ────────────────────────────────
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

"use client";
import { useState, useRef } from "react";
import { uploadAvatar } from "@/lib/storage";

const EMOJI_AVATARS = [
  "⚽", "🏆", "🥇", "🦁", "🐯", "🦊", "🐺", "🦅", "🦁",
  "🧢", "👑", "🎯", "🔥", "⚡", "💪", "🏅", "🎪", "🚀",
  "🌟", "💎", "🎭", "🦄", "🐉", "🦸", "🧙", "🤴", "👸",
];

interface Props {
  playerId: string;
  currentUrl: string;
  playerName: string;
  onUpdate: (url: string) => void;
}

export default function AvatarPicker({ playerId, currentUrl, playerName, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"upload" | "emoji">("upload");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isEmoji = currentUrl.startsWith("emoji:");
  const emojiChar = isEmoji ? currentUrl.replace("emoji:", "") : "";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setUploading(true); setError("");
    const url = await uploadAvatar(playerId, file);
    if (url) onUpdate(url);
    else setError("Upload failed — check your Supabase storage bucket is public.");
    setUploading(false);
  };

  const handleEmoji = (emoji: string) => {
    onUpdate(`emoji:${emoji}`);
  };

  return (
    <div>
      <label className="label">Profile Picture</label>

      {/* Preview */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <AvatarDisplay url={currentUrl} name={playerName} size={64} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{playerName}</p>
          <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
            {isEmoji ? "Emoji avatar" : currentUrl ? "Photo uploaded" : "No photo set"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "14px" }}>
        <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>📷 Upload Photo</button>
        <button className={`tab ${tab === "emoji" ? "active" : ""}`} onClick={() => setTab("emoji")}>😀 Pick Avatar</button>
      </div>

      {tab === "upload" && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button
            className="btn-secondary"
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ width: "100%" }}
          >
            {uploading ? "Uploading..." : "Choose Photo"}
          </button>
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>JPG, PNG or GIF · max 5MB</p>
          {error && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "6px" }}>{error}</p>}
        </div>
      )}

      {tab === "emoji" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "6px" }}>
          {EMOJI_AVATARS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmoji(emoji)}
              style={{
                fontSize: "24px",
                padding: "8px",
                border: "2px solid",
                borderColor: emojiChar === emoji ? "var(--green)" : "var(--border)",
                borderRadius: "8px",
                background: emojiChar === emoji ? "var(--green-light)" : "var(--surface)",
                cursor: "pointer",
                transition: "all 0.15s",
                lineHeight: 1,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Reusable display component used across the app
export function AvatarDisplay({ url, name, size = 36 }: { url: string; name: string; size?: number }) {
  const isEmoji = url?.startsWith("emoji:");
  const emojiChar = isEmoji ? url.replace("emoji:", "") : "";
  const isPhoto = url && !isEmoji;

  if (isPhoto) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
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

  // Fallback: initials
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "white", flexShrink: 0 }}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

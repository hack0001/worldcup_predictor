"use client";
import { useState, useRef } from "react";
import { uploadAvatar } from "@/lib/storage";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";

const EMOJI_AVATARS = [
  "⚽", "🏆", "🥇", "🦁", "🐯", "🦊", "🐺", "🦅", "🧢",
  "👑", "🎯", "🔥", "⚡", "💪", "🏅", "🚀", "🌟", "💎",
  "🎭", "🦄", "🐉", "🦸", "🧙", "🤴", "👸", "🎪", "🃏",
];

// DiceBear illustrated avatars — "avataaars" style, seeded by player name
// Each player gets a consistent unique illustrated portrait
function footballerAvatarUrl(playerName: string): string {
  const seed = encodeURIComponent(playerName.toLowerCase().replace(/\s+/g, "-"));
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
}

// Prefix for footballer avatars stored in DB
const FOOTBALLER_PREFIX = "footballer:";

interface Props {
  playerId: string;
  currentUrl: string;
  playerName: string;
  onUpdate: (url: string) => void;
}

type Tab = "upload" | "emoji" | "footballer";

export default function AvatarPicker({ playerId, currentUrl, playerName, onUpdate }: Props) {
  const [tab, setTab] = useState<Tab>("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isEmoji = currentUrl?.startsWith("emoji:");
  const isFootballer = currentUrl?.startsWith(FOOTBALLER_PREFIX);
  const emojiChar = isEmoji ? currentUrl.replace("emoji:", "") : "";
  const selectedFootballer = isFootballer ? currentUrl.replace(FOOTBALLER_PREFIX, "") : "";

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10MB"); return; }
    setError("");
    setUploading(true);
    const url = await uploadAvatar(playerId, file);
    if (url) onUpdate(url);
    else setError("Upload failed — check your Supabase storage bucket is public.");
    setUploading(false);
    e.target.value = "";
  };

  // All players grouped by country, filtered
  const countries = Object.keys(SQUADS).sort();
  const filteredCountries = filterCountry ? [filterCountry] : countries;
  const allPlayers = filteredCountries.flatMap(country =>
    SQUADS[country].players
      .filter(p => !search || p.toLowerCase().includes(search.toLowerCase()))
      .map(name => ({ name, country }))
  );

  const avatarType = isEmoji ? "Emoji" : isFootballer ? `${selectedFootballer}` : currentUrl ? "Photo" : "None";

  return (
    <div>
      <label className="label">Profile Picture</label>

      {/* Preview */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
        <AvatarDisplay url={currentUrl} name={playerName} size={64} />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{playerName || "Your name"}</p>
          <p style={{ fontSize: "12px", color: "var(--text-3)" }}>{avatarType}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "14px", overflowX: "auto" }}>
        <button className={`tab ${tab === "upload" ? "active" : ""}`} onClick={() => setTab("upload")}>📷 Photo</button>
        <button className={`tab ${tab === "footballer" ? "active" : ""}`} onClick={() => setTab("footballer")}>🏃 Footballer</button>
        <button className={`tab ${tab === "emoji" ? "active" : ""}`} onClick={() => setTab("emoji")}>😀 Emoji</button>
      </div>

      {/* Upload */}
      {tab === "upload" && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChosen} style={{ display: "none" }} />
          <button className="btn-secondary" type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: "100%" }}>
            {uploading ? "Uploading..." : currentUrl && !isEmoji && !isFootballer ? "Change Photo" : "Choose Photo"}
          </button>
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>
            JPG, PNG or GIF · max 10MB · automatically centred and cropped to a circle
          </p>
          {error && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "6px" }}>{error}</p>}
        </div>
      )}

      {/* Footballer avatars */}
      {tab === "footballer" && (
        <div>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "12px" }}>
            Pick a footballer — each gets a unique illustrated avatar style.
          </p>

          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">All countries</option>
              {countries.map(c => {
                const code = TEAM_FLAGS[c];
                return <option key={c} value={c}>{code ? "" : ""}{c}</option>;
              })}
            </select>
          </div>

          {/* Player grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px", maxHeight: "360px", overflowY: "auto" }}>
            {allPlayers.map(({ name, country }) => {
              const isSelected = selectedFootballer === name;
              const code = TEAM_FLAGS[country];
              return (
                <button
                  key={`${country}-${name}`}
                  type="button"
                  onClick={() => onUpdate(`${FOOTBALLER_PREFIX}${name}`)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                    padding: "8px 4px", border: "2px solid",
                    borderColor: isSelected ? "var(--green)" : "var(--border)",
                    borderRadius: "10px",
                    background: isSelected ? "var(--green-light)" : "var(--surface)",
                    cursor: "pointer", transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {/* Illustrated avatar */}
                  <div style={{ position: "relative" }}>
                    <img
                      src={footballerAvatarUrl(name)}
                      alt={name}
                      width={52}
                      height={52}
                      style={{ borderRadius: "50%", border: `2px solid ${isSelected ? "var(--green)" : "var(--border)"}`, display: "block" }}
                    />
                    {/* Country flag badge */}
                    {code && (
                      <img
                        src={`https://flagcdn.com/w20/${code}.png`}
                        alt={country}
                        style={{ position: "absolute", bottom: 0, right: -2, width: 16, height: 11, borderRadius: 2, border: "1px solid white" }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: isSelected ? "var(--green)" : "var(--text-2)", textAlign: "center", lineHeight: 1.2, wordBreak: "break-word" }}>
                    {name.split(" ").pop()}
                  </span>
                  {isSelected && (
                    <div style={{ position: "absolute", top: 2, right: 4, width: 14, height: 14, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 700 }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          {allPlayers.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--text-3)", textAlign: "center", padding: "20px" }}>No players found</p>
          )}
        </div>
      )}

      {/* Emoji */}
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
    </div>
  );
}

// ── Reusable AvatarDisplay ────────────────────────────────
export function AvatarDisplay({ url, name, size = 36 }: { url: string; name: string; size?: number }) {
  const isEmoji = url?.startsWith("emoji:");
  const isFootballer = url?.startsWith("footballer:");
  const emojiChar = isEmoji ? url.replace("emoji:", "") : "";
  const footballerName = isFootballer ? url.replace("footballer:", "") : "";
  const isPhoto = url && !isEmoji && !isFootballer;

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

  if (isFootballer) {
    const seed = encodeURIComponent(footballerName.toLowerCase().replace(/\s+/g, "-"));
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", flexShrink: 0, background: "#f0f0f0" }}>
        <img
          src={avatarUrl}
          alt={footballerName}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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

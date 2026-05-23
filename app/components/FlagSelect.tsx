"use client";
import { useState, useRef, useEffect } from "react";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";

interface FlagSelectProps {
  label: string;
  value: string; // player name
  onChange: (player: string) => void;
}

export default function FlagSelect({ label, value, onChange }: FlagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Find which country the current player belongs to
  const currentCountry = value
    ? Object.entries(SQUADS).find(([, s]) => s.players.includes(value))?.[0] || ""
    : "";

  const flagUrl = (country: string) => {
    const code = TEAM_FLAGS[country];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  // Flat list of all players with country info, filtered by search
  const allPlayers = Object.entries(SQUADS).flatMap(([country, { players }]) =>
    players.map(name => ({ name, country }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filtered = search.trim()
    ? allPlayers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.country.toLowerCase().includes(search.toLowerCase())
      )
    : allPlayers;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (player: { name: string; country: string }) => {
    onChange(player.name);
    setOpen(false);
    setSearch("");
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label className="label">{label}</label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 12px",
          background: "var(--surface)",
          border: "1.5px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "14px",
          color: value ? "var(--text)" : "var(--text-3)",
          transition: "border-color 0.15s",
          borderColor: open ? "var(--green)" : undefined,
        }}
      >
        {value && currentCountry && flagUrl(currentCountry) && (
          <img src={flagUrl(currentCountry)!} alt={currentCountry} width={20} height={14} style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }} />
        )}
        <span style={{ flex: 1 }}>{value || "Select a player..."}</span>
        {value && (
          <span onClick={clear} style={{ color: "var(--text-3)", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}>×</span>
        )}
        <span style={{ color: "var(--text-3)", fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 100,
          background: "var(--surface)",
          border: "1.5px solid var(--green)",
          borderRadius: "var(--radius)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          marginTop: "4px",
          overflow: "hidden",
        }}>
          {/* Search */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search player or country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ margin: 0 }}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Player list */}
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px", fontSize: "13px", color: "var(--text-3)", textAlign: "center" }}>No players found</div>
            )}
            {filtered.map(p => {
              const flag = flagUrl(p.country);
              const isSelected = p.name === value;
              return (
                <button
                  key={`${p.country}-${p.name}`}
                  type="button"
                  onClick={() => select(p)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    background: isSelected ? "var(--green-light)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    color: "var(--text)",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "var(--bg)"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {flag
                    ? <img src={flag} alt={p.country} width={22} height={15} style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }} />
                    : <div style={{ width: 22, height: 15, background: "var(--border)", borderRadius: "2px", flexShrink: 0 }} />
                  }
                  <span style={{ flex: 1, fontWeight: isSelected ? 600 : 400 }}>{p.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{p.country}</span>
                  {isSelected && <span style={{ color: "var(--green)", fontSize: "12px" }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";

interface FlagSelectProps {
  label: string;
  value: string;
  onChange: (player: string) => void;
  disabled?: boolean;
}

export default function FlagSelect({ label, value, onChange, disabled = false }: FlagSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const currentCountry = value
    ? Object.entries(SQUADS).find(([, s]) => s.players.some(p => p.name === value))?.[0] || ""
    : "";

  const flagUrl = (country: string) => {
    const code = TEAM_FLAGS[country];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const allPlayers = Object.entries(SQUADS).flatMap(([country, { players }]) =>
    players.map(p => ({ name: p.name, country }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  const filtered = search.trim()
    ? allPlayers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.country.toLowerCase().includes(search.toLowerCase())
      )
    : allPlayers;

  // Is the current value a custom entry (not in squads)?
  const isCustom = value && !allPlayers.some(p => p.name === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (name: string) => {
    onChange(name);
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

      <button
        type="button"
        onClick={() => { if (disabled) return; setOpen(!open); setSearch(value && isCustom ? value : ""); }}
        disabled={disabled}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 12px", background: disabled ? "var(--surface2)" : "var(--surface)",
          border: "1.5px solid var(--border-strong)", borderRadius: "var(--radius)",
          cursor: disabled ? "not-allowed" : "pointer", textAlign: "left", fontSize: "14px",
          color: value ? "var(--text)" : "var(--text-3)",
          borderColor: open ? "var(--green)" : undefined,
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {value && currentCountry && flagUrl(currentCountry) && (
          <img src={flagUrl(currentCountry)!} alt={currentCountry} width={20} height={14} style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }} />
        )}
        {isCustom && <span style={{ fontSize: "12px" }}>✏️</span>}
        <span style={{ flex: 1 }}>{value || "Select a player..."}</span>
        {value && (
          <span onClick={clear} style={{ color: "var(--text-3)", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}>×</span>
        )}
        <span style={{ color: "var(--text-3)", fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--surface)", border: "1.5px solid var(--green)",
          borderRadius: "var(--radius)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          marginTop: "4px", overflow: "hidden",
        }}>
          {/* Search / custom entry input */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search or type a custom name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && search.trim()) select(search.trim()); }}
              style={{ margin: 0 }}
              onClick={e => e.stopPropagation()}
            />
          </div>

          {/* Custom entry option */}
          {search.trim() && !filtered.some(p => p.name.toLowerCase() === search.toLowerCase()) && (
            <button
              type="button"
              onClick={() => select(search.trim())}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", background: "var(--green-light)", border: "none",
                borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "left", fontSize: "13px",
              }}
            >
              <span style={{ fontSize: "14px" }}>✏️</span>
              <span style={{ flex: 1, fontWeight: 600 }}>Use "{search.trim()}"</span>
              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>custom entry</span>
            </button>
          )}

          {/* Player list */}
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px", fontSize: "13px", color: "var(--text-3)", textAlign: "center" }}>
                No players found — press Enter to use custom name
              </div>
            )}
            {filtered.map(p => {
              const flag = flagUrl(p.country);
              const isSelected = p.name === value;
              return (
                <button
                  key={`${p.country}-${p.name}`}
                  type="button"
                  onClick={() => select(p.name)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px",
                    background: isSelected ? "var(--green-light)" : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left", fontSize: "13px",
                    color: "var(--text)", borderBottom: "1px solid var(--border)",
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

"use client";
import { useState, useCallback, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";
const TRENDING_URL = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=24&rating=pg-13`;
const SEARCH_URL = (q: string) => `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`;

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string; width: string; height: string };
    original: { url: string };
    fixed_height: { url: string };
  };
}

interface Props {
  onSelect: (gifUrl: string, previewUrl: string) => void;
  onClose: () => void;
}

// Quick football search suggestions
const SUGGESTIONS = ["goal", "celebration", "tackle", "referee", "crying", "shock", "VAR", "penalty"];

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    if (!API_KEY) return;
    setLoading(true);
    try {
      const url = q.trim() ? SEARCH_URL(q) : TRENDING_URL;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
      setLoaded(true);
    } catch (e) {
      console.error("Giphy error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trending on first open
  const handleOpen = () => {
    if (!loaded) fetchGifs("");
  };

  // Debounced search
  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGifs(value), 400);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    fetchGifs(s);
    inputRef.current?.focus();
  };

  // On mount, load trending
  if (!loaded && API_KEY) handleOpen();

  if (!API_KEY) {
    return (
      <div className="card" style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
          Add NEXT_PUBLIC_GIPHY_API_KEY to Vercel env vars to enable GIFs
        </p>
        <button className="btn-secondary" onClick={onClose} style={{ marginTop: "12px", fontSize: "12px" }}>Close</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "12px", boxShadow: "var(--shadow-md)" }}>
      {/* Search bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="🔍 Search GIFs..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ flex: 1, fontSize: "13px" }}
          autoFocus
        />
        <button className="btn-ghost" onClick={onClose} style={{ fontSize: "13px", flexShrink: 0 }}>✕</button>
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
              border: "1px solid var(--border)", background: query === s ? "var(--green)" : "var(--surface2)",
              color: query === s ? "white" : "var(--text-2)", cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* GIF grid */}
      <div style={{ height: "260px", overflowY: "auto" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>
            Loading...
          </div>
        )}
        {!loading && gifs.length === 0 && loaded && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>
            No GIFs found
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
          {gifs.map(gif => {
            const preview = gif.images.fixed_height_small.url;
            const full = gif.images.fixed_height.url;
            return (
              <button
                key={gif.id}
                onClick={() => onSelect(full, preview)}
                style={{ padding: 0, border: "2px solid transparent", borderRadius: "6px", overflow: "hidden", cursor: "pointer", background: "var(--surface2)", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--green)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                title={gif.title}
              >
                <img
                  src={preview}
                  alt={gif.title}
                  style={{ width: "100%", height: "80px", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Powered by Giphy */}
      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <img src="https://developers.giphy.com/branch/master/static/header-logo-8974b2def85571a9b591edefde81400.gif"
          alt="Powered by GIPHY" height={14} style={{ opacity: 0.6 }} />
      </div>
    </div>
  );
}

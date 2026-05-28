"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";
const SUGGESTIONS = ["goal", "celebration", "tackle", "referee", "crying", "shock", "VAR", "penalty"];

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string };
    fixed_height: { url: string };
  };
}

interface Props {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    if (!API_KEY) return;
    setLoading(true);
    try {
      const url = q.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=24&rating=pg-13`;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      console.error("Giphy error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load trending on mount — in useEffect, NOT during render
  useEffect(() => {
    fetchGifs("");
  }, [fetchGifs]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGifs(value), 400);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    fetchGifs(s);
  };

  if (!API_KEY) {
    return (
      <div className="card" style={{ padding: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "10px" }}>
          Add <code>NEXT_PUBLIC_GIPHY_API_KEY</code> to Vercel env vars to enable GIFs.
        </p>
        <button className="btn-secondary" onClick={onClose} style={{ fontSize: "12px" }}>Close</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "12px" }}>
      {/* Search + close */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="🔍 Search GIFs..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ flex: 1, fontSize: "13px" }}
          autoFocus
        />
        <button onClick={onClose} style={{ fontSize: "18px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", lineHeight: 1, padding: "0 4px" }}>✕</button>
      </div>

      {/* Suggestion pills */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => handleSuggestion(s)} style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
            border: "1px solid var(--border)",
            background: query === s ? "var(--green)" : "var(--surface2)",
            color: query === s ? "white" : "var(--text-2)",
            cursor: "pointer",
          }}>
            {s}
          </button>
        ))}
      </div>

      {/* GIF grid */}
      <div style={{ height: "250px", overflowY: "auto" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>
            Loading...
          </div>
        )}
        {!loading && gifs.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>
            No GIFs found
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
          {gifs.map(gif => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.images.fixed_height.url)}
              style={{
                padding: 0, border: "2px solid transparent", borderRadius: "6px",
                overflow: "hidden", cursor: "pointer", background: "var(--surface2)",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--green)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
              title={gif.title}
            >
              <img
                src={gif.images.fixed_height_small.url}
                alt={gif.title}
                style={{ width: "100%", height: "78px", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Giphy attribution (required by terms) */}
      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>Powered by GIPHY</span>
      </div>
    </div>
  );
}

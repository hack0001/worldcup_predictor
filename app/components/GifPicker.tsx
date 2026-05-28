"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// Klipy — free GIF API, built by ex-Tenor team, used by WhatsApp & Discord
// Get a free key at: klipy.co/developers
const API_KEY = process.env.NEXT_PUBLIC_KLIPY_API_KEY || "";
const SUGGESTIONS = ["goal", "celebration", "tackle", "offside", "crying", "shock", "VAR", "penalty"];

interface KlipyGif {
  id: number;
  title?: string;
  file: {
    hd: { gif: { url: string } };
    sm: { gif: { url: string } };
    xs: { gif: { url: string } };
  };
}

interface Props {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export default function GifPicker({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<KlipyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGifs = useCallback(async (q: string) => {
    if (!API_KEY) return;
    setLoading(true);
    try {
      const base = `https://api.klipy.com/api/v1/${API_KEY}/gifs`;
      const url = q.trim()
        ? `${base}/search?q=${encodeURIComponent(q)}&limit=24`
        : `${base}/trending?limit=24`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Klipy: { result: true, data: { data: [...gifs] } }
      setGifs(json?.data?.data || []);
    } catch (e) {
      console.error("Klipy error:", e);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGifs(""); }, [fetchGifs]);

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
        <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "8px" }}>
          GIFs need an API key. Get a free one at <strong>klipy.co/developers</strong> then add <code>NEXT_PUBLIC_KLIPY_API_KEY</code> to Vercel.
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

      {/* Suggestions */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px" }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => handleSuggestion(s)} style={{
            fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
            border: "1px solid var(--border)",
            background: query === s ? "var(--green)" : "var(--surface2)",
            color: query === s ? "white" : "var(--text-2)",
            cursor: "pointer",
          }}>{s}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ height: "250px", overflowY: "auto" }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>Loading...</div>
        )}
        {!loading && gifs.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)", fontSize: "13px" }}>No GIFs found</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
          {gifs.map((gif) => {
            const previewUrl = gif.file?.sm?.gif?.url || gif.file?.xs?.gif?.url || "";
            const fullUrl = gif.file?.hd?.gif?.url || previewUrl;
            if (!previewUrl) return null;
            return (
              <button
                key={gif.id}
                onClick={() => onSelect(fullUrl)}
                style={{ padding: 0, border: "2px solid transparent", borderRadius: "6px", overflow: "hidden", cursor: "pointer", background: "var(--surface2)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--green)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                title={gif.title || "GIF"}
              >
                <img
                  src={previewUrl}
                  alt={gif.title || "GIF"}
                  style={{ width: "100%", height: "78px", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>Powered by Klipy</span>
      </div>
    </div>
  );
}

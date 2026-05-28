"use client";
import { useState, useMemo } from "react";

// Full emoji dataset by category
const EMOJI_DATA: Record<string, string[]> = {
  "⚽ Football": ["⚽","🥅","🏆","🥇","🥈","🥉","🎽","👟","🧤","🏅","🎯","📣","🔥","💥","✨","⚡","🌟","💫","🎉","🎊"],
  "😀 Faces": ["😀","😁","😂","🤣","😃","😄","😅","😆","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🫣","🤗","🫡","🤔","🫢","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾"],
  "👍 Gestures": ["👍","👎","👏","🙌","🤝","🤜","🤛","✊","👊","🤞","✌️","🤟","🤘","👌","🤌","🤏","👈","👉","👆","👇","☝️","👋","🤚","🖐️","✋","🖖","💪","🦾","🦿","🙏","🤲","👐","🤷","🤦","🙋","🙆","🙅","🙎","🙍","💁","😤","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝"],
  "🎭 Reactions": ["😂","🤣","😭","😱","😮","🤯","🥹","😮‍💨","🤦","🤷","👀","💀","🫠","😤","😤","🤌","💯","🔥","💥","❄️","🌊","💨","🌈","⭐","🌙","☀️","🌝","😎","🤓","🥸","🫡","🫵","🫶"],
  "🐾 Animals": ["⚽","🦁","🐯","🐻","🦊","🐺","🦅","🐧","🦋","🐝","🦄","🐉","🦖","🦕","🐊","🐢","🦎","🐍","🦕","🐸","🦀","🦞","🦐","🦑","🐙","🦈","🐬","🐳","🦭","🐧","🦜"],
  "🏃 Sports": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎿","🛷","🏹","🎣","🤿","🎽","🎯","🏋️","🤼","🤸","🤺","🏇","⛷️","🏂","🏄","🚵","🚴","🏊","🤽","🧗","🏌️","🏇","🤾","⛹️","🏋️","🤼","🤸","🏆","🥇","🥈","🥉","🎖️","🏅"],
  "🎪 Objects": ["💬","💭","🗯️","📢","📣","🔔","🔕","🎵","🎶","🎤","🎧","🎼","🎹","🎸","🎷","🎺","🎻","🥁","🪘","📱","💻","⌨️","🖥️","🖨️","🖱️","🖲️","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🧭","⏱️","⏰","📡"],
};

const ALL_EMOJIS = Object.values(EMOJI_DATA).flat();
const CATEGORY_NAMES = Object.keys(EMOJI_DATA);

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORY_NAMES[0]);

  const filtered = useMemo(() => {
    if (!search.trim()) return null; // null = show categories
    // Simple search — filter emojis that appear in category names matching query
    const q = search.toLowerCase();
    const results: string[] = [];
    for (const [cat, emojis] of Object.entries(EMOJI_DATA)) {
      if (cat.toLowerCase().includes(q)) {
        results.push(...emojis);
      }
    }
    // Also include any exact emoji matches
    ALL_EMOJIS.forEach(e => { if (!results.includes(e)) results.push(e); });
    return results;
  }, [search]);

  const displayEmojis = filtered || EMOJI_DATA[activeCategory] || [];

  return (
    <div className="card" style={{ padding: "10px", width: "280px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="text"
          placeholder="🔍 Search emoji..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, fontSize: "12px", padding: "6px 10px" }}
          autoFocus
        />
        <button onClick={onClose} style={{ fontSize: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", lineHeight: 1, padding: "0 4px" }}>✕</button>
      </div>

      {/* Category tabs */}
      {!search && (
        <div style={{ display: "flex", gap: "2px", overflowX: "auto", marginBottom: "8px", paddingBottom: "2px" }}>
          {CATEGORY_NAMES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: "16px", padding: "4px 6px", borderRadius: "6px", flexShrink: 0,
                border: "1px solid",
                borderColor: activeCategory === cat ? "var(--green)" : "transparent",
                background: activeCategory === cat ? "var(--green-light)" : "transparent",
                cursor: "pointer",
              }}
              title={cat}
            >
              {cat.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px", maxHeight: "200px", overflowY: "auto" }}>
        {displayEmojis.slice(0, 120).map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => onSelect(emoji)}
            style={{
              fontSize: "20px", padding: "4px", borderRadius: "6px", lineHeight: 1,
              border: "none", background: "transparent", cursor: "pointer",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

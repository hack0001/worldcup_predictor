"use client";
import { useState, useEffect } from "react";
import { fetchTeamForm, TeamForm } from "@/lib/footballApi";

const RESULT_COLORS = {
  W: { bg: "#16a34a", text: "white" },
  D: { bg: "#ca8a04", text: "white" },
  L: { bg: "#dc2626", text: "white" },
};

interface Props {
  teamName: string;
  inline?: boolean; // compact mode for match cards
}

export default function TeamFormBadge({ teamName, inline = false }: Props) {
  const [form, setForm] = useState<TeamForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchTeamForm(teamName).then(result => {
      if (cancelled) return;
      setForm(result);
      setLoading(false);
      if (!result) setError(true);
    });
    return () => { cancelled = true; };
  }, [teamName]);

  if (loading) {
    return (
      <div style={{ display: "flex", gap: "3px" }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ width: inline ? 16 : 20, height: inline ? 16 : 20, borderRadius: "3px", background: "var(--border)", animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (error || !form || form.last5.length === 0) {
    return <span style={{ fontSize: "10px", color: "var(--text-3)" }}>No form data</span>;
  }

  return (
    <div>
      {/* W/D/L badges row */}
      <div
        style={{ display: "flex", gap: "3px", cursor: "pointer", alignItems: "center" }}
        onClick={() => setExpanded(!expanded)}
        title={`${teamName} recent form — click to expand`}
      >
        {form.last5.map((m, i) => (
          <div
            key={i}
            style={{
              width: inline ? 16 : 20,
              height: inline ? 16 : 20,
              borderRadius: "3px",
              background: RESULT_COLORS[m.result].bg,
              color: RESULT_COLORS[m.result].text,
              fontSize: inline ? 8 : 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            title={`${m.result} ${m.goalsFor}–${m.goalsAgainst} vs ${m.opponent}`}
          >
            {m.result}
          </div>
        ))}
        <span style={{ fontSize: "10px", color: "var(--text-3)", marginLeft: "2px" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          marginTop: "8px",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          overflow: "hidden",
          fontSize: "11px",
        }}>
          {form.last5.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                borderBottom: i < form.last5.length - 1 ? "1px solid var(--border)" : undefined,
              }}
            >
              {/* Result badge */}
              <span style={{
                width: 18, height: 18, borderRadius: "3px",
                background: RESULT_COLORS[m.result].bg,
                color: RESULT_COLORS[m.result].text,
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {m.result}
              </span>

              {/* Score */}
              <span style={{ fontWeight: 700, minWidth: "32px" }}>
                {m.goalsFor}–{m.goalsAgainst}
              </span>

              {/* H/A indicator */}
              <span style={{ color: "var(--text-3)", fontSize: "10px", minWidth: "12px" }}>
                {m.homeAway}
              </span>

              {/* Opponent */}
              <span style={{ flex: 1, color: "var(--text-2)" }}>
                vs {m.opponent}
              </span>

              {/* Competition + date */}
              <span style={{ color: "var(--text-3)", fontSize: "10px", textAlign: "right", flexShrink: 0 }}>
                {m.competition.length > 15 ? m.competition.slice(0, 15) + "…" : m.competition}
                <br />
                {m.date}
              </span>
            </div>
          ))}
          <div style={{ padding: "5px 10px", background: "var(--bg)", fontSize: "10px", color: "var(--text-3)", textAlign: "right" }}>
            Last updated: {new Date(form.updatedAt).toLocaleDateString("en-GB")}
          </div>
        </div>
      )}
    </div>
  );
}

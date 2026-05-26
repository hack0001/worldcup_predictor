"use client";
import { useState, useEffect } from "react";
import { GROUPS } from "@/app/data/worldcup";
import Flag from "./Flag";
import { getAllTeamForms, TeamForm, FormMatch } from "@/lib/footballApi";

const RESULT_COLORS: Record<string, { bg: string; text: string }> = {
  W: { bg: "#16a34a", text: "white" },
  D: { bg: "#ca8a04", text: "white" },
  L: { bg: "#dc2626", text: "white" },
};

function FormDetail({ form }: { form: TeamForm }) {
  const [expanded, setExpanded] = useState(false);

  if (!form.last5 || form.last5.length === 0) {
    return <span style={{ fontSize: "11px", color: "var(--text-3)" }}>No form entered yet</span>;
  }

  return (
    <div>
      <div
        style={{ display: "flex", gap: "3px", cursor: "pointer", alignItems: "center" }}
        onClick={() => setExpanded(!expanded)}
      >
        {form.last5.map((m: FormMatch, i: number) => (
          <div
            key={i}
            title={`${m.result} ${m.goalsFor}–${m.goalsAgainst} vs ${m.opponent}`}
            style={{
              width: 24, height: 24, borderRadius: "4px",
              background: RESULT_COLORS[m.result]?.bg || "#999",
              color: RESULT_COLORS[m.result]?.text || "white",
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {m.result}
          </div>
        ))}
        <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "4px" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: "8px", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", fontSize: "12px" }}>
          {form.last5.map((m: FormMatch, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderBottom: i < form.last5.length - 1 ? "1px solid var(--border)" : undefined, background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)" }}>
              <span style={{ width: 20, height: 20, borderRadius: "3px", background: RESULT_COLORS[m.result]?.bg, color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {m.result}
              </span>
              <span style={{ fontWeight: 700, minWidth: "36px" }}>{m.goalsFor}–{m.goalsAgainst}</span>
              <span style={{ fontSize: "10px", color: "var(--text-3)", minWidth: "14px" }}>{m.homeAway}</span>
              <span style={{ flex: 1 }}>vs {m.opponent}</span>
              <span style={{ fontSize: "10px", color: "var(--text-3)", textAlign: "right" }}>
                {m.competition && <span>{m.competition}<br /></span>}
                {m.date}
              </span>
            </div>
          ))}
          <div style={{ padding: "5px 12px", background: "var(--bg)", fontSize: "10px", color: "var(--text-3)", textAlign: "right" }}>
            Updated {new Date(form.updatedAt).toLocaleDateString("en-GB")}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamInfo() {
  const [activeGroup, setActiveGroup] = useState("A");
  const [forms, setForms] = useState<Record<string, TeamForm>>({});
  const [loading, setLoading] = useState(true);
  const groupKeys = Object.keys(GROUPS);

  useEffect(() => {
    getAllTeamForms().then(data => {
      setForms(data);
      setLoading(false);
    });
  }, []);

  const teams = GROUPS[activeGroup] || [];

  return (
    <div>
      <div className="card" style={{ padding: "12px 16px", marginBottom: "16px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <p style={{ fontSize: "13px", color: "#166534" }}>
          Recent form for each team, entered by the admin. Click the W/D/L badges to see match details.
        </p>
      </div>

      {/* Group selector */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
        {groupKeys.map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              width: "40px", height: "40px", borderRadius: "8px",
              border: "1.5px solid",
              borderColor: activeGroup === g ? "var(--green)" : "var(--border)",
              background: activeGroup === g ? "var(--green)" : "var(--surface)",
              color: activeGroup === g ? "white" : "var(--text)",
              fontWeight: 700, fontSize: "14px", cursor: "pointer",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "28px", height: "28px", background: "var(--green)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700 }}>
          {activeGroup}
        </div>
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Group {activeGroup} — Recent Form</span>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Loading form data...</div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {teams.map(team => (
            <div key={team.team} className="card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <Flag country={team.team} size={24} />
                <span style={{ fontWeight: 700, fontSize: "15px" }}>{team.team}</span>
              </div>
              <FormDetail form={forms[team.team] || { teamName: team.team, last5: [], updatedAt: "" }} />
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        <button className="btn-secondary" onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) - 1])} disabled={activeGroup === groupKeys[0]} style={{ fontSize: "13px", padding: "7px 14px" }}>
          ← Group {groupKeys[groupKeys.indexOf(activeGroup) - 1]}
        </button>
        <button className="btn-secondary" onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) + 1])} disabled={activeGroup === groupKeys[groupKeys.length - 1]} style={{ fontSize: "13px", padding: "7px 14px" }}>
          Group {groupKeys[groupKeys.indexOf(activeGroup) + 1]} →
        </button>
      </div>
    </div>
  );
}

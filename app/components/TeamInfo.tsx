"use client";
import { useState } from "react";
import { GROUPS } from "@/app/data/worldcup";
import Flag from "./Flag";
import TeamFormBadge from "./TeamFormBadge";

export default function TeamInfo() {
  const [activeGroup, setActiveGroup] = useState("A");
  const groupKeys = Object.keys(GROUPS);
  const teams = GROUPS[activeGroup] || [];

  return (
    <div>
      <div className="card" style={{ padding: "12px 16px", marginBottom: "16px", background: "#fffbeb", borderColor: "#fde68a" }}>
        <p style={{ fontSize: "13px", color: "#92400e" }}>
          🔴 Form data is pulled live from API-Football. Click any team's form badges to see match details. Data refreshes every 6 hours.
        </p>
      </div>

      {/* Group tabs */}
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

      {/* Group header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "28px", height: "28px", background: "var(--green)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700 }}>
          {activeGroup}
        </div>
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Group {activeGroup} Teams</span>
      </div>

      {/* Team cards */}
      <div style={{ display: "grid", gap: "10px" }}>
        {teams.map(team => (
          <div key={team.team} className="card" style={{ padding: "16px 18px" }}>
            {/* Team header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Flag country={team.team} size={28} />
              <span style={{ fontWeight: 700, fontSize: "16px" }}>{team.team}</span>
            </div>

            {/* Form */}
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                Recent Form
              </p>
              <TeamFormBadge teamName={team.team} />
            </div>
          </div>
        ))}
      </div>

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

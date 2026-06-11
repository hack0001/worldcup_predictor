"use client";
import { useState, useEffect } from "react";
import { Player } from "@/app/data/types";
import { supabase } from "@/lib/supabase";
import { AvatarDisplay } from "./AvatarPicker";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number; // index of correct answer
  emoji: string;
  trivia?: string;
  imageUrl?: string; // optional image shown with question
  resultImageUrl?: string; // optional image shown after answering (meme/reaction)
}

const QUESTIONS: Question[] = [
  { id: "q1", emoji: "🏆", question: "How many times has Brazil won the World Cup?", options: ["4", "5", "6", "3"], answer: 1, trivia: "Brazil are the only team to have played in every World Cup — 22 tournaments!" },
  { id: "q2", emoji: "⚽", question: "Who scored the fastest goal in World Cup history?", options: ["Ronaldo", "Hakan Şükür", "Pelé", "Mbappe"], answer: 1, trivia: "Hakan Şükür scored after just 11 seconds for Turkey vs South Korea in 2002!", imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop" },
  { id: "q3", emoji: "🌍", question: "Which country is hosting the 2026 World Cup?", options: ["Brazil & Argentina", "USA, Canada & Mexico", "USA only", "Qatar & UAE"], answer: 1, trivia: "48 teams for the first time ever — up from 32!" },
  { id: "q4", emoji: "🥅", question: "Who holds the record for most goals in World Cup history?", options: ["Ronaldo", "Messi", "Miroslav Klose", "Pelé"], answer: 2, trivia: "Miroslav Klose scored 16 goals across four World Cups for Germany.", imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop" },
  { id: "q5", emoji: "🎯", question: "Which goalkeeper famously saved a penalty with his face?", options: ["Peter Schmeichel", "Manuel Neuer", "René Higuita", "Tim Howard"], answer: 0, trivia: "Peter Schmeichel had an extraordinary career — he also scored 11 career goals!" },
  { id: "q6", emoji: "😂", question: "In 2002, which massive nation was knocked out by Senegal in the first round?", options: ["Brazil", "France", "Germany", "Italy"], answer: 1, trivia: "The reigning champions France went out in the group stage without scoring a single goal!" },
  { id: "q7", emoji: "🦁", question: "How many times has England won the World Cup?", options: ["Never", "Once — 1966", "Twice", "Three times"], answer: 1, trivia: "England won on home soil at Wembley, beating West Germany 4-2 after extra time." },
  { id: "q8", emoji: "🐙", question: "Which unlikely 'psychic' animal correctly predicted 8/8 matches at the 2010 World Cup?", options: ["A parrot", "A dog", "Paul the Octopus", "A pig"], answer: 2, trivia: "Paul the Octopus achieved worldwide fame — even predicting Spain would beat the Netherlands in the final!", imageUrl: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=400&h=300&fit=crop" },
  { id: "q9", emoji: "📺", question: "The 2026 World Cup expands to how many teams?", options: ["32", "40", "48", "64"], answer: 2, trivia: "This means 104 matches in total — up from 64 in previous tournaments." },
  { id: "q10", emoji: "👟", question: "Who won the Golden Boot at the 2018 World Cup?", options: ["Harry Kane", "Kylian Mbappé", "Antoine Griezmann", "Romelu Lukaku"], answer: 0, trivia: "Harry Kane scored 6 goals, including two hat-tricks. Four of those goals came from penalties.", imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop" },
  { id: "q11", emoji: "🎪", question: "Which city will host the 2026 World Cup Final?", options: ["New York / New Jersey", "Los Angeles", "Mexico City", "Toronto"], answer: 0, trivia: "MetLife Stadium in New Jersey will host the final — it holds over 82,000 fans." },
  { id: "q12", emoji: "😬", question: "Who missed the decisive penalty in England's Euro 2020 final shootout?", options: ["Marcus Rashford", "Bukayo Saka", "Jadon Sancho", "All three"], answer: 3, trivia: "Rashford, Sancho and Saka all missed. Saka was just 19 years old at the time." },
  { id: "q13", emoji: "🌟", question: "How old was Pelé when he first won the World Cup?", options: ["21", "19", "17", "23"], answer: 2, trivia: "Pelé is still the youngest player to win a World Cup — he was 17 years and 249 days old in 1958.", imageUrl: "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=400&h=300&fit=crop" },
  { id: "q14", emoji: "🤔", question: "Which nation has won the most World Cups combined?", options: ["Brazil", "Germany", "Italy", "Brazil, Germany & Italy are tied"], answer: 0, trivia: "Brazil have 5, Germany 4, Italy 4. No other team has more than 3." },
  { id: "q15", emoji: "🎭", question: "The infamous 'Hand of God' goal was scored by Maradona against which team?", options: ["Brazil", "England", "Germany", "Italy"], answer: 1, trivia: "Maradona scored twice that game — the cheating handball AND what many call the greatest goal ever.", imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=300&fit=crop" },
  { id: "q16", emoji: "📊", question: "In 2026 how many group stage matches will there be in total?", options: ["48", "72", "96", "104"], answer: 1, trivia: "12 groups of 4 teams = 72 group matches. Then 32+16+8+4+2+1 = 32 knockout matches = 104 total." },
  { id: "q17", emoji: "🧊", question: "Iceland became the smallest nation to ever reach a World Cup when they qualified for which tournament?", options: ["2014", "2018", "2022", "2010"], answer: 1, trivia: "With a population of just 334,000 — smaller than most cities — Iceland reached the Round of 16 at Russia 2018." },
  { id: "q18", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", question: "Scotland are in the 2026 World Cup — when did they last qualify for a World Cup?", options: ["1994", "1998", "2002", "2006"], answer: 1, trivia: "Scotland last qualified for France 1998, where they were knocked out in the group stage." },
  { id: "q19", emoji: "🤦", question: "Who infamously scored an OWN GOAL in the opening match of the 2014 World Cup?", options: ["David Luiz", "Marcelo", "Thiago Silva", "Dante"], answer: 1, trivia: "Marcelo's 11th-minute own goal was the first in a World Cup opening match. Brazil still won 3-1." },
  { id: "q20", emoji: "🔮", question: "How many goals did Eusébio score at the 1966 World Cup, making him top scorer?", options: ["7", "8", "9", "6"], answer: 2, trivia: "Eusébio scored 9 goals including 4 in one game against North Korea when Portugal came back from 3-0 down!" },
];

interface QuizAnswer {
  questionId: string;
  playerId: string;
  playerName: string;
  optionIndex: number;
  correct: boolean;
}

interface Props {
  player: Player;
  allPlayers: Player[];
}

export default function WorldCupQuiz({ player, allPlayers }: Props) {
  const [answers, setAnswers] = useState<Record<string, QuizAnswer[]>>({}); // questionId -> all answers
  const [myAnswers, setMyAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);

  const playerMap = Object.fromEntries(allPlayers.map(p => [p.id, p]));

  useEffect(() => {
    // Load all quiz answers from DB
    supabase.from("quiz_answers").select("*").then(({ data }) => {
      const grouped: Record<string, QuizAnswer[]> = {};
      const mine: Record<string, number> = {};
      (data || []).forEach((row: Record<string, unknown>) => {
        const a: QuizAnswer = { questionId: row.question_id as string, playerId: row.player_id as string, playerName: row.player_name as string, optionIndex: row.option_index as number, correct: row.correct as boolean };
        if (!grouped[a.questionId]) grouped[a.questionId] = [];
        grouped[a.questionId].push(a);
        if (a.playerId === player.id) mine[a.questionId] = a.optionIndex;
      });
      setAnswers(grouped);
      setMyAnswers(mine);
      setLoading(false);
    });
  }, [player.id]);

  const submitAnswer = async (q: Question, optionIndex: number) => {
    if (myAnswers[q.id] !== undefined) return; // already answered
    const correct = optionIndex === q.answer;
    const answer: QuizAnswer = { questionId: q.id, playerId: player.id, playerName: player.name, optionIndex, correct };

    // Save to DB
    await supabase.from("quiz_answers").upsert({
      question_id: q.id, player_id: player.id, player_name: player.name,
      option_index: optionIndex, correct,
    });

    setMyAnswers(prev => ({ ...prev, [q.id]: optionIndex }));
    setAnswers(prev => {
      const existing = (prev[q.id] || []).filter(a => a.playerId !== player.id);
      return { ...prev, [q.id]: [...existing, answer] };
    });
    setRevealed(prev => ({ ...prev, [q.id]: true }));
  };

  const score = QUESTIONS.filter(q => myAnswers[q.id] === q.answer).length;
  const answered = Object.keys(myAnswers).length;

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Loading quiz...</div>;

  const q = QUESTIONS[currentQ];
  const myAnswer = myAnswers[q.id];
  const hasAnswered = myAnswer !== undefined;
  const qAnswers = answers[q.id] || [];
  const totalVotes = qAnswers.length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 800 }}>🧠 World Cup Quiz</h2>
          <span style={{ fontWeight: 700, fontSize: "14px", color: answered === 20 ? "var(--green)" : "var(--text-2)" }}>
            {answered}/20 answered · {score} correct
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ background: "var(--border)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
          <div style={{ background: "var(--green)", height: "100%", width: `${(answered / 20) * 100}%`, borderRadius: "99px", transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Question nav dots */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
        {QUESTIONS.map((q, i) => {
          const done = myAnswers[q.id] !== undefined;
          const correct = myAnswers[q.id] === q.answer;
          return (
            <button key={q.id} type="button" onClick={() => setCurrentQ(i)} style={{
              width: 28, height: 28, borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
              background: i === currentQ ? "var(--green)" : done ? (correct ? "#bbf7d0" : "#fecaca") : "var(--surface2)",
              color: i === currentQ ? "white" : done ? (correct ? "#166534" : "#991b1b") : "var(--text-3)",
            }}>{i + 1}</button>
          );
        })}
      </div>

      {/* Current question */}
      <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "28px", flexShrink: 0 }}>{q.emoji}</span>
          <div>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 600 }}>QUESTION {currentQ + 1} OF 20</p>
            <p style={{ fontWeight: 700, fontSize: "15px", lineHeight: 1.4 }}>{q.question}</p>
          </div>
        </div>

        {/* Question image */}
        {q.imageUrl && (
          <div style={{ marginBottom: "14px", borderRadius: "8px", overflow: "hidden", maxHeight: "180px", display: "flex", justifyContent: "center", background: "var(--surface2)" }}>
            <img src={q.imageUrl} alt="" style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        <div style={{ display: "grid", gap: "8px" }}>
          {q.options.map((option, i) => {
            const votes = qAnswers.filter(a => a.optionIndex === i).length;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const isMyPick = myAnswer === i;
            const isCorrect = i === q.answer;
            const showResult = hasAnswered;

            let bg = "var(--surface)";
            let border = "var(--border)";
            let textColor = "var(--text)";
            if (showResult && isCorrect) { bg = "#dcfce7"; border = "#22c55e"; textColor = "#166534"; }
            else if (showResult && isMyPick && !isCorrect) { bg = "#fee2e2"; border = "#ef4444"; textColor = "#991b1b"; }
            else if (!showResult && isMyPick) { bg = "var(--green-light)"; border = "var(--green)"; }

            return (
              <button key={i} type="button" onClick={() => submitAnswer(q, i)} disabled={hasAnswered} style={{ position: "relative", overflow: "hidden", padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${border}`, background: bg, cursor: hasAnswered ? "default" : "pointer", textAlign: "left", width: "100%" }}>
                {showResult && (
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isCorrect ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.04)", transition: "width 0.5s ease" }} />
                )}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: isMyPick || (showResult && isCorrect) ? 700 : 400, color: textColor, flex: 1 }}>
                    {isMyPick && "→ "}{option}
                  </span>
                  {showResult && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                      {isCorrect && <span style={{ fontSize: "12px" }}>✅</span>}
                      {isMyPick && !isCorrect && <span style={{ fontSize: "12px" }}>❌</span>}
                      <span style={{ fontSize: "12px", fontWeight: 700, color: textColor }}>{pct}%</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result image / meme */}
        {hasAnswered && q.resultImageUrl && (
          <div style={{ marginTop: "10px", borderRadius: "8px", overflow: "hidden" }}>
            <img src={q.resultImageUrl} alt="" style={{ width: "100%", maxHeight: "160px", objectFit: "cover" }} loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        {/* Trivia reveal */}
        {hasAnswered && q.trivia && (
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--green-light)", borderRadius: "8px", borderLeft: "3px solid var(--green)" }}>
            <p style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600, marginBottom: "2px" }}>💡 Did you know?</p>
            <p style={{ fontSize: "13px", color: "#166534" }}>{q.trivia}</p>
          </div>
        )}

        {/* Who said what */}
        {hasAnswered && totalVotes > 0 && (
          <div style={{ marginTop: "12px" }}>
            <p style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, marginBottom: "6px" }}>{totalVotes} player{totalVotes !== 1 ? "s" : ""} answered</p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {qAnswers.map(a => {
                const p = playerMap[a.playerId];
                return (
                  <div key={a.playerId} title={`${a.playerName}: ${q.options[a.optionIndex]}`} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <AvatarDisplay url={p?.avatarUrl || ""} name={a.playerName} size={22} />
                    <span style={{ fontSize: "9px", color: a.correct ? "var(--green)" : "#ef4444" }}>{a.correct ? "✓" : "✗"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
        <button type="button" className="btn-secondary" onClick={() => setCurrentQ(i => Math.max(0, i - 1))} disabled={currentQ === 0} style={{ flex: 1, justifyContent: "center" }}>← Prev</button>
        <button type="button" className="btn-primary" onClick={() => setCurrentQ(i => Math.min(19, i + 1))} disabled={currentQ === 19} style={{ flex: 1, justifyContent: "center" }}>Next →</button>
      </div>

      {/* Final score if all done */}
      {answered === 20 && (
        <div className="card" style={{ marginTop: "16px", padding: "20px", textAlign: "center", borderColor: "var(--green)" }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>{score >= 16 ? "🏆" : score >= 12 ? "⭐" : score >= 8 ? "😅" : "🤦"}</p>
          <p style={{ fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>{score}/20</p>
          <p style={{ color: "var(--text-2)", fontSize: "13px" }}>
            {score >= 16 ? "World Cup encyclopedia!" : score >= 12 ? "Solid football knowledge!" : score >= 8 ? "Room to improve..." : "Maybe stick to watching?"}
          </p>
        </div>
      )}

      {/* Quiz Leaderboard — show once at least one person has answered something */}
      {(() => {
        // Build per-player scores from all answers
        const playerScores: Record<string, { name: string; playerId: string; correct: number; total: number }> = {};
        Object.values(answers).flat().forEach(a => {
          if (!playerScores[a.playerId]) playerScores[a.playerId] = { name: a.playerName, playerId: a.playerId, correct: 0, total: 0 };
          playerScores[a.playerId].total++;
          if (a.correct) playerScores[a.playerId].correct++;
        });
        const ranked = Object.values(playerScores).sort((a, b) => b.correct - a.correct || b.total - a.total);
        if (!ranked.length) return null;
        const medals = ["🥇", "🥈", "🥉"];
        return (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>📊 Quiz Leaderboard</p>
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 60px 60px 60px", gap: "0", padding: "8px 14px", background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>#</span>
                <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>Player</span>
                <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>✅ Right</span>
                <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>Answered</span>
                <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>Score</span>
              </div>
              {ranked.map((p, idx) => {
                const isMe = p.playerId === player.id;
                const pct = Math.round((p.correct / 20) * 100);
                const pp = playerMap[p.playerId];
                return (
                  <div key={p.playerId} style={{ display: "grid", gridTemplateColumns: "32px 1fr 60px 60px 60px", gap: "0", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: isMe ? "var(--green-light)" : "transparent", alignItems: "center" }}>
                    <span style={{ fontSize: "14px" }}>{medals[idx] || idx + 1}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                      <AvatarDisplay url={pp?.avatarUrl || ""} name={p.name} size={26} />
                      <span style={{ fontSize: "13px", fontWeight: isMe ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}{isMe && " (you)"}</span>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--green)", textAlign: "center" }}>{p.correct}</span>
                    <span style={{ fontSize: "13px", color: "var(--text-2)", textAlign: "center" }}>{p.total}/20</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, textAlign: "center", color: pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--text)" : "var(--red)" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

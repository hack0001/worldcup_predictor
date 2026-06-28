"use client";
import { useState, useEffect, useRef } from "react";
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
  { id: "q2_1", emoji: "🏆", question: "Which country has been eliminated from the most World Cup penalty shootouts?", options: ["England", "Italy", "Argentina", "France"], answer: 0, trivia: "England have lost 7 of their 10 World Cup penalty shootouts, earning the nickname 'Three Lions, no bottle'.", imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=280&fit=crop" },
  { id: "q2_2", emoji: "⚡", question: "Who scored the famous golden goal to knock Italy out of Euro 2000?", options: ["Thierry Henry", "David Trezeguet", "Zinedine Zidane", "Patrick Vieira"], answer: 1, trivia: "Trezeguet's golden goal in extra time sealed France's 2-1 win in the final — it was the last golden goal in a major tournament." },
  { id: "q2_3", emoji: "😱", question: "In which year did Germany beat Brazil 7-1 in the World Cup semi-final?", options: ["2010", "2014", "2018", "2006"], answer: 1, trivia: "The Mineirazo: Brazil conceded five goals in 18 minutes on home soil. The stadium fell silent. It remains the biggest shock in World Cup history.", imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=280&fit=crop" },
  { id: "q2_4", emoji: "🎯", question: "Which player is the only person to score in every single round of one World Cup?", options: ["Ronaldo (2002)", "Kylian Mbappé (2018)", "Just Fontaine (1958)", "Miroslav Klose (2006)"], answer: 2, trivia: "Just Fontaine scored 13 goals at the 1958 World Cup — still the record for a single tournament. He also scored in every round." },
  { id: "q2_5", emoji: "🏅", question: "Which country won the very first World Cup in 1930?", options: ["Brazil", "Argentina", "Uruguay", "Italy"], answer: 2, trivia: "Uruguay hosted and won the inaugural World Cup, beating Argentina 4-2 in the final in Montevideo.", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=280&fit=crop" },
  { id: "q2_6", emoji: "🇦🇷", question: "Who scored the winning penalty for Argentina in the 2022 World Cup final shootout against France?", options: ["Lionel Messi", "Gonzalo Montiel", "Ángel Di María", "Lautaro Martínez"], answer: 1, trivia: "Gonzalo Montiel converted the decisive spot kick. Argentina won 4-2 on penalties after a jaw-dropping 3-3 draw." },
  { id: "q2_7", emoji: "🔢", question: "How many teams play in the 2026 World Cup Round of 32?", options: ["16", "32", "24", "48"], answer: 1, trivia: "32 teams advance from the group stage — the top two from all 12 groups plus the 8 best third-placed teams." },
  { id: "q2_8", emoji: "🧤", question: "Which goalkeeper saved the most penalties at a single World Cup tournament (2014)?", options: ["Manuel Neuer", "Tim Howard", "Keylor Navas", "Julio Cesar"], answer: 2, trivia: "Costa Rica's Keylor Navas was sensational in 2014, saving penalties in their shootout victory over Greece in the Round of 16.", imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=280&fit=crop" },
  { id: "q2_9", emoji: "🤝", question: "Which country has reached 4 World Cup semi-finals but never won the tournament?", options: ["Poland", "Portugal", "Sweden", "Netherlands"], answer: 3, trivia: "The Netherlands have reached the final three times (1974, 1978, 2010) and the semis in 2014 — without ever lifting the trophy." },
  { id: "q2_10", emoji: "🇮🇹", question: "Who did Italy beat on penalties in the 2006 World Cup final?", options: ["Germany", "France", "Brazil", "Portugal"], answer: 1, trivia: "Italy beat France 5-3 on penalties after a 1-1 draw. The match was defined by Zidane's infamous headbutt on Materazzi.", imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=280&fit=crop" },
  { id: "q2_11", emoji: "🌍", question: "In what year did Senegal first qualify for a World Cup?", options: ["1998", "2002", "2006", "2010"], answer: 1, trivia: "Senegal stunned reigning champions France 1-0 in their World Cup debut at the 2002 tournament and reached the quarter-finals!" },
  { id: "q2_12", emoji: "⭐", question: "Who scored the only goal in the 2010 World Cup final to win it for Spain?", options: ["David Villa", "Fernando Torres", "Andrés Iniesta", "Xavi"], answer: 2, trivia: "Andrés Iniesta scored in extra time to give Spain their first World Cup. Iniesta later revealed he had written the initials of a recently deceased friend on his shirt." },
  { id: "q2_13", emoji: "⚖️", question: "Which team was eliminated on the 'Fair Play' (yellow card) rule at the 2018 World Cup for the first time in history?", options: ["South Korea", "Senegal", "Japan", "Colombia"], answer: 1, trivia: "Senegal and Japan were level on all stats, but Japan advanced due to having fewer yellow cards — the first time in history Fair Play decided a World Cup group.", imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=280&fit=crop" },
  { id: "q2_14", emoji: "🔥", question: "What was the highest-scoring World Cup game ever, and what was the score?", options: ["Austria 7-5 Switzerland (1954)", "Hungary 10-1 El Salvador (1982)", "Germany 8-0 Saudi Arabia (2002)", "Yugoslavia 9-0 Zaire (1974)"], answer: 0, trivia: "Austria beat Switzerland 7-5 in 1954 — 12 goals in one match, a record that still stands 70 years later!" },
  { id: "q2_15", emoji: "🦁", question: "Which African nation came closest to reaching a World Cup semi-final before 2026?", options: ["Nigeria", "Cameroon", "Senegal", "Ghana"], answer: 2, trivia: "Senegal reached the quarter-finals in 2002. Cameroon, Nigeria and Ghana all reached the quarters too but Senegal's run remains Africa's finest alongside Morocco in 2022." },
  { id: "q2_16", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", question: "In 1950, who shocked Brazil in their own stadium in the famous Maracanazo?", options: ["Argentina", "England", "Uruguay", "Paraguay"], answer: 2, trivia: "200,000 fans packed the Maracana expecting Brazil to win. Uruguay won 2-1. The goalkeeper Moacir Barbosa blamed himself for the rest of his life.", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=280&fit=crop" },
  { id: "q2_17", emoji: "📊", question: "Who holds the record for most clean sheets in World Cup history?", options: ["Peter Shilton", "Fabien Barthez", "Oliver Kahn", "Iker Casillas"], answer: 3, trivia: "Iker Casillas kept 10 clean sheets across his World Cup career, helping Spain win in 2010." },
  { id: "q2_18", emoji: "🦅", question: "Which nation knocked out the defending World Cup champions the most times in history?", options: ["Brazil", "Germany", "Argentina", "Spain"], answer: 1, trivia: "Germany/West Germany eliminated the defending champions in 1938 (Italy), 1954 (Uruguay), 1958 (Hungary) and 2010 (Italy). More than any other nation." },
  { id: "q2_19", emoji: "🌟", question: "Just Fontaine scored 13 goals at the 1958 World Cup. Which country did he play for?", options: ["France", "Brazil", "Argentina", "Yugoslavia"], answer: 0, trivia: "Born in Morocco to a French mother, Fontaine only started the tournament because another player got injured. He never came close to repeating it at another World Cup." },
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
  const [showQuiz1, setShowQuiz1] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (myAnswers[q.id] !== undefined) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const correct = optionIndex === q.answer; // -1 (timeout) is always wrong
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

  // Timer - counts down 30s per question, auto-submits on 0
  useEffect(() => {
    const q = QUESTIONS[currentQ];
    if (myAnswers[q.id] !== undefined) { setTimeLeft(30); return; } // already answered
    setTimeLeft(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit wrong answer (mark as timed out) if not answered
          const curr = QUESTIONS[currentQ];
          if (myAnswers[curr.id] === undefined) {
            submitAnswer(curr, -1); // -1 = timed out, no option chosen
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQ, myAnswers]);

  const score = QUESTIONS.filter(q => myAnswers[q.id] === q.answer).length;
  const currentQIds = new Set(QUESTIONS.map(q => q.id));
  const answered = QUESTIONS.filter(q => myAnswers[q.id] !== undefined).length;

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
          <span style={{ fontWeight: 700, fontSize: "14px", color: answered === QUESTIONS.length ? "var(--green)" : "var(--text-2)" }}>
            {answered}/{QUESTIONS.length} answered · {score} correct
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ background: "var(--border)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
          <div style={{ background: "var(--green)", height: "100%", width: `${(answered / QUESTIONS.length) * 100}%`, borderRadius: "99px", transition: "width 0.3s" }} />
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
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px", fontWeight: 600 }}>QUESTION {currentQ + 1} OF {QUESTIONS.length}</p>
            <p style={{ fontWeight: 700, fontSize: "15px", lineHeight: 1.4 }}>{q.question}</p>
          </div>
          {/* Timer */}
          {!hasAnswered && (
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "var(--green)"}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(timeLeft / 30) * 94.2} 94.2`}
                  transform="rotate(-90 18 18)"
                  style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s" }}
                />
                <text x="18" y="22" textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "var(--text)"}>
                  {timeLeft}
                </text>
              </svg>
            </div>
          )}
          {hasAnswered && myAnswers[q.id] === -1 && (
            <div style={{ flexShrink: 0, fontSize: "11px", color: "#ef4444", fontWeight: 700, textAlign: "center" }}>⏰<br/>Time!</div>
          )}
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
      {answered === QUESTIONS.length && (
        <div className="card" style={{ marginTop: "16px", padding: "20px", textAlign: "center", borderColor: "var(--green)" }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>{score >= 15 ? "🏆" : score >= 12 ? "⭐" : score >= 8 ? "😅" : "🤦"}</p>
          <p style={{ fontWeight: 800, fontSize: "20px", marginBottom: "4px" }}>{score}/{QUESTIONS.length}</p>
          <p style={{ color: "var(--text-2)", fontSize: "13px" }}>
            {score >= 15 ? "World Cup encyclopedia!" : score >= 12 ? "Solid football knowledge!" : score >= 8 ? "Room to improve..." : "Maybe stick to watching?"}
          </p>
        </div>
      )}

      {/* Quiz 1 history — collapsible */}
      {(() => {
        const quiz1Ids = new Set(["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11","q12","q13","q14","q15","q16","q17","q18","q19","q20"]);
        const quiz1Answers = Object.entries(answers).filter(([id]) => quiz1Ids.has(id)).flatMap(([,a]) => a);
        if (!quiz1Answers.length) return null;
        const q1Scores: Record<string, { name: string; correct: number; total: number }> = {};
        quiz1Answers.forEach(a => {
          if (!q1Scores[a.playerId]) q1Scores[a.playerId] = { name: a.playerName, correct: 0, total: 0 };
          q1Scores[a.playerId].total++;
          if (a.correct) q1Scores[a.playerId].correct++;
        });
        const q1Ranked = Object.values(q1Scores).sort((a, b) => b.correct - a.correct);
        return (
          <div style={{ marginTop: "16px" }}>
            <button onClick={() => setShowQuiz1(s => !s)} className="btn-secondary" style={{ width: "100%", fontSize: "13px" }}>
              {showQuiz1 ? "▲" : "▼"} Quiz 1 Results ({q1Ranked.length} players)
            </button>
            {showQuiz1 && (
              <div className="card" style={{ marginTop: "8px", overflow: "hidden", padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead><tr style={{ background: "var(--surface2)", borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>#</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Player</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>Score</th>
                  </tr></thead>
                  <tbody>{q1Ranked.map((p, i) => {
                    const pl = allPlayers.find(u => u.name === p.name);
                    return <tr key={p.name} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 700 }}>{["🥇","🥈","🥉"][i] || i+1}</td>
                      <td style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <AvatarDisplay url={pl?.avatarUrl || ""} name={p.name} size={24} />
                        {p.name}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 800 }}>{p.correct}/{p.total}</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Quiz 2 Leaderboard — only current quiz answers */}
      {(() => {
        const currentQIds = new Set(QUESTIONS.map(q => q.id));
        const currentAnswers = Object.entries(answers).filter(([id]) => currentQIds.has(id)).flatMap(([,a]) => a);
        const playerScores: Record<string, { name: string; playerId: string; correct: number; total: number }> = {};
        currentAnswers.forEach(a => {
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

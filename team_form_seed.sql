-- Pre-populated team form data for World Cup 2026 major nations
-- Run this in Supabase SQL Editor
-- Last updated: May 2026 — includes results up to March/April 2026

INSERT INTO team_form (team, matches, updated_at) VALUES

('England', '[
  {"date":"2025-10-14","opponent":"Latvia","homeAway":"A","goalsFor":5,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-13","opponent":"Serbia","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-16","opponent":"Albania","homeAway":"A","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-27","opponent":"Uruguay","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-03-31","opponent":"Japan","homeAway":"H","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"Friendly"}
]', NOW()),

('France', '[
  {"date":"2025-06-05","opponent":"Spain","homeAway":"N","goalsFor":4,"goalsAgainst":5,"result":"L","competition":"UEFA Nations League SF"},
  {"date":"2025-06-08","opponent":"Germany","homeAway":"N","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"UEFA Nations League 3rd"},
  {"date":"2026-03-22","opponent":"Brazil","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Colombia","homeAway":"N","goalsFor":3,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-05-25","opponent":"Senegal","homeAway":"H","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Spain', '[
  {"date":"2025-06-05","opponent":"France","homeAway":"N","goalsFor":5,"goalsAgainst":4,"result":"W","competition":"UEFA Nations League SF"},
  {"date":"2025-06-08","opponent":"Portugal","homeAway":"N","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"UEFA Nations League Final"},
  {"date":"2026-03-20","opponent":"Netherlands","homeAway":"A","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Belgium","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-26","opponent":"Germany","homeAway":"H","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Germany', '[
  {"date":"2025-06-05","opponent":"Portugal","homeAway":"N","goalsFor":2,"goalsAgainst":4,"result":"L","competition":"UEFA Nations League SF"},
  {"date":"2025-06-08","opponent":"France","homeAway":"N","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"UEFA Nations League 3rd"},
  {"date":"2026-03-21","opponent":"Austria","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Sweden","homeAway":"A","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"Friendly"},
  {"date":"2026-05-26","opponent":"Spain","homeAway":"A","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Portugal', '[
  {"date":"2025-06-05","opponent":"Germany","homeAway":"N","goalsFor":4,"goalsAgainst":2,"result":"W","competition":"UEFA Nations League SF"},
  {"date":"2025-06-08","opponent":"Spain","homeAway":"N","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"UEFA Nations League Final"},
  {"date":"2026-03-21","opponent":"Italy","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Croatia","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-27","opponent":"Switzerland","homeAway":"H","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Brazil', '[
  {"date":"2025-09-09","opponent":"Argentina","homeAway":"H","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-10-14","opponent":"Chile","homeAway":"A","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"France","homeAway":"N","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-26","opponent":"USA","homeAway":"N","goalsFor":1,"goalsAgainst":5,"result":"L","competition":"Friendly"},
  {"date":"2026-05-20","opponent":"Mexico","homeAway":"N","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Argentina', '[
  {"date":"2025-09-09","opponent":"Brazil","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-10-14","opponent":"Uruguay","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Mauritania","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Zambia","homeAway":"H","goalsFor":5,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-27","opponent":"Uruguay","homeAway":"A","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Netherlands', '[
  {"date":"2025-10-13","opponent":"Hungary","homeAway":"H","goalsFor":4,"goalsAgainst":0,"result":"W","competition":"UEFA Nations League"},
  {"date":"2025-11-16","opponent":"Germany","homeAway":"A","goalsFor":4,"goalsAgainst":2,"result":"W","competition":"UEFA Nations League"},
  {"date":"2026-03-20","opponent":"Spain","homeAway":"H","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Poland","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-24","opponent":"Romania","homeAway":"A","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Belgium', '[
  {"date":"2025-09-07","opponent":"France","homeAway":"A","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"UEFA Nations League"},
  {"date":"2025-10-10","opponent":"Italy","homeAway":"A","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"UEFA Nations League"},
  {"date":"2025-11-15","opponent":"Kazakhstan","homeAway":"H","goalsFor":7,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Austria","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Spain","homeAway":"A","goalsFor":0,"goalsAgainst":3,"result":"L","competition":"Friendly"}
]', NOW()),

('Morocco', '[
  {"date":"2025-09-06","opponent":"South Africa","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-10-10","opponent":"Libya","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-11-15","opponent":"Lesotho","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-22","opponent":"Ivory Coast","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Senegal","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"}
]', NOW()),

('USA', '[
  {"date":"2025-09-10","opponent":"Canada","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"CONCACAF Nations League"},
  {"date":"2025-11-18","opponent":"Mexico","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-22","opponent":"Netherlands","homeAway":"N","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-26","opponent":"Brazil","homeAway":"N","goalsFor":5,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-05-23","opponent":"Serbia","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"}
]', NOW()),

('Uruguay', '[
  {"date":"2025-10-14","opponent":"Argentina","homeAway":"A","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-11-18","opponent":"Colombia","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Algeria","homeAway":"N","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"},
  {"date":"2026-03-27","opponent":"England","homeAway":"A","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Ecuador","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Colombia', '[
  {"date":"2025-10-10","opponent":"Paraguay","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-18","opponent":"Uruguay","homeAway":"A","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Canada","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"France","homeAway":"N","goalsFor":1,"goalsAgainst":3,"result":"L","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Australia","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Norway', '[
  {"date":"2025-09-06","opponent":"Austria","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"UEFA Nations League"},
  {"date":"2025-10-12","opponent":"Israel","homeAway":"H","goalsFor":5,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Estonia","homeAway":"H","goalsFor":4,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-21","opponent":"Denmark","homeAway":"A","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Sweden","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"}
]', NOW()),

('Japan', '[
  {"date":"2025-10-15","opponent":"China","homeAway":"A","goalsFor":3,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-19","opponent":"Bahrain","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-24","opponent":"South Korea","homeAway":"N","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-31","opponent":"England","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-28","opponent":"Chile","homeAway":"H","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('South Korea', '[
  {"date":"2025-10-15","opponent":"Iraq","homeAway":"H","goalsFor":3,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-19","opponent":"Kuwait","homeAway":"A","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-24","opponent":"Japan","homeAway":"N","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-28","opponent":"USA","homeAway":"N","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-05-24","opponent":"Saudi Arabia","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"}
]', NOW()),

('Mexico', '[
  {"date":"2025-09-06","opponent":"Canada","homeAway":"A","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"CONCACAF Nations League"},
  {"date":"2025-11-18","opponent":"USA","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-22","opponent":"Costa Rica","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-26","opponent":"Colombia","homeAway":"N","goalsFor":0,"goalsAgainst":4,"result":"L","competition":"Friendly"},
  {"date":"2026-05-23","opponent":"Ecuador","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Australia', '[
  {"date":"2025-10-10","opponent":"Saudi Arabia","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-14","opponent":"Japan","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"New Zealand","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Paraguay","homeAway":"N","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Colombia","homeAway":"A","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"Friendly"}
]', NOW()),

('Scotland', '[
  {"date":"2025-09-07","opponent":"Poland","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-10-11","opponent":"Portugal","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-11-16","opponent":"Greece","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Republic of Ireland","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Denmark","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"}
]', NOW()),

('Croatia', '[
  {"date":"2025-09-07","opponent":"Czech Republic","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-10-11","opponent":"Poland","homeAway":"A","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Montenegro","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Switzerland","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Portugal","homeAway":"H","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"Friendly"}
]', NOW()),

('Ecuador', '[
  {"date":"2025-09-09","opponent":"Bolivia","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-10-14","opponent":"Venezuela","homeAway":"A","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Chile","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"New Zealand","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Uruguay","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"}
]', NOW()),

('Canada', '[
  {"date":"2025-09-06","opponent":"Mexico","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"CONCACAF Nations League"},
  {"date":"2025-11-16","opponent":"Honduras","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-22","opponent":"Colombia","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-26","opponent":"Australia","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-05-24","opponent":"Costa Rica","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Senegal', '[
  {"date":"2025-09-06","opponent":"South Africa","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-10-10","opponent":"Mauritania","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-25","opponent":"Morocco","homeAway":"N","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-28","opponent":"Ivory Coast","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-05-25","opponent":"France","homeAway":"A","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Egypt', '[
  {"date":"2025-10-11","opponent":"Cape Verde","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-11-14","opponent":"Mozambique","homeAway":"A","goalsFor":3,"goalsAgainst":1,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-22","opponent":"Nigeria","homeAway":"N","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Ghana","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Algeria","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"}
]', NOW()),

('Algeria', '[
  {"date":"2025-10-10","opponent":"Botswana","homeAway":"H","goalsFor":4,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-11-14","opponent":"Ethiopia","homeAway":"A","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-22","opponent":"Tunisia","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Uruguay","homeAway":"N","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Egypt","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"}
]', NOW()),

('Switzerland', '[
  {"date":"2025-10-11","opponent":"Kosovo","homeAway":"H","goalsFor":4,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Slovenia","homeAway":"A","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Croatia","homeAway":"A","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Italy","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-05-27","opponent":"Portugal","homeAway":"A","goalsFor":0,"goalsAgainst":0,"result":"D","competition":"Friendly"}
]', NOW()),

('Sweden', '[
  {"date":"2025-10-11","opponent":"Slovenia","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Kosovo","homeAway":"A","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Denmark","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Germany","homeAway":"H","goalsFor":2,"goalsAgainst":2,"result":"D","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Norway","homeAway":"A","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"}
]', NOW()),

('Austria', '[
  {"date":"2025-10-10","opponent":"Bosnia & Herzegovina","homeAway":"H","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Romania","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-21","opponent":"Germany","homeAway":"A","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Belgium","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Czech Republic","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW()),

('Serbia', '[
  {"date":"2025-10-11","opponent":"Latvia","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-13","opponent":"England","homeAway":"A","goalsFor":0,"goalsAgainst":2,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-11-16","opponent":"Andorra","homeAway":"H","goalsFor":4,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Hungary","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-23","opponent":"USA","homeAway":"A","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"}
]', NOW()),

('Paraguay', '[
  {"date":"2025-10-10","opponent":"Colombia","homeAway":"A","goalsFor":0,"goalsAgainst":3,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-11-18","opponent":"Bolivia","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Panama","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Australia","homeAway":"N","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Bolivia","homeAway":"H","goalsFor":3,"goalsAgainst":1,"result":"W","competition":"Friendly"}
]', NOW()),

('Ghana', '[
  {"date":"2025-10-10","opponent":"Madagascar","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-11-14","opponent":"Sudan","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-22","opponent":"Kenya","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Egypt","homeAway":"N","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Senegal","homeAway":"N","goalsFor":1,"goalsAgainst":2,"result":"L","competition":"Friendly"}
]', NOW()),

('Ivory Coast', '[
  {"date":"2025-10-11","opponent":"Tanzania","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2025-11-14","opponent":"Rwanda","homeAway":"A","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"AFCON Qualifier"},
  {"date":"2026-03-22","opponent":"Morocco","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Tunisia","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-03-28","opponent":"Senegal","homeAway":"N","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"}
]', NOW()),

('Türkiye', '[
  {"date":"2025-10-11","opponent":"Albania","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-15","opponent":"Georgia","homeAway":"A","goalsFor":3,"goalsAgainst":2,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Bosnia & Herzegovina","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"WC Qualifier Playoff"},
  {"date":"2026-03-25","opponent":"Greece","homeAway":"N","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-05-24","opponent":"Hungary","homeAway":"H","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"}
]', NOW()),

('Saudi Arabia', '[
  {"date":"2025-10-10","opponent":"Australia","homeAway":"H","goalsFor":0,"goalsAgainst":1,"result":"L","competition":"WC Qualifier"},
  {"date":"2025-11-14","opponent":"Bahrain","homeAway":"A","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Iraq","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Jordan","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-05-24","opponent":"South Korea","homeAway":"A","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"Friendly"}
]', NOW()),

('Iran', '[
  {"date":"2025-10-15","opponent":"Kyrgyzstan","homeAway":"H","goalsFor":3,"goalsAgainst":0,"result":"W","competition":"WC Qualifier"},
  {"date":"2025-11-19","opponent":"North Korea","homeAway":"A","goalsFor":1,"goalsAgainst":1,"result":"D","competition":"WC Qualifier"},
  {"date":"2026-03-22","opponent":"Uzbekistan","homeAway":"H","goalsFor":1,"goalsAgainst":0,"result":"W","competition":"Friendly"},
  {"date":"2026-03-25","opponent":"Iraq","homeAway":"N","goalsFor":2,"goalsAgainst":1,"result":"W","competition":"Friendly"},
  {"date":"2026-05-22","opponent":"Syria","homeAway":"H","goalsFor":2,"goalsAgainst":0,"result":"W","competition":"Friendly"}
]', NOW())

ON CONFLICT (team) DO UPDATE SET
  matches = EXCLUDED.matches,
  updated_at = EXCLUDED.updated_at;

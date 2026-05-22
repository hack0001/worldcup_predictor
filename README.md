# ⚽ World Cup 2026 Predictor

A private score prediction game for you and your mates.

## Features
- Sign up with name, email & team name
- Predict scores for all Group Stage matches (12 groups × 6 matches)
- Predict knockout round scores & teams (Last 16 → QF → SF → Final)
- Golden Boot & Top Assist bonus predictions
- Live leaderboard with points
- Admin panel to enter actual results

## Scoring
| Prediction | Points |
|---|---|
| Exact score | +10 |
| Correct result (W/D/L) | +6 |
| Golden Boot correct | +15 |
| Top Assist correct | +10 |

## Setup & Deploy (Free on Vercel)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "World Cup predictor"
   gh repo create worldcup-predictor --public
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to vercel.com → New Project → Import your repo
   - Click Deploy — done! Free forever for this scale.

3. **Share the URL with your 10 mates**

## Admin Access
The admin panel lets you enter real match results so points auto-calculate.

**Access:** Click the "⚽ World Cup 2026" title 5 times → Admin tab appears.  
**Password:** `worldcup2026`

> ⚠️ Change the password in `app/components/AdminPanel.tsx` before deploying!

## Data Storage
Uses **localStorage** — each person's data lives in their browser on the device they sign up on.

**Important for your group:** Everyone should use the app on the same shared device/browser, OR you can upgrade to a real database (see below).

## Optional: Shared Database Upgrade
If you want everyone to access from their own devices, replace localStorage with a simple backend:
- **Easiest:** Supabase (free tier, postgres) + a couple of API routes
- Connect at `lib/storage.ts` — swap the localStorage calls for fetch() to your API

## Customise
- **Adjust points:** Edit `POINTS` in `app/data/worldcup.ts`
- **Update teams/groups:** Edit `GROUPS` in `app/data/worldcup.ts` (2026 groups TBC)
- **Add players to dropdown:** Edit `TOP_PLAYERS` array

## Running Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

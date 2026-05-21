# RepLab — Personal Chess Trainer

## Getting Started

Two servers required — open two terminals:

```bash
# Terminal 1: backend (port 3001)
cd backend
npm install
npm run dev

# Terminal 2: frontend (port 5173)
cd frontend
npm install
npm run dev
```

**One-time engine setup** (after `npm install` in frontend):

```bash
cp frontend/node_modules/stockfish/bin/stockfish-18-lite-single.wasm \
   frontend/public/engine/
```

The `.wasm` file (7 MB) is excluded from git. The `.js` wrapper and proxy are committed.

Open http://localhost:5173

## What's built

**Game import**
- Chess.com import — enter a username, pick a month, filter by time class (bullet/blitz/rapid/daily), browse games with result (W/L/D), opponent, rating, and opening name, click any game to load it
- PGN import — drag-and-drop a `.pgn` file, use the file picker, or paste directly; "Try sample" button for quick testing

**Game review**
- Stockfish 18 analysis runs automatically in a Web Worker — eval bar updates per position
- Step through every move with keyboard (←→↑↓) or click the move list
- Move classification: blunder (??), mistake (?), inaccuracy (?!) with color-coded dots
- Per-player summary (blunders / mistakes / inaccuracies) shown after analysis completes
- Live eval on the current position while analysis catches up
- Board flip, opening name, result, time control, player names + Elo

**Opening drills**
- Catalog of 9 openings (Ruy Lopez, Queen's Gambit, Sicilian Najdorf, King's Indian, London, French, Caro-Kann, Italian, King's Gambit) with filter by color and difficulty
- Drag or click pieces on the board — app auto-plays opponent moves
- Hint and move explanation powered by Claude (AI chess coach, 2–4 sentences, focused on the why)
- Progress bar, move breadcrumb, shake animation on wrong moves

## File structure

```
backend/
  src/
    index.js                    # Express entry point (port 3001)
    routes/chesscom.js          # Proxy routes to Chess.com public API
    services/chesscom.js        # Fetch wrapper + game summarizer

frontend/
  public/
    engine/                     # Stockfish WASM + JS wrapper + proxy worker
  src/
    App.tsx                     # Root, nav, view routing
    api/
      chesscom.ts               # Typed client for the backend proxy
    pages/
      GameReview.tsx            # Board + eval bar + move list + analysis summary
      OpeningCatalog.tsx        # Filterable opening grid
      OpeningDrill.tsx          # Interactive drill with AI hints
    components/
      ChesscomImport.tsx        # Username → month → time class → game list
      PgnImport.tsx             # Paste / drag-and-drop / file picker
      EvalBar.tsx               # Vertical centipawn / mate bar
    hooks/
      useAnalysis.ts            # Stockfish full-game analysis (priority queue)
      useLiveEval.ts            # Single-position live eval
      useOpeningExplanation.ts  # Plain-English move hints and feedback
    utils/
      chess/
        index.ts                # PGN parser, chess utilities
        openings.ts             # Opening definitions (SAN lines + player/opponent indices)
      engineWorker.ts           # UCI helpers, score normalization
```

## Next milestones

- [ ] Mistake drill mode (retry positions you got wrong)
- [ ] Spaced repetition (SM-2) for opening lines
- [ ] Weakness dashboard
- [ ] Multi-line opening support

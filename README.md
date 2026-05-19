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
- Step through every move with keyboard (←→↑↓) or click moves in the list
- Move highlighting on the board, player names + Elo displayed
- Board flip, opening name, result, time control info

## File structure

```
backend/
  src/
    index.js                           # Express entry point (port 3001)
    routes/chesscom.js                 # Proxy routes to Chess.com public API
    services/chesscom.js               # Fetch wrapper + game summarizer

frontend/
  src/
    App.tsx                            # Root, nav, tab switcher, view routing
    lib/
      chess/index.ts                   # PGN parser, chess utils
      api/chesscom.ts                  # Typed client for the backend
    features/
      game-review/
        ChesscomImport.tsx             # Username → month → time class → game list
        PgnImport.tsx                  # Paste / drag-and-drop / file picker
        GameReview.tsx                 # Board + move list + controls
```

## Next milestones

- [ ] M3: Stockfish evaluation per move (eval bar)
- [ ] M4: Mistake detection + blunder classification
- [ ] M5: Mistake drill mode (retry positions you got wrong)
- [ ] M6: Spaced repetition (SM-2) for drills
- [ ] M7: Weakness dashboard

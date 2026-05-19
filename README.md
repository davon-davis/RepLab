# RepLab — Personal Chess Trainer

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## What's built (Milestone 1)

- PGN import via drag-and-drop, file picker, or paste
- Chess.com game display with player names + Elo
- Step through every move with keyboard (←→) or click
- Board flip, move highlighting, opening name display
- "Try sample" button to test with a preloaded game

## File structure

```
frontend/
  src/
    App.tsx                          # Root, nav, view routing
    lib/chess/index.ts               # PGN parser, chess utils
    features/
      game-review/
        PgnImport.tsx                # Import UI (paste/drop/file)
        GameReview.tsx               # Board + move list + controls
```

## Next milestones

- [ ] M2: Chess.com API import (by username + month)
- [ ] M3: Stockfish evaluation per move (eval bar)
- [ ] M4: Mistake detection + blunder classification
- [ ] M5: Mistake drill mode (retry positions you got wrong)
- [ ] M6: Spaced repetition (SM-2) for drills
- [ ] M7: Weakness dashboard

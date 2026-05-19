export interface OpeningLine {
    id: string
    moves: string[]          // SAN moves for the full line
    opponentMoves: number[]  // indices (0-based) of moves played by opponent
    playerMoves: number[]    // indices of moves player must find
  }
  
  export interface Opening {
    id: string
    name: string
    eco: string
    color: 'white' | 'black'
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    lines: OpeningLine[]
  }
  
  export const OPENINGS: Opening[] = [
    {
      id: 'ruy-lopez',
      name: 'Ruy Lopez',
      eco: 'C60',
      color: 'white',
      difficulty: 'intermediate',
      description: 'One of the oldest and most respected openings. Attack the defender of e5 immediately.',
      tags: ['classical', 'e4', 'positional'],
      lines: [
        {
          id: 'ruy-lopez-main',
          moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
          opponentMoves: [1, 3, 5, 7, 9, 11, 13, 15],
          playerMoves: [0, 2, 4, 6, 8, 10, 12, 14],
        },
        {
          id: 'ruy-lopez-exchange',
          moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'd3', 'f6', 'Be3', 'c5'],
          opponentMoves: [1, 3, 5, 7, 9, 11],
          playerMoves: [0, 2, 4, 6, 8, 10],
        },
      ],
    },
    {
      id: 'queens-gambit',
      name: "Queen's Gambit",
      eco: 'D06',
      color: 'white',
      difficulty: 'intermediate',
      description: 'Control the center with a pawn sacrifice. A cornerstone of classical chess.',
      tags: ['classical', 'd4', 'positional', 'gambit'],
      lines: [
        {
          id: 'qg-accepted',
          moves: ['d4', 'd5', 'c4', 'dxc4', 'e3', 'Nf6', 'Bxc4', 'e6', 'Nf3', 'c5', 'O-O', 'a6'],
          opponentMoves: [1, 3, 5, 7, 9, 11],
          playerMoves: [0, 2, 4, 6, 8, 10],
        },
        {
          id: 'qg-declined',
          moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6'],
          opponentMoves: [1, 3, 5, 7, 9, 11],
          playerMoves: [0, 2, 4, 6, 8, 10],
        },
      ],
    },
    {
      id: 'sicilian-najdorf',
      name: 'Sicilian Najdorf',
      eco: 'B90',
      color: 'black',
      difficulty: 'advanced',
      description: 'The most combative Sicilian. Played by Fischer and Kasparov. High risk, high reward.',
      tags: ['sicilian', 'e4', 'aggressive', 'dynamic'],
      lines: [
        {
          id: 'najdorf-main',
          moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6'],
          opponentMoves: [0, 2, 4, 6, 8, 10, 12],
          playerMoves: [1, 3, 5, 7, 9, 11, 13],
        },
      ],
    },
    {
      id: 'kings-indian',
      name: "King's Indian Defense",
      eco: 'E60',
      color: 'black',
      difficulty: 'advanced',
      description: "Hypermodern and explosive. Let White build a center, then destroy it. Fischer's favorite.",
      tags: ['hypermodern', 'd4', 'dynamic', 'counterattack'],
      lines: [
        {
          id: 'kid-main',
          moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6'],
          opponentMoves: [0, 2, 4, 6, 8, 10, 12],
          playerMoves: [1, 3, 5, 7, 9, 11, 13],
        },
      ],
    },
    {
      id: 'london-system',
      name: 'London System',
      eco: 'D02',
      color: 'white',
      difficulty: 'beginner',
      description: 'Solid, reliable, and easy to learn. Build a pyramid, castle, and outplay your opponent.',
      tags: ['solid', 'd4', 'system', 'beginner-friendly'],
      lines: [
        {
          id: 'london-main',
          moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'c5'],
          opponentMoves: [1, 3, 5, 7, 9, 11],
          playerMoves: [0, 2, 4, 6, 8, 10],
        },
      ],
    },
    {
      id: 'french-defense',
      name: 'French Defense',
      eco: 'C00',
      color: 'black',
      difficulty: 'intermediate',
      description: 'Solid and counterattacking. Accept a cramped position early, then break out.',
      tags: ['solid', 'e4', 'counterplay', 'pawn-structure'],
      lines: [
        {
          id: 'french-advance',
          moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'Be2', 'cxd4'],
          opponentMoves: [0, 2, 4, 6, 8, 10],
          playerMoves: [1, 3, 5, 7, 9, 11],
        },
      ],
    },
    {
      id: 'caro-kann',
      name: 'Caro-Kann Defense',
      eco: 'B10',
      color: 'black',
      difficulty: 'intermediate',
      description: 'Solid and structured. Get a good pawn structure and outplay in the endgame.',
      tags: ['solid', 'e4', 'positional', 'endgame'],
      lines: [
        {
          id: 'caro-kann-classical',
          moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7'],
          opponentMoves: [0, 2, 4, 6, 8, 10, 12],
          playerMoves: [1, 3, 5, 7, 9, 11, 13],
        },
      ],
    },
    {
      id: 'italian-game',
      name: 'Italian Game',
      eco: 'C50',
      color: 'white',
      difficulty: 'beginner',
      description: 'Classic, principled development. Control the center, develop pieces, castle early.',
      tags: ['classical', 'e4', 'beginner-friendly', 'development'],
      lines: [
        {
          id: 'italian-giuoco',
          moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'O-O'],
          opponentMoves: [1, 3, 5, 7, 9, 11, 13, 15],
          playerMoves: [0, 2, 4, 6, 8, 10, 12, 14],
        },
      ],
    },
    {
      id: 'kings-gambit',
      name: "King's Gambit",
      eco: 'C30',
      color: 'white',
      difficulty: 'intermediate',
      description: 'Romantic and aggressive. Sacrifice a pawn for rapid development and a kingside attack.',
      tags: ['gambit', 'e4', 'aggressive', 'attack'],
      lines: [
        {
          id: 'kings-gambit-accepted',
          moves: ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'Bc4', 'g4', 'O-O', 'gxf3', 'Qxf3', 'Nc6', 'd3', 'd6'],
          opponentMoves: [1, 3, 5, 7, 9, 11, 13],
          playerMoves: [0, 2, 4, 6, 8, 10, 12],
        },
      ],
    },
  ]
  
  export const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 }
  
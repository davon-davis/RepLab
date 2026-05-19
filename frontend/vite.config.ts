import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chesscom': {
        target: 'https://api.chess.com/pub',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/chesscom', ''),
        headers: {
          'User-Agent': 'RepLab Chess Trainer (contact: replab@example.com)',
        },
      },
    },
  },
})

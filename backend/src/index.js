import express from 'express'
import cors from 'cors'
import chesscomRouter from './routes/chesscom.js'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/chesscom', chesscomRouter)

app.listen(PORT, () => {
  console.log(`RepLab backend running on http://localhost:${PORT}`)
})

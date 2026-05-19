import { Router } from 'express'
import { getProfile, getArchives, getGames } from '../services/chesscom.js'

const router = Router()

router.get('/player/:username', async (req, res) => {
  try {
    const profile = await getProfile(req.params.username)
    res.json(profile)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.get('/player/:username/archives', async (req, res) => {
  try {
    const archives = await getArchives(req.params.username)
    res.json({ archives })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

router.get('/player/:username/games/:year/:month', async (req, res) => {
  try {
    const { username, year, month } = req.params
    const games = await getGames(username, year, month)
    res.json({ games })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
})

export default router

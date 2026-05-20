const USERNAME_KEY = 'replab-chesscom-username'

export function getSavedChesscomUsername(): string {
  try {
    return localStorage.getItem(USERNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveChesscomUsername(username: string): void {
  try {
    localStorage.setItem(USERNAME_KEY, username)
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

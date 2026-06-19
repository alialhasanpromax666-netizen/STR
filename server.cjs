require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const bcrypt = require('bcrypt')
const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://api.coingecko.com", "https://api.binance.com"],
    },
  },
}))
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json({ limit: '10mb' }))

const DATA_FILE = path.join(__dirname, 'data.json')
const STATIC_DIR = path.join(__dirname, 'dist')
const DB_FILE = path.join(__dirname, 'str11.db')
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex')

const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')
db.exec(`CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  ip TEXT,
  user_agent TEXT,
  login_time TEXT DEFAULT (datetime('now')),
  last_heartbeat TEXT DEFAULT (datetime('now'))
)`)

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts, try again later' },
})

function getAdminHash() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    return data && data.adminHash ? data.adminHash : null
  } catch {
    return null
  }
}

async function getAdminHashAsync() {
  let hash = getAdminHash()
  if (!hash) {
    hash = await bcrypt.hash('str2024', 10)
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
      data.adminHash = hash
      writeData(data)
    } catch {}
  }
  return hash
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return null
  }
}

function backupData() {
  try {
    const backupsDir = path.join(__dirname, 'backups')
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })
    const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    fs.copyFileSync(DATA_FILE, path.join(backupsDir, `data-${date}.json`))
    const files = fs.readdirSync(backupsDir).filter(f => f.startsWith('data-')).sort()
    while (files.length > 50) {
      fs.unlinkSync(path.join(backupsDir, files[0]))
      files.shift()
    }
  } catch {}
}

function writeData(data) {
  backupData()
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, DATA_FILE)
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Missing password' })
  const hash = await getAdminHashAsync()
  if (!hash) return res.status(500).json({ error: 'Server error' })
  const match = await bcrypt.compare(password, hash)
  if (!match) return res.status(401).json({ error: 'Invalid password' })
  const sessionId = `adm-${require('crypto').randomUUID().slice(0, 8)}`
  const ip = req.ip || req.socket.remoteAddress || ''
  const ua = req.headers['user-agent'] || ''
  db.prepare('INSERT INTO admin_sessions (id, ip, user_agent) VALUES (?, ?, ?)').run(sessionId, ip, ua)
  const token = jwt.sign({ role: 'admin', sessionId }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ token })
})

app.post('/api/admin/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing password fields' })
  if (newPassword.length < 4) return res.status(400).json({ error: 'Password too short (min 4)' })
  const hash = await getAdminHashAsync()
  if (!hash) return res.status(500).json({ error: 'Server error' })
  const match = await bcrypt.compare(oldPassword, hash)
  if (!match) return res.status(401).json({ error: 'Old password is wrong' })
  try {
    const newHash = await bcrypt.hash(newPassword, 10)
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    data.adminHash = newHash
    delete data.adminPassword
    writeData(data)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to save' })
  }
})

app.get('/api/admin/sessions', authMiddleware, (req, res) => {
  const now = Date.now()
  const sessions = db.prepare('SELECT * FROM admin_sessions ORDER BY last_heartbeat DESC').all()
  const active = sessions.map((s) => ({
    id: s.id,
    ip: s.ip,
    userAgent: s.user_agent,
    loginTime: s.login_time,
    lastHeartbeat: s.last_heartbeat,
    isActive: now - new Date(s.last_heartbeat).getTime() < 70000,
  }))
  res.json(active)
})

app.post('/api/admin/heartbeat', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE admin_sessions SET last_heartbeat = datetime(\'now\') WHERE id = ?').run(req.user.sessionId)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Heartbeat failed' })
  }
})

app.post('/api/admin/logout', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM admin_sessions WHERE id = ?').run(req.user.sessionId)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Logout failed' })
  }
})

app.get('/api/config', (req, res) => {
  const data = readData()
  return res.json(data)
})

app.put('/api/config', authMiddleware, (req, res) => {
  writeData(req.body)
  res.json({ ok: true })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR, {
    maxAge: '1y',
    immutable: true,
  }))
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(STATIC_DIR, 'index.html'))
    }
    next()
  })
}

// Migrate old adminPassword to adminHash on startup
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    if (raw && raw.adminPassword && !raw.adminHash) {
      bcrypt.hash(raw.adminPassword, 10).then((hash) => {
        raw.adminHash = hash
        delete raw.adminPassword
        writeData(raw)
      })
    }
  }
} catch {}

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`STR11 server running on port ${PORT}`)
  if (!fs.existsSync(DATA_FILE)) {
    writeData(null)
    console.log('Created empty data.json')
  }
})

process.on('SIGTERM', () => {
  db.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  db.close()
  process.exit(0)
})

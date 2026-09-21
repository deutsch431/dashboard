const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-me';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-only-change-me';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireInternalKey(req, res, next) {
  if (req.get('x-api-key') !== INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = await db.findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.userId = user.id;
  res.json({ username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

app.get('/api/session', async (req, res) => {
  const user = req.session.userId ? await db.findUserById(req.session.userId) : null;
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, username: user.username });
});

app.get('/api/dashboard/summary', requireAuth, async (req, res) => {
  res.json(await db.getTaskSummary());
});

app.get('/api/tasks', requireAuth, async (req, res) => {
  res.json(await db.getAllTasks(req.query.status));
});

app.get('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await db.getTaskById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/api/internal/tasks', requireInternalKey, async (req, res) => {
  const { title, status, detail } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  res.status(201).json(await db.createTask(title, status, detail));
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

db.seedIfEmpty().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

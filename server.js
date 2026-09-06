const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { load, save } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'sabi-guide-dev-secret', // replace with an env var in production
  resave: false,
  saveUninitialized: false
}));

// ---------- Helpers ----------
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/dashboard');
  next();
}

function nextId(list) {
  return list.length ? Math.max(...list.map(i => i.id)) + 1 : 1;
}

// ---------- Auth ----------
app.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));

app.get('/register', (req, res) => res.render('register', { error: null }));

app.post('/register', (req, res) => {
  const { name, phone, password } = req.body;
  const data = load();

  if (data.users.find(u => u.phone === phone)) {
    return res.render('register', { error: 'That phone number is already registered.' });
  }

  const user = {
    id: nextId(data.users),
    name,
    phone,
    passwordHash: bcrypt.hashSync(password, 10),
    role: data.users.length === 0 ? 'admin' : 'learner' // first registered user becomes admin
  };
  data.users.push(user);
  save(data);

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => res.render('login', { error: null }));

app.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const data = load();
  const user = data.users.find(u => u.phone === phone);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.render('login', { error: 'Phone number or password is incorrect.' });
  }

  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---------- Learner dashboard ----------
app.get('/dashboard', requireLogin, (req, res) => {
  const data = load();
  const completedIds = data.progress
    .filter(p => p.userId === req.session.user.id)
    .map(p => p.moduleId);

  res.render('dashboard', {
    user: req.session.user,
    modules: data.modules,
    completedIds
  });
});

app.get('/module/:id', requireLogin, (req, res) => {
  const data = load();
  const mod = data.modules.find(m => m.id === parseInt(req.params.id, 10));
  if (!mod) return res.redirect('/dashboard');

  const completed = data.progress.some(
    p => p.userId === req.session.user.id && p.moduleId === mod.id
  );

  res.render('module', { user: req.session.user, mod, completed });
});

app.post('/module/:id/complete', requireLogin, (req, res) => {
  const data = load();
  const moduleId = parseInt(req.params.id, 10);
  const userId = req.session.user.id;

  const alreadyDone = data.progress.some(p => p.userId === userId && p.moduleId === moduleId);
  if (!alreadyDone) {
    data.progress.push({ userId, moduleId, completedAt: new Date().toISOString() });
    save(data);
  }
  res.redirect('/dashboard');
});

// ---------- Admin CRUD ----------
app.get('/admin', requireAdmin, (req, res) => {
  const data = load();
  res.render('admin', { user: req.session.user, modules: data.modules });
});

app.get('/admin/new', requireAdmin, (req, res) => {
  res.render('admin-form', { user: req.session.user, mod: null });
});

app.post('/admin/new', requireAdmin, (req, res) => {
  const data = load();
  const { title, description, steps } = req.body;
  data.modules.push({
    id: nextId(data.modules),
    title,
    description,
    steps: steps.split('\n').map(s => s.trim()).filter(Boolean)
  });
  save(data);
  res.redirect('/admin');
});

app.get('/admin/:id/edit', requireAdmin, (req, res) => {
  const data = load();
  const mod = data.modules.find(m => m.id === parseInt(req.params.id, 10));
  if (!mod) return res.redirect('/admin');
  res.render('admin-form', { user: req.session.user, mod });
});

app.post('/admin/:id/edit', requireAdmin, (req, res) => {
  const data = load();
  const mod = data.modules.find(m => m.id === parseInt(req.params.id, 10));
  if (mod) {
    mod.title = req.body.title;
    mod.description = req.body.description;
    mod.steps = req.body.steps.split('\n').map(s => s.trim()).filter(Boolean);
    save(data);
  }
  res.redirect('/admin');
});

app.post('/admin/:id/delete', requireAdmin, (req, res) => {
  const data = load();
  data.modules = data.modules.filter(m => m.id !== parseInt(req.params.id, 10));
  save(data);
  res.redirect('/admin');
});

app.listen(PORT, () => console.log(`Sabi Guide running on http://localhost:${PORT}`));

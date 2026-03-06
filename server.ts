import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import db from './src/db.ts';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = Number(process.env.PORT) || 3000;

if (!JWT_SECRET) {
  console.error('FATAL_ERROR: JWT_SECRET not defined in environment.');
  process.exit(1);
}

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

async function startServer() {
  console.log('--- SYSTEM_START: Initializing Secure Core ---');
  const app = express();

  // Security
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development to allow Vite & fonts
  }));

  // Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.'
  });

  const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 chat requests per minute
    message: { error: 'ORACLE_BUSY: Too many signal requests. Cool down expected.' }
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 failed login attempts per window
    message: { error: 'BRUTE_FORCE_PROTECTION: Too many login attempts. Access delayed.' }
  });

  app.use('/api/', generalLimiter);
  app.use('/api/chat', chatLimiter);
  app.use('/api/contact', chatLimiter);
  app.use('/api/auth/login', loginLimiter);

  app.use(express.json());
  app.use('/uploads', express.static('public/uploads'));

  // --- SECURITY LAYERS ---

  // CSRF Protection (Custom Header requirement)
  app.use((req, res, next) => {
    const protectedMethods = ['POST', 'PUT', 'DELETE'];
    if (protectedMethods.includes(req.method!) && !req.headers['x-security-signal']) {
      console.warn(`[SECURITY_SIGNAL_MISSING] IP: ${req.ip} tried ${req.method} on ${req.originalUrl}`);
      return res.status(403).json({ error: 'SECURITY_SIGNAL_REQUIRED: Breach protection active.' });
    }
    next();
  });

  // Honey-pot: Fake Admin Login
  app.post('/admin-login', (req, res) => {
    console.error(`[BREACH_ATTACK_DETECTED] Honey-pot triggered! IP: ${req.ip}`);
    // Simulate a slow response to waste attacker's time
    setTimeout(() => {
      res.status(401).json({ error: 'SYSTEM_LOCKDOWN: Unauthorized access logged.' });
    }, 2000);
  });

  // Ensure uploads directory exists
  const fs = await import('fs');
  if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
  }

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  });

  // Create initial admin if none exists
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (adminExists.count === 0) {
    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Credential Strength Policy
    const hasUpper = /[A-Z]/.test(defaultPass);
    const hasLower = /[a-z]/.test(defaultPass);
    const hasNumber = /[0-9]/.test(defaultPass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(defaultPass);

    if (defaultUser === 'admin' || defaultPass.length < 12 || !(hasUpper && hasLower && hasNumber && hasSpecial)) {
      console.warn('--- WARNING: WEAK_INITIAL_CREDENTIALS ---');
      console.warn('Initial admin credentials do not meet complexity requirements.');
      console.warn('Username should be non-generic, Password must have Upper, Lower, Number, and Special char.');
    }

    const hash = bcrypt.hashSync(defaultPass, 10);
    db.prepare('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)').run(defaultUser, hash, 1);
    console.log(`Initial admin created: ${defaultUser} / (Password from environment)`);
  }

  // --- PORTFOLIO API ROUTES ---

  // Projects
  app.get('/api/projects', (req, res) => {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    res.json(projects);
  });

  app.post('/api/projects', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, technologies, github_link, live_link } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const result = db.prepare('INSERT INTO projects (title, description, technologies, github_link, live_link, image) VALUES (?, ?, ?, ?, ?, ?)')
      .run(title, description, technologies, github_link, live_link, image);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/projects/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, technologies, github_link, live_link, is_visible } = req.body;
    const { id } = req.params;
    let query = 'UPDATE projects SET title = ?, description = ?, technologies = ?, github_link = ?, live_link = ?, is_visible = ?';
    let params = [title, description, technologies, github_link, live_link, is_visible];

    if (req.file) {
      query += ', image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Skills
  app.get('/api/skills', (req, res) => {
    const skills = db.prepare('SELECT * FROM skills').all();
    res.json(skills);
  });

  app.post('/api/skills', authenticateToken, (req, res) => {
    const { category, name, proficiency_level } = req.body;
    const result = db.prepare('INSERT INTO skills (category, name, proficiency_level) VALUES (?, ?, ?)')
      .run(category, name, proficiency_level);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/skills/:id', authenticateToken, (req, res) => {
    const { category, name, proficiency_level } = req.body;
    db.prepare('UPDATE skills SET category = ?, name = ?, proficiency_level = ? WHERE id = ?')
      .run(category, name, proficiency_level, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/skills/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Experience
  app.get('/api/experience', (req, res) => {
    const exp = db.prepare('SELECT * FROM experience').all();
    res.json(exp);
  });

  app.post('/api/experience', authenticateToken, (req, res) => {
    const { role, organization, duration, description } = req.body;
    const result = db.prepare('INSERT INTO experience (role, organization, duration, description) VALUES (?, ?, ?, ?)')
      .run(role, organization, duration, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/experience/:id', authenticateToken, (req, res) => {
    const { role, organization, duration, description } = req.body;
    db.prepare('UPDATE experience SET role = ?, organization = ?, duration = ?, description = ? WHERE id = ?')
      .run(role, organization, duration, description, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/experience/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM experience WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Education
  app.get('/api/education', (req, res) => {
    const edu = db.prepare('SELECT * FROM education').all();
    res.json(edu);
  });

  app.post('/api/education', authenticateToken, (req, res) => {
    const { degree, institution, duration, focus } = req.body;
    const result = db.prepare('INSERT INTO education (degree, institution, duration, focus) VALUES (?, ?, ?, ?)')
      .run(degree, institution, duration, focus);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/education/:id', authenticateToken, (req, res) => {
    const { degree, institution, duration, focus } = req.body;
    db.prepare('UPDATE education SET degree = ?, institution = ?, duration = ?, focus = ? WHERE id = ?')
      .run(degree, institution, duration, focus, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/education/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Certifications
  app.get('/api/certifications', (req, res) => {
    const certs = db.prepare('SELECT * FROM certifications').all();
    res.json(certs);
  });

  app.post('/api/certifications', authenticateToken, (req, res) => {
    const { title, issuer, year, credential_link } = req.body;
    const result = db.prepare('INSERT INTO certifications (title, issuer, year, credential_link) VALUES (?, ?, ?, ?)')
      .run(title, issuer, year, credential_link);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/certifications/:id', authenticateToken, (req, res) => {
    const { title, issuer, year, credential_link } = req.body;
    db.prepare('UPDATE certifications SET title = ?, issuer = ?, year = ?, credential_link = ? WHERE id = ?')
      .run(title, issuer, year, credential_link, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/certifications/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Blog Posts
  app.get('/api/posts', (req, res) => {
    const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    res.json(posts);
  });

  app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
    const { title, content, excerpt, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const result = db.prepare('INSERT INTO posts (title, content, excerpt, category, image) VALUES (?, ?, ?, ?, ?)')
      .run(title, content, excerpt, category, image);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/posts/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { title, content, excerpt, category, is_visible } = req.body;
    const { id } = req.params;
    let query = 'UPDATE posts SET title = ?, content = ?, excerpt = ?, category = ?, is_visible = ?';
    let params = [title, content, excerpt, category, is_visible];

    if (req.file) {
      query += ', image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Contact Messages
  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    db.prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(name, email, subject, message);
    res.json({ success: true });
  });

  app.get('/api/messages', authenticateToken, (req, res) => {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY timestamp DESC').all();
    res.json(messages);
  });

  // --- GITHUB REPOS API ---
  app.get('/api/github/repos', async (req, res) => {
    const username = process.env.GITHUB_USERNAME;
    if (!username) {
      return res.status(500).json({ error: 'GITHUB_USERNAME not configured' });
    }

    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        headers: {
          'User-Agent': 'Portfolio-App'
        }
      });
      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} ${response.statusText}`);
        throw new Error(`GitHub API error: ${response.statusText}`);
      }
      const repos = (await response.json()) as any[];

      const formattedRepos = repos.map((repo: any) => ({
        id: `gh-${repo.id}`,
        title: repo.name,
        description: repo.description || 'No description provided.',
        technologies: repo.language || 'Code',
        github_link: repo.html_url,
        live_link: repo.homepage || repo.html_url,
        image: null,
        is_visible: 1,
        created_at: repo.created_at
      }));

      res.json(formattedRepos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- CHAT API (THE_ORACLE) ---
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Oracle is offline.' });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        apiVersion: 'v1beta' // Supporting latest features
      });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: "You are 'THE_ORACLE', a mysterious, elite hacker-intelligence AI for a cybersecurity professional's portfolio. Your tone is professional, slightly cryptic, and uses hacker terminology (e.g., 'analyzing data packets', 'breaching firewall', 'secure signal established'). Keep responses concise and maintain the 'cyber' theme. Responses should be plain text, no markdown unless absolutely necessary."
        }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error('Oracle Error:', error);
      res.status(500).json({ error: 'SIGNAL_INTERRUPTED: Connection to Oracle lost.' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- SECURE_SIGNAL_ESTABLISHED ---`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "nutrition-tracker-secret-key-123";

// Database Initialization
const db = new Database("nutrition.db");

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    center_name TEXT,
    center_code TEXT,
    region TEXT,
    language TEXT DEFAULT 'English',
    role TEXT DEFAULT 'worker',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT,
    parent_name TEXT,
    contact TEXT,
    worker_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(worker_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS nutrition_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    height REAL NOT NULL,
    weight REAL NOT NULL,
    bmi REAL NOT NULL,
    status TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE
  );
`);

app.use(express.json());

// Middleware: Authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// API: Register
app.post("/api/register", async (req, res) => {
  const { username, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (username, password, name) VALUES (?, ?, ?)");
    const result = stmt.run(username, hashedPassword, name);
    res.json({ id: result.lastInsertRowid, message: "User registered successfully" });
  } catch (err: any) {
    res.status(400).json({ error: "Username already exists" });
  }
});

// API: Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, SECRET_KEY);
    res.json({ token, user: { 
      id: user.id, 
      username: user.username, 
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      center_name: user.center_name,
      center_code: user.center_code,
      region: user.region,
      language: user.language
    } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// API: Get Profile
app.get("/api/profile", authenticateToken, (req: any, res) => {
  const user: any = db.prepare("SELECT id, username, name, email, phone, avatar_url, center_name, center_code, region, language FROM users WHERE id = ?").get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(user);
});

// API: Update Profile
app.post("/api/update_profile", authenticateToken, (req: any, res) => {
  const { name, email, phone, center_name, center_code, region, language, avatar_url } = req.body;
  
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, center_name = ?, center_code = ?, region = ?, language = ?, avatar_url = ?
      WHERE id = ?
    `);
    stmt.run(name, email, phone, center_name, center_code, region, language, avatar_url, req.user.id);
    res.json({ message: "Profile updated successfully" });
  } catch (err: any) {
    res.status(400).json({ error: "Update failed" });
  }
});

// API: Dashboard Data
app.get("/api/dashboard_data", authenticateToken, (req: any, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Normal' THEN 1 ELSE 0 END) as normal,
      SUM(CASE WHEN status = 'Underweight' THEN 1 ELSE 0 END) as underweight,
      SUM(CASE WHEN status = 'Overweight' THEN 1 ELSE 0 END) as overweight
    FROM (
      SELECT child_id, status FROM nutrition_records
      WHERE id IN (SELECT MAX(id) FROM nutrition_records GROUP BY child_id)
    )
  `).get();

  const recentEntries = db.prepare(`
    SELECT c.name, n.bmi, n.status, n.recorded_at
    FROM children c
    JOIN nutrition_records n ON c.id = n.child_id
    ORDER BY n.recorded_at DESC
    LIMIT 5
  `).all();

  res.json({ stats, recentEntries });
});

// API: Add Child
app.post("/api/add_child", authenticateToken, (req: any, res) => {
  const { name, age, gender, parent_name, contact } = req.body;
  const stmt = db.prepare("INSERT INTO children (name, age, gender, parent_name, contact, worker_id) VALUES (?, ?, ?, ?, ?, ?)");
  const result = stmt.run(name, age, gender, parent_name, contact, req.user.id);
  res.json({ id: result.lastInsertRowid });
});

// API: Add Nutrition Record
app.post("/api/add_nutrition", authenticateToken, (req: any, res) => {
  const { child_id, height, weight, bmi, status } = req.body;
  const stmt = db.prepare("INSERT INTO nutrition_records (child_id, height, weight, bmi, status) VALUES (?, ?, ?, ?, ?)");
  const result = stmt.run(child_id, height, weight, bmi, status);
  res.json({ id: result.lastInsertRowid });
});

// API: Get Children
app.get("/api/children", authenticateToken, (req: any, res) => {
  const children = db.prepare(`
    SELECT c.*, n.bmi, n.status, n.height, n.weight, n.recorded_at
    FROM children c
    LEFT JOIN (
      SELECT * FROM nutrition_records 
      WHERE id IN (SELECT MAX(id) FROM nutrition_records GROUP BY child_id)
    ) n ON c.id = n.child_id
    ORDER BY c.name ASC
  `).all();
  res.json(children);
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// إعداد المسارات لنظام ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// سجل العمليات المبسط
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// تحديد مسار قاعدة البيانات بدقة
const dbPath = path.join(__dirname, 'water_system.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ خطأ في فتح قاعدة البيانات:', err.message);
  } else {
    console.log('🗄️  SQLite Connected: ' + dbPath);
  }
});

// إعداد الجداول (Schema Setup)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), institutionName TEXT, currency TEXT, defaultBranchId TEXT, logo TEXT, phone TEXT, fax TEXT, email TEXT, website TEXT, notes TEXT, lastClosedDate TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS branches (id TEXT PRIMARY KEY, name TEXT, location TEXT, manager TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, name TEXT, role TEXT, branchId TEXT, active INTEGER DEFAULT 1)`);
  db.run(`CREATE TABLE IF NOT EXISTS funds (id TEXT PRIMARY KEY, name TEXT, branchId TEXT, balance REAL DEFAULT 0, manager TEXT, openingBalance REAL DEFAULT 0, createdAt TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS collectors (id TEXT PRIMARY KEY, name TEXT, phone TEXT, fundId TEXT, branchId TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS subscriptionTypes (id TEXT PRIMARY KEY, name TEXT, tiers TEXT, fixedFee REAL DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS subscribers (id TEXT PRIMARY KEY, name TEXT, meterNumber TEXT UNIQUE, phone TEXT, email TEXT, website TEXT, address TEXT, country TEXT, governorate TEXT, region TEXT, docNumber TEXT, docType TEXT, docIssueDate TEXT, docIssuePlace TEXT, notes TEXT, balance REAL DEFAULT 0, initialReading REAL DEFAULT 0, branchId TEXT, typeId TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (id TEXT PRIMARY KEY, name TEXT, contactPerson TEXT, phone TEXT, email TEXT, address TEXT, paymentTerms TEXT, balance REAL DEFAULT 0, branchId TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS readings (id TEXT PRIMARY KEY, subscriberId TEXT, periodYear INTEGER, periodMonth INTEGER, previousReading REAL, currentReading REAL, units REAL, totalAmount REAL, date TEXT, branchId TEXT, status TEXT, isPosted INTEGER DEFAULT 0, postedBy TEXT, postedAt TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, readingId TEXT, subscriberId TEXT, invoiceNumber TEXT UNIQUE, date TEXT, issueDate TEXT, dueDate TEXT, amount REAL, arrears REAL, totalDue REAL, status TEXT, branchId TEXT, isPosted INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, subscriberId TEXT, collectorId TEXT, fundId TEXT, description TEXT, amount REAL, date TEXT, paymentMethod TEXT, reference TEXT UNIQUE, branchId TEXT, isPosted INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS settlements (id TEXT PRIMARY KEY, subscriberId TEXT, type TEXT, amount REAL, newReading REAL, description TEXT, date TEXT, reference TEXT UNIQUE, branchId TEXT, isPosted INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, category TEXT, fundId TEXT, description TEXT, amount REAL, date TEXT, reference TEXT, supplierId TEXT, branchId TEXT, isPosted INTEGER DEFAULT 0)`);
  db.run(`CREATE TABLE IF NOT EXISTS journal (id TEXT PRIMARY KEY, date TEXT, referenceId TEXT, referenceType TEXT, description TEXT, debit REAL DEFAULT 0, credit REAL DEFAULT 0, accountId TEXT, accountType TEXT, branchId TEXT)`);

  // بيانات التأسيس
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO users (id, username, password, name, role, branchId, active) VALUES (?,?,?,?,?,?,?)", ['u-admin', 'admin', 'admin', 'المدير العام', 'admin', 'br-main', 1]);
      db.run("INSERT INTO branches (id, name, location, manager) VALUES (?,?,?,?)", ['br-main', 'الفرع الرئيسي', 'المركز الرئيسي', 'الإدارة العامة']);
      db.run("INSERT INTO settings (id, institutionName, currency, defaultBranchId) VALUES (?,?,?,?)", [1, 'مؤسسة المياه الوطنية', 'ريال', 'br-main']);
    }
  });
});

app.get('/health', (req, res) => res.json({ status: 'active' }));

app.get('/api/app/settings', (req, res) => {
  db.get(`SELECT * FROM settings WHERE id = 1`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

app.get('/api/:table', (req, res) => {
  const { table } = req.params;
  db.all(`SELECT * FROM ${table}`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => {
      const r = { ...row };
      if (r.tiers) try { r.tiers = JSON.parse(r.tiers); } catch (e) {}
      if (r.isPosted !== undefined) r.isPosted = !!r.isPosted;
      if (r.active !== undefined) r.active = !!r.active;
      return r;
    }));
  });
});

app.post('/api/:table', (req, res) => {
  const { table } = req.params;
  const data = req.body;
  const keys = Object.keys(data);
  const values = keys.map(k => {
    let val = data[k];
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return JSON.stringify(val);
    return val;
  });
  const placeholders = keys.map(() => '?').join(',');
  const query = `INSERT OR REPLACE INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
  
  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: data.id || this.lastID });
  });
});

app.delete('/api/:table/:id', (req, res) => {
  db.run(`DELETE FROM ${req.params.table} WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import cors from "cors";
import csrf from "csurf";
import cookieParser from "cookie-parser";

const app = express();
const csrfProtection = csrf({ cookie: true });

app.use(express.json());
app.use(cookieParser()); 

// CORS configuration
app.use(
  cors({
    origin: "http://20.92.224.237/reinaldy", 
    optionsSuccessStatus: 200,
    credentials: true, 
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const connection = new sqlite3.Database("./db/aplikasi.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// sANITIZE INPUT USER UNTUK MENCEGAH XSS
const sanitizeInput = (input) => {
  return input.replace(/<[^>]*>?/gm, '');
};

// SQL Injection Protection 
app.get("/api/user/:id", (req, res) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  connection.all(query, [req.params.id], (error, results) => {
    if (error) {
      res.status(500).send("Error fetching user data");
      return;
    }
    res.json(results);
  });
});

// CSRF
app.post("/api/user/:id/change-email", csrfProtection, (req, res) => {
  const newEmail = sanitizeInput(req.body.email);
  const query = `UPDATE users SET email = ? WHERE id = ?`;

  connection.run(query, [newEmail, req.params.id], function (err) {
    if (err) {
      res.status(500).send("Error updating email");
      return;
    }
    if (this.changes === 0) res.status(404).send("User not found");
    else res.status(200).send("Email updated successfully");
  });
});

//PATH TRAVERSAL FIX
app.get("/api/file", (req, res) => {
  const filename = path.basename(req.query.name); // Sanitize input 
  const filePath = path.join(__dirname, "files", filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

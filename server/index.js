//.env file
require("dotenv").config();
// Import express framework (used to create the server)
const express = require("express");

// Import PostgreSQL connection tool
const { Pool } = require("pg");


//  database


console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("DB_NAME =", process.env.DB_NAME);



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});



// Import CORS (allows frontend to talk to backend)
const cors = require("cors");




// Import password hashing library
const bcrypt = require("bcrypt");

// Import JWT library (for login tokens)
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_secret";
// Create express app
const app = express();

// Allow cross-origin requests (React -> backend)
app.use(cors());

// Allow server to read JSON from requests
app.use(express.json());

//TESTINGGGGGGG//
// TEST ROUTE #1 - put this FIRST
app.get("/dbtest", (req, res) => {
  res.json({ message: "ROUTES ARE WORKING!" });
});

console.log("DATABASE_URL =", process.env.DATABASE_URL);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//////////////////////////////////////////////////

//TESTIN

app.get("/dbtest", async (req, res) => {
  try {
    const r = await pool.query("SELECT current_database() AS db, NOW() AS now");
    res.json(r.rows[0]);
  } catch (e) {
    console.error("DBTEST ERROR:", e);
    res.status(500).json({ error: e.message });
  }
});

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

//testing
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//----- Role-based Access Control Middleware ------------------------------

// Middleware to restrict by role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}


//test employer-only route
app.get("/employer-only",
  authenticateToken,
  requireRole("employer"),
  (req, res) => {
    res.json({ message: "Welcome employer!" });
  }
);

// Route to create a new job (only for employers)

app.post("/jobs", authenticateToken, requireRole("employer"), async (req, res) => {
  try {
    const { title, description, location, employment_type } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (title, description, location, employment_type, employer_user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, location, employment_type, req.user.userId]
    );

    res.json({ job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//list job

app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, location, employment_type, status, created_at
       FROM jobs
       WHERE status = 'open'
       ORDER BY created_at DESC`
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to apply for a job (only for candidates)

app.post("/jobs/:id/apply", authenticateToken, requireRole("candidate"), async (req, res) => {
  try {
    const jobId = req.params.id;
    const { cover_letter } = req.body;

    const result = await pool.query(
      `INSERT INTO applications (job_id, candidate_user_id, cover_letter)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [jobId, req.user.userId, cover_letter || null]
    );

    res.json({ application: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "You already applied to this job" });
    }
    res.status(500).json({ error: err.message });
  }
});



// employer can see applications for their job

app.get("/employer/jobs/:id/applications", authenticateToken, requireRole("employer"), async (req, res) => {
  try {
    const jobId = req.params.id;

    // check the job belongs to this employer
    const jobCheck = await pool.query(
      "SELECT id FROM jobs WHERE id = $1 AND employer_user_id = $2",
      [jobId, req.user.userId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed (job not yours)" });
    }

    // return applicants
    const result = await pool.query(
      `SELECT a.id, a.status, a.applied_at, a.cover_letter,
              u.id AS candidate_id, u.name AS candidate_name, u.email AS candidate_email
       FROM applications a
       JOIN users u ON u.id = a.candidate_user_id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [jobId]
    );

    res.json({ applications: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





//----- Authentication Middleware ------------------------------


// Middleware function to check if user is logged in
function authenticateToken(req, res, next) {

  // Get the Authorization header from request
  const authHeader = req.headers.authorization;

  // If there is no header → user not logged in
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Header looks like: "Bearer TOKEN"
  // We split it and take the token part
  const token = authHeader.split(" ")[1];

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded info to request object
    // Now req.user contains { userId, role }
    req.user = decoded;

    // Continue to the actual route
    next();

  } catch (err) {
    // If token is invalid or expired
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}




//----- sign up ------------------------------

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow candidate or employer
    if (!["candidate", "employer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hash, role]
    );

    res.json({ user: result.rows[0] });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: err.message });
  }
});


//----- get current user info ------------------------------

// This route returns the currently logged-in user's info
// BUT only if they provide a valid token.
app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    // req.user.userId came from the token (decoded in middleware)
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.userId]
    );

    // If user doesn't exist anymore
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user info
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





//----- login ------------------------------

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) find user by email
    const result = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // 2) compare password with hashed password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3) make a token that stores user id + role
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4) send token + basic user info (no password_hash!)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





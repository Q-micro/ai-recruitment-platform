// Main server file for the ATS application. This file sets up the Express server, connects to the PostgreSQL database, and defines all API routes and business logic for handling candidate profiles, job listings, applications, employer company registration, and admin dashboard features.
// It also includes middleware for authentication, role-based access control, and file uploads, as well as utility functions for processing CV files and generating ATS-friendly PDFs.
// Note: This file is quite large and contains a lot of functionality. In a production application, you would likely want to split this into multiple modules for better organization and maintainability. However, for the sake of this example, everything is contained in a single file.
// =========================
// Imports and environment setup
// =========================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { createClient } from "@supabase/supabase-js";
dotenv.config();

// For handling file paths in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase storage client used for candidate CV files.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const CV_BUCKET = process.env.SUPABASE_CV_BUCKET || "candidate-cvs";

// Sanitizes uploaded CV file names before saving them.
function safeFileName(name) {
  const ext = path.extname(name || ".pdf").toLowerCase() || ".pdf";

  const base = path
    .basename(name || "cv", ext)
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return `${base || "cv"}${ext}`;
}

// Uploads candidate CV files to Supabase storage and returns the public URL.
async function uploadCvToSupabase({ candidateId, file, folder = "original" }) {
  const fileName = safeFileName(file.originalname);

  const filePath = [
    `candidate-${candidateId}`,
    folder,
    `${Date.now()}-${fileName}`,
  ].join("/");

  console.log("Uploading to Supabase path:", filePath);

  const { data, error } = await supabase.storage
    .from(CV_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype || "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from(CV_BUCKET)
    .getPublicUrl(data.path);

  return {
    filePath: data.path,
    publicUrl: publicData.publicUrl,
  };
}

dotenv.config();

// OpenAI client for AI-powered backend features.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

const { Pool } = pkg;

// Express app configuration and upload folders.
const app = express();
const cvUpload = multer({ dest: "uploads/" });
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsRoot = path.join(__dirname, "uploads");
const cvUploadsDir = path.join(uploadsRoot, "cv");

fs.mkdirSync(cvUploadsDir, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(null, `${Date.now()}-${safeBaseName}${ext}`);
  },
});

const cvFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    return cb(null, true);
  }

  cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
};

const uploadCV = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.use("/uploads", express.static(uploadsRoot));

// PostgreSQL database connection.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Start the API server.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/api", (req, res) => {
  res.json({ message: "Server is running" });
});

// Extracts readable text from uploaded CV files.
async function extractTextFromCv(file) {
  if (!file) {
    throw new Error("No CV file uploaded");
  }

  const mime = file.mimetype || "";
  const originalName = file.originalname || "";

  if (
    mime === "application/pdf" ||
    originalName.toLowerCase().endsWith(".pdf")
  ) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || "";
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    originalName.toLowerCase().endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || "";
  }

  if (mime === "text/plain" || originalName.toLowerCase().endsWith(".txt")) {
    return file.buffer.toString("utf8");
  }

  throw new Error("Unsupported CV file type. Please upload PDF, DOCX, or TXT.");
}

// Shared text formatting helpers.
function cleanText(value) {
  if (!value) return "";
  return String(value).trim();
}

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseLines(value) {
  if (!value) return [];
  return String(value)
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function validateAtsProfile(candidate) {
  const missing = [];

  if (!cleanText(candidate.full_name)) missing.push("Full name");
  if (!cleanText(candidate.email)) missing.push("Email");
  if (!cleanText(candidate.phone)) missing.push("Phone");
  if (!cleanText(candidate.skills)) missing.push("Skills");
  if (!cleanText(candidate.experience)) missing.push("Experience");
  if (!cleanText(candidate.education)) missing.push("Education");

  return missing;
}

function drawSectionTitle(doc, title) {
  doc.moveDown(1.1);
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#111111")
    .text(title.toUpperCase());
  doc
    .moveTo(doc.x, doc.y + 3)
    .lineTo(550, doc.y + 3)
    .strokeColor("#555555")
    .lineWidth(0.6)
    .stroke();
  doc.moveDown(0.7);
}

function drawBullet(doc, text) {
  if (!text) return;
  const startX = doc.x;
  const y = doc.y;
  doc.font("Helvetica").fontSize(10.5).fillColor("#111111");
  doc.text("•", startX, y, { continued: true });
  doc.text("  " + text, {
    width: 470,
    align: "left",
  });
}

function drawTwoColumnBullets(doc, items) {
  if (!Array.isArray(items) || items.length === 0) return;

  const leftX = 62;
  const rightX = 315;
  const startY = doc.y;
  const rowHeight = 18;
  const half = Math.ceil(items.length / 2);

  doc.font("Helvetica").fontSize(10.8).fillColor("#111111");

  items.slice(0, half).forEach((item, index) => {
    const y = startY + index * rowHeight;
    doc.text("•", leftX, y);
    doc.text(cleanText(item), leftX + 18, y, { width: 210 });
  });

  items.slice(half).forEach((item, index) => {
    const y = startY + index * rowHeight;
    doc.text("•", rightX, y);
    doc.text(cleanText(item), rightX + 18, y, { width: 210 });
  });

  doc.y = startY + Math.max(half, items.length - half) * rowHeight + 4;
}

// Creates an ATS-friendly PDF version of a candidate profile.
async function createAtsPdf({ candidate, generated, filePath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 48,
        bottom: 48,
        left: 50,
        right: 50,
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const fullName = cleanText(
      candidate.full_name || generated.full_name,
    ).toUpperCase();
    const headline = cleanText(
      generated.headline ||
        candidate.current_position ||
        candidate.desired_position,
    );
    const contactItems = [
      cleanText(candidate.email),
      cleanText(candidate.phone),
      cleanText(candidate.location || candidate.preferred_locations),
      cleanText(candidate.linkedin),
      cleanText(candidate.github),
      cleanText(candidate.portfolio),
    ].filter(Boolean);

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#000000")
      .text(fullName || "CANDIDATE CV", {
        align: "center",
      });

    if (headline) {
      doc.moveDown(0.45);
      doc.font("Helvetica-Bold").fontSize(12).text(headline, {
        align: "center",
      });
    }

    if (contactItems.length) {
      doc.moveDown(0.45);
      doc.font("Helvetica").fontSize(10.5).text(contactItems.join(" | "), {
        align: "center",
      });
    }

    drawSectionTitle(doc, "Professional Summary");
    doc
      .font("Helvetica")
      .fontSize(10.8)
      .fillColor("#111111")
      .text(cleanText(generated.professional_summary), {
        align: "left",
        lineGap: 2,
      });

    const experience = Array.isArray(generated.work_experience)
      ? generated.work_experience
      : [];
    if (experience.length) {
      drawSectionTitle(doc, "Work Experience");

      experience.forEach((item, index) => {
        if (index > 0) doc.moveDown(0.8);

        const title = cleanText(item.title);
        const company = cleanText(item.company);
        const dates = cleanText(item.dates);

        doc
          .font("Helvetica-Bold")
          .fontSize(11.5)
          .text(title || "Experience", {
            continued: Boolean(dates),
          });

        if (dates) {
          doc.font("Helvetica-Bold").fontSize(10.5).text(dates, {
            align: "right",
          });
        }

        if (company) {
          doc.font("Helvetica-Bold").fontSize(10.5).text(company);
        }

        const bullets = Array.isArray(item.bullets) ? item.bullets : [];
        bullets.slice(0, 6).forEach((bullet) => drawBullet(doc, bullet));
      });
    }

    const education = Array.isArray(generated.education)
      ? generated.education
      : [];
    if (education.length) {
      drawSectionTitle(doc, "Education");

      education.forEach((item) => {
        const degree = cleanText(item.degree);
        const institution = cleanText(item.institution);
        const dates = cleanText(item.dates);

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(degree || "Education", {
            continued: Boolean(dates),
          });

        if (dates) {
          doc.font("Helvetica-Bold").fontSize(10.5).text(dates, {
            align: "right",
          });
        }

        if (institution) {
          doc.font("Helvetica").fontSize(10.5).text(institution);
        }

        doc.moveDown(0.4);
      });
    }

    const skills = Array.isArray(generated.skills) ? generated.skills : [];
    if (skills.length) {
      drawSectionTitle(doc, "Skills");
      drawTwoColumnBullets(doc, skills);

      doc.moveDown(1);
      doc.x = 50;
    }

    const languages = Array.isArray(generated.languages)
      ? generated.languages
      : [];
    if (languages.length) {
      doc.x = 50;
      doc.moveDown(0.5);

      drawSectionTitle(doc, "Languages");
      languages.forEach((lang) => {
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .text(`• ${cleanText(lang)}`, {
            lineGap: 1,
          });

        doc.moveDown(0.3);
      });
    }

    const certifications = Array.isArray(generated.certifications)
      ? generated.certifications
      : [];
    if (certifications.length) {
      drawSectionTitle(doc, "Certifications");
      certifications.forEach((cert) => drawBullet(doc, cert));
    }

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// Role-based access control middleware.
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

app.get(
  "/employer-only",
  authenticateToken,
  requireRole("employer"),
  (req, res) => {
    res.json({ message: "Welcome employer!" });
  },
);

app.post(
  "/jobs",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const { title, description, location, employment_type } = req.body;

      const result = await pool.query(
        `INSERT INTO jobs (title, description, location, employment_type, employer_user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [title, description, location, employment_type, req.user.userId],
      );

      res.json({ job: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Public candidate job listing route.
app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, location, employment_type, status, created_at
       FROM jobs
       WHERE status = 'open'
       ORDER BY created_at DESC`,
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/jobs/:id/apply",
  authenticateToken,
  requireRole("candidate"),
  async (req, res) => {
    try {
      const jobId = req.params.id;
      const { cover_letter } = req.body;

      const result = await pool.query(
        `INSERT INTO applications (job_id, candidate_user_id, cover_letter)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [jobId, req.user.userId, cover_letter || null],
      );

      res.json({ application: result.rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        return res
          .status(400)
          .json({ error: "You already applied to this job" });
      }
      res.status(500).json({ error: err.message });
    }
  },
);

app.get(
  "/employer/jobs/:id/applications",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const jobId = req.params.id;

      const jobCheck = await pool.query(
        "SELECT id FROM jobs WHERE id = $1 AND employer_user_id = $2",
        [jobId, req.user.userId],
      );

      if (jobCheck.rows.length === 0) {
        return res.status(403).json({ error: "Not allowed (job not yours)" });
      }

      const result = await pool.query(
        `
  SELECT
    a.id,
    a.status,
    a.applied_at,
    a.cover_letter,

    u.id AS candidate_user_id,
    u.name AS candidate_name,
    u.email AS candidate_email,

    c.id AS candidate_id,
    c.full_name,
    c.phone,
    c.email AS profile_email,
    c.nationality,
    c.current_position,
    c.desired_position,
    c.expected_salary,
    c.candidate_status,
    c.cv_url,
    c.skills,
    c.experience,
    c.education,
    c.linkedin,
    c.portfolio,
    c.summary

  FROM applications a
  LEFT JOIN candidates c
    ON c.id = a.candidate_id
  LEFT JOIN users u
    ON u.id = c.user_id
  WHERE a.job_id = $1
  ORDER BY a.applied_at DESC
  `,
        [jobId],
      );

      res.json({ applications: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// JWT authentication middleware.
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// Ensures employers can only continue after company approval.
async function requireApprovedCompany(req, res, next) {
  try {
    const result = await pool.query(
      `
      SELECT id, status
      FROM companies
      WHERE created_by_user_id = $1
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [req.user.userId],
    );

    const company = result.rows[0];

    if (!company) {
      return res.status(403).json({ error: "Company registration required" });
    }

    if (company.status !== "approved") {
      return res.status(403).json({ error: "Company is not approved yet" });
    }

    req.company = company;
    next();
  } catch (error) {
    console.error("requireApprovedCompany error:", error);
    res.status(500).json({ error: "Failed to verify company approval" });
  }
}

// Authentication routes.
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["candidate", "employer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role
      `,
      [name, email, hash, role],
    );

    const newUser = userResult.rows[0];

    let candidateProfile = null;

    if (role === "candidate") {
      const candidateResult = await pool.query(
        `
        INSERT INTO candidates (
          user_id,
          full_name,
          email,
          candidate_status,
          plan_type
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [newUser.id, newUser.name, newUser.email, "new", "regular"],
      );

      candidateProfile = candidateResult.rows[0];
    }

    return res.status(201).json({
      user: newUser,
      candidate: candidateProfile,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.password_hash,
        c.id AS candidate_id
      FROM users u
      LEFT JOIN candidates c ON c.user_id = u.id
      WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
      LIMIT 1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidate_id: user.candidate_id || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", detail: error.message });
  }
});

// Employer company registration and profile routes.
app.post(
  "/api/employer/company",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        website,
        industry,
        location,
        description,
        cr_number,
      } = req.body;

      const createdByUserId = req.user.userId;

      if (!name || !cr_number) {
        return res.status(400).json({
          error: "Company name and CR number are required",
        });
      }

      const existing = await pool.query(
        `
        SELECT id
        FROM companies
        WHERE created_by_user_id = $1
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [createdByUserId],
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          error: "You already submitted a company registration",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO companies (
          name,
          email,
          phone,
          website,
          industry,
          location,
          description,
          cr_number,
          status,
          created_by_user_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9)
        RETURNING *
        `,
        [
          name,
          email || null,
          phone || null,
          website || null,
          industry || null,
          location || null,
          description || null,
          cr_number || null,
          createdByUserId,
        ],
      );

      const company = result.rows[0];

      await pool.query(
        `
        INSERT INTO notifications (
          role,
          title,
          message,
          type,
          link,
          is_read,
          created_at
        )
        VALUES (
          'admin',
          'New employer registration',
          $1,
          'employer_registration',
          '/admin/companies',
          FALSE,
          CURRENT_TIMESTAMP
        )
        `,
        [`${company.name} registered and is waiting for approval.`],
      );

      res.status(201).json({
        message: "Company submitted for approval",
        company,
      });
    } catch (error) {
      console.error("POST /api/employer/company error:", error);

      if (error.code === "23505") {
        return res.status(400).json({
          error: "This CR number is already registered",
        });
      }

      res.status(500).json({
        error: "Failed to register company",
      });
    }
  },
);

app.get(
  "/api/employer/company/:userId",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const result = await pool.query(
        `
      SELECT *
      FROM companies
      WHERE created_by_user_id = $1
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
      `,
        [userId],
      );

      res.json({
        company: result.rows[0] || null,
      });
    } catch (error) {
      console.error("GET /api/employer/company/:userId error:", error);
      res.status(500).json({
        error: "Failed to fetch employer company",
        detail: error.message,
      });
    }
  },
);

// Admin candidate management routes.
app.get(
  "/admin/candidates",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT
        c.*,
        u.email AS user_email,
        u.created_at AS user_created_at,
        rt.id AS recruitment_track_id,
        rt.status AS recruitment_status,
        rt.client_name AS recruitment_client,
        rt.notes AS recruitment_notes,
        rt.updated_at AS recruitment_updated_at
      FROM candidates c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN LATERAL (
        SELECT *
        FROM candidate_recruitment_tracks crt
        WHERE crt.candidate_id = c.id
        ORDER BY crt.updated_at DESC, crt.created_at DESC
        LIMIT 1
      ) rt ON TRUE
      ORDER BY c.created_at DESC NULLS LAST
    `);

      res.json({
        candidates: result.rows,
      });
    } catch (error) {
      console.error("GET /admin/candidates error:", error);
      res.status(500).json({
        error: "Failed to fetch candidates",
      });
    }
  },
);

app.put(
  "/admin/candidates/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        date,
        full_name,
        phone,
        email,
        interview_showed_up,
        vip,
        sold_by,
        nationality,
        current_position,
        candidate_status,
        desired_position,
        expected_salary,
        plan_type,
        payment_screenshot_url,
        payment_amount,
      } = req.body;

      const result = await pool.query(
        `
      UPDATE candidates
      SET
        date = $1,
        full_name = $2,
        phone = $3,
        email = $4,
        interview_showed_up = $5,
        vip = $6,
        sold_by = $7,
        nationality = $8,
        current_position = $9,
        candidate_status = $10,
        desired_position = $11,
        expected_salary = $12,
        plan_type = $13,
        payment_screenshot_url = $14,
        payment_amount = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *
      `,
        [
          date || null,
          full_name || null,
          phone || null,
          email || null,
          interview_showed_up ?? false,
          vip ?? false,
          sold_by || null,
          nationality || null,
          current_position || null,
          candidate_status || null,
          desired_position || null,
          expected_salary || null,
          plan_type || null,
          payment_screenshot_url || null,
          payment_amount || null,
          id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      res.json({ candidate: result.rows[0] });
    } catch (err) {
      console.error("PUT /admin/candidates/:id ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.delete(
  "/admin/candidates/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
      DELETE FROM candidates
      WHERE id = $1
      RETURNING id
      `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      res.json({ message: "Candidate deleted successfully" });
    } catch (err) {
      console.error("DELETE /admin/candidates/:id ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

// Admin dashboard and reporting routes.
app.get(
  "/admin/dashboard",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const month = req.query.month; // example: 2026-03

      let monthStart = null;
      let monthEnd = null;

      if (month) {
        monthStart = `${month}-01`;
        monthEnd = `${month}-31`;
      }

      const totalCandidatesQuery = await pool.query(
        `SELECT COUNT(*) AS count FROM candidates`,
      );

      const totalJobsQuery = await pool.query(
        `SELECT COUNT(*) AS count FROM jobs`,
      );

      const interviewedQuery = await pool.query(
        `
      SELECT COUNT(*) AS count
      FROM candidate
      WHERE interview_showed_up = true
      AND ($1::date IS NULL OR date >= $1::date)
      AND ($2::date IS NULL OR date <= $2::date)
      `,
        [monthStart, monthEnd],
      );

      const hiredQuery = await pool.query(
        `
      SELECT COUNT(*) AS count
      FROM candidate
      WHERE LOWER(COALESCE(current_stage, '')) = 'hired'
      AND ($1::date IS NULL OR date >= $1::date)
      AND ($2::date IS NULL OR date <= $2::date)
      `,
        [monthStart, monthEnd],
      );

      const salesQuery = await pool.query(
        `
      SELECT COALESCE(SUM(sales_amount), 0) AS total
      FROM sales
      WHERE ($1::date IS NULL OR sale_date >= $1::date)
      AND ($2::date IS NULL OR sale_date <= $2::date)
      `,
        [monthStart, monthEnd],
      );

      res.json({
        totalCandidates: Number(totalCandidatesQuery.rows[0].count),
        totalJobsPosted: Number(totalJobsQuery.rows[0].count),
        interviewedThisMonth: Number(interviewedQuery.rows[0].count),
        hiredThisMonth: Number(hiredQuery.rows[0].count),
        salesThisMonth: Number(salesQuery.rows[0].total),
      });
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.get(
  "/api/admin/sales",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT
        id,
        sale_date,
        sales_amount,
        signups,
        expenses,
        refunds,
        gross_profit,
        description,
        sales_agent,
        created_at
      FROM sales
      ORDER BY sale_date DESC, id DESC
    `);

      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({
        message: "Failed to fetch sales",
        error: error.message,
      });
    }
  },
);

// Admin job management routes.
app.get(
  "/admin/jobs",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
  SELECT
    j.*,
    c.name AS company_name
  FROM jobs j
  LEFT JOIN companies c ON c.id = j.company_id
  WHERE j.deleted_at IS NULL
  ORDER BY j.created_at DESC
`);

      res.json({ jobs: result.rows });
    } catch (error) {
      console.error("GET /admin/jobs error:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  },
);

app.post(
  "/admin/jobs",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        title,
        position,
        salary,
        location,
        job_type,
        source,
        contact_email,
        contact_phone,
        description,
        is_visible,
        status,
        created_by_user_id,
      } = req.body;

      if (!title || !position || !job_type) {
        return res.status(400).json({
          error: "title, position, and job_type are required",
        });
      }

      const result = await pool.query(
        `
      INSERT INTO jobs (
        title,
        position,
        salary,
        location,
        job_type,
        source,
        contact_email,
        contact_phone,
        description,
        is_visible,
        created_by_role,
        created_by_user_id,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, 'admin', $11, $12
      )
      RETURNING *
      `,
        [
          title,
          position,
          salary || null,
          location || null,
          job_type,
          source || null,
          contact_email || null,
          contact_phone || null,
          description || null,
          typeof is_visible === "boolean" ? is_visible : true,
          created_by_user_id || null,
          status || "open",
        ],
      );

      res.status(201).json({
        message: "Job created successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("POST /admin/jobs error:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  },
);

app.put(
  "/admin/jobs/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        position,
        salary,
        location,
        job_type,
        source,
        contact_email,
        contact_phone,
        description,
        is_visible,
        status,
      } = req.body;

      if (!title || !position || !job_type) {
        return res.status(400).json({
          error: "title, position, and job_type are required",
        });
      }

      const existing = await pool.query(
        `SELECT * FROM jobs WHERE id = $1 AND deleted_at IS NULL`,
        [id],
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      const result = await pool.query(
        `
      UPDATE jobs
      SET
        title = $1,
        position = $2,
        salary = $3,
        location = $4,
        job_type = $5,
        source = $6,
        contact_email = $7,
        contact_phone = $8,
        description = $9,
        is_visible = $10,
        status = $11
      WHERE id = $12
      RETURNING *
      `,
        [
          title,
          position,
          salary || null,
          location || null,
          job_type,
          source || null,
          contact_email || null,
          contact_phone || null,
          description || null,
          typeof is_visible === "boolean" ? is_visible : true,
          status || "open",
          id,
        ],
      );

      res.json({
        message: "Job updated successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("PUT /admin/jobs/:id error:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  },
);

app.patch(
  "/admin/jobs/:id/close",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
      UPDATE jobs
      SET
        status = 'closed',
        is_visible = false
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING *
      `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({
        message: "Job closed successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /admin/jobs/:id/close error:", error);
      res.status(500).json({ error: "Failed to close job" });
    }
  },
);

app.delete(
  "/admin/jobs/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
      UPDATE jobs
      SET
        deleted_at = CURRENT_TIMESTAMP,
        status = 'closed',
        is_visible = false
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING *
      `,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({
        message: "Job deleted successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("DELETE /admin/jobs/:id error:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  },
);

app.get("/jobs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM jobs
      WHERE deleted_at IS NULL
        AND is_visible = true
        AND status = 'open'
      ORDER BY created_at DESC
    `);

    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("GET /jobs error:", error);
    res.status(500).json({ error: "Failed to fetch candidate jobs" });
  }
});

// Employer job and application management routes.
app.get(
  "/employer/jobs",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const companyId = req.company?.id;

      const result = await pool.query(
        `
        SELECT
          j.*,
          c.name AS company_name
        FROM jobs j
        LEFT JOIN companies c ON c.id = j.company_id
        WHERE j.company_id = $1
          AND (j.deleted_at IS NULL OR j.deleted_at IS NULL)
        ORDER BY j.created_at DESC
        `,
        [companyId],
      );

      res.json({ jobs: result.rows });
    } catch (error) {
      console.error("GET /employer/jobs error:", error);
      res.status(500).json({ error: "Failed to fetch employer jobs" });
    }
  },
);

app.get(
  "/employer/applications",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const companyId = req.company.id;

      const result = await pool.query(
        `
        SELECT
          a.*,

          j.id AS job_id,
          j.title AS job_title,
          j.position AS job_position,
          j.salary AS job_salary,
          j.location AS job_location,
          j.job_type AS job_type,
          j.description AS job_description,

          c.id AS candidate_id,
          c.full_name AS candidate_name,
          c.email AS candidate_email,
          c.phone AS candidate_phone,
          c.nationality,
          c.current_position,
          c.desired_position,
          c.expected_salary,
          c.candidate_status,
          c.cv_url,
          c.skills,
          c.experience,
          c.education,
          c.linkedin,
          c.portfolio,
          c.summary,
          c.preferred_job_titles,
          c.preferred_job_types,
          c.preferred_locations,
          c.minimum_salary,
          c.work_type_preference,
          c.availability

        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        JOIN candidates c ON c.id = a.candidate_id
        WHERE j.company_id = $1
        ORDER BY a.applied_at DESC
        `,
        [companyId],
      );

      const applicationsWithMatch = result.rows
        .map((app) => {
          const candidate = {
            skills: app.skills,
            preferred_job_titles:
              app.preferred_job_titles || app.desired_position,
            preferred_job_types:
              app.preferred_job_types || app.work_type_preference,
            preferred_locations: app.preferred_locations,
            minimum_salary: app.minimum_salary || app.expected_salary,
            experience: app.experience,
            education: app.education,
            summary: app.summary,
            current_position: app.current_position,
            desired_position: app.desired_position,
          };

          const job = {
            title: app.job_title,
            position: app.job_position,
            salary: app.job_salary,
            location: app.job_location,
            job_type: app.job_type,
            description: app.job_description,
          };

          return {
            ...app,
            ...calculateJobMatch(candidate, job),
          };
        })
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      res.json({ applications: applicationsWithMatch });
    } catch (error) {
      console.error("GET /employer/applications error:", error);
      res.status(500).json({ error: "Failed to fetch employer applications" });
    }
  },
);

app.post(
  "/employer/jobs",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const {
        title,
        position,
        salary,
        location,
        job_type,
        source,
        contact_email,
        contact_phone,
        description,
        is_visible,
        status,
      } = req.body;

      if (!title || !position || !job_type) {
        return res.status(400).json({
          error: "title, position, and job_type are required",
        });
      }

      const companyId = req.company?.id;

      if (!companyId) {
        return res.status(400).json({
          error: "Approved company not found",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO jobs (
          title,
          position,
          salary,
          location,
          job_type,
          source,
          contact_email,
          contact_phone,
          description,
          is_visible,
          created_by_role,
          created_by_user_id,
          company_id,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, 'employer', $11, $12, $13
        )
        RETURNING *
        `,
        [
          title,
          position,
          salary || null,
          location || null,
          job_type,
          source || null,
          contact_email || null,
          contact_phone || null,
          description || null,
          typeof is_visible === "boolean" ? is_visible : true,
          req.user.userId,
          companyId,
          status || "open",
        ],
      );

      res.status(201).json({
        message: "Employer job created successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("POST /employer/jobs error:", error);
      res.status(500).json({ error: "Failed to create employer job" });
    }
  },
);

app.put(
  "/employer/jobs/:id",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        position,
        salary,
        location,
        job_type,
        source,
        contact_email,
        contact_phone,
        description,
        is_visible,
        status,
      } = req.body;

      if (!title || !position || !job_type) {
        return res.status(400).json({
          error: "title, position, and job_type are required",
        });
      }

      const companyId = req.company.id;

      const existing = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
          AND company_id = $2
          AND deleted_at IS NULL
        `,
        [id, companyId],
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          error: "Job not found or not yours",
        });
      }

      const result = await pool.query(
        `
        UPDATE jobs
        SET
          title = $1,
          position = $2,
          salary = $3,
          location = $4,
          job_type = $5,
          source = $6,
          contact_email = $7,
          contact_phone = $8,
          description = $9,
          is_visible = $10,
          status = $11
        WHERE id = $12
        RETURNING *
        `,
        [
          title,
          position,
          salary || null,
          location || null,
          job_type,
          source || null,
          contact_email || null,
          contact_phone || null,
          description || null,
          typeof is_visible === "boolean" ? is_visible : true,
          status || "open",
          id,
        ],
      );

      res.json({
        message: "Employer job updated successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("PUT /employer/jobs/:id error:", error);
      res.status(500).json({ error: "Failed to update employer job" });
    }
  },
);

app.patch(
  "/employer/jobs/:id/close",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const { id } = req.params;

      const companyId = req.company.id;

      const existing = await pool.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
          AND company_id = $2
          AND deleted_at IS NULL
        `,
        [id, companyId],
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          error: "Job not found or not yours",
        });
      }

      const result = await pool.query(
        `
        UPDATE jobs
        SET status = 'closed', is_visible = false
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      res.json({
        message: "Employer job closed successfully",
        job: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /employer/jobs/:id/close error:", error);
      res.status(500).json({ error: "Failed to close employer job" });
    }
  },
);

// Admin sales management routes.
app.post(
  "/api/admin/sales",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        sale_date,
        sales_amount = 0,
        signups = 0,
        expenses = 0,
        refunds = 0,
        description = "",
        sales_agent = "",
      } = req.body;

      if (!sale_date) {
        return res.status(400).json({ error: "sale_date is required" });
      }

      if (!sales_agent || !sales_agent.trim()) {
        return res.status(400).json({ error: "sales_agent is required" });
      }

      const query = `
      INSERT INTO sales (
        sale_date,
        sales_amount,
        signups,
        expenses,
        refunds,
        description,
        sales_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

      const values = [
        sale_date,
        Number(sales_amount || 0),
        Number(signups || 0),
        Number(expenses || 0),
        Number(refunds || 0),
        description,
        sales_agent.trim(),
      ];

      const result = await pool.query(query, values);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("POST /api/admin/sales error:", error);
      res.status(500).json({ error: "Failed to create sale" });
    }
  },
);

app.get(
  "/api/admin/sales",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT *
      FROM sales
      ORDER BY sale_date ASC, id ASC
    `);

      res.json(result.rows);
    } catch (error) {
      console.error("GET /api/admin/sales error:", error);
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  },
);

app.put(
  "/api/admin/sales/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        sale_date,
        sales_amount = 0,
        signups = 0,
        expenses = 0,
        refunds = 0,
        description = "",
        sales_agent = "",
      } = req.body;

      const result = await pool.query(
        `
      UPDATE sales
      SET
        sale_date = $1,
        sales_amount = $2,
        signups = $3,
        expenses = $4,
        refunds = $5,
        description = $6,
        sales_agent = $7
      WHERE id = $8
      RETURNING *;
      `,
        [
          sale_date,
          Number(sales_amount || 0),
          Number(signups || 0),
          Number(expenses || 0),
          Number(refunds || 0),
          description,
          sales_agent.trim(),
          id,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Sale not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("PUT /api/admin/sales/:id error:", error);
      res.status(500).json({ error: "Failed to update sale" });
    }
  },
);

app.delete(
  "/api/admin/sales/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM sales WHERE id = $1 RETURNING id;`,
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Sale not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/admin/sales/:id error:", error);
      res.status(500).json({ error: "Failed to delete sale" });
    }
  },
);

// Job matching helper functions.
function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function splitToList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,\n|]/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

function textIncludesAny(text, items) {
  const cleanText = normalizeText(text);
  return items.filter((item) => cleanText.includes(normalizeText(item)));
}

function parseSalaryNumber(value) {
  if (!value) return null;
  const match = String(value).replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function expandTerms(items) {
  const synonyms = {
    js: ["javascript"],
    javascript: ["js"],
    reactjs: ["react"],
    "react.js": ["react"],
    nodejs: ["node", "node.js"],
    "node.js": ["node", "nodejs"],
    frontend: ["front-end", "front end", "ui"],
    backend: ["back-end", "back end", "api"],
    "r&d": ["research and development", "research", "innovation"],
    engineer: ["engineering", "developer", "technical"],
    testing: ["test", "qa", "quality assurance"],
    arduino: ["embedded", "microcontroller", "electronics"],
  };

  const expanded = new Set();

  items.forEach((item) => {
    const clean = normalizeText(item);
    if (!clean) return;

    expanded.add(clean);

    if (synonyms[clean]) {
      synonyms[clean].forEach((x) => expanded.add(x));
    }
  });

  return Array.from(expanded);
}

function countMatches(text, items) {
  const cleanText = normalizeText(text);
  const matched = [];

  items.forEach((item) => {
    const cleanItem = normalizeText(item);
    if (!cleanItem) return;

    if (cleanText.includes(cleanItem) || cleanItem.includes(cleanText)) {
      matched.push(cleanItem);
    }
  });

  return Array.from(new Set(matched));
}

function calculateJobMatch(candidate, job) {
  const reasons = [];
  const missing = [];

  const candidateSkills = splitToList(candidate.skills);
  const expandedSkills = expandTerms(candidateSkills);

  const preferredTitles = expandTerms(
    splitToList(candidate.preferred_job_titles),
  );
  const preferredTypes = splitToList(candidate.preferred_job_types);
  const preferredLocations = splitToList(candidate.preferred_locations);

  const candidateExperienceText = [
    candidate.experience,
    candidate.education,
    candidate.summary,
    candidate.current_position,
    candidate.desired_position,
  ].join(" ");

  const jobText = [job.title, job.position, job.description].join(" ");

  const jobTitleText = `${job.title || ""} ${job.position || ""}`;
  const fullCompareText = `${jobText} ${candidateExperienceText}`;

  const matchedSkills = countMatches(jobText, expandedSkills);
  const matchedTitles = countMatches(jobTitleText, preferredTitles);
  const experienceMatches = countMatches(
    jobText,
    expandTerms(splitToList(candidateExperienceText)),
  );

  const jobType = normalizeText(job.job_type);
  const matchedType = preferredTypes.some((type) => {
    const cleanType = normalizeText(type);
    return jobType.includes(cleanType) || cleanType.includes(jobType);
  });

  const jobLocation = normalizeText(job.location);
  const matchedLocation = preferredLocations.some((loc) => {
    const cleanLoc = normalizeText(loc);
    return jobLocation.includes(cleanLoc) || cleanLoc.includes(jobLocation);
  });

  const candidateMinSalary = Number(candidate.minimum_salary || 0);
  const jobSalary = parseSalaryNumber(job.salary);

  let score = 0;

  if (candidateSkills.length > 0) {
    const baseSkillScore = Math.round(
      (matchedSkills.length / Math.max(candidateSkills.length, 1)) * 45,
    );

    score += Math.min(baseSkillScore, 45);

    if (matchedSkills.length >= 2) {
      score += 8;
    } else if (matchedSkills.length === 1) {
      score += 4;
    }
  }

  if (matchedSkills.length) {
    reasons.push(`Matched skills: ${matchedSkills.slice(0, 5).join(", ")}`);
  } else {
    missing.push("No clear skill match found");
  }

  if (matchedTitles.length) {
    score += 20;
    reasons.push(`Preferred title match: ${matchedTitles[0]}`);
  } else if (
    candidate.desired_position &&
    normalizeText(jobTitleText).includes(
      normalizeText(candidate.desired_position),
    )
  ) {
    score += 14;
    reasons.push("Desired position is related to this job");
  } else if (
    normalizeText(jobTitleText).includes("engineer") &&
    normalizeText(candidateExperienceText).includes("engineer")
  ) {
    score += 14;
    reasons.push("Engineering background is related to this job");
  } else {
    missing.push("Job title is not strongly related to preferred titles");
  }

  if (matchedType) {
    score += 15;
    reasons.push("Preferred job type matched");
  } else if (!candidate.preferred_job_types) {
    score += 6;
  } else {
    missing.push("Job type may not match preference");
  }

  if (matchedLocation) {
    score += 10;
    reasons.push("Preferred location matched");
  } else if (!candidate.preferred_locations) {
    score += 5;
  } else {
    missing.push("Location may not match preference");
  }

  if (jobSalary && candidateMinSalary) {
    if (jobSalary >= candidateMinSalary) {
      score += 5;
      reasons.push("Salary meets minimum expectation");
    } else {
      missing.push("Salary may be below minimum expectation");
    }
  } else {
    score += 3;
  }

  if (experienceMatches.length >= 3) {
    score += 5;
    reasons.push("Experience text is relevant to the job description");
  } else if (experienceMatches.length > 0) {
    score += 3;
  }

  if (
    matchedSkills.length >= 2 &&
    (matchedTitles.length || normalizeText(jobTitleText).includes("engineer"))
  ) {
    score += 7;
  }

  return {
    match_score: Math.max(0, Math.min(100, Math.round(score))),
    match_reasons: reasons.slice(0, 5),
    match_missing: missing.slice(0, 4),
  };
}

app.get("/api/candidate/jobs", async (req, res) => {
  try {
    const candidateId = req.query.candidate_id || req.query.candidateId;

    const jobsResult = await pool.query(`
      SELECT
        id,
        title,
        position,
        salary,
        location,
        job_type,
        description,
        status,
        is_visible,
        created_at
      FROM public.jobs
      WHERE is_visible = true
        AND status = 'open'
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    if (!candidateId) {
      return res.json(jobsResult.rows);
    }

    const candidateResult = await pool.query(
      `
      SELECT *
      FROM candidates
      WHERE id = $1
      LIMIT 1
      `,
      [candidateId],
    );

    const candidate = candidateResult.rows[0];

    if (!candidate) {
      return res.json(jobsResult.rows);
    }

    const jobsWithMatch = jobsResult.rows
      .map((job) => ({
        ...job,
        ...calculateJobMatch(candidate, job),
      }))
      .sort((a, b) => b.match_score - a.match_score);

    res.json(jobsWithMatch);
  } catch (error) {
    console.error("Error fetching candidate jobs:", error);
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.post("/api/candidate/apply", async (req, res) => {
  try {
    const { candidate_id, job_id, cover_letter, cv_url } = req.body;

    if (!candidate_id || !job_id) {
      return res.status(400).json({
        message: "candidate_id and job_id are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO applications (
        candidate_id,
        job_id,
        status,
        applied_at,
        updated_at,
        cover_letter,
        cv_url
      )
      VALUES (
        $1,
        $2,
        'applied',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        $3,
        $4
      )
      RETURNING *
      `,
      [candidate_id, job_id, cover_letter || null, cv_url || null],
    );

    const application = result.rows[0];

    const candidateResult = await pool.query(
      `
      SELECT full_name
      FROM candidates
      WHERE id = $1
      LIMIT 1
      `,
      [candidate_id],
    );

    const candidateName = candidateResult.rows[0]?.full_name || "A candidate";

    await pool.query(
      `
      INSERT INTO notifications (
        employer_user_id,
        title,
        message,
        type,
        link,
        is_read,
        created_at
      )
      SELECT
        c.created_by_user_id,
        'New job application',
        $1,
        'new_application',
        '/employer/applications',
        FALSE,
        CURRENT_TIMESTAMP
      FROM jobs j
      JOIN companies c
        ON c.id = j.company_id
      WHERE j.id = $2
      `,
      [`${candidateName} applied to one of your jobs.`, job_id],
    );

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error applying to job:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "You already applied to this job",
      });
    }

    res.status(500).json({
      message: "Failed to apply to job",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.get("/api/candidate/applications/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.applied_at,
        a.updated_at,
        j.id AS job_id,
        j.title,
        j.position,
        j.salary,
        j.location,
        j.job_type
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = $1
      ORDER BY a.applied_at DESC
      `,
      [candidateId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching candidate applications:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.get("/api/candidate/dashboard/stats/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const applicationsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM applications
      WHERE candidate_id = $1
      `,
      [candidateId],
    );

    const openJobsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM jobs
      WHERE is_visible = true
        AND status = 'open'
        AND deleted_at IS NULL
    `);

    const candidateResult = await pool.query(
      `
      SELECT
        full_name,
        email,
        phone,
        nationality,
        current_position,
        desired_position,
        expected_salary,
        candidate_status
      FROM candidates
      WHERE id = $1
      LIMIT 1
      `,
      [candidateId],
    );

    const candidate = candidateResult.rows[0] || {};

    const fields = [
      candidate.full_name,
      candidate.email,
      candidate.phone,
      candidate.nationality,
      candidate.current_position,
      candidate.desired_position,
      candidate.expected_salary,
      candidate.candidate_status,
    ];

    const completed = fields.filter(
      (value) =>
        value !== null && value !== undefined && String(value).trim() !== "",
    ).length;

    const profileCompletion = Math.round((completed / fields.length) * 100);

    res.json({
      applicationsSent: applicationsResult.rows[0]?.total || 0,
      openJobs: openJobsResult.rows[0]?.total || 0,
      profileCompletion,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.get(
  "/api/candidate/dashboard/recent-applications/:candidateId",
  async (req, res) => {
    try {
      const { candidateId } = req.params;

      const result = await pool.query(
        `
      SELECT
        a.id,
        a.status,
        a.applied_at,
        j.title,
        j.position,
        j.location,
        j.job_type
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.candidate_id = $1
      ORDER BY a.applied_at DESC
      LIMIT 5
      `,
        [candidateId],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching recent applications:", error);
      res.status(500).json({
        message: "Failed to fetch recent applications",
        error: error.message,
        detail: error.detail || null,
      });
    }
  },
);

app.get(
  "/api/candidate/dashboard/recommended-jobs/:candidateId",
  async (req, res) => {
    try {
      const { candidateId } = req.params;

      const candidateResult = await pool.query(
        `SELECT * FROM candidates WHERE id = $1 LIMIT 1`,
        [candidateId],
      );

      const candidate = candidateResult.rows[0];

      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const jobsResult = await pool.query(
        `
      SELECT
        id,
        title,
        position,
        salary,
        location,
        job_type,
        description,
        created_at
      FROM jobs
      WHERE is_visible = true
        AND status = 'open'
        AND deleted_at IS NULL
        AND id NOT IN (
          SELECT job_id
          FROM applications
          WHERE candidate_id = $1
        )
      ORDER BY created_at DESC
    `,
        [candidateId],
      );

      const jobsWithMatch = jobsResult.rows
        .map((job) => ({
          ...job,
          ...calculateJobMatch(candidate, job),
        }))
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 6);

      res.json(jobsWithMatch);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({
        message: "Failed to fetch recommended jobs",
        error: error.message,
        detail: error.detail || null,
      });
    }
  },
);

app.get("/api/candidate/applied-job-ids/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT job_id
      FROM applications
      WHERE candidate_id = $1
      `,
      [candidateId],
    );

    const appliedJobIds = result.rows.map((row) => row.job_id);
    res.json(appliedJobIds);
  } catch (error) {
    console.error("Error fetching applied job ids:", error);
    res.status(500).json({
      message: "Failed to fetch applied job ids",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.get("/api/candidate/profile/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM candidates
      WHERE id = $1
      LIMIT 1
      `,
      [candidateId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({
      message: "Failed to fetch candidate profile",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.put("/api/candidate/profile/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const {
      full_name,
      phone,
      email,
      nationality,
      current_position,
      desired_position,
      expected_salary,
      candidate_status,
      cv_url,
      skills,
      experience,
      education,
      linkedin,
      portfolio,
      summary,
      preferred_job_titles,
      preferred_industries,
      preferred_job_types,
      preferred_locations,
      minimum_salary,
      ai_match_threshold,
      work_type_preference,
      availability,
      profile_completed,
      cv_extracted,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE candidates
      SET
        full_name = $1,
        phone = $2,
        email = $3,
        nationality = $4,
        current_position = $5,
        desired_position = $6,
        expected_salary = $7,
        candidate_status = $8,
        cv_url = $9,
        skills = $10,
        experience = $11,
        education = $12,
        linkedin = $13,
        portfolio = $14,
        summary = $15,
        preferred_job_titles = $16,
        preferred_industries = $17,
        preferred_job_types = $18,
        preferred_locations = $19,
        minimum_salary = $20,
        ai_match_threshold = $21,
        work_type_preference = $22,
        availability = $23,
        profile_completed = $24,
        cv_extracted = $25,
        date = COALESCE(date, CURRENT_DATE),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $26
      RETURNING *
      `,
      [
        full_name || null,
        phone || null,
        email || null,
        nationality || null,
        current_position || null,
        desired_position || null,
        expected_salary || null,
        candidate_status || "applied",
        cv_url || null,
        skills || null,
        experience || null,
        education || null,
        linkedin || null,
        portfolio || null,
        summary || null,
        preferred_job_titles || null,
        preferred_industries || null,
        preferred_job_types || null,
        preferred_locations || null,
        minimum_salary || null,
        ai_match_threshold || 75,
        work_type_preference || null,
        availability || null,
        profile_completed ?? true,
        cv_extracted ?? false,
        candidateId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Candidate profile not found" });
    }

    const updatedProfile = result.rows[0];

    if (updatedProfile.profile_completed === true) {
      const alreadyNotified = await pool.query(
        `
    SELECT id
    FROM notifications
    WHERE role = 'admin'
      AND type = 'candidate_registration'
      AND message ILIKE $1
    LIMIT 1
    `,
        [`%${candidateId}%`],
      );

      if (alreadyNotified.rows.length === 0) {
        await pool.query(
          `
      INSERT INTO notifications (
        role,
        title,
        message,
        type,
        link,
        is_read,
        created_at
      )
      VALUES (
        'admin',
        'New candidate registered',
        $1,
        'candidate_registration',
        '/admin/candidates',
        FALSE,
        CURRENT_TIMESTAMP
      )
      `,
          [
            `${updatedProfile.full_name || updatedProfile.email || `candidate #${candidateId}`} completed their profile.`,
          ],
        );
      }
    }

    res.json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating candidate profile:", error);
    res.status(500).json({
      message: "Failed to update candidate profile",
      error: error.message,
    });
  }
});

app.post(
  "/api/candidate/upload-cv/:candidateId",
  upload.single("cv"),
  async (req, res) => {
    console.log("UPLOAD CV HIT");
    console.log("candidateId:", req.params.candidateId);
    console.log("file:", req.file?.originalname);
    console.log("buffer exists:", !!req.file?.buffer);
    console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY exists:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    try {
      const { candidateId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "CV file is required" });
      }

      const uploaded = await uploadCvToSupabase({
        candidateId,
        file: req.file,
        folder: "original",
      });

      const result = await pool.query(
        `
      UPDATE candidates
      SET
        cv_url = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
        [uploaded.publicUrl, candidateId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      res.json({
        message: "CV uploaded successfully",
        cv_url: uploaded.publicUrl,
        cv_path: uploaded.filePath,
        profile: result.rows[0],
      });
    } catch (error) {
      console.error("CV upload error:", error);
      res.status(500).json({
        message: "Failed to upload CV",
        error: error.message,
      });
    }
  },
);

app.get("/api/candidate/saved-job-ids/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT job_id
      FROM saved_jobs
      WHERE candidate_id = $1
      `,
      [candidateId],
    );

    const savedJobIds = result.rows.map((row) => row.job_id);
    res.json(savedJobIds);
  } catch (error) {
    console.error("Error fetching saved job ids:", error);
    res.status(500).json({
      message: "Failed to fetch saved job ids",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.post("/api/candidate/save-job", async (req, res) => {
  try {
    const { candidate_id, job_id } = req.body;

    if (!candidate_id || !job_id) {
      return res.status(400).json({
        message: "candidate_id and job_id are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO saved_jobs (candidate_id, job_id)
      VALUES ($1, $2)
      ON CONFLICT (candidate_id, job_id) DO NOTHING
      RETURNING *
      `,
      [candidate_id, job_id],
    );

    res.status(201).json({
      message: "Job saved successfully",
      savedJob: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({
      message: "Failed to save job",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.delete("/api/candidate/save-job", async (req, res) => {
  try {
    const { candidate_id, job_id } = req.body;

    if (!candidate_id || !job_id) {
      return res.status(400).json({
        message: "candidate_id and job_id are required",
      });
    }

    await pool.query(
      `
      DELETE FROM saved_jobs
      WHERE candidate_id = $1 AND job_id = $2
      `,
      [candidate_id, job_id],
    );

    res.json({ message: "Job unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving job:", error);
    res.status(500).json({
      message: "Failed to unsave job",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.get("/api/candidate/saved-jobs/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.position,
        j.salary,
        j.location,
        j.job_type,
        j.description,
        j.created_at,
        sj.created_at AS saved_at
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      WHERE sj.candidate_id = $1
        AND j.deleted_at IS NULL
      ORDER BY sj.created_at DESC
      `,
      [candidateId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({
      message: "Failed to fetch saved jobs",
      error: error.message,
      detail: error.detail || null,
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.message,
    });
  }

  if (error?.message === "Only PDF, DOC, and DOCX files are allowed") {
    return res.status(400).json({
      message: error.message,
    });
  }

  next(error);
});

app.patch(
  "/applications/:id",
  authenticateToken,
  requireRole("employer"),
  requireApprovedCompany,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.company.id;

      const result = await pool.query(
        `
        UPDATE applications a
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        FROM jobs j
        WHERE a.id = $2
          AND a.job_id = j.id
          AND j.company_id = $3
        RETURNING a.*
        `,
        [status, id, companyId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Application not found or not yours",
        });
      }

      const info = await pool.query(
        `
        SELECT a.candidate_id, j.title
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE a.id = $1
        `,
        [id],
      );

      const candidateId = info.rows[0]?.candidate_id;
      const jobTitle = info.rows[0]?.title;

      if (candidateId && jobTitle) {
        await pool.query(
          `
          INSERT INTO notifications (
            candidate_id,
            title,
            message,
            type,
            link,
            is_read,
            created_at
          )
          VALUES (
            $1,
            'Application status updated',
            $2,
            'application_status',
            '/candidate/applications',
            FALSE,
            CURRENT_TIMESTAMP
          )
          `,
          [candidateId, `Your application for "${jobTitle}" is now ${status}`],
        );
      }

      res.json({
        message: "Status updated successfully",
        application: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating application status:", error);

      res.status(500).json({
        message: "Failed to update status",
        error: error.message,
      });
    }
  },
);

app.get(
  "/api/admin/notifications",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM notifications
        WHERE role = 'admin'
           OR admin_user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [req.user.userId],
      );

      const notifications = result.rows;
      const unreadCount = notifications.filter((item) => !item.is_read).length;

      res.json({
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error("GET /api/admin/notifications error:", error);
      res.status(500).json({
        error: "Failed to fetch admin notifications",
      });
    }
  },
);

app.patch(
  "/api/admin/notifications/:id/read",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND (
            role = 'admin'
            OR admin_user_id = $2
          )
        RETURNING *
        `,
        [id, req.user.userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Notification not found",
        });
      }

      res.json({
        message: "Notification marked as read",
        notification: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /api/admin/notifications/:id/read error:", error);
      res.status(500).json({
        error: "Failed to update admin notification",
      });
    }
  },
);

app.patch(
  "/api/admin/notifications/read-all",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE is_read = FALSE
          AND (
            role = 'admin'
            OR admin_user_id = $1
          )
        `,
        [req.user.userId],
      );

      res.json({
        message: "All admin notifications marked as read",
      });
    } catch (error) {
      console.error("PATCH /api/admin/notifications/read-all error:", error);
      res.status(500).json({
        error: "Failed to update admin notifications",
      });
    }
  },
);

app.get(
  "/api/employer/notifications",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM notifications
        WHERE employer_user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        `,
        [req.user.userId],
      );

      const notifications = result.rows;
      const unreadCount = notifications.filter((item) => !item.is_read).length;

      res.json({
        unreadCount,
        notifications,
      });
    } catch (error) {
      console.error("GET /api/employer/notifications error:", error);
      res.status(500).json({
        error: "Failed to fetch employer notifications",
      });
    }
  },
);

app.patch(
  "/api/employer/notifications/:id/read",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND employer_user_id = $2
        RETURNING *
        `,
        [id, req.user.userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Notification not found",
        });
      }

      res.json({
        message: "Notification marked as read",
        notification: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /api/employer/notifications/:id/read error:", error);
      res.status(500).json({
        error: "Failed to update employer notification",
      });
    }
  },
);

app.patch(
  "/api/employer/notifications/read-all",
  authenticateToken,
  requireRole("employer"),
  async (req, res) => {
    try {
      await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE employer_user_id = $1
          AND is_read = FALSE
        `,
        [req.user.userId],
      );

      res.json({
        message: "All employer notifications marked as read",
      });
    } catch (error) {
      console.error("PATCH /api/employer/notifications/read-all error:", error);
      res.status(500).json({
        error: "Failed to update employer notifications",
      });
    }
  },
);

app.get(
  "/api/candidate/notifications",
  authenticateToken,
  requireRole("candidate"),
  async (req, res) => {
    try {
      const candidateResult = await pool.query(
        `SELECT id FROM candidates WHERE user_id = $1 LIMIT 1`,
        [req.user.userId],
      );

      const candidateId = candidateResult.rows[0]?.id;

      if (!candidateId) {
        return res.status(404).json({ error: "Candidate profile not found" });
      }

      const result = await pool.query(
        `
        SELECT *
        FROM notifications
        WHERE candidate_id = $1
        ORDER BY created_at DESC
        `,
        [candidateId],
      );

      const notifications = result.rows;
      const unreadCount = notifications.filter((item) => !item.is_read).length;

      res.json({
        unreadCount,
        notifications,
      });
    } catch (err) {
      console.error("GET /api/candidate/notifications error:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  },
);

app.patch(
  "/api/candidate/notifications/:id/read",
  authenticateToken,
  requireRole("candidate"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const candidateResult = await pool.query(
        `SELECT id FROM candidates WHERE user_id = $1 LIMIT 1`,
        [req.user.userId],
      );

      const candidateId = candidateResult.rows[0]?.id;

      if (!candidateId) {
        return res.status(404).json({ error: "Candidate profile not found" });
      }

      const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND candidate_id = $2
        RETURNING *
        `,
        [id, candidateId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json({
        message: "Notification marked as read",
        notification: result.rows[0],
      });
    } catch (err) {
      console.error("PATCH /api/candidate/notifications/:id/read error:", err);
      res.status(500).json({ error: "Failed to update notification" });
    }
  },
);

app.patch(
  "/api/candidate/notifications/read-all",
  authenticateToken,
  requireRole("candidate"),
  async (req, res) => {
    try {
      const candidateResult = await pool.query(
        `SELECT id FROM candidates WHERE user_id = $1 LIMIT 1`,
        [req.user.userId],
      );

      const candidateId = candidateResult.rows[0]?.id;

      if (!candidateId) {
        return res.status(404).json({ error: "Candidate profile not found" });
      }

      await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE candidate_id = $1
          AND is_read = FALSE
        `,
        [candidateId],
      );

      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      console.error("PATCH /api/candidate/notifications/read-all error:", err);
      res.status(500).json({ error: "Failed to update notifications" });
    }
  },
);

app.get(
  "/admin/companies",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT *
      FROM companies
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

      res.json({ companies: result.rows });
    } catch (error) {
      console.error("GET /admin/companies error:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  },
);

app.patch(
  "/admin/companies/:id/status",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid company status" });
      }

      const result = await pool.query(
        `
      UPDATE companies
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND deleted_at IS NULL
      RETURNING *
      `,
        [status, id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({
        message: "Company status updated",
        company: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /admin/companies/:id/status error:", error);
      res.status(500).json({ error: "Failed to update company status" });
    }
  },
);

app.get("/api/employer/dashboard", async (req, res) => {
  try {
    const employerId = req.query.employerId || req.user?.id || null;

    if (!employerId) {
      return res.status(400).json({ message: "Missing employerId" });
    }

    const jobFilter = `
      j.deleted_at IS NULL
      AND j.created_by_user_id = $1
    `;

    const statsResult = await pool.query(
      `
      SELECT
        COUNT(*)::int AS jobs,
        COUNT(*) FILTER (WHERE j.status = 'open' AND COALESCE(j.is_visible, true) = true)::int AS active_jobs,
        COALESCE(SUM(j.views_count), 0)::int AS views,
        COUNT(a.id)::int AS applications,
        COUNT(a.id) FILTER (WHERE a.status = 'shortlisted')::int AS shortlisted,
        COUNT(a.id) FILTER (WHERE a.status = 'interview')::int AS interview,
        COUNT(a.id) FILTER (WHERE a.status = 'offered')::int AS offers,
        COUNT(a.id) FILTER (WHERE a.status = 'hired')::int AS hired
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE ${jobFilter}
      `,
      [employerId],
    );

    const statusResult = await pool.query(
      `
      SELECT
        a.status,
        COUNT(*)::int AS value
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE ${jobFilter}
      GROUP BY a.status
      ORDER BY value DESC
      `,
      [employerId],
    );

    const monthlyResult = await pool.query(
      `
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', NOW()) - interval '5 months',
          date_trunc('month', NOW()),
          interval '1 month'
        ) AS month_start
      )
      SELECT
        TO_CHAR(months.month_start, 'Mon') AS month,
        COALESCE(COUNT(a.id), 0)::int AS applications
      FROM months
      LEFT JOIN applications a
        ON date_trunc('month', a.applied_at) = months.month_start
      LEFT JOIN jobs j
        ON j.id = a.job_id
        AND ${jobFilter}
      GROUP BY months.month_start
      ORDER BY months.month_start
      `,
      [employerId],
    );

    const recentResult = await pool.query(
      `
      SELECT
        a.id,
        a.candidate_id,
        a.status,
        a.applied_at,
        a.notes,
        a.cover_letter,
        j.title AS job,
        COALESCE(c.full_name, u.name, NULL) AS candidate_name
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      LEFT JOIN candidates c ON c.id = a.candidate_id
      LEFT JOIN users u ON u.id = c.user_id
      WHERE ${jobFilter}
      ORDER BY a.applied_at DESC
      LIMIT 6
      `,
      [employerId],
    );

    const topJobsResult = await pool.query(
      `
      SELECT
        j.id,
        j.title AS name,
        COUNT(a.id)::int AS applications,
        COALESCE(j.views_count, 0)::int AS views
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE ${jobFilter}
      GROUP BY j.id, j.title, j.views_count
      ORDER BY applications DESC, views DESC
      LIMIT 5
      `,
      [employerId],
    );

    const statusLabels = {
      submitted: "Submitted",
      under_review: "Under review",
      shortlisted: "Shortlisted",
      interview: "Interview",
      offered: "Offered",
      hired: "Hired",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
    };

    const statusColors = {
      submitted: "#D97706",
      under_review: "#EA580C",
      shortlisted: "#C2410C",
      interview: "#B45309",
      offered: "#F59E0B",
      hired: "#16A34A",
      rejected: "#DC2626",
      withdrawn: "#6B7280",
    };

    const statsRow = statsResult.rows[0] || {};

    res.json({
      stats: {
        jobs: Number(statsRow.jobs || 0),
        activeJobs: Number(statsRow.active_jobs || 0),
        applications: Number(statsRow.applications || 0),
        shortlisted: Number(statsRow.shortlisted || 0),
        interview: Number(statsRow.interview || 0),
        hired: Number(statsRow.hired || 0),
        views: Number(statsRow.views || 0),
        offers: Number(statsRow.offers || 0),
      },
      statusData: statusResult.rows.map((row) => ({
        key: row.status,
        label: statusLabels[row.status] || row.status,
        value: Number(row.value || 0),
        color: statusColors[row.status] || "#6B7280",
      })),
      monthly: monthlyResult.rows.map((row) => ({
        month: row.month,
        applications: Number(row.applications || 0),
      })),
      recentApplications: recentResult.rows.map((row) => ({
        id: row.id,
        candidate_id: row.candidate_id,
        candidateName: row.candidate_name,
        job: row.job,
        status: row.status,
        applied_at: row.applied_at,
        note: row.notes || row.cover_letter || "New application",
      })),
      topJobs: topJobsResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        applications: Number(row.applications || 0),
        views: Number(row.views || 0),
      })),
    });
  } catch (error) {
    console.error("Employer dashboard error:", error);
    res.status(500).json({ message: "Failed to load employer dashboard" });
  }
});

app.post("/api/candidate/cv/extract", upload.single("cv"), async (req, res) => {
  try {
    const candidateId = req.body.candidate_id || null;

    if (!req.file) {
      return res.status(400).json({ message: "CV file is required" });
    }

    let savedCv = null;

    if (candidateId) {
      savedCv = await uploadCvToSupabase({
        candidateId,
        file: req.file,
        folder: "original",
      });

      await pool.query(
        `
        UPDATE candidates
        SET
          cv_url = $1,
          cv_extracted = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [savedCv.publicUrl, candidateId],
      );
    }

    const uploadedFile = await openai.files.create({
      file: new File([req.file.buffer], req.file.originalname, {
        type: req.file.mimetype,
      }),
      purpose: "user_data",
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_file", file_id: uploadedFile.id },
            {
              type: "input_text",
              text: `
Extract this CV into valid JSON only.

Return this exact shape:
{
  "full_name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "experience": [],
  "education": [],
  "linkedin": "",
  "portfolio": "",
  "current_position": "",
  "summary": ""
}

Do not invent missing data.
`,
            },
          ],
        },
      ],
    });

    const cleanText = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const extracted = JSON.parse(cleanText);

    return res.json({
      extracted,
      cv_url: savedCv?.publicUrl || null,
      cv_path: savedCv?.filePath || null,
    });
  } catch (error) {
    console.error("CV extraction error:", error);
    return res.status(500).json({
      message: "CV extraction failed",
      error: error.message,
    });
  }
});

app.get("/test-gemini", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent("Say hello");

    res.json({ text: result.response.text() });
  } catch (err) {
    console.error("TEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/list-models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );

    const data = await response.json();
    console.log("MODELS:", data);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/candidate/generated-cvs/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM generated_cvs
      WHERE candidate_id = $1
      ORDER BY created_at DESC
      `,
      [candidateId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Load generated CVs error:", error);
    return res.status(500).json({
      message: "Failed to load generated CVs",
      error: error.message,
    });
  }
});

app.post("/api/candidate/ats-cv/generate", async (req, res) => {
  try {
    const { edited_cv_data } = req.body;

    const cvSource = {
      ...(edited_cv_data || {}),
    };

    const missing = [];

    if (!cvSource.full_name) missing.push("Full name");
    if (!cvSource.email) missing.push("Email");
    if (!cvSource.phone) missing.push("Phone");
    if (!cvSource.skills) missing.push("Skills");
    if (!cvSource.experience && !cvSource.experience_items)
      missing.push("Experience");
    if (!cvSource.education && !cvSource.education_items)
      missing.push("Education");

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Please fill the missing CV information before generating.",
        missing,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an ATS CV editor. Improve structure and wording only. Never invent facts. Use only the CV/profile data provided by the user.",
        },
        {
          role: "user",
          content: `
Create clean ATS CV content using this CV/profile data only:

${JSON.stringify(cvSource, null, 2)}

Return JSON only.

Rules:
- Do not invent companies, degrees, dates, certifications, skills, achievements, languages, or experience.
- If certifications are not provided, return an empty certifications array.
- If languages are not provided, return an empty languages array.
- Keep work experience based only on the provided experience field and experience_items.
- Keep education based only on the provided education field and education_items.
- Keep exact user-provided dates.
- For education dates, use the full provided date range, for example "1998 - 2002". Do not shorten it to only the graduation year.
- For each work role, write 4 to 6 useful bullet points when enough information exists.
- If the provided experience is short, expand professionally but do not add fake responsibilities.
- Improve wording but keep claims honest.
- Make the content suitable for a simple ATS CV layout.
- Use location in the contact line if provided.
- Use GitHub as a link if provided.
`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ats_pdf_cv",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              cv_title: { type: "string" },
              full_name: { type: "string" },
              headline: { type: "string" },
              professional_summary: { type: "string" },
              work_experience: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    dates: { type: "string" },
                    bullets: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["title", "company", "dates", "bullets"],
                },
              },
              education: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    degree: { type: "string" },
                    institution: { type: "string" },
                    dates: { type: "string" },
                  },
                  required: ["degree", "institution", "dates"],
                },
              },
              skills: {
                type: "array",
                items: { type: "string" },
              },
              languages: {
                type: "array",
                items: { type: "string" },
              },
              certifications: {
                type: "array",
                items: { type: "string" },
              },
              improvement_notes: {
                type: "array",
                items: { type: "string" },
              },
              honesty_check: { type: "string" },
            },
            required: [
              "cv_title",
              "full_name",
              "headline",
              "professional_summary",
              "work_experience",
              "education",
              "skills",
              "languages",
              "certifications",
              "improvement_notes",
              "honesty_check",
            ],
          },
        },
      },
    });

    const generated = JSON.parse(completion.choices[0].message.content);

    const uploadDir = path.join(process.cwd(), "uploads", "generated-cvs");
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `ats-cv-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const cvUrl = `/uploads/generated-cvs/${fileName}`;

    await createAtsPdf({
      candidate: cvSource,
      generated,
      filePath,
    });

    return res.json({
      success: true,
      generated,
      saved: false,
      download_url: cvUrl,
    });
  } catch (error) {
    console.error("ATS CV generation error:", error);

    return res.status(500).json({
      message: "Failed to generate ATS CV",
      error: error.message,
    });
  }
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.delete("/api/candidate/generated-cvs/:cvId", async (req, res) => {
  try {
    const { cvId } = req.params;

    const result = await pool.query(
      "DELETE FROM generated_cvs WHERE id = $1 RETURNING *",
      [cvId],
    );

    return res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error("Delete generated CV error:", error);
    return res.status(500).json({
      message: "Failed to delete CV",
      error: error.message,
    });
  }
});

app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.trim().toLowerCase();
        const name = profile.displayName || "Google User";

        if (!email) return done(null, false);

        let result = await pool.query(
          `
          SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            c.id AS candidate_id
          FROM users u
          LEFT JOIN candidates c ON c.user_id = u.id
          WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
          LIMIT 1
          `,
          [email],
        );

        let user = result.rows[0];

        if (!user) {
          const created = await pool.query(
            `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, 'candidate')
            RETURNING id, name, email, role
            `,
            [name, email, "GOOGLE_AUTH"],
          );

          const newUser = created.rows[0];

          const candidate = await pool.query(
            `
            INSERT INTO candidates (user_id, full_name, email)
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [newUser.id, name, email],
          );

          user = {
            ...newUser,
            candidate_id: candidate.rows[0].id,
          };
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    session: false,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const encodedUser = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidate_id: user.candidate_id || null,
      }),
    );

    res.redirect(
      `http://localhost:5173/auth/google/success?token=${token}&user=${encodedUser}`,
    );
  },
);

app.patch(
  "/admin/candidates/:candidateId",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { candidate_status } = req.body;

      if (!candidate_status) {
        return res.status(400).json({
          error: "candidate_status is required",
        });
      }

      const result = await pool.query(
        `
        UPDATE candidates
        SET
          candidate_status = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [candidate_status, candidateId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Candidate not found",
        });
      }

      res.json({
        message: "Candidate status updated",
        candidate: result.rows[0],
      });
    } catch (error) {
      console.error("PATCH /admin/candidates/:candidateId error:", error);
      res.status(500).json({
        error: "Failed to update candidate status",
      });
    }
  },
);

app.post(
  "/api/admin/candidates/:candidateId/recruitment-track",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { status, client_name, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          error: "status is required",
        });
      }

      const candidateCheck = await pool.query(
        `
        SELECT id, full_name, email
        FROM candidates
        WHERE id = $1
        LIMIT 1
        `,
        [candidateId],
      );

      if (candidateCheck.rows.length === 0) {
        return res.status(404).json({
          error: "Candidate not found",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO candidate_recruitment_tracks (
          candidate_id,
          client_name,
          status,
          notes,
          created_by_admin_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
        `,
        [
          candidateId,
          client_name || null,
          status,
          notes || null,
          req.user.userId,
        ],
      );
      const candidateInfo = candidateCheck.rows[0];

      await pool.query(
        `
  INSERT INTO notifications (
    candidate_id,
    message,
    role,
    title,
    type,
    link,
    is_read,
    created_at
  )
  VALUES (
    $1,
    $2,
    'candidate',
    'Recruitment Update',
    'recruitment_update',
    '/candidate/applications',
    FALSE,
    CURRENT_TIMESTAMP
  )
  `,
        [
          candidateId,
          `Your recruitment status was updated to "${status}"${client_name ? ` for ${client_name}` : ""}.`,
        ],
      );

      res.status(201).json({
        message: "Recruitment track saved",
        track: result.rows[0],
      });
    } catch (error) {
      console.error(
        "POST /api/admin/candidates/:candidateId/recruitment-track error:",
        error,
      );
      res.status(500).json({
        error: "Failed to save recruitment track",
      });
    }
  },
);

app.get(
  "/api/admin/candidates/:candidateId/recruitment-tracks",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { candidateId } = req.params;

      const result = await pool.query(
        `
        SELECT
          crt.*,
          u.email AS admin_email
        FROM candidate_recruitment_tracks crt
        LEFT JOIN users u ON u.id = crt.created_by_admin_id
        WHERE crt.candidate_id = $1
        ORDER BY crt.created_at DESC
        `,
        [candidateId],
      );

      res.json({
        tracks: result.rows,
      });
    } catch (error) {
      console.error(
        "GET /api/admin/candidates/:candidateId/recruitment-tracks error:",
        error,
      );
      res.status(500).json({
        error: "Failed to fetch recruitment tracks",
      });
    }
  },
);

app.get(
  "/api/candidate/recruitment-tracks",
  authenticateToken,
  requireRole("candidate"),
  async (req, res) => {
    try {
      const candidateResult = await pool.query(
        `
        SELECT id
        FROM candidates
        WHERE user_id = $1
        LIMIT 1
        `,
        [req.user.userId],
      );

      const candidateId = candidateResult.rows[0]?.id;

      if (!candidateId) {
        return res.status(404).json({
          error: "Candidate profile not found",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          candidate_id,
          client_name,
          status,
          notes,
          created_at,
          updated_at
        FROM candidate_recruitment_tracks
        WHERE candidate_id = $1
        ORDER BY updated_at DESC, created_at DESC
        `,
        [candidateId],
      );

      res.json({
        tracks: result.rows,
      });
    } catch (error) {
      console.error("GET /api/candidate/recruitment-tracks error:", error);
      res.status(500).json({
        error: "Failed to fetch recruitment service updates",
      });
    }
  },
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

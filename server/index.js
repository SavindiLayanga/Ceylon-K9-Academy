const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.jsonl");

const PORT = Number(process.env.PORT) || 3000;
const MAIL_TO = process.env.MAIL_TO || "ceylonk9academy@yahoo.com";

const app = express();
app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use(express.static(ROOT));

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveInquiry(record) {
  ensureDataDir();
  fs.appendFileSync(INQUIRIES_FILE, JSON.stringify(record) + "\n", "utf8");
}

function createMailer() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mail.yahoo.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function sanitize(str, maxLen) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post("/api/inquiry", async (req, res) => {
  const body = req.body || {};
  const name = sanitize(body.name, 120);
  const phone = sanitize(body.phone, 40);
  const email = sanitize(body.email, 160);
  const packageName = sanitize(body.package, 80);
  const message = sanitize(body.message, 2000);
  const source = sanitize(body.source, 80);

  if (!name || !phone || !message) {
    return res.status(400).json({
      ok: false,
      error: "Name, phone, and message are required.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      ok: false,
      error: "Please enter a valid email address.",
    });
  }

  const record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    name,
    phone,
    email: email || null,
    package: packageName || "Not specified",
    message,
    source: source || "website",
  };

  saveInquiry(record);

  const subject = `Ceylon K9 inquiry — ${name}${packageName ? ` (${packageName})` : ""}`;
  const text = [
    `New inquiry from the website`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "—"}`,
    `Package: ${record.package}`,
    `Source: ${record.source}`,
    ``,
    `Message:`,
    message,
  ].join("\n");

  const transporter = createMailer();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Ceylon K9 Academy" <${process.env.SMTP_USER}>`,
        to: MAIL_TO,
        replyTo: email || undefined,
        subject,
        text,
      });
    } catch (err) {
      console.error("Email send failed:", err.message);
      return res.status(502).json({
        ok: false,
        error: "We saved your message but could not send email. Please call or WhatsApp us.",
      });
    }
  }

  return res.json({
    ok: true,
    message: transporter
      ? "Thank you! We received your message and will reply soon."
      : "Thank you! We received your message. Our team will contact you soon.",
    emailSent: Boolean(transporter),
  });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Ceylon K9 Academy running at http://localhost:${PORT}`);
  if (!process.env.SMTP_PASS) {
    console.log("SMTP not configured — inquiries saved to data/inquiries.jsonl only.");
  }
});

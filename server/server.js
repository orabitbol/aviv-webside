const express = require("express");
const mongoose = require("mongoose");
const session = require("cookie-session");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieSession = require("cookie-session");
const fetch = require("node-fetch");
const path = require("path");
const bodyParser = require("body-parser");
dotenv.config();

const app = express();
app.set("trust proxy", 1);

// Helmet for security headers
const helmetCspDirectives = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "img-src": [
    "'self'",
    process.env.FRONTEND_URL_PROD,
    process.env.FRONTEND_URL_DEV,
    "data:",
  ].filter(Boolean),
};
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: helmetCspDirectives,
    },
  })
);

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


const allowedOrigins = [
  process.env.FRONTEND_URL_DEV,
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_PROD2,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({ error: "Invalid JSON" });
        throw Error("Invalid JSON");
      }
    },
  })
);
app.use(bodyParser.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
);


app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(req.path).toLowerCase();
    if (!allowedExt.includes(ext)) {
      return res.status(403).send("Access denied");
    }
    next();
  },
  express.static(__dirname + "/uploads")
);

// Routes
app.use("/api/categories", require("./routes/category"));
app.use("/api/products", require("./routes/product"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/order-items", require("./routes/orderItem"));
app.use("/api/auth", require("./routes/auth"));

// --- Hypay APISign ---
app.post("/api/hypay-sign", async (req, res) => {
  try {
    const {
      amount,
      customerName = "",
      customerId = "000000000",
      info = "רכישה באתר",
    } = req.body;


    // ENV בצד שרת - השתמש במסוף הייצור
    const HYP_MASOF =  "4502025119";
    const HYP_KEY =  "e6ceb92b27cca670e019a54eebac105a64f1c6fc";
    const HYP_PASSP =  "vfvfqhfsav631";
    console.log("[ENV]", { HYP_MASOF, KEY: !!HYP_KEY, PASS: !!HYP_PASSP });
    console.log("[ENV DETAILS]", { HYP_MASOF, HYP_KEY, HYP_PASSP });

    // סכום מעוגל
    const fixedAmount = Number(amount).toFixed(2);

    // פרמטרים בסיסיים בלבד בדיוק כמו בדוגמא של המתכנת
    const params = new URLSearchParams({
      action: "APISign",
      Masof: (HYP_MASOF || "").trim(),
      Amount: fixedAmount,
      PassP: (HYP_PASSP || "").trim(),
      Sign: "True",
      KEY: (HYP_KEY || "").trim(),
      What: "SIGN"
    });

    

    // בדוגמא של המתכנת הם משתמשים ב-GET request
    const url = `https://pay.hyp.co.il/p/?${params.toString()}`;
    console.log("[HYP req]", url);
    console.log("[HYP PARAMS]", Object.fromEntries(params.entries()));
    
    const hypRes = await fetch(url, {
      method: "GET",
    });

    const text = await hypRes.text();
    console.log("[HYP res]", text);

    if (/(^|&)Error=/.test(text)) {
      return res.status(400).send(text);
    }

    res.send(text);
  } catch (err) {
    console.error("[HYP error]", err);
    res.status(500).json({ error: "Failed to fetch from Hypay", details: err.message });
  }
});
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Session cookie config:", {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("NutHub backend is running!");
});

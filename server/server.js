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

// CORS - allow only your domain and localhost (adjust as needed)
const allowedOrigins = [
  process.env.FRONTEND_URL_DEV,
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_PROD2,
  // הוסף כאן דומיינים נוספים אם צריך
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

// הגשת קבצים סטטיים מתיקיית uploads (רק תמונות)
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
      orderId,
      customerName = "",
      customerId = "000000000",
      info = "רכישה באתר",
      successUrl,
      errorUrl,
    } = req.body;

    // ENV בצד שרת
    const { HYP_MASOF, HYP_KEY, HYP_PASSP, HYP_SUCCESS_URL, HYP_ERROR_URL } = process.env;
    console.log("[ENV]", { HYP_MASOF, KEY: !!HYP_KEY, PASS: !!HYP_PASSP });

    // סכום מעוגל
    const fixedAmount = Number(amount).toFixed(2);

    const params = new URLSearchParams({
      action: "APISign",
      What: "SIGN",
      Masof: (HYP_MASOF || "").trim(),
      KEY: (HYP_KEY || "").trim(),
      PassP: (HYP_PASSP || "").trim(),
      Amount: fixedAmount,
      Info: info,
      UTF8: "True",
      UTF8out: "True",
      Sign: "True",
      ClientName: customerName,
      UserId: customerId,
      Order: String(orderId),
    //  SuccessUrl: successUrl || HYP_SUCCESS_URL,
      //ErrorUrl: errorUrl || HYP_ERROR_URL,
    });

    console.log("[HYP req]", params.toString());

    const hypRes = await fetch("https://pay.hyp.co.il/p/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
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

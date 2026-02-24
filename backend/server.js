import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import staffRoutes from "./routes/staffRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import leaveRoutes from "./routes/leaveRoute.js";
import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import attendanceRoutes from "./routes/attendanceRoute.js";
import otpWidgetRoutes from "./routes/otpWidgeRoute.js";
import timetableRoutes from "./routes/timeTableRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
dotenv.config();

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.url}`);
  next();
});

/* ---------- MIDDLEWARES ---------- */

app.use(cors({
  origin: [
    "https://mernstack.kodebloom.com",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ---------- ROUTES ---------- */
app.get("/api/test-direct", (req, res) => res.send("Direct route working"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/leave-request", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/otp-widget", otpWidgetRoutes);
app.use("/api/otp", otpWidgetRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/announcements", announcementRoutes);
/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend running successfully" });
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

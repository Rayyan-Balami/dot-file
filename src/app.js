import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
import userRouter from "./routes/user.route.js";
app.use("/api/v1/users", userRouter);

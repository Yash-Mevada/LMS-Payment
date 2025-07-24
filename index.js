import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";

import healthRoute from "./routes/health.routes.js";
import userRoute from "./routes/user.routes.js";

const app = express();

// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// security middleware
app.use(hpp());
app.use(helmet());
app.use("/api", limiter);
app.use(mongoSanitize());
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  //   console.log(`Application is running in ${process.env.ENV_NAME} mode`);
  app.use(morgan("dev"));
}

// limit set
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// cors configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "device-remember-token",
      "Access-Control-Allow-Origin",
      "Origin",
    ],
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// API route

app.use("/health", healthRoute);

app.use("/api/vi/user", userRoute);

// global error handler
//404 route
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    status: "error",
  });
});

// server listen
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running on port ${process.env.PORT} and ${process.env.NODE_ENV} mode`
  );
});

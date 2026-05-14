import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth.routes";
import { geminiRouter } from "./routes/gemini.routes";
import { healthRouter } from "./routes/health.routes";
import { insightsRouter } from "./routes/insights.routes";
import { noteRouter } from "./routes/note.routes";
import { sharedNoteRouter } from "./routes/shared-note.routes";

export const app = express();

function getAllowedClientOrigins() {
  const origins = new Set([env.clientUrl]);

  try {
    const clientUrl = new URL(env.clientUrl);
    origins.add(clientUrl.origin);

    if (clientUrl.hostname === "localhost") {
      clientUrl.hostname = "127.0.0.1";
      origins.add(clientUrl.origin);
    } else if (clientUrl.hostname === "127.0.0.1") {
      clientUrl.hostname = "localhost";
      origins.add(clientUrl.origin);
    }
  } catch {
    // Keep the raw configured value if it is not a full URL.
  }

  return origins;
}

const allowedClientOrigins = getAllowedClientOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedClientOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/shared", sharedNoteRouter);
app.use("/api/gemini", geminiRouter);

app.use(errorHandler);

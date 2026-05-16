import dotenv from "dotenv";

dotenv.config();

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/peblo_challenge";
const DEFAULT_JWT_SECRET = "development-only-secret";
const DEFAULT_CLIENT_URL = "http://localhost:3000";

function readString(name: string, fallback: string) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  return fallback;
}

function readNumber(name: string, fallback: number) {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

function warnWhenUsingDevelopmentDefault(name: string, value: string, defaultValue: string) {
  if (process.env.NODE_ENV !== "production" && value === defaultValue) {
    console.warn(`[env] ${name} is using a development default. Set ${name} in server/.env for deployments.`);
  }
}

function assertProductionSecret(name: string, value: string, unsafeValue: string) {
  if (process.env.NODE_ENV === "production" && value === unsafeValue) {
    throw new Error(`${name} must be configured in production`);
  }
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const mongoUri = readString("MONGO_URI", DEFAULT_MONGO_URI);
const jwtSecret = readString("JWT_SECRET", DEFAULT_JWT_SECRET);
const clientUrl = readString("CLIENT_URL", DEFAULT_CLIENT_URL);

warnWhenUsingDevelopmentDefault("MONGO_URI", mongoUri, DEFAULT_MONGO_URI);
warnWhenUsingDevelopmentDefault("JWT_SECRET", jwtSecret, DEFAULT_JWT_SECRET);
warnWhenUsingDevelopmentDefault("CLIENT_URL", clientUrl, DEFAULT_CLIENT_URL);
assertProductionSecret("MONGO_URI", mongoUri, DEFAULT_MONGO_URI);
assertProductionSecret("JWT_SECRET", jwtSecret, DEFAULT_JWT_SECRET);
assertProductionSecret("CLIENT_URL", clientUrl, DEFAULT_CLIENT_URL);

export const env = {
  port: readNumber("PORT", 5000),
  nodeEnv,
  clientUrl,
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  demoUserName: process.env.DEMO_USER_NAME ?? "Demo User",
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@peblo.local",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo1234"
};

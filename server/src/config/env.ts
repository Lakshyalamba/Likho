import dotenv from "dotenv";

dotenv.config();

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:password@localhost:5432/peblo_notes?schema=public";
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
const databaseUrl = readString("DATABASE_URL", DEFAULT_DATABASE_URL);
const jwtSecret = readString("JWT_SECRET", DEFAULT_JWT_SECRET);
const clientUrl = readString("CLIENT_URL", DEFAULT_CLIENT_URL);

process.env.DATABASE_URL = databaseUrl;

warnWhenUsingDevelopmentDefault("DATABASE_URL", databaseUrl, DEFAULT_DATABASE_URL);
warnWhenUsingDevelopmentDefault("JWT_SECRET", jwtSecret, DEFAULT_JWT_SECRET);
warnWhenUsingDevelopmentDefault("CLIENT_URL", clientUrl, DEFAULT_CLIENT_URL);
assertProductionSecret("DATABASE_URL", databaseUrl, DEFAULT_DATABASE_URL);
assertProductionSecret("JWT_SECRET", jwtSecret, DEFAULT_JWT_SECRET);
assertProductionSecret("CLIENT_URL", clientUrl, DEFAULT_CLIENT_URL);

export const env = {
  port: readNumber("PORT", 5000),
  nodeEnv,
  clientUrl,
  databaseUrl,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  nvidiaApiKey: process.env.NVIDIA_API_KEY ?? "",
  nvidiaBaseUrl: process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
  nvidiaModel: process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct",
  demoUserName: process.env.DEMO_USER_NAME ?? "Demo User",
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@peblo.local",
  demoUserPassword: process.env.DEMO_USER_PASSWORD ?? "demo1234"
};

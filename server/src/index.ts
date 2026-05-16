import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { ensureDemoUser } from "./services/auth.service";

async function bootstrap() {
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  try {
    await connectDatabase();
    await ensureDemoUser();
  } catch (error) {
    console.error("MongoDB connection failed", error);
  }
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

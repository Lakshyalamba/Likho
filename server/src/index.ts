import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";

async function bootstrap() {
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  connectDatabase().catch((error) => {
    console.error("MongoDB connection failed", error);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

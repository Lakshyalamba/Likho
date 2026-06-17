import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase, prisma } from "./config/prisma";
import { ensureDemoUser } from "./services/auth.service";

async function bootstrap() {
  await connectDatabase();
  await ensureDemoUser();

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  function shutdown(signal: string) {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

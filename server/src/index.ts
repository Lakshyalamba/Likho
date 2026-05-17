import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase, prisma } from "./config/prisma";
import { ensureDemoUser } from "./services/auth.service";

async function bootstrap() {
  await connectDatabase();
  await ensureDemoUser();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

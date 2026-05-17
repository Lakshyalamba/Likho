# Database Schema

PostgreSQL is accessed through Prisma. The source of truth is `server/prisma/schema.prisma`, and migrations live in `server/prisma/migrations`.

## User

Source: `server/prisma/schema.prisma`

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  notes        Note[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
}
```

Fields:
- `id`: Prisma cuid primary key.
- `name`: required display name.
- `email`: required unique lowercased login identifier.
- `passwordHash`: required bcrypt hash.
- `createdAt` / `updatedAt`: managed by Prisma defaults.

Security notes:
- Plain text passwords are never stored.
- JWT payloads include only `userId` and `email`.
- API responses serialize only `id`, `name`, and `email`.

## Note

Source: `server/prisma/schema.prisma`

```prisma
model Note {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title          String
  content        String   @default("")
  tags           String[] @default([])
  category       String   @default("General")
  archived       Boolean  @default(false)
  isPublic       Boolean  @default(false)
  shareId        String?  @unique
  aiSummary      String?
  actionItems    String[] @default([])
  suggestedTitle String?
  aiUsageCount   Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId])
  @@index([userId, updatedAt])
  @@index([userId, archived])
  @@index([userId, category])
}
```

Ownership model:
- Every private note operation filters by both `id` and `userId`, or verifies ownership before mutating by `id`.
- Public reads use only `shareId` plus `isPublic: true`.
- Public serialization omits `userId`, `archived`, `isPublic`, and `aiUsageCount`.

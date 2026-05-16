# Database Schema

MongoDB is accessed through Mongoose models in `server/src/models`.

## User

Source: `server/src/models/user.model.ts`

```ts
{
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Fields:
- `name`: required, trimmed display name.
- `email`: required, unique, lowercased, trimmed login identifier.
- `passwordHash`: required bcrypt hash, excluded from query results by default with `select: false`.
- `createdAt` / `updatedAt`: managed by Mongoose timestamps.

Security notes:
- Plain text passwords are never stored.
- JWT payloads include only `userId` and `email`.
- API responses serialize only `id`, `name`, and `email`.

## Note

Source: `server/src/models/note.model.ts`

```ts
{
  title: string;
  content: string;
  tags: string[];
  category: string;
  archived: boolean;
  isPublic: boolean;
  shareId?: string;
  aiSummary?: string;
  actionItems: string[];
  suggestedTitle?: string;
  aiUsageCount: number;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

Fields:
- `title`: required, trimmed.
- `content`: note body, defaults to an empty string.
- `tags`: normalized string array from API validators.
- `category`: trimmed category label, defaults to `General`.
- `archived`: controls active vs archived note views.
- `isPublic`: controls whether the public shared endpoint can return the note.
- `shareId`: random UUID, unique and sparse.
- `aiSummary`: latest generated summary.
- `actionItems`: latest generated action items.
- `suggestedTitle`: latest AI title suggestion.
- `aiUsageCount`: increments every time AI generation runs.
- `userId`: required owner reference.
- `createdAt` / `updatedAt`: managed by Mongoose timestamps.

Indexes:

```ts
noteSchema.index({ userId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, archived: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, category: 1 });
shareId: { unique: true, sparse: true }
```

Ownership model:
- Every private note operation filters by both `_id` and `userId`.
- Public reads use only `shareId` plus `isPublic: true`.
- Public serialization omits `userId`, `archived`, `isPublic`, and `aiUsageCount`.

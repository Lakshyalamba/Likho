# Peblo AI Notes

Peblo AI Notes is a full-stack AI-powered notes workspace built for the Peblo Full Stack Developer Challenge. It combines secure authentication, a polished notes editor, AI-assisted note intelligence, public sharing, and productivity insights in a Next.js + Express + MongoDB application.

## Feature Checklist

- [x] Authentication: signup, login, protected routes, session restore
- [x] Notes CRUD
- [x] Debounced autosave
- [x] Tags and categories
- [x] Archive/unarchive
- [x] Search, filter, sort, and paginated note lists
- [x] AI summary generation
- [x] AI action item extraction
- [x] AI suggested title
- [x] Mock AI fallback when Gemini key is missing or unavailable
- [x] Public share/unshare flow
- [x] Public reader page without login
- [x] Productivity dashboard
- [x] Dark mode
- [x] Responsive UI
- [x] Toasts, loading states, and empty states

## Tech Stack

Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

Backend:
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

AI:
- Google Gemini API through `@google/generative-ai`
- Deterministic local fallback for demos and offline development

## Architecture

The repository is an npm workspace with two apps:

- `client` is the Next.js App Router frontend. It owns auth pages, protected app routes, the notes workspace, the public shared-note reader, theme state, toast notifications, and dashboard UI.
- `server` is the Express REST API. It owns authentication, note ownership checks, AI generation, public sharing, and dashboard insight aggregation.
- MongoDB stores users and notes.
- JWT protects private APIs. The token payload contains only safe user identifiers.
- Notes are scoped by `userId` in every private note query so users cannot access another user’s notes.
- AI generation is abstracted behind a service. The frontend never receives the Gemini API key.
- Public notes are accessed by `shareId`, and only when `isPublic` is true.
- Current collaboration is share-link based. Realtime multi-user editing is not included in this version, but the API can be extended with WebSockets, operational transforms, or CRDTs.

## Folder Structure

```text
fullstack_challenge_lakshya/
  client/
    src/
      app/
        dashboard/
        login/
        notes/
        shared/[shareId]/
        signup/
      components/
        app/
        auth/
        dashboard/
        notes/
        shared/
        ui/
      contexts/
      lib/
    next.config.ts
    package.json
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      validators/
    package.json
  docs/
    API_EXAMPLES.md
    DATABASE_SCHEMA.md
    DEMO_SCRIPT.md
    TESTING.md
    screenshots/
  package.json
  README.md
```

## Environment Setup

Install dependencies from the repository root:

```bash
npm install
```

Create local env files:

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

Client env:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Server env:

```env
MONGO_URI=mongodb://127.0.0.1:27017/peblo_challenge
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
DEMO_USER_NAME=Demo User
DEMO_USER_EMAIL=demo@peblo.local
DEMO_USER_PASSWORD=demo1234
```

`GEMINI_API_KEY` is optional. If it is blank, a placeholder, quota-limited, or unavailable, the backend returns a safe mock AI response so the demo still works.

Never commit real database passwords, JWT secrets, Gemini API keys, or production credentials.

## Running Locally

Run both apps:

```bash
npm run dev
```

Run the frontend only:

```bash
npm run dev --workspace client
```

Run the backend only:

```bash
npm run dev --workspace server
```

Default URLs:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

If local ports are busy, run the apps separately with alternate ports and update `NEXT_PUBLIC_API_URL` / `CLIENT_URL` accordingly.

## Build, Lint, and Test

```bash
npm run lint
npm run build
npm run test
```

`npm run test` currently runs lightweight backend validator tests. Manual QA steps are documented in [docs/TESTING.md](docs/TESTING.md).

## API Documentation

Protected endpoints require:

```http
Authorization: Bearer <token>
```

Health:
- `GET /api/health`

Authentication:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Notes:
- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`
- `PATCH /api/notes/:id/archive`
- `POST /api/notes/:id/generate-ai`
- `POST /api/notes/:id/share`
- `PATCH /api/notes/:id/unshare`

Public sharing:
- `GET /api/shared/:shareId`

Insights:
- `GET /api/insights`

`GET /api/notes` supports:

```text
search=roadmap
tag=work
category=Planning
archived=true|false
sort=asc|desc
page=1
limit=20
```

See full request/response examples in [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md).

## Database Design

User:

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Note:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "category": "string",
  "archived": false,
  "isPublic": false,
  "shareId": "string",
  "aiSummary": "string",
  "actionItems": ["string"],
  "suggestedTitle": "string",
  "aiUsageCount": 0,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Detailed schema and index notes are in [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## Sample API Responses

Signup/login:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "66f7e7f14b7f4e58f4d3a111",
    "name": "Asha Sharma",
    "email": "asha@example.com"
  }
}
```

Create note:

```json
{
  "note": {
    "id": "66f7e8a84b7f4e58f4d3a222",
    "title": "Sprint planning",
    "content": "Plan AI notes polish and demo recording.",
    "tags": ["work", "demo"],
    "category": "Planning",
    "archived": false,
    "isPublic": false,
    "actionItems": [],
    "aiUsageCount": 0,
    "userId": "66f7e7f14b7f4e58f4d3a111",
    "createdAt": "2026-05-16T10:00:00.000Z",
    "updatedAt": "2026-05-16T10:00:00.000Z"
  }
}
```

Generate AI:

```json
{
  "note": {
    "id": "66f7e8a84b7f4e58f4d3a222",
    "aiSummary": "The note captures the remaining polish tasks before the Peblo demo.",
    "actionItems": ["Finalize README", "Record demo video"],
    "suggestedTitle": "Peblo demo polish",
    "aiUsageCount": 1
  },
  "ai": {
    "summary": "The note captures the remaining polish tasks before the Peblo demo.",
    "action_items": ["Finalize README", "Record demo video"],
    "suggested_title": "Peblo demo polish",
    "usedMock": false
  }
}
```

Insights:

```json
{
  "totalNotes": 12,
  "archivedNotes": 2,
  "aiUsageCount": 5,
  "mostUsedTags": [{ "tag": "work", "count": 4 }],
  "recentlyEditedNotes": [],
  "weeklyActivitySummary": []
}
```

Public shared note:

```json
{
  "note": {
    "id": "66f7e8a84b7f4e58f4d3a222",
    "title": "Sprint planning",
    "content": "Plan AI notes polish and demo recording.",
    "tags": ["work", "demo"],
    "category": "Planning",
    "shareId": "f4c67e5d-8c4d-4f39-a47d-94fb0d96b982",
    "aiSummary": "The note captures the remaining polish tasks before the Peblo demo.",
    "actionItems": ["Finalize README", "Record demo video"],
    "suggestedTitle": "Peblo demo polish",
    "createdAt": "2026-05-16T10:00:00.000Z",
    "updatedAt": "2026-05-16T10:05:00.000Z"
  }
}
```

## Sample AI Output

```json
{
  "summary": "This note outlines the final work needed before submitting the Peblo challenge.",
  "action_items": ["Update documentation", "Record the demo walkthrough", "Verify public sharing"],
  "suggested_title": "Peblo submission checklist"
}
```

## Screenshots

Screenshot files are not included yet. The folder is prepared at `docs/screenshots/`.

Screenshot TODO checklist:
- [ ] Landing page
- [ ] Login/signup
- [ ] Notes workspace
- [ ] AI assistant panel
- [ ] Public shared note page
- [ ] Dashboard
- [ ] Dark mode

## Demo Video

Use [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for a 5-10 minute walkthrough covering the product, API, and architecture.

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: focus note search in the workspace

## Collaboration Scope

This version supports collaboration through public share links. A note owner can share or unshare a read-only public URL. Realtime multi-user editing is not included, but the current ownership model, note API, and share identifiers can be extended with WebSockets or CRDTs.

## Submission Checklist

- [ ] GitHub repository is accessible/public
- [x] No real secrets are committed
- [x] Env examples are present
- [x] Clean clone can run locally with MongoDB and env files
- [x] Frontend and backend are integrated
- [ ] Demo video is recorded
- [x] Sample outputs are included
- [ ] Real screenshots are added
- [x] Build/lint/test commands are documented
- [ ] Deployment links are added if deployed

## Future Improvements

- Realtime collaborative editing
- Rich text or Markdown preview mode
- Role-based sharing permissions
- User-level AI usage limits
- Full integration tests with a test database
- Deployment configuration for Vercel plus Render/Railway

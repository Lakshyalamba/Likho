# Peblo AI Notes

Peblo AI Notes is a full-stack productivity notes application built for the Peblo Full Stack Developer Challenge. It combines secure JWT authentication, a modern notes workspace, AI-powered note assistance, public note sharing, and a productivity dashboard.

## Features

- User signup, login, logout, and protected routes
- JWT authentication with session restore from `localStorage`
- Notes CRUD with ownership checks
- Debounced autosave for title, content, tags, and category
- Search, tag filtering, archive support, and recently updated sorting
- Gemini-powered AI note generation:
  - summary
  - action items
  - suggested title
- Safe mock AI response when `GEMINI_API_KEY` is missing
- Public note sharing with share/unshare flow
- Public reader route that does not require login
- Productivity dashboard with:
  - total notes
  - archived notes
  - AI usage count
  - most used tags
  - recently edited notes
  - weekly activity chart
- Dark mode
- Toast notifications
- Loading skeletons and polished empty/error states
- Responsive SaaS-style UI

## Tech Stack

**Frontend**
- Next.js App Router
- React
- TypeScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

**AI**
- Google Gemini API via `@google/generative-ai`

## Architecture Overview

The project is organized as an npm workspace with separate `client` and `server` apps.

- The Next.js client handles authentication screens, protected app routes, the notes workspace, public shared-note reader, dark mode, and dashboard UI.
- The Express backend exposes REST APIs for authentication, notes, AI generation, sharing, and productivity insights.
- MongoDB stores users and notes.
- JWT tokens protect user-specific APIs.
- Notes are always queried by `userId` for ownership safety.
- Gemini AI generation is abstracted behind an AI service. If no API key is available, the service returns a deterministic mock response for local development.

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
  README.md
  package.json
```

## Environment Variables

Create environment files from the examples:

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

### Client

`client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Server

`server/.env`

```env
MONGO_URI=mongodb://127.0.0.1:27017/peblo_challenge
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=replace-with-your-gemini-api-key
```

Do not commit real database passwords, JWT secrets, or API keys.

## Setup Instructions

Install dependencies from the project root:

```bash
npm install
```

Create the environment files:

```bash
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

Update `server/.env` with your MongoDB URI and optional Gemini API key. The default URI expects a local MongoDB instance.

## Running the App

Run frontend and backend together:

```bash
npm run dev
```

Run only the frontend:

```bash
npm run dev --workspace client
```

Run only the backend:

```bash
npm run dev --workspace server
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Build and Lint

Build both apps:

```bash
npm run build
```

Lint both apps:

```bash
npm run lint
```

## API Endpoints

### Health

- `GET /api/health` - API health check

### Authentication

- `POST /api/auth/signup` - create user account
- `POST /api/auth/login` - login and return JWT
- `GET /api/auth/me` - get current user profile

Protected auth format:

```http
Authorization: Bearer <token>
```

### Notes

- `GET /api/notes` - list current user's notes
- `POST /api/notes` - create note
- `GET /api/notes/:id` - get one owned note
- `PATCH /api/notes/:id` - update one owned note
- `DELETE /api/notes/:id` - delete one owned note
- `PATCH /api/notes/:id/archive` - archive or unarchive one owned note

Supported note list query params:

- `search`
- `tag`
- `category`
- `archived=true|false`
- `sort=asc|desc`

### AI

- `POST /api/notes/:id/generate-ai` - generate and store note AI fields

Stores:

- `aiSummary`
- `actionItems`
- `suggestedTitle`
- `aiUsageCount`

### Sharing

- `POST /api/notes/:id/share` - generate `shareId` and mark note public
- `PATCH /api/notes/:id/unshare` - make note private
- `GET /api/shared/:shareId` - public shared note reader data

The public shared endpoint does not require authentication and only returns public notes.

### Insights

- `GET /api/insights` - productivity dashboard data

Returns:

- `totalNotes`
- `archivedNotes`
- `recentlyEditedNotes`
- `mostUsedTags`
- `aiUsageCount`
- `weeklyActivitySummary`

## AI Integration

The backend uses a dedicated AI service for note intelligence generation. The service sends the selected note title and content to Gemini and asks for strict JSON containing:

```json
{
  "summary": "brief summary",
  "action_items": ["task 1", "task 2"],
  "suggested_title": "short title"
}
```

If `GEMINI_API_KEY` is missing or still set to the placeholder value, the backend returns a safe mock response. This keeps local development and demos working without requiring a real API key.

## Screenshots

Add screenshots here:

- Landing page
- Login/signup
- Notes workspace
- AI assistant panel
- Public shared note page
- Productivity dashboard
- Dark mode

## Future Improvements

- Add pagination for large note collections
- Add rich text or Markdown editing
- Add note restore flow for archived notes
- Add delete confirmation and undo actions
- Add collaborative sharing permissions
- Add user-level AI usage limits
- Add automated tests for API and UI flows
- Add deployment configuration for Vercel/Render/Railway
- Add refresh-token based auth for production-grade sessions

# Demo Video Script

Target length: 5-10 minutes.

## 1. Intro

Introduce Likho as a full-stack AI-powered notes workspace.

Mention the stack:
- Next.js, React, TypeScript, Tailwind
- Express, TypeScript, PostgreSQL, Prisma
- JWT auth
- Gemini with local fallback

## 2. Authentication

Show the landing page, then go to signup.

Create a new account or use the demo credentials from the login page:
- Email: `demo@likho.local`
- Password: `demo1234`

Point out protected routes and session restore.

## 3. Notes Workspace

Create a note.

Show:
- title editing
- content editing
- category editing
- comma-separated tags
- autosave indicator moving through Saving and Saved

## 4. AI Generation

Click Generate AI Summary.

Show:
- summary
- action items
- suggested title
- Apply suggested title button

Explain that Gemini is used when configured, and the app falls back to mock AI when the key is missing or unavailable.

## 5. Search, Filter, Sort

Create or use a few notes.

Show:
- search
- tag filter
- sort order
- clear search/filter button
- `Cmd/Ctrl + K` focusing search

## 6. Archive And Restore

Archive a note.

Switch to the Archived view, select the note, and unarchive it.

## 7. Public Sharing

Click Share on a note and copy the public link.

Open the shared link in a logged-out or incognito window.

Show:
- no login required
- title, tags, category, updated date
- content
- AI summary/action items if available

Return to the owner account and unshare the note. Refresh the public link to show it is unavailable.

## 8. Dashboard

Open the dashboard and show:
- total notes
- archived notes
- AI usage
- most used tags
- recently edited notes
- weekly activity

## 9. Architecture Explanation

Briefly explain:
- client and server npm workspaces
- protected APIs require JWT
- notes are scoped by `userId`
- public reads use `shareId` and `isPublic`
- AI calls stay on the backend
- PostgreSQL stores users and notes through Prisma

## 10. Closing

Summarize the project:
- complete CRUD notes workspace
- secure auth
- AI assistance with reliable fallback
- public collaboration through share links
- dashboard and polished UX

Mention possible future work:
- realtime collaboration with WebSockets or CRDTs
- richer Markdown editing
- deployment and automated E2E tests

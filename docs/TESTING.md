# Testing Guide

## Automated Checks

Run from the repository root:

```bash
npm run lint
npm run build
npm run test
```

Current automated tests cover backend auth and note validators.

## Manual QA Checklist

- [ ] Start PostgreSQL locally or with Docker.
- [ ] Copy `client/.env.example` to `client/.env.local`.
- [ ] Copy `server/.env.example` to `server/.env`.
- [ ] Run `npm install`.
- [ ] Run `npm run prisma:generate --workspace server`.
- [ ] Run `npm run prisma:migrate --workspace server`.
- [ ] Run `npm run dev`.
- [ ] Open `http://localhost:3000`.

Authentication:
- [ ] Signup with a valid name, email, and password.
- [ ] Login with the created account.
- [ ] Try invalid login credentials and confirm a clear error.
- [ ] Use demo credentials on the login page.
- [ ] Refresh a protected route and confirm session restore works.
- [ ] Sign out and confirm protected routes redirect.

Notes:
- [ ] Create a note.
- [ ] Edit title and content.
- [ ] Confirm autosave shows Saving and Saved.
- [ ] Edit tags and category.
- [ ] Confirm duplicate tags are normalized.
- [ ] Search by note title/content.
- [ ] Filter by tag.
- [ ] Sort by recently updated and oldest updated.
- [ ] Clear search/filter.
- [ ] Archive a note.
- [ ] Switch to Archived view.
- [ ] Unarchive the note.
- [ ] Confirm pagination controls appear when more than one page exists.

AI:
- [ ] Leave `GEMINI_API_KEY` blank and generate AI.
- [ ] Confirm fallback summary/action items/title appear.
- [ ] Add a valid Gemini key with quota and generate AI.
- [ ] Add `NVIDIA_API_KEY` and confirm it is used when Gemini quota is exceeded.
- [ ] Confirm `usedMock` behavior via API or toast messaging.

Sharing:
- [ ] Share a note.
- [ ] Copy the public link.
- [ ] Open it while logged out or in incognito.
- [ ] Confirm title/content/tags/category render.
- [ ] Confirm AI summary/action items render when present.
- [ ] Unshare the note.
- [ ] Refresh the public link and confirm it is unavailable.

Dashboard:
- [ ] Confirm total notes updates.
- [ ] Confirm archived count updates.
- [ ] Confirm AI usage updates after generation.
- [ ] Confirm most used tags and recently edited notes render.
- [ ] Confirm empty states look reasonable for a new user.

UI:
- [ ] Toggle dark mode and refresh to confirm persistence.
- [ ] Check mobile viewport.
- [ ] Press `Cmd/Ctrl + K` in the notes workspace to focus search.
- [ ] Confirm toast notifications appear and dismiss.

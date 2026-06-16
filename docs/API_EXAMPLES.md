# API Examples

Base URL: `http://localhost:5000/api`

Protected endpoints require:

```http
Authorization: Bearer <token>
```

## Health

Request:

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "service": "likho-api",
  "timestamp": "2026-05-16T10:00:00.000Z"
}
```

## Signup

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "password123"
}
```

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

## Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "asha@example.com",
  "password": "password123"
}
```

## Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

```json
{
  "user": {
    "id": "66f7e7f14b7f4e58f4d3a111",
    "name": "Asha Sharma",
    "email": "asha@example.com"
  }
}
```

## List Notes

```http
GET /api/notes?archived=false&sort=desc&page=1&limit=20
Authorization: Bearer <token>
```

```json
{
  "notes": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1
  }
}
```

## Create Note

```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Sprint planning",
  "content": "Plan AI notes polish and demo recording.",
  "tags": ["work", "demo"],
  "category": "Planning"
}
```

## Update Note

```http
PATCH /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Updated sprint planning",
  "content": "Autosaved content",
  "tags": ["work", "planning"],
  "category": "Planning"
}
```

## Archive Or Unarchive

```http
PATCH /api/notes/:id/archive
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "archived": true
}
```

Use `{ "archived": false }` to restore a note.

## Generate AI

```http
POST /api/notes/:id/generate-ai
Authorization: Bearer <token>
```

```json
{
  "ai": {
    "summary": "The note captures the remaining polish tasks before the Likho demo.",
    "action_items": ["Finalize README", "Record demo video"],
    "suggested_title": "Likho demo polish",
    "usedMock": true
  }
}
```

`usedMock` is true when Gemini is unavailable or no key is configured.

## Share Note

```http
POST /api/notes/:id/share
Authorization: Bearer <token>
```

```json
{
  "note": {
    "id": "66f7e8a84b7f4e58f4d3a222",
    "isPublic": true,
    "shareId": "f4c67e5d-8c4d-4f39-a47d-94fb0d96b982"
  }
}
```

## Unshare Note

```http
PATCH /api/notes/:id/unshare
Authorization: Bearer <token>
```

## Public Shared Note

```http
GET /api/shared/:shareId
```

The endpoint requires no login, but only returns notes where `isPublic` is true.

## Insights

```http
GET /api/insights
Authorization: Bearer <token>
```

```json
{
  "totalNotes": 12,
  "archivedNotes": 2,
  "recentlyEditedNotes": [
    {
      "id": "66f7e8a84b7f4e58f4d3a222",
      "title": "Sprint planning",
      "category": "Planning",
      "tags": ["work", "demo"],
      "archived": false,
      "updatedAt": "2026-05-16T10:05:00.000Z"
    }
  ],
  "mostUsedTags": [{ "tag": "work", "count": 4 }],
  "aiUsageCount": 5,
  "weeklyActivitySummary": [
    {
      "date": "2026-05-16",
      "created": 2,
      "updated": 4,
      "total": 6
    }
  ]
}
```

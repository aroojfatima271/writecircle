# WriteCircle

A workshop for writers — not a social feed. WriteCircle is a full-stack MERN
platform where writers post story chapters, receive structured peer critiques
scored on plot, characters, pacing, and prose, and grow inside genre-focused
writing circles.

## Problem statement

Most writing communities are either silent (Discord servers where drafts get
buried) or shallow (comment sections full of "loved it!"). Writers who want
serious feedback have nowhere to post a chapter and reliably get feedback
that's specific, comparable across reviewers, and tied to their actual text.
WriteCircle solves this with a structured critique format, automatic revision
history, and smaller genre-focused circles instead of one undifferentiated feed.

## Features

- **Authentication** — register/login with JWT, bcrypt-hashed passwords,
  protected routes, and role-based access (writer / admin).
- **Projects & chapters** — writers create projects (a story) and add
  chapters one at a time; chapters can be saved as drafts or published.
- **Automatic revision history** — every content edit to a chapter is
  snapshotted as a new version, so authors can see how a chapter evolved.
- **Structured critique system** — reviewers rate each chapter on four
  categories (plot, characters, pacing, prose) plus a written critique and
  optional inline line-comments; one critique per reviewer per chapter.
- **Writing circles** — genre-focused groups writers can create, join, and
  leave; projects can optionally belong to a circle.
- **Follows, comments, notifications** — follow projects, leave discussion
  comments, and get notified when someone critiques or comments on your work.
- **Admin panel** — platform stats, genre breakdown, user search + suspend/
  reinstate, and a moderation queue for user-filed reports.
- **Search, filter, sort, pagination** — on the Explore page (by genre,
  status, sort order) and the Circles page.

## Tech stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs,
express-validator, helmet, express-rate-limit, express-mongo-sanitize, morgan

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, react-hot-toast

## Architecture overview

The backend follows a layered structure: routes define endpoints, controllers
handle request/response logic, models define the Mongoose schemas, and a
small services layer (`notificationService`) centralizes cross-cutting logic
like creating notifications, so controllers stay focused on one job. A single
centralized error-handling middleware converts thrown errors — validation
errors, cast errors, duplicate-key errors, JWT errors — into consistent JSON
responses.

Chapters store only their current content; every edit that changes the
content pushes a snapshot into a separate `ChapterVersion` collection. This
keeps the hot document small while still giving a full history on demand.

## Folder structure

```
writecircle/
├── server/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Request handlers, one file per resource
│   ├── middleware/       # auth, validation, centralized error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Cross-cutting logic (notifications)
│   ├── utils/           # ApiError, JWT helper, seed script
│   ├── validators/      # express-validator rule sets
│   └── server.js
└── client/
    └── src/
        ├── api/          # Axios instance with auth interceptor
        ├── components/   # Reusable UI (Navbar, Avatar, StarRating, ...)
        ├── context/      # AuthContext
        ├── pages/        # Route-level pages
        └── styles/       # Tailwind entry point
```

## Installation

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local MongoDB or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install

```bash
git clone <your-repo-url> writecircle
cd writecircle/server && npm install
cd ../client && npm install
```

### 2. Environment variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in ms |
| `RATE_LIMIT_MAX` | Max requests per window per IP |

`client/.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:5000/api` |

**Never commit `.env` files** — they're already in `.gitignore`.

### 3. Seed demo data (optional but recommended)

```bash
cd server
npm run seed
```

This creates 6 demo writers (one admin), 3 circles, 2 projects with chapters,
and a couple of critiques, so the app looks populated on first run.

Demo logins (password for all: `Password123!`):
- `maya@example.com` · `devon@example.com` · `priya@example.com` ·
  `tobias@example.com` · `sana@example.com`
- Admin: `admin@writecircle.app`

### 4. Run it

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend: http://localhost:5173 · API: http://localhost:5000/api

## API overview

All endpoints are prefixed with `/api`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `GET /users/:username`, `PATCH /users/me`, `PATCH /users/me/password` |
| Circles | `GET /circles`, `POST /circles`, `GET /circles/:slug`, `POST /circles/:id/join`, `POST /circles/:id/leave` |
| Projects | `GET /projects`, `POST /projects`, `GET /projects/:slug`, `PATCH /projects/:id`, `DELETE /projects/:id`, `POST /projects/:id/follow`, `GET/POST /projects/:id/comments` |
| Chapters | `POST /projects/:projectId/chapters`, `GET /chapters/:id`, `PATCH /chapters/:id`, `DELETE /chapters/:id`, `GET /chapters/:id/versions` |
| Critiques | `GET/POST /chapters/:chapterId/critiques`, `POST /critiques/:id/helpful` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Reports | `POST /reports` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/reports`, `PATCH /admin/reports/:id` |

## Authentication

Registration hashes the password with bcrypt before storage. Login returns a
signed JWT (`JWT_SECRET`, expiring per `JWT_EXPIRES_IN`) which the frontend
stores and attaches as a `Bearer` token on every request via an Axios request
interceptor. The `protect` middleware verifies the token and loads the user;
`authorize('admin')` gates admin-only routes. A response interceptor on the
frontend clears the stored session and redirects to `/login` on any `401`.

## Future improvements

- Real-time notifications over WebSockets instead of polling
- File/image upload for cover art (currently uses generated color accents to
  avoid needing file storage infrastructure for a portfolio deploy)
- Full-text search ranking improvements (currently MongoDB text index)
- Chapter diff view between two revisions
- Email notifications for critiques received

## Challenges solved

- **Keeping revision history without bloating the hot document** — solved by
  splitting `Chapter` (current state) from `ChapterVersion` (append-only log),
  snapshotting only on actual content changes.
- **Preventing self-review and duplicate critiques** — enforced both at the
  application layer and with a compound unique index (`chapter` + `reviewer`)
  in MongoDB, so it holds even under concurrent requests.
- **Cascading deletes** — deleting a project cleans up its chapters,
  critiques, and comments in one coordinated operation instead of leaving
  orphaned documents.

## Deployment

The app reads all configuration from environment variables — nothing is
hardcoded to `localhost`.

- **Backend** — deploy to Render/Railway/Fly.io; set `MONGO_URI`,
  `JWT_SECRET`, `CLIENT_URL` (your deployed frontend origin), and `NODE_ENV=production`.
- **Frontend** — deploy to Vercel/Netlify; set `VITE_API_URL` to your deployed
  backend's `/api` URL, and run `npm run build`.
- **MongoDB Atlas** — create a free cluster, add your deployment's IP (or
  `0.0.0.0/0` for platform-managed IPs) to the network access list, and use
  the provided connection string as `MONGO_URI`.

## Author

Built as a MERN-stack portfolio project.

---

*Suggested repo name:* `writecircle` · *Suggested topics:* `mern`, `react`,
`express`, `mongodb`, `jwt-authentication`, `full-stack`, `rest-api`, `vite`,
`tailwindcss`, `portfolio-project`

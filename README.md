# Nexus Student Companion

A premium, mobile-first student productivity app.

Combines organization (Notion), student tools (Google Classroom), tasks (Todoist),
gamification (Duolingo), and AI help, in one cohesive interface.

## Phase 1 — Foundation + UI System ✅
- Light + dark mode (class-based Tailwind theming, persisted to `localStorage`)
- Responsive shell: collapsible desktop sidebar, mobile slide-in drawer, mobile bottom tab bar
- 10 working pages, mock data only
- Reusable component library: `Button`, `Card`, `Input`, `Modal`, `Badge` / `ProgressBar`, loading/skeleton states
- PWA-ready Vite config (`vite-plugin-pwa`)

## Phase 2 — User Authentication ✅
Firebase Authentication is now wired in.

- **Email/password signup** (`src/pages/auth/Signup.jsx`)
- **Login** (`src/pages/auth/Login.jsx`)
- **Google Sign-In** (popup flow, same context method powers both Login and Signup)
- **Logout** (Navbar profile menu and bottom of Settings)
- **Password reset** (`src/pages/auth/ForgotPassword.jsx`, plus a "send reset email" button on the Profile page)
- **Persistent sessions** — `setPersistence(auth, browserLocalPersistence)` is set explicitly on boot, so a signed-in user stays signed in across browser restarts
- **Route protection** — `ProtectedRoute` redirects unauthenticated visitors to `/login` (preserving where they were headed); `PublicOnlyRoute` redirects already-authenticated users away from `/login`, `/signup`, `/forgot-password`
- **Profile page** (`src/pages/Profile.jsx`) — edit display name, upload a profile picture (resized client-side and stored as Firestore data — no Firebase Storage, no extra cost), view (read-only) email and User ID, trigger a password reset
- **Account settings** — Settings page now shows the real signed-in identity and links into Profile

### Where user data lives
- Firebase Auth stores the canonical `email`, `uid`, `displayName`, and `photoURL`.
- A mirrored Firestore document at `users/{uid}` is created on first sign-in
  (`ensureUserProfileDoc` in `AuthContext.jsx`) and kept in sync in real time via
  `onSnapshot`. This is the durable, queryable home for profile data and — in
  later phases — the natural place to nest per-user subcollections
  (`users/{uid}/tasks`, `users/{uid}/notes`, etc.).

### Security structure (prepared, not yet enforced by a live backend)
- `firestore.rules` — every user may only read/write their own `users/{uid}`
  document (and anything nested under it, including notes/tasks/exams/quizzes/
  gamification data). Top-level collections planned for later phases are
  pre-written to require an `ownerId` field matching `request.auth.uid`.
  Everything else is denied by default.
- `firebase.json` / `firestore.indexes.json` — ready for `firebase deploy` once
  a real Firebase project is connected.
- Firebase Storage is intentionally **not used anywhere** in this project (it's
  a paid product); profile photos are resized client-side and stored as a data
  URL directly on the user's Firestore document instead — see
  `src/pages/Profile.jsx`.

### Setting up Firebase for local development
1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method**: Email/Password and Google
3. Enable **Firestore Database** (test mode is fine locally; the rules file
   here is what you should deploy for anything real). You do **not** need to
   enable Firebase Storage — this project doesn't use it.
4. Copy `.env.example` to `.env.local` and fill in the values from
   Project settings → General → Your apps → SDK setup and configuration
5. `npm install && npm run dev`

## Phase 3 — Real data, everywhere ✅
Mock data is gone. Every feature is now backed by real, per-user Firestore data.

- **Tasks** (`pages/Tasks.jsx`) — full create/edit/delete/complete, real due dates, priority
- **Notes** (`pages/Notes.jsx`) — full create/edit/delete/pin, with a **rich text editor**
  (`components/notes/RichTextEditor.jsx`) supporting bold, italic, underline, and lists —
  no extra dependency, just a small contentEditable component
- **Exams** (`pages/Exams.jsx`) — full CRUD, countdown computed live from a real date,
  a preparation-progress slider, comma-separated topic tags
- **Focus Timer** (`pages/FocusTimer.jsx`) — three built-in durations (Focus/Short/Long
  break) plus **add/delete your own custom durations**, persisted per-user
- **Quizzes** (`pages/Quizzes.jsx`) — build a quiz manually (question + 4 options + correct
  answer), take it, get scored, best score/attempts tracked. A **"Generate with AI"**
  button is present but intentionally just explains what's needed to wire it up for
  real — see "What's honestly still a stub" below
- **Calendar** (`pages/Calendar.jsx`) — rebuilt as a chronological agenda grouped by day,
  built directly from your real Task due dates and Exam dates (the old page was a fixed
  Mon–Fri grid over hardcoded hours, which can't represent arbitrary real dates)
- **Dashboard** and **Achievements** now compute their numbers from your real tasks/notes/
  quizzes instead of showing fixed mock stats

All of this uses one generic hook, `src/hooks/useUserCollection.js`, which gives any page
real-time `items`, `addItem`, `updateItem`, `removeItem` for a collection scoped to
`users/{uid}/{collectionName}` — already covered by the existing `firestore.rules`.

### What's honestly still a stub
- **AI quiz generation** — reading your Notes/Exams and generating questions with an LLM
  needs a real AI provider (Anthropic/OpenAI/etc.) called from a backend function, which
  has a real cost — the same kind of decision as Firebase Storage earlier. The button is
  in place and explains this; it's not wired to fake output.
- **AI Assistant chat** — still a placeholder conversation, for the same reason.
- **Gamification** (XP, level, streak) — no dedicated tracking system exists yet to award
  XP or count streak days from real activity, so these stay as starter/mock values in
  `gamification` (in `src/data/mockData.js`) until that system is built.
- Two achievement badges (7-Day Streak, Focus Master) are shown as "Coming soon" rather
  than faked, since they depend on the gamification system above.

## Phase 4 — Real gamification ✅
XP, levels, streaks, and achievements are now driven by real activity — nothing hardcoded.

- **`src/lib/gamificationRules.js`** — the one place XP values and the level curve live.
  Level N requires `N*100 + (N-1)*50` cumulative XP (a gentle, ever-steepening ramp).
- **`src/hooks/useGamification.js`** — reads/writes a single document at
  `users/{uid}/meta/gamification` holding `totalXp`, `streakDays`, `lastActiveDate`, and
  lifetime counters (`tasksCompleted`, `notesCreated`, `examsAdded`, `quizzesTaken`,
  `perfectQuizzes`, `focusSessions`). `awardXp(action, extra)` is called from the action
  that earns it — completing a task, creating a note, adding an exam, submitting a quiz
  (with a bonus + counter for a perfect score), finishing a focus session — and also
  advances the daily streak (once per calendar day; resets if a day is missed).
- **Level/XP** shows live on the Dashboard hero card, Achievements page, and Settings.
- **Streak** shows live in the Sidebar and Dashboard.
- **26 achievements** (`src/data/achievementDefs.js`) spanning tasks, notes, exams,
  quizzes, focus sessions, streaks, and level milestones — each just a `{ metric,
  threshold }` pair checked against the real counters above, with category filter tabs
  on the Achievements page. Nothing is manually toggled; unlock state and progress bars
  are computed fresh every render.

This reuses the existing `firestore.rules` — `users/{uid}/meta/gamification` is already
covered by the `users/{userId}/{document=**}` wildcard, so no rules changes were needed.

## Phase 5 — Achievements + Notifications ✅
70 achievements (up from 26) and a full real notification system, both built entirely
on real data — no mock notifications, no manually-toggled unlocks.

**Achievements** (`src/data/achievementDefs.js`, `src/hooks/useAchievements.js`)
- 70 achievements across 8 categories: Streaks, Tasks, Schoolwork, Tests & Quizzes,
  Productivity, Organization, Milestones, and 8 Secret achievements
- Secret achievements show as a locked "🔒 Secret Achievement" mystery card until
  unlocked — the requirement is still a real, deterministic check the whole time,
  just not revealed in the UI
- Unlocks are **persisted once**, permanently, at `users/{uid}/achievementUnlocks/{id}`
  with a `getDoc`-before-`setDoc` guard — refreshing, signing out/in, or re-rendering
  can never re-trigger or lose an unlock
- Category and Unlocked/Locked filters on the Achievements page
- New counters added to the gamification document to support this: `tasksAdded`,
  `quizzesCreated`, `earlyTasks`, `onTimeTasks`, `taskCompletionsByDay` (a per-day map,
  used for "N tasks in one day" achievements), `daysActive`, `streakComebacks`
- **Known simplification**: "Perfect Week" (secret) approximates "completed a task
  every day of a 7-day streak" as "streak ≥ 7 days", since per-day task completion
  isn't tracked at that granularity — documented in the code comment where it's computed.

**Notifications** (`src/lib/notifications.js`, `src/hooks/useNotifications.js`,
`src/hooks/useDueSoonNotifications.js`)
- Real notification types: achievement unlocks, streak milestones (every multiple of
  5, unbounded), streak loss, tasks due within 24 hours, exams due within 24 hours
- **Deduplication**: every notification's Firestore document ID *is* its dedupe key
  (e.g. `achievement-task-25`, `streak-milestone-15`, `task-due-{taskId}`) — a
  `getDoc` check before `setDoc` makes creating the same notification twice
  structurally impossible, regardless of reloads, re-renders, or repeated effect runs
- Notification checks run app-wide from `AppShell.jsx` (not just on one page), so
  they fire as soon as the underlying data changes no matter where you're navigating
- Navbar notification center: unread badge count, click-to-navigate to the relevant
  page, individual Dismiss, and Dismiss All — dismissing only sets `dismissed: true`,
  it never deletes the notification document
- **Known gap**: quiz "upcoming" reminders were **not** implemented — quizzes in this
  app have no due-date field (they're not time-based like exams), so there's no real
  data to generate that notification from. Adding a due date to quizzes would be a
  reasonable follow-up if you want that notification type.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (defaults to `http://localhost:5173`).

To produce a production build:

```bash
npm run build
npm run preview
```

## Architecture

```
src/
  components/
    ui/          Reusable, presentational primitives (Button, Card, Input, Modal, Badge, Loading)
    layout/       App shell pieces (Sidebar, Navbar, MobileTabBar, AppShell, Logo, PageHeader)
    auth/         AuthLayout, ProtectedRoute, PublicOnlyRoute
  context/        ThemeContext (light/dark), UIContext (sidebar/drawer state), AuthContext (Firebase auth + profile)
  data/           mockData.js (app content) + navigation.js (single source of nav truth)
  lib/            firebase.js (SDK init), userDisplay.js (initials/avatar-color helpers)
  pages/          One file per route; pages/auth/ holds Login, Signup, ForgotPassword
  styles/         index.css — Tailwind layers + CSS custom properties for theme colors
firestore.rules, firebase.json, firestore.indexes.json
```

### Design decisions

- **Theming via CSS variables, not hard-coded Tailwind classes.** Every themed
  surface (`--bg-app`, `--bg-surface`, `--text-primary`, etc.) is a CSS variable
  swapped by the `.dark` class on `<html>`, so components never need `dark:`
  variants sprinkled everywhere — just reference the variable.
- **Identity vs. app content are separate data sources.** `AuthContext` is the
  single source of truth for who the user is (name, email, photo, uid).
  `src/data/mockData.js` still supplies the *content* (tasks, notes, gamification
  stats) until later phases move each of those onto real per-user Firestore data.
- **Single nav source of truth** in `src/data/navigation.js`.
- **Mobile-first**: every page is authored for a narrow viewport first, then
  progressively enhanced with `sm:`/`md:`/`lg:` breakpoints for tablet/desktop.

## What's intentionally deferred to later phases

- Moving tasks/notes/calendar/exams/quizzes/achievements off mock data and onto
  real per-user Firestore collections (the security rules already anticipate this)
- Real AI responses (the AI Assistant page mocks a response after a short delay)
- Push notifications, offline caching strategy tuning
- Account deletion / email change flows (server-side, intentionally not exposed yet)
- Android packaging (TWA/Bubblewrap) steps — the PWA manifest is in place to make
  this straightforward once icons are finalized


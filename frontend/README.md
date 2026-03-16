# Assignment Portal — Frontend

React + Vite + TailwindCSS frontend for the Assignment Workflow Portal.

## Setup

```bash
# Install dependencies
npm install

# Start dev server (proxies API to localhost:5000)
npm run dev
```

App runs on `http://localhost:5173`.

## Features

- **Single Login Page** — same login for teachers and students, role-based redirect
- **Teacher Dashboard** — create, edit, delete (draft only), publish, complete assignments; view/review student submissions; filter by status
- **Student Dashboard** — view published assignments, submit answers (one per assignment), view own submission; prevented after due date
- **Auth** — JWT stored in localStorage, Context API state management
- **Styling** — TailwindCSS with responsive layout

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # AuthContext, routing, PrivateRoute
├── index.css             # Tailwind imports
└── pages/
    ├── Login.jsx          # Login form
    ├── TeacherDashboard.jsx  # Teacher features
    └── StudentDashboard.jsx  # Student features
```

## Notes

- Requires backend running on port 5000 (Vite proxies `/api` requests)
- Demo credentials shown on login page

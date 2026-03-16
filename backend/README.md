# Assignment Portal — Backend

Node.js + Express + MongoDB REST API for the Assignment Workflow Portal.

## Setup

```bash
# Install dependencies
npm install

# Make sure MongoDB is running locally, then:

# Seed sample users
node seed.js

# Start the server
npm start
```

Server runs on `http://localhost:5000`.

## Environment Variables (`.env`)

| Variable | Default |
|----------|---------|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb://localhost:27017/assignment-portal` |
| `JWT_SECRET` | `super_secret_key_change_in_production` |

## Seeded Users

| Email | Password | Role |
|-------|----------|------|
| teacher@test.com | password123 | teacher |
| student1@test.com | password123 | student |
| student2@test.com | password123 | student |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login, returns JWT + role |
| GET | /api/assignments | All | List assignments (filtered by role) |
| POST | /api/assignments | Teacher | Create assignment |
| PUT | /api/assignments/:id | Teacher | Edit draft assignment |
| PATCH | /api/assignments/:id/status | Teacher | Transition status |
| DELETE | /api/assignments/:id | Teacher | Delete draft assignment |
| GET | /api/assignments/:id/submissions | Teacher | View submissions |
| POST | /api/assignments/:id/submit | Student | Submit answer |
| GET | /api/assignments/:id/my-submission | Student | View own submission |
| PATCH | /api/submissions/:id/review | Teacher | Mark reviewed |

## Notes

- Assignments follow a strict workflow: **Draft → Published → Completed**
- Students can only submit to **Published** assignments before the due date
- One submission per student per assignment
- JWT tokens expire in 24 hours

# Assignment Workflow Portal

A premium, full-stack assignment management system for Teachers and Students.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (configured in `.env`)

---

## 🚀 Getting Started

### 1. Project Setup
Clone the repository and install dependencies in both project directories:

```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Ensure your `backend/.env` file is properly configured with your MongoDB URI and JWT Secret:

```env
PORT=5000
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/assignment-portal
JWT_SECRET=your_super_secret_key
```

### 3. Database Seeding (Required for first run)
To create the default Teacher and Student accounts, run the seed script:

```bash
cd backend
npm run seed
```

**Default Credentials:**
- **Teacher:** `teacher@gmail.com` / `teacher@123`
- **Student:** `student@gmail.com` / `student@123`

---

## 🏃‍♂️ Running the Application

You will need two terminal windows open:

### Terminal 1: Backend Server
```bash
cd backend
npm start
```
The API will run at `http://localhost:5000`.

### Terminal 2: Frontend Dashboard
```bash
cd frontend
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 🛠 Features
- **Teacher Dashboard:** Create, edit, delete, and publish assignments. View and review student submissions.
- **Student Dashboard:** View published assignments and submit text-based answers once.
- **Workflow:** Assignments transition through **Draft → Published → Completed** states.

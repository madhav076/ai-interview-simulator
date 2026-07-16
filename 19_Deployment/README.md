# AI Interview Simulator

A full-stack AI-powered interview preparation platform that generates personalized interview questions, evaluates responses in real time, and delivers detailed performance feedback — all driven by Google Gemini AI.

---

## Features

- **User Authentication** — Secure registration and login with JWT-based sessions.
- **Resume Upload** — Upload a PDF resume to tailor interview questions to your experience.
- **AI Question Generation** — Gemini AI creates relevant technical and behavioral questions.
- **Answer Submission & Evaluation** — Submit answers and receive AI-scored evaluations.
- **Coding Interviews** — Dedicated coding interview support with structured assessments.
- **Detailed Feedback** — Per-question and overall feedback with improvement suggestions.
- **PDF Reports** — Download professional PDF reports of your interview performance.
- **Dashboard** — At-a-glance summary of completed interviews, scores, and progress.
- **Analytics** — Track performance trends over time with aggregated statistics.
- **Notifications** — In-app notifications for interview results and updates.
- **User Settings** — Customize preferences and account settings.
- **Admin Panel** — Manage users and interviews with admin-level access controls.
- **Health Check** — Production-ready health endpoint for uptime monitoring.
- **CORS Support** — Configured cross-origin access for frontend integration.

---

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Runtime      | [Node.js](https://nodejs.org/)              |
| Framework    | [Express 5](https://expressjs.com/)         |
| Database     | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| AI Engine    | [Google Gemini AI](https://ai.google.dev/)  |
| Auth         | [JSON Web Tokens](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| File Uploads | [Multer](https://github.com/expressjs/multer) |
| PDF Export   | [PDFKit](https://pdfkit.org/)               |
| CORS         | [cors](https://github.com/expressjs/cors)   |
| Config       | [dotenv](https://github.com/motdotla/dotenv) |

---

## Project Structure

```
19_Deployment/
├── server.js            # Entry point — starts the server
├── server.app.js        # Express app factory (CORS, health check, JSON parsing)
├── package.json
├── .env                 # Environment variables (not committed)
├── .env.example         # Template for environment variables
├── .gitignore
└── src/
    ├── config/
    │   └── db.js        # MongoDB connection
    ├── controllers/     # Route handlers
    ├── middleware/       # Auth & admin middleware
    ├── models/          # Mongoose schemas
    ├── routes/          # Express route definitions
    └── services/        # Business logic & AI integration
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- A [Google Gemini API key](https://ai.google.dev/)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ai-interview-simulator.git
   cd ai-interview-simulator/19_Deployment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create the environment file**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env`** with your actual values (see [Environment Variables](#environment-variables) below).

---

## Environment Variables

Create a `.env` file in the project root (or set these on your hosting platform):

| Variable        | Required | Default                  | Description                              |
| --------------- | -------- | ------------------------ | ---------------------------------------- |
| `PORT`          | No       | `5000`                   | Port the server listens on               |
| `MONGODB_URI`   | **Yes**  | —                        | MongoDB connection string                |
| `GEMINI_API_KEY` | **Yes** | —                        | Google Gemini API key                    |
| `JWT_SECRET`    | **Yes**  | —                        | Secret key for signing JWT tokens        |
| `FRONTEND_URL`  | No       | `http://localhost:3000`  | Allowed CORS origin for the frontend     |

Example `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_interview_simulator
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=replace_with_a_strong_secret_key
FRONTEND_URL=http://localhost:3000
```

> **Note:** `MONGO_URI` is also accepted as a fallback for backward compatibility.

---

## Running Locally

```bash
npm start
```

The server will connect to MongoDB and start listening:

```
MongoDB connected successfully: 127.0.0.1
Server is running on port 5000
```

Verify by hitting the health check:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{ "status": "Server is running" }
```

---

## API Overview

Base URL: `http://localhost:5000`

### Health

| Method | Endpoint         | Auth | Description            |
| ------ | ---------------- | ---- | ---------------------- |
| GET    | `/api/health`    | No   | Server health check    |

### Authentication

| Method | Endpoint              | Auth | Description             |
| ------ | --------------------- | ---- | ----------------------- |
| POST   | `/api/auth/register`  | No   | Register a new user     |
| POST   | `/api/auth/login`     | No   | Log in and receive JWT  |
| GET    | `/api/auth/profile`   | Yes  | Get current user profile |

### Resume

| Method | Endpoint              | Auth | Description                    |
| ------ | --------------------- | ---- | ------------------------------ |
| POST   | `/api/resume/upload`  | Yes  | Upload a resume (PDF, max 10MB) |
| GET    | `/api/resume`         | Yes  | Get the latest uploaded resume  |

### Interviews

| Method | Endpoint                  | Auth | Description                  |
| ------ | ------------------------- | ---- | ---------------------------- |
| POST   | `/api/interview/create`   | Yes  | Create a new interview       |
| GET    | `/api/interview`          | Yes  | List all user interviews     |
| GET    | `/api/interview/:id`      | Yes  | Get interview by ID          |
| DELETE | `/api/interview/:id`      | Yes  | Delete interview by ID       |

### AI Questions

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| POST   | `/api/ai/generate`                | Yes  | Generate AI interview questions |
| GET    | `/api/ai/questions/:interviewId`  | Yes  | Get questions for an interview  |

### Answers

| Method | Endpoint                      | Auth | Description                    |
| ------ | ----------------------------- | ---- | ------------------------------ |
| POST   | `/api/answer/submit`          | Yes  | Submit an answer               |
| GET    | `/api/answer/:interviewId`    | Yes  | Get answers for an interview   |

### Evaluation

| Method | Endpoint                          | Auth | Description                     |
| ------ | --------------------------------- | ---- | ------------------------------- |
| POST   | `/api/evaluation/evaluate`        | Yes  | Evaluate interview answers      |
| GET    | `/api/evaluation/:interviewId`    | Yes  | Get evaluation for an interview |

### Feedback

| Method | Endpoint                        | Auth | Description                      |
| ------ | ------------------------------- | ---- | -------------------------------- |
| POST   | `/api/feedback/generate`        | Yes  | Generate feedback from scores    |
| GET    | `/api/feedback/:interviewId`    | Yes  | Get feedback for an interview    |

### Reports

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| GET    | `/api/report/:interviewId`        | Yes  | Get interview report           |
| GET    | `/api/report/:interviewId/pdf`    | Yes  | Download PDF report            |

### Dashboard

| Method | Endpoint            | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| GET    | `/api/dashboard`    | Yes  | Get dashboard summary    |

### Analytics

| Method | Endpoint            | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| GET    | `/api/analytics`    | Yes  | Get performance analytics |

### Notifications

| Method | Endpoint                          | Auth | Description                    |
| ------ | --------------------------------- | ---- | ------------------------------ |
| GET    | `/api/notification`               | Yes  | Get all notifications          |
| POST   | `/api/notification/create`        | Yes  | Create a notification          |
| PUT    | `/api/notification/:id/read`      | Yes  | Mark notification as read      |

### Settings

| Method | Endpoint            | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| GET    | `/api/settings`     | Yes  | Get user settings        |
| POST   | `/api/settings`     | Yes  | Save user settings       |
| PUT    | `/api/settings`     | Yes  | Update user settings     |

### Admin

| Method | Endpoint                      | Auth  | Description              |
| ------ | ----------------------------- | ----- | ------------------------ |
| GET    | `/api/admin/users`            | Admin | List all users           |
| GET    | `/api/admin/interviews`       | Admin | List all interviews      |
| DELETE | `/api/admin/user/:id`         | Admin | Delete a user            |
| DELETE | `/api/admin/interview/:id`    | Admin | Delete an interview      |

---

## Deployment Steps

### Option 1 — Deploy to Render

1. Push your code to a GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect the repository and set the root directory to `19_Deployment`.
4. Configure the build and start commands:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add the environment variables (`MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`) in the Render dashboard.
6. Deploy — Render will assign a public URL automatically.

### Option 2 — Deploy to Railway

1. Push your code to a GitHub repository.
2. Create a new project on [Railway](https://railway.app/) and connect the repository.
3. Set the root directory to `19_Deployment`.
4. Add environment variables in the Railway dashboard.
5. Railway will detect the `npm start` script and deploy automatically.

### Option 3 — Deploy to a VPS (Ubuntu)

1. SSH into your server and clone the repository:

   ```bash
   git clone https://github.com/your-username/ai-interview-simulator.git
   cd ai-interview-simulator/19_Deployment
   ```

2. Install Node.js (v18+) and npm.

3. Install dependencies:

   ```bash
   npm install --production
   ```

4. Set environment variables (export or use a `.env` file).

5. Start the server with a process manager:

   ```bash
   npm install -g pm2
   pm2 start server.js --name ai-interview-simulator
   pm2 save
   pm2 startup
   ```

6. (Optional) Set up Nginx as a reverse proxy and configure SSL with Let's Encrypt.

### Post-Deployment Verification

After deploying, confirm the server is healthy:

```bash
curl https://your-domain.com/api/health
```

Expected response:

```json
{ "status": "Server is running" }
```

---

## Running Tests

```bash
npm test
```

This runs all module test scripts sequentially (auth, resume, interview, AI, answers, evaluation, feedback, reports, dashboard, admin, notifications, settings, analytics, and health check).

---

## License

ISC

# 🗂️ TaskBoard — Trello-Like Task Management App

A full-stack Kanban-style task management application with drag-and-drop functionality, role-based access control, and a modern dark-themed UI.

**Live Demo:** 🌐 [taskboard.trj.app](https://taskboard.trj.app)

---

## 📸 Screenshots

<img width="1920" height="1140" alt="Screenshot 2026-09-10 164654" src="https://github.com/user-attachments/assets/e6d6e1fa-53b2-4c1f-917e-43dab5f3b85f" />

<img width="1920" height="1140" alt="Screenshot 2026-09-10 164705" src="https://github.com/user-attachments/assets/de747d87-1693-4d87-a2ab-7f5bb8c5359d" />

<img width="1920" height="1140" alt="Screenshot 2026-09-10 170426" src="https://github.com/user-attachments/assets/7ad45b49-9851-4ec4-82f6-ff0c2e327f6e" />

<img width="1920" height="1140" alt="Screenshot 2026-09-10 170444" src="https://github.com/user-attachments/assets/fe6769cd-4e01-48a1-8645-aea4c82b9e4a" />

<img width="1920" height="1140" alt="Screenshot 2026-09-11 215105" src="https://github.com/user-attachments/assets/ed1f3068-a4b7-48a4-99ab-0c3922dac13f" />

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Express.js, TypeScript, Node.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens), bcrypt password hashing |
| **Drag & Drop** | @hello-pangea/dnd |
| **Security** | Helmet, CORS, express-validator |

---

## ✨ Features

### Core Features
- **Kanban Board**: Three-column task board (To Do, In Progress, Done) with drag-and-drop
- **User Authentication**: Secure registration and login with JWT tokens
- **Role-Based Access Control**: Two user roles with distinct permissions
- **CRUD Operations**: Create, read, update, and delete tasks
- **Task Assignment**: Assign and reassign tasks with role-based rules
- **Persistent Storage**: All changes persist in MongoDB

### User Roles & Permissions

| Action | Normal User | Admin |
|---|:---:|:---:|
| Register | ✅ | ❌ |
| Login | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| View own tasks | ✅ | ✅ |
| View all tasks | ❌ | ✅ |
| Edit own tasks | ✅ | ✅ |
| Edit any task | ❌ | ✅ |
| Delete own tasks | ✅ | ✅ |
| Delete any task | ❌ | ✅ |
| Self-assign unassigned tasks | ✅ | ✅ |
| Assign tasks to any user | ❌ | ✅ |
| Reassign tasks | ❌ | ✅ |
| View all users | ❌ | ✅ |
| Access admin panel | ❌ | ✅ |

---

## 📐 Architecture

```
Task Management App/
├── frontend/                # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/             # Pages (landing, login, register, dashboard, admin)
│   │   ├── components/      # Reusable UI (Navbar, TaskCard, TaskColumn, TaskModal, etc.)
│   │   ├── contexts/        # AuthContext (React context for auth state)
│   │   └── lib/             # API client, TypeScript types
│   └── ...
├── backend/                 # Express.js REST API
│   ├── src/
│   │   ├── config/          # Database connection, email (SMTP)
│   │   ├── controllers/     # Route handlers (auth, tasks, users)
│   │   ├── middleware/      # Auth, authorization, error handling
│   │   ├── models/          # Mongoose schemas (User, Task)
│   │   ├── routes/          # API route definitions
│   │   ├── scripts/         # Admin seed script
│   │   └── server.ts        # Express entry point
│   └── ...
├── nginx/                   # Nginx reverse proxy config
├── .github/workflows/       # CI/CD pipelines (ci.yml, cd.yml)
├── docker-compose.yml       # Production Docker orchestration
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/tharinrj/Task-Management-App.git
cd Task-Management-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskboard?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:3000

# Email (Gmail SMTP for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

Seed the admin user:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|:---:|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT token signing | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration duration (e.g., `7d`) | ❌ (default: `7d`) |
| `PORT` | Server port | ❌ (default: `5000`) |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ (default: `http://localhost:3000`) |
| `SMTP_HOST` | SMTP server hostname | ❌ (default: `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP server port | ❌ (default: `587`) |
| `SMTP_USER` | SMTP email address (sender) | ✅ |
| `SMTP_PASS` | SMTP password / app password | ✅ |

### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|---|---|:---:|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register (sends OTP to email) | No |
| POST | `/api/auth/verify-otp` | Verify OTP and create account | No |
| POST | `/api/auth/resend-otp` | Resend OTP to email | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Tasks
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/tasks` | Get all tasks (filtered by role) | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PATCH | `/api/tasks/reorder` | Batch reorder tasks (drag-and-drop) | Yes |
| GET | `/api/tasks/:id` | Get a single task | Yes |
| PUT | `/api/tasks/:id` | Update a task | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |
| PATCH | `/api/tasks/:id/status` | Update task status | Yes |
| PATCH | `/api/tasks/:id/assign` | Assign/reassign a task | Yes |

### Users (Admin Only)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user details | Admin |

### Health
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | API health check | No |

---

## 👤 Admin Account Setup

The admin account is created interactively via the seed script:

```bash
cd backend
npm run seed
```

The script will prompt you to enter:
- **Admin name**
- **Admin email**
- **Admin password**

> ⚠️ **Use a strong password for the admin account in production.**

---

## 🌐 Deployment

The app is deployed on an **AWS EC2** instance using **Docker Compose** with a **CI/CD pipeline** via GitHub Actions.

### Architecture

```
Client → Nginx (port 80/443) → ┬─ /api/*  → Backend  (Express :5000)
                               └─ /*      → Frontend (Next.js :3000)
```

- **Nginx** serves as a reverse proxy with HTTPS (Let's Encrypt) and gzip compression
- **Docker images** are built and pushed to **GHCR** (GitHub Container Registry)
- **CI/CD**: Pushing to `main` triggers CI → on success, CD builds images, pushes to GHCR, and deploys to EC2 via SSH

### EC2 Prerequisites

- Docker & Docker Compose installed
- Repository cloned at `~/Task-Management-App`
- Security group: inbound on ports **80** (HTTP) and **443** (HTTPS)
- SSL certificate provisioned via **Let's Encrypt** (Certbot)

### GitHub Secrets Required

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP or DNS of the EC2 instance — required |
| `EC2_USERNAME` | SSH user (e.g., `ubuntu`, `ec2-user`) — required |
| `EC2_SSH_KEY` | Private SSH key (PEM contents) — required |
| `MONGODB_URI` | MongoDB connection string — required |
| `JWT_SECRET` | Secret key for signing JWT tokens — required |
| `JWT_EXPIRES_IN` | JWT expiration (e.g., `7d`) — optional |
| `SMTP_HOST` | SMTP server hostname — optional |
| `SMTP_PORT` | SMTP server port — optional |
| `SMTP_USER` | SMTP username — required |
| `SMTP_PASS` | SMTP password — required |

### Manual Deployment

```bash
# On the EC2 instance
cd ~/Task-Management-App
git pull origin main
docker compose pull
docker compose up -d --remove-orphans
```

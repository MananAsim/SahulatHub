# SahulatHub Backend

> **Final Year Project** — Context-Aware Hybrid Matchmaking System  
> Connecting clients with the most relevant service providers using hybrid scoring.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| dotenv | Environment config |
| helmet + cors | Security |
| morgan | Request logging |

---

## Folder Structure

```
sahulathub-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register, login, getMe
│   └── taskController.js      # CRUD task operations
├── middleware/
│   ├── authMiddleware.js      # JWT verify + DEV_MODE bypass
│   └── roleMiddleware.js      # Role-based access control
├── models/
│   ├── User.js                # User schema (client/worker/admin)
│   └── Task.js                # Task schema
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── taskRoutes.js          # /api/tasks/*
│   ├── matchRoutes.js         # /api/match
│   └── devRoutes.js           # /api/dev/* (DEV_MODE only)
├── services/
│   └── matchService.js        # Hybrid scoring logic (modular, AI-ready)
├── utils/
│   └── generateToken.js       # JWT helper
├── server.js                  # App entry point
├── seed.js                    # Database seeder
└── .env                       # Environment variables
```

---

## Setup & Run

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB running locally (port 27017) or a MongoDB Atlas URI

### 2. Install dependencies

```bash
cd sahulathub-backend
npm install
npm install -D nodemon     # dev dependency
```

### 3. Configure environment

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sahulathub
JWT_SECRET=sahulathub_super_secret_key_2024
JWT_EXPIRES_IN=7d
DEV_MODE=true          # ← Set to false for production
```

### 4. Seed the database

```bash
npm run seed
```

This creates:
- 2 Clients: `ahmed@example.com`, `fatima@example.com`
- 2 Workers: `bilal@example.com`, `sara@example.com`
- 1 Admin:   `admin@sahulathub.com`
- 3 Sample tasks

All passwords are `password123` (admin: `admin2024`)

### 5. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## DEV_MODE Explained

When `DEV_MODE=true` in `.env`:

| Feature | Behavior |
|---|---|
| JWT verification | **SKIPPED** — no token required |
| Role simulation | Use `x-dev-role` header (`client` / `worker` / `admin`) |
| User ID simulation | Use `x-dev-user-id` header (MongoDB ObjectId) |
| `/api/dev/*` routes | **Mounted** — extra test utilities available |

> ⚠️ **NEVER** set `DEV_MODE=true` in production.

---

## API Reference

### Auth Routes `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT |
| GET | `/api/auth/me` | Private | Get own profile |

### Task Routes `/api/tasks`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/tasks` | Client/Admin | Create a task |
| GET | `/api/tasks/available` | Worker/Admin | List open tasks |
| GET | `/api/tasks/my` | All | Get own tasks |
| GET | `/api/tasks/:id` | All | Get task by ID |
| PATCH | `/api/tasks/:id/status` | All | Update task status |

### Matchmaking Routes `/api/match`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/match` | Private | Get ranked providers |

### Dev Routes `/api/dev` *(DEV_MODE only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dev/status` | Confirm DEV_MODE active |
| GET | `/api/dev/users` | List all users |
| GET | `/api/dev/tasks` | List all tasks |
| DELETE | `/api/dev/reset` | Wipe all data (re-seed after) |

---

## Postman Testing Guide

> **DEV_MODE tip:** Add header `x-dev-role: client` (or `worker` / `admin`) to all protected routes. No token needed.

### 1. Health Check

```
GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "project": "SahulatHub",
  "dev_mode": true
}
```

---

### 2. Register a User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "worker",
  "location": { "lat": 33.6844, "lng": 73.0479 },
  "skills": ["plumbing", "repair"]
}
```

---

### 3. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

Save the `token` from the response for authenticated requests.

---

### 4. Create a Task *(client role)*

```
POST http://localhost:5000/api/tasks
Content-Type: application/json
Authorization: Bearer <token>
x-dev-role: client
x-dev-user-id: <client_id_from_seed>
```

```json
{
  "title": "Fix water heater",
  "description": "The geyser is not heating water properly",
  "category": "Plumbing",
  "urgency": "high",
  "location": { "lat": 33.6844, "lng": 73.0479 },
  "radius": 10
}
```

---

### 5. Get Available Tasks *(worker role)*

```
GET http://localhost:5000/api/tasks/available
x-dev-role: worker
```

---

### 6. Update Task Status

```
PATCH http://localhost:5000/api/tasks/<task_id>/status
Content-Type: application/json
x-dev-role: client
```

```json
{
  "status": "in_progress"
}
```

Valid statuses: `open` | `assigned` | `in_progress` | `completed` | `cancelled`

---

### 7. Matchmaking

```
POST http://localhost:5000/api/match
Content-Type: application/json
x-dev-role: client
```

```json
{
  "query": "plumbing repair pipe",
  "location": { "lat": 33.6844, "lng": 73.0479 },
  "radius": 15,
  "urgency": "high"
}
```

**Response:**
```json
{
  "success": true,
  "total_providers": 2,
  "data": [
    {
      "provider_id": "...",
      "name": "Bilal Raza",
      "skills": ["plumbing", "repair", "installation"],
      "context_score": 0.8200,
      "hybrid_score": 0.6580,
      "final_score": 0.7552
    }
  ]
}
```

---

### 8. Dev Utilities

```
GET  http://localhost:5000/api/dev/status   → Confirm dev mode
GET  http://localhost:5000/api/dev/users    → List all users
GET  http://localhost:5000/api/dev/tasks    → List all tasks
DELETE http://localhost:5000/api/dev/reset  → Wipe DB (run seed after)
```

---

## Matchmaking Architecture

The `/services/matchService.js` is designed for future AI integration:

```
POST /api/match
     │
     ▼
matchService.findMatches()
     ├─ computeProximityScore()   ← Haversine distance
     ├─ computeContextScore()     ← proximity + skill-match + urgency
     │   └─ [TODO: replace with ML context model]
     ├─ computeHybridScore()      ← rating-based + collaborative stub
     │   └─ [TODO: replace with CF/CBF model]
     └─ finalScore = 0.6×context + 0.4×hybrid
```

To integrate AI in Phase 2, replace the stub functions in `matchService.js` — the API contract remains unchanged.

---

## Security Notes

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT signed with `JWT_SECRET` from `.env`
- `helmet` adds security HTTP headers
- Role middleware prevents cross-role access
- **`DEV_MODE=false`** must be set before any deployment

# Ethara

A microservices project management app. Three services: `user-service`, `project-service`, `frontend`.

## Stack

- **User Service** — FastAPI, JWT auth, bcrypt, MySQL
- **Project Service** — FastAPI, projects/tasks/RBAC, MySQL
- **Frontend** — React + Vite, dark UI
- **DB** — MySQL (shared instance)

---

## Running locally (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- User API: http://localhost:8001/docs
- Project API: http://localhost:8002/docs

---

## Running without Docker

**User Service:**
```bash
cd user-service
cp .env.example .env   # fill in DATABASE_URL and SECRET_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

**Project Service:**
```bash
cd project-service
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

**Frontend:**
```bash
cd frontend
cp .env.example .env   # set VITE_USER_API and VITE_PROJECT_API
npm install
npm run dev
```

---

## Railway Deployment

1. Create a Railway project
2. Add a MySQL plugin — copy the `DATABASE_URL`
3. Create three services (user-service, project-service, frontend), each pointing to its subdirectory
4. Set env vars per service:

**user-service:**
```
DATABASE_URL=<railway mysql url>
SECRET_KEY=<strong random string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

**project-service:**
```
DATABASE_URL=<same railway mysql url>
SECRET_KEY=<same SECRET_KEY as user-service>
ALGORITHM=HS256
```

**frontend:**
```
VITE_USER_API=https://<your-user-service>.railway.app
VITE_PROJECT_API=https://<your-project-service>.railway.app
```

> Tables are auto-created on first boot via SQLAlchemy.

---

## Roles

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View project tasks | ✅ | ✅ |

# Phase 3: Authentication & Relational CRUD APIs

## Objective
Secure the application using Supabase Auth and build the foundational RESTful API endpoints for managing tabular crime data.

## Key Tasks
1. **Auth Integration:**
   - Configure Supabase Auth (Email/Password or OAuth).
   - Implement frontend login/registration pages.
   - Create FastAPI middleware/dependencies to verify Supabase JWT tokens for secure routes.
2. **Relational Data Models (SQLAlchemy):**
   - Define database tables for `Cases`, `Users`, and `Locations`.
   - Generate and apply Alembic migrations (or direct SQLAlchemy `create_all`).
3. **CRUD Endpoints:**
   - Build FastAPI routers (`/api/cases`, `/api/users`).
   - Implement endpoints to Create, Read, Update, and Delete standard crime records.
   - Connect these endpoints to the Supabase Postgres database.
4. **Frontend State (Zustand):**
   - Setup Zustand store to hold the currently logged-in user and session token.

## Deliverables
- A secure login portal on the frontend.
- Protected API routes on the backend.
- Ability to manually add and view basic case records in Postgres.

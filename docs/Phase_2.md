# Phase 2: Authentication & User Management (Detailed Implementation Guide)

## 1. Overview and Core Objectives
Phase 2 establishes the security perimeter for the KSP Crime Intelligence Platform. Because we are dealing with sensitive law enforcement data (FIRs, suspect profiles, investigative diaries), strict access control is non-negotiable. 

We will leverage **Supabase Auth** for this layer. Supabase handles the complexities of securely storing credentials, issuing JSON Web Tokens (JWTs), and providing OAuth integrations natively. 

Our goals are:
1. **Frontend:** Create a secure portal where officers can log in, and implement routing guards so unauthenticated users cannot view the dashboard.
2. **Backend (FastAPI):** Implement middleware/dependencies that intercept API requests, validate the JWT issued by Supabase, and extract the user's identity before allowing access to sensitive data endpoints.
3. **State Management:** Use Zustand on the frontend to persist the user's session state across page reloads.

---

## 2. Directory Structure & File Architecture
This phase spans both the frontend and backend codebases.

```text
Datathon/
├── backend/
│   ├── api/
│   │   └── deps.py          # FastAPI dependencies (e.g., get_current_user)
│   └── core/
│       └── security.py      # JWT decoding and validation logic
└── frontend/
    └── src/
        ├── components/
        │   └── Auth/
        │       ├── LoginForm.tsx
        │       └── ProtectedRoute.tsx # Route wrapper component
        ├── pages/
        │   └── AuthPage.tsx # The main login screen
        ├── services/
        │   └── supabase.ts  # Frontend Supabase client initialization
        └── store/
            └── authStore.ts # Zustand store for session state
```

---

## 3. Implementation Steps

### 3.1 Supabase Project Configuration
Before writing code, the Auth provider must be enabled in the cloud:
- Log in to your Supabase dashboard and navigate to Authentication -> Providers.
- Ensure "Email Provider" is enabled (disable email confirmations for local testing to speed up development).
- Optionally, configure the Google OAuth provider by setting up GCP credentials, providing a seamless single-sign-on experience for officials.

### 3.2 Frontend: Initializing the Supabase Client
- In `frontend/src/services/supabase.ts`, import `createClient` from `@supabase/supabase-js`.
- Initialize it using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. 
- Export this client so it can be used throughout the React app to trigger `supabase.auth.signInWithPassword()` and `supabase.auth.signOut()`.

### 3.3 Frontend: State Management (Zustand)
- Create `authStore.ts`.
- Define an interface containing `session`, `user`, `isLoading`, and actions like `setSession`, `logout`.
- Implement a `useEffect` hook in the root `App.tsx` that listens to `supabase.auth.onAuthStateChange`. Whenever the auth state changes (login, logout, token refresh), update the Zustand store automatically.

### 3.4 Frontend: The UI & Protected Routes
- **AuthPage:** Build a sleek, dark-themed login interface using Tailwind CSS. Include email/password inputs and a "Sign In" button.
- **ProtectedRoute:** Create a React component that wraps your dashboard routes. It should check the Zustand store: if `user` is null, redirect them to the `/login` page using React Router's `<Navigate />`.

### 3.5 Backend: FastAPI Security & Dependency Injection
- Supabase JWTs are signed with a specific secret (or you can fetch the public key/JWKS from your Supabase instance). 
- In `backend/core/security.py`, write a function that takes a Bearer token and decodes it using the `jose` or `pyjwt` library, verifying its signature against the Supabase JWT secret.
- In `backend/api/deps.py`, create an asynchronous dependency function `get_current_user(token: str = Depends(oauth2_scheme))`. 
  - This function decodes the token. 
  - If valid, it returns the user's UUID.
  - If invalid or expired, it raises an `HTTPException(status_code=401, detail="Invalid authentication credentials")`.

### 3.6 Backend: Protecting an Endpoint
- To prove the system works, create a temporary route in `main.py` (e.g., `/api/v1/secure-data`).
- Inject the dependency: `def get_secure_data(user_id: str = Depends(get_current_user)):`.
- Now, this endpoint will automatically reject any request that lacks a valid Supabase JWT in the `Authorization: Bearer <token>` header.

---

## 4. Security Considerations
- **Never expose the Service Role Key on the frontend.** The frontend only ever uses the `ANON_KEY`.
- **Token Expiry:** Ensure the frontend correctly handles token refresh events (Supabase JS handles this automatically if configured properly).
- **CORS:** Ensure your FastAPI backend `CORSMiddleware` is configured to allow headers like `Authorization` from the frontend's origin (`http://localhost:5173`).

---

## 5. Definition of Done & Verification Strategy
You know Phase 2 is complete when:
1. A user can navigate to the React app and is immediately bounced to the Login screen.
2. The user can create an account (or log in) via the Supabase UI and successfully enter the dashboard view.
3. The React app can make an authenticated Axios fetch request to `/api/v1/secure-data` by attaching the session's `access_token` to the Headers, and the FastAPI backend responds with a `200 OK` rather than a `401 Unauthorized`.
4. Clicking "Log Out" clears the session and kicks the user back to the login screen.

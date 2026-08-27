# Property Management System Frontend

A complete React + TypeScript frontend for your Spring Boot backend API.

## What is implemented

- JWT authentication:
  - Register: POST /auth/register
  - Login: POST /auth/login (handles plain text JWT response)
  - Protected routes with token guard
- Role-adaptive dashboard:
  - Owner mode (auto-detected from /dashboard/owner)
  - Tenant mode (fallback to /dashboard/tenant)
- Full API-driven operational modules:
  - Properties: create
  - Leases: list, create, get by ID, terminate
  - Payments: create, list my/owner, list by lease, rent status by lease
  - Maintenance: create, list my/owner, update status (owner)
- Centralized API error handling for backend error maps and validation responses.
- Clean responsive UI for desktop and mobile.

## Project structure highlights

- src/api
  - axios.ts: API client + auth header interceptor
  - Authapi.ts, propertyApi.ts, leaseApi.ts, paymentApi.ts, maintenanceApi.ts
  - error.ts: backend error parser
- src/types
  - api.ts: request/response and enum types for backend endpoints
  - dashboard.ts: dashboard DTOs
- src/pages
  - login.tsx
  - Register.tsx
  - Dashboard.tsx

## Run locally

1. Install dependencies:

   npm install

2. Optional: configure backend base URL (default is http://localhost:8080)

   Create a .env file in project root:

   VITE_API_BASE_URL=http://localhost:8080

3. Start development server:

   npm run dev

4. Build for production:

   npm run build

## Important backend constraints handled by frontend

- Login returns raw token string, not JSON.
- No tenant search/list endpoint exists in backend.
- No property listing endpoint exists in backend.

Because of this, lease and maintenance workflows require manual ID input where the backend does not provide discovery APIs.

## Suggested testing flow

1. Register tenant account.
2. Login with owner account (seeded in backend DB) and create property.
3. Create lease with propertyId + tenantId.
4. Login as tenant and create payment for lease.
5. Tenant creates maintenance request.
6. Owner updates maintenance status.

## Tech stack

- React 19
- TypeScript
- Vite
- Axios
- React Router
- Lucide React icons

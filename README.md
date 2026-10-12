# LOS Frontend MVP

Desktop-first loan origination frontend built with Next.js App Router. The Java backend can be integrated through `src/services/api.js` and `src/services/auth.js`.

## Run locally    

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## Authentication

Application routes require a session cookie set after successful login or OTP
verification. The HttpOnly cookie contains the backend-issued JWT; its expiry is
checked locally, and the backend remains responsible for validating the token
for API requests. No `SESSION_SECRET` is required.

## Routes

- `/login`
- `/dashboard`
- `/applications`
- `/customers`
- `/reports`
- `/settings`

## Java API integration

Set `NEXT_PUBLIC_API_URL` in the project-root `.env.local`. Replace the mock
collections in `src/services/api.js` with fetch calls to the Java services.
Authentication is isolated in `src/services/auth.js`.
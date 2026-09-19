# Northstar LOS Frontend MVP

Desktop-first loan origination frontend built with Next.js App Router. The Java backend can be integrated through `src/services/api.js` and `src/services/auth.js`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## Routes

- `/login`
- `/dashboard`
- `/applications`
- `/customers`
- `/reports`
- `/settings`

## Java API integration

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`. Replace the mock collections in `src/services/api.js` with fetch calls to the Java services. Authentication is isolated in `src/services/auth.js`.
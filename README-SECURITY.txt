SECURITY IMPROVEMENTS IN THIS VERSION

1) Passwords are hashed with bcryptjs (12 rounds).
2) Public registration always creates CUSTOMER accounts only.
3) Login response does NOT include email or password.
4) /api/auth/me returns sanitized user data only.
5) Helmet security headers are enabled.
6) Rate limiting is enabled for login and auth endpoints.
7) Admin routes are protected by JWT + role checks.
8) Product input is validated.
9) Cart quantities are validated and checked against stock.
10) Order totals are recalculated on the server from product prices.
11) Order stock is checked again before placement.
12) JWT payload is reduced to id + role + name.
13) JWT secret is read from .env.example/.env.

IMPORTANT
- Run npm install inside backend after extracting the project.
- Create .env from .env.example before starting the server.
- This is a strong local/dev baseline, not a formal security audit.

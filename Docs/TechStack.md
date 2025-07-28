# ⚙️ Backend Tech Stack – Full Overview

This file documents all the tools, libraries, and patterns used in the backend system to keep everything clean, scalable, and dev-friendly.

---

## 🧠 Core Stack

- **Runtime**: Node.js
- **Framework**: [NestJS](https://nestjs.com/) – Scalable TypeScript backend
- **ORM**: [Prisma](https://www.prisma.io/) – Type-safe DB queries
- **Database**: MySQL
- **API**: REST (with versioning)
- **Realtime**: WebSocket (NestJS Gateway)

---

## 🔐 Authentication

- **Strategy**: JWT (access + refresh tokens)
- **Password Hashing**: `bcrypt`
- **Passport Integration**: `@nestjs/passport`, `passport-jwt`
- **Optional**: `cookie-parser`, CSRF (for secure web sessions)

---

## 🧪 Testing

- **Test Runner**: [Jest](https://jestjs.io/)
- **Unit Testing**: Services, controllers, utilities
- **E2E Testing**: `Supertest` + Nest testing module
- **Mocking**: `ts-mockito` / manual DI mocks
- **Test Data**: `@faker-js/faker`

---

## 📄 Documentation

- **Auto API Docs**: `@nestjs/swagger`
- **Swagger UI Endpoint**: `/api/docs`
- **Optional Upgrade**: Redoc for advanced visuals

---

## 🪵 Logging

- **Preferred Logger**: `pino` (fast + structured JSON logs)
- **Alternative**: `winston` (colorful, more flexible)
- **Nest Integration**: Create custom LoggerService using NestJS Logger interface
- **Log Levels**: info, warn, error, debug

---

## 🐞 Debugging

- **Dev Debugging**: VS Code Debugger, `debugger` statements
- **Runtime Monitoring**: [Sentry](https://sentry.io/) – error reporting
- **Log Storage**: stdout / file logs (depending on environment)
- **Alerting**: Optional Slack/Discord hooks

---

## 🚀 Dev Experience

- **Hot Reload**: `ts-node-dev` with `--respawn`
  ```bash
  npm run start:dev

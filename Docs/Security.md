# 🔐 Security Overview – Backend

This document outlines the complete security strategy and tools used to protect the backend, APIs, and user data.

---

## 🧱 Core Layers

1. **Authentication** – Verifies identity using JWT
2. **Authorization** – Controls access via roles
3. **Validation** – Sanitizes and verifies all incoming data
4. **Rate Limiting** – Blocks spam and abuse
5. **Network Security** – Protects HTTP layer via headers and HTTPS
6. **Secrets Management** – Keeps sensitive keys safe

---

## ✅ Authentication – JWT Based

- **Library**: `@nestjs/passport` + `passport-jwt`
- **Tokens**:
  - **Access Token**: Short lifespan (15 mins – 1 hour)
  - **Refresh Token**: Long lifespan (7+ days), stored securely

### Token Storage Strategy:
| Environment | Storage Type          |
|-------------|------------------------|
| Web (secure) | `httpOnly` cookies     |
| Mobile/SPA  | `localStorage` or memory |

---

## ✅ Authorization – RBAC (Role-Based Access Control)

- Use a `RolesGuard` to protect routes:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/dashboard')


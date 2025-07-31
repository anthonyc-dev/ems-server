```
# 🔐 Node.js Authentication Template (Express + Prisma + JWT)

A robust and secure authentication backend built with **Node.js**, **Express**, **Prisma**, and **JWT**.  
This template supports modern authentication flows with **access/refresh tokens**, **role-based authorization**, and **secure session handling** via cookies.

---

## 📂 Project Structure

```

auth-templete/
├── controllers/        # Logic for auth endpoints (login, register, etc.)
├── middlewares/        # JWT verification and role-based protection
├── prisma/             # Prisma schema and migration files
│   ├── schema.prisma
│   └── ...
├── routes/             # All route definitions
├── utils/              # Token generation and helper functions
├── .env                # Environment variables
├── server.ts           # Express app entry point
├── package.json
└── tsconfig.json

````

---

## 🚀 Features

- 🔑 JWT Authentication (Access & Refresh Tokens)
- 🧠 Role-based Access Control (`user`, `admin`, etc.)
- 🔐 Protected Routes
- 🔄 Secure Token Refresh with `HttpOnly` cookies
- 🔓 Logout with Refresh Token Revocation
- 🧰 Prisma ORM (fully typed) with PostgreSQL or other DBs
- 🌐 CORS & Cookie Management Configured for Web Clients
- 🛡️ Written in Modern TypeScript

---

## 🛠 Tech Stack

- **Node.js** + **Express.js**
- **Prisma** ORM
- **TypeScript**
- **PostgreSQL** (or other databases supported by Prisma)
- **JWT** (`jsonwebtoken`)
- **bcryptjs**
- **cookie-parser**
- **dotenv**

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HardUsername-123/auth-templete.git
cd auth-templete
````

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Create `.env` File

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/yourdb"
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

Update your `DATABASE_URL` with valid credentials.

---

### 4. Set Up Prisma

Generate the client and migrate the initial schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 5. Start the Server

```bash
npm run dev
```

Server will run at `http://localhost:5000`

---

## 📬 API Endpoints

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | `/api/auth/register`      | Register a new user              |
| POST   | `/api/auth/login`         | Authenticate user, return tokens |
| POST   | `/api/auth/refresh-token` | Refresh access token via cookie  |
| POST   | `/api/auth/logout`        | Invalidate refresh token         |
| GET    | `/api/protected`          | Protected route (requires token) |

---

## 🔐 Authentication Flow

1. **Login** via `/auth/login`

   * Server issues `accessToken` and sets `refreshToken` in `HttpOnly` cookie.
2. **Access protected routes** by passing:

   ```http
   Authorization: Bearer <accessToken>
   ```
3. When the access token expires:

   * Client silently sends request to `/auth/refresh-token` to obtain a new one.
4. **Logout** by calling `/auth/logout`, which clears the cookie.

---

## 🧠 Prisma Model Example

```prisma
model User {
  id        String   @id @default(uuid())
  username  String
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now())
}
```

Update your model in `prisma/schema.prisma`.

---

## 🔑 Role-Based Access Example

### Middleware: `requireRole('admin')`

```ts
const requireRole = (role: string) => (req, res, next) => {
  if (req.user?.role !== role) return res.sendStatus(403);
  next();
};
```

### Route:

```ts
app.get("/api/admin", verifyToken, requireRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});
```

---

## 🔄 Token Refresh (HttpOnly Cookies)

* Refresh token is stored securely as a `HttpOnly` cookie.
* Automatically included by the browser in requests.
* Refresh endpoint issues a new `accessToken`.

---

## 🔓 Logout

```http
POST /api/auth/logout
```

* Clears the cookie
* Invalidates the session

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ by [@HardUsername-123](https://github.com/HardUsername-123)

````

---

### ✅ Bonus Files You Should Add:

- `.env.example`  
  ```env
  PORT=5000
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dbname"
  ACCESS_TOKEN_SECRET=your_access_token_secret
  REFRESH_TOKEN_SECRET=your_refresh_token_secret
````

* Sample `prisma/schema.prisma`
  (if not already committed)

---

Would you like me to:

* Push this to your GitHub repo as a PR?
* Add badges (build, license, etc.) to the top?
* Generate OpenAPI (Swagger) docs for your API?

Let me know!

# 🔐 Token Based Authentecation Template API (Express + Prisma + JWT)

A robust and secure authentication backend built with **Node.js**, **Express**, **Prisma**, and **JWT**.  
This template supports modern authentication flows with **access/refresh tokens**, **role-based authorization**, and **secure session handling** via cookies.

---

## 📂 Project Structure
```text
auth-templete/
├── controllers/        # Logic for auth endpoints (login, register, etc.)
├── middlewares/        # JWT verification and role-based protection
├── prisma/             # Prisma schema and migration files
│   ├── schema.prisma
│   └── ...
├── routes/             # All route definitions
├── utils/              # Token generation and helper functions
├── .env                # Environment variables
├── app.ts              # Express app entry point
├── index.ts            # Run server in application
├── package.json
└── tsconfig.jsonn
```

## 🚀 Features

- 🔑 JWT Authentication (Access & Refresh Tokens)
- 🔐 Protected Routes
- 🔄 Secure Token Refresh with `HttpOnly` cookies
- 🔓 Logout with Refresh Token Revocation
- 🧰 Prisma ORM (fully typed) with PostgreSQL or other DBs
- 🌐 CORS & Cookie Management Configured for Web Clients
- 🛡️ Written in Modern TypeScript

## 🛠 Tech Stack

- **Node.js** + **Express.js**
- **Prisma** ORM
- **TypeScript**
- **MongoDB Atlas** (or other databases supported by Prisma)
- **JWT** (`jsonwebtoken`)
- **bcryptjs**
- **cookie-parser**
- **dotenv**


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
DATABASE_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development or production
PORT=your_port
```

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

Server will run at `http://localhost:your_port`

---

## 📬 API Endpoints

| Method | Endpoint              | Description                      |
| -------|-----------------------|----------------------------------|
| POST   | `/auth/register`      | Register a new user              |
| POST   | `/auth/login`         | Authenticate user, return tokens |
| POST   | `/auth/refresh-token` | Refresh access token via cookie  |
| POST   | `/auth/logout`        | Invalidate refresh token         |
| GET    | `/auth/getProfile`    | Get Profile (requires token)     |

---

## 🔐 Authentication Flow

1. **Login** via `/auth/login`

   * Server issues `accessToken` and sets `refreshToken` in `HttpOnly` cookie.
2. **Access getProfile routes** by passing:

   ```http
   Authorization: Bearer <accessToken>
   ```
3. When the access token expires:

   * Client silently sends request to `/auth/refresh-token` to obtain a new one.
4. **Logout** by calling `/auth/logout`, which clears the cookie.

---

## 🧠 Prisma Model Example

```prisma
model AuthenticatedUser {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  studentId String   @unique
  firstName String
  lastName  String
  email     String   @unique
  phoneNumber String
  password  String
  role      String
  refreshToken String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```


---

## 🔄 Token Refresh (HttpOnly Cookies)

* Refresh token is stored securely as a `HttpOnly` cookie.
* Automatically included by the browser in requests.
* Refresh endpoint issues a new `accessToken`.

---

## 🔓 Logout

```http
POST /auth/logout
```

* Clears the cookie
* Invalidates the session

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ by [@HardUsername-123](https://github.com/HardUsername-123)

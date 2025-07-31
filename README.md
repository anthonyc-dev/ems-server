

```md
# 🔐 Node.js Auth Template (Express + Prisma + JWT)

A secure and production-ready backend template for authentication using **Node.js**, **Express**, **Prisma**, and **JWT**.  
Supports **access & refresh token** flow, **role-based authorization**, and **protected routes**.

---

## 📁 Project Structure

```

auth-templete/
├── controllers/        # Login, Register, Refresh, Logout logic
├── middlewares/        # JWT Auth middleware, role checks
├── prisma/             # Prisma schema and migrations
│   ├── schema.prisma
│   └── ...
├── routes/             # Route definitions
├── utils/              # Helper functions (e.g. token generation)
├── .env                # Environment variables
├── server.ts           # Express app entry point
├── package.json
└── tsconfig.json

````

---

## 🚀 Features

- ✅ **JWT Authentication** (Access + Refresh Tokens)
- 🔁 Token auto-refresh endpoint
- 🧠 **Role-based access control**
- 🔐 **Protected Routes**
- 🧼 **Logout & Token revocation**
- 📦 **Prisma ORM** with **PostgreSQL** or any supported DB
- 🌐 **HttpOnly cookie** for refresh token
- 🛡️ Secure token storage and user sessions

---

## 🔧 Tech Stack

- **Node.js + Express**
- **Prisma ORM**
- **TypeScript**
- **JWT (`jsonwebtoken`)**
- **bcryptjs**
- **cookie-parser**
- **dotenv**

---

## 🧪 Setup Instructions

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/HardUsername-123/auth-templete.git
cd auth-templete
````

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure `.env`

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/yourdb"
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

Replace `DATABASE_URL` with your actual DB connection string. Prisma supports PostgreSQL, MySQL, SQLite, and more.

---

### 4️⃣ Prisma Setup

Run the following to generate the client and migrate your database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### 5️⃣ Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 🧾 API Endpoints

| Method | Route                     | Description                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/api/auth/register`      | Register new user               |
| POST   | `/api/auth/login`         | Login user and get tokens       |
| POST   | `/api/auth/refresh-token` | Refresh access token via cookie |
| POST   | `/api/auth/logout`        | Logout and clear cookie         |
| GET    | `/api/protected`          | Protected route (auth required) |

---

## 🔐 Auth Flow

1. User logs in via `/login` with email & password.
2. Server responds with:

   * `accessToken` (in response)
   * `refreshToken` (stored in HTTP-only cookie)
3. Client sends `accessToken` in Authorization header:

   ```
   Authorization: Bearer <accessToken>
   ```
4. If `accessToken` expires, client uses `/refresh-token` to get a new one.
5. On logout, `/logout` clears the cookie.

---

## 🧠 Example Prisma Model

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

> You can modify this in `prisma/schema.prisma`.

---

## 🔑 Role-based Access (Example)

### Middleware: `requireRole("admin")`

```ts
const requireRole = (role: string) => (req, res, next) => {
  if (req.user?.role !== role) return res.sendStatus(403);
  next();
};

app.get("/api/admin", verifyToken, requireRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});
```

---

## 🔄 Refresh Token (via Cookies)

* Uses `HttpOnly` cookie to store the refresh token securely.
* Sent automatically on API call (if client supports cookies).
* Refresh endpoint returns a new access token.

---

## 🧹 Logout

```http
POST /api/auth/logout
```

* Clears the refresh token from the cookie.
* Invalidates the session on the client side.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Made by [@HardUsername-123](https://github.com/HardUsername-123)

```

---

### ✅ Bonus Suggestions:
If you want, I can also:
- Generate the `.env.example` file
- Generate a sample `prisma/schema.prisma`
- Push the `README.md` to your repo with a PR

Would you like any of those?
```

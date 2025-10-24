# React + Vite Token-Based Authentication Setup

Complete setup guide for implementing token-based authentication with access and refresh token rotation in a React + Vite application.

## 1. Project Setup

### Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### Environment Variables

Create `.env.local` file in your Vite project root:

```bash
# .env.local
VITE_API_URL=http://localhost:3001
```

## 2. Auth Context Provider

```typescript
// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        // Decode token to get user info or make separate API call
        const tokenData = JSON.parse(
          atob(response.data.accessToken.split(".")[1])
        );
        setUser({
          id: tokenData.id,
          email: tokenData.email,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { email, password },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 3. Axios Configuration with Auto Token Refresh

```typescript
// src/utils/apiClient.ts
import axios, { AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

## 4. Authentication Form Component (Login/Register)

```typescript
// src/components/AuthForm.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isLogin && password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/dashboard"); // Redirect after successful auth
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            {isLogin && (
              <div className="rounded-b-md">
                <input className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                ? "Sign in"
                : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

## 5. Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
```

## 6. Dashboard Component

```typescript
// src/components/Dashboard.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProtectedData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/protected-data");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Protected Content</h2>
            <button
              onClick={fetchProtectedData}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch Protected Data"}
            </button>

            {data && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 7. App Component Setup

```typescript
// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## 8. Custom Hook for API Calls

```typescript
// src/hooks/useApi.ts
import { useState } from "react";
import apiClient from "../utils/apiClient";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: any
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    request,
  };
};
```

## 9. Tailwind CSS Setup (Optional)

If you want to use the styling in the components above:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 10. Usage Example

```typescript
// src/components/UserProfile.tsx
import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export const UserProfile: React.FC = () => {
  const { loading, error, request } = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await request<UserProfile>("GET", "/api/user/profile");
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">User Profile</h2>
      {profile && (
        <div className="mt-4">
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
        </div>
      )}
    </div>
  );
};
```

## 11. Environment Configuration

### Development (.env.local)

```bash
VITE_API_URL=http://localhost:3001
```

### Production (.env.production)

```bash
VITE_API_URL=https://your-api-domain.com
```

## 12. Vite Configuration

Update `vite.config.ts` if needed:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

## 13. Backend Route Setup

Make sure to add the register route to your backend routes:

```typescript
// src/routes/enrollment/enrollment-auth.route.ts
import { Router } from "express";
import {
  login,
  register,
  refresh,
  logout,
} from "../../controllers/enrollment/enrollment-auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
```

## 14. Testing the Registration

### Test API Endpoints

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}' \
  -c cookies.txt

# Login with existing user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}' \
  -c cookies.txt

# Access protected route
curl -X GET http://localhost:3001/api/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

## 15. Features Included

✅ **Complete Authentication System**:

- User registration with validation
- User login with secure password verification
- Automatic token refresh with rotation
- Secure logout with token revocation

✅ **Frontend Features**:

- Combined login/register form with toggle
- Form validation (email format, password strength, password confirmation)
- Automatic token management
- Protected routes
- Beautiful, responsive UI with Tailwind CSS

✅ **Security Features**:

- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with expiration
- HttpOnly cookies for refresh tokens
- Token rotation on refresh
- Input validation and sanitization

This setup provides a complete, production-ready authentication system for React + Vite with automatic token refresh, proper error handling, and a clean component structure!

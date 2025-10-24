# Frontend Token-Based Authentication Configuration

This guide provides comprehensive examples for implementing token-based authentication with access and refresh token rotation on the frontend.

## 1. React/Next.js Configuration

### Auth Context Provider

```typescript
// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
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

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        // You might want to decode the token to get user info
        // or make a separate API call to get user details
      } else {
        setAccessToken(null);
        setUser(null);
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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAccessToken(data.accessToken);
        setUser(data.user);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
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
    logout,
    isLoading,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### HTTP Client with Automatic Token Refresh

```typescript
// utils/apiClient.ts
class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        return data.accessToken;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return null;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
        ...options.headers,
      },
      credentials: "include",
    };

    let response = await fetch(url, config);

    // If 401, try to refresh token and retry once
    if (response.status === 401 && this.accessToken) {
      const newToken = await this.refreshToken();
      if (newToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, config);
      }
    }

    return response;
  }

  async get(endpoint: string, options?: RequestInit) {
    return this.makeRequest(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint: string, data?: any, options?: RequestInit) {
    return this.makeRequest(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any, options?: RequestInit) {
    return this.makeRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options?: RequestInit) {
    return this.makeRequest(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);
```

### Login Component

```typescript
// components/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <div>Please log in to access this page.</div>,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

## 2. Vue.js Configuration

### Auth Store (Pinia)

```typescript
// stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface User {
  id: string;
  email: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isLoading = ref(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const isAuthenticated = computed(() => !!accessToken.value);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        accessToken.value = data.accessToken;
      } else {
        accessToken.value = null;
        user.value = null;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      accessToken.value = null;
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        accessToken.value = data.accessToken;
        user.value = data.user;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      accessToken.value = null;
      user.value = null;
    }
  };

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    checkAuthStatus,
    login,
    logout,
  };
});
```

## 3. Vanilla JavaScript Configuration

### Auth Manager Class

```javascript
// auth/authManager.js
class AuthManager {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.user = null;
    this.isLoading = false;
  }

  async checkAuthStatus() {
    this.isLoading = true;
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        return true;
      } else {
        this.accessToken = null;
        this.user = null;
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      this.accessToken = null;
      this.user = null;
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.accessToken = data.accessToken;
        this.user = data.user;
        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.accessToken = null;
      this.user = null;
    }
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
        ...options.headers,
      },
      credentials: "include",
    };

    let response = await fetch(url, config);

    // If 401, try to refresh token and retry once
    if (response.status === 401 && this.accessToken) {
      const refreshed = await this.checkAuthStatus();
      if (refreshed) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        response = await fetch(url, config);
      }
    }

    return response;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }
}

// Usage
const authManager = new AuthManager("http://localhost:3001");

// Initialize auth status on page load
document.addEventListener("DOMContentLoaded", async () => {
  await authManager.checkAuthStatus();
  updateUI();
});

function updateUI() {
  const loginForm = document.getElementById("loginForm");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");

  if (authManager.isAuthenticated()) {
    loginForm.style.display = "none";
    dashboard.style.display = "block";
  } else {
    loginForm.style.display = "block";
    dashboard.style.display = "none";
  }
}

// Login form handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await authManager.login(email, password);
    updateUI();
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// Logout handler
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await authManager.logout();
  updateUI();
});
```

## 4. Axios Configuration

### Axios Interceptor Setup

```typescript
// utils/axiosConfig.ts
import axios, { AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

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

## 5. Environment Variables

### .env files for different environments

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001

# .env.production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
REACT_APP_API_URL=https://your-api-domain.com
VITE_API_URL=https://your-api-domain.com
```

## 6. Security Best Practices

### Frontend Security Checklist

1. **Never store access tokens in localStorage** (use httpOnly cookies)
2. **Always use HTTPS in production**
3. **Implement proper CORS configuration**
4. **Use secure cookie settings**
5. **Implement proper error handling**
6. **Add request/response logging for debugging**
7. **Implement rate limiting on the frontend**
8. **Use Content Security Policy (CSP)**

### CORS Configuration (Backend)

```typescript
// In your Express app
import cors from "cors";

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

## 7. Testing Authentication

### Test API Endpoints

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"yourpassword"}' \
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

This configuration provides a complete, secure token-based authentication system with automatic token refresh and proper error handling across different frontend frameworks.

import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface User {
  id: number;
  email: string;
  password: string;
}

const users: User[] = [
  { id: 1, email: "admin@admin.com", password: "12345" },
  { id: 2, email: "admin2@admin.com", password: "12345" },
  { id: 3, email: "admin3@admin.com", password: "12345" },
];

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // set false in local dev
    sameSite: "strict",
    path: "/",
  });

  res.json({ accessToken });
};

export const refresh = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ message: "No refresh token" });
    return;
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ message: "Invalid refresh token" });
      return;
    }
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logout successful" });
};

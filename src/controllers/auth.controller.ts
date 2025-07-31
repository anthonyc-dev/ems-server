import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  AuthenticatedRequest,
  LoginRequest,
  RegisterRequest,
} from "../types/type";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
    }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.authenticatedUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.authenticatedUser.create({
      data: {
        studentId,
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
      },
    });

    // Generate JWT token with refresh token
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    await prisma.authenticatedUser.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        studentId: newUser.studentId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await prisma.authenticatedUser.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "Wrong credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Wrong credentials" });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "10s" }
    );

    // Store refresh token in database
    await prisma.authenticatedUser.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      maxAge: 10 * 1000, // 10 seconds
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// // Refresh token endpoint
// export const refreshToken = async (req: Request, res: Response) => {
//   try {
//     // Try to get refreshToken from cookie first, then from body
//     const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

//     if (!refreshToken) {
//       res.status(401).json({ error: "Refresh token required" });
//       return;
//     }

//     // Verify refresh token
//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.JWT_REFRESH_SECRET!
//     ) as any;

//     // Find user and check if refresh token matches
//     const user = await prisma.authenticatedUser.findUnique({
//       where: { id: decoded.userId },
//     });

//     if (!user || user.refreshToken !== refreshToken) {
//       res.status(403).json({ error: "Invalid refresh token" });
//       return;
//     }

//     // Generate new access token
//     const newAccessToken = jwt.sign(
//       { userId: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET!,
//       { expiresIn: "15m" }
//     );

//     res.status(200).json({
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     console.error("Refresh token error:", error);
//     res.status(403).json({ error: "Invalid refresh token" });
//   }
// };

// Refresh token endpoint with rotation
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Try to get refreshToken from cookie first, then from body
    const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    // Verify old refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;
    } catch (err) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    // Find user and check if refresh token matches
    const user = await prisma.authenticatedUser.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== oldRefreshToken) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    // Generate new refresh token (rotate)
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "10s" }
    );

    // Store new refresh token in database (replace old one)
    await prisma.authenticatedUser.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set new refresh token as httpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      // maxAge: 24 * 60 * 60 * 1000, // 1 day
      maxAge: 10 * 1000, // 10 seconds
    });

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// Logout endpoint
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Clear refresh token from database
    await prisma.authenticatedUser.update({
      where: { id: req.user.userId },
      data: { refreshToken: null },
    });

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await prisma.authenticatedUser.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

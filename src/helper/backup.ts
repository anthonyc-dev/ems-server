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
      fullName,
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
        fullName,
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
      { expiresIn: "15m" } // Shorter access token
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Longer refresh token
    );

    // res.cookie("refreshToken", token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "Strict",
    //   path: "/",
    // });
    // res.json({ accessToken, user });

    // Store refresh token in database (you might want to add a refreshToken field to your Auth model)
    await prisma.authenticatedUser.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        studentId: newUser.studentId,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
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
      res.status(404).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15s" } // Shorter access token
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Longer refresh token
    );

    // Store refresh token in database
    await prisma.authenticatedUser.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        studentId: user.studentId,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as any;

    // Find user and check if refresh token matches
    const user = await prisma.authenticatedUser.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15s" }
    );

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
        fullName: true,
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
        fullName: user.fullName,
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

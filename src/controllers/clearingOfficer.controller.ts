import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  cookieOptions,
  signAccessToken,
  signRefreshToken,
  tokenErrStatus,
} from "../libs/token";
import { LoginRequest, RegisterRequest } from "../types/type";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---- Register
export const register = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
    }: RegisterRequest = req.body;

    const existing = await prisma.clearingOfficer.findUnique({
      where: { email },
    });
    if (existing) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const existingSchoolId = await prisma.clearingOfficer.findUnique({
      where: { schoolId },
    });
    if (existingSchoolId) {
      res
        .status(400)
        .json({ error: "User with this school ID already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.clearingOfficer.create({
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        password: hashed,
        role,
      },
    });

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken(user.id);

    await prisma.clearingOfficer.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        schoolId: user.schoolId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---- Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    const user = await prisma.clearingOfficer.findUnique({
      where: { email },
    });
    if (!user) {
      res.status(401).json({ error: "Wrong credentials" });
      return;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401).json({ error: "Wrong credentials" });
      return;
    }

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken(user.id);

    await prisma.clearingOfficer.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        schoolId: user.schoolId,
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

// ---- Refresh with rotation
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const oldToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!oldToken) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!);
    } catch (err) {
      const status = tokenErrStatus(err);
      res.status(status).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const user = await prisma.clearingOfficer.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.refreshToken !== oldToken) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    const newAccess = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefresh = signRefreshToken(user.id);

    await prisma.clearingOfficer.update({
      where: { id: user.id },
      data: { refreshToken: newRefresh },
    });
    res.cookie("refreshToken", newRefresh, cookieOptions);

    res.status(200).json({ accessToken: newAccess });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---- Logout (works even if access token expired)
export const logout = async (req: Request, res: Response) => {
  try {
    const oldToken = req.cookies?.refreshToken;

    if (oldToken) {
      try {
        const decoded: any = jwt.verify(
          oldToken,
          process.env.JWT_REFRESH_SECRET!
        );
        await prisma.clearingOfficer.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
      } catch {}
    }

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

// ----Example protected profile
export const getProfile = async (
  req: Request & { user?: { userId: string } },
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await prisma.clearingOfficer.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        schoolId: true,
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

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ----Clearing officer endpoints

// Update a clearing officer
export const updateClearingOfficer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schoolId, firstName, lastName, email, phoneNumber, role } =
      req.body;

    const clearingOfficer = await prisma.clearingOfficer.update({
      where: { id },
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        role,
      },
    });

    res.status(200).json({
      message: "Clearing officer updated successfully",
      clearingOfficer,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a clearing officer
export const deleteClearingOfficer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.clearingOfficer.delete({
      where: { id },
    });

    res.status(200).json({ message: "Clearing officer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clearing officer
export const getClearingOfficers = async (req: Request, res: Response) => {
  try {
    const clearingOfficers = await prisma.clearingOfficer.findMany();
    res.json(clearingOfficers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a clearing officer by ID
export const getClearingOfficerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clearingOfficer = await prisma.clearingOfficer.findUnique({
      where: { id },
    });

    if (!clearingOfficer) {
      res.status(404).json({ message: "Clearing officer not found" });
      return;
    }

    res.status(200).json({ clearingOfficer });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

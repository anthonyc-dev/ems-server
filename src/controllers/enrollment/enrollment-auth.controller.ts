import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface User {
  id: string;
  email: string;
  password: string;
  refreshToken?: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Find user by email
    const user = await prisma.admim.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "access",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // Store refresh token in database
    await prisma.admim.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
      return;
    }

    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

    if (decoded.type !== "refresh") {
      res.status(403).json({
        success: false,
        message: "Invalid token type",
      });
      return;
    }

    // Find user and verify refresh token matches database
    const user = await prisma.admim.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== token) {
      res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    // Generate new tokens (token rotation)
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "access",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // Update refresh token in database (token rotation)
    await prisma.admim.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    // Set new refresh token as httpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Verify token to get user ID
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_REFRESH_SECRET!
        ) as any;

        // Revoke refresh token in database
        await prisma.admim.update({
          where: { id: decoded.id },
          data: { refreshToken: null },
        });
      } catch (error) {
        // Token is invalid, but we still want to clear the cookie
        console.log("Invalid token during logout:", error);
      }
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

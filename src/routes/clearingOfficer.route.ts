import { Router } from "express";

import { validateLogin, validateRegister } from "../middlewares/auth.validator";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authentication";
import {
  getProfile,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/clearingOfficer.controller";

const router = Router();

// Register route
router.post("/register", validateRegister, register);

// Login route
router.post("/login", validateLogin, login);

// Profile route
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("admin", "student", "clearingOfficer"),
  getProfile
);

// Refresh token route
router.post("/refresh-token", refreshToken);

// Logout route
router.post("/logout", authenticateToken, logout);

export default router;

import { Router } from "express";

import { validateLogin, validateRegister } from "../middlewares/auth.validator";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authentication";
import {
  deleteClearingOfficer,
  getClearingOfficerById,
  getClearingOfficers,
  getProfile,
  login,
  logout,
  refreshToken,
  register,
  updateClearingOfficer,
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

//--------- Clearing officer routes
router.get("/clearing-officers", getClearingOfficers);
router.get(
  "/clearing-officer/:id",
  authenticateToken,
  authorizeRoles("admin"),
  getClearingOfficerById
);
router.put(
  "/clearing-officer/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateClearingOfficer
);
router.delete(
  "/clearing-officer/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteClearingOfficer
);

export default router;

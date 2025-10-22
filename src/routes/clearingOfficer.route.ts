import { Router } from "express";

import { validateLogin, validateRegister } from "../middlewares/auth.validator";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/authentication";
import {
  addClearingOfficer,
  deleteClearingOfficer,
  getClearingOfficerById,
  getClearingOfficers,
  getClearingOfficersInASCS,
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
router.post("/createCo", addClearingOfficer);
router.get("/getAllCo", getClearingOfficers);
router.get("/getCoById/:id", getClearingOfficerById);
router.put("/updateCo/:id", updateClearingOfficer);
router.delete("/deleteCo/:id", deleteClearingOfficer);

//---- clearing officer in ASCS----
router.get("/getAllCoInASCS", getClearingOfficersInASCS);

export default router;

//

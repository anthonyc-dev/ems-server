"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_validator_1 = require("../middlewares/auth.validator");
const authentication_1 = require("../middlewares/authentication");
const clearingOfficer_controller_1 = require("../controllers/clearingOfficer.controller");
const router = (0, express_1.Router)();
// Register route
router.post("/register", auth_validator_1.validateRegister, clearingOfficer_controller_1.register);
// Login route
router.post("/login", auth_validator_1.validateLogin, clearingOfficer_controller_1.login);
// Profile route
router.get("/profile", authentication_1.authenticateToken, (0, authentication_1.authorizeRoles)("admin", "student", "clearingOfficer"), clearingOfficer_controller_1.getProfile);
// Refresh token route
router.post("/refresh-token", clearingOfficer_controller_1.refreshToken);
// Logout route
router.post("/logout", authentication_1.authenticateToken, clearingOfficer_controller_1.logout);
exports.default = router;

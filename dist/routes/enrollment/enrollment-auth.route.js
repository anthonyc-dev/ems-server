"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollment_auth_controller_1 = require("../../controllers/enrollment/enrollment-auth.controller");
const router = (0, express_1.Router)();
router.post("/login", enrollment_auth_controller_1.login);
router.post("/refresh", enrollment_auth_controller_1.refresh);
router.post("/logout", enrollment_auth_controller_1.logout);
exports.default = router;

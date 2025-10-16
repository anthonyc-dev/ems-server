"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId, firstName, lastName, email, phoneNumber, password, role, } = req.body;
        // Check if user already exists
        const existingUser = yield prisma.clearingOfficer.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: "User with this email already exists" });
            return;
        }
        // Hash password
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        // Create new user
        const newUser = yield prisma.clearingOfficer.create({
            data: {
                schoolId,
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword,
                role,
            },
        });
        // Generate JWT token with refresh token
        const accessToken = jsonwebtoken_1.default.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "15m" } // Shorter access token
        );
        const refreshToken = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" } // Longer refresh token
        );
        // res.cookie("refreshToken", token, {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: "Strict",
        //   path: "/",
        // });
        // res.json({ accessToken, user });
        // Store refresh token in database (you might want to add a refreshToken field to your Auth model)
        yield prisma.clearingOfficer.update({
            where: { id: newUser.id },
            data: { refreshToken },
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                schoolId: newUser.schoolId,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield prisma.clearingOfficer.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "Invalid email or password" });
            return;
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        // Generate JWT tokens
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15s" } // Shorter access token
        );
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" } // Longer refresh token
        );
        // Store refresh token in database
        yield prisma.clearingOfficer.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                schoolId: user.schoolId,
                firstName: user.firstName,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.login = login;
// Refresh token endpoint
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: "Refresh token required" });
            return;
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // Find user and check if refresh token matches
        const user = yield prisma.clearingOfficer.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            res.status(403).json({ error: "Invalid refresh token" });
            return;
        }
        // Generate new access token
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15s" });
        res.status(200).json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(403).json({ error: "Invalid refresh token" });
    }
});
exports.refreshToken = refreshToken;
// Logout endpoint
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        // Clear refresh token from database
        yield prisma.clearingOfficer.update({
            where: { id: req.user.userId },
            data: { refreshToken: null },
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.logout = logout;
// Get current user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const user = yield prisma.clearingOfficer.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                schoolId: true,
                firstName: true,
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
                schoolId: user.schoolId,
                firstName: user.firstName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getProfile = getProfile;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users = [{ id: 1, email: "admin@admin.com", password: "12345" }];
const login = (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // set false in local dev
        sameSite: "strict",
        path: "/",
    });
    res.json({ accessToken });
};
exports.login = login;
const refresh = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        res.status(401).json({ message: "No refresh token" });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ message: "Invalid refresh token" });
            return;
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
        res.json({ accessToken: newAccessToken });
    });
};
exports.refresh = refresh;
const logout = (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful" });
};
exports.logout = logout;

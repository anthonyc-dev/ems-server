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
exports.revokePermit = exports.viewPermit = exports.generateQR = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrcode_1 = __importDefault(require("qrcode"));
const prisma = new client_1.PrismaClient();
const SECRET = process.env.JWT_SECRET || "super_secret";
const FRONTEND_URL = process.env.FRONT_END_URL;
// Officer signs permit & generate QR
const generateQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }
        // Ensure user exists
        const user = yield prisma.clearingOfficer.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Create permit
        const permit = yield prisma.permit.create({
            data: {
                userId: userId,
                permitCode: `PERMIT-${Date.now()}`,
                status: "active",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ permitId: permit.id, userId: permit.userId }, SECRET, { expiresIn: "30d" });
        // // Generate QR image from token
        // const qrImage = await QRCode.toDataURL(token);
        // 👇 Instead of encoding token, we encode a frontend URL with token query param
        const qrUrl = `${FRONTEND_URL}/viewPermit/?token=${token}`;
        // Generate QR image for that URL
        const qrImage = yield qrcode_1.default.toDataURL(qrUrl);
        res.json({
            message: "Permit signed & QR generated",
            permit,
            qrImage,
            token,
        });
    }
    catch (error) {
        console.error("Error generating QR:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.generateQR = generateQR;
// Staff scans QR to verify permit
const viewPermit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        const permit = yield prisma.permit.findUnique({
            where: { id: decoded.permitId },
            include: { user: true }, // include student info
        });
        if (!permit) {
            res.status(404).json({ error: "Permit not found" });
            return;
        }
        if (permit.status !== "active") {
            res.status(403).json({ error: "Permit not valid" });
            return;
        }
        if (new Date() > permit.expiresAt) {
            res.status(403).json({ error: "Permit expired" });
            return;
        }
        res.json({
            message: "✅ Permit valid, student eligible for exam",
            user: permit.user,
            permit,
        });
    }
    catch (err) {
        console.error("Error verifying permit:", err);
        res.status(401).json({ error: "Invalid or expired QR" });
    }
});
exports.viewPermit = viewPermit;
// Officer revokes permit early
const revokePermit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { permitId } = req.params;
        const permit = yield prisma.permit.findUnique({
            where: { id: permitId },
        });
        if (!permit) {
            res.status(404).json({ error: "Permit not found" });
            return;
        }
        yield prisma.permit.update({
            where: { id: permitId },
            data: { status: "revoked" },
        });
        res.json({ message: "Permit revoked successfully" });
    }
    catch (err) {
        console.error("Error revoking permit:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.revokePermit = revokePermit;

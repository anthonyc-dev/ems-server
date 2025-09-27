import { Request, Response } from "express";
import {
  PrismaClient,
  Permit,
  AuthenticatedUser,
} from "../../generated/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import QRCode from "qrcode";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "super_secret";

// Shape of JWT payload
interface PermitTokenPayload extends JwtPayload {
  permitId: string;
  userId: string;
}

// Officer signs permit & generate QR
export const generateQR = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Ensure user exists
    const user = await prisma.authenticatedUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Create permit
    const permit: Permit = await prisma.permit.create({
      data: {
        userId: userId,
        permitCode: `PERMIT-${Date.now()}`,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { permitId: permit.id, userId: permit.userId },
      SECRET,
      { expiresIn: "30d" }
    );

    // Generate QR image from token
    const qrImage = await QRCode.toDataURL(token);

    res.json({
      message: "Permit signed & QR generated",
      permit,
      qrImage,
      token,
    });
  } catch (error) {
    console.error("Error generating QR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Staff scans QR to verify permit
export const viewPermit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body as { token: string };

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const decoded = jwt.verify(token, SECRET) as PermitTokenPayload;

    const permit = await prisma.permit.findUnique({
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
  } catch (err) {
    console.error("Error verifying permit:", err);
    res.status(401).json({ error: "Invalid or expired QR" });
  }
};

// Officer revokes permit early
export const revokePermit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { permitId } = req.params;

    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
    });

    if (!permit) {
      res.status(404).json({ error: "Permit not found" });
      return;
    }

    await prisma.permit.update({
      where: { id: permitId },
      data: { status: "revoked" },
    });

    res.json({ message: "Permit revoked successfully" });
  } catch (err) {
    console.error("Error revoking permit:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

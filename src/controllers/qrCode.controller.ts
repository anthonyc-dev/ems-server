import { Request, Response } from "express";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

// Generate QR (valid for 30 days, tied to DB permit)
export const generateQR = async (req: Request, res: Response) => {
  const { permitId } = req.params as { permitId: string };
  const permit = await prisma.permit.findUnique({
    where: { id: permitId },
  });

  if (!permit) {
    res.status(404).json({ error: "Permit not found" });
    return;
  }

  const token = jwt.sign(
    { permitId: permit.id, userId: permit.userId },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );

  const qrImage = await QRCode.toDataURL(token);
  res.json({ qrImage, token });
};

// Scan QR -> Verify permit
export const viewPermit = async (req: Request, res: Response) => {
  const { token, userId } = req.body as { token: string; userId: string };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Match user
    if (decoded.userId !== userId) {
      res.status(403).json({ error: "Access denied: wrong user" });
      return;
    }

    const permit = await prisma.permit.findUnique({
      where: { id: decoded.permitId },
    });

    if (!permit) {
      res.status(404).json({ error: "Permit not found" });
      return;
    }

    // Check DB validity
    if (permit.status !== "active") {
      res.status(403).json({ error: "Permit revoked" });
      return;
    }

    const now = new Date();
    if (permit.expiresAt < now) {
      res.status(403).json({ error: "Permit expired" });
      return;
    }

    res.json({ doc: permit });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired QR" });
  }
};

// Example: revoke permit early
export const revokePermit = async (req: Request, res: Response) => {
  const { permitId } = req.params as { permitId: string };

  const permit = await prisma.permit.findUnique({
    where: { id: permitId },
  });

  if (permit) {
    await prisma.permit.update({
      where: { id: permitId },
      data: { status: "revoked" },
    });

    res.json({ message: "Permit revoked" });
    return;
  }
  res.status(404).json({ error: "Permit not found" });
};

export default {
  generateQR,
  viewPermit,
  revokePermit,
};

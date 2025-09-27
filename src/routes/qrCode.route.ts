import { Router } from "express";

import qrCodeRoutes from "../controllers/qrCode.controller";

const router = Router();

// QR Code routes
router.get("/generate-qr/:permitId", qrCodeRoutes.generateQR);
router.post("/view-permit", qrCodeRoutes.viewPermit);
router.post("/revoke/:permitId", qrCodeRoutes.revokePermit);

export default router;

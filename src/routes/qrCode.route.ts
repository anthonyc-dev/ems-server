import { Router } from "express";

import {
  generateQR,
  viewPermit,
  revokePermit,
} from "../controllers/qrCode.controller";

const router = Router();

// QR Code routes
router.post("/generate-qr/:userId", generateQR);
router.post("/view-permit", viewPermit);
router.post("/revoke-permit/:permitId", revokePermit);

export default router;

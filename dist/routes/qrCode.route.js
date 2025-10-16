"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrCode_controller_1 = require("../controllers/qrCode.controller");
const router = (0, express_1.Router)();
// QR Code routes
router.post("/generate-qr/:userId", qrCode_controller_1.generateQR);
router.post("/view-permit", qrCode_controller_1.viewPermit);
router.post("/revoke-permit/:permitId", qrCode_controller_1.revokePermit);
exports.default = router;

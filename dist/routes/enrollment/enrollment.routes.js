"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollment_controller_1 = require("../../controllers/enrollment/enrollment.controller");
const router = express_1.default.Router();
router.post("/createEnrollment", enrollment_controller_1.createStudentEnrollment);
router.get("/getAllEnrollments", enrollment_controller_1.getAllEnrollments);
router.get("/getEnrollmentById/:id", enrollment_controller_1.getEnrollmentById);
router.put("/updateEnrollment/:id", enrollment_controller_1.updateEnrollment);
router.delete("/deleteEnrollment/:id", enrollment_controller_1.deleteEnrollment);
exports.default = router;

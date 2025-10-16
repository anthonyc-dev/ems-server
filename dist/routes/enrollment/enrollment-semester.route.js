"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollment_semester_controller_1 = require("../../controllers/enrollment/enrollment-semester.controller");
const router = express_1.default.Router();
// Routes
router.post("/createSemester", enrollment_semester_controller_1.createSemester);
router.get("/getAllSemesters", enrollment_semester_controller_1.getAllSemesters);
router.get("/getSemesterById/:id", enrollment_semester_controller_1.getSemesterById);
router.put("/updateSemester/:id", enrollment_semester_controller_1.updateSemester);
router.delete("/deleteSemester/:id", enrollment_semester_controller_1.deleteSemester);
exports.default = router;

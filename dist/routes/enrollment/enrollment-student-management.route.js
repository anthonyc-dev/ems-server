"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollment_student_management_controller_1 = require("../../controllers/enrollment/enrollment-student-management.controller");
const router = express_1.default.Router();
router.post("/createStudent", enrollment_student_management_controller_1.createStudent);
router.get("/getAllStudents", enrollment_student_management_controller_1.getAllStudents);
router.get("/getStudentById/:id", enrollment_student_management_controller_1.getStudentById);
router.put("/updateStudent/:id", enrollment_student_management_controller_1.updateStudent);
router.delete("/deleteStudent/:id", enrollment_student_management_controller_1.deleteStudent);
exports.default = router;

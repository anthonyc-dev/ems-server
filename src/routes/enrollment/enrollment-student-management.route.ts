import express from "express";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from "../../controllers/enrollment/enrollment-student-management.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = express.Router();

router.post("/createStudent", authenticateToken, createStudent);
router.get("/getAllStudents", authenticateToken, getAllStudents);
router.get("/getStudentById/:id", authenticateToken, getStudentById);
router.put("/updateStudent/:id", authenticateToken, updateStudent);
router.delete("/deleteStudent/:id", authenticateToken, deleteStudent);

export default router;

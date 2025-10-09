import { Router } from "express";
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller";

const router = Router();

router.post("/createStudent", createStudent);
router.get("getAllStudent/", getStudents);
router.get("getByIdStudent/:id", getStudentById);
router.put("updateStudent/:id", updateStudent);
router.delete("deleteStudent/:id", deleteStudent);

export default router;

import { Router } from "express";
import {
  deleteStudent,
  getStudentById,
  getStudents,
  loginStudent,
  registerStudent,
  updateStudent,
} from "../controllers/student.controller";

const router = Router();

router.post("/registerStudent", registerStudent);
router.post("/loginStudent", loginStudent);
router.get("/getAllStudent", getStudents);
router.get("/getByIdStudent/:id", getStudentById);
router.put("/updateStudent/:id", updateStudent);
router.delete("/deleteStudent/:id", deleteStudent);

export default router;

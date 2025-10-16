import express from "express";
import {
  createStudent,
  deleteStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
} from "../../controllers/enrollment/enrollment-student-management.controller";

const router = express.Router();

router.post("/createStudent", createStudent);
router.get("/getAllStudents", getAllStudents);
router.get("/getStudentById/:id", getStudentById);
router.put("/updateStudent/:id", updateStudent);
router.delete("/deleteStudent/:id", deleteStudent);

export default router;

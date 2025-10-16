import express from "express";
import {
  createSemester,
  deleteSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
} from "../../controllers/enrollment/enrollment-semester.controller";

const router = express.Router();

// Routes
router.post("/createSemester", createSemester);
router.get("/getAllSemesters", getAllSemesters);
router.get("/getSemesterById/:id", getSemesterById);
router.put("/updateSemester/:id", updateSemester);
router.delete("/deleteSemester/:id", deleteSemester);

export default router;

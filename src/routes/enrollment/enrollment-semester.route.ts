import express from "express";
import {
  createSemester,
  deleteSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
} from "../../controllers/enrollment/enrollment-semester.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = express.Router();

// Routes
router.post("/createSemester", authenticateToken, createSemester);
router.get("/getAllSemesters", authenticateToken, getAllSemesters);
router.get("/getSemesterById/:id", authenticateToken, getSemesterById);
router.put("/updateSemester/:id", authenticateToken, updateSemester);
router.delete("/deleteSemester/:id", authenticateToken, deleteSemester);

export default router;

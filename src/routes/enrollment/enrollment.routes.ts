import express from "express";
import {
  createStudentEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from "../../controllers/enrollment/enrollment.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = express.Router();

router.post("/createEnrollment", authenticateToken, createStudentEnrollment);
router.get("/getAllEnrollments", authenticateToken, getAllEnrollments);
router.get("/getEnrollmentById/:id", authenticateToken, getEnrollmentById);
router.put("/updateEnrollment/:id", authenticateToken, updateEnrollment);
router.delete("/deleteEnrollment/:id", authenticateToken, deleteEnrollment);

export default router;

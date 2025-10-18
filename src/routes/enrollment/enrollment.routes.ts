import express from "express";
import {
  createStudentEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from "../../controllers/enrollment/enrollment.controller";

const router = express.Router();

router.post("/createEnrollment", createStudentEnrollment);
router.get("/getAllEnrollments", getAllEnrollments);
router.get("/getEnrollmentById/:id", getEnrollmentById);
router.put("/updateEnrollment/:id", updateEnrollment);
router.delete("/deleteEnrollment/:id", deleteEnrollment);

export default router;

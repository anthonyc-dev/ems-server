import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../controllers/enrollment/enrollment-addCourse.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = Router();

router.post("/createCourse", authenticateToken, createCourse);
router.get("/getAllCourses", authenticateToken, getAllCourses);
router.get("/getCourseById/:id", authenticateToken, getCourseById);
router.put("/updateCourse/:id", authenticateToken, updateCourse);
router.delete("/deleteCourse/:id", authenticateToken, deleteCourse);

export default router;

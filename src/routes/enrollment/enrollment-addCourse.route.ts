import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../../controllers/enrollment/enrollment-addCourse.controller";

const router = Router();

router.post("/createCourse", createCourse);
router.get("/getAllCourses", getAllCourses);
router.get("/getCourseById/:id", getCourseById);
router.put("/updateCourse/:id", updateCourse);
router.delete("/deleteCourse/:id", deleteCourse);

export default router;

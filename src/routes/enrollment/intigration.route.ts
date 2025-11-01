import express from "express";
import {
  getAllStudentBySchoolId,
  getAllstudentSpecificSubject,
  getClearingOfficerBySchoolId,
  getCoursesBySchoolId,
} from "../../controllers/enrollment/intigration.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = express.Router();

//-------intigration api
router.get(
  "/getCoBySchoolId/:schoolId",
  authenticateToken,
  getClearingOfficerBySchoolId
);
router.get(
  "/getCoursesBySchoolId/:schoolId",

  getCoursesBySchoolId
);

router.get(
  "/getAllstudentSpecificSubject/:courseCode",

  getAllstudentSpecificSubject
);

router.get("/getAllStudentBySchoolId/:schoolId", getAllStudentBySchoolId);

export default router;

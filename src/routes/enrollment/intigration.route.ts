import express from "express";
import {
  getAllEnrollmentStudents,
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

router.get("/getAllStudentComparedByIds", getAllEnrollmentStudents);

export default router;

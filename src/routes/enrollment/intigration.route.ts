import express from "express";
import {
  getAllEnrollmentStudents,
  getAllStudentBySchoolId,
  getAllstudentSpecificSubject,
  getClearingOfficerBySchoolId,
  getCoursesBySchoolId,
  getStudentBySchoolId,
} from "../../controllers/enrollment/intigration.controller";

const router = express.Router();

//-------intigration api
router.get("/getCoBySchoolId/:schoolId", getClearingOfficerBySchoolId);
router.get("/getCoursesBySchoolId/:schoolId", getCoursesBySchoolId);

router.get(
  "/getAllstudentSpecificSubject/:courseCode",
  getAllstudentSpecificSubject
);

router.get("/getAllStudentBySchoolId/:schoolId", getAllStudentBySchoolId);

router.get("/getAllStudentComparedByIds", getAllEnrollmentStudents);

//student route
router.get("/getStudentBySchoolId/:schoolId", getStudentBySchoolId);

export default router;

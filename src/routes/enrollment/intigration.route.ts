import express from "express";
import {
  getAllEnrollmentStudents,
  getAllStudentBySchoolId,
  getAllStudentsByDepartment,
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

//dean
router.get(
  "/getAllStudentsByDepartment/:department",
  getAllStudentsByDepartment
);

export default router;

import express from "express";
import {
  getAllEnrollmentStudents,
  getAllStudentBySchoolId,
  getAllstudentSpecificSubject,
  getClearingOfficerBySchoolId,
  getCoursesBySchoolId,
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

export default router;

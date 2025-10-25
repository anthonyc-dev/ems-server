import express from "express";
import {
  getClearingOfficerBySchoolId,
  getCoursesBySchoolId,
} from "../../controllers/enrollment/intigration.controller";

const router = express.Router();

//-------intigration api
router.get("/getCoBySchoolId/:schoolId", getClearingOfficerBySchoolId);
router.get("/getCoursesBySchoolId/:schoolId", getCoursesBySchoolId);

export default router;

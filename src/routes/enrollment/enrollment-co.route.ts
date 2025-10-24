import { Router } from "express";
import {
  addClearingOfficer,
  deleteClearingOfficer,
  getClearingOfficerById,
  getClearingOfficerBySchoolId,
  getClearingOfficers,
  updateClearingOfficer,
} from "../../controllers/enrollment/enrollment-co.controller";

const router = Router();

//--------- Clearing officer routes
router.post("/createCo", addClearingOfficer);
router.get("/getAllCo", getClearingOfficers);
router.get("/getCoById/:id", getClearingOfficerById);
router.put("/updateCo/:id", updateClearingOfficer);
router.delete("/deleteCo/:id", deleteClearingOfficer);

//-------intigration api
router.get("/getCoBySchoolId/:schoolId", getClearingOfficerBySchoolId);

export default router;

import { Router } from "express";
import {
  addClearingOfficer,
  deleteClearingOfficer,
  getClearingOfficerById,
  getClearingOfficerBySchoolId,
  getClearingOfficers,
  updateClearingOfficer,
} from "../../controllers/enrollment/enrollment-co.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = Router();

//--------- Clearing officer routes
router.post("/createCo", authenticateToken, addClearingOfficer);
router.get("/getAllCo", authenticateToken, getClearingOfficers);
router.get("/getCoById/:id", authenticateToken, getClearingOfficerById);
router.put("/updateCo/:id", authenticateToken, updateClearingOfficer);
router.delete("/deleteCo/:id", authenticateToken, deleteClearingOfficer);

//-------intigration api
router.get("/getCoBySchoolId/:schoolId", getClearingOfficerBySchoolId);

export default router;

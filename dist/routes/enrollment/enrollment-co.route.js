"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enrollment_co_controller_1 = require("../../controllers/enrollment/enrollment-co.controller");
const router = (0, express_1.Router)();
//--------- Clearing officer routes
router.post("/createCo", enrollment_co_controller_1.addClearingOfficer);
router.get("/getAllCo", enrollment_co_controller_1.getClearingOfficers);
router.get("/getCoById/:id", enrollment_co_controller_1.getClearingOfficerById);
router.put("/updateCo/:id", enrollment_co_controller_1.updateClearingOfficer);
router.delete("/deleteCo/:id", enrollment_co_controller_1.deleteClearingOfficer);
exports.default = router;

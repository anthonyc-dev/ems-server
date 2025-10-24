import express from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../../controllers/enrollment/enrollment-addSection.controller";

const router = express.Router();

router.post("/createSection", createSection);
router.get("/getAllSections", getAllSections);
router.get("/getSectionById/:id", getSectionById);
router.put("/updateSection/:id", updateSection);
router.delete("/deleteSection/:id", deleteSection);

export default router;

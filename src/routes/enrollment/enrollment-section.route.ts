import express from "express";
import {
  createSection,
  deleteSection,
  getAllSections,
  getSectionById,
  updateSection,
} from "../../controllers/enrollment/enrollment-addSection.controller";
import { authenticateToken } from "../../middlewares/authentication";

const router = express.Router();

router.post("/createSection", authenticateToken, createSection);
router.get("/getAllSections", authenticateToken, getAllSections);
router.get("/getSectionById/:id", authenticateToken, getSectionById);
router.put("/updateSection/:id", authenticateToken, updateSection);
router.delete("/deleteSection/:id", authenticateToken, deleteSection);

export default router;

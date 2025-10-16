"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollment_addSection_controller_1 = require("../../controllers/enrollment/enrollment-addSection.controller");
const router = express_1.default.Router();
router.post("/createSection", enrollment_addSection_controller_1.createSection);
router.get("/getAllSections", enrollment_addSection_controller_1.getAllSections);
router.get("/getSectionById/:id", enrollment_addSection_controller_1.getSectionById);
router.put("/updateSection/:id", enrollment_addSection_controller_1.updateSection);
router.delete("/deleteSection/:id", enrollment_addSection_controller_1.deleteSection);
exports.default = router;

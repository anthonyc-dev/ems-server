"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSemester = exports.updateSemester = exports.getSemesterById = exports.getAllSemesters = exports.createSemester = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ CREATE a new Semester
const createSemester = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semesterName, academicYear, semesterType, semesterDuration, enrollmentPeriod, status, } = req.body;
        // Basic validation
        if (!semesterName ||
            !academicYear ||
            !semesterType ||
            !semesterDuration ||
            !enrollmentPeriod) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        const newSemester = yield prisma.semesterManagement.create({
            data: {
                semesterName,
                academicYear,
                semesterType,
                semesterDuration,
                enrollmentPeriod,
                status,
            },
        });
        res.status(201).json(newSemester);
    }
    catch (error) {
        console.error("Error creating semester:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});
exports.createSemester = createSemester;
// ✅ GET all Semesters
const getAllSemesters = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const semesters = yield prisma.semesterManagement.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(semesters);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch semesters.", error: error.message });
    }
});
exports.getAllSemesters = getAllSemesters;
// ✅ GET Semester by ID
const getSemesterById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const semester = yield prisma.semesterManagement.findUnique({
            where: { id },
        });
        if (!semester) {
            res.status(404).json({ message: "Semester not found." });
            return;
        }
        res.status(200).json(semester);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch semester.", error: error.message });
        return;
    }
});
exports.getSemesterById = getSemesterById;
// ✅ UPDATE Semester
const updateSemester = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedSemester = yield prisma.semesterManagement.update({
            where: { id },
            data,
        });
        res.status(200).json(updatedSemester);
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Semester not found." });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to update semester.", error: error.message });
        }
    }
});
exports.updateSemester = updateSemester;
// ✅ DELETE Semester
const deleteSemester = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.semesterManagement.delete({
            where: { id },
        });
        res.status(200).json({ message: "Semester deleted successfully." });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Semester not found." });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to delete semester.", error: error.message });
        }
    }
});
exports.deleteSemester = deleteSemester;

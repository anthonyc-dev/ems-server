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
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getAllStudents = exports.createStudent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ CREATE Student
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId, firstName, lastName, middleName, email, phone, dateOfBirth, gender, address, yearLevel, department, program, status, } = req.body;
        // Basic validation
        if (!schoolId || !firstName || !lastName || !yearLevel) {
            res.status(400).json({ message: "Missing required fields." });
            return;
        }
        const newStudent = yield prisma.studentManagement.create({
            data: {
                schoolId,
                firstName,
                lastName,
                middleName,
                email,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender: gender || "UNSPECIFIED",
                address,
                yearLevel,
                department,
                program,
                status,
            },
        });
        res.status(201).json(newStudent);
    }
    catch (error) {
        console.error("Error creating student:", error);
        if (error.code === "P2002") {
            res.status(409).json({ message: "Duplicate school id or email." });
        }
        else {
            res.status(500).json({ message: "Server error.", error: error.message });
        }
    }
});
exports.createStudent = createStudent;
// ✅ GET All Students
const getAllStudents = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.studentManagement.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(students);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch students.", error: error.message });
    }
});
exports.getAllStudents = getAllStudents;
// ✅ GET Student by ID
const getStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const student = yield prisma.studentManagement.findUnique({
            where: { id },
        });
        if (!student) {
            res.status(404).json({ message: "Student not found." });
            return;
        }
        res.status(200).json(student);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch student.",
            error: error.message,
        });
    }
});
exports.getStudentById = getStudentById;
// ✅ UPDATE Student
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = req.body;
        // Convert dateOfBirth string to Date object if present
        if (data.dateOfBirth) {
            data.dateOfBirth = new Date(data.dateOfBirth);
        }
        const updatedStudent = yield prisma.studentManagement.update({
            where: { id },
            data,
        });
        res.status(200).json(updatedStudent);
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Student not found." });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to update student.", error: error.message });
        }
    }
});
exports.updateStudent = updateStudent;
// ✅ DELETE Student
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.studentManagement.delete({ where: { id } });
        res.status(200).json({ message: "Student deleted successfully." });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Student not found." });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to delete student.", error: error.message });
        }
    }
});
exports.deleteStudent = deleteStudent;

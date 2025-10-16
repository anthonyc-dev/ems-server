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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.loginStudent = exports.registerStudent = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const token_1 = require("../libs/token");
const prisma = new client_1.PrismaClient();
// Create a new student
const registerStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId, firstName, lastName, email, phoneNumber, program, yearLevel, password, } = req.body;
        // Hash the password before storing
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const student = yield prisma.student.create({
            data: {
                schoolId,
                firstName,
                lastName,
                email,
                phoneNumber,
                program,
                yearLevel,
                password: hashedPassword,
            },
        });
        const accessToken = (0, token_1.signAccessToken)({
            id: student.id,
            email: student.email,
        });
        const refreshToken = (0, token_1.signRefreshToken)(student.id);
        yield prisma.student.update({
            where: { id: student.id },
            data: { refreshToken },
        });
        res.cookie("refreshToken", refreshToken, token_1.cookieOptions);
        res.status(201).json({
            message: "Student registered successfully",
            student: {
                id: student.id,
                schoolId: student.schoolId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phoneNumber: student.phoneNumber,
                program: student.program,
                yearLevel: student.yearLevel,
            },
            accessToken,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.registerStudent = registerStudent;
const loginStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const student = yield prisma.student.findUnique({
            where: { email },
        });
        if (!student) {
            res.status(401).json({ error: "Wrong credentials" });
            return;
        }
        const ok = yield bcrypt_1.default.compare(password, student.password);
        if (!ok) {
            res.status(401).json({ error: "Wrong credentials" });
            return;
        }
        const accessToken = (0, token_1.signAccessToken)({
            id: student.id,
            email: student.email,
        });
        const refreshToken = (0, token_1.signRefreshToken)(student.id);
        yield prisma.student.update({
            where: { id: student.id },
            data: { refreshToken },
        });
        res.cookie("refreshToken", refreshToken, token_1.cookieOptions);
        res.status(200).json({
            message: "Login successful",
            student: {
                id: student.id,
                schoolId: student.schoolId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phoneNumber: student.phoneNumber,
                program: student.program,
                yearLevel: student.yearLevel,
            },
            accessToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginStudent = loginStudent;
// Get all students
const getStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany();
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStudents = getStudents;
// Get a student by ID
const getStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const student = yield prisma.student.findUnique({
            where: { id },
        });
        if (!student) {
            res.status(404).json({ message: "Student not found" });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStudentById = getStudentById;
// Update a student
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phoneNumber, program, yearLevel } = req.body;
        const updatedStudent = yield prisma.student.update({
            where: { id },
            data: { firstName, lastName, email, phoneNumber, program, yearLevel },
        });
        res.json(updatedStudent);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateStudent = updateStudent;
// Delete a student
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.student.delete({ where: { id } });
        res.json({ message: "Student deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteStudent = deleteStudent;

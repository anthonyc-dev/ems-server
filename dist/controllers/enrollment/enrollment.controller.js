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
exports.deleteEnrollment = exports.getEnrollmentsByStatus = exports.getEnrollmentBySchoolId = exports.getEnrollmentsByDepartment = exports.searchEnrollments = exports.getEnrollmentByCourseCode = exports.updateEnrollment = exports.getEnrollmentById = exports.getAllEnrollments = exports.createStudentEnrollment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create Student Enrollment
 * Creates a new student enrollment record in the database.
 */
const createStudentEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId, firstName, lastName, middleName, courseCode, courseName, description, units, department, prerequisites, maxCapacity, day, timeStart, timeEnd, room, instructor, semester, yearLevel, status, } = req.body;
        // Validate required fields
        if (!schoolId || !firstName || !lastName || !courseCode || !courseName || !units || !department) {
            res.status(400).json({
                message: "Missing required fields: schoolId, firstName, lastName, courseCode, courseName, units, and department are required",
            });
            return;
        }
        const enrollment = yield prisma.studentEnrollment.create({
            data: {
                schoolId,
                firstName,
                lastName,
                middleName,
                courseCode,
                courseName,
                description,
                units: Number(units),
                department,
                prerequisites: prerequisites || [],
                maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
                day,
                timeStart,
                timeEnd,
                room,
                instructor,
                semester,
                yearLevel,
                status,
            },
        });
        res
            .status(201)
            .json({ message: "Enrollment created successfully", enrollment });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            res.status(409).json({
                message: "Course code already exists",
                error: "Duplicate courseCode",
            });
        }
        else {
            res
                .status(500)
                .json({ message: "Failed to create enrollment", error: error.message });
        }
    }
});
exports.createStudentEnrollment = createStudentEnrollment;
/**
 * Get All Enrollments
 * Fetches all student enrollments ordered by creation date (descending).
 */
const getAllEnrollments = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrollments = yield prisma.studentEnrollment.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching enrollments", error: error.message });
    }
});
exports.getAllEnrollments = getAllEnrollments;
/**
 * Get Enrollment by ID
 * Retrieves a student enrollment by its unique identifier.
 */
const getEnrollmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const enrollment = yield prisma.studentEnrollment.findUnique({
            where: { id },
        });
        if (!enrollment) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
        }
        res.status(200).json(enrollment);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching enrollment", error: error.message });
    }
});
exports.getEnrollmentById = getEnrollmentById;
/**
 * Update Enrollment
 * Updates an existing student enrollment based on provided fields.
 */
const updateEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { schoolId, firstName, lastName, middleName, courseCode, courseName, description, units, department, prerequisites, maxCapacity, day, timeStart, timeEnd, room, instructor, semester, yearLevel, status, } = req.body;
        // Build update data object with only valid fields
        const updateData = {};
        if (schoolId !== undefined)
            updateData.schoolId = schoolId;
        if (firstName !== undefined)
            updateData.firstName = firstName;
        if (lastName !== undefined)
            updateData.lastName = lastName;
        if (middleName !== undefined)
            updateData.middleName = middleName;
        if (courseCode !== undefined)
            updateData.courseCode = courseCode;
        if (courseName !== undefined)
            updateData.courseName = courseName;
        if (description !== undefined)
            updateData.description = description;
        if (units !== undefined)
            updateData.units = Number(units);
        if (department !== undefined)
            updateData.department = department;
        if (prerequisites !== undefined)
            updateData.prerequisites = prerequisites;
        if (maxCapacity !== undefined)
            updateData.maxCapacity = maxCapacity ? Number(maxCapacity) : null;
        if (day !== undefined)
            updateData.day = day;
        if (timeStart !== undefined)
            updateData.timeStart = timeStart;
        if (timeEnd !== undefined)
            updateData.timeEnd = timeEnd;
        if (room !== undefined)
            updateData.room = room;
        if (instructor !== undefined)
            updateData.instructor = instructor;
        if (semester !== undefined)
            updateData.semester = semester;
        if (yearLevel !== undefined)
            updateData.yearLevel = yearLevel;
        if (status !== undefined)
            updateData.status = status;
        // Check if enrollment exists before updating
        const existingEnrollment = yield prisma.studentEnrollment.findUnique({
            where: { id },
        });
        if (!existingEnrollment) {
            res.status(404).json({ message: "Enrollment not found" });
            return;
        }
        const updatedEnrollment = yield prisma.studentEnrollment.update({
            where: { id },
            data: updateData,
        });
        res.status(200).json({
            message: "Enrollment updated successfully",
            enrollment: updatedEnrollment,
        });
    }
    catch (error) {
        console.error("Error updating enrollment:", error);
        if (error.code === "P2025") {
            // Prisma: record not found
            res.status(404).json({ message: "Enrollment not found" });
        }
        else if (error.code === "P2002") {
            res.status(409).json({
                message: "Course code already exists",
                error: "Duplicate courseCode",
            });
        }
        else {
            res.status(500).json({
                message: "Failed to update enrollment",
                error: error.message,
                details: error.toString(),
            });
        }
    }
});
exports.updateEnrollment = updateEnrollment;
/**
 * Get Enrollment by Course Code
 * Retrieves a student enrollment by its unique course code.
 */
const getEnrollmentByCourseCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseCode } = req.params;
        const enrollment = yield prisma.studentEnrollment.findUnique({
            where: { courseCode },
        });
        if (!enrollment) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.status(200).json(enrollment);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching course", error: error.message });
    }
});
exports.getEnrollmentByCourseCode = getEnrollmentByCourseCode;
/**
 * Search Enrollments
 * Search enrollments by student name, school ID, course name, course code, department, or instructor.
 */
const searchEnrollments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query, department, semester } = req.query;
        const whereClause = {};
        // Add search filters
        if (query) {
            whereClause.OR = [
                { firstName: { contains: query, mode: "insensitive" } },
                { lastName: { contains: query, mode: "insensitive" } },
                { schoolId: { contains: query, mode: "insensitive" } },
                { courseName: { contains: query, mode: "insensitive" } },
                { courseCode: { contains: query, mode: "insensitive" } },
                { instructor: { contains: query, mode: "insensitive" } },
            ];
        }
        if (department) {
            whereClause.department = department;
        }
        if (semester) {
            whereClause.semester = semester;
        }
        const enrollments = yield prisma.studentEnrollment.findMany({
            where: whereClause,
            orderBy: { courseName: "asc" },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error searching enrollments", error: error.message });
    }
});
exports.searchEnrollments = searchEnrollments;
/**
 * Get Enrollments by Department
 * Fetches all enrollments for a specific department.
 */
const getEnrollmentsByDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { department } = req.params;
        const enrollments = yield prisma.studentEnrollment.findMany({
            where: { department },
            orderBy: { courseName: "asc" },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching department enrollments",
            error: error.message,
        });
    }
});
exports.getEnrollmentsByDepartment = getEnrollmentsByDepartment;
/**
 * Get Enrollment by School ID
 * Retrieves a student enrollment by their unique school ID.
 */
const getEnrollmentBySchoolId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId } = req.params;
        const enrollment = yield prisma.studentEnrollment.findUnique({
            where: { schoolId },
        });
        if (!enrollment) {
            res.status(404).json({ message: "Student enrollment not found" });
            return;
        }
        res.status(200).json(enrollment);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching student enrollment", error: error.message });
    }
});
exports.getEnrollmentBySchoolId = getEnrollmentBySchoolId;
/**
 * Get Enrollments by Status
 * Fetches all enrollments with a specific status.
 */
const getEnrollmentsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.params;
        const enrollments = yield prisma.studentEnrollment.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(enrollments);
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching enrollments by status",
            error: error.message,
        });
    }
});
exports.getEnrollmentsByStatus = getEnrollmentsByStatus;
/**
 * Delete Enrollment
 * Deletes an enrollment by its unique identifier.
 */
const deleteEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const enrollment = yield prisma.studentEnrollment.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: "Enrollment deleted successfully", enrollment });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Enrollment not found" });
        }
        else {
            res
                .status(500)
                .json({ message: "Error deleting enrollment", error: error.message });
        }
    }
});
exports.deleteEnrollment = deleteEnrollment;

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
exports.getClearingOfficerById = exports.getClearingOfficers = exports.deleteClearingOfficer = exports.updateClearingOfficer = exports.addClearingOfficer = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//add clearing officer
const addClearingOfficer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schoolId, firstName, lastName, email, phoneNumber, position, department, } = req.body;
        // ✅ Validate required fields
        if (!schoolId || !firstName || !lastName || !email || !phoneNumber) {
            res.status(400).json({
                message: "Missing required fields. Please provide all necessary data.",
            });
            return;
        }
        // ✅ Check if the user already exists by email or schoolId
        const existingUser = yield prisma.clearingOfficerManagement.findFirst({
            where: {
                OR: [{ email }, { schoolId }],
            },
        });
        if (existingUser) {
            res.status(409).json({
                message: "A user with that email or schoolId already exists.",
            });
            return;
        }
        // // ✅ Handle password hashing (detect bcrypt hash pattern)
        // const bcryptHashPattern = /^\$2[aby]\$.{56}$/;
        // const hashedPassword = bcryptHashPattern.test(password)
        //   ? password
        //   : await bcrypt.hash(password, 10);
        // ✅ Create clearing officer
        const newOfficer = yield prisma.clearingOfficerManagement.create({
            data: {
                schoolId,
                firstName,
                lastName,
                email,
                phoneNumber,
                position: position || "N/A",
                department: department || "N/A",
            },
        });
        // ✅ Success response (exclude password)
        res.status(201).json({
            message: "Clearing officer created successfully.",
            data: {
                id: newOfficer.id,
                schoolId: newOfficer.schoolId,
                firstName: newOfficer.firstName,
                lastName: newOfficer.lastName,
                email: newOfficer.email,
                phoneNumber: newOfficer.phoneNumber,
                position: newOfficer.position,
                department: newOfficer.department,
                createdAt: newOfficer.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Error creating clearing officer:", error);
        res.status(500).json({
            message: "Internal server error.",
            error: error.message || error,
        });
    }
});
exports.addClearingOfficer = addClearingOfficer;
const updateClearingOfficer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { schoolId, firstName, lastName, email, phoneNumber, position, department, } = req.body;
        const clearingOfficer = yield prisma.clearingOfficerManagement.update({
            where: { id },
            data: {
                schoolId,
                firstName,
                lastName,
                email,
                phoneNumber,
                position,
                department,
            },
        });
        res.status(200).json({
            message: "Clearing officer updated successfully",
            clearingOfficer,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateClearingOfficer = updateClearingOfficer;
// Delete a clearing officer
const deleteClearingOfficer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.clearingOfficerManagement.delete({
            where: { id },
        });
        res.status(200).json({ message: "Clearing officer deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteClearingOfficer = deleteClearingOfficer;
// Get all clearing officer
const getClearingOfficers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clearingOfficers = yield prisma.clearingOfficerManagement.findMany();
        res.json(clearingOfficers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getClearingOfficers = getClearingOfficers;
// Get a clearing officer by ID
const getClearingOfficerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const clearingOfficer = yield prisma.clearingOfficerManagement.findUnique({
            where: { id },
        });
        if (!clearingOfficer) {
            res.status(404).json({ message: "Clearing officer not found" });
            return;
        }
        res.status(200).json({ clearingOfficer });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getClearingOfficerById = getClearingOfficerById;

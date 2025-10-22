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
exports.deleteSection = exports.updateSection = exports.getSectionById = exports.getAllSections = exports.createSection = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create a new section
 */
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sectionCode, sectionName, maxCapacity, day, timeStart, timeEnd, room, semester, instructor, department, courseId, } = req.body;
        // Validate required fields
        if (!sectionCode ||
            !sectionName ||
            !maxCapacity ||
            !day ||
            !timeStart ||
            !timeEnd ||
            !room) {
            res
                .status(400)
                .json({ message: "All required fields must be provided." });
            return;
        }
        // Check if section code already exists
        const existingSection = yield prisma.sectionManagement.findUnique({
            where: { sectionCode },
        });
        if (existingSection) {
            res.status(400).json({ message: "Section code already exists." });
            return;
        }
        const newSection = yield prisma.sectionManagement.create({
            data: {
                sectionCode,
                sectionName,
                maxCapacity: Number(maxCapacity),
                day,
                timeStart,
                timeEnd,
                room,
                semester,
                instructor,
                department,
                courseId,
            },
        });
        res.status(201).json({
            message: "Section created successfully",
            data: newSection,
        });
    }
    catch (error) {
        console.error("Error creating section:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createSection = createSection;
/**
 * Get all sections
 */
const getAllSections = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sections = yield prisma.sectionManagement.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json(sections);
    }
    catch (error) {
        console.error("Error fetching sections:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllSections = getAllSections;
/**
 * Get a section by ID
 */
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const section = yield prisma.sectionManagement.findUnique({
            where: { id },
        });
        if (!section) {
            res.status(404).json({ message: "Section not found" });
            return;
        }
        res.status(200).json(section);
    }
    catch (error) {
        console.error("Error fetching section:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getSectionById = getSectionById;
/**
 * Update a section
 */
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { sectionCode, sectionName, maxCapacity, day, timeStart, timeEnd, room, semester, instructor, } = req.body;
        const existing = yield prisma.sectionManagement.findUnique({
            where: { id },
        });
        if (!existing) {
            res.status(404).json({ message: "Section not found" });
            return;
        }
        const updatedSection = yield prisma.sectionManagement.update({
            where: { id },
            data: {
                sectionCode,
                sectionName,
                maxCapacity: maxCapacity ? Number(maxCapacity) : existing.maxCapacity,
                day,
                timeStart,
                timeEnd,
                room,
                semester,
                instructor,
            },
        });
        res.status(200).json({
            message: "Section updated successfully",
            data: updatedSection,
        });
    }
    catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateSection = updateSection;
/**
 * Delete a section
 */
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const section = yield prisma.sectionManagement.findUnique({
            where: { id },
        });
        if (!section) {
            res.status(404).json({ message: "Section not found" });
            return;
        }
        yield prisma.sectionManagement.delete({ where: { id } });
        res.status(200).json({ message: "Section deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting section:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteSection = deleteSection;

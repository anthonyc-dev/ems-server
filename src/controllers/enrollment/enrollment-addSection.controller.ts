import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new section
 */
export const createSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      sectionCode,
      sectionName,
      maxCapacity,
      day,
      timeStart,
      timeEnd,
      room,
    } = req.body;

    // Validate required fields
    if (
      !sectionCode ||
      !sectionName ||
      !maxCapacity ||
      !day ||
      !timeStart ||
      !timeEnd ||
      !room
    ) {
      res
        .status(400)
        .json({ message: "All required fields must be provided." });
      return;
    }

    // Check if section code already exists
    const existingSection = await prisma.sectionManagement.findUnique({
      where: { sectionCode },
    });
    if (existingSection) {
      res.status(400).json({ message: "Section code already exists." });
      return;
    }

    const newSection = await prisma.sectionManagement.create({
      data: {
        sectionCode,
        sectionName,
        maxCapacity: Number(maxCapacity),
        day,
        timeStart,
        timeEnd,
        room,
      },
    });

    res.status(201).json({
      message: "Section created successfully",
      data: newSection,
    });
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all sections
 */
export const getAllSections = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const sections = await prisma.sectionManagement.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a section by ID
 */
export const getSectionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const section = await prisma.sectionManagement.findUnique({
      where: { id },
    });

    if (!section) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    res.status(200).json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a section
 */
export const updateSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      sectionCode,
      sectionName,
      maxCapacity,
      day,
      timeStart,
      timeEnd,
      room,
    } = req.body;

    const existing = await prisma.sectionManagement.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    const updatedSection = await prisma.sectionManagement.update({
      where: { id },
      data: {
        sectionCode,
        sectionName,
        maxCapacity: maxCapacity ? Number(maxCapacity) : existing.maxCapacity,
        day,
        timeStart,
        timeEnd,
        room,
      },
    });

    res.status(200).json({
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a section
 */
export const deleteSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const section = await prisma.sectionManagement.findUnique({
      where: { id },
    });
    if (!section) {
      res.status(404).json({ message: "Section not found" });
      return;
    }

    await prisma.sectionManagement.delete({ where: { id } });

    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

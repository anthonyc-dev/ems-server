import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// ✅ CREATE a new Semester
export const createSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      semesterName,
      academicYear,
      semesterType,
      semesterDuration,
      enrollmentPeriod,
      status,
    } = req.body;

    // Basic validation
    if (
      !semesterName ||
      !academicYear ||
      !semesterType ||
      !semesterDuration ||
      !enrollmentPeriod
    ) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const newSemester = await prisma.semesterManagement.create({
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
  } catch (error: any) {
    console.error("Error creating semester:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ✅ GET all Semesters
export const getAllSemesters = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const semesters = await prisma.semesterManagement.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(semesters);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch semesters.", error: error.message });
  }
};

// ✅ GET Semester by ID
export const getSemesterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const semester = await prisma.semesterManagement.findUnique({
      where: { id },
    });

    if (!semester) {
      res.status(404).json({ message: "Semester not found." });
      return;
    }

    res.status(200).json(semester);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch semester.", error: error.message });
    return;
  }
};

// ✅ UPDATE Semester
export const updateSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedSemester = await prisma.semesterManagement.update({
      where: { id },
      data,
    });

    res.status(200).json(updatedSemester);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Semester not found." });
    } else {
      res
        .status(500)
        .json({ message: "Failed to update semester.", error: error.message });
    }
  }
};

// ✅ DELETE Semester
export const deleteSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.semesterManagement.delete({
      where: { id },
    });

    res.status(200).json({ message: "Semester deleted successfully." });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Semester not found." });
    } else {
      res
        .status(500)
        .json({ message: "Failed to delete semester.", error: error.message });
    }
  }
};

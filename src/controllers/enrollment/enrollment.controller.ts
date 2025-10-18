import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

/**
 * Create Student Enrollment
 * Creates a new student enrollment record in the database.
 */
export const createStudentEnrollment = async (req: Request, res: Response) => {
  try {
    const {
      name,
      studentNumber,
      department,
      yearLevel,
      semester,
      academicYear,
      selectedCourses,
      totalUnits,
    } = req.body;

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        name,
        studentNumber,
        department,
        yearLevel,
        semester,
        academicYear,
        selectedCourses,
        totalUnits,
      },
    });

    res
      .status(201)
      .json({ message: "Enrollment created successfully", enrollment });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create enrollment", error: error.message });
  }
};

/**
 * Get All Enrollments
 * Fetches all student enrollments ordered by creation date (descending).
 */
export const getAllEnrollments = async (_req: Request, res: Response) => {
  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(enrollments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
};

/**
 * Get Enrollment by ID
 * Retrieves a student enrollment by its unique identifier.
 */
export const getEnrollmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    res.status(200).json(enrollment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching enrollment", error: error.message });
  }
};

/**
 * Update Enrollment
 * Updates an existing student enrollment based on provided fields.
 */
export const updateEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Optionally sanitize/validate input here

    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id },
      data,
    });

    res
      .status(200)
      .json({
        message: "Enrollment updated successfully",
        enrollment: updatedEnrollment,
      });
  } catch (error: any) {
    if (error.code === "P2025") {
      // Prisma: record not found
      res.status(404).json({ message: "Enrollment not found" });
    } else {
      res
        .status(500)
        .json({ message: "Failed to update enrollment", error: error.message });
    }
  }
};

/**
 * Delete Enrollment
 * Deletes an enrollment by its unique identifier.
 */
export const deleteEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.studentEnrollment.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: "Enrollment deleted successfully", enrollment });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Enrollment not found" });
    } else {
      res
        .status(500)
        .json({ message: "Error deleting enrollment", error: error.message });
    }
  }
};

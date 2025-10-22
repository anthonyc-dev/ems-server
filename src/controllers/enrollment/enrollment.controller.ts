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
      schoolId,
      firstName,
      lastName,
      middleName,
      courseCode,
      courseName,
      description,
      units,
      department,
      prerequisites,
      maxCapacity,
      day,
      timeStart,
      timeEnd,
      room,
      instructor,
      semester,
      yearLevel,
      status,
    } = req.body;

    // Validate required fields
    if (!schoolId || !firstName || !lastName || !courseCode || !courseName || !units || !department) {
      res.status(400).json({
        message:
          "Missing required fields: schoolId, firstName, lastName, courseCode, courseName, units, and department are required",
      });
      return;
    }

    const enrollment = await prisma.studentEnrollment.create({
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
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      res.status(409).json({
        message: "Course code already exists",
        error: "Duplicate courseCode",
      });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create enrollment", error: error.message });
    }
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
    const {
      schoolId,
      firstName,
      lastName,
      middleName,
      courseCode,
      courseName,
      description,
      units,
      department,
      prerequisites,
      maxCapacity,
      day,
      timeStart,
      timeEnd,
      room,
      instructor,
      semester,
      yearLevel,
      status,
    } = req.body;

    // Build update data object with only valid fields
    const updateData: any = {};

    if (schoolId !== undefined) updateData.schoolId = schoolId;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (courseCode !== undefined) updateData.courseCode = courseCode;
    if (courseName !== undefined) updateData.courseName = courseName;
    if (description !== undefined) updateData.description = description;
    if (units !== undefined) updateData.units = Number(units);
    if (department !== undefined) updateData.department = department;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (maxCapacity !== undefined)
      updateData.maxCapacity = maxCapacity ? Number(maxCapacity) : null;
    if (day !== undefined) updateData.day = day;
    if (timeStart !== undefined) updateData.timeStart = timeStart;
    if (timeEnd !== undefined) updateData.timeEnd = timeEnd;
    if (room !== undefined) updateData.room = room;
    if (instructor !== undefined) updateData.instructor = instructor;
    if (semester !== undefined) updateData.semester = semester;
    if (yearLevel !== undefined) updateData.yearLevel = yearLevel;
    if (status !== undefined) updateData.status = status;

    // Check if enrollment exists before updating
    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    const updatedEnrollment = await prisma.studentEnrollment.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Enrollment updated successfully",
      enrollment: updatedEnrollment,
    });
  } catch (error: any) {
    console.error("Error updating enrollment:", error);
    if (error.code === "P2025") {
      // Prisma: record not found
      res.status(404).json({ message: "Enrollment not found" });
    } else if (error.code === "P2002") {
      res.status(409).json({
        message: "Course code already exists",
        error: "Duplicate courseCode",
      });
    } else {
      res.status(500).json({
        message: "Failed to update enrollment",
        error: error.message,
        details: error.toString(),
      });
    }
  }
};

/**
 * Get Enrollment by Course Code
 * Retrieves a student enrollment by its unique course code.
 */
export const getEnrollmentByCourseCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseCode } = req.params;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { courseCode },
    });

    if (!enrollment) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json(enrollment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching course", error: error.message });
  }
};

/**
 * Search Enrollments
 * Search enrollments by student name, school ID, course name, course code, department, or instructor.
 */
export const searchEnrollments = async (req: Request, res: Response) => {
  try {
    const { query, department, semester } = req.query;

    const whereClause: any = {};

    // Add search filters
    if (query) {
      whereClause.OR = [
        { firstName: { contains: query as string, mode: "insensitive" } },
        { lastName: { contains: query as string, mode: "insensitive" } },
        { schoolId: { contains: query as string, mode: "insensitive" } },
        { courseName: { contains: query as string, mode: "insensitive" } },
        { courseCode: { contains: query as string, mode: "insensitive" } },
        { instructor: { contains: query as string, mode: "insensitive" } },
      ];
    }

    if (department) {
      whereClause.department = department as string;
    }

    if (semester) {
      whereClause.semester = semester as string;
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: whereClause,
      orderBy: { courseName: "asc" },
    });

    res.status(200).json(enrollments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error searching enrollments", error: error.message });
  }
};

/**
 * Get Enrollments by Department
 * Fetches all enrollments for a specific department.
 */
export const getEnrollmentsByDepartment = async (
  req: Request,
  res: Response
) => {
  try {
    const { department } = req.params;
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { department },
      orderBy: { courseName: "asc" },
    });

    res.status(200).json(enrollments);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching department enrollments",
      error: error.message,
    });
  }
};

/**
 * Get Enrollment by School ID
 * Retrieves a student enrollment by their unique school ID.
 */
export const getEnrollmentBySchoolId = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { schoolId },
    });

    if (!enrollment) {
      res.status(404).json({ message: "Student enrollment not found" });
      return;
    }

    res.status(200).json(enrollment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching student enrollment", error: error.message });
  }
};

/**
 * Get Enrollments by Status
 * Fetches all enrollments with a specific status.
 */
export const getEnrollmentsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(enrollments);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching enrollments by status",
      error: error.message,
    });
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

import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// ✅ Create new course
export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      courseCode,
      courseName,
      description,
      units,
      departments,
      prerequisites,
      maxCapacity,
      schedules,
      semester,
      yearLevel,
    } = req.body;

    // Validation
    if (
      !courseCode ||
      !courseName ||
      !units ||
      !departments ||
      !maxCapacity ||
      !semester
    ) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingCourse = await prisma.courses.findFirst({
      where: {
        courseCode,
        courseName,
        semester,
      },
    });

    if (existingCourse) {
      res.status(400).json({ message: "Course already exists" });
      return;
    }

    const newCourse = await prisma.courses.create({
      data: {
        courseCode,
        courseName,
        description,
        units: Number(units),
        departments: departments || [],
        prerequisites: prerequisites || [],
        maxCapacity,
        schedules: {
          set: schedules || [],
        },
        semester,
        yearLevel,
      },
    });

    res.status(201).json({
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.courses.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get a course by ID
export const getCourseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await prisma.courses.findUnique({
      where: { id },
    });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      courseCode,
      courseName,
      description,
      units,
      departments,
      prerequisites,
      maxCapacity,
      schedules,
      semester,
      yearLevel,
    } = req.body;

    const course = await prisma.courses.findUnique({ where: { id } });
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const updatedCourse = await prisma.courses.update({
      where: { id },
      data: {
        courseCode,
        courseName,
        description,
        units: Number(units),
        departments: departments || [],
        prerequisites: prerequisites || [],
        maxCapacity,
        ...(schedules && { schedules: { set: schedules } }),
        semester,
        yearLevel,
      },
    });

    res.status(200).json({
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.courses.findUnique({ where: { id } });

    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    await prisma.courses.delete({ where: { id } });
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

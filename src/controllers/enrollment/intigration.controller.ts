import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//--- Intigration api // Get a intigration clearing officer by ID for id validation check if clearing officer existing on ems
export const getClearingOfficerBySchoolId = async (
  req: Request,
  res: Response
) => {
  try {
    const { schoolId } = req.params;
    const clearingOfficer = await prisma.clearingOfficerManagement.findUnique({
      where: { schoolId },
    });

    if (!clearingOfficer) {
      res.status(404).json({ message: "Clearing officer not found" });
      return;
    }

    res.status(200).json({ clearingOfficer });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCoursesBySchoolId = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    // Check if schoolId exists and is not empty
    if (!schoolId || schoolId.trim() === "") {
      res.status(400).json({ message: "School ID is required" });
      return;
    }

    // Find the clearing officer by schoolId
    const officer = await prisma.clearingOfficerManagement.findUnique({
      where: { schoolId },
    });

    if (!officer) {
      res.status(404).json({ message: "Clearing officer not found" });
      return;
    }

    // Use the officer's name as the instructor (combine firstName and lastName)
    const fullName = `${officer.firstName || ""} ${
      officer.lastName || ""
    }`.trim();
    const instructorName = fullName.toLowerCase();

    if (!instructorName) {
      res.status(400).json({ message: "Officer name not found" });
      return;
    }

    // Fetch all active semesters
    const activeSemesters = await prisma.semesterManagement.findMany({
      where: { status: "active" },
    });

    if (activeSemesters.length === 0) {
      res.status(404).json({ message: "No active semesters found" });
      return;
    }

    // Get all active semester names
    const activeSemesterNames = activeSemesters.map(
      (semester) => semester.semesterName
    );

    // Fetch all courses
    const allCourses = await prisma.courses.findMany();

    // Filter courses by instructor name AND active semesters
    let courses = allCourses.filter((course) => {
      // Check if course has schedules with matching instructor
      const hasInstructor = course.schedules?.some(
        (schedule) => schedule.instructor?.toLowerCase() === instructorName
      );

      // Check if course semester is in the list of active semesters
      const isActiveSemester =
        course.semester && activeSemesterNames.includes(course.semester);

      return hasInstructor && isActiveSemester;
    });

    if (courses.length === 0) {
      res.status(404).json({
        message: "No courses found for this instructor in active semesters",
      });
      return;
    }

    res.status(200).json({
      instructor: fullName,
      activeSemesters: activeSemesters,
      totalCourses: courses.length,
      courses,
    });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: error.message });
    return;
  }
};

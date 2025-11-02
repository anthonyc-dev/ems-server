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

export const getAllstudentSpecificSubject = async (
  req: Request,
  res: Response
) => {
  try {
    const { courseCode } = req.params;

    if (!courseCode) {
      res.status(400).json({ message: "Course code parameter is required" });
      return;
    }

    // Find enrollments where courseCode matches OR prerequisites array contains it
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        OR: [{ prerequisites: { has: courseCode } }],
      },
    });

    if (enrollments.length === 0) {
      res.status(404).json({
        message: `No students found enrolled in or requiring the subject '${courseCode}'`,
      });
      return;
    }

    res.status(200).json(enrollments);
  } catch (err: any) {
    console.error("Error fetching students by subject:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
    return;
  }
};

export const getAllStudentBySchoolId = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      res.status(400).json({
        success: false,
        message: "School ID parameter is required.",
      });
      return;
    }

    const students = await prisma.studentManagement.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        schoolId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        yearLevel: true,
        department: true,
      },
    });

    if (students.length === 0) {
      res.status(404).json({
        success: false,
        message: `No students found for school ID '${schoolId}'.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error: any) {
    console.error("❌ Error fetching students by schoolId:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getAllEnrollmentStudents = async (req: Request, res: Response) => {
  try {
    // Fetch all enrollments
    const enrollments = await prisma.studentEnrollment.findMany({
      select: {
        id: true,
        schoolId: true,
      },
    });

    if (enrollments.length === 0) {
      res.status(404).json({
        success: false,
        message: "No enrollments found.",
      });
      return;
    }

    // Collect all unique student IDs from enrollments
    const schoolIds = enrollments.map((enrollment) => enrollment.schoolId);

    // Fetch all students whose IDs are in the enrollments
    const enrolledStudents = await prisma.studentManagement.findMany({
      where: {
        schoolId: {
          in: schoolIds,
        },
      },
      select: {
        id: true,
        schoolId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        yearLevel: true,
        department: true,
      },
    });

    if (enrolledStudents.length === 0) {
      res.status(404).json({
        success: false,
        message: "No students found for the current enrollments.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: enrolledStudents.length,
      data: enrolledStudents,
    });
  } catch (error: any) {
    console.error("❌ Error fetching enrolled students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

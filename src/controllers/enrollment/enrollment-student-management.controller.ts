import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// ✅ CREATE Student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      yearLevel,
      department,
      program,
      status,
    } = req.body;

    // Basic validation
    if (!schoolId || !firstName || !lastName || !yearLevel) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const newStudent = await prisma.studentManagement.create({
      data: {
        schoolId,
        firstName,
        lastName,
        middleName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || "UNSPECIFIED",
        address,
        yearLevel,
        department,
        program,
        status,
      },
    });

    res.status(201).json(newStudent);
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "P2002") {
      res.status(409).json({ message: "Duplicate school id or email." });
    } else {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  }
};

// ✅ GET All Students
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await prisma.studentManagement.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(students);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch students.", error: error.message });
  }
};

// ✅ GET Student by ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.studentManagement.findUnique({
      where: { id },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.status(200).json(student);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch student.",
      error: error.message,
    });
  }
};

// ✅ UPDATE Student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Convert dateOfBirth string to Date object if present
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    const updatedStudent = await prisma.studentManagement.update({
      where: { id },
      data,
    });

    res.status(200).json(updatedStudent);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Student not found." });
    } else {
      res
        .status(500)
        .json({ message: "Failed to update student.", error: error.message });
    }
  }
};

// ✅ DELETE Student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.studentManagement.delete({ where: { id } });
    res.status(200).json({ message: "Student deleted successfully." });
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Student not found." });
    } else {
      res
        .status(500)
        .json({ message: "Failed to delete student.", error: error.message });
    }
  }
};

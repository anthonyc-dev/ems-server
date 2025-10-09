import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Create a new student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phoneNumber,
      program,
      yearLevel,
      password,
    } = req.body;

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.student.create({
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        program,
        yearLevel,
        password: hashedPassword,
      },
    });

    res.status(201).json(student);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all students
export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a student by ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, program, yearLevel } =
      req.body;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { firstName, lastName, email, phoneNumber, program, yearLevel },
    });

    res.json(updatedStudent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id } });
    res.json({ message: "Student deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

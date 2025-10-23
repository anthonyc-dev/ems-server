import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//add clearing officer
export const addClearingOfficer = async (req: Request, res: Response) => {
  try {
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phoneNumber,
      position,
      department,
    } = req.body;

    // ✅ Validate required fields
    if (!schoolId || !firstName || !lastName || !email || !phoneNumber) {
      res.status(400).json({
        message: "Missing required fields. Please provide all necessary data.",
      });
      return;
    }

    // ✅ Check if the user already exists by email or schoolId
    const existingUser = await prisma.clearingOfficerManagement.findFirst({
      where: {
        OR: [{ email }, { schoolId }],
      },
    });

    if (existingUser) {
      res.status(409).json({
        message: "A user with that email or schoolId already exists.",
      });
      return;
    }

    // // ✅ Handle password hashing (detect bcrypt hash pattern)
    // const bcryptHashPattern = /^\$2[aby]\$.{56}$/;
    // const hashedPassword = bcryptHashPattern.test(password)
    //   ? password
    //   : await bcrypt.hash(password, 10);

    // ✅ Create clearing officer
    const newOfficer = await prisma.clearingOfficerManagement.create({
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        position: position || "N/A",
        department: department || "N/A",
      },
    });

    // ✅ Success response (exclude password)
    res.status(201).json({
      message: "Clearing officer created successfully.",
      data: {
        id: newOfficer.id,
        schoolId: newOfficer.schoolId,
        firstName: newOfficer.firstName,
        lastName: newOfficer.lastName,
        email: newOfficer.email,
        phoneNumber: newOfficer.phoneNumber,
        position: newOfficer.position,
        department: newOfficer.department,
        createdAt: newOfficer.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error creating clearing officer:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message || error,
    });
  }
};
export const updateClearingOfficer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phoneNumber,
      position,
      department,
    } = req.body;

    const clearingOfficer = await prisma.clearingOfficerManagement.update({
      where: { id },
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phoneNumber,
        position,
        department,
      },
    });

    res.status(200).json({
      message: "Clearing officer updated successfully",
      clearingOfficer,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a clearing officer
export const deleteClearingOfficer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.clearingOfficerManagement.delete({
      where: { id },
    });

    res.status(200).json({ message: "Clearing officer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clearing officer
export const getClearingOfficers = async (req: Request, res: Response) => {
  try {
    const clearingOfficers = await prisma.clearingOfficerManagement.findMany();
    res.json(clearingOfficers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get a clearing officer by ID
export const getClearingOfficerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clearingOfficer = await prisma.clearingOfficerManagement.findUnique({
      where: { id },
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

import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { LoginRequest, RegisterRequest } from "../types/type";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      studentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role,
    }: RegisterRequest = req.body;

    // Check if all required fields are present
    if (
      !studentId ||
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !role
    ) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Validate password length
    if (password.length < 8) {
      res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
      return;
    }

    // Validate phone number (basic validation)
    if (!validator.isMobilePhone(phoneNumber)) {
      res.status(400).json({ error: "Invalid phone number format" });
      return;
    }

    // Validate role
    const validRoles = ["student", "clearingOfficer", "admin"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        error: "Role must be one of: student, clearing officer, admin",
      });
      return;
    }

    // Validate student ID format: must match 00-0000 (two digits, hyphen, four digits)
    if (!/^\d{2}-\d{4}$/.test(studentId)) {
      res.status(400).json({
        error: "Student ID must be in the format 00-0000",
      });
      return;
    }

    // Validate first name (should contain only letters and spaces)
    if (!validator.matches(firstName, /^[a-zA-Z\s]+$/)) {
      res.status(400).json({
        error: "First name must contain only letters and spaces",
      });
      return;
    }

    // Validate last name (should contain only letters and spaces)
    if (!validator.matches(lastName, /^[a-zA-Z\s]+$/)) {
      res.status(400).json({
        error: "Last name must contain only letters and spaces",
      });
      return;
    }

    // Validate password: must contain uppercase, lowercase, number, and special character
    const passwordRequirements = [
      {
        regex: /[A-Z]/,
        message: "Password must contain at least one uppercase letter",
      },
      {
        regex: /[a-z]/,
        message: "Password must contain at least one lowercase letter",
      },
      { regex: /[0-9]/, message: "Password must contain at least one number" },
      {
        regex: /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/,
        message: "Password must contain at least one special character",
      },
    ];

    for (const requirement of passwordRequirements) {
      if (!requirement.regex.test(password)) {
        res.status(400).json({ error: requirement.message });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Validation error occurred" });
    return;
  }
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Check if required fields are present
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (email && !password) {
      res.status(400).json({ error: "Wrong credentials" });
      return;
    }
    if (!email && password) {
      res.status(400).json({ error: "Wrong credentials" });
      return;
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Validate password is not empty
    if (password.trim().length === 0) {
      res.status(400).json({ error: "Password cannot be empty" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Validation error occurred" });
    return;
  }
};

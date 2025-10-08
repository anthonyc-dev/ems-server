import { Request } from "express";
import { Document } from "mongoose";

export interface IAuth extends Document {
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterRequest {
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

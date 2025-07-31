import mongoose, { Schema } from "mongoose";
import { IAuth } from "../types/type";

const authSchema = new Schema<IAuth>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "admin", "clearingOfficer"],
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Auth = mongoose.model<IAuth>("Auth", authSchema);

export interface AuthResponse {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import clearingOfficer from "./routes/clearingOfficer.route";
import qrCodeRoutes from "./routes/qrCode.route";
import requirementReq from "./routes/requirement.route";
import studentRoutes from "./routes/student.route";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONT_END_URL!, // your frontend origin
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample route
app.get("/", (_req: Request, res: Response): void => {
  res.send("Hello from Express + TypeScript + CORS + body-parser! Dockerized!");
});

//rooutes
app.use("/auth", clearingOfficer);
app.use("/qr-code", qrCodeRoutes);
app.use("/req", requirementReq);
app.use("/student", studentRoutes);

export default app;

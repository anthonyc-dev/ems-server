import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import enrollmentStudentManagementRoute from "./routes/enrollment/enrollment-student-management.route";
import enrollmentSemesterRoute from "./routes/enrollment/enrollment-semester.route";
import enrollmentCourseRoute from "./routes/enrollment/enrollment-addCourse.route";
import enrollmentSectionRoute from "./routes/enrollment/enrollment-section.route";
import enrollmentRoutes from "./routes/enrollment/enrollment.routes";
import enrollmentAuthRoute from "./routes/enrollment/enrollment-auth.route";
import enrollmentCoManagement from "./routes/enrollment/enrollment-co.route";
import intigrationRoute from "./routes/enrollment/intigration.route";

const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.FRONT_END_URL || "",
      process.env.FRONT_END_URL_2 || "",
      process.env.FRONT_END_URL_3 || "",
      process.env.FRONT_END_URL_4 || "",
      "http://localhost:5173",
      "http://localhost:2000",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (_req: Request, res: Response): void => {
  res.render("index");
});

//routes for Enrollment Management System
app.use("/enrollment-auth", enrollmentAuthRoute);
app.use("/student-management", enrollmentStudentManagementRoute);
app.use("/semester-management", enrollmentSemesterRoute);
app.use("/courses", enrollmentCourseRoute);
app.use("/sections", enrollmentSectionRoute);
app.use("/enroll", enrollmentRoutes);
app.use("/co", enrollmentCoManagement);

//intigration ap
app.use("/intigration", intigrationRoute);

export default app;

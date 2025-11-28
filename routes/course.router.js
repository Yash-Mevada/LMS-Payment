import { isAuthenticated } from "../middleware/auth.middleware.js";
import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourseById,
} from "../controller/course.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/create",
  isAuthenticated,
  upload.single("thumbnail"),
  createCourse
);

router.get("/getAllCourses", isAuthenticated, getCourses);

router.get("/getCourseById/:id", isAuthenticated, getCourseById);
router.put("/updateCourseById/:id", isAuthenticated, updateCourseById);
router.delete("/deleteCourse/:id", isAuthenticated, deleteCourse);

export default router;

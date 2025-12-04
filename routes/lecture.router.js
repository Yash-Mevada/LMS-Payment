import express from "express";
import {
  createLecture,
  getAllLectures,
  getLectureById,
} from "../controller/lecture.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";

const route = express.Router();

route.post(
  "/create",
  isAuthenticated,
  upload.single("LectureVideo"),
  createLecture
);

route.get("/getAllLectures", isAuthenticated, getAllLectures);
route.get("/getLectureById/:id", isAuthenticated, getLectureById);

export default route;

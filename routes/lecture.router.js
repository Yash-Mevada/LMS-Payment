import express from "express";
import {
  createLecture,
  deleteLectureById,
  getAllLectures,
  getLectureById,
  updateLectureById,
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
route.put(
  "/updateLectureById/:id",
  isAuthenticated,
  upload.single("LectureVideo"),
  updateLectureById
);
route.delete("/deleteLectureById/:id", isAuthenticated, deleteLectureById);

export default route;

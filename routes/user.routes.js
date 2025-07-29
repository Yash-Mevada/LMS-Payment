import express from "express";
import {
  authenticateUser,
  createUserAccount,
  deleteUserAccount,
  getCurrentUserProfile,
  signOutUser,
  updateUserProfile,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";
import { validationSignup } from "../middleware/validator.middleware.js";

const router = express.Router();

// Auth route
router.post("/signup", validationSignup, createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);

// profile route
router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.patch(
  "/update-profile",
  isAuthenticated,
  upload.single("avatar"),
  updateUserProfile
);

// Account delete
router.delete("/account", isAuthenticated, deleteUserAccount);

export default router;

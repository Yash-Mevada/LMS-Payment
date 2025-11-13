import express from "express";
import { cleanupInactiveUsers } from "../controller/cron.controller.js";

const router = express.Router();

router.get("/cleanup", cleanupInactiveUsers);

export default router;

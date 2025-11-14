import { User } from "../model/user.model.js";
import dayjs from "dayjs";
import { healthCheck } from "./health.controller.js";

export const cleanupInactiveUsers = async () => {
  try {
    const result = await healthCheck();

    console.log(`🧹 health check`);
    return {
      success: true,
      message: "Cleanup job executed successfully",
      result: result,
    };
  } catch (err) {
    console.error("Error in cleanup job:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

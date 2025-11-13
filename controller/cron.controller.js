import { User } from "../model/user.model.js";
import dayjs from "dayjs";

export const cleanupInactiveUsers = async (req, res) => {
  try {
    // const cutoffDate = dayjs().subtract(0, "day").toDate(); // 30 days inactive
    const cutoffDate = dayjs().toDate(); // 30 days inactive

    const result = await User.deleteMany({
      lastActive: { $lt: cutoffDate },
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} inactive users`);

    return res.status(200).json({
      success: true,
      message: "Cleanup job executed successfully",
      deleted: result.deletedCount,
    });
  } catch (err) {
    console.error("Error in cleanup job:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

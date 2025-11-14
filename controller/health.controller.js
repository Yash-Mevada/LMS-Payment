import { getDBStatus } from "../databaseConnection/db.js";

function getReadyStateText(state) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 4:
      return "disconnected";

    default:
      return "unknown";
  }
}

export const healthCheck = async (req, res) => {
  try {
    const dbStatus = await getDBStatus();

    const healthStatus = {
      status: "OK",
      timestamp: new Date().toISOString(),
      service: {
        database: {
          status: dbStatus.isConnected ? "heathy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };

    const httpStatus =
      healthStatus.service?.database.status === "healthy" ? 200 : 503;
    // return res.status(httpStatus).json(healthStatus);
    return healthStatus;
  } catch (error) {
    console.error("Health check Failed", error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      message: error.message,
    });
  }
};

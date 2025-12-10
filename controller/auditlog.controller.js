import { catchAsync } from "../middleware/error.middleware.js";
import { AuditLog } from "../model/auditLog.model.js";

export const getAuditLogs = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const auditLogsData = await AuditLog.aggregate([
    {
      $match: {
        success: req.body?.status ? req.body?.status : true,
      },
    },
    {
      $facet: {
        data: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
        totalLogs: [
          {
            $count: "totalLogs",
          },
        ],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (auditLogsData?.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      count: 0,
      message: "No logs found",
    });
  } else {
    return res.status(200).json({
      success: true,
      data: auditLogsData[0].data,
      count: auditLogsData[0].totalLogs[0].totalLogs,
    });
  }
});

export const deleteAllAuditLogs = catchAsync(async (req, res) => {
  const auditLogs = await AuditLog.deleteMany({});
  return res.status(200).json({
    success: true,
    message: "All audit logs deleted successfully",
    data: auditLogs,
  });
});

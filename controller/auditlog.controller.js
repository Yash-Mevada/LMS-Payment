import { AuditLog } from "../model/auditLog.model.js";

function saveLog({ req, res, responseData, errorMessage }) {
  AuditLog.create({
    userId: req.user?._id || null,
    method: req.method,
    route: req.originalUrl,
    statusCode: res.statusCode,
    success: !errorMessage,
    requestBody: req.body,
    requestParams: req.params,
    requestQuery: req.query,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    responseData,
    errorMessage,
  }).catch(() => {});
}

export const errorLogger = (err, req, res, next) => {
  saveLog({
    req,
    res,
    responseData: null,
    errorMessage: err.message,
  });

  next(err);
};

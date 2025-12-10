import { AuditLog } from "../model/auditLog.model.js";

const saveLog = ({ req, res, responseData, errorMessage }) => {
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
};

export const errorLogger = (err, req, res, next) => {
  saveLog({
    req,
    res,
    responseData: null,
    errorMessage: err.message,
  });

  next(err);
};

export const logger = (req, res, next) => {
  let responseData;
  const oldResponseData = res.json;

  console.log("request path----------------", req.path);
  if (req.path === "/api/v1/audit-log") {
    return next();
  }
  //   capture the response body data and the call res json function
  res.json = function (body) {
    responseData = body;
    return oldResponseData.call(this, body);
  };
  res.on("finish", async () => {
    try {
      await AuditLog.create({
        userId: req.id || null,
        method: req.method,
        route: req.originalUrl,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        responseData: responseData,
        message: res.message,
      });
    } catch (error) {
      console.log("Error while saving Data to DB", error);
    }
  });
  next();
};

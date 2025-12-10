import express from "express";
import {
  deleteAllAuditLogs,
  getAuditLogs,
} from "../controller/auditlog.controller.js";

const route = express.Router();

route.post("/", getAuditLogs);
route.delete("/deleteAllLogs", deleteAllAuditLogs);

export default route;

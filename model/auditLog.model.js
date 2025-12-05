import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  method: {
    type: String,
  },
  route: {
    type: String,
  },
  statusCode: {
    type: Number,
  },
  success: {
    type: Boolean,
  },
  requestBody: {
    type: Object,
  },
  requestBody: {
    type: Object,
  },
  requestParams: {
    type: Object,
  },
  requestQuery: {
    type: Object,
  },
  responseData: {
    type: Object,
  },
  errorMessage: {
    type: String,
  },
  ip: { type: String },
  userAgent: {
    type: String,
  },
  time: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

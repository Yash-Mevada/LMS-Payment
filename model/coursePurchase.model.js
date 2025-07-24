import mongoose from "mongoose";

const coursePurchaseSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be non-negative"],
    },
    currency: {
      type: Number,
      required: [true, "Currency is required"],
      uppercase: true,
      default: "USD",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Please select valid status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
    },
    refundId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount must be non-negative"],
    },
    refundReason: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timeStamp: true,
    toJSON: { virtual: true }, // to allows virtual types
    toObject: { virtual: true }, // to allows virtual types
  }
);

// create index

coursePurchaseSchema.index({ users: 1, course: 1 });
coursePurchaseSchema.index({ status: 1 });
coursePurchaseSchema.index({ createdAt: -1 });

// add virtual
coursePurchaseSchema.virtual("isRefundable").get(function () {
  if (this.status !== "completed") {
    return false;
  }
  const thirtyDayAge = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDayAge;
});

// method to process refund

coursePurchaseSchema.methods.processRefund = async function (reason, amount) {
  this.status = "refunded";
  this.refundReason = reason;
  this.refundAmount = amount || this.amount;
  await this.save();
};

export const CoursePurchase = mongoose.model(
  "CoursePurchase",
  coursePurchaseSchema
);

import mongoose from "mongoose";

const lectureProgressSchema = mongoose.schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "Lecture reference is required"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  watchTime: {
    type: Number,
    default: 0,
  },
  lastWatched: {
    type: Date,
    default: Date.now,
  },
});

const courseProgressSchema = mongoose.schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timeStamp: true,
    toJSON: { virtual: true }, // to allows virtual types
    toObject: { virtual: true }, // to allows virtual types
  }
);

// calculate course completion

courseProgressSchema.pre("save", function (next) {
  if (this.lectureProgress.length > 0) {
    const courseCompletion = this.lectureProgress.filter(
      (lp) => lp.isCompleted
    ).length;

    this.completedPercentage = Math.round(
      (courseCompletion / this.lectureProgress.length) * 100
    );

    this.isCompleted = this.completedPercentage == 100;
  }
  next();
});

// update last Accessed
courseProgressSchema.methods.updateLastAccessed = function () {
  this.lastAccessed = Date.now();
  return this.save({ validateBeforeSave: false });
};

export default CourseProgress = mongoose.model(
  "CourseProgress",
  courseProgressSchema
);

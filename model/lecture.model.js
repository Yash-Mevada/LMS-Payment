import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lecture Title is required"],
      trim: true,
      maxLength: [100, "Lecture Title can not be exceed 100 character"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Lecture description can not be exceed 500 character"],
    },
    videoUrl: {
      type: String,
      required: [true, "Video Url is required"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: String,
      required: [true, "PublicId is required"],
    },
    isPreview: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: [true, "lecture Order is required"],
    },
  },
  {
    timeStamp: true,
    toJSON: { virtual: true }, // to allows virtual types
    toObject: { virtual: true }, // to allows virtual types
  }
);

lectureSchema.pre("save", function (next) {
  if (this.duration) {
    this.duration = Math.round(this.duration * 100) / 100;
  }

  next();
});

export const Lecture = mongoose.model("Lecture", lectureSchema);

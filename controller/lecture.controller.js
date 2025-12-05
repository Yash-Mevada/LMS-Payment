import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { Lecture } from "../model/lecture.model.js";
import { deleteVideo, uploadStreamMedia } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// create lecture
export const createLecture = catchAsync(async (req, res) => {
  const { title, description, duration, isPreview, order } = req.body;

  if (!title || !order || !description) {
    throw new ApiError("All required fields must be provided", 400);
  }

  const isLectureExist = await Lecture.findOne({ title: title?.toLowerCase() });

  if (isLectureExist) {
    throw new ApiError("Lecture Title is already exist", 400);
  }

  const publicId = await uploadStreamMedia(
    req.file?.buffer,
    req.file.originalname
  );

  if (!publicId?.secure_url) {
    throw new ApiError("Video upload failed while uploading lecture", 400);
  }

  const lecture = await Lecture.create({
    title,
    description,
    videoUrl: publicId?.secure_url,
    duration: publicId?.duration,
    publicId: publicId?.public_id,
    isPreview,
    order,
  });

  return res.status(201).json({
    success: true,
    message: "Lecture created successfully",
    data: lecture,
  });
});

// getAllLectures
export const getAllLectures = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const allLectures = await Lecture.aggregate([
    {
      $project: {
        publicId: 0,
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
        totalLectures: [
          {
            $count: "totalLectures",
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

  if (allLectures?.length === 0) {
    //   throw new ApiError("No lecture found", 404);
    return res.status(404).json({
      success: false,
      message: "No lecture found",
      data: [],
      count: allLectures[0].totalLectures[0].totalLectures,
    });
  } else {
    res.status(200).json({
      success: true,
      data: allLectures[0].data,
      count: allLectures[0].totalLectures[0].totalLectures,
    });
  }
});

export const getLectureById = catchAsync(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError("Lecture id is required", 400);
  }

  const lecture = await Lecture.aggregate([
    {
      $match: {
        _id: new mongoose.mongo.ObjectId(req.params.id),
      },
    },
    {
      $project: {
        publicId: 0,
      },
    },
  ]);
  if (!lecture || lecture?.length === 0) {
    throw new ApiError("Lecture not found", 404);
  }
  return res.status(200).json({
    success: true,
    data: lecture[0],
  });
});

export const updateLectureById = catchAsync(async (req, res) => {
  const { title, description, order } = req.body;
  if (!req.params.id) {
    throw new ApiError("Lecture id is required", 400);
  }

  // 2️⃣ Clean update payload
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (order !== undefined) updateData.order = order;

  if (req.file) {
    const publicId = await uploadStreamMedia(
      req.file?.buffer,
      req.file.originalname
    );
    if (!publicId?.secure_url) {
      throw new ApiError("Video upload failed while uploading lecture", 400);
    }
    updateData.videoUrl = publicId?.secure_url;
    updateData.duration = publicId?.duration;
    updateData.publicId = publicId?.public_id;
  }

  const lecture = await Lecture.findByIdAndUpdate(
    { _id: req.params.id },
    {
      title,
      description,
      order,
    },
    {
      new: true,
      projection: {
        publicId: 0,
      },
    }
  );

  if (!lecture) {
    throw new ApiError("Lecture not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: lecture,
  });
});

export const deleteLectureById = catchAsync(async (req, res) => {
  const lectureId = req.params.id;
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    throw new ApiError("Lecture not found", 404);
  }
  await deleteVideo(lecture.publicId);
  await Lecture.deleteOne({ _id: lectureId });
  return res.status(200).json({
    success: true,
    message: "Lecture deleted successfully",
  });
});

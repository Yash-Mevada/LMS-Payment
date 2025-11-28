import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { Course } from "../model/course.model.js";
import { uploadMedia } from "../utils/cloudinary.js";

// create course
export const createCourse = catchAsync(async (req, res) => {
  const { title, subtitle, description, category, level, price, isPublished } =
    req.body;
  if (!title || !category || !price) {
    throw new ApiError("All required fields must be provided", 400);
  }

  if (isNaN(price) || Number(price) < 0) {
    throw new ApiError("Price must be a valid non-negative number", 400);
  }

  // check if course with same title already exist
  const isCourseExist = await Course.findOne({
    title: title,
    instructor: req.id,
  });

  if (isCourseExist) {
    throw new ApiError("Course with same title already exist", 400);
  }

  if (!req.file) {
    throw new ApiError("Thumbnail is required", 400);
  }

  const publicUrl = await uploadMedia(req.file?.path);

  if (!publicUrl) {
    throw new ApiError("Thumbnail upload failed while creating course", 400);
  }

  // create course

  const course = await Course.create({
    title,
    subtitle,
    description,
    category,
    level,
    price,
    thumbnail: publicUrl?.secure_url,
    isPublished,
    instructor: req.id,
  });

  return res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: course,
  });
});

// get all courses
export const getCourses = catchAsync(async (req, res) => {
  const allCourses = await Course.find().populate("instructor");
  if (allCourses?.length === 0) {
    //   throw new ApiError("No course found", 404);
    return res.status(404).json({
      success: false,
      message: "No course found",
      data: [],
    });
  } else {
    res.status(200).json({
      success: true,
      data: allCourses,
    });
  }
});

// get course by id
export const getCourseById = catchAsync(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor");
  if (!course) {
    throw new ApiError("Course not found", 404);
  }
  return res.status(200).json({
    success: true,
    data: course,
  });
});

// update course By id
export const updateCourseById = catchAsync(async (req, res) => {
  const { title, subtitle, description, category, level, price, isPublished } =
    req.body;

  const courseId = req.params.id;

  // check course id exist or not
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  // Ensure only the instructor can update
  if (course.instructor.toString() !== req.id.toString()) {
    throw new ApiError("You are not authorized to update this course", 403);
  }

  // check edit course title should be unique from existing course title
  if (title && course.title === title) {
    throw new ApiError("Course title should be unique", 400);
  }

  if (title) course.title = title;
  if (subtitle) course.subtitle = subtitle;
  if (description) course.description = description;
  if (category) course.category = category;
  if (level) course.level = level;
  if (price !== undefined) course.price = price;
  if (isPublished !== undefined) course.isPublished = isPublished;

  // update courseThumbnail
  if (req.file) {
    const thumbnailResult = await uploadMedia(req.file.path);
    if (!thumbnailResult) {
      throw new ApiError(
        "Thumbnail upload failed while updating course thumbnail",
        400
      );
    }
    course.thumbnail = thumbnailResult.secure_url;
  }

  // save course
  await course.save();

  return res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: course,
  });
});

export const deleteCourse = catchAsync(async (req, res) => {
  const courseId = req.params.id;
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError("Course not found", 404);
  }

  // Ensure only the instructor can delete
  if (course.instructor.toString() !== req.id.toString()) {
    throw new ApiError("You are not authorized to delete this course", 403);
  }

  await Course.deleteOne({ _id: courseId });

  return res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

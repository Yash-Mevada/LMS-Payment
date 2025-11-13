import { ApiError, catchAsync } from "../middleware/error.middleware";
import lectureModel, { Lecture } from "../model/lecture.model";

export const createLecture = catchAsync(async (req, res) => {
  const { title, description, videoUrl, duration, publicId, isPreview, order } =
    req.body;

  const isLectureExist = await Lecture.findOne({ title: title?.toLoweCase() });

  if (!isLectureExist) {
    throw new ApiError("Title is already exist", 400);
  }

  //   const lecture = await Lecture.create({
  //     title,
  //     description,
  //     videoUrl,
  //     duration,
  //     publicId,
  //     isPreview,
  //     order,
  //   });
});

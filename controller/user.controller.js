import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { User } from "../model/user.model.js";
import { deleteImage, uploadMedia } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";

export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password, role = "student" } = req.body;

  const isUserExist = await User.findOne({ email: email.toLowerCase() });

  if (isUserExist) {
    throw new ApiError("User already exist", 400);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
  });

  await user.updateLastActive();
  generateToken(res, user, "Account Created Successfully");
});

export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError("Invalid email or password ", 401);
  }

  await user.updateLastActive();
  // await user.select("-password");

  generateToken(res, user, `welcome back ${user.name}`);
});

export const signOutUser = catchAsync(async (req, res) => {
  res.cookie("token", "", {
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: "User Signed Out Successfully",
  });
});

export const getCurrentUserProfile = catchAsync(async (req, res) => {
  const user = await User.findOne({ id: req.id }).populate({
    path: "enrolledCourse",
    select: "title description thumbnail",
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
      totalEnrolledCourse: user.totalEnrolledCourse,
    },
  });
});

export const updateUserProfile = catchAsync(async (req, res) => {
  const { name, email, bio } = req.body;

  const updateData = {
    name,
    email: email.toLowerCase(),
    bio,
  };

  if (req.file) {
    const avatarResult = await uploadMedia(req.file.path);
    updateData.avatar = avatarResult.secure_url;

    // delete old avatar

    const user = await User.findById(req.id);
    if (user.avatar && user.avatar !== "default-avatar.png") {
      await deleteImage(user.avatar);
    }
  }

  // update user and get doc
  const updateUser = await User.findByIdAndUpdate(req.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updateUser) {
    throw new ApiError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updateUser,
  });
});

export const deleteUserAccount = catchAsync(async (req, res) => {
  const userId = req.id;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new ApiError("User Data not found", 404);
  }
  if (isUserExist || isUserExist.avatar !== "default-avatar.png") {
    await deleteImage(isUserExist.avatar);
  }

  await User.deleteOne({ id: userId });

  res.status(200).cookie("token", "", { maxAge: 0 }).json({
    success: true,
    message: "Account deleted successfully",
  });
});

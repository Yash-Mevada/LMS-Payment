import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
import { ApiError } from "../middleware/error.middleware.js";
import { Readable } from "node:stream";

dotenv.config({});

// check and load env variables

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "lms-payment-project",
    });
    return uploadResponse;
  } catch (error) {
    console.log("Error while uploading on cloudinary ", error);
  }
};

// upload stream media
export const uploadStreamMedia = async (fileBuffer, fileName) => {
  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "lms-payment-project",
          resource_type: "auto",
          public_id: fileName.split(".")[0],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.log("Error while uploading on cloudinary ", error.message);
    throw new ApiError("Error while uploading on cloudinary", 400);
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log("Error while Delete Image Media", error);
  }
};

export const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.log("Error while Delete Video Media", error);
  }
};

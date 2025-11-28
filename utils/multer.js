import multer from "multer";

const upload = multer({ dest: "uploads/" });

export default upload;
// utils/multer.js
// import multer from "multer";

// // ✅ Store files in memory (buffer in req.file.buffer)
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB max size
//   },
// });

// export default upload;

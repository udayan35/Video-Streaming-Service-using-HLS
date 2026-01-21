import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
import ffmpegService from "../services/ffmpegService.js";

const router = express.Router();

// Allowed video formats
const ALLOWED_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.webm'];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = "videos/uploads/";
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `temp_${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error(`Only ${ALLOWED_EXTENSIONS.join(', ')} files allowed`));
    }
    cb(null, true);
  }
});

router.post("/upload", upload.single("video"), async (req, res) => {
  let tempPath = null;
  let newPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    tempPath = req.file.path;
    
    // Generate unique videoId
    const videoId = uuidv4();
    const ext = path.extname(req.file.originalname);
    const newName = `${videoId}${ext}`;
    newPath = path.join("videos/uploads/", newName);

    // Rename file (async)
    await fs.rename(tempPath, newPath);

    // Generate HLS variants
    await ffmpegService.generateHLS(newPath, videoId);

    return res.json({
      message: "Video uploaded and processed",
      videoId,
      masterPlaylist: `/videos/${videoId}/master.m3u8`
    });

  } catch (err) {
    // Cleanup on failure
    try {
      if (tempPath) await fs.unlink(tempPath).catch(() => {});
      if (newPath) await fs.unlink(newPath).catch(() => {});
    } catch {}

    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
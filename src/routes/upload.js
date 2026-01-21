import express from "express";
import multer from "multer";
import ffmpegService from "../services/ffmpegService.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "videos/uploads/",
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const videoId = Date.now().toString();

    await ffmpegService.generateHLS(inputPath, videoId);

    return res.json({ 
      message: "Video uploaded and processed",
      videoId,
      masterPlaylist: `/videos/${videoId}/master.m3u8`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

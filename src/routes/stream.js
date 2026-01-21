import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Serve master playlist
router.get("/:videoId/master.m3u8", (req, res) => {
  const { videoId } = req.params;
  
  // Sanitize videoId to prevent path traversal
  const sanitized = videoId.replace(/[^a-zA-Z0-9-_]/g, '');
  const filePath = path.join(process.cwd(), "videos/hls", sanitized, "master.m3u8");

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Video not found");
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-cache");
  fs.createReadStream(filePath).pipe(res);
});

// Serve quality-specific index
router.get("/:videoId/:quality/index.m3u8", (req, res) => {
  const { videoId, quality } = req.params;
  
  const sanitizedId = videoId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedQuality = quality.replace(/[^a-zA-Z0-9-_]/g, '');
  
  const filePath = path.join(
    process.cwd(), 
    "videos/hls", 
    sanitizedId, 
    sanitizedQuality, 
    "index.m3u8"
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Playlist not found");
  }

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-cache");
  fs.createReadStream(filePath).pipe(res);
});

// Serve video segments (no range requests needed)
router.get("/:videoId/:quality/:segment", (req, res) => {
  const { videoId, quality, segment } = req.params;

  // Sanitize all inputs
  const sanitizedId = videoId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedQuality = quality.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedSegment = segment.replace(/[^a-zA-Z0-9-_.]/g, '');

  // Ensure it's a .ts file
  if (!sanitizedSegment.endsWith('.ts')) {
    return res.status(400).send("Invalid segment");
  }

  const filePath = path.join(
    process.cwd(),
    "videos/hls",
    sanitizedId,
    sanitizedQuality,
    sanitizedSegment
  );

  // Security check: ensure resolved path is within expected directory
  const resolvedPath = path.resolve(filePath);
  const baseDir = path.resolve(process.cwd(), "videos/hls");
  
  if (!resolvedPath.startsWith(baseDir)) {
    return res.status(403).send("Forbidden");
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Segment not found");
  }

  // HLS segments are small - send entire file
  res.setHeader("Content-Type", "video/MP2T");
  res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
  fs.createReadStream(filePath).pipe(res);
});

export default router;

//link:http://localhost:3000/player.html?src=http://localhost:3000/videos/9cfe6a7e-27b3-44ca-9123-0a5345521e38/master.m3u8
import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/segment/:videoId/:quality/:segment", (req, res) => {
  const { videoId, quality, segment } = req.params;

  const filePath = path.join(
    "videos/hls/",
    videoId,
    quality,
    segment
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Segment not found");
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, { 
      "Content-Type": "video/MP2T",
      "Content-Length": stat.size 
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  const size = stat.size;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + 1e6, size - 1);

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": "video/MP2T"
  };

  res.writeHead(206, headers);
  fs.createReadStream(filePath, { start, end }).pipe(res);
});

export default router;

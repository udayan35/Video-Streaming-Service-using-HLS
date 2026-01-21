import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export default {
  generateHLS(inputFile, videoId) {
    return new Promise((resolve, reject) => {
      const outputFolder = path.join("videos/hls/", videoId);
      fs.mkdirSync(outputFolder, { recursive: true });

      const resolutions = [
        { name: "360p", width: 640,  height: 360,  bitrate: "600k"  },
        { name: "480p", width: 854,  height: 480,  bitrate: "1000k" },
        { name: "720p", width: 1280, height: 720,  bitrate: "2500k" },
        { name: "1080p", width: 1920, height: 1080, bitrate: "5000k" }
      ];

      let ff = ffmpeg(inputFile);

      resolutions.forEach((r, index) => {
        const variantDir = `${outputFolder}/${r.name}`;
        fs.mkdirSync(variantDir, { recursive: true });

        ff = ff.output(`${variantDir}/index.m3u8`)
          .videoCodec("libx264")
          .audioCodec("aac")
          .size(`${r.width}x${r.height}`)
          .videoBitrate(r.bitrate)
          .outputOptions([
            "-hls_time 6",
            "-hls_playlist_type vod",
            `-hls_segment_filename ${variantDir}/segment_%03d.ts`
          ]);
      });

      ff.on("end", async () => {
        await generateMasterPlaylist(videoId, resolutions);
        resolve();
      });

      ff.on("error", reject);

      ff.run();
    });
  }
};

async function generateMasterPlaylist(videoId, resolutions) {
  const masterPath = `videos/hls/${videoId}/master.m3u8`;
  let content = "#EXTM3U\n";

  resolutions.forEach(r => {
    content += `
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=${r.width}x${r.height}
${r.name}/index.m3u8
`;
  });

  fs.writeFileSync(masterPath, content.trim());
}

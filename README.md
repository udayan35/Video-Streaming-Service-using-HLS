# Video Streaming Service

A lightweight, scalable video streaming service built with Node.js, Express, and HLS (HTTP Live Streaming). Upload videos and stream them with adaptive bitrate quality selection.

## Features

- Video upload with automatic HLS encoding
- Multiple quality levels (360p, 720p, 1080p)
- Adaptive bitrate streaming
- Custom web player with quality selector
- RESTful API for uploads and streaming

## Prerequisites

- Node.js (v16 or higher)
- FFmpeg installed on your system
- npm or yarn

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/video-streaming-service.git
cd video-streaming-service
```

2. Install dependencies
```bash
npm install
```

3. Create required directories
```bash
mkdir -p videos/uploads videos/hls
```

4. Start the server
```bash
npm start
```

The server will run on `http://localhost:3000`

## Project Structure

```
.
├── routes/
│   ├── upload.js          # Video upload endpoint
│   └── stream.js          # HLS streaming endpoints
├── services/
│   └── ffmpegService.js   # Video processing with FFmpeg
├── videos/
│   ├── uploads/           # Temporary storage for uploaded videos
│   └── hls/               # Generated HLS segments and playlists
├── public/
│   └── player.html        # Web-based video player
└── server.js              # Main application entry point
```

## API Endpoints

### Upload Video

**POST** `/api/upload`

Upload a video file for processing.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `video` (file)

**Response:**
```json
{
  "message": "Video uploaded and processed",
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "masterPlaylist": "/videos/550e8400-e29b-41d4-a716-446655440000/master.m3u8"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "video=@/path/to/video.mp4"
```

### Stream Video

**GET** `/videos/:videoId/master.m3u8`

Get the master playlist for a video.

**GET** `/videos/:videoId/:quality/playlist.m3u8`

Get the quality-specific playlist.

**GET** `/videos/:videoId/:quality/:segment`

Get individual video segments.

## Usage

### Uploading a Video

```javascript
const formData = new FormData();
formData.append('video', fileInput.files[0]);

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Video ID:', data.videoId);
  console.log('Master Playlist:', data.masterPlaylist);
});
```

### Playing a Video

Open the web player:
```
http://localhost:3000/player.html?src=http://localhost:3000/videos/YOUR_VIDEO_ID/master.m3u8
```

Or use any HLS-compatible player (VLC, video.js, hls.js, etc.)

## Configuration

### Supported Video Formats

- MP4
- AVI
- MOV
- MKV
- WebM

### Quality Settings

Default quality presets (can be modified in `ffmpegService.js`):

| Quality | Resolution | Bitrate |
|---------|------------|---------|
| 360p    | 640x360    | 800k    |
| 720p    | 1280x720   | 2800k   |
| 1080p   | 1920x1080  | 5000k   |

### File Size Limits

Default maximum upload size: 2GB

To change this, modify the multer configuration in `routes/upload.js`:
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
```

## Video Player Features

The included web player supports:

- Adaptive quality switching
- Manual quality selection
- Keyboard shortcuts:
  - Space: Play/Pause
  - Arrow Right: Skip forward 10s
  - Arrow Left: Skip backward 10s
  - M: Mute/Unmute
- Automatic quality detection based on bandwidth

## How HLS Works

1. **Upload**: Video file is uploaded to the server
2. **Processing**: FFmpeg converts the video into multiple quality levels
3. **Segmentation**: Each quality is split into 10-second segments (.ts files)
4. **Playlists**: Master playlist references quality playlists, which reference segments
5. **Streaming**: Player requests segments based on available bandwidth

```
master.m3u8
├── 360p/playlist.m3u8
│   ├── segment0.ts
│   ├── segment1.ts
│   └── segment2.ts
├── 720p/playlist.m3u8
│   ├── segment0.ts
│   ├── segment1.ts
│   └── segment2.ts
└── 1080p/playlist.m3u8
    ├── segment0.ts
    ├── segment1.ts
    └── segment2.ts
```

## Performance Considerations

- Processing large videos can take several minutes
- Each video generates 3 quality levels by default
- Disk space required: approximately 2x the original file size
- Consider using a CDN for production deployments

## Security Notes

Current implementation is for development purposes. For production:

- Add authentication and authorization
- Implement rate limiting
- Validate file types server-side
- Use HTTPS for all connections
- Store videos in object storage (S3, R2, etc.)
- Add virus scanning for uploads
- Implement user quotas

## Troubleshooting

**Video upload fails:**
- Check FFmpeg is installed: `ffmpeg -version`
- Verify file format is supported
- Check disk space availability

**Video won't play:**
- Verify the video finished processing
- Check browser console for errors
- Ensure CORS headers are properly set
- Try a different browser

**Poor streaming quality:**
- Check network bandwidth
- Verify quality variants were generated correctly
- Look at server logs during FFmpeg processing

## Dependencies

```json
{
  "express": "^4.18.2",
  "multer": "^1.4.5-lts.1",
  "fluent-ffmpeg": "^2.1.2",
  "uuid": "^9.0.0"
}
```



## Future Enhancements

- User authentication and video ownership
- Video thumbnails generation
- Progress tracking during upload/processing
- Video metadata (title, description, tags)
- Search and filtering
- Video analytics and view counts
- Subtitles/captions support
- Live streaming capability




---

Made with care for developers learning about video streaming technology.

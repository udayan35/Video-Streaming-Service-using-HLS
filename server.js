import express from "express";
import dotenv from "dotenv";
import routes from "./src/routes/index.js";
import mime from "mime";

mime.define({ "application/vnd.apple.mpegurl": ["m3u8"] }, { force: true });
mime.define({ "video/mp2t": ["ts"] }, { force: true });


dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HLS files statically
app.use('/videos', express.static('videos/hls'));

// Register API routes
app.use('/api', routes);

// Player frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

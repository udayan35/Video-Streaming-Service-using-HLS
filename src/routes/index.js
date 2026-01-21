import express from "express";
import uploadRoute from "./upload.js";
import streamRoute from "./stream.js";

const router = express.Router();

router.use("/upload", uploadRoute);
router.use("/stream", streamRoute);

export default router;

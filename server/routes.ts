import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertVideoSchema, insertCommentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

const upload = multer({
  dest: "uploads/",
  fileFilter: (_req, file, cb) => {
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!validTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Ensure the uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

export function registerRoutes(app: Express): Server {
  // 🟢 Pastikan JSON parser aktif sebelum route dideklarasikan
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Get all videos or search videos based on a query
  app.get("/api/videos", async (req, res) => {
    const search = req.query.search as string | undefined;
    const videos = search
      ? await storage.searchVideos(search)
      : await storage.getAllVideos();
    res.json(videos);
  });

  // Get a specific video by ID
  app.get("/api/videos/:id", async (req, res) => {
    const video = await storage.getVideo(Number(req.params.id));
    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    // Increment views count
    await storage.incrementViews(video.id);

    // Return the updated video
    const updatedVideo = await storage.getVideo(Number(req.params.id));
    res.json(updatedVideo);
  });

  // Get comments for a specific video by ID
  app.get("/api/videos/:id/comments", async (req, res) => {
    const comments = await storage.getComments(Number(req.params.id));
    res.json(comments);
  });

  // 🟢 Perbaikan: Post a new comment on a video
  app.post("/api/videos/:id/comments", async (req, res) => {
    try {
      console.log("Received comment data:", req.body); // 🟢 Debugging log

      // 🟢 Pastikan videoId dikirim dari frontend
      if (!req.body.videoId) {
        return res.status(400).json({ message: "videoId is required" });
      }

      // 🟢 Parsing data dan pastikan formatnya benar
      const commentData = insertCommentSchema.parse({
        content: String(req.body.content), // 🟢 Konversi ke string untuk menghindari error
        videoId: Number(req.body.videoId), // 🟢 Konversi ke number
      });

      // 🟢 Simpan ke database
      console.log("Saving to DB:", {
  videoId: commentData.videoId,
  content: commentData.content,
});
      const comment = await storage.createComment(commentData.videoId, commentData);
      res.json(comment);
    } catch (err) {
      console.error("Error processing comment:", err); // 🟢 Log error backend

      if (err instanceof ZodError) {
        res.status(400).json({ message: fromZodError(err).message });
      } else {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ message });
      }
    }
  });

  // Post a new video (upload and save details)
  app.post("/api/videos", upload.single("video"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "No video file uploaded" });
      return;
    }

    try {
      const videoData = insertVideoSchema.parse({
        title: req.body.title,
        description: req.body.description,
      });

      const video = await storage.createVideo({
        ...videoData,
        filename: req.file.filename, // Filename from multer upload
        mimeType: req.file.mimetype, // MIME type from multer
      });
      res.json(video);
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ message: fromZodError(err).message });
      } else {
        const message = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ message });
      }
    }
  });

  // Stream a video by filename
  app.get("/api/stream/:filename", async (req, res) => {
    const filePath = path.join("uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle partial content request for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4", // Ensure this matches the file type
      };

      res.writeHead(206, headers);
      file.pipe(res);
    } else {
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4", // Ensure this matches the file type
        "Accept-Ranges": "bytes",
      };
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}


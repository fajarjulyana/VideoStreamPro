import { videos, comments, type Video, type InsertVideo, type Comment, type InsertComment } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getAllVideos(): Promise<Video[]>;
  searchVideos(query: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo & { filename: string, mimeType: string }): Promise<Video>;
  incrementViews(id: number): Promise<void>;
  getComments(videoId: number): Promise<Comment[]>;
  createComment(videoId: number, comment: InsertComment): Promise<Comment>;
}

export class DatabaseStorage implements IStorage {
  // 🔹 Get all videos, ordered by uploaded date
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(videos.uploadedAt);
  }

  // 🔹 Search videos by title
  async searchVideos(query: string): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(ilike(videos.title, `%${query}%`))
      .orderBy(videos.uploadedAt);
  }

  // 🔹 Get a single video by ID
  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  // 🔹 Create a new video
  async createVideo(video: InsertVideo & { filename: string; mimeType: string }): Promise<Video> {
    try {
      console.log("Creating video with data:", video);

      // Handle optional fields like description
      const description = video.description || null; // Ensure description is null if not provided

      // Validate that the essential fields are correct types
      if (typeof video.title !== "string" || typeof video.filename !== "string" || typeof video.mimeType !== "string") {
        throw new Error("Invalid data type for video creation.");
      }

      // Set the current timestamp for `uploadedAt`
      const uploadedAt = new Date().toISOString();

      // Prepare and execute the insert query
      const query = db.insert(videos).values({
        title: video.title,
        description,
        filename: video.filename,
        mimeType: video.mimeType,
        uploadedAt,
      });

      console.log("Executing query:", query);

      const [created] = await query.returning();
      return created;
    } catch (err) {
      console.error("Error creating video:", err);
      throw new Error("Failed to create video.");
    }
  }

  // 🔹 Increment view count for a video
  async incrementViews(id: number): Promise<void> {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));
  }

  // 🔹 Get comments for a video by its ID
  async getComments(videoId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.videoId, videoId))
      .orderBy(comments.createdAt);
  }

  // 🔹 Create a new comment for a video
  async createComment(videoId: number, comment: InsertComment): Promise<Comment> {
    try {
      // 🔎 Debugging sebelum data masuk ke database
      console.log("Before inserting to DB:", {
        videoId,
        content: comment.content,
        typeOfVideoId: typeof videoId,
        typeOfContent: typeof comment.content,
      });

      // 🔥 Pastikan data dikonversi dengan benar
      const finalVideoId = Number(videoId);
      const finalContent = String(comment.content);
      const finalCreatedAt = new Date().toISOString(); // ✅ FIX: Pastikan createdAt dikirim sebagai string

      console.log("After conversion:", {
        finalVideoId,
        finalContent,
        finalCreatedAt, // ✅ Tambahkan ke log debugging
        typeOfFinalVideoId: typeof finalVideoId,
        typeOfFinalContent: typeof finalContent,
      });

      // 🛠 Pastikan data yang dikirimkan benar-benar bisa disimpan oleh SQLite
      if (isNaN(finalVideoId) || typeof finalContent !== "string") {
        throw new Error("Invalid data format: videoId must be a number and content must be a string.");
      }

      // 🔥 Debug SQL Query Sebelum Dikirim
      const query = db.insert(comments).values({
        videoId: finalVideoId,
        content: finalContent,
        createdAt: finalCreatedAt, // ✅ FIX: Gunakan nilai string, bukan fungsi timestamp()
      });

      console.log("Executing SQL Query:", query.toSQL()); // ✅ Cek apakah query benar

      // 🔥 Eksekusi Query
      const [created] = await query.returning();

      console.log("Successfully inserted comment:", created);
      return created;
    } catch (err) {
      console.error("Error inserting comment:", err);
      throw new Error("Failed to insert comment into database.");
    }
  }
}

// Initialize storage instance
export const storage = new DatabaseStorage();


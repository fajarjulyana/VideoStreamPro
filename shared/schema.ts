import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper to generate timestamps
const timestamp = () => new Date().toISOString();

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: text("uploaded_at").default(timestamp).notNull(),
  thumbnailPath: text("thumbnail_path"),
  views: integer("views").default(0).notNull()
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoId: integer("video_id").references(() => videos.id).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(timestamp).notNull()
});

// Video schemas
export const insertVideoSchema = createInsertSchema(videos, {
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
}).omit({
  id: true,
  uploadedAt: true,
  filename: true,
  mimeType: true,
  thumbnailPath: true,
  views: true
});

// Comment schemas
export const insertCommentSchema = createInsertSchema(comments, {
  content: z.string().min(1, "Comment is required"),
  videoId: z.number().min(1, "Video ID is required"),  // Ensure videoId is provided
}).omit({
  id: true,
  createdAt: true
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;


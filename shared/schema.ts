import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at"),
  bannedBy: varchar("banned_by", { length: 50 }),
  ageVerified: boolean("age_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fanworks table (artwork and fanfiction only)
export const fanworks = pgTable("fanworks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(), // fanart, fanfiction
  contentUrl: varchar("content_url", { length: 500 }),
  textContent: text("text_content"), // For fanfiction
  rating: varchar("rating", { length: 10 }).notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  isHidden: boolean("is_hidden").notNull().default(false),
  moderationReason: text("moderation_reason"),
  moderatedAt: timestamp("moderated_at"),
  moderatedBy: integer("moderated_by"),
  contentType: varchar("content_type", { length: 50 }).notNull().default("fanart"),
  isReported: boolean("is_reported").notNull().default(false),
  reportCount: integer("report_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for fanworks and tags
export const fanworkTags = pgTable("fanwork_tags", {
  id: serial("id").primaryKey(),
  fanworkId: integer("fanwork_id").notNull().references(() => fanworks.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fanworkId: integer("fanwork_id").notNull().references(() => fanworks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  fanworkId: integer("fanwork_id").notNull().references(() => fanworks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fanworkId: integer("fanwork_id").notNull().references(() => fanworks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports table for moderation
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  fanworkId: integer("fanwork_id").references(() => fanworks.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  moderationAction: varchar("moderation_action", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  fanworks: many(fanworks),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  reports: many(reports, { relationName: "reporter" }),
  reviewedReports: many(reports, { relationName: "reviewer" }),
}));

export const fanworksRelations = relations(fanworks, ({ one, many }) => ({
  author: one(users, {
    fields: [fanworks.authorId],
    references: [users.id],
  }),
  tags: many(fanworkTags),
  likes: many(likes),
  comments: many(comments),
  bookmarks: many(bookmarks),
  reports: many(reports),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  fanworks: many(fanworkTags),
}));

export const fanworkTagsRelations = relations(fanworkTags, ({ one }) => ({
  fanwork: one(fanworks, {
    fields: [fanworkTags.fanworkId],
    references: [fanworks.id],
  }),
  tag: one(tags, {
    fields: [fanworkTags.tagId],
    references: [tags.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  fanwork: one(fanworks, {
    fields: [likes.fanworkId],
    references: [fanworks.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  fanwork: one(fanworks, {
    fields: [comments.fanworkId],
    references: [fanworks.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  fanwork: one(fanworks, {
    fields: [bookmarks.fanworkId],
    references: [fanworks.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  fanwork: one(fanworks, {
    fields: [reports.fanworkId],
    references: [fanworks.id],
  }),
  comment: one(comments, {
    fields: [reports.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reports.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

// Insert schemas for validation
export const insertFanworkSchema = createInsertSchema(fanworks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isHidden: true,
  moderationReason: true,
  moderatedAt: true,
  moderatedBy: true,
  isReported: true,
  reportCount: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  moderationAction: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertFanwork = z.infer<typeof insertFanworkSchema>;
export type Fanwork = typeof fanworks.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFanworkSchema, insertCommentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Fanwork routes
  app.get("/api/fanworks", async (req, res) => {
    try {
      const {
        type,
        rating,
        tags,
        search,
        authorId,
        limit = "20",
        offset = "0",
      } = req.query;

      const filters = {
        type: type ? (Array.isArray(type) ? type : [type]) as string[] : undefined,
        rating: rating ? (Array.isArray(rating) ? rating : [rating]) as string[] : undefined,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
        search: search as string,
        authorId: authorId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const fanworks = await storage.getFanworks(filters);
      
      // Get additional data for each fanwork
      const fanworksWithDetails = await Promise.all(
        fanworks.map(async (fanwork) => {
          const [tags, counts, author] = await Promise.all([
            storage.getFanworkTags(fanwork.id),
            storage.getFanworkCounts(fanwork.id),
            storage.getUser(fanwork.authorId),
          ]);

          return {
            ...fanwork,
            tags,
            counts,
            author: author ? {
              id: author.id,
              firstName: author.firstName,
              lastName: author.lastName,
              profileImageUrl: author.profileImageUrl,
            } : null,
          };
        })
      );

      res.json(fanworksWithDetails);
    } catch (error) {
      console.error("Error fetching fanworks:", error);
      res.status(500).json({ message: "Failed to fetch fanworks" });
    }
  });

  app.get("/api/fanworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fanwork = await storage.getFanwork(id);
      
      if (!fanwork) {
        return res.status(404).json({ message: "Fanwork not found" });
      }

      const [tags, counts, author, comments] = await Promise.all([
        storage.getFanworkTags(id),
        storage.getFanworkCounts(id),
        storage.getUser(fanwork.authorId),
        storage.getComments(id),
      ]);

      res.json({
        ...fanwork,
        tags,
        counts,
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          profileImageUrl: author.profileImageUrl,
        } : null,
        comments,
      });
    } catch (error) {
      console.error("Error fetching fanwork:", error);
      res.status(500).json({ message: "Failed to fetch fanwork" });
    }
  });

  app.post("/api/fanworks", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fanworkData = insertFanworkSchema.parse({
        ...req.body,
        authorId: userId,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      });

      const fanwork = await storage.createFanwork(fanworkData);

      // Add tags if provided
      if (req.body.tags) {
        const tagNames = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(",");
        await storage.addTagsToFanwork(fanwork.id, tagNames);
      }

      res.status(201).json(fanwork);
    } catch (error) {
      console.error("Error creating fanwork:", error);
      res.status(500).json({ message: "Failed to create fanwork" });
    }
  });

  app.put("/api/fanworks/:id", isAuthenticated, upload.single("image"), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const existingFanwork = await storage.getFanwork(id);
      if (!existingFanwork) {
        return res.status(404).json({ message: "Fanwork not found" });
      }

      if (existingFanwork.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this fanwork" });
      }

      const updateData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      };

      const fanwork = await storage.updateFanwork(id, updateData);
      res.json(fanwork);
    } catch (error) {
      console.error("Error updating fanwork:", error);
      res.status(500).json({ message: "Failed to update fanwork" });
    }
  });

  app.delete("/api/fanworks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const existingFanwork = await storage.getFanwork(id);
      if (!existingFanwork) {
        return res.status(404).json({ message: "Fanwork not found" });
      }

      if (existingFanwork.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this fanwork" });
      }

      await storage.deleteFanwork(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fanwork:", error);
      res.status(500).json({ message: "Failed to delete fanwork" });
    }
  });

  // Interaction routes
  app.post("/api/fanworks/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const fanworkId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const isLiked = await storage.toggleLike(userId, fanworkId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/fanworks/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const fanworkId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const isBookmarked = await storage.toggleBookmark(userId, fanworkId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.get("/api/fanworks/:id/interactions", isAuthenticated, async (req: any, res) => {
    try {
      const fanworkId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const [isLiked, isBookmarked] = await Promise.all([
        storage.isLiked(userId, fanworkId),
        storage.isBookmarked(userId, fanworkId),
      ]);

      res.json({ isLiked, isBookmarked });
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // Comment routes
  app.post("/api/fanworks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const fanworkId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
        fanworkId,
      });

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.deleteComment(commentId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Tags routes
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

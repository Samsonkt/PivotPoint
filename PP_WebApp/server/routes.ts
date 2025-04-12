import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, type IStorage } from "./storage";
import { 
  insertUserSchema, 
  insertSkillSchema, 
  insertUserSkillSchema,
  insertGigSchema,
  insertLearningPathSchema,
  insertCourseSchema,
  insertUserPathSchema,
  insertUserCourseSchema,
  insertFinancialRecordSchema,
  insertForumPostSchema,
  insertForumCommentSchema
} from "@shared/schema";
import session from "express-session";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pivot-point-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update only allowed fields
      const allowedFields = [
        "firstName", 
        "lastName", 
        "bio", 
        "avatarUrl", 
        "careerPath", 
        "currentStatus", 
        "yearsOfExperience", 
        "preferredWorkType", 
        "availableForMentoring", 
        "seekingMentor", 
        "onboardingCompleted"
      ];
      
      const updateData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (field in req.body) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // SKILLS ROUTES
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  app.get("/api/skills/:id", async (req, res) => {
    try {
      const skill = await storage.getSkill(parseInt(req.params.id));
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skill" });
    }
  });

  app.post("/api/skills", requireAuth, async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  // USER SKILLS ROUTES
  app.get("/api/user-skills", requireAuth, async (req, res) => {
    try {
      const userSkills = await storage.getUserSkills(req.session.userId);
      res.json(userSkills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user skills" });
    }
  });

  app.post("/api/user-skills", requireAuth, async (req, res) => {
    try {
      const userSkillData = insertUserSkillSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const userSkill = await storage.addUserSkill(userSkillData);
      res.status(201).json(userSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add user skill" });
    }
  });

  app.patch("/api/user-skills/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { proficiencyLevel } = req.body;
      
      if (typeof proficiencyLevel !== 'number' || proficiencyLevel < 0 || proficiencyLevel > 100) {
        return res.status(400).json({ message: "Proficiency level must be a number between 0 and 100" });
      }
      
      const updatedSkill = await storage.updateUserSkill(id, proficiencyLevel);
      if (!updatedSkill) {
        return res.status(404).json({ message: "User skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user skill" });
    }
  });

  // GIGS ROUTES
  app.get("/api/gigs", async (req, res) => {
    try {
      const gigs = await storage.getGigs();
      res.json(gigs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gigs" });
    }
  });

  app.get("/api/gigs/:id", async (req, res) => {
    try {
      const gig = await storage.getGig(parseInt(req.params.id));
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      res.json(gig);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gig" });
    }
  });

  app.get("/api/adjacent-gigs", requireAuth, async (req, res) => {
    try {
      const gigs = await storage.getAdjacentGigs(req.session.userId);
      res.json(gigs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get adjacent gigs" });
    }
  });

  app.post("/api/gigs", requireAuth, async (req, res) => {
    try {
      const gigData = insertGigSchema.parse(req.body);
      const gig = await storage.createGig(gigData);
      res.status(201).json(gig);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gig" });
    }
  });

  // LEARNING PATHS ROUTES
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await storage.getLearningPaths();
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const path = await storage.getLearningPath(parseInt(req.params.id));
      if (!path) {
        return res.status(404).json({ message: "Learning path not found" });
      }
      res.json(path);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning path" });
    }
  });

  app.post("/api/learning-paths", requireAuth, async (req, res) => {
    try {
      const pathData = insertLearningPathSchema.parse(req.body);
      const path = await storage.createLearningPath(pathData);
      res.status(201).json(path);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create learning path" });
    }
  });

  // COURSES ROUTES
  app.get("/api/learning-paths/:pathId/courses", async (req, res) => {
    try {
      const courses = await storage.getCoursesByPath(parseInt(req.params.pathId));
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get courses" });
    }
  });

  app.post("/api/courses", requireAuth, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // USER PATHS ROUTES
  app.get("/api/user-paths", requireAuth, async (req, res) => {
    try {
      const userPaths = await storage.getUserPaths(req.session.userId);
      res.json(userPaths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user paths" });
    }
  });

  app.post("/api/user-paths", requireAuth, async (req, res) => {
    try {
      const userPathData = insertUserPathSchema.parse({
        ...req.body,
        userId: req.session.userId,
        startedAt: new Date()
      });
      const userPath = await storage.createUserPath(userPathData);
      res.status(201).json(userPath);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user path" });
    }
  });

  app.patch("/api/user-paths/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      const updatedUserPath = await storage.updateUserPathProgress(id, progress);
      if (!updatedUserPath) {
        return res.status(404).json({ message: "User path not found" });
      }
      
      res.json(updatedUserPath);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user path" });
    }
  });

  // USER COURSES ROUTES
  app.get("/api/user-courses", requireAuth, async (req, res) => {
    try {
      const pathId = req.query.pathId ? parseInt(req.query.pathId as string) : undefined;
      const userCourses = await storage.getUserCourses(req.session.userId, pathId);
      res.json(userCourses);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user courses" });
    }
  });

  app.post("/api/user-courses", requireAuth, async (req, res) => {
    try {
      const userCourseData = insertUserCourseSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const userCourse = await storage.createUserCourse(userCourseData);
      res.status(201).json(userCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user course" });
    }
  });

  app.patch("/api/user-courses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress, completed } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Completed must be a boolean" });
      }
      
      const updatedUserCourse = await storage.updateUserCourseProgress(id, progress, completed);
      if (!updatedUserCourse) {
        return res.status(404).json({ message: "User course not found" });
      }
      
      res.json(updatedUserCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user course" });
    }
  });

  // FINANCIAL RECORDS ROUTES
  app.get("/api/financial-records", requireAuth, async (req, res) => {
    try {
      const records = await storage.getFinancialRecords(req.session.userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial records" });
    }
  });

  app.post("/api/financial-records", requireAuth, async (req, res) => {
    try {
      const recordData = insertFinancialRecordSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const record = await storage.createFinancialRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create financial record" });
    }
  });

  // FORUM POSTS ROUTES
  app.get("/api/forum-posts", async (req, res) => {
    try {
      const posts = await storage.getForumPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get forum posts" });
    }
  });

  app.get("/api/forum-posts/:id", async (req, res) => {
    try {
      const post = await storage.getForumPost(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to get forum post" });
    }
  });

  app.post("/api/forum-posts", requireAuth, async (req, res) => {
    try {
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  // FORUM COMMENTS ROUTES
  app.get("/api/forum-posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getForumComments(parseInt(req.params.postId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get forum comments" });
    }
  });

  app.post("/api/forum-posts/:postId/comments", requireAuth, async (req, res) => {
    try {
      const commentData = insertForumCommentSchema.parse({
        ...req.body,
        userId: req.session.userId,
        postId: parseInt(req.params.postId)
      });
      const comment = await storage.createForumComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

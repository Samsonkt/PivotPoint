import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  careerPath: text("career_path"), // "freelance_to_fulltime" or "fulltime_to_freelance"
  currentStatus: text("current_status"), // "student", "employed", "freelancer", "unemployed"
  yearsOfExperience: integer("years_of_experience"),
  preferredWorkType: text("preferred_work_type"), // "remote", "onsite", "hybrid"
  availableForMentoring: boolean("available_for_mentoring").default(false),
  seekingMentor: boolean("seeking_mentor").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  proficiencyLevel: integer("proficiency_level").notNull(), // 1-100
});

export const gigs = pgTable("gigs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hourlyRateMin: integer("hourly_rate_min"),
  hourlyRateMax: integer("hourly_rate_max"),
  locationType: text("location_type").notNull(), // Remote, Hybrid, On-site
  skillsRequired: json("skills_required").notNull(), // Array of skill IDs
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  skillsTargeted: json("skills_targeted").notNull(), // Array of skill IDs
  courseCount: integer("course_count").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // "not_started", "in_progress", "completed"
  order: integer("order").notNull(),
});

export const userPaths = pgTable("user_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pathId: integer("path_id").notNull().references(() => learningPaths.id),
  progress: integer("progress").notNull().default(0), // 0-100
  startedAt: timestamp("started_at").notNull(),
});

export const userCourses = pgTable("user_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").notNull().default(0), // 0-100
  completed: boolean("completed").notNull().default(false),
});

export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  amount: integer("amount").notNull(), // In cents
  platform: text("platform"),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  commentCount: integer("comment_count").notNull().default(0),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => forumPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mentorships = pgTable("mentorships", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull().references(() => users.id),
  menteeId: integer("mentee_id").notNull().references(() => users.id),
  status: text("status").notNull(), // "pending", "active", "completed", "declined"
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true });
export const insertGigSchema = createInsertSchema(gigs).omit({ id: true });
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertUserPathSchema = createInsertSchema(userPaths).omit({ id: true });
export const insertUserCourseSchema = createInsertSchema(userCourses).omit({ id: true });
export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({ id: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true, commentCount: true });
export const insertForumCommentSchema = createInsertSchema(forumComments).omit({ id: true, createdAt: true });
export const insertMentorshipSchema = createInsertSchema(mentorships).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type InsertGig = z.infer<typeof insertGigSchema>;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertUserPath = z.infer<typeof insertUserPathSchema>;
export type InsertUserCourse = z.infer<typeof insertUserCourseSchema>;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;

export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type Gig = typeof gigs.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type UserPath = typeof userPaths.$inferSelect;
export type UserCourse = typeof userCourses.$inferSelect;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumComment = typeof forumComments.$inferSelect;
export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;

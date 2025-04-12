import {
  users, skills, userSkills, gigs, learningPaths, courses,
  userPaths, userCourses, financialRecords, forumPosts, forumComments,
  type User, type InsertUser, type Skill, type InsertSkill,
  type UserSkill, type InsertUserSkill, type Gig, type InsertGig,
  type LearningPath, type InsertLearningPath, type Course, type InsertCourse,
  type UserPath, type InsertUserPath, type UserCourse, type InsertUserCourse,
  type FinancialRecord, type InsertFinancialRecord,
  type ForumPost, type InsertForumPost, type ForumComment, type InsertForumComment
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  
  // User Skills
  getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]>;
  addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(id: number, proficiencyLevel: number): Promise<UserSkill | undefined>;
  
  // Gigs
  getGigs(): Promise<Gig[]>;
  getGig(id: number): Promise<Gig | undefined>;
  getAdjacentGigs(userId: number): Promise<Gig[]>;
  createGig(gig: InsertGig): Promise<Gig>;
  
  // Learning Paths
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: number): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  
  // Courses
  getCoursesByPath(pathId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // User Paths
  getUserPaths(userId: number): Promise<(UserPath & { path: LearningPath })[]>;
  getUserPath(id: number): Promise<UserPath | undefined>;
  createUserPath(userPath: InsertUserPath): Promise<UserPath>;
  updateUserPathProgress(id: number, progress: number): Promise<UserPath | undefined>;
  
  // User Courses
  getUserCourses(userId: number, pathId?: number): Promise<(UserCourse & { course: Course })[]>;
  getUserCourse(id: number): Promise<UserCourse | undefined>;
  createUserCourse(userCourse: InsertUserCourse): Promise<UserCourse>;
  updateUserCourseProgress(id: number, progress: number, completed: boolean): Promise<UserCourse | undefined>;
  
  // Financial Records
  getFinancialRecords(userId: number): Promise<FinancialRecord[]>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  
  // Forum
  getForumPosts(): Promise<(ForumPost & { user: User })[]>;
  getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  
  // Comments
  getForumComments(postId: number): Promise<(ForumComment & { user: User })[]>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private userSkills: Map<number, UserSkill>;
  private gigs: Map<number, Gig>;
  private learningPaths: Map<number, LearningPath>;
  private courses: Map<number, Course>;
  private userPaths: Map<number, UserPath>;
  private userCourses: Map<number, UserCourse>;
  private financialRecords: Map<number, FinancialRecord>;
  private forumPosts: Map<number, ForumPost>;
  private forumComments: Map<number, ForumComment>;
  
  private userId = 1;
  private skillId = 1;
  private userSkillId = 1;
  private gigId = 1;
  private pathId = 1;
  private courseId = 1;
  private userPathId = 1;
  private userCourseId = 1;
  private financialRecordId = 1;
  private forumPostId = 1;
  private forumCommentId = 1;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.userSkills = new Map();
    this.gigs = new Map();
    this.learningPaths = new Map();
    this.courses = new Map();
    this.userPaths = new Map();
    this.userCourses = new Map();
    this.financialRecords = new Map();
    this.forumPosts = new Map();
    this.forumComments = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create test user
    const user = this.createUser({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      bio: "A test user account"
    });
    
    // Create skills
    const contentWritingSkill = this.createSkill({ name: "Content Writing", category: "Writing", description: "Creating engaging written content" });
    const htmlCssSkill = this.createSkill({ name: "HTML/CSS", category: "Development", description: "Web markup and styling" });
    const socialMediaSkill = this.createSkill({ name: "Social Media Marketing", category: "Marketing", description: "Promoting content on social platforms" });
    const javascriptSkill = this.createSkill({ name: "JavaScript", category: "Development", description: "Client-side programming language" });
    const uxSkill = this.createSkill({ name: "UX Principles", category: "Design", description: "User experience design fundamentals" });
    const seoSkill = this.createSkill({ name: "SEO", category: "Marketing", description: "Search engine optimization techniques" });
    const reactSkill = this.createSkill({ name: "React", category: "Development", description: "JS library for building UIs" });
    
    // Create gigs
    this.createGig({
      title: "UX Content Writer",
      description: "Create user-friendly content for digital products",
      hourlyRateMin: 45,
      hourlyRateMax: 65,
      locationType: "Remote",
      skillsRequired: [contentWritingSkill.id, uxSkill.id]
    });
    
    this.createGig({
      title: "Front-End Developer",
      description: "Build responsive web interfaces",
      hourlyRateMin: 55,
      hourlyRateMax: 75,
      locationType: "Hybrid",
      skillsRequired: [htmlCssSkill.id, javascriptSkill.id, reactSkill.id]
    });
    
    this.createGig({
      title: "Digital Marketing Specialist",
      description: "Manage marketing campaigns across platforms",
      hourlyRateMin: 40,
      hourlyRateMax: 60,
      locationType: "Remote",
      skillsRequired: [contentWritingSkill.id, socialMediaSkill.id, seoSkill.id]
    });
    
    // Create learning paths
    const uxWritingPath = this.createLearningPath({
      title: "UX Writing Fundamentals",
      description: "Learn to create user-centered content for digital interfaces",
      skillsTargeted: [contentWritingSkill.id, uxSkill.id],
      courseCount: 4,
      estimatedHours: 12
    });
    
    this.createLearningPath({
      title: "Front-End Development Essentials",
      description: "Build on your HTML/CSS skills to become a front-end developer",
      skillsTargeted: [htmlCssSkill.id, javascriptSkill.id, reactSkill.id],
      courseCount: 4,
      estimatedHours: 12
    });
    
    this.createLearningPath({
      title: "Digital Marketing Analytics",
      description: "Expand your marketing skills with data analytics",
      skillsTargeted: [socialMediaSkill.id, seoSkill.id],
      courseCount: 3,
      estimatedHours: 8
    });
    
    // Create courses for UX Writing path
    const uxPrinciples = this.createCourse({
      pathId: uxWritingPath.id,
      title: "UX Writing Principles",
      description: "Learn the fundamentals of writing for user interfaces",
      status: "completed",
      order: 1
    });
    
    const contentStrategy = this.createCourse({
      pathId: uxWritingPath.id,
      title: "Content Strategy Basics",
      description: "Develop strategies for consistent content across platforms",
      status: "completed",
      order: 2
    });
    
    const microcopy = this.createCourse({
      pathId: uxWritingPath.id,
      title: "Microcopy and UI Text",
      description: "Craft effective microcopy for interfaces",
      status: "in_progress",
      order: 3
    });
    
    const uxWritingForProducts = this.createCourse({
      pathId: uxWritingPath.id,
      title: "UX Writing for Products",
      description: "Apply UX writing to product development",
      status: "not_started",
      order: 4
    });

    // Add user skills
    this.addUserSkill({ 
      userId: user.id, 
      skillId: contentWritingSkill.id, 
      proficiencyLevel: 85
    });
    
    this.addUserSkill({ 
      userId: user.id, 
      skillId: uxSkill.id, 
      proficiencyLevel: 65
    });
    
    this.addUserSkill({ 
      userId: user.id, 
      skillId: htmlCssSkill.id, 
      proficiencyLevel: 45
    });
    
    // Add user path
    const userPath = this.createUserPath({
      userId: user.id,
      pathId: uxWritingPath.id,
      progress: 60,
      startedAt: new Date()
    });
    
    // Add user courses
    this.createUserCourse({
      userId: user.id,
      courseId: uxPrinciples.id,
      progress: 100,
      completed: true
    });
    
    this.createUserCourse({
      userId: user.id,
      courseId: contentStrategy.id,
      progress: 100,
      completed: true
    });
    
    this.createUserCourse({
      userId: user.id,
      courseId: microcopy.id,
      progress: 45,
      completed: false
    });
    
    this.createUserCourse({
      userId: user.id,
      courseId: uxWritingForProducts.id,
      progress: 0,
      completed: false
    });
    
    // Add financial records
    this.createFinancialRecord({
      userId: user.id,
      month: 1,
      year: 2025,
      amount: 150000, // $1,500.00
      platform: "Upwork"
    });
    
    this.createFinancialRecord({
      userId: user.id,
      month: 2,
      year: 2025,
      amount: 175000, // $1,750.00
      platform: "Upwork"
    });
    
    this.createFinancialRecord({
      userId: user.id,
      month: 3,
      year: 2025,
      amount: 165000, // $1,650.00
      platform: "Upwork"
    });
    
    this.createFinancialRecord({
      userId: user.id,
      month: 4,
      year: 2025,
      amount: 190000, // $1,900.00
      platform: "Upwork"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Skills
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillId++;
    const skill: Skill = { ...insertSkill, id };
    this.skills.set(id, skill);
    return skill;
  }
  
  // User Skills
  async getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]> {
    const userSkills = Array.from(this.userSkills.values()).filter(
      (userSkill) => userSkill.userId === userId
    );
    
    return userSkills.map(userSkill => {
      const skill = this.skills.get(userSkill.skillId)!;
      return { ...userSkill, skill };
    });
  }
  
  async addUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillId++;
    const userSkill: UserSkill = { ...insertUserSkill, id };
    this.userSkills.set(id, userSkill);
    return userSkill;
  }
  
  async updateUserSkill(id: number, proficiencyLevel: number): Promise<UserSkill | undefined> {
    const userSkill = this.userSkills.get(id);
    if (!userSkill) return undefined;
    
    const updated = { ...userSkill, proficiencyLevel };
    this.userSkills.set(id, updated);
    return updated;
  }
  
  // Gigs
  async getGigs(): Promise<Gig[]> {
    return Array.from(this.gigs.values());
  }
  
  async getGig(id: number): Promise<Gig | undefined> {
    return this.gigs.get(id);
  }
  
  async getAdjacentGigs(userId: number): Promise<Gig[]> {
    // This would implement the "adjacent gigs" algorithm
    // For now, return all gigs
    return this.getGigs();
  }
  
  async createGig(insertGig: InsertGig): Promise<Gig> {
    const id = this.gigId++;
    const gig: Gig = { ...insertGig, id };
    this.gigs.set(id, gig);
    return gig;
  }
  
  // Learning Paths
  async getLearningPaths(): Promise<LearningPath[]> {
    return Array.from(this.learningPaths.values());
  }
  
  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    return this.learningPaths.get(id);
  }
  
  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const id = this.pathId++;
    const path: LearningPath = { ...insertPath, id };
    this.learningPaths.set(id, path);
    return path;
  }
  
  // Courses
  async getCoursesByPath(pathId: number): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.pathId === pathId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  // User Paths
  async getUserPaths(userId: number): Promise<(UserPath & { path: LearningPath })[]> {
    const userPaths = Array.from(this.userPaths.values()).filter(
      (userPath) => userPath.userId === userId
    );
    
    return userPaths.map(userPath => {
      const path = this.learningPaths.get(userPath.pathId)!;
      return { ...userPath, path };
    });
  }
  
  async getUserPath(id: number): Promise<UserPath | undefined> {
    return this.userPaths.get(id);
  }
  
  async createUserPath(insertUserPath: InsertUserPath): Promise<UserPath> {
    const id = this.userPathId++;
    const userPath: UserPath = { ...insertUserPath, id };
    this.userPaths.set(id, userPath);
    return userPath;
  }
  
  async updateUserPathProgress(id: number, progress: number): Promise<UserPath | undefined> {
    const userPath = this.userPaths.get(id);
    if (!userPath) return undefined;
    
    const updated = { ...userPath, progress };
    this.userPaths.set(id, updated);
    return updated;
  }
  
  // User Courses
  async getUserCourses(userId: number, pathId?: number): Promise<(UserCourse & { course: Course })[]> {
    let userCourses = Array.from(this.userCourses.values()).filter(
      (userCourse) => userCourse.userId === userId
    );
    
    if (pathId) {
      const pathCourseIds = Array.from(this.courses.values())
        .filter(course => course.pathId === pathId)
        .map(course => course.id);
      
      userCourses = userCourses.filter(
        userCourse => pathCourseIds.includes(userCourse.courseId)
      );
    }
    
    return userCourses.map(userCourse => {
      const course = this.courses.get(userCourse.courseId)!;
      return { ...userCourse, course };
    });
  }
  
  async getUserCourse(id: number): Promise<UserCourse | undefined> {
    return this.userCourses.get(id);
  }
  
  async createUserCourse(insertUserCourse: InsertUserCourse): Promise<UserCourse> {
    const id = this.userCourseId++;
    const userCourse: UserCourse = { ...insertUserCourse, id };
    this.userCourses.set(id, userCourse);
    return userCourse;
  }
  
  async updateUserCourseProgress(id: number, progress: number, completed: boolean): Promise<UserCourse | undefined> {
    const userCourse = this.userCourses.get(id);
    if (!userCourse) return undefined;
    
    const updated = { ...userCourse, progress, completed };
    this.userCourses.set(id, updated);
    return updated;
  }
  
  // Financial Records
  async getFinancialRecords(userId: number): Promise<FinancialRecord[]> {
    return Array.from(this.financialRecords.values()).filter(
      (record) => record.userId === userId
    );
  }
  
  async createFinancialRecord(insertRecord: InsertFinancialRecord): Promise<FinancialRecord> {
    const id = this.financialRecordId++;
    const record: FinancialRecord = { ...insertRecord, id };
    this.financialRecords.set(id, record);
    return record;
  }
  
  // Forum
  async getForumPosts(): Promise<(ForumPost & { user: User })[]> {
    return Array.from(this.forumPosts.values()).map(post => {
      const user = this.users.get(post.userId)!;
      return { ...post, user };
    });
  }
  
  async getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined> {
    const post = this.forumPosts.get(id);
    if (!post) return undefined;
    
    const user = this.users.get(post.userId)!;
    return { ...post, user };
  }
  
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostId++;
    const post: ForumPost = { 
      ...insertPost, 
      id, 
      createdAt: new Date(), 
      commentCount: 0 
    };
    this.forumPosts.set(id, post);
    return post;
  }
  
  // Comments
  async getForumComments(postId: number): Promise<(ForumComment & { user: User })[]> {
    const comments = Array.from(this.forumComments.values()).filter(
      (comment) => comment.postId === postId
    );
    
    return comments.map(comment => {
      const user = this.users.get(comment.userId)!;
      return { ...comment, user };
    });
  }
  
  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const id = this.forumCommentId++;
    const comment: ForumComment = { 
      ...insertComment, 
      id, 
      createdAt: new Date() 
    };
    this.forumComments.set(id, comment);
    
    // Update post comment count
    const post = this.forumPosts.get(insertComment.postId);
    if (post) {
      this.forumPosts.set(post.id, {
        ...post,
        commentCount: post.commentCount + 1
      });
    }
    
    return comment;
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
  
  // Skills
  async getSkills(): Promise<Skill[]> {
    return db.select().from(skills);
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }
  
  // User Skills
  async getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]> {
    const userSkillsData = await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
    
    const result: (UserSkill & { skill: Skill })[] = [];
    
    for (const userSkill of userSkillsData) {
      const [skill] = await db
        .select()
        .from(skills)
        .where(eq(skills.id, userSkill.skillId));
      
      if (skill) {
        result.push({ ...userSkill, skill });
      }
    }
    
    return result;
  }
  
  async addUserSkill(insertUserSkill: InsertUserSkill): Promise<UserSkill> {
    const [userSkill] = await db
      .insert(userSkills)
      .values(insertUserSkill)
      .returning();
    return userSkill;
  }
  
  async updateUserSkill(id: number, proficiencyLevel: number): Promise<UserSkill | undefined> {
    const [updatedUserSkill] = await db
      .update(userSkills)
      .set({ proficiencyLevel })
      .where(eq(userSkills.id, id))
      .returning();
    return updatedUserSkill || undefined;
  }
  
  // Gigs
  async getGigs(): Promise<Gig[]> {
    return db.select().from(gigs);
  }
  
  async getGig(id: number): Promise<Gig | undefined> {
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, id));
    return gig || undefined;
  }
  
  async getAdjacentGigs(userId: number): Promise<Gig[]> {
    // For now, just return all gigs
    // In a real implementation, this would use more sophisticated logic
    return this.getGigs();
  }
  
  async createGig(insertGig: InsertGig): Promise<Gig> {
    const [gig] = await db
      .insert(gigs)
      .values(insertGig)
      .returning();
    return gig;
  }
  
  // Learning Paths
  async getLearningPaths(): Promise<LearningPath[]> {
    return db.select().from(learningPaths);
  }
  
  async getLearningPath(id: number): Promise<LearningPath | undefined> {
    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, id));
    return path || undefined;
  }
  
  async createLearningPath(insertPath: InsertLearningPath): Promise<LearningPath> {
    const [path] = await db
      .insert(learningPaths)
      .values(insertPath)
      .returning();
    return path;
  }
  
  // Courses
  async getCoursesByPath(pathId: number): Promise<Course[]> {
    const coursesData = await db
      .select()
      .from(courses)
      .where(eq(courses.pathId, pathId))
      .orderBy(courses.order);
    return coursesData;
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }
  
  // User Paths
  async getUserPaths(userId: number): Promise<(UserPath & { path: LearningPath })[]> {
    const userPathsData = await db
      .select()
      .from(userPaths)
      .where(eq(userPaths.userId, userId));
    
    const result: (UserPath & { path: LearningPath })[] = [];
    
    for (const userPath of userPathsData) {
      const [path] = await db
        .select()
        .from(learningPaths)
        .where(eq(learningPaths.id, userPath.pathId));
      
      if (path) {
        result.push({ ...userPath, path });
      }
    }
    
    return result;
  }
  
  async getUserPath(id: number): Promise<UserPath | undefined> {
    const [userPath] = await db.select().from(userPaths).where(eq(userPaths.id, id));
    return userPath || undefined;
  }
  
  async createUserPath(insertUserPath: InsertUserPath): Promise<UserPath> {
    const [userPath] = await db
      .insert(userPaths)
      .values(insertUserPath)
      .returning();
    return userPath;
  }
  
  async updateUserPathProgress(id: number, progress: number): Promise<UserPath | undefined> {
    const [updatedUserPath] = await db
      .update(userPaths)
      .set({ progress })
      .where(eq(userPaths.id, id))
      .returning();
    return updatedUserPath || undefined;
  }
  
  // User Courses
  async getUserCourses(userId: number, pathId?: number): Promise<(UserCourse & { course: Course })[]> {
    let query = db
      .select()
      .from(userCourses)
      .where(eq(userCourses.userId, userId));
    
    const userCoursesData = await query;
    const result: (UserCourse & { course: Course })[] = [];
    
    for (const userCourse of userCoursesData) {
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, userCourse.courseId));
      
      if (course && (!pathId || course.pathId === pathId)) {
        result.push({ ...userCourse, course });
      }
    }
    
    return result;
  }
  
  async getUserCourse(id: number): Promise<UserCourse | undefined> {
    const [userCourse] = await db.select().from(userCourses).where(eq(userCourses.id, id));
    return userCourse || undefined;
  }
  
  async createUserCourse(insertUserCourse: InsertUserCourse): Promise<UserCourse> {
    const [userCourse] = await db
      .insert(userCourses)
      .values(insertUserCourse)
      .returning();
    return userCourse;
  }
  
  async updateUserCourseProgress(id: number, progress: number, completed: boolean): Promise<UserCourse | undefined> {
    const [updatedUserCourse] = await db
      .update(userCourses)
      .set({ progress, completed })
      .where(eq(userCourses.id, id))
      .returning();
    return updatedUserCourse || undefined;
  }
  
  // Financial Records
  async getFinancialRecords(userId: number): Promise<FinancialRecord[]> {
    return db
      .select()
      .from(financialRecords)
      .where(eq(financialRecords.userId, userId));
  }
  
  async createFinancialRecord(insertRecord: InsertFinancialRecord): Promise<FinancialRecord> {
    const [record] = await db
      .insert(financialRecords)
      .values(insertRecord)
      .returning();
    return record;
  }
  
  // Forum
  async getForumPosts(): Promise<(ForumPost & { user: User })[]> {
    const postsData = await db.select().from(forumPosts);
    const result: (ForumPost & { user: User })[] = [];
    
    for (const post of postsData) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, post.userId));
      
      if (user) {
        result.push({ ...post, user });
      }
    }
    
    return result;
  }
  
  async getForumPost(id: number): Promise<(ForumPost & { user: User }) | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    
    if (!post) return undefined;
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, post.userId));
    
    if (!user) return undefined;
    
    return { ...post, user };
  }
  
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPost> {
    const [post] = await db
      .insert(forumPosts)
      .values({
        ...insertPost,
        createdAt: new Date(),
        commentCount: 0
      })
      .returning();
    return post;
  }
  
  // Comments
  async getForumComments(postId: number): Promise<(ForumComment & { user: User })[]> {
    const commentsData = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.postId, postId));
    
    const result: (ForumComment & { user: User })[] = [];
    
    for (const comment of commentsData) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, comment.userId));
      
      if (user) {
        result.push({ ...comment, user });
      }
    }
    
    return result;
  }
  
  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const [comment] = await db
      .insert(forumComments)
      .values({
        ...insertComment,
        createdAt: new Date()
      })
      .returning();
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({
        commentCount: sql`${forumPosts.commentCount} + 1`
      })
      .where(eq(forumPosts.id, insertComment.postId));
    
    return comment;
  }
}

// Use the database storage implementation
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export const storage = new DatabaseStorage();

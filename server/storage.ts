import { 
  users, 
  contactSubmissions, 
  clients,
  projects,
  adminSessions,
  notifications,
  analytics,
  type User, 
  type InsertUser, 
  type ContactSubmission, 
  type InsertContactSubmission,
  type UpdateContactSubmission,
  type Client,
  type InsertClient,
  type Project,
  type InsertProject,
  type AdminSession,
  type Notification,
  type InsertNotification,
  type Analytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin authentication
  validateAdmin(username: string, password: string): Promise<AdminSession | null>;
  getAdminSession(token: string): Promise<AdminSession | null>;
  createAdminSession(username: string): Promise<AdminSession>;
  deleteAdminSession(token: string): Promise<boolean>;
  
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  updateContactSubmission(id: number, updates: UpdateContactSubmission): Promise<ContactSubmission | undefined>;
  deleteContactSubmission(id: number): Promise<boolean>;
  getContactStats(): Promise<{
    totalSubmissions: number;
    todaySubmissions: number;
    weekSubmissions: number;
    monthSubmissions: number;
  }>;
  
  // Client management
  createClient(client: InsertClient): Promise<Client>;
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Project management
  createProject(project: InsertProject): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Analytics
  recordAnalytic(metric: string, value: number, metadata?: any): Promise<Analytics>;
  getAnalytics(metric: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  // Admin authentication
  async validateAdmin(username: string, password: string): Promise<AdminSession | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return null;
    }
    return this.createAdminSession(username);
  }

  async getAdminSession(token: string): Promise<AdminSession | null> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(and(eq(adminSessions.sessionToken, token), gte(adminSessions.expiresAt, new Date())));
    return session || null;
  }

  async createAdminSession(username: string): Promise<AdminSession> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [session] = await db
      .insert(adminSessions)
      .values({ sessionToken, username, expiresAt })
      .returning();
    return session;
  }

  async deleteAdminSession(token: string): Promise<boolean> {
    const result = await db.delete(adminSessions).where(eq(adminSessions.sessionToken, token));
    return (result.rowCount || 0) > 0;
  }

  // Contact submissions
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        ...insertSubmission,
        status: "new",
        priority: "medium",
        source: "website",
        updatedAt: new Date()
      })
      .returning();
    return submission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    return submission || undefined;
  }

  async updateContactSubmission(id: number, updates: UpdateContactSubmission): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .update(contactSubmissions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return submission || undefined;
  }

  async deleteContactSubmission(id: number): Promise<boolean> {
    const result = await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getContactStats(): Promise<{
    totalSubmissions: number;
    todaySubmissions: number;
    weekSubmissions: number;
    monthSubmissions: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total] = await db.select({ count: count() }).from(contactSubmissions);
    const [todayCount] = await db.select({ count: count() }).from(contactSubmissions).where(gte(contactSubmissions.createdAt, today));
    const [weekCount] = await db.select({ count: count() }).from(contactSubmissions).where(gte(contactSubmissions.createdAt, weekAgo));
    const [monthCount] = await db.select({ count: count() }).from(contactSubmissions).where(gte(contactSubmissions.createdAt, monthAgo));

    return {
      totalSubmissions: total.count,
      todaySubmissions: todayCount.count,
      weekSubmissions: weekCount.count,
      monthSubmissions: monthCount.count,
    };
  }

  // Client management
  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values({ ...insertClient, updatedAt: new Date() })
      .returning();
    return client;
  }

  async getAllClients(): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client || undefined;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project management
  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({ ...insertProject, updatedAt: new Date() })
      .returning();
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Notifications
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.isRead, false))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Analytics
  async recordAnalytic(metric: string, value: number, metadata?: any): Promise<Analytics> {
    const [analytic] = await db
      .insert(analytics)
      .values({
        date: new Date(),
        metric,
        value,
        metadata
      })
      .returning();
    return analytic;
  }

  async getAnalytics(metric: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.metric, metric),
          gte(analytics.date, startDate),
          lte(analytics.date, endDate)
        )
      )
      .orderBy(analytics.date);
  }

  async getDashboardStats(): Promise<any> {
    const [contactCount] = await db.select({ count: count() }).from(contactSubmissions);
    const [clientCount] = await db.select({ count: count() }).from(clients);
    const [projectCount] = await db.select({ count: count() }).from(projects);
    const [unreadNotifications] = await db.select({ count: count() }).from(notifications).where(eq(notifications.isRead, false));

    return {
      totalContacts: contactCount.count,
      totalClients: clientCount.count,
      totalProjects: projectCount.count,
      unreadNotifications: unreadNotifications.count,
    };
  }
}

export const storage = new DatabaseStorage();

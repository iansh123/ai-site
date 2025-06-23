import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertClientSchema,
  insertProjectSchema,
  insertNotificationSchema,
  loginSchema,
  updateContactSubmissionSchema
} from "@shared/schema";
import { z } from "zod";
import axios from "axios";

// Admin authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const session = await storage.getAdminSession(token);
  if (!session) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  req.adminSession = session;
  next();
};

// N8n integration helper
const triggerN8nWorkflow = async (workflowId: string, data: any) => {
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    console.warn("N8N_WEBHOOK_URL not configured");
    return null;
  }

  try {
    const response = await axios.post(`${n8nUrl}/webhook/${workflowId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to trigger n8n workflow:", error);
    return null;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Admin authentication endpoints
  app.post("/api/admin/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const session = await storage.validateAdmin(validatedData.username, validatedData.password);
      
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      res.json({
        success: true,
        token: session.sessionToken,
        message: "Login successful"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid login data",
          errors: error.errors
        });
      } else {
        console.error("Login error:", error);
        res.status(500).json({
          success: false,
          message: "Login failed"
        });
      }
    }
  });

  app.post("/api/admin/logout", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteAdminSession(req.adminSession.sessionToken);
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  });

  app.get("/api/admin/session", requireAuth, (req: any, res) => {
    res.json({ 
      success: true, 
      user: { username: req.adminSession.username },
      expiresAt: req.adminSession.expiresAt
    });
  });

  // Create default admin user (for setup)
  app.post("/api/admin/create-default", async (req, res) => {
    try {
      const { username, password } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Admin user already exists"
        });
      }

      await storage.createUser({ username, password });
      res.json({
        success: true,
        message: "Default admin user created successfully"
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create admin user"
      });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Trigger n8n workflow for new contact
      await triggerN8nWorkflow("new-contact", {
        type: "new_contact",
        contact: submission,
        timestamp: new Date().toISOString()
      });

      // Create notification for admin
      await storage.createNotification({
        type: "contact",
        title: "New Contact Submission",
        message: `New message from ${submission.name} (${submission.email})`,
        metadata: { contactId: submission.id }
      });
      
      res.json({ 
        success: true, 
        id: submission.id,
        message: "Contact form submitted successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid form data", 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      } else {
        console.error("Contact form submission error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });

  // Get all contact submissions (admin endpoint)
  app.get("/api/contact", async (req, res) => {
    try {
      const submissions = await storage.getAllContactSubmissions();
      res.json({
        success: true,
        data: submissions,
        count: submissions.length
      });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact submissions"
      });
    }
  });

  // Get contact statistics (must come before :id route)
  app.get("/api/contact/stats", async (req, res) => {
    try {
      const stats = await storage.getContactStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching contact stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact statistics"
      });
    }
  });

  // Get single contact submission by ID
  app.get("/api/contact/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission ID"
        });
      }

      const submission = await storage.getContactSubmission(id);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Contact submission not found"
        });
      }

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      console.error("Error fetching contact submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contact submission"
      });
    }
  });

  // Delete contact submission by ID
  app.delete("/api/contact/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission ID"
        });
      }

      const deleted = await storage.deleteContactSubmission(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Contact submission not found"
        });
      }

      res.json({
        success: true,
        message: "Contact submission deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting contact submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete contact submission"
      });
    }
  });

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
      path: req.path
    });
  });

  // Update contact submission
  app.patch("/api/contact/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid submission ID"
        });
      }

      const validatedData = updateContactSubmissionSchema.parse(req.body);
      const updated = await storage.updateContactSubmission(id, validatedData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Contact submission not found"
        });
      }

      res.json({
        success: true,
        data: updated,
        message: "Contact submission updated successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid update data",
          errors: error.errors
        });
      } else {
        console.error("Error updating contact submission:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update contact submission"
        });
      }
    }
  });

  // Client Management APIs
  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      
      // Trigger n8n workflow for new client
      await triggerN8nWorkflow("new-client", {
        type: "new_client",
        client: client,
        timestamp: new Date().toISOString()
      });

      // Create notification
      await storage.createNotification({
        type: "client",
        title: "New Client Added",
        message: `New client ${client.name} has been added to the system`,
        metadata: { clientId: client.id }
      });

      res.json({
        success: true,
        data: client,
        message: "Client created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid client data",
          errors: error.errors
        });
      } else {
        console.error("Error creating client:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create client"
        });
      }
    }
  });

  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json({
        success: true,
        data: clients,
        count: clients.length
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch clients"
      });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID"
        });
      }

      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }

      const projects = await storage.getProjectsByClient(id);
      res.json({
        success: true,
        data: { ...client, projects }
      });
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch client"
      });
    }
  });

  app.patch("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID"
        });
      }

      const updated = await storage.updateClient(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }

      res.json({
        success: true,
        data: updated,
        message: "Client updated successfully"
      });
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update client"
      });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID"
        });
      }

      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }

      res.json({
        success: true,
        message: "Client deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete client"
      });
    }
  });

  // Project Management APIs
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      
      // Trigger n8n workflow for new project
      await triggerN8nWorkflow("new-project", {
        type: "new_project",
        project: project,
        timestamp: new Date().toISOString()
      });

      // Create notification
      await storage.createNotification({
        type: "project",
        title: "New Project Created",
        message: `Project "${project.name}" has been created`,
        metadata: { projectId: project.id, clientId: project.clientId }
      });

      res.json({
        success: true,
        data: project,
        message: "Project created successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid project data",
          errors: error.errors
        });
      } else {
        console.error("Error creating project:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create project"
        });
      }
    }
  });

  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json({
        success: true,
        data: projects,
        count: projects.length
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch projects"
      });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID"
        });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch project"
      });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID"
        });
      }

      const updated = await storage.updateProject(id, req.body);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      // Trigger workflow for project updates
      await triggerN8nWorkflow("project-updated", {
        type: "project_updated",
        project: updated,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: updated,
        message: "Project updated successfully"
      });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update project"
      });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID"
        });
      }

      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      res.json({
        success: true,
        message: "Project deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete project"
      });
    }
  });

  // Notifications APIs
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notifications"
      });
    }
  });

  app.get("/api/notifications/unread", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications();
      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch unread notifications"
      });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID"
        });
      }

      const marked = await storage.markNotificationAsRead(id);
      if (!marked) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }

      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark notification as read"
      });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification ID"
        });
      }

      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Notification not found"
        });
      }

      res.json({
        success: true,
        message: "Notification deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete notification"
      });
    }
  });

  // Dashboard APIs
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const contactStats = await storage.getContactStats();
      
      res.json({
        success: true,
        data: {
          ...stats,
          contactStats
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics"
      });
    }
  });

  // Analytics APIs
  app.post("/api/analytics", requireAuth, async (req, res) => {
    try {
      const { metric, value, metadata } = req.body;
      const analytic = await storage.recordAnalytic(metric, value, metadata);
      
      res.json({
        success: true,
        data: analytic,
        message: "Analytics recorded successfully"
      });
    } catch (error) {
      console.error("Error recording analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to record analytics"
      });
    }
  });

  app.get("/api/analytics/:metric", requireAuth, async (req, res) => {
    try {
      const { metric } = req.params;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const analytics = await storage.getAnalytics(metric, start, end);
      
      res.json({
        success: true,
        data: analytics,
        count: analytics.length
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics"
      });
    }
  });

  // N8n webhook endpoint
  app.post("/api/webhooks/n8n", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      // Handle different webhook types from n8n
      switch (type) {
        case "workflow_completed":
          await storage.createNotification({
            type: "workflow",
            title: "Workflow Completed",
            message: `N8n workflow "${data.workflowName}" completed successfully`,
            metadata: data
          });
          break;
        case "task_reminder":
          await storage.createNotification({
            type: "reminder",
            title: "Task Reminder",
            message: data.message,
            metadata: data
          });
          break;
        default:
          console.log("Unknown webhook type:", type);
      }
      
      res.json({
        success: true,
        message: "Webhook processed successfully"
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process webhook"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

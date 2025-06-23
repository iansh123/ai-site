import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
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

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFarmSchema, 
  insertCropSchema,
  insertWeatherDataSchema,
  insertCropRecommendationSchema 
} from "@shared/schema";

// Extend session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const { username, password, ...userData } = result.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        ...userData
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.status(201).json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        req.session.userId = user.id;
        
        const { password: _, ...userResponse } = user;
        res.json({ user: userResponse });
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password: _, ...userResponse } = user;
      res.json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Farm routes
  app.get("/api/farms", requireAuth, async (req: Request, res: Response) => {
    try {
      const farms = await storage.getFarmsByUserId(req.session.userId!);
      res.json({ farms });
    } catch (error) {
      res.status(500).json({ error: "Failed to get farms" });
    }
  });

  app.post("/api/farms", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertFarmSchema.safeParse({
        ...req.body,
        userId: req.session.userId!
      });
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const farm = await storage.createFarm(result.data);
      res.status(201).json({ farm });
    } catch (error) {
      res.status(500).json({ error: "Failed to create farm" });
    }
  });

  app.get("/api/farms/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const farm = await storage.getFarm(req.params.id);
      if (!farm) {
        return res.status(404).json({ error: "Farm not found" });
      }
      
      // Check ownership
      if (farm.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json({ farm });
    } catch (error) {
      res.status(500).json({ error: "Failed to get farm" });
    }
  });

  // Crop routes
  app.get("/api/farms/:farmId/crops", requireAuth, async (req: Request, res: Response) => {
    try {
      const farm = await storage.getFarm(req.params.farmId);
      if (!farm || farm.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const crops = await storage.getCropsByFarmId(req.params.farmId);
      res.json({ crops });
    } catch (error) {
      res.status(500).json({ error: "Failed to get crops" });
    }
  });

  app.post("/api/farms/:farmId/crops", requireAuth, async (req: Request, res: Response) => {
    try {
      const farm = await storage.getFarm(req.params.farmId);
      if (!farm || farm.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const result = insertCropSchema.safeParse({
        ...req.body,
        farmId: req.params.farmId
      });
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const crop = await storage.createCrop(result.data);
      res.status(201).json({ crop });
    } catch (error) {
      res.status(500).json({ error: "Failed to create crop" });
    }
  });

  // Weather routes
  app.get("/api/farms/:farmId/weather", requireAuth, async (req: Request, res: Response) => {
    try {
      const farm = await storage.getFarm(req.params.farmId);
      if (!farm || farm.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const weatherData = await storage.getWeatherByFarmId(req.params.farmId);
      res.json({ weather: weatherData });
    } catch (error) {
      res.status(500).json({ error: "Failed to get weather data" });
    }
  });

  app.get("/api/farms/:farmId/weather/latest", requireAuth, async (req: Request, res: Response) => {
    try {
      const farm = await storage.getFarm(req.params.farmId);
      if (!farm || farm.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const weather = await storage.getLatestWeather(req.params.farmId);
      res.json({ weather });
    } catch (error) {
      res.status(500).json({ error: "Failed to get latest weather" });
    }
  });

  // Crop recommendation routes
  app.get("/api/recommendations", requireAuth, async (req: Request, res: Response) => {
    try {
      const recommendations = await storage.getCropRecommendationsByUserId(req.session.userId!);
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.post("/api/recommendations", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertCropRecommendationSchema.safeParse({
        ...req.body,
        userId: req.session.userId!
      });
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid input", details: result.error.issues });
      }

      const recommendation = await storage.createCropRecommendation(result.data);
      res.status(201).json({ recommendation });
    } catch (error) {
      res.status(500).json({ error: "Failed to create recommendation" });
    }
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const farms = await storage.getFarmsByUserId(req.session.userId!);
      const recommendations = await storage.getCropRecommendationsByUserId(req.session.userId!);
      
      // Get crops and weather for all farms
      const farmsWithData = await Promise.all(
        farms.map(async (farm) => {
          const crops = await storage.getCropsByFarmId(farm.id);
          const latestWeather = await storage.getLatestWeather(farm.id);
          return {
            ...farm,
            crops,
            latestWeather
          };
        })
      );

      res.json({
        farms: farmsWithData,
        recommendations: recommendations.slice(0, 5), // Latest 5 recommendations
        summary: {
          totalFarms: farms.length,
          totalCrops: farmsWithData.reduce((sum, farm) => sum + farm.crops.length, 0),
          activeCrops: farmsWithData.reduce((sum, farm) => 
            sum + farm.crops.filter(crop => crop.status === 'growing').length, 0
          )
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

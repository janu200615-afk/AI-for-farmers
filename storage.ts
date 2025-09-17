import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { 
  type User, 
  type InsertUser, 
  type Farm, 
  type InsertFarm,
  type Crop,
  type InsertCrop,
  type WeatherData,
  type InsertWeatherData,
  type CropRecommendation,
  type InsertCropRecommendation,
  users,
  farms,
  crops,
  weatherData,
  cropRecommendations
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Farm methods
  getFarmsByUserId(userId: string): Promise<Farm[]>;
  getFarm(id: string): Promise<Farm | undefined>;
  createFarm(farm: InsertFarm): Promise<Farm>;
  updateFarm(id: string, farm: Partial<InsertFarm>): Promise<Farm | undefined>;
  deleteFarm(id: string): Promise<boolean>;
  
  // Crop methods
  getCropsByFarmId(farmId: string): Promise<Crop[]>;
  getCrop(id: string): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop | undefined>;
  deleteCrop(id: string): Promise<boolean>;
  
  // Weather methods
  getWeatherByFarmId(farmId: string): Promise<WeatherData[]>;
  getLatestWeather(farmId: string): Promise<WeatherData | undefined>;
  createWeatherData(weather: InsertWeatherData): Promise<WeatherData>;
  deleteWeatherData(id: string): Promise<boolean>;
  
  // Crop recommendation methods
  getCropRecommendationsByUserId(userId: string): Promise<CropRecommendation[]>;
  createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation>;
  deleteCropRecommendation(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Farm methods
  async getFarmsByUserId(userId: string): Promise<Farm[]> {
    return await db.select().from(farms).where(eq(farms.userId, userId));
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    const result = await db.select().from(farms).where(eq(farms.id, id));
    return result[0];
  }

  async createFarm(farm: InsertFarm): Promise<Farm> {
    const result = await db.insert(farms).values(farm).returning();
    return result[0];
  }

  async updateFarm(id: string, farm: Partial<InsertFarm>): Promise<Farm | undefined> {
    const result = await db.update(farms).set(farm).where(eq(farms.id, id)).returning();
    return result[0];
  }

  async deleteFarm(id: string): Promise<boolean> {
    const result = await db.delete(farms).where(eq(farms.id, id));
    return result.rowCount > 0;
  }

  // Crop methods
  async getCropsByFarmId(farmId: string): Promise<Crop[]> {
    return await db.select().from(crops).where(eq(crops.farmId, farmId));
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    const result = await db.select().from(crops).where(eq(crops.id, id));
    return result[0];
  }

  async createCrop(crop: InsertCrop): Promise<Crop> {
    const result = await db.insert(crops).values(crop).returning();
    return result[0];
  }

  async updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop | undefined> {
    const result = await db.update(crops).set(crop).where(eq(crops.id, id)).returning();
    return result[0];
  }

  async deleteCrop(id: string): Promise<boolean> {
    const result = await db.delete(crops).where(eq(crops.id, id));
    return result.rowCount > 0;
  }

  // Weather methods
  async getWeatherByFarmId(farmId: string): Promise<WeatherData[]> {
    return await db.select().from(weatherData).where(eq(weatherData.farmId, farmId));
  }

  async getLatestWeather(farmId: string): Promise<WeatherData | undefined> {
    const result = await db.select().from(weatherData)
      .where(eq(weatherData.farmId, farmId))
      .orderBy(desc(weatherData.date))
      .limit(1);
    return result[0];
  }

  async createWeatherData(weather: InsertWeatherData): Promise<WeatherData> {
    const result = await db.insert(weatherData).values(weather).returning();
    return result[0];
  }

  async deleteWeatherData(id: string): Promise<boolean> {
    const result = await db.delete(weatherData).where(eq(weatherData.id, id));
    return result.rowCount > 0;
  }

  // Crop recommendation methods
  async getCropRecommendationsByUserId(userId: string): Promise<CropRecommendation[]> {
    return await db.select().from(cropRecommendations).where(eq(cropRecommendations.userId, userId));
  }

  async createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation> {
    const result = await db.insert(cropRecommendations).values(recommendation).returning();
    return result[0];
  }

  async deleteCropRecommendation(id: string): Promise<boolean> {
    const result = await db.delete(cropRecommendations).where(eq(cropRecommendations.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();

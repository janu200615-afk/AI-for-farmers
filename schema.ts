import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  farmName: text("farm_name"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const farms = pgTable("farms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  size: decimal("size"), // acres
  soilType: text("soil_type"),
  coordinates: jsonb("coordinates"), // {lat: number, lng: number}
  createdAt: timestamp("created_at").defaultNow(),
});

export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").notNull().references(() => farms.id),
  name: text("name").notNull(),
  variety: text("variety"),
  plantedDate: timestamp("planted_date"),
  expectedHarvestDate: timestamp("expected_harvest_date"),
  area: decimal("area"), // acres
  status: text("status").default("planned"), // planned, planted, growing, harvested
  predictedYield: decimal("predicted_yield"),
  actualYield: decimal("actual_yield"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmId: varchar("farm_id").notNull().references(() => farms.id),
  date: timestamp("date").notNull(),
  temperature: decimal("temperature"),
  humidity: decimal("humidity"),
  precipitation: decimal("precipitation"),
  windSpeed: decimal("wind_speed"),
  conditions: text("conditions"),
  forecast: jsonb("forecast"), // 7-day forecast data
  createdAt: timestamp("created_at").defaultNow(),
});

export const cropRecommendations = pgTable("crop_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  farmId: varchar("farm_id").references(() => farms.id),
  recommendedCrops: jsonb("recommended_crops"), // array of crop recommendations
  factors: jsonb("factors"), // soil, climate, market factors
  confidence: decimal("confidence"), // confidence score 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  farmName: true,
  location: true,
});

export const insertFarmSchema = createInsertSchema(farms).omit({
  id: true,
  createdAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  createdAt: true,
});

export const insertCropRecommendationSchema = createInsertSchema(cropRecommendations).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farms.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertCropRecommendation = z.infer<typeof insertCropRecommendationSchema>;
export type CropRecommendation = typeof cropRecommendations.$inferSelect;

import { pgTable, text, serial, integer, decimal, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  propertyId: varchar("property_id", { length: 255 }).notNull().unique(),
  agency: varchar("agency", { length: 100 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }),
  location: text("location"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  imageUrls: jsonb("image_urls").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: decimal("area", { precision: 10, scale: 2 }),
  propertyType: varchar("property_type", { length: 50 }),
  status: varchar("status", { length: 50 }).default("available"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;

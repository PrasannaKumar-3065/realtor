import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { agenciesTable } from "./agencies";
import { propertiesTable } from "./properties";

export const reviewsTable = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    reviewId: varchar("review_id", { length: 100 }).notNull().unique(),
    agencyId: integer("agency_id").notNull(),
    propertyId: varchar("property_id", { length: 255 }),
    customerName: varchar("customer_name", { length: 255 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    rating: integer("rating"),
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    reviewDate: date("review_date"),
    status: varchar("status", { length: 50 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    agencyFk: foreignKey({
      columns: [table.agencyId],
      foreignColumns: [agenciesTable.id],
    }).onDelete("cascade"),
    propertyFk: foreignKey({
      columns: [table.propertyId],
      foreignColumns: [propertiesTable.propertyId],
    }).onDelete("set null"),
  }),
);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

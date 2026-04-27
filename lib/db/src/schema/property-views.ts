import {
  pgTable,
  serial,
  varchar,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { propertiesTable } from "./properties";

export const propertyViewsTable = pgTable(
  "property_views",
  {
    id: serial("id").primaryKey(),
    propertyId: varchar("property_id", { length: 255 }).notNull(),
    viewerIp: varchar("viewer_ip", { length: 50 }),
    viewerEmail: varchar("viewer_email", { length: 255 }),
    viewTimestamp: timestamp("view_timestamp").defaultNow(),
  },
  (table) => ({
    propertyFk: foreignKey({
      columns: [table.propertyId],
      foreignColumns: [propertiesTable.propertyId],
    }).onDelete("cascade"),
  }),
);

export const insertPropertyViewSchema = createInsertSchema(
  propertyViewsTable,
).omit({
  id: true,
  viewTimestamp: true,
});

export type InsertPropertyView = z.infer<typeof insertPropertyViewSchema>;
export type PropertyView = typeof propertyViewsTable.$inferSelect;

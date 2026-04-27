import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { agenciesTable } from "./agencies";
import { propertiesTable } from "./properties";

export const leadsTable = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    leadId: varchar("lead_id", { length: 100 }).notNull().unique(),
    agencyId: integer("agency_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    message: text("message"),
    propertyId: varchar("property_id", { length: 255 }),
    propertyTitle: varchar("property_title", { length: 500 }),
    source: varchar("source", { length: 50 }),
    score: integer("score").default(10),
    temperature: varchar("temperature", { length: 20 }),
    status: varchar("status", { length: 50 }).default("new"),
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

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;

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

export const agentsTable = pgTable(
  "agents",
  {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id", { length: 100 }).notNull().unique(),
    agencyId: integer("agency_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    bio: text("bio"),
    imageUrl: varchar("image_url", { length: 500 }),
    specialization: varchar("specialization", { length: 255 }),
    status: varchar("status", { length: 50 }).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    agencyFk: foreignKey({
      columns: [table.agencyId],
      foreignColumns: [agenciesTable.id],
    }).onDelete("cascade"),
  }),
);

export const insertAgentSchema = createInsertSchema(agentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agentsTable.$inferSelect;

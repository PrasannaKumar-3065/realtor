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

export const foundersTable = pgTable(
  "founders",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agency_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }),
    experience: varchar("experience", { length: 255 }),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    teamSize: integer("team_size"),
    bio: text("bio"),
    imageUrl: varchar("image_url", { length: 500 }),
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

export const insertFounderSchema = createInsertSchema(foundersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFounder = z.infer<typeof insertFounderSchema>;
export type Founder = typeof foundersTable.$inferSelect;

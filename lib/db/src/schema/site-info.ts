import {
  pgTable,
  serial,
  text,
  jsonb,
  integer,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { agenciesTable } from "./agencies";

export const siteInfoTable = pgTable(
  "site_info",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agency_id").notNull(),
    about: text("about"),
    mission: text("mission"),
    vision: text("vision"),
    values: text("values"),
    socialMedia: jsonb("social_media").$type<Record<string, string>>(),
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

export const insertSiteInfoSchema = createInsertSchema(siteInfoTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSiteInfo = z.infer<typeof insertSiteInfoSchema>;
export type SiteInfo = typeof siteInfoTable.$inferSelect;

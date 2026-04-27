import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { agenciesTable } from "./agencies";

export const contactsTable = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    contactId: varchar("contact_id", { length: 100 }).notNull().unique(),
    agencyId: integer("agency_id").notNull(),
    label: varchar("label", { length: 100 }),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    contactType: varchar("contact_type", { length: 50 }),
    isPrimary: boolean("is_primary").default(false),
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

export const insertContactSchema = createInsertSchema(contactsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contactsTable.$inferSelect;

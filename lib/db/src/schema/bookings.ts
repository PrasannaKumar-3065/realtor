import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  integer,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { agenciesTable } from "./agencies";
import { leadsTable } from "./leads";
import { propertiesTable } from "./properties";

export const bookingsTable = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    bookingId: varchar("booking_id", { length: 100 }).notNull().unique(),
    agencyId: integer("agency_id").notNull(),
    leadId: varchar("lead_id", { length: 100 }),
    propertyId: varchar("property_id", { length: 255 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    bookingAmount: numeric("booking_amount", { precision: 12, scale: 2 }),
    bookingDate: date("booking_date"),
    scheduledVisitDate: timestamp("scheduled_visit_date"),
    bookingStatus: varchar("booking_status", { length: 50 }).default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    agencyFk: foreignKey({
      columns: [table.agencyId],
      foreignColumns: [agenciesTable.id],
    }).onDelete("cascade"),
    leadFk: foreignKey({
      columns: [table.leadId],
      foreignColumns: [leadsTable.leadId],
    }).onDelete("set null"),
    propertyFk: foreignKey({
      columns: [table.propertyId],
      foreignColumns: [propertiesTable.propertyId],
    }).onDelete("restrict"),
  }),
);

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;

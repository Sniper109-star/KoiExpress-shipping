import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  licensePlate: text("license_plate").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull().default(true),
  rating: real("rating").default(5.0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"),
  phone: text("phone"),
  address: text("address"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingNumber: text("tracking_number").notNull().unique(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  senderPhone: text("sender_phone").notNull(),
  senderAddress: text("sender_address").notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  weight: real("weight").notNull(),
  dimensions: text("dimensions"),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  price: real("price"),
  userId: integer("user_id").references(() => users.id),
  driverId: integer("driver_id").references(() => drivers.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id").notNull().references(() => packages.id),
  driverId: integer("driver_id").references(() => drivers.id),
  pickupLocation: text("pickup_location").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  estimatedDelivery: integer("estimated_delivery", { mode: "timestamp" }),
  actualDelivery: integer("actual_delivery", { mode: "timestamp" }),
  status: text("status").notNull().default("pending"),
});

export const trackingEvents = sqliteTable("tracking_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id").notNull().references(() => packages.id),
  status: text("status").notNull(),
  location: text("location"),
  description: text("description"),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertDriverSchema = createInsertSchema(drivers);
export const selectDriverSchema = createSelectSchema(drivers);
export const insertPackageSchema = createInsertSchema(packages);
export const selectPackageSchema = createSelectSchema(packages);
export const insertShipmentSchema = createInsertSchema(shipments);
export const selectShipmentSchema = createSelectSchema(shipments);
export const insertTrackingEventSchema = createInsertSchema(trackingEvents);
export const selectTrackingEventSchema = createSelectSchema(trackingEvents);
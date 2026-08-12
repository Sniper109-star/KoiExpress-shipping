import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shipmentLocations: defineTable({
    shipmentId: v.string(),
    trackingNumber: v.string(),
    status: v.string(),
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_trackingNumber", ["trackingNumber"]).index("by_shipmentId", ["shipmentId"]),
});


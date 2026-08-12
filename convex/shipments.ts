import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const status = v.string();

export const getByTrackingNumber = query({
  args: { trackingNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("shipmentLocations")
      .withIndex("by_trackingNumber", (q) => q.eq("trackingNumber", args.trackingNumber))
      .order("desc")
      .first();
  },
});

export const upsertLocation = mutation({
  args: {
    shipmentId: v.string(), trackingNumber: v.string(), status,
    location: v.optional(v.string()), latitude: v.optional(v.number()),
    longitude: v.optional(v.number()), updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.query("shipmentLocations")
      .withIndex("by_shipmentId", (q) => q.eq("shipmentId", args.shipmentId))
      .first();
    if (current) return await ctx.db.patch(current._id, args);
    return await ctx.db.insert("shipmentLocations", args);
  },
});

import { db } from "@/db";
import { packages, drivers } from "@/db/schema";

export async function getAllPackages() {
  return await db.select().from(packages);
}

export async function getAllDrivers() {
  return await db.select().from(drivers);
}
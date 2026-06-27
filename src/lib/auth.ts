import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function login(email: string, password: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user[0]) return null;
  
  const valid = await bcrypt.compare(password, user[0].password);
  if (!valid) return null;
  
  const token = jwt.sign({ id: user[0].id, role: user[0].role }, JWT_SECRET);
  return { ...user[0], token };
}

export async function register(name: string, email: string, password: string, role: string = "customer") {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role,
  }).returning();
  return result[0];
}

export async function getUserById(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user[0] || null;
}
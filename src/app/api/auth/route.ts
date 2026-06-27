import { NextRequest, NextResponse } from "next/server";
import { login, register } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, ...data } = body;

  if (action === "login") {
    const result = await login(data.email, data.password);
    if (!result) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const response = NextResponse.json(result);
    response.cookies.set("token", result.token, { httpOnly: true });
    return response;
  }

  if (action === "register") {
    try {
      const result = await register(data.name, data.email, data.password, data.role);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
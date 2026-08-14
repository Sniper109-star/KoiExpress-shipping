import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.delete("admin_session");
  return response;
}

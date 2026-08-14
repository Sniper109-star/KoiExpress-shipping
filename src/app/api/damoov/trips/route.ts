import { NextRequest, NextResponse } from "next/server";

const DAMOOV_TRIPS_URL = "https://api.telematicssdk.com/trips/get/admin/v1/short";

export async function POST(request: NextRequest) {
  const token = process.env.JWT;
  if (!token) return NextResponse.json({ error: "Damoov is not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const response = await fetch(DAMOOV_TRIPS_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
    body: JSON.stringify({
      Identifiers: { CompanyId: body.companyId },
      StartDate: body.startDate,
      EndDate: body.endDate,
      SortBy: "StartDateUtc",
      Paging: {
        Page: Number.isInteger(body.page) && body.page > 0 ? body.page : 1,
        Count: Number.isInteger(body.count) && body.count > 0 && body.count <= 100 ? body.count : 20,
        IncludePagingInfo: true,
      },
    }),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({ error: "Invalid Damoov response" }));
  return NextResponse.json(result, { status: response.status });
}

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.RUMAHOTP_API_KEY || process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "";
const BASE_URL = "https://www.rumahotp.io/api/v2";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const deposit_id = searchParams.get("deposit_id");

  if (!deposit_id) {
    return NextResponse.json(
      { success: false, message: "Missing deposit_id" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${BASE_URL}/deposit/get_status?deposit_id=${deposit_id}`,
      {
        method: "GET",
        headers: {
          "x-apikey": API_KEY,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Deposit status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

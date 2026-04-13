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

  if (!API_KEY) {
    return NextResponse.json(
      { success: false, message: "API key tidak dikonfigurasi" },
      { status: 500 }
    );
  }

  try {
    const url = `${BASE_URL}/deposit/get_status?deposit_id=${deposit_id}`;
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-apikey": API_KEY,
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || `HTTP Error: ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Deposit status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal cek status" },
      { status: 500 }
    );
  }
}

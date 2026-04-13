import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");
  const payment_id = searchParams.get("payment_id");

  if (!amount || !payment_id) {
    return NextResponse.json(
      { success: false, message: "Missing amount or payment_id" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://www.rumahotp.io/api/v2/deposit/create`,
      {
        params: { amount, payment_id },
        headers: {
          "x-apikey": process.env.RUMAHOTP_API_KEY!,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Unknown error";
    return NextResponse.json(
      { success: false, message: msg },
      { status: err.response?.status || 500 }
    );
  }
}

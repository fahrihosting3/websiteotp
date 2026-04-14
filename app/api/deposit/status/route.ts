import { NextRequest, NextResponse } from "next/server";
import { 
  findTransactionByExternalId, 
  updateTransactionStatus, 
  updateUserBalance 
} from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const depositId = searchParams.get("deposit_id");

    if (!depositId) {
      return NextResponse.json({ error: "Deposit ID required" }, { status: 400 });
    }

    // Check status from rumahotp API
    const res = await fetch(
      `https://www.rumahotp.io/api/v2/deposit/get_status?deposit_id=${depositId}`,
      {
        method: "GET",
        headers: {
          "x-apikey": process.env.NEXT_PUBLIC_RUMAHOTP_API_KEY || "",
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
    }

    // Get current transaction from DB
    const transaction = await findTransactionByExternalId(depositId);

    // If status changed to success and transaction was pending, update balance
    if (data.data.status === "success" && transaction && transaction.status === "pending") {
      // Update transaction status
      await updateTransactionStatus(depositId, "success");

      // Update user balance
      await updateUserBalance(transaction.userId.toString(), transaction.amount);

      return NextResponse.json({
        success: true,
        data: {
          ...data.data,
          balanceUpdated: true,
          amount: transaction.amount,
        },
      });
    }

    // If status changed to cancel/expired
    if ((data.data.status === "cancel" || data.data.status === "expired") && transaction?.status === "pending") {
      await updateTransactionStatus(depositId, data.data.status as "cancel" | "expired");
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error("Check deposit status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getUserTransactions } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const transactions = await getUserTransactions(userId);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({
        id: t._id?.toString(),
        externalId: t.externalId,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        total: t.total,
        status: t.status,
        method: t.method,
        createdAt: t.createdAt.toISOString(),
        paidAt: t.paidAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

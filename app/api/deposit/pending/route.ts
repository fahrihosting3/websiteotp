import { NextRequest, NextResponse } from "next/server";
import { getPendingTransactionByUserId } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const pendingTransaction = await getPendingTransactionByUserId(userId);

    if (!pendingTransaction) {
      return NextResponse.json({
        success: true,
        hasPending: false,
        transaction: null,
      });
    }

    // Check if expired
    const now = new Date();
    if (pendingTransaction.expiredAt && now > pendingTransaction.expiredAt) {
      return NextResponse.json({
        success: true,
        hasPending: false,
        transaction: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasPending: true,
      transaction: {
        id: pendingTransaction._id?.toString(),
        externalId: pendingTransaction.externalId,
        amount: pendingTransaction.amount,
        fee: pendingTransaction.fee,
        total: pendingTransaction.total,
        status: pendingTransaction.status,
        method: pendingTransaction.method,
        qrString: pendingTransaction.qrString,
        qrImage: pendingTransaction.qrImage,
        createdAt: pendingTransaction.createdAt.toISOString(),
        expiredAt: pendingTransaction.expiredAt?.toISOString(),
        expiredAtTs: pendingTransaction.expiredAt?.getTime(),
      },
    });
  } catch (error) {
    console.error("Get pending deposit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

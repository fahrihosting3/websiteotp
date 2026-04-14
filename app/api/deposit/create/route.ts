import { NextRequest, NextResponse } from "next/server";
import { createTransaction, ObjectId } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, amount, depositData } = await req.json();

    if (!userId || !amount || !depositData) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const transaction = await createTransaction({
      externalId: depositData.id,
      userId: new ObjectId(userId),
      userEmail: userEmail,
      type: "deposit",
      amount: depositData.diterima || amount,
      fee: depositData.fee || 0,
      total: depositData.total || amount,
      status: "pending",
      method: depositData.method || "qris",
      qrString: depositData.qr_string,
      qrImage: depositData.qr_image,
      expiredAt: new Date(depositData.expired_at_ts),
      metadata: {
        brand: depositData.brand,
        currency: depositData.currency,
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction._id?.toString(),
        externalId: transaction.externalId,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error("Create deposit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

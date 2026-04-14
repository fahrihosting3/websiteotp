import { NextRequest, NextResponse } from "next/server";
import { 
  countUsers, 
  getTransactionStats, 
  getAllTransactions,
  getAllUsers 
} from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const [userCount, transactionStats, recentTransactions, users] = await Promise.all([
      countUsers(),
      getTransactionStats(),
      getAllTransactions({ limit: 50 }),
      getAllUsers(),
    ]);

    // Get users with recent login (last 24 hours)
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(
      (u) => u.lastLoginAt && new Date(u.lastLoginAt) > last24Hours
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userCount,
        activeUsers,
        ...transactionStats,
      },
      recentTransactions: recentTransactions.map((t) => ({
        id: t._id?.toString(),
        externalId: t.externalId,
        userEmail: t.userEmail,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        total: t.total,
        status: t.status,
        method: t.method,
        createdAt: t.createdAt.toISOString(),
        paidAt: t.paidAt?.toISOString(),
      })),
      users: users.map((u) => ({
        id: u._id?.toString(),
        name: u.name,
        email: u.email,
        balance: u.balance,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

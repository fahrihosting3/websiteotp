import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

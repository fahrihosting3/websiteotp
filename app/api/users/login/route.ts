import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUserLastLogin } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Update last login
    await updateUserLastLogin(user._id!.toString());

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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

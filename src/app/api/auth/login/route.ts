import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { employeeNo, password } = await request.json();

    const employee = await prisma.employee.findUnique({
      where: { employeeNo },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "職員番号またはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "職員番号またはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("session", JSON.stringify({ id: employee.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      isAdmin: employee.isAdmin,
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { employeeNo, name, email } = await request.json();

    const existing = await prisma.employee.findUnique({
      where: { employeeNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: "この職員番号は既に登録されています" },
        { status: 400 }
      );
    }

    const password = await bcrypt.hash("password", 10);
    const employee = await prisma.employee.create({
      data: { employeeNo, name, email: email || null, password },
    });

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

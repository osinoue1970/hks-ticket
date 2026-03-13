import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const period = await prisma.applicationPeriod.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(period);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 抽選リセット（当選結果と申込みを削除し、再実験可能にする）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { id } = await params;
    const periodId = parseInt(id);

    const period = await prisma.applicationPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      return NextResponse.json({ error: "募集期間が見つかりません" }, { status: 404 });
    }

    // 該当月の試合IDを取得
    const monthGames = await prisma.game.findMany({
      where: { month: period.month },
      select: { id: true },
    });
    const gameIds = monthGames.map((g) => g.id);

    // 当選結果を削除
    await prisma.lotteryResult.deleteMany({
      where: { gameId: { in: gameIds } },
    });

    // 申込みを削除
    await prisma.application.deleteMany({
      where: { periodId },
    });

    // 期間をリセット
    await prisma.applicationPeriod.update({
      where: { id: periodId },
      data: { isDrawn: false, isOpen: false },
    });

    return NextResponse.json({ message: "リセットしました" });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

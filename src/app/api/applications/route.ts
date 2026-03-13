import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { periodId, firstChoiceId, secondChoiceId, thirdChoiceId } =
      await request.json();

    // 重複チェック
    const existing = await prisma.application.findUnique({
      where: {
        employeeId_periodId: {
          employeeId: session.id,
          periodId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "既にこの期間に申込み済みです" },
        { status: 400 }
      );
    }

    // 同じ試合を複数選択していないかチェック
    const choices = [firstChoiceId, secondChoiceId, thirdChoiceId].filter(
      Boolean
    );
    if (new Set(choices).size !== choices.length) {
      return NextResponse.json(
        { error: "同じ試合を複数選択することはできません" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        employeeId: session.id,
        periodId,
        firstChoiceId,
        secondChoiceId: secondChoiceId || null,
        thirdChoiceId: thirdChoiceId || null,
      },
    });

    return NextResponse.json(application);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

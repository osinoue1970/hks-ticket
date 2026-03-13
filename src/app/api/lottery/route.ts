import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * 抽選ロジック
 *
 * 1. 第1希望 → 第2希望 → 第3希望 の順に処理
 * 2. 各試合ごとに、希望者を「未当選者」「当選歴あり」に分類
 * 3. 未当選者がいれば、その中からランダム抽選
 * 4. 全員当選歴ありなら、当選回数が少ない人を優先してランダム抽選
 * 5. 1回の月間抽選で、1人は最大1試合のみ当選
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { periodId } = await request.json();

    const period = await prisma.applicationPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      return NextResponse.json(
        { error: "募集期間が見つかりません" },
        { status: 404 }
      );
    }

    if (period.isDrawn) {
      return NextResponse.json(
        { error: "既に抽選済みです" },
        { status: 400 }
      );
    }

    // この期間の全申込みを取得
    const applications = await prisma.application.findMany({
      where: { periodId },
      include: {
        employee: true,
        firstChoice: true,
        secondChoice: true,
        thirdChoice: true,
      },
    });

    if (applications.length === 0) {
      return NextResponse.json(
        { error: "申込みがありません" },
        { status: 400 }
      );
    }

    // 全体の当選履歴を取得（当選回数カウント用）
    const allWins = await prisma.lotteryResult.findMany();
    const winCountMap = new Map<number, number>();
    for (const win of allWins) {
      winCountMap.set(
        win.employeeId,
        (winCountMap.get(win.employeeId) || 0) + 1
      );
    }

    // 該当月の試合一覧
    const monthGames = await prisma.game.findMany({
      where: { month: period.month },
      orderBy: { date: "asc" },
    });

    // 試合ごとの希望者マップを構築
    // { gameId: [{ employeeId, priority }] }
    const gameApplicants = new Map<
      number,
      { employeeId: number; priority: number }[]
    >();

    for (const game of monthGames) {
      gameApplicants.set(game.id, []);
    }

    for (const app of applications) {
      gameApplicants.get(app.firstChoiceId)?.push({
        employeeId: app.employeeId,
        priority: 1,
      });
      if (app.secondChoiceId) {
        gameApplicants.get(app.secondChoiceId)?.push({
          employeeId: app.employeeId,
          priority: 2,
        });
      }
      if (app.thirdChoiceId) {
        gameApplicants.get(app.thirdChoiceId)?.push({
          employeeId: app.employeeId,
          priority: 3,
        });
      }
    }

    // 今回の抽選で当選した人（1人1試合まで）
    const winnersThisRound = new Set<number>();
    const lotteryResults: { gameId: number; employeeId: number; priority: number }[] = [];

    // 第1希望 → 第2希望 → 第3希望 の順に処理
    for (const targetPriority of [1, 2, 3]) {
      for (const game of monthGames) {
        // 既に当選者が決まっている試合はスキップ
        if (lotteryResults.some((r) => r.gameId === game.id)) continue;

        const applicants = gameApplicants.get(game.id) || [];

        // この希望順位で、まだ今回当選していない人を抽出
        const eligible = applicants.filter(
          (a) =>
            a.priority === targetPriority && !winnersThisRound.has(a.employeeId)
        );

        if (eligible.length === 0) continue;

        // 未当選者（過去に一度も当選していない人）と当選歴ありを分類
        const neverWon = eligible.filter(
          (a) => !winCountMap.has(a.employeeId)
        );
        const hasWon = eligible.filter((a) => winCountMap.has(a.employeeId));

        let winner: { employeeId: number; priority: number };

        if (neverWon.length > 0) {
          // 未当選者からランダム抽選
          winner = neverWon[Math.floor(Math.random() * neverWon.length)];
        } else {
          // 全員当選歴あり → 当選回数が少ない人を優先
          hasWon.sort(
            (a, b) =>
              (winCountMap.get(a.employeeId) || 0) -
              (winCountMap.get(b.employeeId) || 0)
          );
          const minWins = winCountMap.get(hasWon[0].employeeId) || 0;
          const leastWonGroup = hasWon.filter(
            (a) => (winCountMap.get(a.employeeId) || 0) === minWins
          );
          winner =
            leastWonGroup[Math.floor(Math.random() * leastWonGroup.length)];
        }

        winnersThisRound.add(winner.employeeId);
        lotteryResults.push({
          gameId: game.id,
          employeeId: winner.employeeId,
          priority: winner.priority,
        });

        // 当選回数を更新（以降の試合の抽選に反映）
        winCountMap.set(
          winner.employeeId,
          (winCountMap.get(winner.employeeId) || 0) + 1
        );
      }
    }

    // 結果をDBに保存
    for (const result of lotteryResults) {
      await prisma.lotteryResult.create({
        data: {
          gameId: result.gameId,
          employeeId: result.employeeId,
          priority: result.priority,
        },
      });
    }

    // 募集期間を抽選済みに更新
    await prisma.applicationPeriod.update({
      where: { id: periodId },
      data: { isDrawn: true, isOpen: false },
    });

    return NextResponse.json({
      message: "抽選が完了しました",
      results: lotteryResults,
    });
  } catch (error) {
    console.error("Lottery error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

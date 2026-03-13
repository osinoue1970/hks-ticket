import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 既存の申込みと結果をクリア
  await prisma.lotteryResult.deleteMany({});
  await prisma.application.deleteMany({});

  const games = await prisma.game.findMany({ where: { month: 4 }, orderBy: { date: "asc" } });
  const period = await prisma.applicationPeriod.findFirst({ where: { month: 4 } });
  if (!period) throw new Error("4月の募集期間がありません");

  const employees = await prisma.employee.findMany({ where: { isAdmin: false }, orderBy: { id: "asc" } });

  // 各職員がランダムに第1〜第3希望を申込み
  for (const emp of employees) {
    const shuffled = [...games].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, 3);
    await prisma.application.create({
      data: {
        employeeId: emp.id,
        periodId: period.id,
        firstChoiceId: picks[0].id,
        secondChoiceId: picks[1].id,
        thirdChoiceId: picks[2].id,
      },
    });
  }
  console.log(`申込み ${employees.length}件 作成完了`);

  // 抽選実行
  const applications = await prisma.application.findMany({
    where: { periodId: period.id },
    include: { employee: true, firstChoice: true, secondChoice: true, thirdChoice: true },
  });

  const winCountMap = new Map<number, number>();
  const winnersThisRound = new Set<number>();
  const results: { gameId: number; employeeId: number; priority: number }[] = [];
  const gameApplicants = new Map<number, { employeeId: number; priority: number }[]>();

  for (const g of games) gameApplicants.set(g.id, []);

  for (const app of applications) {
    gameApplicants.get(app.firstChoiceId)!.push({ employeeId: app.employeeId, priority: 1 });
    if (app.secondChoiceId) gameApplicants.get(app.secondChoiceId)!.push({ employeeId: app.employeeId, priority: 2 });
    if (app.thirdChoiceId) gameApplicants.get(app.thirdChoiceId)!.push({ employeeId: app.employeeId, priority: 3 });
  }

  for (const targetPriority of [1, 2, 3]) {
    for (const game of games) {
      if (results.some((r) => r.gameId === game.id)) continue;
      const applicants = gameApplicants.get(game.id) || [];
      const eligible = applicants.filter(
        (a) => a.priority === targetPriority && !winnersThisRound.has(a.employeeId)
      );
      if (eligible.length === 0) continue;

      const neverWon = eligible.filter((a) => !winCountMap.has(a.employeeId));
      const hasWon = eligible.filter((a) => winCountMap.has(a.employeeId));

      let winner: { employeeId: number; priority: number };
      if (neverWon.length > 0) {
        winner = neverWon[Math.floor(Math.random() * neverWon.length)];
      } else {
        hasWon.sort((a, b) => (winCountMap.get(a.employeeId) || 0) - (winCountMap.get(b.employeeId) || 0));
        const minWins = winCountMap.get(hasWon[0].employeeId) || 0;
        const least = hasWon.filter((a) => (winCountMap.get(a.employeeId) || 0) === minWins);
        winner = least[Math.floor(Math.random() * least.length)];
      }

      winnersThisRound.add(winner.employeeId);
      results.push({ gameId: game.id, employeeId: winner.employeeId, priority: winner.priority });
      winCountMap.set(winner.employeeId, (winCountMap.get(winner.employeeId) || 0) + 1);
    }
  }

  // DB保存
  for (const r of results) {
    await prisma.lotteryResult.create({ data: r });
  }
  await prisma.applicationPeriod.update({
    where: { id: period.id },
    data: { isDrawn: true, isOpen: false },
  });

  console.log(`\n抽選完了: ${results.length}試合の当選者を決定\n`);
  for (const r of results) {
    const emp = employees.find((e) => e.id === r.employeeId);
    const game = games.find((g) => g.id === r.gameId);
    if (emp && game) {
      const d = new Date(game.date);
      console.log(
        `${d.getMonth() + 1}/${d.getDate()} vs ${game.opponent} → ${emp.name} (第${r.priority}希望)`
      );
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

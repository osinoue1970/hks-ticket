import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import GameCalendar from "@/components/GameCalendar";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");

  const now = new Date();

  // 受付中の募集期間（日付に関係なく isOpen で判定）
  const openPeriods = await prisma.applicationPeriod.findMany({
    where: { isOpen: true },
    orderBy: { month: "asc" },
  });

  // 自分の申込み
  const myApplications = await prisma.application.findMany({
    where: { employeeId: session.id },
    include: {
      period: true,
      firstChoice: true,
      secondChoice: true,
      thirdChoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 自分の当選結果
  const myWins = await prisma.lotteryResult.findMany({
    where: { employeeId: session.id },
    include: { game: true },
    orderBy: { game: { date: "asc" } },
  });

  // 全試合日程（当選者情報・申込者数付き）
  const allGames = await prisma.game.findMany({
    orderBy: { date: "asc" },
    include: {
      result: { include: { employee: true } },
      firstChoiceApps: true,
      secondChoiceApps: true,
      thirdChoiceApps: true,
    },
  });

  // 募集期間を全て取得
  const allPeriods = await prisma.applicationPeriod.findMany({
    orderBy: { month: "asc" },
  });
  const periodByMonth = new Map(allPeriods.map((p) => [p.month, p]));

  // 月ごとにグループ化
  const gamesByMonth = new Map<number, typeof allGames>();
  for (const g of allGames) {
    if (!gamesByMonth.has(g.month)) gamesByMonth.set(g.month, []);
    gamesByMonth.get(g.month)!.push(g);
  }
  const sortedMonths = [...gamesByMonth.keys()].sort((a, b) => a - b);

  // 自分がまだ申し込んでいない募集期間
  const appliedPeriodIds = myApplications.map((a) => a.periodId);
  const availablePeriods = openPeriods.filter(
    (p) => !appliedPeriodIds.includes(p.id)
  );

  // 統計情報
  const totalResults = await prisma.lotteryResult.count();
  const myApplicationCount = await prisma.application.count({
    where: { employeeId: session.id },
  });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // 抽選結果発表日 = 受付終了日の翌日
  const getLotteryDate = (endDate: Date) => {
    const d = new Date(endDate);
    d.setDate(d.getDate() + 1);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={false} />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* サマリー */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 font-medium">今季の当選</p>
            <p className="text-3xl sm:text-4xl font-bold mt-1 sm:mt-2" style={{ color: "#006098" }}>{myWins.length}<span className="text-base sm:text-lg font-normal text-gray-400 ml-1">回</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 font-medium">申込み回数</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-1 sm:mt-2">{myApplicationCount}<span className="text-base sm:text-lg font-normal text-gray-400 ml-1">回</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 font-medium">全体の抽選済み</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-1 sm:mt-2">{totalResults}<span className="text-base sm:text-lg font-normal text-gray-400 ml-1">/ 72</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-400 font-medium">受付中の募集</p>
            <p className="text-3xl sm:text-4xl font-bold mt-1 sm:mt-2" style={{ color: "#4bbfd4" }}>{availablePeriods.length}<span className="text-base sm:text-lg font-normal text-gray-400 ml-1">件</span></p>
          </div>
        </section>

        {/* 受付中の募集 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            受付中の募集
          </h2>
          {availablePeriods.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-gray-500 text-center text-base">
              現在受付中の募集はありません
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availablePeriods.map((period) => (
                <Link
                  key={period.id}
                  href={`/dashboard/apply/${period.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border-l-4 border-blue-600"
                >
                  <h3 className="font-bold text-xl text-blue-800">
                    {period.year}年{period.month}月の試合
                  </h3>
                  <p className="text-base text-gray-500 mt-2">
                    締切: {formatDate(period.endDate)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    抽選結果発表: {getLotteryDate(period.endDate)}
                  </p>
                  <p className="text-blue-600 text-base mt-4 font-bold">
                    申し込む →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 申込み済み */}
        {myApplications.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              申込み済み
            </h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {myApplications.map((app) => (
                <div key={app.id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">
                      {app.period.year}年{app.period.month}月
                    </h3>
                    {app.period.isDrawn ? (
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                        抽選済み
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">
                        抽選待ち
                      </span>
                    )}
                  </div>
                  <div className="text-base text-gray-600 space-y-2">
                    <p>
                      <span className="inline-block w-20 text-blue-600 font-bold">第1希望</span>
                      {formatDate(app.firstChoice.date)} ({app.firstChoice.dayOfWeek}) vs {app.firstChoice.opponent}
                    </p>
                    {app.secondChoice && (
                      <p>
                        <span className="inline-block w-20 text-green-600 font-bold">第2希望</span>
                        {formatDate(app.secondChoice.date)} ({app.secondChoice.dayOfWeek}) vs {app.secondChoice.opponent}
                      </p>
                    )}
                    {app.thirdChoice && (
                      <p>
                        <span className="inline-block w-20 text-orange-600 font-bold">第3希望</span>
                        {formatDate(app.thirdChoice.date)} ({app.thirdChoice.dayOfWeek}) vs {app.thirdChoice.opponent}
                      </p>
                    )}
                  </div>
                  {!app.period.isDrawn && (
                    <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">
                      抽選結果発表予定: <strong>{getLotteryDate(app.period.endDate)}</strong>（受付締切: {formatDate(app.period.endDate)}）
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 当選履歴 */}
        {myWins.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">あなたの当選</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {myWins.map((win) => (
                <div
                  key={win.id}
                  className="p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {formatDate(win.game.date)} ({win.game.dayOfWeek})
                    </p>
                    <p className="text-base text-gray-500">
                      vs {win.game.opponent} {win.game.startTime}開始
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-4 py-1.5 rounded-full">
                    第{win.priority}希望で当選
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 今シーズン試合日程（カレンダー） */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            2026シーズン ホームゲーム日程
          </h2>
          <div className="space-y-6">
            {sortedMonths.map((month) => {
              const monthGames = gamesByMonth.get(month)!;
              const period = periodByMonth.get(month);

              const calendarGames = monthGames.map((g) => ({
                id: g.id,
                date: g.date.toISOString(),
                dayOfWeek: g.dayOfWeek,
                opponent: g.opponent,
                startTime: g.startTime,
                month: g.month,
                winner: g.result?.employee.name ?? null,
                isMyWin: g.result?.employeeId === session.id,
                applicantCount: g.firstChoiceApps.length + g.secondChoiceApps.length + g.thirdChoiceApps.length,
              }));

              const calendarPeriod = period
                ? {
                    id: period.id,
                    isOpen: period.isOpen,
                    isDrawn: period.isDrawn,
                    startDate: period.startDate.toISOString(),
                    endDate: period.endDate.toISOString(),
                  }
                : null;

              return (
                <GameCalendar
                  key={month}
                  year={2026}
                  month={month}
                  games={calendarGames}
                  period={calendarPeriod}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

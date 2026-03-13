import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.isAdmin) redirect("/admin");

  const now = new Date();

  // 受付中の募集期間
  const openPeriods = await prisma.applicationPeriod.findMany({
    where: { isOpen: true, endDate: { gte: now } },
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

  // 自分がまだ申し込んでいない募集期間
  const appliedPeriodIds = myApplications.map((a) => a.periodId);
  const availablePeriods = openPeriods.filter(
    (p) => !appliedPeriodIds.includes(p.id)
  );

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={false} />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 受付中の募集 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            受付中の募集
          </h2>
          {availablePeriods.length === 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm text-gray-500 text-center">
              現在受付中の募集はありません
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availablePeriods.map((period) => (
                <Link
                  key={period.id}
                  href={`/dashboard/apply/${period.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border-l-4 border-blue-600"
                >
                  <h3 className="font-bold text-lg text-blue-800">
                    {period.year}年{period.month}月の試合
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    締切: {formatDate(period.endDate)}
                  </p>
                  <p className="text-blue-600 text-sm mt-3 font-medium">
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
                <div key={app.id} className="p-4">
                  <h3 className="font-medium text-gray-800">
                    {app.period.year}年{app.period.month}月
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>
                      第1希望: {formatDate(app.firstChoice.date)} (
                      {app.firstChoice.dayOfWeek}) vs {app.firstChoice.opponent}
                    </p>
                    {app.secondChoice && (
                      <p>
                        第2希望: {formatDate(app.secondChoice.date)} (
                        {app.secondChoice.dayOfWeek}) vs{" "}
                        {app.secondChoice.opponent}
                      </p>
                    )}
                    {app.thirdChoice && (
                      <p>
                        第3希望: {formatDate(app.thirdChoice.date)} (
                        {app.thirdChoice.dayOfWeek}) vs{" "}
                        {app.thirdChoice.opponent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 当選履歴 */}
        {myWins.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">当選履歴</h2>
            <div className="bg-white rounded-xl shadow-sm divide-y">
              {myWins.map((win) => (
                <div
                  key={win.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatDate(win.game.date)} ({win.game.dayOfWeek})
                    </p>
                    <p className="text-sm text-gray-500">
                      vs {win.game.opponent} {win.game.startTime}開始
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    第{win.priority}希望で当選
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

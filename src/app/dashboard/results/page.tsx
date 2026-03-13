import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // 自分の当選
  const myWins = await prisma.lotteryResult.findMany({
    where: { employeeId: session.id },
    include: { game: true },
    orderBy: { game: { date: "asc" } },
  });

  // 全当選結果（月ごとにまとめる）
  const allResults = await prisma.lotteryResult.findMany({
    include: { game: true, employee: true },
    orderBy: { game: { date: "asc" } },
  });

  // 月ごとにグループ化
  const resultsByMonth = new Map<number, typeof allResults>();
  for (const r of allResults) {
    const month = r.game.month;
    if (!resultsByMonth.has(month)) resultsByMonth.set(month, []);
    resultsByMonth.get(month)!.push(r);
  }
  const sortedMonths = [...resultsByMonth.keys()].sort((a, b) => a - b);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={session.isAdmin} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-xl font-bold text-gray-800">抽選結果</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">あなたの当選回数</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {myWins.length}回
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">全体の当選数</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {allResults.length}回
            </p>
          </div>
        </div>

        {/* 自分の当選 */}
        {myWins.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              あなたの当選
            </h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-blue-600">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-700">日付</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-700">対戦相手</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-700">開始時間</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-blue-700">希望順位</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myWins.map((win) => (
                    <tr key={win.id}>
                      <td className="px-4 py-3">{formatDate(win.game.date)} ({win.game.dayOfWeek})</td>
                      <td className="px-4 py-3">vs {win.game.opponent}</td>
                      <td className="px-4 py-3">{win.game.startTime}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                          第{win.priority}希望
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 全員の当選結果（月別） */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-3">
            全員の抽選結果
          </h3>
          {sortedMonths.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500">
              まだ抽選結果はありません
            </div>
          ) : (
            sortedMonths.map((month) => {
              const monthResults = resultsByMonth.get(month)!;
              return (
                <div key={month} className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-bold text-gray-700">{month}月</h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">日付</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">対戦相手</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">開始</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">当選者</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {monthResults.map((r) => {
                        const isMe = r.employeeId === session.id;
                        return (
                          <tr key={r.id} className={isMe ? "bg-blue-50" : ""}>
                            <td className="px-4 py-2 text-sm">
                              {formatDate(r.game.date)} ({r.game.dayOfWeek})
                            </td>
                            <td className="px-4 py-2 text-sm">vs {r.game.opponent}</td>
                            <td className="px-4 py-2 text-sm">{r.game.startTime}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={isMe ? "font-bold text-blue-700" : "text-gray-700"}>
                                {r.employee.name}
                              </span>
                              {isMe && (
                                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                  あなた
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

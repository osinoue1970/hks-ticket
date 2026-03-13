import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const myWins = await prisma.lotteryResult.findMany({
    where: { employeeId: session.id },
    include: { game: true },
    orderBy: { game: { date: "asc" } },
  });

  const totalWins = await prisma.lotteryResult.count();
  const allEmployeeWins = await prisma.lotteryResult.groupBy({
    by: ["employeeId"],
    _count: true,
    orderBy: { _count: { employeeId: "desc" } },
  });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={session.isAdmin} />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-xl font-bold text-gray-800">当選履歴</h2>

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
              {totalWins}回
            </p>
          </div>
        </div>

        {myWins.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    対戦相手
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    開始時間
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    希望順位
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {myWins.map((win) => (
                  <tr key={win.id}>
                    <td className="px-4 py-3">
                      {formatDate(win.game.date)} ({win.game.dayOfWeek})
                    </td>
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
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center text-gray-500">
            まだ当選履歴はありません
          </div>
        )}
      </main>
    </div>
  );
}

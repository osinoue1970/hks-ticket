"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Period = {
  id: number;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  isDrawn: boolean;
  applicationCount: number;
};

type Game = {
  id: number;
  date: string;
  dayOfWeek: string;
  opponent: string;
  startTime: string;
  month: number;
};

type Result = {
  id: number;
  gameId: number;
  gameDate: string;
  gameDayOfWeek: string;
  opponent: string;
  employeeName: string;
  employeeNo: string;
  priority: number;
};

export default function PeriodManager({
  periods,
  games,
  results,
}: {
  periods: Period[];
  games: Game[];
  results: Result[];
}) {
  const router = useRouter();
  const [lotteryLoading, setLotteryLoading] = useState<number | null>(null);
  const [lotteryMessage, setLotteryMessage] = useState("");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const toggleOpen = async (periodId: number, isOpen: boolean) => {
    await fetch(`/api/periods/${periodId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    router.refresh();
  };

  const runLottery = async (periodId: number) => {
    if (!confirm("抽選を実行しますか？この操作は取り消せません。")) return;
    setLotteryLoading(periodId);
    setLotteryMessage("");

    try {
      const res = await fetch("/api/lottery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId }),
      });

      const data = await res.json();
      if (res.ok) {
        setLotteryMessage(`抽選完了: ${data.results.length}試合の当選者を決定しました`);
        router.refresh();
      } else {
        setLotteryMessage(`エラー: ${data.error}`);
      }
    } catch {
      setLotteryMessage("通信エラーが発生しました");
    } finally {
      setLotteryLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {lotteryMessage && (
        <div
          className={`p-4 rounded-lg text-sm ${
            lotteryMessage.startsWith("エラー")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {lotteryMessage}
        </div>
      )}

      {periods.map((period) => {
        const monthGames = games.filter((g) => g.month === period.month);
        const monthResults = results.filter((r) =>
          monthGames.some((g) => g.id === r.gameId)
        );

        return (
          <div key={period.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {period.year}年{period.month}月
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  受付期間: {formatDate(period.startDate)} 〜{" "}
                  {formatDate(period.endDate)} | 申込み: {period.applicationCount}件
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleOpen(period.id, period.isOpen)}
                  className={`text-sm px-4 py-2 rounded-lg transition ${
                    period.isOpen
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {period.isOpen ? "受付停止" : "受付開始"}
                </button>
                {!period.isDrawn && period.applicationCount > 0 && (
                  <button
                    onClick={() => runLottery(period.id)}
                    disabled={lotteryLoading === period.id}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {lotteryLoading === period.id
                      ? "抽選中..."
                      : "抽選実行"}
                  </button>
                )}
                {period.isDrawn && (
                  <span className="bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-lg">
                    抽選済み
                  </span>
                )}
              </div>
            </div>

            {/* 試合一覧と結果 */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    日付
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    対戦相手
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    開始
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    当選者
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {monthGames.map((game) => {
                  const result = monthResults.find(
                    (r) => r.gameId === game.id
                  );
                  return (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {formatDate(game.date)} ({game.dayOfWeek})
                      </td>
                      <td className="px-4 py-2 text-sm">{game.opponent}</td>
                      <td className="px-4 py-2 text-sm">{game.startTime}</td>
                      <td className="px-4 py-2 text-sm">
                        {result ? (
                          <span className="text-green-700 font-medium">
                            {result.employeeName} ({result.employeeNo}) - 第
                            {result.priority}希望
                          </span>
                        ) : period.isDrawn ? (
                          <span className="text-gray-400">応募なし</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

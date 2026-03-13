"use client";

import { useRouter } from "next/navigation";

type Game = {
  id: number;
  date: string;
  dayOfWeek: string;
  opponent: string;
  startTime: string;
  month: number;
  winner?: string | null;
  isMyWin?: boolean;
};

type Period = {
  id?: number;
  isOpen: boolean;
  isDrawn: boolean;
  startDate: string;
  endDate: string;
} | null;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function GameCalendar({
  year,
  month,
  games,
  period,
}: {
  year: number;
  month: number;
  games: Game[];
  period: Period;
}) {
  const router = useRouter();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  const gameByDay = new Map<number, Game>();
  for (const g of games) {
    const d = new Date(g.date);
    gameByDay.set(d.getDate(), g);
  }

  const formatPeriodDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canApply = period?.isOpen && !period?.isDrawn;

  const handleDoubleClick = () => {
    if (canApply && period?.id) {
      router.push(`/dashboard/apply/${period.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div
        className="px-4 sm:px-5 py-3 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        style={{ background: "linear-gradient(90deg, #003050, #006098)" }}
      >
        <div>
          <h3 className="font-bold text-white text-lg sm:text-xl">
            {year}年{month}月
            <span className="ml-2 text-sm sm:text-base font-normal text-blue-200">
              {games.length}試合
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {period ? (
            <>
              {period.isDrawn ? (
                <span className="bg-white/20 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full">
                  抽選済み
                </span>
              ) : period.isOpen ? (
                <span className="bg-green-400/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full animate-pulse">
                  受付中
                </span>
              ) : (
                <span className="bg-white/20 text-blue-200 text-xs sm:text-sm px-3 py-1 rounded-full">
                  受付前
                </span>
              )}
              <span className="text-blue-200 text-xs sm:text-sm">
                受付: {formatPeriodDate(period.startDate)}〜{formatPeriodDate(period.endDate)}
              </span>
            </>
          ) : (
            <span className="bg-white/10 text-blue-300 text-xs sm:text-sm px-3 py-1 rounded-full">
              募集未設定
            </span>
          )}
        </div>
      </div>

      {canApply && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2 text-xs sm:text-sm text-green-700">
          試合日をタップ（またはダブルクリック）して申込みへ
        </div>
      )}

      {/* --- モバイル: リスト表示 --- */}
      <div className="sm:hidden divide-y">
        {games.map((game) => {
          const d = new Date(game.date);
          const day = d.getDate();
          return (
            <div
              key={game.id}
              onClick={() => canApply && handleDoubleClick()}
              className={`px-4 py-3 flex items-center gap-3 ${
                game.isMyWin ? "bg-blue-50" : canApply ? "active:bg-amber-50" : ""
              }`}
            >
              <div className="text-center shrink-0 w-12">
                <div className="text-2xl font-bold text-gray-700">{day}</div>
                <div className="text-xs text-gray-400">{game.dayOfWeek}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-gray-800">
                  vs {game.opponent}
                </div>
                <div className="text-sm text-gray-400">{game.startTime}開始</div>
              </div>
              {game.winner && (
                <div className="shrink-0 text-right">
                  {game.isMyWin ? (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      あなた
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">{game.winner}</span>
                  )}
                </div>
              )}
              {canApply && !game.winner && (
                <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* --- デスクトップ: カレンダー表示 --- */}
      <div className="hidden sm:block">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {weekdays.map((wd, i) => (
            <div
              key={wd}
              className={`text-center text-sm font-bold py-2.5 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const game = day ? gameByDay.get(day) : null;
            const dayOfWeek = idx % 7;
            const isSun = dayOfWeek === 0;
            const isSat = dayOfWeek === 6;

            return (
              <div
                key={idx}
                onDoubleClick={() => game && handleDoubleClick()}
                className={`min-h-[100px] border-b border-r p-2 transition ${
                  day === null
                    ? "bg-gray-50/50"
                    : game
                    ? game.isMyWin
                      ? "bg-blue-50"
                      : canApply
                      ? "bg-white hover:bg-amber-50 cursor-pointer"
                      : "bg-white"
                    : "bg-white"
                } ${idx % 7 === 6 ? "border-r-0" : ""}`}
              >
                {day !== null && (
                  <>
                    <div
                      className={`text-sm font-bold mb-1 ${
                        isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-gray-400"
                      }`}
                    >
                      {day}
                    </div>
                    {game && (
                      <div
                        className={`rounded-lg p-2 ${
                          game.isMyWin
                            ? "bg-blue-600 text-white"
                            : game.winner
                            ? "bg-gray-100 text-gray-700"
                            : "bg-amber-50 border border-amber-200 text-gray-700"
                        }`}
                      >
                        <div className="font-bold text-sm leading-tight">
                          vs {game.opponent}
                        </div>
                        <div className={`mt-0.5 text-sm ${game.isMyWin ? "text-blue-100" : "text-gray-400"}`}>
                          {game.startTime}〜
                        </div>
                        {game.winner && (
                          <div className={`mt-1 text-xs truncate font-medium ${game.isMyWin ? "text-white" : "text-green-600"}`}>
                            {game.isMyWin ? "★ あなた" : game.winner}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

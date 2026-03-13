"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Game = {
  id: number;
  date: string;
  dayOfWeek: string;
  opponent: string;
  startTime: string;
};

export default function ApplyForm({
  games,
  periodId,
}: {
  games: Game[];
  periodId: number;
}) {
  const router = useRouter();
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [thirdChoice, setThirdChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const handleSubmit = async () => {
    if (!firstChoice) {
      setError("第1希望を選択してください");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          firstChoiceId: firstChoice,
          secondChoiceId: secondChoice,
          thirdChoiceId: thirdChoice,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "申込みに失敗しました");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (gameId: number) =>
    gameId === firstChoice || gameId === secondChoice || gameId === thirdChoice;

  const getSelectionLabel = (gameId: number) => {
    if (gameId === firstChoice) return "第1希望";
    if (gameId === secondChoice) return "第2希望";
    if (gameId === thirdChoice) return "第3希望";
    return null;
  };

  const handleSelect = (gameId: number) => {
    if (gameId === firstChoice) { setFirstChoice(null); return; }
    if (gameId === secondChoice) { setSecondChoice(null); return; }
    if (gameId === thirdChoice) { setThirdChoice(null); return; }
    if (!firstChoice) setFirstChoice(gameId);
    else if (!secondChoice) setSecondChoice(gameId);
    else if (!thirdChoice) setThirdChoice(gameId);
  };

  return (
    <div>
      {/* 選択状態 */}
      <div className="mb-5 flex flex-col sm:flex-row gap-2 sm:gap-3 text-sm">
        <span className="bg-blue-100 text-blue-700 px-3 py-2 sm:py-1 rounded-lg sm:rounded-full font-medium">
          第1希望: {firstChoice ? games.find((g) => g.id === firstChoice)?.opponent : "未選択"}
        </span>
        <span className="bg-green-100 text-green-700 px-3 py-2 sm:py-1 rounded-lg sm:rounded-full font-medium">
          第2希望: {secondChoice ? games.find((g) => g.id === secondChoice)?.opponent : "未選択"}
        </span>
        <span className="bg-orange-100 text-orange-700 px-3 py-2 sm:py-1 rounded-lg sm:rounded-full font-medium">
          第3希望: {thirdChoice ? games.find((g) => g.id === thirdChoice)?.opponent : "未選択"}
        </span>
      </div>

      {/* 試合一覧 */}
      <div className="grid gap-2 sm:gap-3">
        {games.map((game) => {
          const selected = isSelected(game.id);
          const label = getSelectionLabel(game.id);

          return (
            <button
              key={game.id}
              onClick={() => handleSelect(game.id)}
              className={`p-3 sm:p-4 rounded-xl border-2 text-left transition ${
                selected
                  ? label === "第1希望"
                    ? "border-blue-500 bg-blue-50"
                    : label === "第2希望"
                    ? "border-green-500 bg-green-50"
                    : "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300 active:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 text-base">
                    {formatDate(game.date)} ({game.dayOfWeek})
                    <span className="ml-2 font-bold">vs {game.opponent}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {game.startTime}開始
                  </div>
                </div>
                {label && (
                  <span
                    className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${
                      label === "第1希望"
                        ? "bg-blue-600 text-white"
                        : label === "第2希望"
                        ? "bg-green-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-base">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={!firstChoice || loading}
          className="text-white font-bold text-base px-8 py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{ background: "linear-gradient(135deg, #006098, #4bbfd4)" }}
        >
          {loading ? "送信中..." : "申し込む"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-3.5 rounded-xl transition"
        >
          戻る
        </button>
      </div>
    </div>
  );
}

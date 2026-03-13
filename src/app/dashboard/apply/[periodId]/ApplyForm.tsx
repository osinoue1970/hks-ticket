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
    gameId === firstChoice ||
    gameId === secondChoice ||
    gameId === thirdChoice;

  const getSelectionLabel = (gameId: number) => {
    if (gameId === firstChoice) return "第1希望";
    if (gameId === secondChoice) return "第2希望";
    if (gameId === thirdChoice) return "第3希望";
    return null;
  };

  const handleSelect = (gameId: number) => {
    if (gameId === firstChoice) {
      setFirstChoice(null);
      return;
    }
    if (gameId === secondChoice) {
      setSecondChoice(null);
      return;
    }
    if (gameId === thirdChoice) {
      setThirdChoice(null);
      return;
    }

    if (!firstChoice) {
      setFirstChoice(gameId);
    } else if (!secondChoice) {
      setSecondChoice(gameId);
    } else if (!thirdChoice) {
      setThirdChoice(gameId);
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-3 text-sm">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          第1希望:{" "}
          {firstChoice
            ? games.find((g) => g.id === firstChoice)?.opponent
            : "未選択"}
        </span>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
          第2希望:{" "}
          {secondChoice
            ? games.find((g) => g.id === secondChoice)?.opponent
            : "未選択"}
        </span>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
          第3希望:{" "}
          {thirdChoice
            ? games.find((g) => g.id === thirdChoice)?.opponent
            : "未選択"}
        </span>
      </div>

      <div className="grid gap-3">
        {games.map((game) => {
          const selected = isSelected(game.id);
          const label = getSelectionLabel(game.id);

          return (
            <button
              key={game.id}
              onClick={() => handleSelect(game.id)}
              className={`p-4 rounded-xl border-2 text-left transition ${
                selected
                  ? label === "第1希望"
                    ? "border-blue-500 bg-blue-50"
                    : label === "第2希望"
                    ? "border-green-500 bg-green-50"
                    : "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-800">
                    {formatDate(game.date)} ({game.dayOfWeek})
                  </span>
                  <span className="ml-3 text-gray-600">
                    vs {game.opponent}
                  </span>
                  <span className="ml-3 text-sm text-gray-400">
                    {game.startTime}開始
                  </span>
                </div>
                {label && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
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
        <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!firstChoice || loading}
          className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "送信中..." : "申し込む"}
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition"
        >
          戻る
        </button>
      </div>
    </div>
  );
}

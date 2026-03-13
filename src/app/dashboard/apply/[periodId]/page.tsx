import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import ApplyForm from "./ApplyForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ periodId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { periodId } = await params;
  const period = await prisma.applicationPeriod.findUnique({
    where: { id: parseInt(periodId) },
  });

  if (!period || !period.isOpen) {
    redirect("/dashboard");
  }

  // 既に申込み済みか確認
  const existing = await prisma.application.findUnique({
    where: {
      employeeId_periodId: {
        employeeId: session.id,
        periodId: period.id,
      },
    },
  });

  if (existing) {
    redirect("/dashboard");
  }

  // 該当月の試合一覧
  const games = await prisma.game.findMany({
    where: { month: period.month },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={false} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {period.year}年{period.month}月 試合申込み
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          第1希望〜第3希望を選択してください（第2・第3は任意）
        </p>
        <ApplyForm
          games={games.map((g) => ({
            id: g.id,
            date: g.date.toISOString(),
            dayOfWeek: g.dayOfWeek,
            opponent: g.opponent,
            startTime: g.startTime,
          }))}
          periodId={period.id}
        />
      </main>
    </div>
  );
}

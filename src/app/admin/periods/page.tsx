import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import PeriodManager from "./PeriodManager";

export default async function PeriodsPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!session.isAdmin) redirect("/dashboard");

  const periods = await prisma.applicationPeriod.findMany({
    orderBy: { month: "asc" },
    include: {
      _count: { select: { applications: true } },
      applications: {
        include: { employee: true, firstChoice: true, secondChoice: true, thirdChoice: true },
      },
    },
  });

  const games = await prisma.game.findMany({ orderBy: { date: "asc" } });

  const results = await prisma.lotteryResult.findMany({
    include: { game: true, employee: true },
    orderBy: { game: { date: "asc" } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={true} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          募集・抽選管理
        </h2>
        <PeriodManager
          periods={periods.map((p) => ({
            id: p.id,
            year: p.year,
            month: p.month,
            startDate: p.startDate.toISOString(),
            endDate: p.endDate.toISOString(),
            isOpen: p.isOpen,
            isDrawn: p.isDrawn,
            applicationCount: p._count.applications,
          }))}
          games={games.map((g) => ({
            id: g.id,
            date: g.date.toISOString(),
            dayOfWeek: g.dayOfWeek,
            opponent: g.opponent,
            startTime: g.startTime,
            month: g.month,
          }))}
          results={results.map((r) => ({
            id: r.id,
            gameId: r.gameId,
            gameDate: r.game.date.toISOString(),
            gameDayOfWeek: r.game.dayOfWeek,
            opponent: r.game.opponent,
            employeeName: r.employee.name,
            employeeNo: r.employee.employeeNo,
            priority: r.priority,
          }))}
        />
      </main>
    </div>
  );
}

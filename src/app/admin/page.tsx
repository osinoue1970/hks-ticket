import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!session.isAdmin) redirect("/dashboard");

  const employeeCount = await prisma.employee.count({
    where: { isAdmin: false },
  });
  const gameCount = await prisma.game.count();
  const applicationCount = await prisma.application.count();
  const resultCount = await prisma.lotteryResult.count();

  const periods = await prisma.applicationPeriod.findMany({
    orderBy: { month: "asc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={true} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* 概要 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "職員数", value: employeeCount, color: "blue" },
            { label: "試合数", value: gameCount, color: "green" },
            { label: "申込み数", value: applicationCount, color: "orange" },
            { label: "当選数", value: resultCount, color: "purple" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/employees"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-bold text-lg text-gray-800">職員管理</h3>
            <p className="text-sm text-gray-500 mt-1">
              職員の追加・編集・削除
            </p>
          </Link>
          <Link
            href="/admin/periods"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >
            <h3 className="font-bold text-lg text-gray-800">募集・抽選管理</h3>
            <p className="text-sm text-gray-500 mt-1">
              募集期間の管理・抽選実行
            </p>
          </Link>
        </div>

        {/* 募集状況 */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">募集状況</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-500">月</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-500">受付</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-500">申込み</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-500">抽選</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 sm:px-4 py-3 font-medium text-sm">{p.month}月</td>
                    <td className="px-3 sm:px-4 py-3">
                      {p.isOpen ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">受付中</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">停止</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm">{p._count.applications}件</td>
                    <td className="px-3 sm:px-4 py-3">
                      {p.isDrawn ? (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">済み</span>
                      ) : (
                        <span className="text-gray-400 text-xs">未実施</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import EmployeeManager from "./EmployeeManager";

export default async function EmployeesPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (!session.isAdmin) redirect("/dashboard");

  const employees = await prisma.employee.findMany({
    where: { isAdmin: false },
    orderBy: { employeeNo: "asc" },
    include: {
      _count: { select: { wins: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={true} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">職員管理</h2>
        <EmployeeManager
          employees={employees.map((e) => ({
            id: e.id,
            employeeNo: e.employeeNo,
            name: e.name,
            email: e.email,
            winCount: e._count.wins,
          }))}
        />
      </main>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function Header({
  name,
  isAdmin,
}: {
  name: string;
  isAdmin: boolean;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚾</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              シーズンシート抽選
            </h1>
            <p className="text-blue-200 text-xs">
              北海道日本ハムファイターズ 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <nav className="flex gap-2 text-sm">
              <a
                href="/admin"
                className="hover:text-blue-200 px-2 py-1 rounded transition"
              >
                ダッシュボード
              </a>
              <a
                href="/admin/employees"
                className="hover:text-blue-200 px-2 py-1 rounded transition"
              >
                職員管理
              </a>
              <a
                href="/admin/periods"
                className="hover:text-blue-200 px-2 py-1 rounded transition"
              >
                募集管理
              </a>
            </nav>
          )}
          {!isAdmin && (
            <nav className="flex gap-2 text-sm">
              <a
                href="/dashboard"
                className="hover:text-blue-200 px-2 py-1 rounded transition"
              >
                ホーム
              </a>
              <a
                href="/dashboard/results"
                className="hover:text-blue-200 px-2 py-1 rounded transition"
              >
                当選履歴
              </a>
            </nav>
          )}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-700">
            <span className="text-sm text-blue-200">{name}</span>
            <button
              onClick={handleLogout}
              className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded transition"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Header({
  name,
  isAdmin,
}: {
  name: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navLinks = isAdmin
    ? [
        { href: "/admin", label: "ダッシュボード" },
        { href: "/admin/employees", label: "職員管理" },
        { href: "/admin/periods", label: "募集管理" },
      ]
    : [
        { href: "/dashboard", label: "ホーム" },
        { href: "/dashboard/results", label: "抽選結果" },
        { href: "/dashboard/rules", label: "ルール" },
      ];

  return (
    <header
      className="text-white shadow-lg"
      style={{ background: "linear-gradient(90deg, #003050, #006098, #2a8ab5)" }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* メインバー */}
        <div className="flex items-center justify-between">
          <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="bg-white/10 rounded-lg p-1 sm:p-1.5">
                <Image
                  src="/images/hkcs-logo.png"
                  alt="HK信保"
                  width={100}
                  height={32}
                  className="h-5 sm:h-7 w-auto brightness-0 invert"
                />
              </div>
              <Image
                src="/images/fighters-logo.svg"
                alt="ファイターズ"
                width={100}
                height={32}
                className="h-5 sm:h-7 w-auto brightness-0 invert"
              />
            </div>
            <div className="border-l border-white/20 pl-2 sm:pl-4 hidden sm:block">
              <h1 className="font-bold text-sm sm:text-base leading-tight">
                シーズンシート抽選
              </h1>
              <p className="text-white/60 text-[10px] sm:text-[11px]">
                エスコンフィールド 2026
              </p>
            </div>
          </Link>

          {/* デスクトップナビ */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex gap-1 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <span className="text-sm text-white/80">{name}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
              >
                ログアウト
              </button>
            </div>
          </div>

          {/* モバイルハンバーガー */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* モバイルメニュー */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/20">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:bg-white/10 px-3 py-2.5 rounded-lg transition text-base"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
              <span className="text-sm text-white/80">{name}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

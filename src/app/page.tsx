"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [employeeNo, setEmployeeNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeNo, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ログインに失敗しました");
        return;
      }

      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #003050 0%, #006098 40%, #2a8ab5 70%, #4bbfd4 100%)" }}
    >
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 0%, transparent 50%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* ロゴエリア */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <Image
                src="/images/hkcs-logo.png"
                alt="北海道建設業信用保証株式会社"
                width={160}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <span className="text-white/60 text-3xl font-extralight">×</span>
            <div>
              <Image
                src="/images/fighters-logo.svg"
                alt="北海道日本ハムファイターズ"
                width={160}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            シーズンシート抽選システム
          </h1>
          <p className="text-white/70 text-lg mt-3">
            エスコンフィールドHOKKAIDO 2026シーズン
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-xl font-bold text-gray-700 text-center mb-6">ログイン</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                職員番号
              </label>
              <input
                type="text"
                value={employeeNo}
                onChange={(e) => setEmployeeNo(e.target.value)}
                placeholder="例: E001"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006098] focus:border-transparent outline-none transition bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#006098] focus:border-transparent outline-none transition bg-gray-50"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold text-lg py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #006098, #4bbfd4)" }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-400 text-center">
            テスト: 管理者 ADMIN / admin123 ｜ 職員 E001〜E070 / password
          </div>
        </div>

        <p className="text-center text-white/40 text-sm mt-8">
          北海道建設業信用保証株式会社 福利厚生システム
        </p>
      </div>
    </div>
  );
}

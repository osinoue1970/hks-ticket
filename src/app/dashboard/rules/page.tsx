import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Header from "@/components/Header";

export default async function RulesPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header name={session.name} isAdmin={session.isAdmin} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          シーズンシート抽選ルール
        </h2>

        <div className="space-y-6">
          {/* 概要 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              概要
            </h3>
            <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
              <p>
                福利厚生の一環として、北海道日本ハムファイターズの<strong>シーズンシート（1席）</strong>を
                職員の皆様にご利用いただけます。
              </p>
              <p>
                対象試合は<strong>エスコンフィールドHOKKAIDO</strong>で開催される
                2026年シーズンのホームゲーム<strong>全72試合</strong>です。
              </p>
            </div>
          </section>

          {/* 募集 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              募集について
            </h3>
            <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
              <p>募集は<strong>月単位</strong>で行います（翌月分の試合を前月に募集）。</p>
              <p>募集開始・締切はシステム上でお知らせします。</p>
              <p>各募集期間中に<strong>1回</strong>申込みができます。</p>
            </div>
          </section>

          {/* 申込み */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              申込み方法
            </h3>
            <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
              <p>
                1回の申込みで<strong>第1希望〜第3希望</strong>まで選択できます。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-blue-600">第1希望</strong>：必須（最も行きたい試合）</li>
                <li><strong className="text-green-600">第2希望</strong>：任意</li>
                <li><strong className="text-orange-600">第3希望</strong>：任意</li>
              </ul>
              <p className="text-gray-500">※ 同じ試合を複数の希望に選択することはできません。</p>
            </div>
          </section>

          {/* 抽選 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">4</span>
              抽選ルール
            </h3>
            <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
              <p>締切後、管理者が抽選を実行し、各試合に<strong>1名</strong>の当選者を決定します。</p>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="font-bold text-blue-800 mb-2">抽選の優先順位</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>第1希望 → 第2希望 → 第3希望 の順に処理されます</li>
                  <li>
                    同じ試合に複数の応募がある場合、<strong>まだ一度も当選したことがない人</strong>が優先されます
                  </li>
                  <li>
                    全員が当選経験者の場合は、<strong>当選回数が少ない人</strong>が優先されます
                  </li>
                  <li>それでも同条件の場合は<strong>ランダム抽選</strong>となります</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="font-bold text-amber-800 mb-1">1人1試合まで</p>
                <p>1回の月間抽選で、1人が当選できるのは<strong>最大1試合</strong>です。</p>
              </div>
            </div>
          </section>

          {/* 結果 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">5</span>
              結果発表
            </h3>
            <div className="text-gray-700 space-y-2 text-sm leading-relaxed">
              <p>抽選結果は、受付締切の翌日を目安にシステム上で公開されます。</p>
              <p>ダッシュボードおよび「抽選結果」ページから確認できます。</p>
              <p>当選結果は<strong>全職員に公開</strong>されます。</p>
            </div>
          </section>

          {/* 注意事項 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">6</span>
              注意事項
            </h3>
            <ul className="text-gray-700 space-y-2 text-sm leading-relaxed list-disc list-inside">
              <li>当選後のキャンセル・譲渡は原則できません。やむを得ない場合は管理者にご連絡ください。</li>
              <li>シーズンシートは1席です。同伴者のチケットは含まれません。</li>
              <li>応募がなかった試合のチケットについては、別途案内する場合があります。</li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          ご不明な点は管理者までお問い合わせください。
        </div>
      </main>
    </div>
  );
}

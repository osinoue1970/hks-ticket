import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const games = [
  // 3月
  { date: "2026-03-31", dayOfWeek: "火", opponent: "千葉ロッテ", startTime: "18:00", month: 3 },
  // 4月
  { date: "2026-04-01", dayOfWeek: "水", opponent: "オリックス", startTime: "18:30", month: 4 },
  { date: "2026-04-02", dayOfWeek: "木", opponent: "オリックス", startTime: "18:00", month: 4 },
  { date: "2026-04-03", dayOfWeek: "金", opponent: "オリックス", startTime: "18:00", month: 4 },
  { date: "2026-04-04", dayOfWeek: "土", opponent: "オリックス", startTime: "14:00", month: 4 },
  { date: "2026-04-05", dayOfWeek: "日", opponent: "オリックス", startTime: "13:00", month: 4 },
  { date: "2026-04-11", dayOfWeek: "土", opponent: "横浜DeNA", startTime: "14:00", month: 4 },
  { date: "2026-04-12", dayOfWeek: "日", opponent: "横浜DeNA", startTime: "13:00", month: 4 },
  { date: "2026-04-17", dayOfWeek: "金", opponent: "中日", startTime: "18:00", month: 4 },
  { date: "2026-04-18", dayOfWeek: "土", opponent: "中日", startTime: "14:00", month: 4 },
  { date: "2026-04-19", dayOfWeek: "日", opponent: "中日", startTime: "13:00", month: 4 },
  { date: "2026-04-21", dayOfWeek: "火", opponent: "阪神", startTime: "18:00", month: 4 },
  { date: "2026-04-22", dayOfWeek: "水", opponent: "阪神", startTime: "18:00", month: 4 },
  { date: "2026-04-23", dayOfWeek: "木", opponent: "阪神", startTime: "18:00", month: 4 },
  // 5月
  { date: "2026-05-01", dayOfWeek: "金", opponent: "オリックス", startTime: "18:00", month: 5 },
  { date: "2026-05-02", dayOfWeek: "土", opponent: "オリックス", startTime: "14:00", month: 5 },
  { date: "2026-05-03", dayOfWeek: "日", opponent: "オリックス", startTime: "13:00", month: 5 },
  { date: "2026-05-15", dayOfWeek: "金", opponent: "西武", startTime: "18:00", month: 5 },
  { date: "2026-05-16", dayOfWeek: "土", opponent: "西武", startTime: "14:00", month: 5 },
  { date: "2026-05-17", dayOfWeek: "日", opponent: "西武", startTime: "13:00", month: 5 },
  { date: "2026-05-19", dayOfWeek: "火", opponent: "楽天", startTime: "18:00", month: 5 },
  { date: "2026-05-20", dayOfWeek: "水", opponent: "楽天", startTime: "18:00", month: 5 },
  { date: "2026-05-29", dayOfWeek: "金", opponent: "巨人(交流戦)", startTime: "18:00", month: 5 },
  { date: "2026-05-30", dayOfWeek: "土", opponent: "巨人(交流戦)", startTime: "14:00", month: 5 },
  { date: "2026-05-31", dayOfWeek: "日", opponent: "巨人(交流戦)", startTime: "13:00", month: 5 },
  // 6月
  { date: "2026-06-09", dayOfWeek: "火", opponent: "交流戦", startTime: "18:00", month: 6 },
  { date: "2026-06-10", dayOfWeek: "水", opponent: "交流戦", startTime: "18:00", month: 6 },
  { date: "2026-06-11", dayOfWeek: "木", opponent: "交流戦", startTime: "18:00", month: 6 },
  { date: "2026-06-12", dayOfWeek: "金", opponent: "交流戦", startTime: "18:00", month: 6 },
  { date: "2026-06-13", dayOfWeek: "土", opponent: "交流戦", startTime: "14:00", month: 6 },
  { date: "2026-06-14", dayOfWeek: "日", opponent: "交流戦", startTime: "13:00", month: 6 },
  { date: "2026-06-19", dayOfWeek: "金", opponent: "未定", startTime: "18:00", month: 6 },
  { date: "2026-06-20", dayOfWeek: "土", opponent: "未定", startTime: "14:00", month: 6 },
  { date: "2026-06-21", dayOfWeek: "日", opponent: "未定", startTime: "13:00", month: 6 },
  { date: "2026-06-23", dayOfWeek: "火", opponent: "未定", startTime: "13:00", month: 6 },
  { date: "2026-06-24", dayOfWeek: "水", opponent: "未定", startTime: "13:00", month: 6 },
  { date: "2026-06-30", dayOfWeek: "火", opponent: "未定", startTime: "18:00", month: 6 },
  // 7月
  { date: "2026-07-01", dayOfWeek: "水", opponent: "未定", startTime: "18:00", month: 7 },
  { date: "2026-07-02", dayOfWeek: "木", opponent: "未定", startTime: "18:00", month: 7 },
  { date: "2026-07-10", dayOfWeek: "金", opponent: "未定", startTime: "18:00", month: 7 },
  { date: "2026-07-11", dayOfWeek: "土", opponent: "未定", startTime: "14:00", month: 7 },
  { date: "2026-07-12", dayOfWeek: "日", opponent: "未定", startTime: "13:00", month: 7 },
  { date: "2026-07-14", dayOfWeek: "火", opponent: "未定", startTime: "13:00", month: 7 },
  { date: "2026-07-15", dayOfWeek: "水", opponent: "未定", startTime: "13:00", month: 7 },
  { date: "2026-07-16", dayOfWeek: "木", opponent: "未定", startTime: "13:00", month: 7 },
  { date: "2026-07-25", dayOfWeek: "土", opponent: "未定", startTime: "14:00", month: 7 },
  { date: "2026-07-26", dayOfWeek: "日", opponent: "未定", startTime: "13:00", month: 7 },
  { date: "2026-07-31", dayOfWeek: "金", opponent: "未定", startTime: "18:00", month: 7 },
  // 8月
  { date: "2026-08-01", dayOfWeek: "土", opponent: "オリックス", startTime: "14:00", month: 8 },
  { date: "2026-08-02", dayOfWeek: "日", opponent: "巨人", startTime: "13:00", month: 8 },
  { date: "2026-08-07", dayOfWeek: "金", opponent: "楽天", startTime: "18:00", month: 8 },
  { date: "2026-08-08", dayOfWeek: "土", opponent: "楽天", startTime: "15:00", month: 8 },
  { date: "2026-08-09", dayOfWeek: "日", opponent: "楽天", startTime: "14:00", month: 8 },
  { date: "2026-08-11", dayOfWeek: "火祝", opponent: "中日", startTime: "14:00", month: 8 },
  { date: "2026-08-12", dayOfWeek: "水", opponent: "中日", startTime: "18:00", month: 8 },
  { date: "2026-08-13", dayOfWeek: "木", opponent: "中日", startTime: "18:00", month: 8 },
  { date: "2026-08-18", dayOfWeek: "火", opponent: "阪神", startTime: "14:00", month: 8 },
  { date: "2026-08-19", dayOfWeek: "水", opponent: "阪神", startTime: "14:00", month: 8 },
  { date: "2026-08-20", dayOfWeek: "木", opponent: "阪神", startTime: "14:00", month: 8 },
  { date: "2026-08-28", dayOfWeek: "金", opponent: "ソフトバンク", startTime: "18:00", month: 8 },
  { date: "2026-08-29", dayOfWeek: "土", opponent: "ソフトバンク", startTime: "14:00", month: 8 },
  { date: "2026-08-30", dayOfWeek: "日", opponent: "ソフトバンク", startTime: "13:00", month: 8 },
  // 9月
  { date: "2026-09-01", dayOfWeek: "火", opponent: "オリックス", startTime: "18:00", month: 9 },
  { date: "2026-09-02", dayOfWeek: "水", opponent: "オリックス", startTime: "18:00", month: 9 },
  { date: "2026-09-15", dayOfWeek: "火", opponent: "楽天", startTime: "18:00", month: 9 },
  { date: "2026-09-17", dayOfWeek: "木", opponent: "楽天", startTime: "18:00", month: 9 },
  { date: "2026-09-19", dayOfWeek: "土", opponent: "楽天", startTime: "14:00", month: 9 },
  { date: "2026-09-20", dayOfWeek: "日", opponent: "楽天", startTime: "14:00", month: 9 },
  { date: "2026-09-21", dayOfWeek: "月祝", opponent: "楽天", startTime: "14:00", month: 9 },
  { date: "2026-09-22", dayOfWeek: "火祝", opponent: "千葉ロッテ", startTime: "18:00", month: 9 },
  { date: "2026-09-23", dayOfWeek: "水祝", opponent: "千葉ロッテ", startTime: "18:00", month: 9 },
  { date: "2026-09-24", dayOfWeek: "木", opponent: "千葉ロッテ", startTime: "18:00", month: 9 },
];

const dummyEmployees = [
  { no: "E001", name: "田中 太郎" }, { no: "E002", name: "鈴木 花子" },
  { no: "E003", name: "佐藤 一郎" }, { no: "E004", name: "高橋 美咲" },
  { no: "E005", name: "伊藤 健一" }, { no: "E006", name: "渡辺 由美" },
  { no: "E007", name: "山本 大輔" }, { no: "E008", name: "中村 あゆみ" },
  { no: "E009", name: "小林 誠" }, { no: "E010", name: "加藤 恵子" },
  { no: "E011", name: "吉田 翔太" }, { no: "E012", name: "山田 真由美" },
  { no: "E013", name: "松本 隆" }, { no: "E014", name: "井上 香織" },
  { no: "E015", name: "木村 浩二" }, { no: "E016", name: "林 美穂" },
  { no: "E017", name: "清水 拓也" }, { no: "E018", name: "山口 さくら" },
  { no: "E019", name: "阿部 竜也" }, { no: "E020", name: "森 千尋" },
  { no: "E021", name: "池田 雄一" }, { no: "E022", name: "橋本 理恵" },
  { no: "E023", name: "石川 和也" }, { no: "E024", name: "前田 葵" },
  { no: "E025", name: "藤田 修一" }, { no: "E026", name: "後藤 麻衣" },
  { no: "E027", name: "岡田 啓介" }, { no: "E028", name: "長谷川 瞳" },
  { no: "E029", name: "村上 直樹" }, { no: "E030", name: "近藤 裕子" },
  { no: "E031", name: "坂本 大地" }, { no: "E032", name: "遠藤 彩" },
  { no: "E033", name: "青木 慎一" }, { no: "E034", name: "藤井 奈々" },
  { no: "E035", name: "西村 光太郎" }, { no: "E036", name: "福田 さやか" },
  { no: "E037", name: "太田 悠人" }, { no: "E038", name: "三浦 恵" },
  { no: "E039", name: "岡本 秀樹" }, { no: "E040", name: "松田 真理" },
  { no: "E041", name: "中島 功" }, { no: "E042", name: "原田 陽子" },
  { no: "E043", name: "小川 智也" }, { no: "E044", name: "竹内 沙織" },
  { no: "E045", name: "金子 大介" }, { no: "E046", name: "和田 明美" },
  { no: "E047", name: "中野 勇気" }, { no: "E048", name: "上田 みゆき" },
  { no: "E049", name: "杉山 浩" }, { no: "E050", name: "千葉 愛" },
  { no: "E051", name: "久保 隼人" }, { no: "E052", name: "野口 茜" },
  { no: "E053", name: "菊池 英明" }, { no: "E054", name: "木下 結衣" },
  { no: "E055", name: "佐々木 亮" }, { no: "E056", name: "新井 美月" },
  { no: "E057", name: "野村 達也" }, { no: "E058", name: "渡部 真央" },
  { no: "E059", name: "今井 祐介" }, { no: "E060", name: "河野 春香" },
  { no: "E061", name: "平田 剛" }, { no: "E062", name: "大野 聡美" },
  { no: "E063", name: "宮崎 健太" }, { no: "E064", name: "高木 望" },
  { no: "E065", name: "安藤 翼" }, { no: "E066", name: "内田 文香" },
  { no: "E067", name: "島田 正人" }, { no: "E068", name: "横山 優花" },
  { no: "E069", name: "大塚 悟" }, { no: "E070", name: "石井 七海" },
];

async function main() {
  console.log("シードデータ投入開始...");

  // 管理者アカウント
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.employee.upsert({
    where: { employeeNo: "ADMIN" },
    update: {},
    create: {
      employeeNo: "ADMIN",
      name: "管理者",
      password: adminPassword,
      isAdmin: true,
    },
  });
  console.log("管理者アカウント作成完了");

  // テストユーザー（西科 訓）
  const testPassword = await bcrypt.hash("hks", 10);
  await prisma.employee.upsert({
    where: { employeeNo: "TEST01" },
    update: {},
    create: {
      employeeNo: "TEST01",
      name: "西科 訓",
      password: testPassword,
    },
  });
  console.log("テストユーザー（西科 訓）作成完了");

  // 職員データ
  const defaultPassword = await bcrypt.hash("password", 10);
  for (const emp of dummyEmployees) {
    await prisma.employee.upsert({
      where: { employeeNo: emp.no },
      update: {},
      create: {
        employeeNo: emp.no,
        name: emp.name,
        password: defaultPassword,
      },
    });
  }
  console.log(`職員 ${dummyEmployees.length}名 作成完了`);

  // 試合データ
  for (const game of games) {
    const existing = await prisma.game.findFirst({
      where: { date: new Date(game.date) },
    });
    if (!existing) {
      await prisma.game.create({
        data: {
          date: new Date(game.date),
          dayOfWeek: game.dayOfWeek,
          opponent: game.opponent,
          startTime: game.startTime,
          month: game.month,
        },
      });
    }
  }
  console.log(`試合 ${games.length}試合 作成完了`);

  // 募集期間（4月〜9月分を作成）
  const periods = [
    { year: 2026, month: 4, start: "2026-03-15", end: "2026-03-25" },
    { year: 2026, month: 5, start: "2026-04-15", end: "2026-04-25" },
    { year: 2026, month: 6, start: "2026-05-15", end: "2026-05-25" },
    { year: 2026, month: 7, start: "2026-06-15", end: "2026-06-25" },
    { year: 2026, month: 8, start: "2026-07-15", end: "2026-07-25" },
    { year: 2026, month: 9, start: "2026-08-15", end: "2026-08-25" },
  ];

  for (const p of periods) {
    await prisma.applicationPeriod.upsert({
      where: { year_month: { year: p.year, month: p.month } },
      update: {},
      create: {
        year: p.year,
        month: p.month,
        startDate: new Date(p.start),
        endDate: new Date(p.end),
      },
    });
  }
  console.log("募集期間 作成完了");

  console.log("シードデータ投入完了！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

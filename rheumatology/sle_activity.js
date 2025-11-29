// js/sle_activity.js
// SLEDAI-2K & BILAG-2004 の同時計算

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sle_activity_form");
  const btnCalc = document.getElementById("sle_activity_calc");
  const btnReset = document.getElementById("sle_activity_reset");

  if (!form || !btnCalc || !btnReset) return;

  btnCalc.addEventListener("click", () => {
    calculateSLEDAI();
    calculateBILAG();
  });

  btnReset.addEventListener("click", () => {
    form.reset();
    resetResultCard("card_sledai");
    resetResultCard("card_bilag");
  });
});

/**
 * 結果カードを初期化
 */
function resetResultCard(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const v = card.querySelector(".result-value");
  const c = card.querySelector(".result-category");
  const m = card.querySelector(".result-message");

  if (v) v.textContent = "--";
  if (c) c.textContent = "";
  // メッセージは初期説明を維持するため、ここでは変更しない
}

/**
 * 共通：結果カードの更新
 */
function setResultCard(cardId, value, categoryText, extraMessage) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const v = card.querySelector(".result-value");
  const c = card.querySelector(".result-category");
  const m = card.querySelector(".result-message");

  if (value == null) {
    if (v) v.textContent = "--";
  } else if (v) {
    v.textContent = value;
  }

  if (c) c.textContent = categoryText || "";
  if (m && extraMessage) {
    m.textContent = extraMessage;
  }
}

/**
 * SLEDAI-2K の計算
 * 参考：原法および SLEDAI-2K の解説文献 
 */
function calculateSLEDAI() {
  // 各項目の重み付け
  const items = [
    // 8点
    { id: "sledai_seizure", weight: 8 },
    { id: "sledai_psychosis", weight: 8 },
    { id: "sledai_obs", weight: 8 },
    { id: "sledai_visual", weight: 8 },
    { id: "sledai_cranial", weight: 8 },
    { id: "sledai_headache", weight: 8 },
    { id: "sledai_cva", weight: 8 },
    { id: "sledai_vasculitis", weight: 8 },

    // 4点
    { id: "sledai_arthritis", weight: 4 },
    { id: "sledai_myositis", weight: 4 },
    { id: "sledai_urinary_casts", weight: 4 },
    { id: "sledai_hematuria", weight: 4 },
    { id: "sledai_proteinuria", weight: 4 },
    { id: "sledai_pyuria", weight: 4 },

    // 2点
    { id: "sledai_rash", weight: 2 },
    { id: "sledai_alopecia", weight: 2 },
    { id: "sledai_mucosal", weight: 2 },
    { id: "sledai_pleurisy", weight: 2 },
    { id: "sledai_pericarditis", weight: 2 },
    { id: "sledai_low_complement", weight: 2 },
    { id: "sledai_increased_dna", weight: 2 },

    // 1点
    { id: "sledai_fever", weight: 1 },
    { id: "sledai_thrombocytopenia", weight: 1 },
    { id: "sledai_leukopenia", weight: 1 },
  ];

  let total = 0;

  items.forEach((item) => {
    const input = document.getElementById(item.id);
    if (!input) return;
    // score-utils.js の Boolean ヘルパーを利用
    const v = parseBooleanInput(input);
    total += v * item.weight;
  });

  // 活動性カテゴリー（代表的な区分）
  // 0: no activity, 1–5: mild, 6–10: moderate, 11–19: high, ≥20: very high 
  let category = "";
  if (total === 0) category = "寛解相当（活動性なし）";
  else if (total <= 5) category = "軽度活動性";
  else if (total <= 10) category = "中等度活動性";
  else if (total <= 19) category = "高度活動性";
  else category = "非常に高度な活動性";

  const message =
    "SLEDAI-2K は、各項目の有無と重み付けから合計スコアを算出する指数です。解釈の際はベースラインとの変化量や他指標も併せて評価してください。";

  setResultCard("card_sledai", total.toString(), `疾患活動性：${category}`, message);
}

/**
 * BILAG-2004 数値スコアの計算
 * A=12, B=8, C=1, D/E=0 のスキームを使用 
 */
function calculateBILAG() {
  const gradeToScore = {
    A: 12,
    B: 8,
    C: 1,
    D: 0,
    E: 0,
    "": 0,
  };

  const domains = [
    { id: "bilag_general", name: "全身症状" },
    { id: "bilag_mucocutaneous", name: "皮膚・粘膜" },
    { id: "bilag_neuro", name: "神経精神" },
    { id: "bilag_musculoskeletal", name: "筋骨格" },
    { id: "bilag_cardioresp", name: "心肺" },
    { id: "bilag_vasculitis", name: "血管炎" },
    { id: "bilag_renal", name: "腎" },
    { id: "bilag_haem", name: "血液" },
    { id: "bilag_other", name: "その他" },
  ];

  let total = 0;
  let highestGrade = "E";
  const activeDomains = [];

  domains.forEach((d) => {
    const el = document.getElementById(d.id);
    if (!el) return;

    const grade = (el.value || "E").toUpperCase();
    const score = gradeToScore[grade] ?? 0;
    total += score;

    // もっとも重いグレードを記録
    if (grade === "A") {
      highestGrade = "A";
    } else if (grade === "B" && highestGrade !== "A") {
      highestGrade = "B";
    } else if (
      grade === "C" &&
      (highestGrade === "D" || highestGrade === "E")
    ) {
      highestGrade = "C";
    }

    if (grade === "A" || grade === "B" || grade === "C") {
      activeDomains.push(`${d.name}: ${grade}`);
    }
  });

  let activityCategory = "";
  if (highestGrade === "A") {
    activityCategory = "全身的に高度な活動性（少なくとも1系統でA）";
  } else if (highestGrade === "B") {
    activityCategory = "中等度活動性（Aなし、少なくとも1系統でB）";
  } else if (highestGrade === "C") {
    activityCategory = "軽度活動性（A/Bなし、少なくとも1系統でC）";
  } else {
    activityCategory = "寛解相当（全系統 D/E）";
  }

  const detail =
    activeDomains.length > 0
      ? `活動性のある系統：${activeDomains.join(" / ")}`
      : "活動性のある系統はありません。";

  const message =
    "BILAG-2004 の本来のスコアリングは項目ごとにグレードを決定する必要があります。本ツールでは、既に評価済みのグレードを A=12, B=8, C=1, D/E=0 で数値化し、総スコアと最大グレードを表示します。";

  setResultCard(
    "card_bilag",
    total.toString(),
    `最大グレード：${highestGrade}（${activityCategory}）`,
    `${detail} ${message}`
  );
}

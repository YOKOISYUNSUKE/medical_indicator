// streptococcus.js
// 溶連菌咽頭炎：Centor / McIsaac スコア計算

document.addEventListener("DOMContentLoaded", () => {
  const centorBtn = document.getElementById("centor-calc-btn");
  const mcisaacBtn = document.getElementById("mcisaac-calc-btn");

  if (centorBtn) {
    centorBtn.addEventListener("click", calculateCentor);
  }
  if (mcisaacBtn) {
    mcisaacBtn.addEventListener("click", calculateMcIsaac);
  }
});

// 共通ヘルパー：チェックボックスを 0/1 に
function boolFromCheckbox(id) {
  const el = document.getElementById(id);
  return el && el.checked ? 1 : 0;
}

// Centor スコア：0–4 点
function calculateCentor() {
  // 4項目：発熱・扁桃所見・前頸部リンパ節圧痛・咳なし
  const score =
    boolFromCheckbox("centor-fever") +
    boolFromCheckbox("centor-tonsil") +
    boolFromCheckbox("centor-lymph") +
    boolFromCheckbox("centor-cough-absent");

  const resultEl = document.getElementById("centor-result");
  const interpretEl = document.getElementById("centor-interpret");
  if (!resultEl || !interpretEl) return;

  let message = "";
  let detail = "";

  if (score <= 1) {
    message = "低リスク";
    detail =
      "溶連菌性咽頭炎の可能性は比較的低い層とされます。臨床像や流行状況を踏まえて検査・治療を検討してください。";
  } else if (score === 2) {
    message = "中等度リスク";
    detail =
      "溶連菌迅速検査などの実施を検討する層です。抗菌薬投与は検査結果や臨床像に基づいて判断します。";
  } else if (score === 3) {
    message = "やや高リスク";
    detail =
      "溶連菌性咽頭炎の可能性が高まる層です。検査および抗菌薬投与の適応を積極的に検討します。";
  } else {
    // 4 点
    message = "高リスク";
    detail =
      "溶連菌性咽頭炎の可能性が高い層です。ガイドラインや施設方針に沿って検査・治療を行ってください。";
  }

  resultEl.textContent = `Centor スコア：${score} 点（${message}）`;
  interpretEl.textContent =
    detail +
    " 実際の診療では、小児か成人か、流行状況、家族内発症なども併せて評価してください。";
}

// McIsaac スコア：Centor＋年齢補正
function calculateMcIsaac() {
  const ageInput = document.getElementById("mcisaac-age");
  const resultEl = document.getElementById("mcisaac-result");
  const interpretEl = document.getElementById("mcisaac-interpret");
  if (!ageInput || !resultEl || !interpretEl) return;

  let age;

  if (typeof parseNumericInput === "function" && typeof RANGE_PRESETS !== "undefined") {
    const parsed = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    if (parsed.error) return;
    age = parsed.value;
  } else {
    const v = Number(ageInput.value);
    if (!v || Number.isNaN(v) || v < 0) {
      alert("年齢を正しく入力してください。");
      ageInput.focus();
      return;
    }
    age = v;
  }

  // Centor 4項目
  let score =
    boolFromCheckbox("mc-fever") +
    boolFromCheckbox("mc-tonsil") +
    boolFromCheckbox("mc-lymph") +
    boolFromCheckbox("mc-cough-absent");

  // 年齢補正：3–14歳 +1, 15–44歳 0, ≥45歳 -1
  let ageAdjust = 0;
  if (age >= 3 && age <= 14) {
    ageAdjust = 1;
  } else if (age >= 45) {
    ageAdjust = -1;
  }
  score += ageAdjust;

  let category = "";
  let detail = "";

  if (score <= 0) {
    category = "溶連菌の可能性は比較的低い層";
    detail =
      "一般に溶連菌性咽頭炎の割合は低めとされます。ウイルス性咽頭炎を含めて鑑別します。";
  } else if (score === 1) {
    category = "ややリスクあり";
    detail =
      "溶連菌の割合はなお低〜中等度です。症状経過や流行状況に応じて検査の要否を検討します。";
  } else if (score === 2) {
    category = "中等度リスク";
    detail =
      "溶連菌迅速検査の実施がしばしば推奨される層です。結果に応じて抗菌薬投与を判断します。";
  } else if (score === 3) {
    category = "やや高リスク";
    detail =
      "溶連菌陽性率が上昇する層で、検査および抗菌薬投与の適応を積極的に検討します。";
  } else {
    // 4–5
    category = "高リスク";
    detail =
      "溶連菌性咽頭炎の可能性が高い層です。検査陽性時には抗菌薬投与を行うことが多い層です。";
  }

  resultEl.textContent = `McIsaac スコア：${score} 点`;
  interpretEl.textContent =
    `${category} とされています。` +
    " ただし、地域・季節・ワクチン歴などで陽性率は変動するため、必ず最新のガイドラインと施設方針を確認してください。";
}

// heart.js
// HEARTスコア（胸痛トリアージ）

function calculateHeartScore() {
  const resultElem = document.getElementById("heart-result");
  const interpretElem = document.getElementById("heart-interpret");

  // 年齢入力
  const ageInput = document.getElementById("heart-age");
  const { value: age, error: ageError } = parseNumericInput(
    ageInput,
    RANGE_PRESETS.AGE
  );

  if (ageError || Number.isNaN(age)) {
    resultElem.textContent = "入力エラー：年齢を確認してください。";
    interpretElem.textContent = "";
    return;
  }

  // A: Age スコア
  let ageScore = 0;
  if (age >= 65) {
    ageScore = 2;
  } else if (age >= 45) {
    ageScore = 1;
  }

  // H / E / T はセレクトボックスから数値を取得
  const historyScore = Number(
    document.getElementById("heart-history")?.value || 0
  );
  const ecgScore = Number(
    document.getElementById("heart-ecg")?.value || 0
  );
  const tropScore = Number(
    document.getElementById("heart-trop")?.value || 0
  );

  // R: Risk factors（チェックボックス群）
  const riskIds = [
    "heart-rf-htn",
    "heart-rf-hyperlipid",
    "heart-rf-dm",
    "heart-rf-smoker",
    "heart-rf-obesity",
    "heart-rf-fhx",
    "heart-rf-vascular",
    "heart-rf-known-cad",
  ];

  let riskCount = 0;
  let hasAtheroscleroticDisease = false;

  riskIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const v = parseBooleanInput(el);
    if (v === 1) {
      riskCount += 1;
      if (id === "heart-rf-vascular" || id === "heart-rf-known-cad") {
        hasAtheroscleroticDisease = true;
      }
    }
  });

  let riskScore = 0;
  // 0因子 → 0点, 1–2因子 → 1点, 3つ以上 または 既知の動脈硬化性疾患あり → 2点
  if (riskCount === 0) {
    riskScore = 0;
  } else if (riskCount <= 2 && !hasAtheroscleroticDisease) {
    riskScore = 1;
  } else {
    riskScore = 2;
  }

  const total = ageScore + historyScore + ecgScore + tropScore + riskScore;

  let category = "";
  let msg = "";

  if (total <= 3) {
    category = "低リスク";
    msg = "短期の主要心血管イベントリスクは低いとされます。経過観察や外来フォローが検討されます。";
  } else if (total <= 6) {
    category = "中等度リスク";
    msg = "追加の観察・心エコー・負荷試験などの精査や入院観察を検討します。";
  } else {
    category = "高リスク";
    msg = "早期の侵襲的評価や集中的観察を検討する高リスク群です。循環器専門医へのコンサルトが推奨されます。";
  }

  resultElem.textContent = `HEARTスコア：${total} 点（${category}）`;
  interpretElem.textContent = msg;
}

// meld.js
// MELD スコア計算
// 式: 3.78*ln(T-Bil) + 11.2*ln(INR) + 9.57*ln(Cr) + 6.43
// Cr, T-Bil, INR は 1 以上に補正し、Cr は最大 4 mg/dL とする慣用的な形を採用

document.addEventListener("DOMContentLoaded", () => {
  const tbilInput = document.getElementById("meld-tbil");
  const creInput = document.getElementById("meld-cre");
  const inrInput = document.getElementById("meld-inr");
  const dialysisCheckbox = document.getElementById("meld-dialysis");

  const resultElem = document.getElementById("meld-result");
  const interpretElem = document.getElementById("meld-interpret");
  const calcBtn = document.getElementById("meld-calc-btn");

  if (!calcBtn) return;

  calcBtn.addEventListener("click", () => {
    let hasError = false;

    const tbil = parseNumericInput(tbilInput, RANGE_PRESETS.TBIL);
    if (tbil.error) hasError = true;

    const cre = parseNumericInput(creInput, RANGE_PRESETS.CREATININE);
    if (cre.error) hasError = true;

    const inr = parseNumericInput(inrInput, RANGE_PRESETS.INR);
    if (inr.error) hasError = true;

    if (hasError) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    // --- 値の補正 ---
    let bilirubin = Math.max(tbil.value, 1); // 1 mg/dL 未満は 1 に補正
    let inrVal = Math.max(inr.value, 1);     // 1 未満は 1 に補正

    let creat = cre.value;
    if (dialysisCheckbox.checked) {
      // 最近 1 週間で 2 回以上の透析がある場合は Cr=4 mg/dL とする
      creat = 4;
    } else {
      creat = Math.max(creat, 1);
      creat = Math.min(creat, 4);
    }

    // --- MELD スコア計算 ---
    const meldRaw =
      3.78 * Math.log(bilirubin) +
      11.2 * Math.log(inrVal) +
      9.57 * Math.log(creat) +
      6.43;

    const meldScore = Math.round(meldRaw);

    let riskClass;
    let detail;

    if (meldScore < 10) {
      riskClass = "低リスク";
      detail = "待機的治療で経過観察されることが多いレベルです。";
    } else if (meldScore < 20) {
      riskClass = "中等度リスク";
      detail = "肝機能障害が進行しており、慎重なフォローが必要です。";
    } else if (meldScore < 30) {
      riskClass = "高リスク";
      detail = "肝不全が進行しており、入院管理や移植適応の検討が望まれます。";
    } else {
      riskClass = "極めて高リスク";
      detail = "短期予後不良が強く示唆されます。緊急度の高い対応が必要です。";
    }

    const displayScore = meldScore < 0 ? 0 : meldScore;

    resultElem.textContent = `MELDスコア: ${displayScore}`;
    interpretElem.textContent =
      `${riskClass}と考えられます。${detail} 実際の判断は臨床経過・合併症・画像所見なども含めて総合的に行ってください。`;
  });
});

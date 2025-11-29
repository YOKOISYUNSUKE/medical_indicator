// abcd2.js
// ABCD2スコア（TIA後早期脳卒中リスク）

document.addEventListener("DOMContentLoaded", () => {
  const ageInput = document.getElementById("abcd2-age");
  const sbpInput = document.getElementById("abcd2-sbp");
  const dbpInput = document.getElementById("abcd2-dbp");
  const clinicalSelect = document.getElementById("abcd2-clinical");
  const durationInput = document.getElementById("abcd2-duration");
  const diabetesCheckbox = document.getElementById("abcd2-diabetes");

  const resultElem = document.getElementById("abcd2-result");
  const interpretElem = document.getElementById("abcd2-interpret");
  const calcBtn = document.getElementById("abcd2-calc-btn");

  if (!calcBtn) return;

  function validateSelect(selectEl, message) {
    if (!selectEl) return false;
    if (!selectEl.value) {
      if (typeof showFieldError === "function") {
        showFieldError(selectEl, message || "選択してください");
      }
      return false;
    }
    if (typeof clearFieldError === "function") {
      clearFieldError(selectEl);
    }
    return true;
  }

  calcBtn.addEventListener("click", () => {
    let hasError = false;

    const age = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    if (age.error) hasError = true;

    const sbp = parseNumericInput(sbpInput, RANGE_PRESETS.SBP);
    if (sbp.error) hasError = true;

    const dbp = parseNumericInput(dbpInput, RANGE_PRESETS.DBP);
    if (dbp.error) hasError = true;

    const duration = parseNumericInput(durationInput, RANGE_PRESETS.DURATION_MIN);
    if (duration.error) hasError = true;

    const clinicalOk = validateSelect(
      clinicalSelect,
      "臨床症状を選択してください"
    );
    if (!clinicalOk) hasError = true;

    if (hasError) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    let score = 0;

    // Age ≥ 60
    if (age.value >= 60) score += 1;

    // BP ≥ 140/90
    if (sbp.value >= 140 || dbp.value >= 90) score += 1;

    // Clinical features
    const clinicalScore = Number(clinicalSelect.value || "0");
    score += clinicalScore;

    // Duration
    const durMin = duration.value;
    if (durMin >= 60) {
      score += 2;
    } else if (durMin >= 10) {
      score += 1;
    }

    // Diabetes
    if (diabetesCheckbox.checked) {
      score += 1;
    }

    // 解釈
    let riskClass;
    let detail;
    if (score <= 3) {
      riskClass = "低リスク";
      detail = "短期間の脳卒中リスクは比較的低いとされますが、フォローは必要です。";
    } else if (score <= 5) {
      riskClass = "中等度リスク";
      detail = "早期の専門科受診や入院観察の適応を検討します。";
    } else {
      riskClass = "高リスク";
      detail = "入院管理や緊急の精査（画像・血管評価など）が推奨されるレベルです。";
    }

    resultElem.textContent = `ABCD2スコア: ${score} 点`;
    interpretElem.textContent =
      `${riskClass}と考えられます。${detail} 実際の対応は症状経過、危険因子、画像所見などを含めて総合的に判断してください。`;
  });
});

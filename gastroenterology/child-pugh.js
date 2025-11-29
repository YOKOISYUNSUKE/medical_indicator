// child-pugh.js
// Child-Pugh スコア計算

document.addEventListener("DOMContentLoaded", () => {
  const tbilInput = document.getElementById("cp-tbil");
  const albInput = document.getElementById("cp-alb");
  const inrInput = document.getElementById("cp-inr");
  const ascitesSelect = document.getElementById("cp-ascites");
  const heSelect = document.getElementById("cp-he");

  const resultElem = document.getElementById("cp-result");
  const interpretElem = document.getElementById("cp-interpret");
  const calcBtn = document.getElementById("cp-calc-btn");

  if (!calcBtn) return;

  calcBtn.addEventListener("click", () => {
    let hasError = false;

    const tbil = parseNumericInput(tbilInput, RANGE_PRESETS.TBIL);
    if (tbil.error) hasError = true;

    const alb = parseNumericInput(albInput, RANGE_PRESETS.ALBUMIN);
    if (alb.error) hasError = true;

    const inr = parseNumericInput(inrInput, RANGE_PRESETS.INR);
    if (inr.error) hasError = true;

    if (hasError) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    // --- 個々の項目スコア ---
    // 総ビリルビン (mg/dL)
    let scoreTbil;
    if (tbil.value < 2.0) {
      scoreTbil = 1;
    } else if (tbil.value <= 3.0) {
      scoreTbil = 2;
    } else {
      scoreTbil = 3;
    }

    // アルブミン (g/dL)
    let scoreAlb;
    if (alb.value > 3.5) {
      scoreAlb = 1;
    } else if (alb.value >= 2.8) {
      scoreAlb = 2;
    } else {
      scoreAlb = 3;
    }

    // PT-INR
    let scoreInr;
    if (inr.value < 1.7) {
      scoreInr = 1;
    } else if (inr.value <= 2.3) {
      scoreInr = 2;
    } else {
      scoreInr = 3;
    }

    // 腹水 / 肝性脳症（select の value をそのまま 1〜3 点として使用）
    const scoreAscites = Number(ascitesSelect.value);
    const scoreHe = Number(heSelect.value);

    const total =
      scoreTbil + scoreAlb + scoreInr + scoreAscites + scoreHe;

    let grade;
    let detail;

    if (total <= 6) {
      grade = "A";
      detail = "予後良好（代償性肝硬変）とされます。";
    } else if (total <= 9) {
      grade = "B";
      detail = "中等度の肝機能障害が考えられます。";
    } else {
      grade = "C";
      detail = "高度の肝機能障害であり、予後不良とされます。";
    }

    resultElem.textContent = `Child-Pughスコア: ${total} 点（Class ${grade}）`;
    interpretElem.textContent =
      `${detail} 実際の治療方針は、全身状態や合併症なども含めて総合的に判断してください。`;
  });
});

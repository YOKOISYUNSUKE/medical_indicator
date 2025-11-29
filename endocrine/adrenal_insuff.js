// adrenal_insuff.js
// 副腎不全評価（シンプル・スコアリング）

document.addEventListener("DOMContentLoaded", () => {
  const sbpInput = document.getElementById("ai-sbp");
  const naInput = document.getElementById("ai-na");
  const kInput = document.getElementById("ai-k");
  const cortInput = document.getElementById("ai-cort");

  const riskSteroid = document.getElementById("ai-risk-steroid");
  const riskAutoimmune = document.getElementById("ai-risk-autoimmune");
  const riskAdrenal = document.getElementById("ai-risk-adrenal");
  const riskInfection = document.getElementById("ai-risk-infection");

  const calcButton = document.getElementById("ai-calc-button");
  const scoreElem = document.getElementById("ai-score");
  const interpretElem = document.getElementById("ai-interpret");

  if (!calcButton) return;

  calcButton.addEventListener("click", (e) => {
    e.preventDefault();

    // 血圧
    const sbpParsed = parseNumericInput(sbpInput, RANGE_PRESETS.SBP);
    if (sbpParsed.error) return;

    // Na
    const naParsed = parseNumericInput(naInput, RANGE_PRESETS.SODIUM);
    if (naParsed.error) return;

    // K
    const kParsed = parseNumericInput(kInput, RANGE_PRESETS.POTASSIUM);
    if (kParsed.error) return;

    // コルチゾール（任意）
    let cortValue = null;
    if (cortInput.value.trim() !== "") {
      const cParsed = parseNumericInput(cortInput, {
        min: 0,
        max: 60,
        allowEmpty: true,
      });
      if (!cParsed.error) {
        cortValue = cParsed.value;
      }
    }

    let score = 0;

    // Na
    if (naParsed.value < 130) {
      score += 2;
    } else if (naParsed.value < 135) {
      score += 1;
    }

    // K
    if (kParsed.value >= 6.0) {
      score += 2;
    } else if (kParsed.value >= 5.0) {
      score += 1;
    }

    // SBP
    if (sbpParsed.value < 90) {
      score += 3;
    } else if (sbpParsed.value < 100) {
      score += 2;
    } else if (sbpParsed.value < 110) {
      score += 1;
    }

    // コルチゾール
    if (cortValue != null) {
      if (cortValue < 3) {
        score += 4;
      } else if (cortValue < 15) {
        score += 2;
      } else if (cortValue >= 15) {
        score -= 2; // 副腎不全の可能性やや低い方向
      }
    }

    // リスク因子（Boolean → 1 点ずつ）
    score += parseBooleanInput(riskSteroid);
    score += parseBooleanInput(riskAutoimmune);
    score += parseBooleanInput(riskAdrenal);
    score += parseBooleanInput(riskInfection);

    scoreElem.textContent = `合計スコア: ${score} 点`;

    let message;
    if (score <= 1) {
      message =
        "副腎不全のスコア上のリスクは低めですが、臨床像によっては追加評価が必要な場合があります。";
    } else if (score <= 4) {
      message =
        "副腎不全の可能性を考慮すべき中等度リスクです。症状・経過に応じて、追加検査や治療の要否を検討してください。";
    } else {
      message =
        "副腎不全のリスクが高いパターンです。ショックや低血圧を伴う場合は、ガイドラインに沿った迅速な対応を検討してください。";
    }

    interpretElem.textContent = message;
  });
});

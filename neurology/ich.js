// ich.js
// ICHスコア（自発性脳出血の予後予測）

document.addEventListener("DOMContentLoaded", () => {
  const ageInput = document.getElementById("ich-age");
  const gcsInput = document.getElementById("ich-gcs");
  const volumeInput = document.getElementById("ich-volume");
  const ivhCheckbox = document.getElementById("ich-ivh");
  const infratentorialCheckbox = document.getElementById("ich-infratentorial");

  const resultElem = document.getElementById("ich-result");
  const interpretElem = document.getElementById("ich-interpret");
  const calcBtn = document.getElementById("ich-calc-btn");

  if (!calcBtn) return;

  calcBtn.addEventListener("click", () => {
    let hasError = false;

    const age = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    if (age.error) hasError = true;

    const gcs = parseNumericInput(gcsInput, RANGE_PRESETS.GCS_TOTAL);
    if (gcs.error) hasError = true;

    const volume = parseNumericInput(volumeInput, RANGE_PRESETS.ICH_VOLUME_ML);
    if (volume.error) hasError = true;

    if (hasError) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    let score = 0;

    // GCS
    const gcsVal = gcs.value;
    if (gcsVal <= 4) {
      score += 2;
    } else if (gcsVal <= 12) {
      score += 1;
    } // 13〜15 は 0 点

    // ICH volume
    if (volume.value >= 30) {
      score += 1;
    }

    // IVH
    if (ivhCheckbox.checked) {
      score += 1;
    }

    // infratentorial origin
    if (infratentorialCheckbox.checked) {
      score += 1;
    }

    // Age ≥ 80
    if (age.value >= 80) {
      score += 1;
    }

    // 解釈
    let riskClass;
    let detail;
    if (score === 0) {
      riskClass = "最も低リスク";
      detail = "30日死亡率は比較的低い群とされます。";
    } else if (score <= 2) {
      riskClass = "低〜中等度リスク";
      detail = "慎重な経過観察と集中的な血圧・全身管理が必要です。";
    } else if (score <= 4) {
      riskClass = "高リスク";
      detail = "予後不良リスクが高く、ICU 管理や治療方針の事前説明が重要です。";
    } else {
      riskClass = "極めて高リスク";
      detail = "短期予後はきわめて不良とされる群です。治療方針・延命の程度を含めて多職種で検討が必要です。";
    }

    resultElem.textContent = `ICHスコア: ${score} 点（0〜6点）`;
    interpretElem.textContent =
      `${riskClass}と考えられます。${detail} 実際の対応は年齢、既往歴、血腫の部位・拡大、全身状態なども総合して判断してください。`;
  });
});

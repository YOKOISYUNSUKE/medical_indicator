// hints.js
// HINTS（Head Impulse, Nystagmus, Test of Skew）による中枢/末梢鑑別補助

document.addEventListener("DOMContentLoaded", () => {
  const hiSelect = document.getElementById("hints-hi");
  const nysSelect = document.getElementById("hints-nys");
  const skewSelect = document.getElementById("hints-skew");
  const calcBtn = document.getElementById("hints-calc-btn");
  const resultElem = document.getElementById("hints-result");
  const interpretElem = document.getElementById("hints-interpret");

  if (!hiSelect || !nysSelect || !skewSelect || !calcBtn || !resultElem || !interpretElem) {
    return;
  }

  function validateSelect(select) {
    if (!select.value) {
      if (typeof showFieldError === "function") {
        showFieldError(select, "結果を選択してください");
      }
      return false;
    }
    if (typeof clearFieldError === "function") {
      clearFieldError(select);
    }
    return true;
  }

  calcBtn.addEventListener("click", () => {
    const okHi = validateSelect(hiSelect);
    const okNys = validateSelect(nysSelect);
    const okSkew = validateSelect(skewSelect);

    if (!okHi || !okNys || !okSkew) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    const hi = hiSelect.value;      // "peripheral" / "central"
    const nys = nysSelect.value;    // "peripheral" / "central"
    const skew = skewSelect.value;  // "peripheral" / "central"

    const isTypicalPeripheral =
      hi === "peripheral" && nys === "peripheral" && skew === "peripheral";

    if (isTypicalPeripheral) {
      resultElem.textContent = "HINTSパターン: 末梢性を強く示唆";
      interpretElem.textContent =
        "典型的な末梢性めまいパターン（異常 Head Impulse ＋ 一方向性眼振 ＋ skew なし）です。" +
        "ただし完全に中枢性を否定するものではなく、症状経過や危険因子、神経学的所見を含めて評価してください。";
    } else {
      resultElem.textContent = "HINTSパターン: 中枢性を示唆";
      interpretElem.textContent =
        "いずれかの項目が中枢性パターンを示しています（正常 Head Impulse、方向交代性/垂直眼振、skew deviation など）。" +
        "脳幹・小脳梗塞などを念頭に、緊急の画像検査や専門科へのコンサルトを検討してください。";
    }
  });
});

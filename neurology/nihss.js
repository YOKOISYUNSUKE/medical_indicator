// nihss.js
// NIHSS（National Institutes of Health Stroke Scale）

document.addEventListener("DOMContentLoaded", () => {
  const calcBtn = document.getElementById("nihss-calc-btn");
  const resultElem = document.getElementById("nihss-result");
  const interpretElem = document.getElementById("nihss-interpret");

  if (!calcBtn || !resultElem || !interpretElem) return;

  // NIHSS の全項目ID
  const ITEM_IDS = [
    "nihss-1a",
    "nihss-1b",
    "nihss-1c",
    "nihss-2",
    "nihss-3",
    "nihss-4",
    "nihss-5a",
    "nihss-5b",
    "nihss-6a",
    "nihss-6b",
    "nihss-7",
    "nihss-8",
    "nihss-9",
    "nihss-10",
    "nihss-11",
  ];

  function calcNihssScore() {
    let total = 0;
    let hasError = false;

    ITEM_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const raw = el.value;
      if (raw === "") {
        // score-utils.js の共通エラー表示を利用
        if (typeof showFieldError === "function") {
          showFieldError(el, "選択してください");
        }
        hasError = true;
        return;
      }

      if (typeof clearFieldError === "function") {
        clearFieldError(el);
      }

      const value = Number(raw);
      if (!Number.isNaN(value)) {
        total += value;
      }
    });

    if (hasError) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return null;
    }

    return total;
  }

  function getNihssInterpretation(score) {
    // 一般的な重症度クラス分け
    if (score === 0) {
      return "神経学的脱落症状は認められません（NIHSS 0点）。";
    } else if (score >= 1 && score <= 4) {
      return "軽症脳卒中の範囲とされることが多いスコアです。";
    } else if (score >= 5 && score <= 15) {
      return "中等症の脳卒中と考えられます。血栓回収療法など適応評価が重要です。";
    } else if (score >= 16 && score <= 20) {
      return "中等度〜重症の脳卒中です。早期治療と厳密な全身管理が必要です。";
    } else {
      // 21〜42
      return "重症脳卒中と考えられます。予後不良リスクが高く、集中治療レベルの管理が推奨されます。";
    }
  }

  calcBtn.addEventListener("click", () => {
    const score = calcNihssScore();
    if (score == null) return;

    resultElem.textContent = `NIHSS: ${score} 点`;
    const msg = getNihssInterpretation(score);
    interpretElem.textContent =
      `${msg} 実際の治療方針は年齢・既往歴・画像所見・全身状態などを含めて総合的に判断してください。`;
  });
});

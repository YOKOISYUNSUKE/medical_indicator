// mrs.js
// mRS（改訂Rankin Scale）

document.addEventListener("DOMContentLoaded", () => {
  const calcBtn = document.getElementById("mrs-calc-btn");
  const resultElem = document.getElementById("mrs-result");
  const interpretElem = document.getElementById("mrs-interpret");

  if (!calcBtn || !resultElem || !interpretElem) return;

  const radios = document.querySelectorAll('input[name="mrs"]');
  const firstRadio = radios[0] || null;

  function getMrsInterpretation(score) {
    switch (score) {
      case 0:
        return "症状も障害もなく、完全に自立した状態です。";
      case 1:
        return "軽度の症状はあるものの、日常生活や社会活動に実質的な制限はありません。";
      case 2:
        return "身の回りのことは自立しているが、従来の活動には多少の制限があります。";
      case 3:
        return "歩行や身の回りの動作に部分的な介助が必要な状態です。";
      case 4:
        return "日常生活の多くで介助が必要で、自力での外出は困難です。";
      case 5:
        return "常時の介護を要し、寝たきりまたはほとんど臥床状態です。";
      case 6:
        return "死亡（転帰評価で用いられるカテゴリ）です。";
      default:
        return "";
    }
  }

  calcBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="mrs"]:checked');

    if (!selected) {
      // 共通エラー表示関数を利用（score-utils.js）
      if (firstRadio && typeof showFieldError === "function") {
        showFieldError(firstRadio, "スコアを1つ選択してください");
      }
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    if (firstRadio && typeof clearFieldError === "function") {
      clearFieldError(firstRadio);
    }

    const score = Number(selected.value);
    resultElem.textContent = `mRS: ${score}`;

    const msg = getMrsInterpretation(score);
    interpretElem.textContent =
      `${msg} 実際の予後評価や社会復帰の可否は、年齢・合併症・生活背景なども含めて総合的に判断してください。`;
  });
});

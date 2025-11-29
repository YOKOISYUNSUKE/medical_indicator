// infectious/infectious.js

document.addEventListener("DOMContentLoaded", () => {
  // data-disease を持つカードだけを対象にする
  const diseaseCards = document.querySelectorAll(".score-card[data-disease]");

  // 疾患コードと遷移先 HTML の対応表
  const DISEASE_PAGE_MAP = {
    streptococcus: "streptococcus.html", // 溶連菌咽頭炎
    softtissue: "softtissue.html",       // 軟部組織感染症（ALT-70 / LRINEC）
    necrotizing: "necrotizing.html",     // 壊死性軟部組織感染症（LRINEC）
  };

  diseaseCards.forEach((card) => {
    card.addEventListener("click", () => {
      const disease = card.dataset.disease;
      if (!disease) return;

      const target = DISEASE_PAGE_MAP[disease];

      if (target) {
        // 同じ infectious フォルダ内の HTML に遷移
        window.location.href = target;
      } else {
        // 念のためのフォールバック
        const labelElem = card.querySelector(".score-name");
        const label = labelElem ? labelElem.textContent : disease;
        alert(`「${label}」の詳細ページはまだ準備中です（disease=${disease}）`);
      }
    });
  });
});

// cha2ds2-vasc.js
// CHA₂DS₂-VASc スコア計算

function calculateCHA2DS2Vasc() {
  const ageInput = document.getElementById("cha-age");
  const { value: age, error } = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
  const sex = document.getElementById("cha-sex").value;

  const chf = document.getElementById("cha-chf").checked;
  const ht = document.getElementById("cha-ht").checked;
  const dm = document.getElementById("cha-dm").checked;
  const stroke = document.getElementById("cha-stroke").checked;
  const vascular = document.getElementById("cha-vascular").checked;

  const resultElem = document.getElementById("cha-result");

  if (error) {
    resultElem.textContent = "年齢を入力してください。";
    return;
  }

  let score = 0;

  if (chf) score += 1;
  if (ht) score += 1;
  if (dm) score += 1;
  if (stroke) score += 2;
  if (vascular) score += 1;

  if (age >= 75) {
    score += 2;
  } else if (age >= 65) {
    score += 1;
  }

  if (sex === "female") {
    score += 1;
  }

  let comment = "";
  if (score === 0 || (score === 1 && sex === "female")) {
    comment = "低リスク群（男性0点、女性1点程度）";
  } else if (score === 1 || score === 2) {
    comment = "中間リスク（年齢や併存症により抗凝固を検討）";
  } else {
    comment = "高リスク（抗凝固療法の適応が強く示唆されます）";
  }

  resultElem.innerHTML =
    `CHA₂DS₂-VAScスコア: <strong>${score}</strong><br>` +
    `臨床的コメント: ${comment}<br>` +
    `<span style="font-size:0.8rem; color:#666;">` +
    `※ 実際の治療方針はガイドラインと個々の患者背景に基づき総合的に判断してください。` +
    `</span>`;
}

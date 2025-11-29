// has-bled.js
// HAS-BLED スコア計算

function calculateHASBLED() {
  const h = document.getElementById("has-hypertension").checked;
  const renal = document.getElementById("has-renal").checked;
  const liver = document.getElementById("has-liver").checked;
  const stroke = document.getElementById("has-stroke").checked;
  const bleeding = document.getElementById("has-bleeding").checked;
  const labile = document.getElementById("has-labile").checked;
  const elderly = document.getElementById("has-elderly").checked;
  const drugs = document.getElementById("has-drugs").checked;
  const alcohol = document.getElementById("has-alcohol").checked;

  const resultElem = document.getElementById("has-result");

  let score = 0;
  if (h) score += 1;
  if (renal) score += 1;
  if (liver) score += 1;
  if (stroke) score += 1;
  if (bleeding) score += 1;
  if (labile) score += 1;
  if (elderly) score += 1;
  if (drugs) score += 1;
  if (alcohol) score += 1;

  let riskComment = "";
  if (score <= 1) {
    riskComment = "低リスク（年間大出血リスク ≒1% 前後）";
  } else if (score === 2) {
    riskComment = "中等度リスク（年間大出血リスク ≒2% 前後）";
  } else {
    riskComment = "高リスク（年間大出血リスク ≧3% とされます）";
  }

  resultElem.innerHTML =
    `HAS-BLEDスコア: <strong>${score}</strong><br>` +
    `リスク評価: ${riskComment}<br>` +
    `<span style="font-size:0.8rem; color:#666;">` +
    `※ HAS-BLED は「出血ハイリスクだから抗凝固を中止する」というより、` +
    `修正可能な危険因子の是正に用いるスコアです。` +
    `</span>`;
}

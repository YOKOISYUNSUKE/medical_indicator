// syntax.js
// SYNTAXスコア簡易リスク分類

function calculateSyntaxRisk() {
  const input = document.getElementById("syntax-score");
  const { value: score, error } = parseNumericInput(
    input,
    RANGE_PRESETS.SYNTAX_SCORE
  );

  const resultElem = document.getElementById("syntax-result");
  const interpretElem = document.getElementById("syntax-interpret");

  if (error || Number.isNaN(score)) {
    resultElem.textContent = "入力エラー：SYNTAXスコアを確認してください。";
    interpretElem.textContent = "";
    return;
  }

  let category = "";
  let msg = "";

  if (score <= 22) {
    category = "低リスク（≤22）";
    msg = "多くの症例でPCI単独も検討される低リスク領域とされます。";
  } else if (score <= 32) {
    category = "中等度リスク（23–32）";
    msg = "PCIとCABGのいずれも選択肢となり得る中等度リスク群です。その他の臨床因子と併せて治療方針を検討します。";
  } else {
    category = "高リスク（≥33）";
    msg = "一般にCABGが優先されることの多い高リスク群とされます。ハートチームでの慎重な議論が必要です。";
  }

  resultElem.textContent = `SYNTAXスコア：${score}（${category}）`;
  interpretElem.textContent = msg;
}

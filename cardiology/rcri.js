// rcri.js
// Revised Cardiac Risk Index

function calculateRCRI() {
  const resultElem = document.getElementById("rcri-result");
  const interpretElem = document.getElementById("rcri-interpret");

  const ids = [
    "rcri-highrisk",
    "rcri-ihd",
    "rcri-chf",
    "rcri-cva",
    "rcri-insulin",
  ];

  let score = 0;

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    score += parseBooleanInput(el); // on=1, off=0
  });

  // 術前Cr > 2.0 mg/dL で +1点
  const creInput = document.getElementById("rcri-cre");
  const { value: cre, error: creError } = parseNumericInput(
    creInput,
    RANGE_PRESETS.CREATININE
  );

  if (creError || Number.isNaN(cre)) {
    resultElem.textContent = "入力エラー：クレアチニン値を確認してください。";
    interpretElem.textContent = "";
    return;
  }

  if (cre > 2.0) {
    score += 1;
  }

  let cls = "";
  let msg = "";

  if (score === 0) {
    cls = "クラス I（0点）";
    msg = "周術期心血管イベントリスクは比較的低い群とされます。";
  } else if (score === 1) {
    cls = "クラス II（1点）";
    msg = "軽度にリスクが上昇する群であり、標準的なモニタリングが推奨されます。";
  } else if (score === 2) {
    cls = "クラス III（2点）";
    msg = "中等度リスク群であり、術前評価・周術期管理の強化を検討します。";
  } else {
    cls = `クラス IV（${score}点）`;
    msg = "高リスク群であり、手術の適応や周術期の管理について心臓内科・麻酔科と綿密な協議が必要です。";
  }

  resultElem.textContent = `RCRIスコア：${score} 点（${cls}）`;
  interpretElem.textContent = msg;
}

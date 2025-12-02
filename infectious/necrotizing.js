// necrotizing.js
// 壊死性軟部組織感染症：LRINEC スコア専用

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("lrinec-calc-btn");
  if (btn) {
    btn.addEventListener("click", calculateLRINEC_Nec);
  }
});

function parseNumberWithFallbackNec(input, options = {}) {
  if (typeof parseNumericInput === "function") {
    const parsed = parseNumericInput(input, options);
    if (parsed.error) return { value: NaN, ok: false };
    return { value: parsed.value, ok: true };
  }
  const raw = input.value.trim();
  if (!raw) {
    alert("値を入力してください。");
    input.focus();
    return { value: NaN, ok: false };
  }
  const num = Number(raw);
  if (Number.isNaN(num)) {
    alert("数値で入力してください。");
    input.focus();
    return { value: NaN, ok: false };
  }
  return { value: num, ok: true };
}

function calculateLRINEC_Nec() {
  const crpInput = document.getElementById("lrinec-crp");
  const wbcInput = document.getElementById("lrinec-wbc");
  const hbInput = document.getElementById("lrinec-hb");
  const naInput = document.getElementById("lrinec-na");
  const crInput = document.getElementById("lrinec-cr");
  const gluInput = document.getElementById("lrinec-glu");

  const resultEl = document.getElementById("lrinec-result");
  const interpretEl = document.getElementById("lrinec-interpret");
  if (!crpInput || !wbcInput || !hbInput || !naInput || !crInput || !gluInput) return;
  if (!resultEl || !interpretEl) return;

  const crpParsed = parseNumberWithFallbackNec(
    crpInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.CRP : {}
  );
  if (!crpParsed.ok) return;

  const wbcParsed = parseNumberWithFallbackNec(
    wbcInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.WBC : {}
  );
  if (!wbcParsed.ok) return;

  const hbParsed = parseNumberWithFallbackNec(hbInput);
  if (!hbParsed.ok) return;

  const naParsed = parseNumberWithFallbackNec(
    naInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.SODIUM : {}
  );
  if (!naParsed.ok) return;

  const crParsed = parseNumberWithFallbackNec(
    crInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.CREATININE : {}
  );
  if (!crParsed.ok) return;

  const gluParsed = parseNumberWithFallbackNec(
    gluInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.GLUCOSE : {}
  );
  if (!gluParsed.ok) return;

  const crp = crpParsed.value;
  const wbc = wbcParsed.value;
  const hb = hbParsed.value;
  const na = naParsed.value;
  const cr = crParsed.value;
  const glu = gluParsed.value;

  let score = 0;

  if (crp >= 15) score += 4;
  if (wbc >= 15 && wbc <= 25) score += 1;
  else if (wbc > 25) score += 2;
  if (hb >= 11 && hb <= 13.5) score += 1;
  else if (hb < 11) score += 2;
  if (na < 135) score += 2;
  if (cr > 1.6) score += 2;
  if (glu > 180) score += 1;

  let risk = "";
  let comment = "";

  if (score <= 5) {
    risk = "低リスク";
    comment =
      "LRINEC ≤5 ですが、痛みの程度や進行の速さなど臨床的に疑わしければ壊死性筋膜炎を完全には否定できません。";
  } else if (score <= 7) {
    risk = "中等度リスク";
    comment =
      "LRINEC 6–7：壊死性筋膜炎を強く疑い、CT/MRI や外科コンサルトを緊急に検討します。";
  } else {
    risk = "高リスク";
    comment =
      "LRINEC ≥8：壊死性軟部組織感染症の可能性が高い層です。即時の外科的評価とデブリドマンを至急検討すべき状態です。";
  }

  resultEl.textContent = `LRINEC スコア：${score} 点（${risk}）`;
  interpretEl.textContent =
    comment + " スコアが低値でも臨床的に疑わしければ、決して手術介入を遅らせないよう注意してください。";
}

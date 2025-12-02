// softtissue.js
// 軟部組織感染症：ALT-70 / LRINEC スコア

document.addEventListener("DOMContentLoaded", () => {
  const altBtn = document.getElementById("alt70-calc-btn");
  const lrinecBtn = document.getElementById("lrinec-calc-btn");

  if (altBtn) {
    altBtn.addEventListener("click", calculateALT70);
  }
  if (lrinecBtn) {
    lrinecBtn.addEventListener("click", calculateLRINEC);
  }
});

// 数値入力共通ヘルパー
function parseNumberWithFallback(input, options = {}) {
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

// ALT-70：Asymmetry (3), Leukocytosis (1), Tachycardia (1), Age ≥70 (2)
function calculateALT70() {
  const ageInput = document.getElementById("alt70-age");
  const resultEl = document.getElementById("alt70-result");
  const interpretEl = document.getElementById("alt70-interpret");
  if (!ageInput || !resultEl || !interpretEl) return;

  const ageParsed = parseNumberWithFallback(
    ageInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.AGE : {}
  );
  if (!ageParsed.ok) return;
  const age = ageParsed.value;

  const asym = document.querySelector('input[name="alt70-asym"]:checked');
  const wbc = document.querySelector('input[name="alt70-wbc"]:checked');
  const hr = document.querySelector('input[name="alt70-hr"]:checked');

  let score = 0;

  if (asym && asym.value === "yes") score += 3;
  if (wbc && wbc.value === "yes") score += 1;
  if (hr && hr.value === "yes") score += 1;
  if (age >= 70) score += 2;

  let category = "";
  let detail = "";

  if (score <= 2) {
    category = "Cellulitis 不確実（むしろ偽蜂窩織炎が多い層）";
    detail =
      "原著では ALT-70 が 0–2 点の患者の多くは pseudocellulitis とされます。蜂窩織炎以外の鑑別（静脈うっ滞性皮膚炎など）を優先して検討します。";
  } else if (score <= 4) {
    category = "判定困難ゾーン";
    detail =
      "3–4 点では蜂窩織炎と偽蜂窩織炎が入り混じる層です。皮膚科コンサルトや追加検査を検討します。";
  } else {
    category = "Cellulitis が強く示唆される層";
    detail =
      "5–7 点では真の蜂窩織炎である可能性が高いとされます。臨床像に応じて経験的抗菌薬投与を検討します。";
  }

  resultEl.textContent = `ALT-70 スコア：${score} 点`;
  interpretEl.textContent =
    `${category} とされます。` +
    " ただし ALT-70 は補助指標であり、画像所見や経過・基礎疾患を含めた総合判断が必須です。";
}

// LRINEC スコア（0–13点）
function calculateLRINEC() {
  const crpInput = document.getElementById("lrinec-crp"); // mg/dL （15 mg/dL = 150 mg/L）
  const wbcInput = document.getElementById("lrinec-wbc"); // ×10^3/μL
  const hbInput = document.getElementById("lrinec-hb");   // g/dL
  const naInput = document.getElementById("lrinec-na");   // mEq/L
  const crInput = document.getElementById("lrinec-cr");   // mg/dL
  const gluInput = document.getElementById("lrinec-glu"); // mg/dL

  const resultEl = document.getElementById("lrinec-result");
  const interpretEl = document.getElementById("lrinec-interpret");
  if (!resultEl || !interpretEl) return;

  // それぞれ数値パース
  const crpParsed = parseNumberWithFallback(
    crpInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.CRP : {}
  );
  if (!crpParsed.ok) return;

  const wbcParsed = parseNumberWithFallback(
    wbcInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.WBC : {}
  );
  if (!wbcParsed.ok) return;

  const hbParsed = parseNumberWithFallback(hbInput);
  if (!hbParsed.ok) return;

  const naParsed = parseNumberWithFallback(
    naInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.SODIUM : {}
  );
  if (!naParsed.ok) return;

  const crParsed = parseNumberWithFallback(
    crInput,
    typeof RANGE_PRESETS !== "undefined" ? RANGE_PRESETS.CREATININE : {}
  );
  if (!crParsed.ok) return;

  const gluParsed = parseNumberWithFallback(
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

  // CRP: mg/L >=150 → 4点 → mg/dL では >=15
  if (crp >= 15) score += 4;

  // WBC (×10^3/μL)
  if (wbc >= 15 && wbc <= 25) score += 1;
  else if (wbc > 25) score += 2;

  // Hb (g/dL)
  if (hb >= 11 && hb <= 13.5) score += 1;
  else if (hb < 11) score += 2;

  // Na (mEq/L)
  if (na < 135) score += 2;

  // Cr (mg/dL) >1.6 → 2点
  if (cr > 1.6) score += 2;

  // Glu (mg/dL) >180 → 1点
  if (glu > 180) score += 1;

  let risk = "";
  let comment = "";

  if (score <= 5) {
    risk = "低リスク（Low risk）";
    comment =
      "LRINEC ≤5 でも壊死性筋膜炎を完全には否定できませんが、リスクは比較的低い層とされています。";
  } else if (score <= 7) {
    risk = "中等度リスク（Intermediate risk）";
    comment =
      "LRINEC 6–7 では壊死性筋膜炎を強く疑い、外科コンサルト・画像検査を積極的に検討すべき層です。";
  } else {
    risk = "高リスク（High risk）";
    comment =
      "LRINEC ≥8 は壊死性筋膜炎を強く示唆するとされます。即時の外科評価とデブリドマンの検討が必要です。";
  }

  resultEl.textContent = `LRINEC スコア：${score} 点（${risk}）`;
  interpretEl.textContent =
    comment +
    " LRINEC は補助的ツールに過ぎず、痛みの不釣り合いなどの臨床所見を常に最優先してください。";
}

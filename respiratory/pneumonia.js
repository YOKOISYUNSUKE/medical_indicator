// 肺炎重症度スコア計算 JS
// A-DROP / CURB-65 / PSI
// score-utils.js の Boolean / 数値ヘルパーを積極的に利用する実装

// 1. Boolean入力を 1/0 に変換するヘルパー
function boolFlag(id) {
  const el = document.getElementById(id);
  if (!el) return 0;

  // score-utils.js が読み込まれている場合
  if (typeof parseBooleanInput === "function") {
    return parseBooleanInput(el);
  }
  return el.checked ? 1 : 0;
}

// 2. スコア表示用の共通ヘルパー（リスク色も付与）
function setScoreResult(resultEl, baseClassName, severityClass, text) {
  if (!resultEl) return;
  resultEl.className = baseClassName; // まずリセット
  if (severityClass) {
    resultEl.classList.add(severityClass);
  }
  resultEl.textContent = text;
}

// 3. A-DROP 計算
function calculateADROP() {
  const score =
    boolFlag("adrop-age") +
    boolFlag("adrop-dehydration") +
    boolFlag("adrop-resp") +
    boolFlag("adrop-orientation") +
    boolFlag("adrop-pressure");

  let severity = "";
  let detail = "";
  let riskClass = "";

  if (score === 0) {
    severity = "軽症";
    detail = "通常は外来治療が可能とされます。";
    riskClass = "risk-low";
  } else if (score === 1 || score === 2) {
    severity = "中等症";
    detail = "原則として入院が推奨されるレベルです。";
    riskClass = "risk-mid";
  } else if (score === 3) {
    severity = "重症";
    detail = "集中治療の適応も含めて検討される重症度です。";
    riskClass = "risk-high";
  } else {
    severity = "超重症";
    detail = "ICU 管理を含めた積極的治療が検討されます。";
    riskClass = "risk-high";
  }

  const result = document.getElementById("adrop-result");
  const detailEl = document.getElementById("adrop-detail");

  setScoreResult(
    result,
    "score-result",
    riskClass,
    `スコア：${score}　重症度：${severity}`
  );
  if (detailEl) {
    detailEl.textContent = detail;
  }
}

// 4. CURB-65 計算
function calculateCURB65() {
  const score =
    boolFlag("curb-confusion") +
    boolFlag("curb-urea") +
    boolFlag("curb-rr") +
    boolFlag("curb-bp") +
    boolFlag("curb-age");

  let severity = "";
  let detail = "";
  let riskClass = "";

  if (score <= 1) {
    severity = "低リスク";
    detail =
      "多くは外来フォローで良いとされますが、全身状態や基礎疾患を考慮してください。";
    riskClass = "risk-low";
  } else if (score === 2) {
    severity = "中等度リスク";
    detail = "入院または厳密な外来フォローが推奨されます。";
    riskClass = "risk-mid";
  } else {
    severity = "高リスク";
    detail =
      "入院治療が推奨され、スコア 4–5 では ICU など高次医療の検討が必要です。";
    riskClass = "risk-high";
  }

  const result = document.getElementById("curb-result");
  const detailEl = document.getElementById("curb-detail");

  setScoreResult(
    result,
    "score-result",
    riskClass,
    `スコア：${score}　重症度：${severity}`
  );
  if (detailEl) {
    detailEl.textContent = detail;
  }
}

// 5. PSI（Pneumonia Severity Index）計算
function calculatePSI() {
  const ageInput = document.getElementById("psi-age");
  if (!ageInput) {
    alert("PSI：年齢入力が見つかりません（id=psi-age）。");
    return;
  }

  let age = null;
  let parseOk = true;

  if (
    typeof parseNumericInput === "function" &&
    typeof RANGE_PRESETS !== "undefined"
  ) {
    const parsed = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    age = parsed.value;
    if (parsed.error) {
      parseOk = false;
    }
  } else {
    const v = Number(ageInput.value);
    if (!v || Number.isNaN(v) || v <= 0) {
      alert("PSI：年齢を入力してください。");
      ageInput.focus();
      parseOk = false;
    } else {
      age = v;
    }
  }

  if (!parseOk || age == null) {
    return;
  }

  const sexEl = document.querySelector("input[name='psi-sex']:checked");
  const sex = sexEl ? sexEl.value : "male";

  const hasNursing = boolFlag("psi-nursing");

  const hasNeoplastic = boolFlag("psi-neoplastic");
  const hasLiver = boolFlag("psi-liver");
  const hasCHF = boolFlag("psi-chf");
  const hasCVD = boolFlag("psi-cvd");
  const hasRenal = boolFlag("psi-renal");

  const hasAMS = boolFlag("psi-ams");
  const hasPulse125 = boolFlag("psi-pulse125");
  const hasRR30 = boolFlag("psi-rr30");
  const hasSBP90 = boolFlag("psi-sbp90");
  const hasTempExtreme = boolFlag("psi-temp-extreme");

  const hasPhLow = boolFlag("psi-ph-low");
  const hasBUNHigh = boolFlag("psi-bun-high");
  const hasNaLow = boolFlag("psi-na-low");
  const hasGluHigh = boolFlag("psi-glu-high");
  const hasHctLow = boolFlag("psi-hct-low");
  const hasPaO2Low = boolFlag("psi-pao2-low");
  const hasEffusion = boolFlag("psi-effusion");

  const step1HasRisk =
    age > 50 ||
    !!(
      hasAMS ||
      hasPulse125 ||
      hasRR30 ||
      hasSBP90 ||
      hasTempExtreme ||
      hasNeoplastic ||
      hasCHF ||
      hasCVD ||
      hasRenal ||
      hasLiver
    );

  let score = 0;
  let riskClass = "";
  let recommendation = "";
  let riskColorClass = "";

  if (!step1HasRisk) {
    riskClass = "I（最軽症）";
    score = 0;
    recommendation = "PSI クラス I：原法では外来治療が推奨される層です。";
    riskColorClass = "risk-low";
  } else {
    if (sex === "male") {
      score += age;
    } else {
      score += Math.max(age - 10, 0);
    }

    if (hasNursing) score += 10;

    if (hasNeoplastic) score += 30;
    if (hasLiver) score += 20;
    if (hasCHF) score += 10;
    if (hasCVD) score += 10;
    if (hasRenal) score += 10;

    if (hasAMS) score += 20;
    if (hasPulse125) score += 10;
    if (hasRR30) score += 20;
    if (hasSBP90) score += 20;
    if (hasTempExtreme) score += 15;

    if (hasPhLow) score += 30;
    if (hasBUNHigh) score += 20;
    if (hasNaLow) score += 20;
    if (hasGluHigh) score += 10;
    if (hasHctLow) score += 10;
    if (hasPaO2Low) score += 10;
    if (hasEffusion) score += 10;

    if (score <= 70) {
      riskClass = "II（低リスク）";
      recommendation = "PSI クラス II：原法では外来治療が推奨される層です。";
      riskColorClass = "risk-low";
    } else if (score <= 90) {
      riskClass = "III（低〜中等度リスク）";
      recommendation = "PSI クラス III：外来か短期入院観察を検討する層です。";
      riskColorClass = "risk-mid";
    } else if (score <= 130) {
      riskClass = "IV（中等度〜高リスク）";
      recommendation = "PSI クラス IV：入院加療が推奨される層です。";
      riskColorClass = "risk-high";
    } else {
      riskClass = "V（高リスク）";
      recommendation =
        "PSI クラス V：入院加療（しばしば ICU を含めて）が推奨される層です。";
      riskColorClass = "risk-high";
    }
  }

  const resultEl = document.getElementById("psi-result");
  const detailEl = document.getElementById("psi-detail");

  setScoreResult(
    resultEl,
    "score-result",
    riskColorClass,
    `PSIスコア：${score}　リスククラス：${riskClass}`
  );

  if (detailEl) {
    detailEl.textContent =
      recommendation +
      " 実際の入院適応や治療方針の決定では、全身状態・社会的要因・各国のガイドライン等も必ず併せて評価してください。";
  }
}

// 6. ボタンと関数を接続（スマホでの誤タップを減らすため、イベントリスナー方式）
document.addEventListener("DOMContentLoaded", () => {
  const adropBtn = document.getElementById("adrop-calc-btn");
  const curbBtn = document.getElementById("curb-calc-btn");
  const psiBtn = document.getElementById("psi-calc-btn");

  if (adropBtn) {
    adropBtn.addEventListener("click", calculateADROP);
  }
  if (curbBtn) {
    curbBtn.addEventListener("click", calculateCURB65);
  }
  if (psiBtn) {
    psiBtn.addEventListener("click", calculatePSI);
  }
});

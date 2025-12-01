// 肺炎重症度：A-DROP / CURB-65 計算ロジック

// A-DROP 計算
function calculateADROP() {
  let score = 0;

  if (document.getElementById("adrop-age").checked) score++;
  if (document.getElementById("adrop-dehydration").checked) score++;
  if (document.getElementById("adrop-resp").checked) score++;
  if (document.getElementById("adrop-orientation").checked) score++;
  if (document.getElementById("adrop-pressure").checked) score++;

  let severity = "";
  let detail = "";

  // 日本呼吸器学会 A-DROP 基準に基づく重症度分類（概略）
  if (score === 0) {
    severity = "軽症";
    detail = "通常は外来治療が可能とされます。";
  } else if (score === 1 || score === 2) {
    severity = "中等症";
    detail = "原則として入院が推奨されるレベルです。";
  } else if (score === 3) {
    severity = "重症";
    detail = "集中治療の適応も含めて検討される重症度です。";
  } else { // 4–5
    severity = "超重症";
    detail = "ICU 管理を含めた積極的治療が検討されます。";
  }

  const result = document.getElementById("adrop-result");
  const detailEl = document.getElementById("adrop-detail");

  result.textContent = `スコア：${score}　重症度：${severity}`;
  detailEl.textContent = detail;
}


// CURB-65 計算
function calculateCURB65() {
  let score = 0;

  if (document.getElementById("curb-confusion").checked) score++;
  if (document.getElementById("curb-urea").checked) score++;
  if (document.getElementById("curb-rr").checked) score++;
  if (document.getElementById("curb-bp").checked) score++;
  if (document.getElementById("curb-age").checked) score++;

  let severity = "";
  let detail = "";

  // CURB-65 の一般的なリスク層別（概略）
  if (score <= 1) {
    severity = "低リスク";
    detail = "多くは外来フォローで良いとされますが、全身状態や基礎疾患を考慮してください。";
  } else if (score === 2) {
    severity = "中等度リスク";
    detail = "入院または厳密な外来フォローが推奨されます。";
  } else { // 3–5
    severity = "高リスク";
    detail = "入院治療が推奨され、スコア 4–5 では ICU など高次医療の検討が必要です。";
  }

  const result = document.getElementById("curb-result");
  const detailEl = document.getElementById("curb-detail");

  result.textContent = `スコア：${score}　重症度：${severity}`;
  detailEl.textContent = detail;
}

// PSI（Pneumonia Severity Index）計算
function calculatePSI() {
  // 1. 入力値取得
  const ageInput = document.getElementById("psi-age");
  

   let age;
   // score-utils.js が正常に読み込まれている場合は共通ヘルパーを使用
   if (typeof parseNumericInput === "function" && typeof RANGE_PRESETS !== "undefined") {
     const parsed = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
     age = parsed.value;
     if (parsed.error) {
       // parseNumericInput 内でエラー表示・スタイルが付与されるのでここでは何もしない
       return;
     }
   } else {
     // フォールバック：単純な数値パース（古いブラウザや score-utils.js 不読み込み時でも動かす）
     age = Number(ageInput.value);
     if (!age || Number.isNaN(age) || age <= 0) {
       alert("PSI：年齢を入力してください。");
       ageInput.focus();
       return;
     }
   }

  const sexEl = document.querySelector("input[name='psi-sex']:checked");
  const sex = sexEl ? sexEl.value : "male";


  const hasNursing = document.getElementById("psi-nursing").checked;

  // 基礎疾患
  const hasNeoplastic = document.getElementById("psi-neoplastic").checked;
  const hasLiver = document.getElementById("psi-liver").checked;
  const hasCHF = document.getElementById("psi-chf").checked;
  const hasCVD = document.getElementById("psi-cvd").checked;
  const hasRenal = document.getElementById("psi-renal").checked;

  // 身体所見
  const hasAMS = document.getElementById("psi-ams").checked;
  const hasPulse125 = document.getElementById("psi-pulse125").checked;
  const hasRR30 = document.getElementById("psi-rr30").checked;
  const hasSBP90 = document.getElementById("psi-sbp90").checked;
  const hasTempExtreme = document.getElementById("psi-temp-extreme").checked;

  // 検査所見
  const hasPhLow = document.getElementById("psi-ph-low").checked;
  const hasBUNHigh = document.getElementById("psi-bun-high").checked;
  const hasNaLow = document.getElementById("psi-na-low").checked;
  const hasGluHigh = document.getElementById("psi-glu-high").checked;
  const hasHctLow = document.getElementById("psi-hct-low").checked;
  const hasPaO2Low = document.getElementById("psi-pao2-low").checked;
  const hasEffusion = document.getElementById("psi-effusion").checked;

  // 2. Step 1: クラス I 判定
  //  年齢 >50, 基礎疾患, バイタル異常がすべて「なし」なら Risk Class I
  //  ※原法通りに、Step1 で Class I を先に判定
  const step1HasRisk =
    (age > 50) ||
    hasAMS || hasPulse125 || hasRR30 || hasSBP90 || hasTempExtreme ||
    hasNeoplastic || hasCHF || hasCVD || hasRenal || hasLiver;

  let score = 0;
  let riskClass = "";
  let recommendation = "";

  if (!step1HasRisk) {
    // Risk Class I
    riskClass = "I（最軽症）";
    score = 0; // 原法では点数計算を行わずクラス分類のみ
    recommendation = "PSI クラス I：原法では外来治療が推奨される層です。";
  } else {
    // 3. Step 2: ポイント計算（Wikipedia / Fine ら原法に基づく）
    // Demographics
    if (sex === "male") {
      score += age;
    } else {
      score += Math.max(age - 10, 0);
    }

    if (hasNursing) score += 10;

    // Comorbidities
    if (hasNeoplastic) score += 30;
    if (hasLiver) score += 20;
    if (hasCHF) score += 10;
    if (hasCVD) score += 10;
    if (hasRenal) score += 10;

    // Physical exam
    if (hasAMS) score += 20;
    if (hasPulse125) score += 10;
    if (hasRR30) score += 20;
    if (hasSBP90) score += 20;
    if (hasTempExtreme) score += 15;

    // Labs & radiology
    if (hasPhLow) score += 30;
    if (hasBUNHigh) score += 20;
    if (hasNaLow) score += 20;
    if (hasGluHigh) score += 10;
    if (hasHctLow) score += 10;
    if (hasPaO2Low) score += 10;
    if (hasEffusion) score += 10;

    // 4. リスククラス分類
    //  Class II: ≤70, III: 71–90, IV: 91–130, V: ≥131
    if (score <= 70) {
      riskClass = "II（低リスク）";
      recommendation = "PSI クラス II：原法では外来治療が推奨される層です。";
    } else if (score <= 90) {
      riskClass = "III（低〜中等度リスク）";
      recommendation = "PSI クラス III：外来か短期入院観察を検討する層です。";
    } else if (score <= 130) {
      riskClass = "IV（中等度〜高リスク）";
      recommendation = "PSI クラス IV：入院加療が推奨される層です。";
    } else {
      riskClass = "V（高リスク）";
      recommendation = "PSI クラス V：入院加療（しばしば ICU を含めて）が推奨される層です。";
    }
  }

  const resultEl = document.getElementById("psi-result");
  const detailEl = document.getElementById("psi-detail");

  resultEl.textContent = `PSIスコア：${score}　リスククラス：${riskClass}`;
  detailEl.textContent =
    recommendation +
    " 実際の入院適応や治療方針の決定では、全身状態・社会的要因・各国のガイドライン等も必ず併せて評価してください。";
}

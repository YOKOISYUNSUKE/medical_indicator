// pneumonia.js
// 肺炎重症度：A-DROP / CURB-65 / PSI（Fine スコア）
// score-utils.js の RANGE_PRESETS / parseNumericInput を利用

document.addEventListener("DOMContentLoaded", () => {
  // --- 要素取得 ---
  // A-DROP
  const adropAge = document.getElementById("adrop-age");
  const adropDehydration = document.getElementById("adrop-dehydration");
  const adropResp = document.getElementById("adrop-resp");
  const adropOrientation = document.getElementById("adrop-orientation");
  const adropPressure = document.getElementById("adrop-pressure");
  const adropCalcBtn = document.getElementById("adrop-calc-btn");
  const adropResult = document.getElementById("adrop-result");
  const adropDetail = document.getElementById("adrop-detail");

  // CURB-65
  const curbConfusion = document.getElementById("curb-confusion");
  const curbUrea = document.getElementById("curb-urea");
  const curbRr = document.getElementById("curb-rr");
  const curbBp = document.getElementById("curb-bp");
  const curbAge = document.getElementById("curb-age");
  const curbCalcBtn = document.getElementById("curb-calc-btn");
  const curbResult = document.getElementById("curb-result");
  const curbDetail = document.getElementById("curb-detail");

  // PSI
  const psiAge = document.getElementById("psi-age");
  const psiSexRadios = document.querySelectorAll('input[name="psi-sex"]');
  const psiNursing = document.getElementById("psi-nursing");

  const psiNeoplastic = document.getElementById("psi-neoplastic");
  const psiLiver = document.getElementById("psi-liver");
  const psiChf = document.getElementById("psi-chf");
  const psiCvd = document.getElementById("psi-cvd");
  const psiRenal = document.getElementById("psi-renal");

  const psiAms = document.getElementById("psi-ams");
  const psiPulse125 = document.getElementById("psi-pulse125");
  const psiRr30 = document.getElementById("psi-rr30");
  const psiSbp90 = document.getElementById("psi-sbp90");
  const psiTempExtreme = document.getElementById("psi-temp-extreme");

  const psiPhLow = document.getElementById("psi-ph-low");
  const psiBunHigh = document.getElementById("psi-bun-high");
  const psiNaLow = document.getElementById("psi-na-low");
  const psiGluHigh = document.getElementById("psi-glu-high");
  const psiHctLow = document.getElementById("psi-hct-low");
  const psiPao2Low = document.getElementById("psi-pao2-low");
  const psiEffusion = document.getElementById("psi-effusion");

  const psiCalcBtn = document.getElementById("psi-calc-btn");
  const psiResult = document.getElementById("psi-result");
  const psiDetail = document.getElementById("psi-detail");

  // --- 共通項目の連携ロジック ---

  // 1) PSI 年齢 + 性別 → A-DROP 年齢 / CURB-65 Age
  function getPsiSexValue() {
    let val = "male";
    psiSexRadios.forEach((r) => {
      if (r.checked) {
        val = r.value;
      }
    });
    return val;
  }

  function updateAgeDerivedCheckboxes() {
    if (!psiAge) return;

    // 入力中はエラーを出し過ぎないよう allowEmpty: true
    const { value } = parseNumericInput(psiAge, {
      min: RANGE_PRESETS.AGE.min,
      max: RANGE_PRESETS.AGE.max,
      allowEmpty: true,
    });

    if (value == null || Number.isNaN(value)) {
      if (adropAge) adropAge.checked = false;
      if (curbAge) curbAge.checked = false;
      return;
    }

    const sex = getPsiSexValue();
    const isAdropAge =
      (sex === "male" && value >= 70) || (sex === "female" && value >= 75);
    const isCurbAge = value >= 65;

    if (adropAge) adropAge.checked = isAdropAge;
    if (curbAge) curbAge.checked = isCurbAge;
  }

  if (psiAge) {
    psiAge.addEventListener("input", updateAgeDerivedCheckboxes);
  }
  psiSexRadios.forEach((r) => {
    r.addEventListener("change", updateAgeDerivedCheckboxes);
  });

  // 2) 意識障害（A-DROP Orientation / CURB Confusion / PSI AMS）同期
  let syncingConsciousness = false;
  function syncConsciousness(source) {
    if (syncingConsciousness) return;
    syncingConsciousness = true;

    const checked = !!source.checked;
    [adropOrientation, curbConfusion, psiAms].forEach((el) => {
      if (el && el !== source) {
        el.checked = checked;
      }
    });

    syncingConsciousness = false;
  }

  [adropOrientation, curbConfusion, psiAms].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => syncConsciousness(el));
  });

  // 3) BUN/脱水関連（A-DROP Dehydration / CURB Urea / PSI BUN 高値）同期
  let syncingBun = false;
  function syncBun(source) {
    if (syncingBun) return;
    syncingBun = true;

    const checked = !!source.checked;
    [adropDehydration, curbUrea, psiBunHigh].forEach((el) => {
      if (el && el !== source) {
        el.checked = checked;
      }
    });

    syncingBun = false;
  }

  [adropDehydration, curbUrea, psiBunHigh].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => syncBun(el));
  });

  // --- A-DROP 計算 ---
  function calcADROP() {
    let score = 0;
    if (adropAge?.checked) score += 1;
    if (adropDehydration?.checked) score += 1;
    if (adropResp?.checked) score += 1;
    if (adropOrientation?.checked) score += 1;
    if (adropPressure?.checked) score += 1;

    let severity = "";
    let note = "";

    if (score === 0) {
      severity = "軽症";
      note = "外来治療を基本とします。";
    } else if (score === 1 || score === 2) {
      severity = "中等症";
      note = "入院治療や慎重な経過観察を検討します。";
    } else if (score === 3) {
      severity = "重症";
      note = "原則入院、集中治療室の必要性も評価します。";
    } else {
      severity = "超重症";
      note = "集中治療室管理を強く検討します。";
    }

    if (adropResult) {
      adropResult.textContent = `スコア：${score}　重症度：${severity}`;
    }
    if (adropDetail) {
      adropDetail.textContent = note;
    }
  }

  if (adropCalcBtn) {
    adropCalcBtn.addEventListener("click", calcADROP);
  }

  // --- CURB-65 計算 ---
  function calcCURB65() {
    let score = 0;
    if (curbConfusion?.checked) score += 1;
    if (curbUrea?.checked) score += 1;
    if (curbRr?.checked) score += 1;
    if (curbBp?.checked) score += 1;
    if (curbAge?.checked) score += 1;

    let severity = "";
    let note = "";

    if (score <= 1) {
      severity = "低リスク (0–1)";
      note = "多くは外来治療が可能とされますが、臨床状況を考慮してください。";
    } else if (score === 2) {
      severity = "中等度リスク (2)";
      note = "入院治療を強く検討します。";
    } else {
      severity = "高リスク (3–5)";
      note = "入院・集中治療室管理を含めた集中的治療を検討します。";
    }

    if (curbResult) {
      curbResult.textContent = `スコア：${score}　重症度：${severity}`;
    }
    if (curbDetail) {
      curbDetail.textContent = note;
    }
  }

  if (curbCalcBtn) {
    curbCalcBtn.addEventListener("click", calcCURB65);
  }

  // --- PSI (Fine スコア) 計算 ---
  function calcPSI() {
    if (!psiAge) return;

    const { value, error } = parseNumericInput(psiAge, {
      min: RANGE_PRESETS.AGE.min,
      max: RANGE_PRESETS.AGE.max,
      allowEmpty: false,
    });
    if (error || Number.isNaN(value)) {
      return;
    }

    const sex = getPsiSexValue();
    let score = 0;

    // 1. 年齢・性別・施設入所
    if (sex === "male") {
      score += value;
    } else {
      score += value - 10; // 女性は年齢-10
    }
    if (psiNursing?.checked) score += 10;

    // 2. 基礎疾患
    if (psiNeoplastic?.checked) score += 30;
    if (psiLiver?.checked) score += 20;
    if (psiChf?.checked) score += 10;
    if (psiCvd?.checked) score += 10;
    if (psiRenal?.checked) score += 10;

    // 3. 身体所見
    if (psiAms?.checked) score += 20;
    if (psiRr30?.checked) score += 20;
    if (psiSbp90?.checked) score += 20;
    if (psiTempExtreme?.checked) score += 15;
    if (psiPulse125?.checked) score += 10;

    // 4. 検査所見
    if (psiPhLow?.checked) score += 30;
    if (psiBunHigh?.checked) score += 20;
    if (psiNaLow?.checked) score += 20;
    if (psiGluHigh?.checked) score += 10;
    if (psiHctLow?.checked) score += 10;
    if (psiPao2Low?.checked) score += 10;
    if (psiEffusion?.checked) score += 10;

    // リスククラス
    let riskClass = "";
    let note = "";

    if (score <= 50) {
      riskClass = "II（低リスク）";
      note = "多くは外来治療が可能とされる層です。";
    } else if (score <= 70) {
      riskClass = "III（中等度リスク）";
      note = "短期入院や慎重な経過観察を検討します。";
    } else if (score <= 90) {
      riskClass = "IV（高リスク）";
      note = "原則入院治療が推奨される層です。";
    } else {
      riskClass = "V（超高リスク）";
      note = "集中治療室を含めた集中的管理を検討します。";
    }

    if (psiResult) {
      psiResult.textContent = `PSIスコア：${score}　リスククラス：${riskClass}`;
    }
    if (psiDetail) {
      psiDetail.textContent = note;
    }
  }

  if (psiCalcBtn) {
    psiCalcBtn.addEventListener("click", calcPSI);
  }
});

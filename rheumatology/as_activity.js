// as_activity.js
// 強直性脊椎炎：BASDAI および ASDAS（CRP / ESR） + BASMI 計算

document.addEventListener("DOMContentLoaded", () => {
  const calcButton = document.getElementById("calc-as-activity");
  if (!calcButton) return;

  calcButton.addEventListener("click", () => {
    const resultElem = document.getElementById("as-activity-result");
    const interpretElem = document.getElementById("as-activity-interpret");

    // --- BASDAI 項目 ---
    const q1 = getNrsValue("basdai-q1");
    const q2 = getNrsValue("basdai-q2");
    const q3 = getNrsValue("basdai-q3");
    const q4 = getNrsValue("basdai-q4");
    const q5 = getNrsValue("basdai-q5");
    const q6 = getNrsValue("basdai-q6");
    const pg = getNrsValue("asdas-patient-global");

    // いずれかでバリデーションエラーがあれば中断
    if (
      q1.error ||
      q2.error ||
      q3.error ||
      q4.error ||
      q5.error ||
      q6.error ||
      pg.error
    ) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    // --- 炎症マーカー（任意入力） ---
    const crpInput = document.getElementById("asdas-crp");
    const esrInput = document.getElementById("asdas-esr");

    const crpParsed = parseNumericInput(crpInput, {
      min: RANGE_PRESETS.CRP.min,
      max: RANGE_PRESETS.CRP.max,
      allowEmpty: true,
    });
    const esrParsed = parseNumericInput(esrInput, {
      min: RANGE_PRESETS.ESR.min,
      max: RANGE_PRESETS.ESR.max,
      allowEmpty: true,
    });

    // allowEmpty=true なので error は「数値なのに範囲外」のときのみ
    if (crpParsed.error || esrParsed.error) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      return;
    }

    const crp = crpParsed.value; // null or number
    const esr = esrParsed.value; // null or number

    // --- BASDAI 計算 ---
    const basdai =
      (q1.value +
        q2.value +
        q3.value +
        q4.value +
        (q5.value + q6.value) / 2) /
      5;

    const basdaiCategory = interpretBasdai(basdai);

    // --- ASDAS-CRP / ESR 計算 ---
    let asdasCrp = null;
    let asdasEsr = null;
    let asdasCrpCategory = "";
    let asdasEsrCategory = "";

    // ASDAS は BASDAI の一部項目を流用
    const backPain = q2.value; // 背部痛
    const morningStiffnessTime = q5.value; // 朝のこわばり時間
    const peripheralPain = q3.value; // 末梢関節痛・腫脹
    const patientGlobal = pg.value; // 患者全般評価

    if (crp !== null) {
      // ASDAS-CRP
      asdasCrp =
        0.121 * backPain +
        0.058 * morningStiffnessTime +
        0.110 * patientGlobal +
        0.073 * peripheralPain +
        0.579 * Math.log(crp + 1);

      asdasCrpCategory = interpretAsdas(asdasCrp);
    }

    if (esr !== null) {
      // ASDAS-ESR
      asdasEsr =
        0.079 * backPain +
        0.069 * morningStiffnessTime +
        0.113 * patientGlobal +
        0.086 * peripheralPain +
        0.293 * Math.sqrt(esr);

      asdasEsrCategory = interpretAsdas(asdasEsr);
    }

    // --- BASMI（可動域評価）の計算 ---
    const basmi = computeBasmi();

    // --- 表示 ---
    const lines = [];

    lines.push(`BASDAI: ${basdai.toFixed(1)}（${basdaiCategory}）`);

    if (asdasCrp !== null) {
      lines.push(`ASDAS-CRP: ${asdasCrp.toFixed(2)}（${asdasCrpCategory}）`);
    } else {
      lines.push("ASDAS-CRP: CRP 未入力のため算出なし");
    }

    if (asdasEsr !== null) {
      lines.push(`ASDAS-ESR: ${asdasEsr.toFixed(2)}（${asdasEsrCategory}）`);
    } else {
      lines.push("ASDAS-ESR: ESR 未入力のため算出なし");
    }

    if (basmi.score != null) {
      lines.push(`BASMI: ${basmi.score.toFixed(1)}`);
    }

    resultElem.textContent = lines.join(" / ");

    const interpretLines = [];
    interpretLines.push(
      "BASDAI は 4 以上で高活動とみなされることが多い指標です。"
    );
    interpretLines.push(
      "ASDAS は <1.3: 寛解, 1.3–<2.1: 低, 2.1–<3.5: 高, ≥3.5: 極めて高い疾患活動性として解釈されます。"
    );

    if (basmi.error) {
      interpretLines.push("BASMI: 入力エラーがあるため算出できません。");
    } else if (basmi.message) {
      interpretLines.push(`BASMI: ${basmi.message}`);
    } else if (basmi.score != null) {
      interpretLines.push(
        "BASMI は 0（良好な可動域）〜10（高度制限）で、脊椎可動域制限の全体像を把握する指標です。"
      );
    }

    interpretElem.textContent = interpretLines.join(" ");
  });
});

/**
 * 0〜10 NRS 入力の取得ヘルパー
 * @param {string} id
 * @returns {{value: number, error: string|null}}
 */
function getNrsValue(id) {
  const input = document.getElementById(id);
  return parseNumericInput(input, { min: 0, max: 10 });
}

/**
 * BASDAI の解釈
 */
function interpretBasdai(score) {
  if (score >= 4) {
    return "高活動（BASDAI ≥ 4）";
  }
  return "低〜中等度活動性（BASDAI < 4）";
}

/**
 * ASDAS の解釈（CRP/ESR 共通）
 */
function interpretAsdas(score) {
  if (score < 1.3) {
    return "寛解 / 不活性";
  } else if (score < 2.1) {
    return "低疾患活動性";
  } else if (score < 3.5) {
    return "高疾患活動性";
  } else {
    return "極めて高い疾患活動性";
  }
}

/**
 * BASMI の全体計算
 * @returns {{score: number|null, message?: string, error?: string}}
 */
function computeBasmi() {
  // ペア測定（右/左 → 平均）
  const cervicalRot = getBasmiPairMean(
    "basmi-cervical-rotation-right",
    "basmi-cervical-rotation-left",
    RANGE_PRESETS.CERVICAL_ROTATION_DEG
  );
  const tragusWall = getBasmiPairMean(
    "basmi-tragus-wall-right",
    "basmi-tragus-wall-left",
    RANGE_PRESETS.TRAGUS_TO_WALL_CM
  );
  const lumbarSideFlex = getBasmiPairMean(
    "basmi-lumbar-sideflex-right",
    "basmi-lumbar-sideflex-left",
    RANGE_PRESETS.LUMBAR_SIDE_FLEXION_CM
  );

  const modSchober = getBasmiSingle(
    "basmi-mod-schober",
    RANGE_PRESETS.MOD_SCHOBER_CM
  );
  const intermalleolar = getBasmiSingle(
    "basmi-intermalleolar",
    RANGE_PRESETS.INTERMALLEOLAR_DISTANCE_CM
  );

  const all = [cervicalRot, tragusWall, lumbarSideFlex, modSchober, intermalleolar];

  if (all.some((v) => v.error)) {
    return { score: null, error: "BASMI input error" };
  }

  const allNull = all.every((v) => v.value == null);
  if (allNull) {
    return { score: null, message: "項目未入力のため算出なし" };
  }

  const anyNull = all.some((v) => v.value == null);
  if (anyNull) {
    return { score: null, message: "全5項目の入力が必要です" };
  }

  const sTragus = scoreBasmiTragus(tragusWall.value);
  const sLumbarFlex = scoreBasmiLumbarFlex(modSchober.value);
  const sIntermalleolar = scoreBasmiIntermalleolar(intermalleolar.value);
  const sCervical = scoreBasmiCervicalRotation(cervicalRot.value);
  const sLumbarSide = scoreBasmiLumbarSideFlexion(lumbarSideFlex.value);

  const score =
    (sTragus + sLumbarFlex + sIntermalleolar + sCervical + sLumbarSide) / 5;

  return { score };
}

/**
 * 右/左の平均を取るヘルパー
 */
function getBasmiPairMean(idRight, idLeft, range) {
  const inputRight = document.getElementById(idRight);
  const inputLeft = document.getElementById(idLeft);

  const r = parseNumericInput(inputRight, {
    min: range.min,
    max: range.max,
    allowEmpty: true,
  });
  const l = parseNumericInput(inputLeft, {
    min: range.min,
    max: range.max,
    allowEmpty: true,
  });

  if (r.error || l.error) {
    return { value: null, error: r.error || l.error };
  }

  const vals = [];
  if (r.value != null) vals.push(r.value);
  if (l.value != null) vals.push(l.value);

  if (vals.length === 0) {
    return { value: null, error: null };
  }

  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { value: mean, error: null };
}

/**
 * 単独入力のヘルパー
 */
function getBasmiSingle(id, range) {
  const input = document.getElementById(id);
  const parsed = parseNumericInput(input, {
    min: range.min,
    max: range.max,
    allowEmpty: true,
  });
  if (parsed.error) {
    return { value: null, error: parsed.error };
  }
  return { value: parsed.value, error: null };
}

// --- 各ドメインの 0〜10 スコア化（BASMI-10 に準拠） ---

function scoreBasmiTragus(distCm) {
  if (distCm <= 10) return 0;
  if (distCm < 13) return 1;
  if (distCm < 16) return 2;
  if (distCm < 19) return 3;
  if (distCm < 22) return 4;
  if (distCm < 25) return 5;
  if (distCm < 28) return 6;
  if (distCm < 31) return 7;
  if (distCm < 34) return 8;
  if (distCm < 37) return 9;
  return 10;
}

function scoreBasmiLumbarFlex(modSchoberCm) {
  if (modSchoberCm >= 7.0) return 0;
  if (modSchoberCm >= 6.4) return 1;
  if (modSchoberCm >= 5.7) return 2;
  if (modSchoberCm >= 5.0) return 3;
  if (modSchoberCm >= 4.3) return 4;
  if (modSchoberCm >= 3.6) return 5;
  if (modSchoberCm >= 2.9) return 6;
  if (modSchoberCm >= 2.2) return 7;
  if (modSchoberCm >= 1.5) return 8;
  if (modSchoberCm >= 0.8) return 9;
  return 10; // <0.8
}

function scoreBasmiIntermalleolar(distCm) {
  if (distCm >= 120) return 0;
  if (distCm >= 110) return 1;
  if (distCm >= 100) return 2;
  if (distCm >= 90) return 3;
  if (distCm >= 80) return 4;
  if (distCm >= 70) return 5;
  if (distCm >= 60) return 6;
  if (distCm >= 50) return 7;
  if (distCm >= 40) return 8;
  if (distCm >= 30) return 9;
  return 10; // <30
}

function scoreBasmiCervicalRotation(deg) {
  if (deg >= 85) return 0;
  if (deg >= 76.6) return 1;
  if (deg >= 68.1) return 2;
  if (deg >= 59.6) return 3;
  if (deg >= 51.1) return 4;
  if (deg >= 42.6) return 5;
  if (deg >= 34.1) return 6;
  if (deg >= 25.6) return 7;
  if (deg >= 17.1) return 8;
  if (deg >= 8.6) return 9;
  return 10; // ≤8.5
}

function scoreBasmiLumbarSideFlexion(cm) {
  if (cm >= 20) return 0;
  if (cm >= 18) return 1;
  if (cm >= 15.9) return 2;
  if (cm >= 13.8) return 3;
  if (cm >= 11.7) return 4;
  if (cm >= 9.6) return 5;
  if (cm >= 7.5) return 6;
  if (cm >= 5.4) return 7;
  if (cm >= 3.3) return 8;
  if (cm >= 1.2) return 9;
  return 10; // ≤1.2
}

// grace.js
// GRACEスコア（入院中 / 6ヶ月死亡）計算
// score-utils.js の RANGE_PRESETS / parseNumericInput を利用 :contentReference[oaicite:1]{index=1}

function getGraceInputs() {
  const ageInput = document.getElementById("grace-age");
  const hrInput = document.getElementById("grace-hr");
  const sbpInput = document.getElementById("grace-sbp");
  const creInput = document.getElementById("grace-cre");

  const ageParsed = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
  const hrParsed = parseNumericInput(hrInput, RANGE_PRESETS.HR);
  const sbpParsed = parseNumericInput(sbpInput, RANGE_PRESETS.SBP);
  const creParsed = parseNumericInput(creInput, RANGE_PRESETS.CREATININE);

  const hasError =
    !!ageParsed.error || !!hrParsed.error || !!sbpParsed.error || !!creParsed.error;

  if (hasError) {
    return null;
  }

  const killip = document.getElementById("grace-killip").value;
  const arrest = document.getElementById("grace-arrest").checked;
  const st = document.getElementById("grace-st").checked;
  const marker = document.getElementById("grace-marker").checked;

  return {
    age: ageParsed.value,
    hr: hrParsed.value,
    sbp: sbpParsed.value,
    cre: creParsed.value,
    killip,
    arrest,
    st,
    marker,
  };
}

function calcGraceTotalScore(data) {
  const { age, hr, sbp, cre, killip, arrest, st, marker } = data;

  let score = 0;
  score += gracePointsAge(age);
  score += gracePointsHR(hr);
  score += gracePointsSBP(sbp);
  score += gracePointsCreatinine(cre);
  score += gracePointsKillip(killip);
  if (arrest) score += 39;
  if (marker) score += 14;
  if (st) score += 28;

  return score;
}

function gracePointsAge(age) {
  if (age < 30) return 0;
  if (age < 40) return 8;
  if (age < 50) return 25;
  if (age < 60) return 41;
  if (age < 70) return 58;
  if (age < 80) return 75;
  if (age < 90) return 91;
  return 100; // >=90
}

function gracePointsHR(hr) {
  if (hr < 50) return 0;
  if (hr < 70) return 3;
  if (hr < 90) return 9;
  if (hr < 110) return 15;
  if (hr < 150) return 24;
  if (hr < 200) return 38;
  return 46; // >=200
}

function gracePointsSBP(sbp) {
  if (sbp < 80) return 58;
  if (sbp < 100) return 53;
  if (sbp < 120) return 43;
  if (sbp < 140) return 34;
  if (sbp < 160) return 24;
  if (sbp < 200) return 10;
  return 0; // >=200
}

function gracePointsCreatinine(cre) {
  // mg/dL, in-hospital mortality版
  if (cre < 0.4) return 1;
  if (cre < 0.8) return 4;
  if (cre < 1.2) return 7;
  if (cre < 1.6) return 10;
  if (cre < 2.0) return 13;
  if (cre < 4.0) return 21;
  return 28; // >=4.0
}

function gracePointsKillip(killip) {
  switch (String(killip)) {
    case "1": return 0;
    case "2": return 20;
    case "3": return 39;
    case "4": return 59;
    default:  return 0;
  }
}

function graceRiskCategory(score) {
  if (score < 109) {
    return "低リスク（入院中死亡リスクは概ね 3% 未満）";
  } else if (score <= 140) {
    return "中間リスク（入院中死亡リスクは概ね 3–8% 程度）";
  } else {
    return "高リスク（入院中死亡リスクは 8% を超える可能性）";
  }
}

function grace6mRiskCategory(score) {
  if (score < 100) {
    return "比較的低リスクのグループ（6ヶ月死亡リスクは低めと考えられます）";
  } else if (score <= 140) {
    return "中間リスクのグループ（6ヶ月死亡リスクは中等度）";
  } else {
    return "高リスクのグループ（6ヶ月死亡リスクが高いことが示唆されます）";
  }
}

function calculateGrace() {
  const resultElem = document.getElementById("grace-result");
  const data = getGraceInputs();

  if (!data) {
    resultElem.textContent = "年齢・心拍数・血圧・Cr の入力を確認してください。";
    return;
  }

  const score = calcGraceTotalScore(data);
  const category = graceRiskCategory(score);

  resultElem.innerHTML =
    `（入院中）GRACEスコア: <strong>${score}</strong><br>` +
    `リスクカテゴリ: ${category}<br>` +
    `<span style="font-size:0.8rem; color:#666;">` +
    `※ 厳密な入院中死亡率(%)は原著ノモグラムやオンライン電卓を参照してください。` +
    `</span>`;
}

function calculateGrace6m() {
  const resultElem = document.getElementById("grace-6m-result");
  const data = getGraceInputs();

  if (!data) {
    resultElem.textContent = "年齢・心拍数・血圧・Cr の入力を確認してください。";
    return;
  }

  const score = calcGraceTotalScore(data);
  const category = grace6mRiskCategory(score);

  resultElem.innerHTML =
    `（退院後〜6ヶ月）GRACEスコア: <strong>${score}</strong><br>` +
    `リスクカテゴリ: ${category}<br>` +
    `<span style="font-size:0.8rem; color:#666;">` +
    `※ 正確な6ヶ月死亡率(%)やイベント率は、原著・公式ツールで確認してください。` +
    `</span>`;
}

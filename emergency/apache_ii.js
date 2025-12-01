// emergency/apache_ii.js
// APACHE II スコア計算

function apacheGetInput(id, presetKey) {
  const input = document.getElementById(id);
  if (!input) return { value: null, hasValue: false };

  const preset = presetKey ? RANGE_PRESETS[presetKey] || {} : {};
  const { value } = parseNumericInput(input, {
    ...(preset || {}),
    allowEmpty: true,
  });
  const hasValue = input.value.trim() !== "";
  return { value, hasValue };
}

function apacheSetResult(total, categoryText, detailText) {
  const totalCard = document.getElementById("card_apache_total");
  const detailCard = document.getElementById("card_apache_detail");

  if (totalCard) {
    const v = totalCard.querySelector(".result-value");
    const c = totalCard.querySelector(".result-category");
    const m = totalCard.querySelector(".result-message");

    if (v) v.textContent = total == null ? "--" : String(total);
    if (c) c.textContent = categoryText || "";
    // m は既定メッセージを維持
  }

  if (detailCard) {
    const v = detailCard.querySelector(".result-value");
    const m = detailCard.querySelector(".result-message");
    if (v) v.textContent = total == null ? "—" : "内訳";
    if (m && detailText) m.textContent = detailText;
  }
}

// 各項目ごとのポイント計算（APACHE II 原法に準拠）

function apacheTempPoints(t) {
  if (t == null) return 0;
  if (t >= 41) return 4;
  if (t >= 39 && t <= 40.9) return 3;
  if (t >= 38.5 && t <= 38.9) return 1;
  if (t >= 36 && t <= 38.4) return 0;
  if (t >= 34 && t <= 35.9) return 1;
  if (t >= 32 && t <= 33.9) return 2;
  if (t >= 30 && t <= 31.9) return 3;
  if (t < 30) return 4;
  return 0;
}

function apacheMapPoints(map) {
  if (map == null) return 0;
  if (map >= 160) return 4;
  if (map >= 130 && map <= 159) return 3;
  if (map >= 110 && map <= 129) return 2;
  if (map >= 70 && map <= 109) return 0;
  if (map >= 50 && map <= 69) return 2;
  if (map < 50) return 4;
  return 0;
}

function apacheHrPoints(hr) {
  if (hr == null) return 0;
  if (hr >= 180) return 4;
  if (hr >= 140 && hr <= 179) return 3;
  if (hr >= 110 && hr <= 139) return 2;
  if (hr >= 70 && hr <= 109) return 0;
  if (hr >= 55 && hr <= 69) return 2;
  if (hr >= 40 && hr <= 54) return 3;
  if (hr < 40) return 4;
  return 0;
}

function apacheRrPoints(rr) {
  if (rr == null) return 0;
  if (rr >= 50) return 4;
  if (rr >= 35 && rr <= 49) return 3;
  if (rr >= 25 && rr <= 34) return 1;
  if (rr >= 12 && rr <= 24) return 0;
  if (rr >= 10 && rr <= 11) return 1;
  if (rr >= 6 && rr <= 9) return 2;
  if (rr <= 5) return 4;
  return 0;
}

function apacheOxygenPoints(mode, pao2, aado2) {
  if (mode === "aado2") {
    if (aado2 == null) return 0;
    if (aado2 >= 500) return 4;
    if (aado2 >= 350 && aado2 <= 499) return 3;
    if (aado2 >= 200 && aado2 <= 349) return 2;
    if (aado2 < 200) return 0;
    return 0;
  } else {
    if (pao2 == null) return 0;
    if (pao2 > 70) return 0;
    if (pao2 >= 61 && pao2 <= 70) return 1;
    if (pao2 >= 55 && pao2 <= 60) return 3;
    if (pao2 < 55) return 4;
    return 0;
  }
}

function apachePhPoints(ph) {
  if (ph == null) return 0;
  if (ph >= 7.7) return 4;
  if (ph >= 7.6 && ph <= 7.69) return 3;
  if (ph >= 7.5 && ph <= 7.59) return 1;
  if (ph >= 7.33 && ph <= 7.49) return 0;
  if (ph >= 7.25 && ph <= 7.32) return 2;
  if (ph >= 7.15 && ph <= 7.24) return 3;
  if (ph < 7.15) return 4;
  return 0;
}

function apacheNaPoints(na) {
  if (na == null) return 0;
  if (na >= 180) return 4;
  if (na >= 160 && na <= 179) return 3;
  if (na >= 155 && na <= 159) return 2;
  if (na >= 150 && na <= 154) return 1;
  if (na >= 130 && na <= 149) return 0;
  if (na >= 120 && na <= 129) return 2;
  if (na >= 111 && na <= 119) return 3;
  if (na <= 110) return 4;
  return 0;
}

function apacheKPoints(k) {
  if (k == null) return 0;
  if (k >= 7) return 4;
  if (k >= 6 && k <= 6.9) return 3;
  if (k >= 5.5 && k <= 5.9) return 1;
  if (k >= 3.5 && k <= 5.4) return 0;
  if (k >= 3 && k <= 3.4) return 1;
  if (k >= 2.5 && k <= 2.9) return 2;
  if (k < 2.5) return 4;
  return 0;
}

function apacheCreatininePoints(cre, isAcuteRenalFailure) {
  if (cre == null) return 0;
  let p = 0;
  if (cre >= 3.5) p = 4;
  else if (cre >= 2 && cre <= 3.4) p = 3;
  else if (cre >= 1.5 && cre <= 1.9) p = 2;
  else if (cre >= 0.6 && cre <= 1.4) p = 0;
  else if (cre < 0.6) p = 2;

  if (isAcuteRenalFailure && cre >= 1.5) {
    p *= 2;
  }
  return p;
}

function apacheHtPoints(ht) {
  if (ht == null) return 0;
  if (ht >= 60) return 4;
  if (ht >= 50 && ht <= 59.9) return 2;
  if (ht >= 46 && ht <= 49.9) return 1;
  if (ht >= 30 && ht <= 45.9) return 0;
  if (ht >= 20 && ht <= 29.9) return 2;
  if (ht < 20) return 4;
  return 0;
}

function apacheWbcPoints(wbc) {
  if (wbc == null) return 0;
  if (wbc >= 40) return 4;
  if (wbc >= 20 && wbc <= 39.9) return 2;
  if (wbc >= 15 && wbc <= 19.9) return 1;
  if (wbc >= 3 && wbc <= 14.9) return 0;
  if (wbc >= 1 && wbc <= 2.9) return 2;
  if (wbc < 1) return 4;
  return 0;
}

function apacheGcsPoints(gcs) {
  if (gcs == null) return 0;
  if (gcs < 3 || gcs > 15) return 0;
  return 15 - gcs;
}

function apacheAgePoints(age) {
  if (age == null) return 0;
  if (age < 44) return 0;
  if (age >= 45 && age <= 54) return 2;
  if (age >= 55 && age <= 64) return 3;
  if (age >= 65 && age <= 74) return 5;
  if (age >= 75) return 6;
  return 0;
}

function calculateApacheII() {
  const { value: age } = apacheGetInput("apache_age", "AGE");
  const { value: gcs } = apacheGetInput("apache_gcs", "GCS_TOTAL");

  const { value: temp } = apacheGetInput("apache_temp");
  const { value: map } = apacheGetInput("apache_map", "MEAN_ARTERIAL_PRESSURE");
  const { value: hr } = apacheGetInput("apache_hr", "HR");
  const { value: rr } = apacheGetInput("apache_rr");

  const mode =
    document.querySelector('input[name="apache_o2_mode"]:checked')?.value ||
    "pao2";
  const { value: pao2 } = apacheGetInput("apache_pao2", "PAO2");
  const { value: aado2 } = apacheGetInput("apache_aado2", "AADO2");

  const { value: ph } = apacheGetInput("apache_ph", "PH_ARTERIAL");
  const { value: na } = apacheGetInput("apache_na", "SODIUM");
  const { value: k } = apacheGetInput("apache_k", "POTASSIUM");
  const { value: cre } = apacheGetInput("apache_cre", "CREATININE");
  const { value: ht } = apacheGetInput("apache_ht", "HEMATOCRIT");
  const { value: wbc } = apacheGetInput("apache_wbc", "WBC");

  const arf = document.getElementById("apache_arf")?.checked ?? false;
  const chronicSelect = document.getElementById("apache_chronic");
  const chronicPoints = chronicSelect ? Number(chronicSelect.value) || 0 : 0;

  const pTemp = apacheTempPoints(temp);
  const pMap = apacheMapPoints(map);
  const pHr = apacheHrPoints(hr);
  const pRr = apacheRrPoints(rr);
  const pO2 = apacheOxygenPoints(mode, pao2, aado2);
  const pPh = apachePhPoints(ph);
  const pNa = apacheNaPoints(na);
  const pK = apacheKPoints(k);
  const pCre = apacheCreatininePoints(cre, arf);
  const pHt = apacheHtPoints(ht);
  const pWbc = apacheWbcPoints(wbc);
  const pGcs = apacheGcsPoints(gcs);

  const aps =
    pTemp +
    pMap +
    pHr +
    pRr +
    pO2 +
    pPh +
    pNa +
    pK +
    pCre +
    pHt +
    pWbc +
    pGcs;

  const agePts = apacheAgePoints(age);
  const total = aps + agePts + chronicPoints;

  let category = "";
  if (total <= 10) category = "比較的低リスク（参考）";
  else if (total <= 20) category = "中等度リスク";
  else if (total <= 30) category = "高リスク";
  else category = "極めて高リスク";

  const detail = `APS：${aps} 点 / 年齢ポイント：${agePts} 点 / 慢性健康ポイント：${chronicPoints} 点`;

  apacheSetResult(total, category, detail);
}

function clearApacheII() {
  const form = document.getElementById("apache_form");
  if (form) form.reset();
  apacheSetResult(null, "", "APS：-- 点 / 年齢ポイント：-- 点 / 慢性健康ポイント：-- 点");
}

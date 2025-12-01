// emergency/sofa_qsofa.js
// qSOFA / SOFA 臓器別の計算ロジック

function getNumberOrNaN(id) {
  var el = document.getElementById(id);
  if (!el) return NaN;
  var v = el.value.trim();
  if (v === "") return NaN;
  return Number(v);
}

function setResult(cardId, value, categoryText, extraMessage) {
  var card = document.getElementById(cardId);
  if (!card) return;
  var v = card.querySelector(".result-value");
  var c = card.querySelector(".result-category");
  var m = card.querySelector(".result-message");

  if (value == null) {
    if (v) v.textContent = "--";
  } else if (v) {
    v.textContent = value;
  }
  if (c) c.textContent = categoryText || "";
  if (m && extraMessage) m.textContent = extraMessage;
}

// ======================
// qSOFA
// ======================
function calculateQSOFA() {
  var rr = getNumberOrNaN("q_rr");
  var sbp = getNumberOrNaN("q_sbp");
  var gcs = getNumberOrNaN("q_gcs");

  if (isNaN(rr) && isNaN(sbp) && isNaN(gcs)) {
    setResult(
      "card_qsofa",
      null,
      "",
      "qSOFA の計算に必要な値が入力されていません。RR, SBP, GCS を確認してください。"
    );
    return;
  }

  var score = 0;
  if (!isNaN(rr) && rr >= 22) score++;
  if (!isNaN(sbp) && sbp <= 100) score++;
  if (!isNaN(gcs) && gcs < 15) score++;

  var category = "";
  var msg = "";
  if (score >= 2) {
    category = "高リスク（2点以上）";
    msg = "敗血症が疑われる患者で 2点以上の場合、予後不良リスクが高いとされます。";
  } else {
    category = "0–1点";
    msg =
      "qSOFA スコアは 0–1点です。臨床像や他のスコアも含めて総合判断してください。";
  }

  setResult("card_qsofa", score.toString(), "スコア：" + category, msg);
}

function clearQSOFA() {
  var form = document.getElementById("qsofa_form");
  if (form) form.reset();
  setResult(
    "card_qsofa",
    null,
    "",
    "RR、SBP、GCS から算出されるベッドサイド評価スコアです。"
  );
}

// ======================
// SOFA 臓器別
// ======================
function calcResp() {
  var pao2 = getNumberOrNaN("sofa_pao2");
  var fio2 = getNumberOrNaN("sofa_fio2");
  var ventEl = document.getElementById("sofa_vent");
  var vent = ventEl ? ventEl.checked : false;

  if (isNaN(pao2) || isNaN(fio2) || fio2 <= 0) {
    return { score: null, text: "入力不足" };
  }

  var ratio = pao2 / (fio2 / 100);
  var s = 0;
  if (ratio < 100 && vent) s = 4;
  else if (ratio < 200 && vent) s = 3;
  else if (ratio < 300) s = 2;
  else if (ratio < 400) s = 1;
  else s = 0;

  return {
    score: s,
    text: "PaO₂/FiO₂ ≈ " + ratio.toFixed(0)
  };
}

function calcCoag() {
  var plt = getNumberOrNaN("sofa_plt");
  if (isNaN(plt)) return { score: null, text: "入力不足" };

  var s = 0;
  if (plt < 20) s = 4;
  else if (plt < 50) s = 3;
  else if (plt < 100) s = 2;
  else if (plt < 150) s = 1;
  else s = 0;

  return {
    score: s,
    text: "血小板 " + plt.toFixed(0) + " ×10³/μL"
  };
}

function calcLiver() {
  var bil = getNumberOrNaN("sofa_bil");
  if (isNaN(bil)) return { score: null, text: "入力不足" };

  var s = 0;
  if (bil >= 12) s = 4;
  else if (bil >= 6) s = 3;
  else if (bil >= 2) s = 2;
  else if (bil >= 1.2) s = 1;
  else s = 0;

  return {
    score: s,
    text: "総ビリルビン " + bil.toFixed(1) + " mg/dL"
  };
}

function calcCVS() {
  var map = getNumberOrNaN("sofa_map");
  var catEl = document.getElementById("sofa_cvs_cat");
  var cat = catEl && typeof catEl.value !== "undefined" ? catEl.value : "0";

  var scoreFromMap = 0;
  if (!isNaN(map) && map < 70) scoreFromMap = 1;

  var scoreFromDrug = 0;
  var catNum = Number(cat);
  if (!isNaN(catNum)) scoreFromDrug = catNum;

  var s = Math.max(scoreFromMap, scoreFromDrug);

  if (isNaN(map) && catNum === 0) {
    return { score: null, text: "入力不足" };
  }

  var detail = [];
  if (!isNaN(map)) detail.push("MAP " + map.toFixed(0) + " mmHg");
  if (catNum > 0) {
    var labelMap = {
      1: "昇圧薬なし・MAP<70",
      2: "ドブタミン任意 or ドパミン≤5",
      3: "ドパミン>5–15 or Ad/NA≤0.1",
      4: "ドパミン>15 or Ad/NA>0.1"
    };
    var label = labelMap[catNum] || "";
    if (label) detail.push(label);
  }

  return {
    score: s,
    text: detail.join(" / ") || "入力不足"
  };
}

function calcCNS() {
  var gcs = getNumberOrNaN("sofa_gcs");
  if (isNaN(gcs)) return { score: null, text: "入力不足" };

  var s = 0;
  if (gcs < 6) s = 4;
  else if (gcs <= 9) s = 3;
  else if (gcs <= 12) s = 2;
  else if (gcs <= 14) s = 1;
  else s = 0;

  return {
    score: s,
    text: "GCS " + gcs.toFixed(0)
  };
}

function calcRenal() {
  var cr = getNumberOrNaN("sofa_cr");
  var urine = getNumberOrNaN("sofa_urine");

  if (isNaN(cr) && isNaN(urine)) {
    return { score: null, text: "入力不足" };
  }

  var scoreCr = 0;
  if (!isNaN(cr)) {
    if (cr >= 5) scoreCr = 4;
    else if (cr >= 3.5) scoreCr = 3;
    else if (cr >= 2) scoreCr = 2;
    else if (cr >= 1.2) scoreCr = 1;
    else scoreCr = 0;
  }

  var scoreUrine = 0;
  if (!isNaN(urine)) {
    if (urine < 200) scoreUrine = 4;
    else if (urine < 500) scoreUrine = 3;
    else scoreUrine = 0;
  }

  var s = Math.max(scoreCr, scoreUrine);

  var detail = [];
  if (!isNaN(cr)) detail.push("Cr " + cr.toFixed(1) + " mg/dL");
  if (!isNaN(urine)) detail.push("尿量 " + urine.toFixed(0) + " mL/日");

  return {
    score: s,
    text: detail.join(" / ") || "入力不足"
  };
}

function calculateSOFAOrgan() {
  var resp = calcResp();
  var coag = calcCoag();
  var liver = calcLiver();
  var cvs = calcCVS();
  var cns = calcCNS();
  var renal = calcRenal();

  var organs = [resp, coag, liver, cvs, cns, renal];

  var total = 0;
  var missing = 0;
  organs.forEach(function (o) {
    if (o.score == null) missing++;
    else total += o.score;
  });

  var category = "";
  var msg = "";

  if (missing === 0) {
    category = "全6臓器入力済み";
    msg =
      "全ての臓器スコアを合計した SOFA スコアです。数値が高いほど臓器障害が重いとされます。";
  } else if (missing < 6) {
    category = "一部臓器未入力（" + missing + " 臓器）";
    msg =
      "未入力の臓器は 0 点としては扱わず、合計スコアは参考値として解釈してください。";
  } else {
    category = "";
    msg = "SOFA 計算に必要な値が入力されていません。";
  }

  if (missing === 6) {
    setResult("card_sofa_total", null, "", msg);
  } else {
    setResult("card_sofa_total", total.toString(), category, msg);
  }

  var names = ["呼吸", "凝固", "肝", "心血管", "中枢神経", "腎"];
  var scores = [resp, coag, liver, cvs, cns, renal];

  var detailLines = scores.map(function (o, i) {
    var sText = o.score == null ? "--" : o.score + " 点";
    return names[i] + "：" + sText + "（" + o.text + "）";
  });

  var detailMsg = detailLines.join("\n");

  setResult("card_sofa_detail", "内訳", "", detailMsg);
}

function clearSOFAOrgan() {
  var form = document.getElementById("sofa_organ_form");
  if (form) form.reset();

  setResult(
    "card_sofa_total",
    null,
    "",
    "6 臓器のスコアの合計です。入力されていない臓器がある場合は参考値として扱ってください。"
  );

  setResult(
    "card_sofa_detail",
    "—",
    "",
    "呼吸：-- 点\n凝固：-- 点\n肝：-- 点\n心血管：-- 点\n中枢神経：-- 点\n腎：-- 点"
  );
}

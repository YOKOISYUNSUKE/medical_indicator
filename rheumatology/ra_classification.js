// js/ra_classification.js

function setRAClassificationResult(score, categoryText, message) {
  const v = document.getElementById("ra_class_score");
  const c = document.getElementById("ra_class_category");
  const m = document.getElementById("ra_class_message");

  if (v) {
    if (score === null || score === undefined) {
      v.textContent = "--";
    } else {
      v.textContent = score.toFixed(1);
    }
  }
  if (c) c.textContent = categoryText || "";
  if (m && message) m.textContent = message;
}

function clearRAClassification() {
  const form = document.getElementById("ra_classification_form");
  if (form) form.reset();
  setRAClassificationResult(
    null,
    "",
    "合計スコア 6 点以上で、2010 ACR/EULAR 分類基準上「RA と分類」されます。"
  );
}

function calculateRAClassification() {
  // ラジオボタンから単純に値を拾う
  function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    if (!el) return 0;
    return Number(el.value) || 0;
  }

  const joints = getRadioValue("joints");
  const serology = getRadioValue("serology");
  const acute = getRadioValue("acute");
  const duration = getRadioValue("duration");

  const total = joints + serology + acute + duration;

  let category = "";
  let msg = "";

  if (total >= 6) {
    category = "RA と分類（≥6点）";
    msg =
      "2010 ACR/EULAR 分類基準で合計 6 点以上のため、RA と分類されます。臨床像との整合を確認してください。";
  } else {
    category = "RA 分類基準未満（<6点）";
    msg =
      "2010 ACR/EULAR 分類基準で合計 6 点未満のため、分類基準上は RA とは分類されません。早期・未分化関節炎なども含め臨床的に総合判断してください。";
  }

  setRAClassificationResult(total, category, msg);
}

// js/ssc_activity.js

function setSScActivityResult(score, categoryText, message) {
  const v = document.getElementById("ssc_activity_value");
  const c = document.getElementById("ssc_activity_category");
  const m = document.getElementById("ssc_activity_message");

  if (v) {
    if (score === null || score === undefined) {
      v.textContent = "--";
    } else {
      v.textContent = score.toFixed(2);
    }
  }
  if (c) c.textContent = categoryText || "";
  if (m && message) m.textContent = message;
}

function clearSScActivity() {
  const form = document.getElementById("ssc_activity_form");
  if (form) form.reset();
  setSScActivityResult(
    null,
    "",
    "改訂 EUSTAR 活動性インデックスでは、2.5 点以上を活動性／高度活動として扱います。"
  );
}

function calculateSScActivity() {
  let hasError = false;

  // mRSS
  const mrssInput = document.getElementById("mrss");
  const mrssRes = parseNumericInput(mrssInput, RANGE_PRESETS.MRSS);
  if (mrssRes.error) hasError = true;

  // CRP
  const crpInput = document.getElementById("crp");
  const crpRes = parseNumericInput(crpInput, {
    min: 0,
    max: 50,
  });
  if (crpRes.error) hasError = true;

  // DLCO
  const dlcoInput = document.getElementById("dlco");
  const dlcoRes = parseNumericInput(dlcoInput, {
    min: 0,
    max: 200,
  });
  if (dlcoRes.error) hasError = true;

  if (hasError) {
    setSScActivityResult(
      null,
      "",
      "このスコアの計算に必要な値が不足または不正です。mRSS, CRP, DLCO を確認してください。"
    );
    return;
  }

  const mrss = mrssRes.value;
  const crp = crpRes.value;
  const dlco = dlcoRes.value;

  // Yes/No 項目
  const deltaSkin = parseBooleanInput(
    document.getElementById("delta_skin")
  );
  const digitalUlcers = parseBooleanInput(
    document.getElementById("digital_ulcers_active")
  );
  const tfr = parseBooleanInput(
    document.getElementById("tendon_friction_rubs")
  );

  let index = 0;

  // Δ-skin
  if (deltaSkin === 1) index += 1.5;

  // デジタル潰瘍
  if (digitalUlcers === 1) index += 1.5;

  // mRSS 貢献（>18 で 1.5点、それ以下は mRSS×0.084）
  if (mrss > 18) {
    index += 1.5;
  } else {
    index += mrss * 0.084;
  }

  // 腱摩擦音
  if (tfr === 1) index += 2.25;

  // CRP > 1 mg/dL
  if (crp > 1) index += 2.25;

  // DLCO < 70% 予測値
  if (dlco < 70) index += 1.0;

  let category = "";
  let msg = "";

  if (index >= 2.5) {
    category = "活動性 / 高度活動（≥2.5）";
    msg =
      "改訂 EUSTAR 活動性インデックスで 2.5 点以上のため、「活動性もしくは高度活動」と判定されます。";
  } else {
    category = "非活動〜中等度活動（<2.5）";
    msg =
      "改訂 EUSTAR 活動性インデックスで 2.5 点未満のため、「非活動〜中等度活動」と判定されます。";
  }

  setSScActivityResult(index, category, msg);
}

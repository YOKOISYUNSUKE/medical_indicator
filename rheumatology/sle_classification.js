// js/sle_classification.js

function setSLEClassificationResult(score, categoryText, message) {
  const v = document.getElementById("sle_class_score");
  const c = document.getElementById("sle_class_category");
  const m = document.getElementById("sle_class_message");

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

function clearSLEClassification() {
  const form = document.getElementById("sle_classification_form");
  if (form) form.reset();
  setSLEClassificationResult(
    null,
    "",
    "合計 10 点以上かつ少なくとも 1 つ以上の臨床基準を満たす場合、2019 EULAR/ACR 分類基準上「SLE と分類」されます。"
  );
}

function getDomainScore(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  if (!el) return 0;
  return Number(el.value) || 0;
}

function calculateSLEClassification() {
  const anaCheckbox = document.getElementById("ana_positive");
  const anaPositive = anaCheckbox && anaCheckbox.checked;

  if (!anaPositive) {
    setSLEClassificationResult(
      0,
      "SLE と分類されない（ANA 陰性）",
      "2019 EULAR/ACR 分類基準では ANA 陽性がエントリー条件のため、ANA 陰性の場合は他のスコアにかかわらず SLE とは分類されません。"
    );
    return;
  }

  // 臨床ドメイン
  const scoreConstitutional = getDomainScore("dom_constit");
  const scoreHema = getDomainScore("dom_hema");
  const scoreNeuro = getDomainScore("dom_neuro");
  const scoreMucocut = getDomainScore("dom_mucocut");
  const scoreSerosal = getDomainScore("dom_serosal");
  const scoreMsk = getDomainScore("dom_msk");
  const scoreRenal = getDomainScore("dom_renal");

  const clinicalTotal =
    scoreConstitutional +
    scoreHema +
    scoreNeuro +
    scoreMucocut +
    scoreSerosal +
    scoreMsk +
    scoreRenal;

  // 免疫学ドメイン
  const scoreApls = getDomainScore("dom_apls");
  const scoreComp = getDomainScore("dom_comp");
  const scoreSleAb = getDomainScore("dom_sleab");

  const immunologicTotal = scoreApls + scoreComp + scoreSleAb;

  const total = clinicalTotal + immunologicTotal;

  // 少なくとも 1 つの臨床基準が必要
  if (clinicalTotal <= 0) {
    setSLEClassificationResult(
      total,
      "SLE と分類されない（臨床基準なし）",
      "ANA 陽性であっても、臨床基準が 1 つも無い場合は SLE とは分類されません。"
    );
    return;
  }

  let category = "";
  let msg = "";

  if (total >= 10) {
    category = "SLE と分類（≥10点）";
    msg =
      "2019 EULAR/ACR 分類基準で ANA 陽性かつ合計 10 点以上・臨床基準ありのため、SLE と分類されます。";
  } else {
    category = "SLE 分類基準未満（<10点）";
    msg =
      "ANA 陽性で臨床基準も認めますが、合計スコアが 10 点未満のため SLE 分類基準は満たしません。経過や他疾患も含め総合判断が必要です。";
  }

  setSLEClassificationResult(total, category, msg);
}

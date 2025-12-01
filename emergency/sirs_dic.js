// emergency/sirs_dic.js
// SIRS / 急性期DIC 計算ロジック

function getNumberOrNaN(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const v = el.value.trim();
  if (v === "") return NaN;
  return Number(v);
}

function setResult(cardId, value, categoryText, extraMessage) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const v = card.querySelector(".result-value");
  const c = card.querySelector(".result-category");
  const m = card.querySelector(".result-message");

  if (value == null) {
    if (v) v.textContent = "--";
  } else if (v) {
    v.textContent = value;
  }
  if (c) c.textContent = categoryText || "";
  if (m && extraMessage) m.textContent = extraMessage;
}

function calculateSIRSandDIC() {
  // --- SIRS ---
  const temp = getNumberOrNaN("temp");
  const hr = getNumberOrNaN("hr");
  const rr = getNumberOrNaN("rr");
  const paco2 = getNumberOrNaN("paco2");
  const wbc = getNumberOrNaN("wbc");
  const bands = getNumberOrNaN("bands");

  let sirsScore = 0;
  let hasAnySirsInput = false;

  if (!isNaN(temp)) {
    hasAnySirsInput = true;
    if (temp > 38 || temp < 36) sirsScore++;
  }
  if (!isNaN(hr)) {
    hasAnySirsInput = true;
    if (hr > 90) sirsScore++;
  }
  if (!isNaN(rr) || !isNaN(paco2)) {
    hasAnySirsInput = true;
    if ((!isNaN(rr) && rr > 20) || (!isNaN(paco2) && paco2 < 32)) sirsScore++;
  }
  if (!isNaN(wbc) || !isNaN(bands)) {
    hasAnySirsInput = true;
    if (
      (!isNaN(wbc) && (wbc > 12000 || wbc < 4000)) ||
      (!isNaN(bands) && bands > 10)
    ) {
      sirsScore++;
    }
  }

  if (!hasAnySirsInput) {
    setResult(
      "card_sirs",
      null,
      "",
      "SIRS の計算に必要な値が入力されていません。"
    );
  } else {
    const sirsCategory =
      sirsScore >= 2 ? "SIRS 基準を満たす可能性あり（2項目以上）" : "SIRS 基準未満（参考値）";
    const sirsMsg =
      "欠測項目は 0 点として扱っています。臨床像とあわせて解釈してください。";
    setResult("card_sirs", sirsScore.toString(), sirsCategory, sirsMsg);
  }

  // --- 急性期DICスコア ---
  const plt = getNumberOrNaN("plt");
  const pltDrop = getNumberOrNaN("plt_drop");
  const ptRatio = getNumberOrNaN("pt_ratio");
  const fdp = getNumberOrNaN("fdp");

  let validForDIC = true;
  const missingReasons = [];

  if (!hasAnySirsInput) {
    validForDIC = false;
    missingReasons.push("SIRS スコア");
  }
  if (isNaN(plt) && isNaN(pltDrop)) {
    validForDIC = false;
    missingReasons.push("血小板数または減少率");
  }
  if (isNaN(ptRatio)) {
    validForDIC = false;
    missingReasons.push("PT比");
  }
  if (isNaN(fdp)) {
    validForDIC = false;
    missingReasons.push("FDP");
  }

  if (!validForDIC) {
    setResult(
      "card_dic",
      null,
      "",
      "急性期DICスコアの算出に必要な項目が不足しています：" +
        missingReasons.join("、")
    );
    return;
  }

  // SIRSによる DIC スコア（0 or 1）
  const dicSirsScore = sirsScore >= 3 ? 1 : 0;

  // 血小板スコア
  let pltScore = 0;
  if ((!isNaN(plt) && plt < 80000) || (!isNaN(pltDrop) && pltDrop >= 50)) {
    pltScore = 3;
  } else if (
    (!isNaN(plt) && plt < 120000) ||
    (!isNaN(pltDrop) && pltDrop >= 30)
  ) {
    pltScore = 1;
  }

  // PT比スコア
  let ptScore = 0;
  if (!isNaN(ptRatio) && ptRatio >= 1.2) ptScore = 1;

  // FDPスコア
  let fdpScore = 0;
  if (!isNaN(fdp) && fdp >= 25) fdpScore = 3;
  else if (!isNaN(fdp) && fdp >= 10) fdpScore = 1;

  const total = dicSirsScore + pltScore + ptScore + fdpScore;

  let category = "";
  let msg = "";

  if (total >= 4) {
    category = "急性期DIC（4点以上）";
    msg =
      "急性期DIC診断基準で DIC と診断されるスコアです。基礎疾患や出血傾向を含めて早期治療介入を検討してください。";
  } else {
    category = "DIC 基準未満（0–3点）";
    msg =
      "現時点では急性期DIC 診断基準のカットオフ（4点）未満です。経時的な推移に注意してください。";
  }

  setResult("card_dic", total.toString(), `スコア：${category}`, msg);
}

function clearAll() {
  const form = document.getElementById("sirs_dic_form");
  if (form) form.reset();

  setResult(
    "card_sirs",
    null,
    "",
    "4項目のうち、条件を満たす項目数を表示します（2項目以上でSIRS）。"
  );
  setResult(
    "card_dic",
    null,
    "",
    "SIRS、血小板、PT比、FDP から算出される急性期DICスコアです（4点以上でDIC）。"
  );
}

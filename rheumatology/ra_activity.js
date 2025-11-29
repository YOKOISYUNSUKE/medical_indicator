// js/ra_activity.js

function getRAInputs() {
  const result = {};

  function read(id, options) {
    const el = document.getElementById(id);
    if (!el) {
      result[id] = { value: null, error: null };
      return;
    }
    const res = parseNumericInput(el, { ...options, allowEmpty: true });
    result[id] = res;
  }

  read("tjc", { min: 0, max: 28 });
  read("sjc", { min: 0, max: 28 });
  read("esr", { min: 0, max: null }); // >0 をスコア計算側で評価
  read("crp", { min: 0, max: null });
  read("gh", { min: 0, max: 100 });
  read("pt", { min: 0, max: 10 });
  read("ph", { min: 0, max: 10 });

  return result;
}

function clearAll() {
  const form = document.getElementById("ra_activity_form");
  if (form) form.reset();

  const cards = [
    "card_das28_esr",
    "card_das28_crp",
    "card_cdai",
    "card_sdai",
  ];

  cards.forEach((id) => {
    const card = document.getElementById(id);
    if (!card) return;
    const v = card.querySelector(".result-value");
    const c = card.querySelector(".result-category");
    const m = card.querySelector(".result-message");
    if (v) v.textContent = "--";
    if (c) c.textContent = "";
    // m は初期メッセージのまま維持
  });
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

function calculateAllScores() {
  const inputs = getRAInputs();

  const tjc = inputs.tjc.value;
  const sjc = inputs.sjc.value;
  const esr = inputs.esr.value;
  const crp = inputs.crp.value; // mg/dL
  const gh = inputs.gh.value;
  const pt = inputs.pt.value;
  const ph = inputs.ph.value;

  const hasError = (keys) =>
    keys.some((k) => {
      const entry = inputs[k];
      if (!entry) return true;
      if (entry.error) return true;
      if (entry.value === null || Number.isNaN(entry.value)) return true;
      return false;
    });

  // DAS28 (ESR)
  (function () {
    const needed = ["tjc", "sjc", "esr", "gh"];
    if (hasError(needed) || esr <= 0) {
      setResult(
        "card_das28_esr",
        null,
        "",
        "このスコアの計算に必要な値が不足または不正です。TJC/SJC 0–28, ESR>0, GH 0–100 mm を確認してください。"
      );
      return;
    }

    const das28esr =
      0.56 * Math.sqrt(tjc) +
      0.28 * Math.sqrt(sjc) +
      0.7 * Math.log(esr) +
      0.014 * gh;

    let category = "";
    if (das28esr < 2.6) category = "寛解";
    else if (das28esr < 3.2) category = "低疾患活動性";
    else if (das28esr <= 5.1) category = "中等度疾患活動性";
    else category = "高疾患活動性";

    setResult(
      "card_das28_esr",
      das28esr.toFixed(2),
      `疾患活動性：${category}`
    );
  })();

  // DAS28 (CRP)
  (function () {
    const needed = ["tjc", "sjc", "crp", "gh"];
    if (hasError(needed) || crp < 0) {
      setResult(
        "card_das28_crp",
        null,
        "",
        "このスコアの計算に必要な値が不足または不正です。TJC/SJC 0–28, CRP≥0, GH 0–100 mm を確認してください。"
      );
      return;
    }

    const crp_mgL = crp * 10; // mg/dL → mg/L
    const das28crp =
      0.56 * Math.sqrt(tjc) +
      0.28 * Math.sqrt(sjc) +
      0.36 * Math.log(crp_mgL + 1) +
      0.014 * gh +
      0.96;

    let category = "";
    if (das28crp < 2.3) category = "寛解";
    else if (das28crp < 2.7) category = "低疾患活動性";
    else if (das28crp <= 4.1) category = "中等度疾患活動性";
    else category = "高疾患活動性";

    setResult(
      "card_das28_crp",
      das28crp.toFixed(2),
      `疾患活動性：${category}`
    );
  })();

  // CDAI
  (function () {
    const needed = ["tjc", "sjc", "pt", "ph"];
    if (hasError(needed)) {
      setResult(
        "card_cdai",
        null,
        "",
        "このスコアの計算に必要な値が不足または不正です。TJC/SJC 0–28, Pt/Ph 0–10 を確認してください。"
      );
      return;
    }

    const cdai = tjc + sjc + pt + ph;

    let category = "";
    if (cdai <= 2.8) category = "寛解";
    else if (cdai <= 10) category = "低疾患活動性";
    else if (cdai <= 22) category = "中等度疾患活動性";
    else category = "高疾患活動性";

    setResult("card_cdai", cdai.toFixed(1), `疾患活動性：${category}`);
  })();

  // SDAI
  (function () {
    const needed = ["tjc", "sjc", "pt", "ph", "crp"];
    if (hasError(needed) || crp < 0) {
      setResult(
        "card_sdai",
        null,
        "",
        "このスコアの計算に必要な値が不足または不正です。TJC/SJC 0–28, Pt/Ph 0–10, CRP≥0 を確認してください。"
      );
      return;
    }

    const sdai = tjc + sjc + pt + ph + crp;

    let category = "";
    if (sdai <= 3.3) category = "寛解";
    else if (sdai <= 11) category = "低疾患活動性";
    else if (sdai <= 26) category = "中等度疾患活動性";
    else category = "高疾患活動性";

    setResult("card_sdai", sdai.toFixed(1), `疾患活動性：${category}`);
  })();
}

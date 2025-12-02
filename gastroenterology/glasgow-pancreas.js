// glasgow-pancreas.js
// 急性膵炎スコア（BISAP / Glasgow-Imrie / Ranson）

document.addEventListener("DOMContentLoaded", () => {
  /**
  /**
   * RANGE_PRESETS を使った数値入力パーサのラッパ
   * - presetKey が RANGE_PRESETS にあれば min/max を自動設定
   * - allowEmpty はデフォルト true（欠測はスコアに加点しない）
   */
  function parseWithPreset(input, presetKey, allowEmpty = true) {
    const preset = (typeof RANGE_PRESETS !== "undefined" && RANGE_PRESETS[presetKey]) || {};
    const min = typeof preset.min === "number" ? preset.min : undefined;
    const max = typeof preset.max === "number" ? preset.max : undefined;
    return parseNumericInput(input, { min, max, allowEmpty });
  }

  /**
   * 安全に数値比較を行うヘルパー
   * - parsed: parseNumericInput の戻り値
   * - cmp: (value: number) => boolean
   * - 条件を満たせば 1, それ以外は 0 を返す
   */
  function scoreIf(parsed, cmp) {
    if (!parsed || parsed.error) return 0;
    const v = parsed.value;
    if (v == null || Number.isNaN(v)) return 0;
    return cmp(v) ? 1 : 0;
  }

  /**
   * スコア間で共通項目（年齢・BUN など）の入力値を双方向に同期するヘルパー
   * - idList: 同じ患者情報を表す input 要素 ID の配列
   *
   * 例:
   *   setupLinkedInputs(["bisap-age", "g-age"]);
   */
  function setupLinkedInputs(idList) {
    const inputs = idList
      .map((id) => document.getElementById(id))
      .filter((el) => !!el);

    // 有効な input が 2 つ未満なら何もしない
    if (inputs.length < 2) return;

    let isSyncing = false;

    inputs.forEach((src) => {
      src.addEventListener("input", () => {
        if (isSyncing) return;
        isSyncing = true;

        const value = src.value;

        inputs.forEach((dst) => {
          if (dst === src) return;
          if (dst.value !== value) {
            dst.value = value;
          }
        });

        isSyncing = false;
      });
    });
  }

  /**
   * Glasgow 側の数値入力から Ranson 側の checkbox を自動 ON/OFF するヘルパー
   * - input: 数値 input 要素
   * - checkbox: 対応する Ranson の checkbox 要素
   * - predicate: (value: number) => boolean （条件を満たせば true）
   * - presetKey: RANGE_PRESETS のキー（"WBC" など）。省略時は素の parseNumericInput。
   */
  function linkNumericToCheckbox(input, checkbox, predicate, presetKey) {
    if (!input || !checkbox) return;

    const handler = () => {
      let parsed;
      if (presetKey) {
        parsed = parseWithPreset(input, presetKey, true);
      } else {
        parsed = parseNumericInput(input, { allowEmpty: true });
      }
      if (parsed.error || parsed.value == null || Number.isNaN(parsed.value)) {
        checkbox.checked = false;
        return;
      }
      checkbox.checked = !!predicate(parsed.value);
    };

    input.addEventListener("input", handler);
    // 初回も同期しておく
    handler();
  }

  // ▼ 急性膵炎スコア間の自動連携：年齢 & BUN を共有
  //   - BISAP の年齢/BUN ↔ Glasgow の年齢/BUN を双方向同期
  setupLinkedInputs(["bisap-age", "g-age"]);
  setupLinkedInputs(["bisap-bun", "g-bun"]);




  /* ------------------------
     1) BISAP スコア
  ------------------------- */
  const bisapAgeInput = document.getElementById("bisap-age");
  const bisapBunInput = document.getElementById("bisap-bun");
  const bisapCalcBtn = document.getElementById("bisap-calc");
  const bisapResult = document.getElementById("bisap-result");
  const bisapInterpret = document.getElementById("bisap-interpret");

  if (bisapCalcBtn) {
    bisapCalcBtn.addEventListener("click", () => {
      let score = 0;

      // 年齢 > 60 歳
      const ageParsed = parseWithPreset(bisapAgeInput, "AGE", true);
      score += scoreIf(ageParsed, (v) => v > 60);

      // BUN > 25 mg/dL
      const bunParsed = parseWithPreset(bisapBunInput, "BUN", true);
      score += scoreIf(bunParsed, (v) => v > 25);

      // Boolean グループ：意識障害 / SIRS >=2 / 胸水
      const bisapGroup = evaluateBooleanGroup("#bisap-boolean", { mode: "sum" });
      score += bisapGroup.total;

      bisapResult.textContent = `BISAP：${score} 点`;

      // 0–5 点を簡略層別化
      let text = "";
      let cls = "";
      if (score <= 1) {
        text = "低リスク（入院中の死亡率は低いとされます）";
        cls = "risk-low";
      } else if (score <= 3) {
        text = "中等度リスク（経過中の増悪に注意）";
        cls = "risk-mid";
      } else {
        text = "高リスク（重症化リスクが高く、集中的な管理を検討）";
        cls = "risk-high";
      }

      bisapInterpret.innerHTML = `<span class="${cls}">${text}</span>`;
    });
  }

  /* ------------------------
     2) Glasgow-Imrie スコア
  ------------------------- */
  const gAge = document.getElementById("g-age");
  const gWbc = document.getElementById("g-wbc");
  const gGlu = document.getElementById("g-glucose");
  const gBun = document.getElementById("g-bun");
  const gCa = document.getElementById("g-calcium");
  const gPao2 = document.getElementById("g-pao2");
  const gLdh = document.getElementById("g-ldh");
  const gAst = document.getElementById("g-ast");
  const glasgowBtn = document.getElementById("glasgow-calc");
  const glasgowResult = document.getElementById("glasgow-result");
  const glasgowInterpret = document.getElementById("glasgow-interpret");

  if (glasgowBtn) {
    glasgowBtn.addEventListener("click", () => {
      let score = 0;

      // 各項目をパース（欠測は 0 点扱い）
      const ageParsed = parseWithPreset(gAge, "AGE", true);
      const wbcParsed = parseWithPreset(gWbc, "WBC", true);
      const gluParsed = parseWithPreset(gGlu, "GLUCOSE", true);
      const bunParsed = parseWithPreset(gBun, "BUN", true);
      const caParsed = parseWithPreset(gCa, "CALCIUM", true);
      const pao2Parsed = parseWithPreset(gPao2, "PAO2", true);
      const ldhParsed = parseWithPreset(gLdh, "LDH", true);
      const astParsed = parseWithPreset(gAst, "AST", true);

      // Glasgow-Imrie 基準
      score += scoreIf(ageParsed, (v) => v > 55);
      score += scoreIf(wbcParsed, (v) => v > 15);
      score += scoreIf(gluParsed, (v) => v > 180);
      score += scoreIf(bunParsed, (v) => v > 44);
      score += scoreIf(caParsed, (v) => v < 8.0);
      score += scoreIf(pao2Parsed, (v) => v < 60);
      score += scoreIf(ldhParsed, (v) => v > 600);
      score += scoreIf(astParsed, (v) => v > 200);

      glasgowResult.textContent = `Glasgow-Imrie：${score} 点`;

      let text = "";
      let cls = "";
      if (score >= 3) {
        text = "重症急性膵炎のリスクが高いとされます";
        cls = "risk-high";
      } else {
        text = "重症度は比較的低いとされていますが、経過観察が必要です";
        cls = "risk-low";
      }

      glasgowInterpret.innerHTML = `<span class="${cls}">${text}</span>`;
    });
  }

  /* ------------------------
     3) Ranson 基準（非胆石膵炎）
  ------------------------- */
  const ransonBtn = document.getElementById("ranson-calc");
  const ransonResult = document.getElementById("ranson-result");
  const ransonInterpret = document.getElementById("ranson-interpret");
  
// Ranson の各 checkbox（Glasgow と共通の項目）
  const rAgeChk       = document.getElementById("r-age");
  const rWbcChk       = document.getElementById("r-wbc");
  const rGluChk       = document.getElementById("r-glucose");
  const rLdhChk       = document.getElementById("r-ldh");
  const rAstChk       = document.getElementById("r-ast");
  const rCaChk        = document.getElementById("r-calcium");
  const rPao2Chk      = document.getElementById("r-pao2");

  // Glasgow の数値入力から Ranson の checkbox を自動 ON/OFF
  linkNumericToCheckbox(gAge,   rAgeChk,  (v) => v > 55,   "AGE");
  linkNumericToCheckbox(gWbc,   rWbcChk,  (v) => v > 16,   "WBC");
  linkNumericToCheckbox(gGlu,   rGluChk,  (v) => v > 200,  "GLUCOSE");
  linkNumericToCheckbox(gLdh,   rLdhChk,  (v) => v > 350,  "LDH");
  linkNumericToCheckbox(gAst,   rAstChk,  (v) => v > 250,  "AST");
  linkNumericToCheckbox(gCa,    rCaChk,   (v) => v < 8.0,  "CALCIUM");
  linkNumericToCheckbox(gPao2,  rPao2Chk, (v) => v < 60,   "PAO2");



  if (ransonBtn) {
    ransonBtn.addEventListener("click", () => {
      // Boolean グループ（入院時 + 48 時間以内の 11 項目）
      const ransonGroup = evaluateBooleanGroup("#ranson-boolean", { mode: "sum" });
      const score = ransonGroup.total;

      ransonResult.textContent = `Ranson：${score} 項目`;

      // 非胆石膵炎の代表的な死亡率層別（目安）
      let text = "";
      let cls = "";

      if (score <= 2) {
        text = "死亡率 約 1–2% とされる低リスク群";
        cls = "risk-low";
      } else if (score <= 4) {
        text = "死亡率 約 15% 前後の中等度リスク群";
        cls = "risk-mid";
      } else if (score <= 6) {
        text = "死亡率 約 40% とされる高リスク群";
        cls = "risk-high";
      } else {
        text = "死亡率 ほぼ 100% とされる極めて高リスク群（文献値）";
        cls = "risk-high";
      }

      ransonInterpret.innerHTML = `<span class="${cls}">${text}</span>`;
    });
  }
});

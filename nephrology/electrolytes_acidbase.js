// electrolytes_acidbase.js
// 電解質・酸塩基異常の簡易評価
// ※ module 不使用。score-utils.js を先に読み込む前提。

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. 補正 Na / AG / Osm ---
  const naInput = document.getElementById("elec-na");
  const gluInput = document.getElementById("elec-glu");
  const kInput = document.getElementById("elec-k");
  const clInput = document.getElementById("elec-cl");
  const hco3Input = document.getElementById("elec-hco3");
  const osmMeasuredInput = document.getElementById("elec-osm-measured");
  const agIncludeKInput = document.getElementById("elec-ag-include-k");
  const agUseAlbInput = document.getElementById("elec-ag-use-alb");

  const basicBtn = document.getElementById("elec-basic-calc-btn");

  const naCorrElem = document.getElementById("elec-na-corrected-result");
  const naInterpElem = document.getElementById("elec-na-interpret");
  const agResultElem = document.getElementById("elec-ag-result");
  const agInterpElem = document.getElementById("elec-ag-interpret");
  const agCorrResultElem = document.getElementById("elec-ag-corr-result");
  const agCorrNoteElem = document.getElementById("elec-ag-corr-note");
  const osmCalcElem = document.getElementById("elec-osm-calc-result");
  const osmGapElem = document.getElementById("elec-osm-gap-result");

  const osmInterpElem = document.getElementById("elec-osm-interpret");

  if (basicBtn) {
    basicBtn.addEventListener("click", () => {
      [naInput, gluInput, kInput, clInput, hco3Input, osmMeasuredInput].forEach((el) => {
        if (el && typeof clearFieldError === "function") {
          clearFieldError(el);
        }
      });

      naCorrElem.textContent = "";
      naInterpElem.textContent = "";
      agResultElem.textContent = "";
      agInterpElem.textContent = "";
      agCorrResultElem.textContent = "";
      agCorrNoteElem.textContent = "";
      osmCalcElem.textContent = "";
      osmGapElem.textContent = "";
      osmInterpElem.textContent = "";


      let hasError = false;

      const { value: na,  error: eNa }  = parseNumericInput(naInput, RANGE_PRESETS.SODIUM);
      if (eNa) hasError = true;

      const { value: glu, error: eGlu } = parseNumericInput(gluInput, RANGE_PRESETS.GLUCOSE);
      if (eGlu) hasError = true;

      const { value: k,   error: eK }   = parseNumericInput(kInput, { ...RANGE_PRESETS.POTASSIUM, allowEmpty: true });
      if (eK) hasError = true;

      const { value: cl,  error: eCl }  = parseNumericInput(clInput, RANGE_PRESETS.CHLORIDE);
      if (eCl) hasError = true;

      const { value: hco3,error: eHco3 }= parseNumericInput(hco3Input, RANGE_PRESETS.HCO3);
      if (eHco3) hasError = true;

      const { value: osmMeasured, error: eOsm } =
        parseNumericInput(osmMeasuredInput, { ...RANGE_PRESETS.OSMOLALITY, allowEmpty: true });
      if (eOsm) hasError = true;

      if (hasError) return;

      // --- 補正 Na（高血糖補正）---
      let naCorr = na;
      if (glu > 100) {
        const deltaG = (glu - 100) / 100; // 100 mg/dL 超過分
        naCorr = na + 1.6 * deltaG;
      }
      const naCorrRounded = Math.round(naCorr * 10) / 10;
      naCorrElem.textContent = `補正 Na ≈ ${naCorrRounded.toFixed(1)} mEq/L`;

      // hyponatremia のざっくり評価
      if (naCorrRounded < 120) {
        naInterpElem.textContent = "高度低 Na 血症に相当します。症状や発症速度に応じて緊急度の評価が必要です。";
        naInterpElem.classList.add("risk-high");
      } else if (naCorrRounded < 130) {
        naInterpElem.textContent = "低 Na 血症に相当します。慢性/急性・症状の有無とあわせて評価してください。";
        naInterpElem.classList.add("risk-mid");
      } else {
        naInterpElem.textContent = "補正 Na は大きな低下を認めませんが、臨床症状とあわせて解釈してください。";
        naInterpElem.classList.add("risk-low");
      }

      // --- アニオンギャップ ---
      const includeK = agIncludeKInput && agIncludeKInput.checked;
      let ag;
      if (includeK && k != null) {
        ag = na + k - cl - hco3;
      } else {
        ag = na - cl - hco3;
      }
      const agRounded = Math.round(ag * 10) / 10;
      agResultElem.textContent = `アニオンギャップ AG ≈ ${agRounded.toFixed(1)} mEq/L`;

      agInterpElem.classList.remove("risk-low", "risk-mid", "risk-high");
      if (agRounded <= 12) {
        agInterpElem.textContent = "AG はおおむね正常範囲であり、正常 AG アシドーシスや混在病態の可能性を考えます。";
        agInterpElem.classList.add("risk-low");
      } else if (agRounded <= 16) {
        agInterpElem.textContent = "AG 軽度上昇です。乳酸・ケトン・毒素などの強陰イオンを念頭に置きつつ、経過とあわせて評価してください。";
        agInterpElem.classList.add("risk-mid");
      } else {
        agInterpElem.textContent = "AG 明らかな上昇であり、乳酸アシドーシス・ケトアシドーシス・腎不全・サリチル酸などの可能性を検討します。";
        agInterpElem.classList.add("risk-high");
      }

      // --- Alb 補正 AG（Stewart セクションの Alb を利用）---
      if (agUseAlbInput && agUseAlbInput.checked) {
        const albInput = document.getElementById("stw-alb");
        if (albInput) {
          const { value: alb } = parseNumericInput(
            albInput,
            { ...RANGE_PRESETS.ALBUMIN, allowEmpty: true }
          );
          if (alb != null) {
            const agCorr = ag + 2.5 * (4 - alb);
            const agCorrRounded = Math.round(agCorr * 10) / 10;
            agCorrResultElem.textContent =
              `Alb 補正 AG ≈ ${agCorrRounded.toFixed(1)} mEq/L`;
            agCorrNoteElem.textContent =
              "Alb 補正 AG ≒ AG + 2.5 × (4 − Alb[g/dL]) として計算しています。低 Alb 血症では補正後の AG を参考にしてください。";
          } else {
            agCorrResultElem.textContent = "";
            agCorrNoteElem.textContent =
              "Stewart セクションで Alb を入力すると、Alb 補正 AG を表示できます。";
          }
        }
      }

      // --- 浸透圧 ---
      const { value: bun } = parseNumericInput(

        document.createElement("input"),
        { ...RANGE_PRESETS.BUN, allowEmpty: true }
      );
      // BUN は別途入力欄を作ってもよいが、今回は計算式の説明に留める場合は省略も可
      // → 実際には BUN 入力欄を追加した場合に parseNumericInput を適用してください。

      // ここでは Na と血糖のみから簡易的な計算浸透圧を出す（BUN は省略可）
      let osmCalc = 2 * na + glu / 18;
      const osmCalcRounded = Math.round(osmCalc * 10) / 10;
      osmCalcElem.textContent = `計算浸透圧 ≈ ${osmCalcRounded.toFixed(1)} mOsm/kg`;

      if (osmMeasured != null) {
        const gap = osmMeasured - osmCalc;
        const gapRounded = Math.round(gap * 10) / 10;
        osmGapElem.textContent = `浸透圧ギャップ ≈ ${gapRounded.toFixed(1)} mOsm/kg`;

        osmInterpElem.classList.remove("risk-low", "risk-mid", "risk-high");
        if (gapRounded < 10) {
          osmInterpElem.textContent = "浸透圧ギャップは大きくなく、エタノールや有機溶媒などの浸透圧物質の関与は目立たないと考えられます。";
          osmInterpElem.classList.add("risk-low");
        } else if (gapRounded < 20) {
          osmInterpElem.textContent = "浸透圧ギャップ軽度上昇です。アルコール摂取や中毒などの可能性を臨床状況とあわせて検討してください。";
          osmInterpElem.classList.add("risk-mid");
        } else {
          osmInterpElem.textContent = "浸透圧ギャップが明らかに大きく、中毒性アルコールなどの関与を強く疑う所見です。緊急評価が必要となりえます。";
          osmInterpElem.classList.add("risk-high");
        }
      }
    });
  }

  // --- 2. Stewart アプローチ簡易（SID）---
  const stwNaInput  = document.getElementById("stw-na");
  const stwKInput   = document.getElementById("stw-k");
  const stwClInput  = document.getElementById("stw-cl");
  const stwAlbInput = document.getElementById("stw-alb");
  const stwLacInput = document.getElementById("stw-lac");

  const stwBtn      = document.getElementById("stw-calc-btn");
  const stwSidElem  = document.getElementById("stw-sid-result");
  const stwInterpElem = document.getElementById("stw-sid-interpret");
  const stwNoteElem = document.getElementById("stw-note");

  if (stwBtn) {
    stwBtn.addEventListener("click", () => {
      [stwNaInput, stwKInput, stwClInput, stwAlbInput, stwLacInput].forEach((el) => {
        if (el && typeof clearFieldError === "function") {
          clearFieldError(el);
        }
      });

      stwSidElem.textContent = "";
      stwInterpElem.textContent = "";
      stwNoteElem.textContent = "";

      let hasError = false;
      const { value: na,  error: eNa } =
        parseNumericInput(stwNaInput, RANGE_PRESETS.SODIUM);
      if (eNa) hasError = true;

      const { value: k,   error: eK }  =
        parseNumericInput(stwKInput, RANGE_PRESETS.POTASSIUM);
      if (eK) hasError = true;

      const { value: cl,  error: eCl } =
        parseNumericInput(stwClInput, RANGE_PRESETS.CHLORIDE);
      if (eCl) hasError = true;

      const { value: alb, error: eAlb } =
        parseNumericInput(stwAlbInput, { ...RANGE_PRESETS.ALBUMIN, allowEmpty: true });
      if (eAlb) hasError = true;

      const { value: lac, error: eLac } =
        parseNumericInput(stwLacInput, { ...RANGE_PRESETS.LACTATE, allowEmpty: true });
      if (eLac) hasError = true;

      if (hasError) return;

      const sid = na + k - cl;
      const sidRounded = Math.round(sid * 10) / 10;
      stwSidElem.textContent = `SID ≈ ${sidRounded.toFixed(1)} mEq/L（Na + K - Cl）`;

      stwInterpElem.classList.remove("risk-low", "risk-mid", "risk-high");
      if (sidRounded < 36) {
        stwInterpElem.textContent =
          "SID 低下で、Stewart の枠組みでは代謝性アシドーシス（強陰イオン増加または Cl 増加）の傾向と解釈されます。";
        stwInterpElem.classList.add("risk-high");
      } else if (sidRounded <= 44) {
        stwInterpElem.textContent =
          "SID はおおむね正常範囲であり、酸塩基バランスは大きな偏りがない可能性があります。";
        stwInterpElem.classList.add("risk-low");
      } else {
        stwInterpElem.textContent =
          "SID 上昇で、Stewart の枠組みでは代謝性アルカローシスや濃縮（contraction）を反映している可能性があります。";
        stwInterpElem.classList.add("risk-mid");
      }

      let noteParts = [];
      if (alb != null) {
        noteParts.push(`Alb ${alb.toFixed(1)} g/dL では、低アルブミン血症が AG を低く見せる可能性があります。`);
      }
      if (lac != null && lac > 2) {
        noteParts.push(`乳酸 ${lac.toFixed(1)} mmol/L と上昇しており、強陰イオン増加型アシドーシスを示唆します。`);
      }
      if (noteParts.length === 0) {
        stwNoteElem.textContent = "Stewart アプローチでは、SID に加えて Alb・乳酸・リン・pCO₂ なども総合的に評価します。ここでは一部のみの簡易評価です。";
      } else {
        stwNoteElem.textContent = noteParts.join(" ");
      }
    });
  }

  // --- 3. RTA 類型化ヒント（Boolean グループ）---
  const rtaMetAcidInput   = document.getElementById("rta-met-acid");
  const rtaNormalAgInput  = document.getElementById("rta-normal-ag");
  const rtaUrinePhHighInput = document.getElementById("rta-urine-ph-high");
  const rtaHypoKInput     = document.getElementById("rta-hypok");
  const rtaHyperKInput    = document.getElementById("rta-hyperk");
  const rtaCkdInput       = document.getElementById("rta-ckd");

  const rtaBtn            = document.getElementById("rta-eval-btn");
  const rtaSuggestionElem = document.getElementById("rta-suggestion");
  const rtaDetailElem     = document.getElementById("rta-detail");

  if (rtaBtn) {
    rtaBtn.addEventListener("click", () => {
      rtaSuggestionElem.textContent = "";
      rtaDetailElem.textContent = "";

      const metAcid  = parseBooleanInput(rtaMetAcidInput) === 1;
      const normalAg = parseBooleanInput(rtaNormalAgInput) === 1;
      const urinePhHigh = parseBooleanInput(rtaUrinePhHighInput) === 1;
      const hypoK   = parseBooleanInput(rtaHypoKInput) === 1;
      const hyperK  = parseBooleanInput(rtaHyperKInput) === 1;
      const ckd     = parseBooleanInput(rtaCkdInput) === 1;

      if (!metAcid || !normalAg) {
        rtaSuggestionElem.textContent = "典型的な RTA パターンではない可能性が高いです。";
        rtaDetailElem.textContent =
          "代謝性アシドーシスかつ正常 AG でない場合、まずは乳酸・ケトン・中毒物質・腎不全など AG 上昇型アシドーシスを優先して検討してください。";
        return;
      }

      // 4 型 RTA
      if (hyperK) {
        rtaSuggestionElem.textContent = "4 型 RTA（低レニン・低アルドステロン状態）をまず検討する状況です。";
        rtaDetailElem.textContent =
          "高 K 血症を伴う正常 AG 代謝性アシドーシスでは、糖尿病性腎症・RAA 系阻害薬・副腎不全などを含む 4 型 RTA の鑑別が重要です。";
        return;
      }

      // 1 型 vs 2 型（いずれも低 K 傾向）
      if (hypoK && urinePhHigh) {
        rtaSuggestionElem.textContent = "1 型（遠位）RTA を示唆する組み合わせです。";
        rtaDetailElem.textContent =
          "低 K 血症かつ正常 AG アシドーシスで尿 pH > 5.5 が持続する場合、遠位尿細管での H⁺ 分泌障害による 1 型 RTA を考えます。尿中 NH₄⁺ 排泄や画像所見（腎石灰化など）も参考になります。";
        return;
      }

      if (hypoK && !urinePhHigh) {
        rtaSuggestionElem.textContent = "2 型（近位）RTA を考慮する組み合わせです。";
        rtaDetailElem.textContent =
          "低 K 血症に正常 AG アシドーシスを伴い、尿 pH は HCO₃⁻ が低下してからは 5.5 未満となる場合、近位尿細管での HCO₃⁻ 再吸収障害による 2 型 RTA を考えます。Fanconi 症候群の所見がないか確認が必要です。";
        return;
      }

      // CKD を背景にした NAGMA
      if (ckd) {
        rtaSuggestionElem.textContent = "CKD に伴う正常 AG アシドーシスの可能性が高いです。";
        rtaDetailElem.textContent =
          "明らかな腎機能低下がある場合、RTA というより CKD に伴う酸排泄低下としての正常 AG アシドーシスで説明できることもあります。尿電解質や経過をふまえて総合的に評価してください。";
        return;
      }

      // その他
      rtaSuggestionElem.textContent = "正常 AG 代謝性アシドーシスですが、典型的 RTA 型ははっきりしません。";
      rtaDetailElem.textContent =
        "下痢・胆汁瘻・尿路変向など消化管からの HCO₃⁻ 喪失も正常 AG アシドーシスの重要な原因です。RTA を疑う場合は尿電解質・尿 pH の連続測定などが有用です。";
    });
  }
});

// dka_hhs.js
// DKA の重症度分類 + HHS 判定

document.addEventListener("DOMContentLoaded", () => {
  const glucoseInput = document.getElementById("dka-glucose");
  const glucoseUnitSelect = document.getElementById("dka-glucose-unit");
  const phInput = document.getElementById("dka-ph");
  const hco3Input = document.getElementById("dka-hco3");
  const osmInput = document.getElementById("dka-osm");
  const calcButton = document.getElementById("dka-hhs-calc-button");
  const resultElem = document.getElementById("dka-hhs-result");
  const interpretElem = document.getElementById("dka-hhs-interpret");

  if (!calcButton) return;

  // --- 単位切替処理（mg/dL ↔ mmol/L） ---
  if (glucoseInput && glucoseUnitSelect && typeof convertInputElementUnit === "function") {
    glucoseInput.dataset.unit = glucoseUnitSelect.value;

    glucoseUnitSelect.addEventListener("change", () => {
      const prevUnit = glucoseInput.dataset.unit || glucoseUnitSelect.value;
      const newUnit = glucoseUnitSelect.value;
      if (prevUnit === newUnit) return;

      // glucose: mg/dL <-> mmol/L
      const digits = newUnit === "mmol/L" ? 1 : 0;
      convertInputElementUnit(glucoseInput, prevUnit, newUnit, "glucose", digits);
      glucoseInput.dataset.unit = newUnit;
    });
  }

  function getSelectedMentalStatus() {
    const el = document.querySelector('input[name="dka-ms"]:checked');
    return el ? el.value : "alert";
  }

  function classifyDkaSeverity(ph, hco3, mentalStatus) {
    // DKA の典型的な基準：
    //   Mild   : pH 7.25–7.30 または HCO3 15–18
    //   Moderate: pH 7.00–7.24 または HCO3 10–<15
    //   Severe : pH <7.00 または HCO3 <10
    let base = null;

    const phMild = ph >= 7.25 && ph <= 7.30;
    const phMod = ph >= 7.00 && ph < 7.25;
    const phSevere = ph < 7.00;

    const hco3Mild = hco3 >= 15 && hco3 <= 18;
    const hco3Mod = hco3 >= 10 && hco3 < 15;
    const hco3Severe = hco3 < 10;

    if (phSevere || hco3Severe) {
      base = "severe";
    } else if (phMod || hco3Mod) {
      base = "moderate";
    } else if (phMild || hco3Mild) {
      base = "mild";
    } else {
      return null;
    }

    // 意識状態で 1 段階補正
    if (mentalStatus === "stupor") {
      base = "severe";
    } else if (mentalStatus === "drowsy" && base === "mild") {
      base = "moderate";
    }

    return base;
  }

  function isHhs(glucoseMgDl, ph, hco3, osm) {
    // ざっくりした HHS の目安
    if (Number.isNaN(glucoseMgDl)) return false;
    if (glucoseMgDl < 600) return false;
    if (ph < 7.3 || hco3 < 18) return false;
    if (osm == null || Number.isNaN(osm)) return false;
    return osm >= 320;
  }

  calcButton.addEventListener("click", (e) => {
    e.preventDefault();

    // 血糖
    const glucoseParsed = parseNumericInput(glucoseInput, RANGE_PRESETS.GLUCOSE);
    if (glucoseParsed.error) return;

    const currentUnit = glucoseUnitSelect ? glucoseUnitSelect.value : "mg/dL";
    let glucoseMg = glucoseParsed.value;
    if (currentUnit === "mmol/L") {
      glucoseMg = convertUnit(glucoseParsed.value, "mmol/L", "mg/dL", "glucose");
    }

    // pH
    const phParsed = parseNumericInput(phInput, {
      min: 6.5,
      max: 8.0,
    });
    if (phParsed.error) return;

    // HCO3-
    const hco3Parsed = parseNumericInput(hco3Input, RANGE_PRESETS.HCO3);
    if (hco3Parsed.error) return;

    // 浸透圧（任意入力）
    let osmValue = null;
    if (osmInput.value.trim() !== "") {
      const osmParsed = parseNumericInput(osmInput, {
        ...RANGE_PRESETS.OSMOLALITY,
        allowEmpty: true,
      });
      if (!osmParsed.error) {
        osmValue = osmParsed.value;
      }
    }

    const mental = getSelectedMentalStatus();

    const hasDkaAcidosis =
      phParsed.value < 7.30 || hco3Parsed.value < 18;

    // まず HHS かどうか判定
    if (!hasDkaAcidosis && isHhs(glucoseMg, phParsed.value, hco3Parsed.value, osmValue)) {
      resultElem.textContent = "判定: HHS（高浸透圧高血糖症候群）の基準を満たします。";
      interpretElem.textContent =
        "高血糖・高度高浸透圧で、酸塩基平衡はDKAの典型的パターンではありません。循環動態・電解質・意識状態を含めて、緊急度を臨床的に評価してください。";
      return;
    }

    // DKA 重症度
    if (hasDkaAcidosis && glucoseMg >= 250) {
      const severity = classifyDkaSeverity(
        phParsed.value,
        hco3Parsed.value,
        mental
      );

      if (!severity) {
        resultElem.textContent = "判定: DKA の典型的な重症度カテゴリーに当てはまりません。";
        interpretElem.textContent =
          "血糖や酸塩基バランスが境界的な可能性があります。臨床経過や他の検査結果とあわせて評価してください。";
        return;
      }

      let label;
      if (severity === "mild") {
        label = "軽症 DKA";
      } else if (severity === "moderate") {
        label = "中等症 DKA";
      } else {
        label = "重症 DKA";
      }

      resultElem.textContent = `判定: ${label}`;
      interpretElem.textContent =
        "分類は pH / HCO₃⁻ / 意識状態をもとにした目安です。実際の治療方針や入院区分は、循環動態・合併症・既往歴などを含めて総合的に判断してください。";
      return;
    }

    // DKA も HHS も典型的ではない
    resultElem.textContent = "判定: 典型的な DKA / HHS の基準を満たしません。";
    interpretElem.textContent =
      "血糖値や酸塩基平衡が中途半端な領域か、別の病態が関与している可能性があります。臨床像・追加検査とあわせて評価してください。";
  });
});

// as_classification.js
// 強直性脊椎炎：修正 New York 基準による分類判定

document.addEventListener("DOMContentLoaded", () => {
  const calcButton = document.getElementById("calc-as-classification");
  if (!calcButton) return;

  calcButton.addEventListener("click", () => {
    const radiologicInput = document.getElementById("as-radiologic");
    const backPainInput = document.getElementById("as-clinical-back-pain");
    const lumbarLimitInput = document.getElementById("as-clinical-lumbar-limit");
    const chestExpansionInput = document.getElementById("as-clinical-chest-expansion");

    const resultElem = document.getElementById("as-classification-result");
    const interpretElem = document.getElementById("as-classification-interpret");
    const asasResultElem = document.getElementById("asas-axspa-result");
    const asasInterpretElem = document.getElementById("asas-axspa-interpret");


    // Boolean → 1/0 に変換
    const radiologic = parseBooleanInput(radiologicInput); // 1 or 0
    const clinicalBackPain = parseBooleanInput(backPainInput);
    const clinicalLumbar = parseBooleanInput(lumbarLimitInput);
    const clinicalChest = parseBooleanInput(chestExpansionInput);

    const clinicalCount =
      clinicalBackPain + clinicalLumbar + clinicalChest;

    // 判定ロジック
    if (radiologic === 1 && clinicalCount >= 1) {
      resultElem.textContent = "definite AS（修正 New York 基準を満たす）";
      interpretElem.textContent =
        "画像上の仙腸関節炎があり、少なくとも1つ以上の臨床条件を満たしています。";
    } else if (radiologic === 1 && clinicalCount === 0) {
      resultElem.textContent = "画像所見あり（definite AS には臨床条件が不足）";
      interpretElem.textContent =
        "画像上は仙腸関節炎がありますが、臨床項目が少なくとも1つ以上必要です。";
    } else if (radiologic === 0 && clinicalCount >= 1) {
      resultElem.textContent = "臨床条件のみを満たす（definite AS には画像所見が必要）";
      interpretElem.textContent =
        "臨床的には疑わしい所見がありますが、修正 New York 基準上は画像での仙腸関節炎が必要です。";
    } else {
      resultElem.textContent = "修正 New York 基準上は強直性脊椎炎に分類されません";
      interpretElem.textContent =
        "画像所見・臨床項目ともに基準を満たしていません。";
    }

    // --- ASAS axial SpA 基準 ---
    const asasChronicBackPain = parseBooleanInput(
      document.getElementById("asas-chronic-backpain")
    );
    const asasOnsetBefore45 = parseBooleanInput(
      document.getElementById("asas-onset-before-45")
    );
    const asasHlaB27 = parseBooleanInput(
      document.getElementById("asas-hla-b27")
    );

    const spaFeatures = [
      "asas-feature-infl-backpain",
      "asas-feature-arthritis",
      "asas-feature-enthesitis",
      "asas-feature-uveitis",
      "asas-feature-dactylitis",
      "asas-feature-psoriasis",
      "asas-feature-ibd",
      "asas-feature-good-nsaid",
      "asas-feature-family-history",
      "asas-feature-elevated-crp",
    ].reduce((sum, id) => {
      const el = document.getElementById(id);
      return sum + parseBooleanInput(el);
    }, 0);

    const basicCondition =
      asasChronicBackPain === 1 && asasOnsetBefore45 === 1;

    let asasText = "";
    let asasInterpret = "";

    if (!basicCondition) {
      asasText = "ASAS axial SpA 基準の基本条件を満たしません";
      asasInterpret =
        "慢性腰背部痛（3か月以上）と発症年齢 < 45歳の両方を満たす必要があります。";
    } else {
      const imagingArm = radiologic === 1 && spaFeatures >= 1;
      const hlaArm = asasHlaB27 === 1 && spaFeatures >= 2;

      if (imagingArm || hlaArm) {
        if (imagingArm && hlaArm) {
          asasText = "ASAS axial SpA 基準を満たす（画像アーム・HLA-B27アーム両方）";
        } else if (imagingArm) {
          asasText = "ASAS axial SpA 基準を満たす（画像アーム）";
        } else {
          asasText = "ASAS axial SpA 基準を満たす（HLA-B27アーム）";
        }
        asasInterpret =
          "慢性腰背部痛 + 発症年齢 < 45歳 に加え、画像アーム（画像上の仙腸関節炎 + SpA feature ≥1）" +
          "または HLA-B27 アーム（HLA-B27 陽性 + SpA feature ≥2）を満たしています。";
      } else {
        asasText = "ASAS axial SpA 基準上は分類されません";
        asasInterpret =
          "基本条件は満たしますが、画像アーム（画像上の仙腸関節炎 + SpA feature ≥1）" +
          "または HLA-B27 アーム（HLA-B27 陽性 + SpA feature ≥2）のいずれかが必要です。";
      }
    }

    asasResultElem.textContent = asasText;
    asasInterpretElem.textContent = asasInterpret;
  });
});

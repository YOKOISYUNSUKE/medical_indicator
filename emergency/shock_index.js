// shock_index.js
// Shock Index（SI）と Age Shock Index（ASI）

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shockindex-form");
  if (!form) return;

  const ageInput = document.getElementById("si-age");
  const hrInput  = document.getElementById("si-hr");
  const sbpInput = document.getElementById("si-sbp");

  const resultEl    = document.getElementById("si-result");
  const interpretEl = document.getElementById("si-interpret");
  const calcBtn     = document.getElementById("si-calc-btn");

  calcBtn.addEventListener("click", () => {
    resultEl.textContent = "";
    interpretEl.textContent = "";

    const ageRes = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    const hrRes  = parseNumericInput(hrInput,  RANGE_PRESETS.HR);
    const sbpRes = parseNumericInput(sbpInput, RANGE_PRESETS.SBP);

    const errors = [ageRes, hrRes, sbpRes].filter(r => r.error);
    if (errors.length > 0) {
      return;
    }

    const age = ageRes.value;
    const hr  = hrRes.value;
    const sbp = sbpRes.value;

    if (sbp <= 0) {
      showFieldError(sbpInput, "収縮期血圧が 0 以下です");
      return;
    }

    const si  = hr / sbp;
    const asi = age * si;

    let siLabel = "";
    if (si < 0.5) {
      siLabel = "Shock Index 低め（徐脈・高血圧などの背景に注意）";
    } else if (si < 0.7) {
      siLabel = "Shock Index 正常域（0.5–0.7 程度）";
    } else if (si < 0.9) {
      siLabel = "Shock Index 軽度上昇（注意深い観察が必要）";
    } else if (si < 1.3) {
      siLabel = "Shock Index 中等度上昇（循環不全の可能性）";
    } else {
      siLabel = "Shock Index 高度上昇（ショックが強く疑われます）";
    }

    let asiLabel = "";
    if (asi < 30) {
      asiLabel = "Age Shock Index 低～中等度リスク（文献により閾値は異なります）";
    } else if (asi < 50) {
      asiLabel = "Age Shock Index 中等度リスク";
    } else {
      asiLabel = "Age Shock Index 高リスク（早期の集中治療介入を検討）";
    }

    resultEl.textContent =
      `Shock Index：${si.toFixed(2)} / Age Shock Index：${asi.toFixed(1)}`;

    interpretEl.innerHTML = [
      siLabel,
      asiLabel,
      "※ 閾値は疾患背景や文献により異なります。施設の運用ルールと併せて解釈してください。"
    ].join("<br />");
  });
});

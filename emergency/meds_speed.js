// meds_speed.js
// MEDS + SPEED をまとめたファイル

// =========================
// MEDS
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("meds-form");
  if (!form) return;

  const ageInput    = document.getElementById("meds-age");
  const groupEl     = document.getElementById("meds-group");
  const resultEl    = document.getElementById("meds-result");
  const interpretEl = document.getElementById("meds-interpret");
  const calcBtn     = document.getElementById("meds-calc-btn");

  calcBtn.addEventListener("click", () => {
    resultEl.textContent = "";
    interpretEl.textContent = "";

    const ageRes = parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    if (ageRes.error) {
      return;
    }
    const age = ageRes.value;

    // Boolean グループでチェックボックスを集計
    const groupResult = evaluateBooleanGroup(groupEl, {
      mode: "sum",
      weightAttr: "data-weight",
    });

    const agePoint = age > 65 ? 3 : 0;
    const total = groupResult.total + agePoint;

    let riskLabel = "";
    let detail = "";

    if (total <= 4) {
      riskLabel = "極めて低リスク";
      detail = "短期死亡リスクは比較的低い層ですが、経時的なスコア上昇やバイタル悪化には注意が必要です。";
    } else if (total <= 7) {
      riskLabel = "低リスク";
      detail = "死亡率は 1 桁台とされる層で、多くは標準治療で改善が期待できます。";
    } else if (total <= 12) {
      riskLabel = "中等度リスク";
      detail = "死亡リスクが有意に上昇する層であり、入院場所や集中治療の要否を早期に検討します。";
    } else if (total <= 15) {
      riskLabel = "高リスク";
      detail = "重症 sepsis / septic shock を多く含む層で、ICU 収容や積極的な蘇生が推奨されます。";
    } else {
      riskLabel = "極めて高リスク";
      detail = "非常に高い死亡率が報告される層で、最優先の集中治療介入が必要です。";
    }

    const checkedItems = groupResult.items
      .filter(item => item.checked)
      .map(item => {
        const label = item.input.closest("label");
        return label ? label.textContent.trim() : "";
      })
      .filter(text => text.length > 0);

    resultEl.textContent = `MEDS スコア：${total} 点（${riskLabel}）`;

    const lines = [];
    lines.push(`年齢ポイント：${agePoint} 点`);
    lines.push(`MEDS 項目ポイント合計：${groupResult.total} 点`);
    if (checkedItems.length > 0) {
      lines.push("選択された MEDS 項目：");
      lines.push(checkedItems.join(" / "));
    }
    lines.push(detail);
    lines.push("※ 実際の死亡率は施設や患者背景により変動します。原著および施設のデータを参考に解釈してください。");

    interpretEl.innerHTML = lines.join("<br>");
  });
});

// =========================
// SPEED
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const groupEl = document.getElementById("speed-group");
  const calcBtn = document.getElementById("speed-calc-btn");
  const resultEl = document.getElementById("speed-result");
  const interpretEl = document.getElementById("speed-interpret");

  if (!groupEl || !calcBtn) {
    return;
  }

  function calcSpeedScore() {
    const checkboxes = groupEl.querySelectorAll("input[type='checkbox']");
    let total = 0;

    checkboxes.forEach((cb) => {
      if (cb.checked) {
        const weight = Number(cb.dataset.weight || "0");
        if (Number.isFinite(weight)) {
          total += weight;
        }
      }
    });

    return total;
  }

  function getSpeedRiskText(score) {
    if (score <= 3) {
      return "低リスク（0–3 点）";
    }
    if (score <= 6) {
      return "中等度リスク（4–6 点）";
    }
    if (score <= 9) {
      return "高リスク（7–9 点）";
    }
    return "非常に高リスク（10 点以上）";
  }

  function renderResult(score) {
    if (typeof window.formatScoreResult === "function") {
      resultEl.innerHTML = window.formatScoreResult(score, {
        label: "SPEED スコア",
        unit: "点"
      });
    } else {
      resultEl.textContent = `SPEED スコア: ${score} 点`;
    }
    interpretEl.textContent = getSpeedRiskText(score);
  }

  calcBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const score = calcSpeedScore();
    renderResult(score);

    if (typeof window.addScoreHistory === "function") {
      window.addScoreHistory("SPEED", score);
    }
  });
});

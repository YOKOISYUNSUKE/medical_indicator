// news2_rems.js
// NEWS2 + REMS をまとめたファイル

// =========================
// NEWS2
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("news2-form");
  if (!form) return;

  const rrInput   = document.getElementById("news2-rr");
  const spo2Input = document.getElementById("news2-spo2");
  const o2Select  = document.getElementById("news2-o2");
  const tempInput = document.getElementById("news2-temp");
  const sbpInput  = document.getElementById("news2-sbp");
  const hrInput   = document.getElementById("news2-hr");

  const resultEl    = document.getElementById("news2-result");
  const interpretEl = document.getElementById("news2-interpret");
  const calcBtn     = document.getElementById("news2-calc-btn");

  function scoreRespRate(rr) {
    if (rr <= 8) return 3;
    if (rr <= 11) return 1;
    if (rr <= 20) return 0;
    if (rr <= 24) return 2;
    return 3; // ≥25
  }

  function scoreSpO2(spo2) {
    // NEWS2 SpO2 Scale 1
    if (spo2 <= 91) return 3;
    if (spo2 <= 93) return 2;
    if (spo2 <= 95) return 1;
    return 0; // ≥96
  }

  function scoreTemperature(temp) {
    if (temp <= 35.0) return 3;
    if (temp <= 36.0) return 1;
    if (temp <= 38.0) return 0;
    if (temp <= 39.0) return 1;
    return 2; // ≥39.1
  }

  function scoreSBP(sbp) {
    if (sbp <= 90) return 3;
    if (sbp <= 100) return 2;
    if (sbp <= 110) return 1;
    if (sbp <= 219) return 0;
    return 3; // ≥220
  }

  function scoreHR(hr) {
    if (hr <= 40) return 3;
    if (hr <= 50) return 1;
    if (hr <= 90) return 0;
    if (hr <= 110) return 1;
    if (hr <= 130) return 2;
    return 3; // ≥131
  }

  function scoreConscious(acvpu) {
    return acvpu === "A" ? 0 : 3;
  }

  function getACVPU() {
    const checked = form.querySelector('input[name="news2-acvpu"]:checked');
    return checked ? checked.value : "A";
  }

  calcBtn.addEventListener("click", () => {
    resultEl.textContent = "";
    interpretEl.textContent = "";

    const rrRes   = parseNumericInput(rrInput,   RANGE_PRESETS.RR_PER_MIN);
    const spo2Res = parseNumericInput(spo2Input, RANGE_PRESETS.SPO2_PERCENT);
    const tempRes = parseNumericInput(tempInput, RANGE_PRESETS.TEMP_C);
    const sbpRes  = parseNumericInput(sbpInput,  RANGE_PRESETS.SBP);
    const hrRes   = parseNumericInput(hrInput,   RANGE_PRESETS.HR);

    const errors = [rrRes, spo2Res, tempRes, sbpRes, hrRes].filter(r => r.error);
    if (errors.length > 0) {
      return;
    }

    const rr    = rrRes.value;
    const spo2  = spo2Res.value;
    const temp  = tempRes.value;
    const sbp   = sbpRes.value;
    const hr    = hrRes.value;
    const acvpu = getACVPU();
    const onO2  = (o2Select?.value === "yes");

    const rrScore    = scoreRespRate(rr);
    const spo2Score  = scoreSpO2(spo2);
    const o2Score    = onO2 ? 2 : 0;
    const tempScore  = scoreTemperature(temp);
    const sbpScore   = scoreSBP(sbp);
    const hrScore    = scoreHR(hr);
    const concScore  = scoreConscious(acvpu);

    const total = rrScore + spo2Score + o2Score +
                  tempScore + sbpScore + hrScore + concScore;

    const hasAny3 = [rrScore, spo2Score, tempScore, sbpScore, hrScore, concScore]
      .some(s => s === 3);

    let riskLabel = "";
    let suggestion = "";

    if (total <= 4 && !hasAny3) {
      riskLabel = "低リスク";
      suggestion = "通常の観察頻度ですが、スコアの経時的な上昇には注意してください。";
    } else if ((total >= 5 && total <= 6) || (total <= 4 && hasAny3)) {
      riskLabel = "中等度リスク";
      suggestion = "観察頻度の増加や、早期の上級医レビューを検討します。";
    } else {
      riskLabel = "高リスク";
      suggestion = "救急・集中治療チームへのコンサルトや迅速な治療介入を検討します。";
    }

    resultEl.textContent = `NEWS2 合計スコア：${total} 点（${riskLabel}）`;
    interpretEl.innerHTML = [
      `呼吸：${rrScore} 点 / SpO₂：${spo2Score} 点 + O₂ ${o2Score} 点 / 体温：${tempScore} 点`,
      `血圧：${sbpScore} 点 / 心拍：${hrScore} 点 / 意識レベル：${concScore} 点`,
      suggestion
    ].join("<br>");
  });
});

// =========================
// REMS
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const ageInput = document.getElementById("rems-age");
  const mapInput = document.getElementById("rems-map");
  const hrInput  = document.getElementById("rems-hr");
  const rrInput  = document.getElementById("rems-rr");
  const spo2Input = document.getElementById("rems-spo2");
  const gcsInput = document.getElementById("rems-gcs");

  const calcBtn  = document.getElementById("rems-calc-btn");
  const resultEl = document.getElementById("rems-result");
  const interpretEl = document.getElementById("rems-interpret");

  if (!ageInput || !mapInput || !hrInput || !rrInput || !spo2Input || !gcsInput || !calcBtn) {
    return;
  }

  function parseNumber(input) {
    const raw = (input.value || "").trim().replace(/[＋+]/g, "");
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    return value;
  }

  function scoreAge(age) {
    if (age <= 45) return 0;
    if (age <= 54) return 2;
    if (age <= 64) return 3;
    if (age <= 74) return 5;
    return 6;
  }

  function scoreMAP(map) {
    if (map <= 29) return 4;
    if (map <= 49) return 3;
    if (map <= 69) return 2;
    if (map <= 109) return 0;
    if (map <= 129) return 2;
    if (map <= 159) return 3;
    return 4;
  }

  function scoreHR(hr) {
    if (hr >= 70 && hr <= 109) return 0;
    if ((hr >= 55 && hr <= 69) || (hr >= 110 && hr <= 139)) return 2;
    if ((hr >= 40 && hr <= 54) || (hr >= 140 && hr <= 179)) return 3;
    return 4; // ≤39 または ≥180
  }

  function scoreRR(rr) {
    if (rr >= 12 && rr <= 24) return 0;
    if ((rr >= 10 && rr <= 11) || (rr >= 25 && rr <= 34)) return 1;
    if (rr >= 6 && rr <= 9) return 2;
    if (rr >= 35 && rr <= 48) return 3;
    return 4; // ≤5 または ≥49
  }

  function scoreGCS(gcs) {
    if (gcs >= 14) return 0;
    if (gcs >= 11) return 1;
    if (gcs >= 8) return 2;
    if (gcs >= 5) return 3;
    return 4;
  }

  function scoreSpO2(spo2) {
    if (spo2 > 89) return 0;
    if (spo2 >= 86) return 1;
    if (spo2 >= 75) return 3;
    return 4;
  }

  function getRiskText(score) {
    if (score < 6) {
      return "低リスク（REMS &lt; 6）";
    }
    if (score <= 13) {
      return "中等度リスク（6–13）";
    }
    return "高リスク（&gt;13）";
  }

  function renderResult(score) {
    if (typeof window.formatScoreResult === "function") {
      resultEl.innerHTML = window.formatScoreResult(score, {
        label: "REMS スコア",
        unit: "点"
      });
    } else {
      resultEl.textContent = `REMS スコア: ${score} 点`;
    }
    interpretEl.textContent = getRiskText(score);
  }

  calcBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const age  = parseNumber(ageInput);
    const map  = parseNumber(mapInput);
    const hr   = parseNumber(hrInput);
    const rr   = parseNumber(rrInput);
    const spo2 = parseNumber(spo2Input);
    const gcs  = parseNumber(gcsInput);

    if ([age, map, hr, rr, spo2, gcs].some(v => v === null)) {
      resultEl.textContent = "入力値を確認してください。";
      interpretEl.textContent = "";
      return;
    }

    const score =
      scoreAge(age) +
      scoreMAP(map) +
      scoreHR(hr) +
      scoreRR(rr) +
      scoreSpO2(spo2) +
      scoreGCS(gcs);

    renderResult(score);

    if (typeof window.addScoreHistory === "function") {
      window.addScoreHistory("REMS", score);
    }
  });
});

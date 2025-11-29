// consciousness.js
// JCS / GCS / FOUR スコアの計算・解釈

document.addEventListener("DOMContentLoaded", () => {
  // --- JCS ---
  const jcsSelect = document.getElementById("jcs-code");
  const jcsBtn = document.getElementById("jcs-calc-btn");
  const jcsResult = document.getElementById("jcs-result");
  const jcsInterpret = document.getElementById("jcs-interpret");

  if (jcsBtn && jcsSelect && jcsResult && jcsInterpret) {
    jcsBtn.addEventListener("click", () => {
      const raw = jcsSelect.value;
      if (!raw) {
        if (typeof showFieldError === "function") {
          showFieldError(jcsSelect, "JCS を選択してください");
        }
        jcsResult.textContent = "";
        jcsInterpret.textContent = "";
        return;
      }
      if (typeof clearFieldError === "function") {
        clearFieldError(jcsSelect);
      }

      const code = Number(raw);
      let level = "";
      if (code === 0) {
        level = "意識清明（JCS 0）です。";
      } else if (code < 10) {
        level = "I桁（傾眠〜軽度意識障害）の範囲です。";
      } else if (code < 100) {
        level = "II桁（刺激により覚醒する昏迷）の範囲です。";
      } else {
        level = "III桁（深昏睡）の範囲です。";
      }

      jcsResult.textContent = `JCS: ${code}`;
      jcsInterpret.textContent =
        `${level} 臨床経過や他のスコア（GCS / FOUR）と併せて評価してください。`;
    });
  }

  // --- GCS ---
  const gcsEye = document.getElementById("gcs-eye");
  const gcsVerbal = document.getElementById("gcs-verbal");
  const gcsMotor = document.getElementById("gcs-motor");
  const gcsBtn = document.getElementById("gcs-calc-btn");
  const gcsResult = document.getElementById("gcs-result");
  const gcsInterpret = document.getElementById("gcs-interpret");

  function gcsShowErrorIfEmpty(select) {
    if (!select) return false;
    if (!select.value) {
      if (typeof showFieldError === "function") {
        showFieldError(select, "選択してください");
      }
      return true;
    }
    if (typeof clearFieldError === "function") {
      clearFieldError(select);
    }
    return false;
  }

  if (gcsBtn && gcsEye && gcsVerbal && gcsMotor && gcsResult && gcsInterpret) {
    gcsBtn.addEventListener("click", () => {
      let hasError = false;
      hasError = gcsShowErrorIfEmpty(gcsEye) || hasError;
      hasError = gcsShowErrorIfEmpty(gcsVerbal) || hasError;
      hasError = gcsShowErrorIfEmpty(gcsMotor) || hasError;

      if (hasError) {
        gcsResult.textContent = "";
        gcsInterpret.textContent = "";
        return;
      }

      const e = Number(gcsEye.value);
      const v = Number(gcsVerbal.value);
      const m = Number(gcsMotor.value);
      const total = e + v + m;

      gcsResult.textContent = `GCS: E${e} V${v} M${m}（合計 ${total} 点）`;

      let msg;
      if (total >= 13) {
        msg = "軽症（mild）とされることが多い範囲です。";
      } else if (total >= 9) {
        msg = "中等症（moderate）の範囲です。気道管理や画像評価を要します。";
      } else {
        msg = "重症（severe）頭部外傷・脳障害の範囲です。集中治療レベルの管理を検討してください。";
      }

      gcsInterpret.textContent =
        `${msg} intubation の適応や画像所見なども含めて総合判断してください。`;
    });
  }

  // --- FOUR スコア ---
  const fourEye = document.getElementById("four-eye");
  const fourMotor = document.getElementById("four-motor");
  const fourBrain = document.getElementById("four-brainstem");
  const fourResp = document.getElementById("four-resp");
  const fourBtn = document.getElementById("four-calc-btn");
  const fourResult = document.getElementById("four-result");
  const fourInterpret = document.getElementById("four-interpret");

  function fourShowErrorIfEmpty(select) {
    if (!select) return false;
    if (!select.value) {
      if (typeof showFieldError === "function") {
        showFieldError(select, "選択してください");
      }
      return true;
    }
    if (typeof clearFieldError === "function") {
      clearFieldError(select);
    }
    return false;
  }

  if (fourBtn && fourEye && fourMotor && fourBrain && fourResp && fourResult && fourInterpret) {
    fourBtn.addEventListener("click", () => {
      let hasError = false;
      hasError = fourShowErrorIfEmpty(fourEye) || hasError;
      hasError = fourShowErrorIfEmpty(fourMotor) || hasError;
      hasError = fourShowErrorIfEmpty(fourBrain) || hasError;
      hasError = fourShowErrorIfEmpty(fourResp) || hasError;

      if (hasError) {
        fourResult.textContent = "";
        fourInterpret.textContent = "";
        return;
      }

      const e = Number(fourEye.value);
      const m = Number(fourMotor.value);
      const b = Number(fourBrain.value);
      const r = Number(fourResp.value);
      const total = e + m + b + r;

      fourResult.textContent =
        `FOURスコア: E${e} M${m} B${b} R${r}（合計 ${total} / 16）`;

      let msg;
      if (total >= 13) {
        msg = "比較的保たれた意識レベルと考えられます。";
      } else if (total >= 9) {
        msg = "中等度の意識障害で、脳幹反射や呼吸パターンの慎重なフォローが必要です。";
      } else if (total >= 4) {
        msg = "重度の意識障害が疑われます。集中治療管理の適応を検討してください。";
      } else {
        msg = "極めて重度の意識障害で、予後不良リスクが非常に高い状態です。";
      }

      fourInterpret.textContent =
        `${msg} FOUR は特に人工呼吸管理中や GCS 測定困難例で有用です。`;
    });
  }
});

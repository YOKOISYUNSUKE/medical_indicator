// ckd_egfr.js
// CKD / eGFR 計算・G/A ステージ分類
// ※ module 不使用。score-utils.js を先に読み込む前提。

document.addEventListener("DOMContentLoaded", () => {
  const ageInput   = document.getElementById("ckd-age");
  const sexInput   = document.getElementById("ckd-sex");
  const crInput    = document.getElementById("ckd-cr");
  const uacrInput  = document.getElementById("ckd-uacr");

  const calcBtn    = document.getElementById("ckd-calc-btn");

  const egfrElem   = document.getElementById("ckd-egfr-result");
  const gStageElem = document.getElementById("ckd-gstage");
  const aStageElem = document.getElementById("ckd-astage");
  const commentElem= document.getElementById("ckd-comment");

  if (!calcBtn) return;

  calcBtn.addEventListener("click", () => {
    // 既存エラー表示のクリア
    [ageInput, crInput, uacrInput].forEach((input) => {
      if (input && typeof clearFieldError === "function") {
        clearFieldError(input);
      }
    });

    egfrElem.textContent   = "";
    gStageElem.textContent = "";
    aStageElem.textContent = "";
    commentElem.textContent= "";

    // --- 入力値のパース ---
    const { value: age,  error: ageErr }  =
      parseNumericInput(ageInput, RANGE_PRESETS.AGE);
    const { value: cr,   error: crErr }   =
      parseNumericInput(crInput, RANGE_PRESETS.CREATININE);
    const { value: uacr, error: uacrErr } =
      parseNumericInput(uacrInput, { ...RANGE_PRESETS.UACR, allowEmpty: true });

    if (ageErr || crErr || uacrErr) {
      // どれかにエラーがある場合は計算せず終了
      return;
    }

    const sex = sexInput.value === "female" ? "female" : "male";

    // --- eGFR 計算（日本腎臓学会推奨式）---
    // eGFR = 194 × Cr^-1.094 × Age^-0.287 × (女性なら 0.739)
    const egfrRaw =
      194 *
      Math.pow(cr, -1.094) *
      Math.pow(age, -0.287) *
      (sex === "female" ? 0.739 : 1);

    const egfr = Number.isFinite(egfrRaw) ? egfrRaw : NaN;

    if (!Number.isFinite(egfr)) {
      egfrElem.textContent = "eGFR を計算できませんでした（入力値を確認してください）";
      return;
    }

    const egfrRounded = Math.round(egfr * 10) / 10;
    egfrElem.textContent = `eGFR ≈ ${egfrRounded.toFixed(1)} mL/min/1.73m²`;

    // --- G ステージ分類 ---
    const gInfo = getGStage(egfrRounded);
    gStageElem.textContent = `Gステージ: ${gInfo.label}`;

    // --- A ステージ分類（UACR が入力されている場合のみ）---
    let aInfo = null;
    if (uacr !== null) {
      aInfo = getAStage(uacr);
      aStageElem.textContent = `Aステージ: ${aInfo.label}`;
    } else {
      aStageElem.textContent = "Aステージ: 未入力（UACR 未入力）";
    }

    // --- 簡易コメント ---
    const comment = buildCkdComment(gInfo, aInfo);
    commentElem.textContent = comment;
  });

  // ----- 補助関数 -----

  function getGStage(egfr) {
    if (egfr >= 90) {
      return { label: "G1（正常〜高値）", riskLevel: "low" };
    } else if (egfr >= 60) {
      return { label: "G2（軽度低下）", riskLevel: "low-mid" };
    } else if (egfr >= 45) {
      return { label: "G3a（軽度〜中等度低下）", riskLevel: "mid" };
    } else if (egfr >= 30) {
      return { label: "G3b（中等度〜高度低下）", riskLevel: "mid-high" };
    } else if (egfr >= 15) {
      return { label: "G4（高度低下）", riskLevel: "high" };
    } else {
      return { label: "G5（腎不全）", riskLevel: "very-high" };
    }
  }

  function getAStage(uacr) {
    if (uacr < 30) {
      return { label: "A1（正常〜軽度増加）", riskLevel: "low" };
    } else if (uacr < 300) {
      return { label: "A2（中等度増加）", riskLevel: "mid" };
    } else {
      return { label: "A3（高度増加）", riskLevel: "high" };
    }
  }

  function buildCkdComment(gInfo, aInfo) {
    // A ステージが無い（UACR 未入力）場合は G のみコメント
    if (!aInfo) {
      switch (gInfo.riskLevel) {
        case "low":
          return "G1–G2 相当であり、eGFR 単独では明らかな腎機能低下は乏しい可能性があります（蛋白尿や画像所見などを併せて評価してください）。";
        case "low-mid":
        case "mid":
          return "G3a 相当であり、CKD の可能性があります。蛋白尿の有無や経時変化を含めてフォローが必要です。";
        case "mid-high":
        case "high":
        case "very-high":
          return "G3b 以上であり、中等度〜高度の腎機能低下が疑われます。腎専門医への紹介や詳細評価を検討してください。";
        default:
          return "";
      }
    }

    // G×A でざっくりリスクコメント
    const combo = `${gInfo.riskLevel}-${aInfo.riskLevel}`;

    if (combo === "low-low") {
      return "G1–G2 かつ A1 に相当し、CKD としてのリスクは低いと考えられます。ただし経時的な変化は定期的に確認してください。";
    }

    if (
      combo === "low-mid" ||
      combo === "mid-low" ||
      combo === "mid-mid"
    ) {
      return "軽度の腎機能低下または中等度アルブミン尿を伴う組み合わせであり、心血管・腎イベントリスクの上昇に留意しつつ経過観察・生活習慣介入が重要です。";
    }

    if (
      combo === "mid-high" ||
      combo === "high-mid" ||
      combo === "high-high" ||
      combo === "very-high-high"
    ) {
      return "中等度〜高度の腎機能低下とアルブミン尿を伴う組み合わせであり、高リスク CKD が疑われます。早期の腎専門医紹介と包括的な介入を検討してください。";
    }

    return "CKD のリスクは G ステージと A ステージの組み合わせで評価してください。ここでのコメントは簡易な目安です。";
  }
});

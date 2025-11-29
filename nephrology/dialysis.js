// dialysis.js
// 透析・血液浄化ページ用の Kt/V・URR 計算ロジック

document.addEventListener("DOMContentLoaded", () => {
  const bunPreInput = document.getElementById("bun-pre");
  const bunPostInput = document.getElementById("bun-post");
  const timeInput = document.getElementById("dialysis-time");
  const ufInput = document.getElementById("uf-volume");
  const weightInput = document.getElementById("post-weight");

  const calcButton = document.getElementById("calc-ktv-btn");

  const ktvResultElem = document.getElementById("ktv-result");
  const ktvInterpretElem = document.getElementById("ktv-interpret");
  const urrResultElem = document.getElementById("urr-result");
  const urrInterpretElem = document.getElementById("urr-interpret");

  if (!calcButton) return;

  calcButton.addEventListener("click", () => {
    // --- 入力値のパース ---
    let hasError = false;

    const { value: bunPre, error: e1 } = parseNumericInput(
      bunPreInput,
      RANGE_PRESETS.BUN
    );
    if (e1) hasError = true;

    const { value: bunPost, error: e2 } = parseNumericInput(
      bunPostInput,
      RANGE_PRESETS.BUN
    );
    if (e2) hasError = true;

    const { value: t, error: e3 } = parseNumericInput(
      timeInput,
      RANGE_PRESETS.DIALYSIS_TIME_H
    );
    if (e3) hasError = true;

    const { value: uf, error: e4 } = parseNumericInput(
      ufInput,
      RANGE_PRESETS.UF_VOLUME_L
    );
    if (e4) hasError = true;

    const { value: weight, error: e5 } = parseNumericInput(
      weightInput,
      RANGE_PRESETS.WEIGHT
    );
    if (e5) hasError = true;

    if (hasError) {
      clearResults();
      return;
    }

    // --- 追加バリデーション ---
    if (bunPost >= bunPre) {
      showFieldError(bunPostInput, "post BUN は pre BUN より小さい値を入力してください");
      clearResults();
      return;
    }

    const R = bunPost / bunPre;

    // Daugirdas II式の log 内部が正になるかチェック
    const logArg = R - 0.008 * t;
    if (logArg <= 0) {
      showFieldError(timeInput, "透析時間・BUN の組み合わせを見直してください");
      clearResults();
      return;
    }

    // --- Kt/V の計算 ---
    const ktv = -Math.log(logArg) + (4 - 3.5 * R) * (uf / weight);

    // --- URR の計算 ---
    const urr = (1 - R) * 100;

    // --- 結果表示 ---
    updateKtvResult(ktv);
    updateUrrResult(urr);
  });

  function clearResults() {
    ktvResultElem.textContent = "";
    ktvInterpretElem.textContent = "";
    ktvInterpretElem.classList.remove("risk-low", "risk-mid", "risk-high");

    urrResultElem.textContent = "";
    urrInterpretElem.textContent = "";
    urrInterpretElem.classList.remove("risk-low", "risk-mid", "risk-high");
  }

  function updateKtvResult(ktv) {
    if (!Number.isFinite(ktv)) {
      ktvResultElem.textContent = "";
      ktvInterpretElem.textContent = "";
      return;
    }

    const ktvRounded = Math.round(ktv * 100) / 100;

    ktvResultElem.textContent = `Kt/V ≈ ${ktvRounded.toFixed(2)}`;

    // 解釈とリスク色
    ktvInterpretElem.classList.remove("risk-low", "risk-mid", "risk-high");

    if (ktvRounded >= 1.4) {
      ktvInterpretElem.textContent =
        "目標以上の透析量が得られている可能性があります（単回セッションの目安）。";
      ktvInterpretElem.classList.add("risk-low");
    } else if (ktvRounded >= 1.2) {
      ktvInterpretElem.textContent =
        "概ね目標範囲内の透析量と考えられます（他の指標と合わせて評価してください）。";
      ktvInterpretElem.classList.add("risk-mid");
    } else {
      ktvInterpretElem.textContent =
        "透析量が不足している可能性があります。ダイアライザ条件や透析時間などの見直しを検討してください。";
      ktvInterpretElem.classList.add("risk-high");
    }
  }

  function updateUrrResult(urr) {
    if (!Number.isFinite(urr)) {
      urrResultElem.textContent = "";
      urrInterpretElem.textContent = "";
      return;
    }

    const urrRounded = Math.round(urr * 10) / 10;

    urrResultElem.textContent = `URR ≈ ${urrRounded.toFixed(1)} %`;

    urrInterpretElem.classList.remove("risk-low", "risk-mid", "risk-high");

    if (urrRounded >= 70) {
      urrInterpretElem.textContent =
        "URR 70%以上であり、透析量はおおむね目標と整合すると考えられます。";
      urrInterpretElem.classList.add("risk-low");
    } else if (urrRounded >= 60) {
      urrInterpretElem.textContent =
        "URR 60〜70% です。他のセッションでの傾向や Kt/V と合わせて評価してください。";
      urrInterpretElem.classList.add("risk-mid");
    } else {
      urrInterpretElem.textContent =
        "URR 60% 未満であり、透析量不足の可能性があります。条件設定の再検討を考慮してください。";
      urrInterpretElem.classList.add("risk-high");
    }
  }
});

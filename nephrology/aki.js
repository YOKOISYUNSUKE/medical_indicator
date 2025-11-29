// aki.js
// 急性腎障害 (AKI) スコア計算用スクリプト
// ※ module 不使用。score-utils.js を先に読み込む前提。

function judgeAkiStage(options) {
  var baselineCr = options.baselineCr;
  var currentCr = options.currentCr;
  var onRrt = options.onRrt;
  var urine = options.urine;

  var stage = 0;

  if (onRrt) stage = 3;

  if (baselineCr > 0 && currentCr > 0) {
    var ratio = currentCr / baselineCr;
    var delta = currentCr - baselineCr;

    if (ratio >= 3 || currentCr >= 4.0) stage = Math.max(stage, 3);
    else if (ratio >= 2.0) stage = Math.max(stage, 2);
    else if (ratio >= 1.5 || delta >= 0.3) stage = Math.max(stage, 1);
  }

  if (urine && urine.mlPerKgPerHour != null) {
    var u = urine.mlPerKgPerHour;
    var h = urine.hours;

    if (h >= 24 && u < 0.3) stage = Math.max(stage, 3);
    else if (h >= 12 && u < 0.5) stage = Math.max(stage, 2);
    else if (h >= 6 && u < 0.5) stage = Math.max(stage, 1);
  }

  return stage;
}

function getAkiTexts(stage) {
  switch (stage) {
    case 0:
      return {
        title: "Stage 0（AKI 基準を満たさない可能性）",
        interpret: "KDIGO 基準を満たさない可能性があります。臨床評価と併せて判断してください。",
      };
    case 1:
      return {
        title: "KDIGO AKI Stage 1",
        interpret: "軽度〜中等度の AKI に一致します。尿量や薬剤影響も要評価です。",
      };
    case 2:
      return {
        title: "KDIGO AKI Stage 2",
        interpret: "中等度の AKI に一致します。水分バランスと電解質管理が重要です。",
      };
    case 3:
      return {
        title: "KDIGO AKI Stage 3",
        interpret: "重度の AKI で、RRT の適応を含む段階です。",
      };
    default:
      return {
        title: "判定不能",
        interpret: "入力値の不整合があるため判定できません。",
      };
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var baselineCrInput = document.getElementById("aki-baseline-cr");
  var currentCrInput = document.getElementById("aki-current-cr");
  var rrtCheckbox = document.getElementById("aki-rrt");

  var weightInput = document.getElementById("aki-weight-kg");
  var urineVolumeInput = document.getElementById("aki-urine-volume");
  var urineHoursInput = document.getElementById("aki-urine-hours");

  var calcBtn = document.getElementById("calc-aki-btn");
  var resultElem = document.getElementById("aki-stage-result");
  var interpretElem = document.getElementById("aki-stage-interpret");
  var detailElem = document.getElementById("aki-stage-detail");

  if (!calcBtn) return;

  calcBtn.addEventListener("click", function () {
    [baselineCrInput, currentCrInput, weightInput, urineVolumeInput, urineHoursInput].forEach(
      function (input) {
        if (input && typeof clearFieldError === "function") {
          clearFieldError(input);
        }
      }
    );

    var baselineRes = parseNumericInput(baselineCrInput, { min: 0.1, max: 20 });
    var currentRes = parseNumericInput(currentCrInput, { min: 0.1, max: 20 });

    if (baselineRes.error || currentRes.error) {
      resultElem.textContent = "";
      interpretElem.textContent = "";
      detailElem.textContent = "";
      return;
    }

    var baselineCr = baselineRes.value;
    var currentCr = currentRes.value;

    var urineInfo = null;
    var anyUrine =
      (weightInput && weightInput.value.trim() !== "") ||
      (urineVolumeInput && urineVolumeInput.value.trim() !== "") ||
      (urineHoursInput && urineHoursInput.value.trim() !== "");

    if (anyUrine) {
      var weightRes = parseNumericInput(weightInput, { min: 1, max: 300 });
      var volRes = parseNumericInput(urineVolumeInput, { min: 0, max: 100000 });
      var hoursRes = parseNumericInput(urineHoursInput, { min: 1, max: 72 });

      if (weightRes.error || volRes.error || hoursRes.error) {
        resultElem.textContent = "";
        interpretElem.textContent = "";
        detailElem.textContent = "";
        return;
      }

      var ml = volRes.value / weightRes.value / hoursRes.value;
      urineInfo = { mlPerKgPerHour: ml, hours: hoursRes.value };
    }

    var onRrt = rrtCheckbox && rrtCheckbox.checked;

    var stage = judgeAkiStage({
      baselineCr: baselineCr,
      currentCr: currentCr,
      onRrt: onRrt,
      urine: urineInfo,
    });

    var ratio = currentCr / baselineCr;
    var delta = currentCr - baselineCr;

    var texts = getAkiTexts(stage);

    resultElem.textContent = texts.title;
    interpretElem.textContent = texts.interpret;

    var detail =
      "Cr比: " +
      ratio.toFixed(2) +
      "倍, ΔCr: " +
      (delta >= 0 ? "+" : "") +
      delta.toFixed(2) +
      " mg/dL";

    if (urineInfo) {
      detail +=
        " / 尿量: " +
        urineInfo.mlPerKgPerHour.toFixed(2) +
        " mL/kg/h (" +
        urineInfo.hours +
        " 時間)";
    }

    if (onRrt) detail += " / RRT: 施行中";

    detailElem.textContent = detail;
  });
});

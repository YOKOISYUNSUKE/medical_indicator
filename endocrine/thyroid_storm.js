// thyroid_storm.js
// Burch–Wartofsky Point Scale（BWPS）

document.addEventListener("DOMContentLoaded", () => {
  const tempInput = document.getElementById("bwps-temp");
  const hrInput = document.getElementById("bwps-hr");
  const calcButton = document.getElementById("bwps-calc-button");
  const scoreElem = document.getElementById("bwps-score");
  const interpretElem = document.getElementById("bwps-interpret");

  if (!calcButton) return;

  function getSelectedRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? Number(el.value) : 0;
  }

  function calcTempPoints(tempC) {
    // 参考：BWPS の温度カテゴリー（℃版）
    if (tempC < 37.2) return 0;
    if (tempC < 37.8) return 5;
    if (tempC < 38.3) return 10;
    if (tempC < 38.9) return 15;
    if (tempC < 39.4) return 20;
    if (tempC < 40.0) return 25;
    return 30; // 40.0 以上
  }

  function calcHrPoints(hr) {
    if (hr < 90) return 0;
    if (hr < 110) return 5;
    if (hr < 120) return 10;
    if (hr < 130) return 15;
    if (hr < 140) return 20;
    return 25; // 140 以上
  }

  function interpretBwps(total) {
    if (total >= 45) {
      return "45点以上：甲状腺クリーシスを強く示唆します。緊急対応の要否を臨床的に評価してください。";
    } else if (total >= 25) {
      return "25–44点：甲状腺クリーシス切迫が疑われます。病状の推移と他所見をあわせて判断してください。";
    } else {
      return "25点未満：典型的な甲状腺クリーシスのスコア基準は満たしませんが、臨床像により慎重な観察が必要な場合があります。";
    }
  }

  calcButton.addEventListener("click", (e) => {
    e.preventDefault();

    // 体温
    const tempParsed = parseNumericInput(tempInput, {
      min: 30,
      max: 45,
    });
    if (tempParsed.error) return;

    // 心拍数
    const hrParsed = parseNumericInput(hrInput, RANGE_PRESETS.HR);
    if (hrParsed.error) return;

    const tempPoints = calcTempPoints(tempParsed.value);
    const hrPoints = calcHrPoints(hrParsed.value);
    const cnsPoints = getSelectedRadioValue("bwps-cns");
    const giPoints = getSelectedRadioValue("bwps-gi");
    const chfPoints = getSelectedRadioValue("bwps-chf");
    const afPoints = getSelectedRadioValue("bwps-af");
    const precipPoints = getSelectedRadioValue("bwps-precipitant");

    const total =
      tempPoints +
      hrPoints +
      cnsPoints +
      giPoints +
      chfPoints +
      afPoints +
      precipPoints;

    scoreElem.textContent = `合計スコア: ${total} 点`;
    interpretElem.textContent = interpretBwps(total);
  });
});

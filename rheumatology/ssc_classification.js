// js/ssc_classification.js

function setSScClassificationResult(score, categoryText, message) {
  const v = document.getElementById("ssc_score_value");
  const c = document.getElementById("ssc_score_category");
  const m = document.getElementById("ssc_score_message");

  if (v) {
    if (score === null || score === undefined) {
      v.textContent = "--";
    } else {
      v.textContent = score.toFixed(1);
    }
  }
  if (c) c.textContent = categoryText || "";
  if (m && message) m.textContent = message;
}

function clearSScClassification() {
  const form = document.getElementById("ssc_classification_form");
  if (form) form.reset();
  setSScClassificationResult(
    null,
    "",
    "2013 ACR/EULAR 分類基準に基づき、9 点以上で SSc と分類されます。"
  );
}

function calculateSScClassification() {
  // 十分条件チェック
  const proximal = parseBooleanInput(
    document.getElementById("skin_proximal_mcp")
  );

  if (proximal === 1) {
    // 十分条件を満たす場合は 9 点以上かつ SSc と分類
    setSScClassificationResult(
      9,
      "SSc と分類（十分条件を満たす）",
      "両手指の皮膚硬化が MCP 関節より近位に及ぶため、2013 ACR/EULAR 分類基準では SSc と分類されます。"
    );
    return;
  }

  // ポイント加算
  let total = 0;

  // 指の皮膚硬化（高い方のみカウント）
  const skinRadio = document.querySelector(
    'input[name="skin_fingers"]:checked'
  );
  if (skinRadio) {
    total += Number(skinRadio.value) || 0;
  }

  // 指先病変（高い方のみカウント）
  const fingertipRadio = document.querySelector(
    'input[name="fingertip_lesions"]:checked'
  );
  if (fingertipRadio) {
    total += Number(fingertipRadio.value) || 0;
  }

  // telangiectasia / nailfold
  const telang = parseBooleanInput(
    document.getElementById("telangiectasia")
  );
  total += telang * 2;

  const nailfold = parseBooleanInput(
    document.getElementById("nailfold_abnormal")
  );
  total += nailfold * 2;

  // PAH / ILD（いずれか一方または両方で 2点）
  const pah = parseBooleanInput(document.getElementById("pah"));
  const ild = parseBooleanInput(document.getElementById("ild"));
  if (pah === 1 || ild === 1) {
    total += 2;
  }

  // Raynaud
  const raynaud = parseBooleanInput(document.getElementById("raynaud"));
  total += raynaud * 3;

  // 自己抗体
  const ab = parseBooleanInput(
    document.getElementById("ssc_autoantibodies")
  );
  total += ab * 3;

  let category = "";
  let msg = "";

  if (total >= 9) {
    category = "SSc と分類";
    msg =
      "合計スコアが 9 点以上のため、2013 ACR/EULAR 分類基準では SSc と分類されます。";
  } else {
    category = "SSc 分類基準未満";
    msg =
      "合計スコアが 9 点未満のため、分類基準上は SSc とは分類されません（または境界症例）と解釈されます。";
  }

  setSScClassificationResult(total, category, msg);
}

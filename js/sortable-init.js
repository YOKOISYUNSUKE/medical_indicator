// js/sortable-init.js

// 直近で「実際に並び順を変えた」カードを覚えておく
// （並べ替え直後の誤タップ遷移を 1 回だけ防ぐ）
let lastDraggedItem = null;

// 並び替えモードのオン/オフ状態（false: 通常モード, true: 並び替えモード）
let isReorderMode = false;


document.addEventListener("DOMContentLoaded", () => {
  // SortableJS が読み込まれていなければ何もしない
  if (typeof Sortable === "undefined") {
    console.warn("SortableJS is not loaded.");
    return;
  }

  // 並べ替えインスタンスを保持（モード切替用）
  const sortableInstances = [];

  // 並び替えモードの適用関数
  function applyReorderMode(enabled) {
    isReorderMode = enabled;

    // 並び替えモード ON のときだけドラッグを有効化
    sortableInstances.forEach((instance) => {
      instance.option("disabled", !enabled);
    });

    // 必要なら全体にクラスを付けてスタイル切り替え
    document.documentElement.classList.toggle("reorder-mode-active", enabled);
  }

  // 並べ替え対象のコンテナを全て取得
  const containers = document.querySelectorAll("[data-sortable-id]");


  containers.forEach((container) => {
    const sortableId = container.getAttribute("data-sortable-id");
    if (!sortableId) return;

    // ページパスと組み合わせてキーを作る（ページごとに別々の順番を保存）
    const storageKey = `medcalc-order:${location.pathname}#${sortableId}`;

    // SortableJS を初期化
    const sortable = new Sortable(container, {
      animation: 150,
      dataIdAttr: "data-id",
      draggable: ".dept-card, .score-card",
      handle: ".dept-card, .score-card",
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",

      // 並べ替え開始時はいったんフラグをクリア
      onStart() {
        lastDraggedItem = null;
      },


      // 並べ替え開始時はいったんフラグをクリア
      onStart() {
        lastDraggedItem = null;
      },

      // 並べ替え終了時に「実際に位置が変わったカード」だけ記録
      onEnd(evt) {
        if (
          typeof evt.oldIndex === "number" &&
          typeof evt.newIndex === "number" &&
          evt.oldIndex !== evt.newIndex
        ) {
          lastDraggedItem = evt.item;
        } else {
          lastDraggedItem = null;
        }
      },

      // 並び順の保存
      store: {
        get() {

          try {
            const order = localStorage.getItem(storageKey);
            if (!order) return [];
            return order.split("|").filter(Boolean);
          } catch (e) {
            console.warn("Failed to get sort order:", e);
            return [];
          }
        },
        set(sortable) {
          try {
            const order = sortable.toArray(); // data-id の配列
            localStorage.setItem(storageKey, order.join("|"));
          } catch (e) {
          console.warn("Failed to save sort order:", e);
          }
        },
      },
    });

    // 並び替えモード切替用にインスタンスを保持
    sortableInstances.push(sortable);
  });

   // 初期状態：並び替えモード OFF（ドラッグ無効）
   applyReorderMode(false);
 
   // 並び替えモード ラジオボタンを初期化
   const reorderToggle = document.querySelector("[data-reorder-toggle]");
   if (reorderToggle) {
     const radios = reorderToggle.querySelectorAll(
       'input[type="radio"][name="reorder-mode"]'
     );
 
     const applyModeFromDom = () => {
       let enabled = false;
       radios.forEach((radio) => {
         if (radio.checked && radio.value === "on") {
           enabled = true;
         }
       });
       applyReorderMode(enabled);
     };
 
     // 初期表示（HTML 側の checked を反映）
     applyModeFromDom();
 
     radios.forEach((radio) => {
       radio.addEventListener("change", () => {
         applyModeFromDom();
       });
     });
   }


  // --- ここから：並べ替え直後 1 回だけクリックをキャンセルする処理 ---
  document.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest(".dept-card, .score-card");

      // 並び替えモード中は、カードのクリックによる遷移を常に止める
      if (card && isReorderMode) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      // 直近で「位置が変わる並べ替え」に使われたカードがなければ何もしない
      if (!lastDraggedItem) return;

      // どのカードもクリックされていなければ、フラグだけ消して終了
      if (!card) {
        lastDraggedItem = null;
        return;
      }

      // 「直前に並べ替えで移動したカード」に対する最初のクリックならキャンセル
      if (card === lastDraggedItem) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      // 1 回処理したら必ずフラグを消す
      lastDraggedItem = null;
    },
    true // キャプチャフェーズで実行 -> main.js や inline onclick より先に動く
  );
});


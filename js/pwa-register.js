// js/pwa-register.js

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    // ルート絶対パスを使うことで、ページの位置による相対パス問題を避ける
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("ServiceWorker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
  }
});
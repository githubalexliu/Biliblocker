(() => {
  const STYLE_ID = "biliblocker-content-style";

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .biliblocker-highlight-outline *:hover {
        outline: 2px dashed #ff4d4f !important;
        outline-offset: 2px !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function removeStyle() {
    const style = document.getElementById(STYLE_ID);
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  function setEnabled(enabled) {
    if (enabled) {
      ensureStyle();
      document.documentElement.classList.add("biliblocker-highlight-outline");
    } else {
      document.documentElement.classList.remove("biliblocker-highlight-outline");
      removeStyle();
    }
  }

  // Respond to messages from popup/background
  browser.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "TOGGLE_OUTLINE") return;
    setEnabled(Boolean(msg.enabled));
  });
})();




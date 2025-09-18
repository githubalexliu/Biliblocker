(() => {
  // Hide <img> elements and elements with CSS background images as a fallback
  const STYLE_ID = "biliblocker-hide-images";

  function injectCssOnce() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .feed2 { display: none !important; }
    `;
    document.documentElement.appendChild(style);
  }

  function removeSrcFromExistingImages() {
    const images = document.querySelectorAll("img[src], source[srcset]");
    images.forEach((el) => {
      if (el.tagName.toLowerCase() === "img") {
        el.removeAttribute("src");
        el.removeAttribute("srcset");
      } else {
        el.removeAttribute("srcset");
      }
    });
  }

  function observeMutations() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes") {
          const target = m.target;
          if (target.tagName && target.tagName.toLowerCase() === "img") {
            target.removeAttribute("src");
            target.removeAttribute("srcset");
          }
          continue;
        }
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.tagName.toLowerCase() === "img") {
            node.removeAttribute("src");
            node.removeAttribute("srcset");
          }
          node.querySelectorAll("img, source").forEach((el) => {
            el.removeAttribute("src");
            el.removeAttribute("srcset");
          });
        });
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "style"],
    });
  }

  function init() {
    injectCssOnce();
    removeSrcFromExistingImages();
    observeMutations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();




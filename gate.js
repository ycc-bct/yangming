/* Password gate for the preview site. Loaded synchronously in <head> so the page never flashes.
   Unlock lasts for the current browser tab (sessionStorage); a new visit asks again.
   Note: this is a viewing lock for a static site, not real security — the files are public on GitHub. */
(function () {
  var HASH = "d75f4c676cb14c557b5337f513e90c428e285a84340fbea4a4acc41b75358c6e"; // SHA-256 of the password
  var KEY = "ym-gate";
  try { if (sessionStorage.getItem(KEY) === HASH) return; } catch (e) {}

  var css = document.createElement("style");
  css.id = "ym-gate-css";
  css.textContent =
    "body>*:not(#ym-gate){visibility:hidden!important}" +
    "#ym-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#101010;color:#f1f1f1;" +
    "font:15px/1.6 Inter,'Noto Sans TC',sans-serif}" +
    "#ym-gate form{width:min(340px,calc(100vw - 32px));display:flex;flex-direction:column;gap:14px;padding:28px;" +
    "background:#18181b;border:1px solid #3f3f46;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.45)}" +
    "#ym-gate h1{margin:0;font-size:18px;font-weight:600}#ym-gate p{margin:0;color:#a1a1aa;font-size:13px}" +
    "#ym-gate input{font:inherit;color:inherit;background:#101010;border:1px solid #3f3f46;border-radius:6px;padding:10px 12px;outline:none}" +
    "#ym-gate input:focus{border-color:#004ea2}" +
    "#ym-gate button{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:6px;padding:10px;background:#004ea2;color:#f1f1f1}" +
    "#ym-gate .err{color:#f87171;font-size:13px;min-height:1.2em}";
  document.head.appendChild(css);

  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  function mount() {
    var gate = document.createElement("div");
    gate.id = "ym-gate";
    gate.innerHTML =
      '<form autocomplete="off"><h1>航運風險戰情室</h1><p>此預覽需要密碼才能檢視。</p>' +
      '<input type="password" aria-label="密碼" placeholder="請輸入密碼" required>' +
      '<button type="submit">進入</button><div class="err" role="alert"></div></form>';
    document.body.appendChild(gate);
    var input = gate.querySelector("input");
    var err = gate.querySelector(".err");
    input.focus();
    gate.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value.trim()).then(function (h) {
        if (h !== HASH) { err.textContent = "密碼不正確，請再試一次。"; input.select(); return; }
        try { sessionStorage.setItem(KEY, HASH); } catch (x) {}
        gate.remove();
        css.remove();
        window.dispatchEvent(new Event("resize")); // let canvases re-measure now that the page is visible
      });
    });
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

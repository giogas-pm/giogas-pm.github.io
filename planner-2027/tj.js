/* tj.js v1 — cliente único da fábrica (track, checkout, desbloqueio, share, toast, estado local).
   Uso: <script src="tj.js"></script> + TJ.init({app:'meu-app', produto:'padrao'}).
   O tj-track v1 (no <head>) intercepta os POSTs em /rest/v1/tj_eventos (filtra QA/robô, põe sid/ref/src). */
(function (w) {
  var SB = "https://diemqzngskmcuytkzjhr.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZW1xem5nc2ttY3V5dGt6amhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDM0MDEsImV4cCI6MjA5ODQxOTQwMX0.w5-w8bU6qFQqIFBDOiNsUvOWbXqeOZSH6tveyLdADx0";
  var HDR = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
  var T = { app: null, produto: "padrao", slug: null, unlocked: false };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (_) { return null; } }
  T.init = function (o) {
    T.app = o.app; T.produto = o.produto || "padrao";
    var m = /[#&]p=([a-z0-9]{12,24})/.exec(location.hash);
    T.slug = m ? m[1] : null;
    if (T.slug && ls("tj_ok_" + T.slug) === "1") T.unlocked = true;
    return T;
  };
  T.novoSlug = function () {
    var a = new Uint8Array(10), s = ""; (w.crypto || w.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += (a[i] % 36).toString(36);
    T.slug = (T.isQA() ? "qa" : "") + s + Date.now().toString(36).slice(-4);
    try { history.replaceState(null, "", location.pathname + location.search + "#p=" + T.slug); } catch (_) {}
    return T.slug;
  };
  T.garanteSlug = function () { return T.slug || T.novoSlug(); };
  T.isQA = function () { return ls("tj_team") === "1" || /[?&]qa=1/.test(location.search) || !!navigator.webdriver; };
  T.track = function (evento, meta) {
    try { fetch(SB + "/rest/v1/tj_eventos", { method: "POST", headers: HDR, body: JSON.stringify({ app: T.app, evento: evento, slug: T.slug || null, meta: meta || null }) }).catch(function () {}); } catch (_) {}
  };
  T.seoLand = function () { T.track("seo_land", { p: location.pathname.split("/").filter(Boolean).pop() || "" }); };
  /* estado do usuário fica SÓ no aparelho, preso ao slug */
  T.salvar = function (obj) { if (T.slug) ls("tj_d_" + T.app + "_" + T.slug, JSON.stringify(obj)); };
  T.carregar = function () { try { return T.slug ? JSON.parse(ls("tj_d_" + T.app + "_" + T.slug) || "null") : null; } catch (_) { return null; } };
  T.checkout = async function (produto) {
    T.garanteSlug();
    var r = await fetch(SB + "/functions/v1/tj-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: T.app, produto: produto || T.produto, slug: T.slug }) });
    var j = await r.json().catch(function () { return {}; });
    if (j && j.ja_pago) { T.marcaPago(); return j; }
    if (j && j.ok && j.init_point) { T.track("checkout_open"); T.ultimoInit = j.init_point; if (!w.TJ_NO_REDIRECT) location.href = j.init_point; }
    return j;
  };
  T.status = async function () {
    if (!T.slug) return false;
    try { var r = await fetch(SB + "/rest/v1/rpc/tj_status", { method: "POST", headers: HDR, body: JSON.stringify({ p_slug: T.slug }) }); return (await r.json()) === true; } catch (_) { return false; }
  };
  T.marcaPago = function () { T.unlocked = true; if (T.slug) ls("tj_ok_" + T.slug, "1"); };
  T.travar = async function (hash) {
    try { var r = await fetch(SB + "/rest/v1/rpc/tj_travar", { method: "POST", headers: HDR, body: JSON.stringify({ p_slug: T.slug, p_trava: hash }) }); return await r.json(); } catch (_) { return null; }
  };
  T.sha = async function (s) {
    var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("").slice(0, 40);
  };
  /* volta do Mercado Pago (?pago=ok|pendente|falhou#p=slug): faz polling do status e chama onPago() */
  T.retorno = async function (onPago) {
    var st = new URLSearchParams(location.search).get("pago");
    if (!st || !T.slug) { if (T.slug && !T.unlocked && await T.status()) { T.marcaPago(); onPago && onPago(); } return; }
    var limpa = function () { try { history.replaceState(null, "", location.pathname + "#p=" + T.slug); } catch (_) {} };
    if (st === "falhou") { T.toast("O pagamento não foi concluído. Pode tentar de novo 💛"); limpa(); return; }
    T.toast(st === "pendente" ? "Pagamento em processamento: libera sozinho quando o Mercado Pago confirmar (Pix em instantes). Volte por este mesmo navegador 💛" : "Confirmando o pagamento...");
    for (var i = 0; i < (st === "pendente" ? 48 : 16); i++) {
      if (await T.status()) { T.marcaPago(); limpa(); T.toast("Liberado! 🎉"); onPago && onPago(); return; }
      await new Promise(function (r) { setTimeout(r, 2500); });
    }
    T.toast("Ainda processando — atualize a página em 1 minuto 💛");
  };
  T.share = async function (texto, url) {
    url = url || location.origin + location.pathname;
    T.track("share");
    if (navigator.share) { try { await navigator.share({ text: texto, url: url }); return; } catch (_) { return; } }
    w.open("https://wa.me/?text=" + encodeURIComponent(texto + " " + url), "_blank");
  };
  var tt;
  T.toast = function (msg) {
    var el = document.getElementById("tjToast");
    if (!el) { el = document.createElement("div"); el.id = "tjToast"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); el.className = "tj-toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 4200);
  };
  w.TJ = T;
})(window);

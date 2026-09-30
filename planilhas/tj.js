/* tj.js v2 — cliente único da fábrica (track, checkout, desbloqueio, share, toast, estado local).
   Uso: <script src="tj.js"></script> + TJ.init({app:'meu-app', produto:'padrao'}).
   v2: atribuição (gclid, gbraid, wbraid, utm_ source/medium/campaign/term/content, src, ref, last-click não-direto, 30 dias) vai no checkout;
   compra guardada no aparelho antes do Mercado Pago → aviso "Você tem uma compra" em qualquer página do app;
   link "Recuperar compra" (nº da operação do MP) no rodapé.
   O tj-track v1 (no <head>) intercepta os POSTs em /rest/v1/tj_eventos (filtra QA/robô, põe sid/ref/src). */
(function (w) {
  var SB = "https://diemqzngskmcuytkzjhr.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZW1xem5nc2ttY3V5dGt6amhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NDM0MDEsImV4cCI6MjA5ODQxOTQwMX0.w5-w8bU6qFQqIFBDOiNsUvOWbXqeOZSH6tveyLdADx0";
  var HDR = { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" };
  var T = { app: null, produto: "padrao", slug: null, unlocked: false };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (_) { return null; } }
  /* atribuição: captura na chegada; só sobrescreve com outra origem NÃO direta (last-click não-direto) */
  var ATK = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "src"];
  (function () {
    try {
      var q = new URLSearchParams(location.search), a = {}, tem = false;
      ATK.forEach(function (k) { var v = q.get(k); if (v) { a[k] = v.slice(0, 200); tem = true; } });
      if (!tem) { var r = ""; try { r = new URL(document.referrer).hostname; } catch (_) {}
        if (r && r !== location.hostname && !/mercadopago|mercadolivre|mercadolibre|mpago\./.test(r)) { a.ref = r; tem = true; } }
      if (tem) { a.ts = Date.now(); ls("tj_atr", JSON.stringify(a)); }
    } catch (_) {}
  })();
  T.atribuicao = function () { try { var a = JSON.parse(ls("tj_atr") || "null"); if (a && Date.now() - a.ts < 30 * 864e5) return a; } catch (_) {} return null; };
  /* compras feitas neste aparelho (só app, slug e endereço de volta) — nunca somem se a aba fechar no MP */
  T.compras = function () { try { return (JSON.parse(ls("tj_compras") || "[]") || []).filter(function (c) { return c && c.s && c.v && Date.now() - c.t < 365 * 864e5; }); } catch (_) { return []; } };
  T.lembraCompra = function (app, slug, volta) {
    var l = T.compras().filter(function (c) { return c.s !== slug; });
    l.unshift({ a: app, s: slug, v: volta, t: Date.now() }); ls("tj_compras", JSON.stringify(l.slice(0, 12)));
  };
  T.recuperar = async function (op, sim) {
    var b = { op: String(op || "") }; if (sim) b.sim = sim;
    var r = await fetch(SB + "/functions/v1/tj-recuperar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    var j = await r.json().catch(function () { return { ok: false, motivo: "rede" }; });
    if (j && j.ok && j.slug) { ls("tj_ok_" + j.slug, "1"); T.lembraCompra(j.app, j.slug, j.volta); }
    return j;
  };
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
    var r = await fetch(SB + "/functions/v1/tj-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app: T.app, produto: produto || T.produto, slug: T.slug, atribuicao: T.atribuicao() }) });
    var j = await r.json().catch(function () { return {}; });
    if (j && j.ja_pago) { T.marcaPago(); return j; }
    if (j && j.ok && j.init_point) { T.lembraCompra(T.app, T.slug, j.volta || (location.origin + location.pathname + "#p=" + T.slug)); T.track("checkout_open"); T.ultimoInit = j.init_point; if (!w.TJ_NO_REDIRECT) location.href = j.init_point; }
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
  /* aviso de compra + link de recuperação no rodapé (roda sozinho em toda página que carrega o tj.js) */
  T.appDaPagina = function () { return T.app || location.pathname.split("/").filter(Boolean)[0] || ""; };
  T.urlRecuperar = function () { var a = T.appDaPagina(); return location.origin + (a === "planilhas" ? "/planilhas/recuperar/" : "/recuperar/" + (a ? "?app=" + encodeURIComponent(a) : "")); };
  T.avisoCompra = async function () {
    var app = T.appDaPagina(); if (!app || /\/recuperar\//.test(location.pathname)) return;
    try { if (sessionStorage.getItem("tj_aviso_x")) return; } catch (_) {}
    var l = T.compras().filter(function (c) { return c.a === app && c.s !== T.slug; }), pagas = [], checks = 0;
    for (var i = 0; i < l.length; i++) {
      var c = l[i];
      if (ls("tj_ok_" + c.s) === "1") { pagas.push(c); continue; }
      if (Date.now() - c.t > 7 * 864e5 || checks >= 3) continue;
      checks++;
      try { var r = await fetch(SB + "/rest/v1/rpc/tj_status", { method: "POST", headers: HDR, body: JSON.stringify({ p_slug: c.s }) });
        if ((await r.json()) === true) { ls("tj_ok_" + c.s, "1"); pagas.push(c); } } catch (_) {}
    }
    if (!pagas.length || document.getElementById("tjCompra")) return;
    var d = document.createElement("div"); d.id = "tjCompra"; d.setAttribute("role", "status");
    d.style.cssText = "position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:9999;background:#1f6f5c;color:#fff;border-radius:12px;padding:10px 12px 10px 16px;box-shadow:0 8px 24px rgba(0,0,0,.2);font:600 15px/1.3 system-ui,sans-serif;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 32px)";
    var t = document.createElement("span"); t.textContent = pagas.length > 1 ? "Você tem " + pagas.length + " compras aqui" : "Você tem uma compra aqui";
    var a = document.createElement("a"); a.href = pagas[0].v; a.textContent = app === "planilhas" ? "Baixar" : "Abrir";
    a.style.cssText = "background:#fff;color:#1f6f5c;border-radius:8px;padding:6px 12px;text-decoration:none;white-space:nowrap";
    a.addEventListener("click", function () { if (pagas[0].v.split("#")[0] === location.href.split("#")[0]) setTimeout(function () { location.reload(); }, 50); });
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Fechar aviso"); x.textContent = "×";
    x.style.cssText = "background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 4px";
    x.addEventListener("click", function () { d.remove(); try { sessionStorage.setItem("tj_aviso_x", "1"); } catch (_) {} });
    d.appendChild(t); d.appendChild(a); d.appendChild(x); document.body.appendChild(d);
  };
  T.linkRecuperar = function () {
    if (document.querySelector('a[href*="/recuperar/"]')) return;
    var f = document.querySelector("footer p:last-of-type") || document.querySelector("footer") || document.querySelector(".foot");
    if (!f) return;
    var a = document.createElement("a"); a.href = T.urlRecuperar(); a.textContent = "Já comprou? Recuperar compra";
    f.appendChild(document.createTextNode(" · ")); f.appendChild(a);
  };
  function auto() { setTimeout(function () { try { T.linkRecuperar(); } catch (_) {} T.avisoCompra().catch(function () {}); }, 400); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
  w.TJ = T;
})(window);

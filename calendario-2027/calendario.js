/* Calendário 2027 — motor M2. Fotos ficam no IndexedDB do aparelho (sobrevivem à ida ao Mercado Pago). */
(function () {
  var A = 2027, $ = function (id) { return document.getElementById(id); }, esc = CAL.esc;
  var CORES = ["#1d5fa8", "#b3261e", "#2f7d6d", "#7a2e8e", "#c2410c", "#334155", "#be185d"];
  var S = { tit: "Família Souza 2027", mod: "mensal", cor: "#1d5fa8", datas: "", seg: 0, com: true }, FOTOS = [], pwSeen = false;
  /* IndexedDB mínimo */
  function idb(fn) { return new Promise(function (ok) { try { var r = indexedDB.open("cal27", 1); r.onupgradeneeded = function () { r.result.createObjectStore("f"); }; r.onsuccess = function () { fn(r.result.transaction("f", "readwrite").objectStore("f"), ok); }; r.onerror = function () { ok(null); }; } catch (_) { ok(null); } }); }
  function fotosSalvar() { if (!TJ.slug) return; var k = TJ.slug; return idb(function (st, ok) { st.put(FOTOS, k).onsuccess = function () { ok(1); }; }); }
  function fotosCarregar() { if (!TJ.slug) return Promise.resolve(); var k = TJ.slug; return idb(function (st, ok) { var q = st.get(k); q.onsuccess = function () { FOTOS = q.result || []; ok(1); }; q.onerror = function () { ok(0); }; }); }
  function reduz(file) { return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var m = 1400, s = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", 0.8)); }; im.onerror = function () { ok(null); }; im.src = fr.result; }; fr.readAsDataURL(file); }); }
  function segs() {
    document.querySelectorAll("[data-mod]").forEach(function (b) { b.classList.toggle("on", b.dataset.mod === S.mod); });
    document.querySelectorAll("[data-seg]").forEach(function (b) { b.classList.toggle("on", +b.dataset.seg === +S.seg); });
    document.querySelectorAll("#cores button").forEach(function (b) { b.classList.toggle("on", b.dataset.c === S.cor); });
    $("thumbs").innerHTML = FOTOS.map(function (f) { return '<img alt="" src="' + f + '">'; }).join("");
  }
  function ler() { S.tit = ($("fTit").value.trim() || "Calendário 2027").slice(0, 40); S.datas = $("fDatas").value.slice(0, 2000); S.com = $("fCom").checked; }
  function foto(i, cls) { var f = FOTOS.length ? FOTOS[i % FOTOS.length] : null; return '<div class="foto' + (f ? "" : " sem") + (cls || "") + '"' + (f ? ' style="background-image:url(' + f + ')"' : "") + ">" + (f ? "" : "<span>" + ["❄️", "🎭", "🍂", "🐣", "🌷", "🎉", "🧣", "☀️", "🌻", "🎈", "🍁", "🎄"][i] + "</span>") + "</div>"; }
  function wm(m) { return m ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span><span>PRÉVIA</span></div>' : ""; }
  function folhaMes(m, fer, pes, marca) {
    return '<div class="folha" style="--k:' + S.cor + '">' + wm(marca) + foto(m) + '<div class="fh"><h3>' + CAL.MESES[m] + '</h3><small>' + esc(S.tit) + "</small></div>" +
      CAL.mesHTML(A, m, { fer: fer, pes: pes, seg: +S.seg }) + '<div class="ff">' + CAL.listaMes(A, m, fer).map(esc).join(" · ") + "</div></div>";
  }
  function folhaAnual(fer, pes, marca) {
    var h = '<div class="folha anual" style="--k:' + S.cor + '">' + wm(marca) + '<div class="ah">' + foto(0) + "<div><h3>" + esc(S.tit) + "</h3><p>Calendário " + A + " · feriados nacionais</p></div></div><div class=\"am\">";
    for (var m = 0; m < 12; m++) h += "<div><h4>" + CAL.MESES[m] + "</h4>" + CAL.mesHTML(A, m, { fer: fer, pes: pes, seg: +S.seg, mini: true }) + "</div>";
    var l = []; for (m = 0; m < 12; m++) CAL.listaMes(A, m, fer).forEach(function (x) { if (!/Mães|Pais|Namorados|Páscoa|Véspera/.test(x)) l.push(x.slice(0, 2) + "/" + ("0" + (m + 1)).slice(-2) + x.slice(2)); });
    return h + '</div><div class="ff2">' + l.map(esc).join(" · ") + "</div></div>";
  }
  function folhas(marca, todas) {
    var fer = CAL.feriados(A, S.com), pes = CAL.pessoais(S.datas);
    if (S.mod === "anual") return folhaAnual(fer, pes, marca);
    var h = "", ate = todas ? 12 : 2; for (var m = 0; m < ate; m++) h += folhaMes(m, fer, pes, marca); return h;
  }
  function render() {
    var pago = TJ.unlocked; document.body.classList.toggle("unlocked", pago);
    $("prev").innerHTML = folhas(!pago, pago);
    $("prevInfo").textContent = S.mod === "anual" ? "Calendário anual em 1 folha A4" : (pago ? "Os 12 meses" : "Janeiro e fevereiro na prévia · o PDF tem os 12 meses") + " · A4 em pé";
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  async function gerarClick() { ler(); TJ.garanteSlug(); TJ.salvar(S); await fotosSalvar(); render(); TJ.track("gerou", { m: S.mod, f: FOTOS.length }); $("res").scrollIntoView({ behavior: "smooth", block: "start" }); }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); TJ.salvar(S); $("printArea").innerHTML = folhas(false, true); TJ.track("imprimiu", { m: S.mod, f: FOTOS.length });
    setTimeout(function () { window.print(); }, 400);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S); await fotosSalvar();
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "📅 Liberar para imprimir — R$14,90"; }, 2500);
  }
  async function init() {
    var fer = CAL.feriados(A, false), l = [];
    for (var m = 0; m < 12; m++) for (var d = 1; d <= 31; d++) { var f = fer[m + "-" + d]; if (f && f.t === "F") l.push("<li><b>" + ("0" + d).slice(-2) + "/" + ("0" + (m + 1)).slice(-2) + "</b> (" + ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][new Date(A, m, d).getDay()] + ") — " + f.nome + "</li>"); }
    $("listaFer").innerHTML = l.join("");
    $("cores").innerHTML = CORES.map(function (c) { return '<button type="button" aria-label="cor ' + c + '" data-c="' + c + '" style="background:' + c + '"></button>'; }).join("");
    var d0 = TJ.carregar(); if (d0) { S = Object.assign(S, d0); await fotosCarregar(); }
    $("fTit").value = S.tit; $("fDatas").value = S.datas; $("fCom").checked = S.com; segs();
    var re = function () { segs(); if (!$("res").hidden) { ler(); render(); } };
    document.querySelectorAll("[data-mod]").forEach(function (b) { b.onclick = function () { S.mod = b.dataset.mod; re(); }; });
    document.querySelectorAll("[data-seg]").forEach(function (b) { b.onclick = function () { S.seg = +b.dataset.seg; re(); }; });
    document.querySelectorAll("#cores button").forEach(function (b) { b.onclick = function () { S.cor = b.dataset.c; re(); }; });
    $("fFotos").onchange = async function () {
      var fs = Array.prototype.slice.call(this.files || [], 0, 12); if (!fs.length) return; TJ.toast("Preparando as fotos…");
      FOTOS = (await Promise.all(fs.map(reduz))).filter(Boolean); TJ.garanteSlug(); await fotosSalvar(); segs(); TJ.track("foto", { n: FOTOS.length }); if (!$("res").hidden) render();
    };
    $("btnGerar").onclick = gerarClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    $("btnShare").onclick = function () { TJ.share("Achei um calendário 2027 com as fotos da família e os aniversários de todo mundo 📅"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d0) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fDatas").value = "14/03 Vó Lúcia\n02/07 Pedro"; gerarClick(); };
  init();
})();

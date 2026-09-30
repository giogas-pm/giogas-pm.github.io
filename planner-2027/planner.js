/* Planner 2027 — motor M2 multi-página (reusa cal27.js do Calendário). */
(function () {
  var A = 2027, $ = function (id) { return document.getElementById(id); }, esc = CAL.esc;
  var CORES = ["#2f7d6d", "#be185d", "#1d5fa8", "#7a2e8e", "#c2410c", "#334155", "#a16207"];
  var DS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  var S = { nome: "", frase: "Um passo de cada vez", cap: "flores", cor: "#2f7d6d", hab: true, fin: true, sem: true }, pwSeen = false;
  function wm(m) { return m ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span><span>PRÉVIA</span></div>' : ""; }
  function F(cls, inner, marca) { return '<div class="folha ' + (cls || "") + '" style="--k:' + S.cor + '">' + wm(marca) + inner + "</div>"; }
  function lns(n) { return new Array(n + 1).join('<div class="ln"></div>'); }
  function capa(m) { return F("capa " + S.cap, '<div class="cx"><p class="cp">Planner</p><p class="ca">' + A + '</p><p class="cn">' + esc(S.nome || "Seu nome") + '</p><p class="cf">' + esc(S.frase) + "</p></div>", m); }
  function ano(fer, m) {
    var h = '<p class="pt">' + A + '</p><p class="ps">o ano em uma página</p><div class="am">';
    for (var i = 0; i < 12; i++) h += "<div><h4>" + CAL.MESES[i] + "</h4>" + CAL.mesHTML(A, i, { fer: fer, mini: true }) + "</div>";
    return F("", h + '</div><div class="nt">Datas importantes' + lns(4) + "</div>", m);
  }
  function metas(m) {
    var ar = ["Saúde e corpo", "Dinheiro", "Trabalho e carreira", "Estudos", "Amor e família", "Amizades e lazer", "Casa", "Eu comigo"];
    return F("", '<p class="pt">Metas de ' + A + '</p><p class="ps">o que eu quero viver este ano</p><div class="metas">' + ar.map(function (a) { return "<div><b>" + a + "</b>" + lns(4) + "</div>"; }).join("") + "</div>", m);
  }
  function mes(i, fer, m) {
    var l = CAL.listaMes(A, i, fer);
    return F("", '<p class="pt">' + CAL.MESES[i] + '</p><p class="ps">' + A + (l.length ? " · " + esc(l.join(" · ")) : "") + "</p>" + CAL.mesHTML(A, i, { fer: fer }) + '<div class="nt">Foco do mês' + lns(3) + "</div>", m);
  }
  function habitos(i, m) {
    var h = '<p class="pt">Hábitos · ' + CAL.MESES[i] + '</p><p class="ps">pinte o quadradinho a cada dia cumprido</p><div class="hab"><span></span>';
    for (var d = 1; d <= 31; d++) h += "<span>" + d + "</span>";
    for (var r = 0; r < 10; r++) { h += "<em></em>"; for (d = 1; d <= 31; d++) h += "<i></i>"; }
    return F("", h + '</div><div class="nt">Como foi o mês' + lns(5) + "</div>", m);
  }
  function financas(i, m) {
    var t = function (tit, n) { return '<table class="tb"><tr><th>' + tit + '</th><th style="width:26%">Valor</th></tr>' + new Array(n + 1).join("<tr><td></td><td></td></tr>") + "</table>"; };
    return F("", '<p class="pt">Finanças · ' + CAL.MESES[i] + '</p><p class="ps">entradas, gastos e o que sobrou</p>' + t("Entradas", 4) + t("Contas fixas", 7) + t("Gastos variáveis", 7) + '<div class="nt">Sobrou / guardei: ____________ &nbsp; Meta do mês: ____________</div>', m);
  }
  function semana(ini, fer, n, m) {
    var h = '<p class="pt">Semana ' + n + '</p><p class="ps">' + dd(ini) + " a " + dd(mais(ini, 6)) + '</p><div class="sem">';
    for (var i = 0; i < 7; i++) { var d = mais(ini, i), f = fer[d.getMonth() + "-" + d.getDate()]; h += "<div><b>" + DS[d.getDay()] + " " + dd(d) + "</b>" + (f && d.getFullYear() === A ? '<span class="fx">' + esc(f.nome) + "</span>" : "") + lns(4) + "</div>"; }
    return F("", h + "<div><b>Prioridades da semana</b>" + lns(4) + "</div></div>", m);
  }
  function mais(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dd(d) { return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2); }
  function paginas(marca, todas) {
    var fer = CAL.feriados(A, true), out = [capa(marca), ano(fer, marca), metas(marca)];
    if (!todas) { out.push(mes(0, fer, marca)); if (S.hab) out.push(habitos(0, marca)); if (S.sem) out.push(semana(new Date(2026, 11, 28), fer, 1, marca)); return out; }
    for (var i = 0; i < 12; i++) { out.push(mes(i, fer, marca)); if (S.hab) out.push(habitos(i, marca)); if (S.fin) out.push(financas(i, marca)); }
    if (S.sem) { var d = new Date(2026, 11, 28); for (var n = 1; n <= 53; n++, d = mais(d, 7)) out.push(semana(d, fer, n, marca)); }
    return out;
  }
  function total() { return 3 + 12 * (1 + (S.hab ? 1 : 0) + (S.fin ? 1 : 0)) + (S.sem ? 53 : 0); }
  function segs() {
    document.querySelectorAll("[data-cap]").forEach(function (b) { b.classList.toggle("on", b.dataset.cap === S.cap); });
    document.querySelectorAll("#cores button").forEach(function (b) { b.classList.toggle("on", b.dataset.c === S.cor); });
  }
  function ler() { S.nome = $("fNome").value.trim().slice(0, 30); S.frase = $("fFrase").value.trim().slice(0, 60); S.hab = $("oHab").checked; S.fin = $("oFin").checked; S.sem = $("oSem").checked; }
  function render() {
    var pago = TJ.unlocked; document.body.classList.toggle("unlocked", pago);
    $("prev").innerHTML = paginas(!pago, false).join("");
    $("prevInfo").textContent = total() + " páginas A4 no PDF" + (pago ? "" : " · mostrando algumas na prévia");
    $("payN").textContent = total(); $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function gerarClick() { ler(); TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("gerou", { p: total(), c: S.cap }); $("res").scrollIntoView({ behavior: "smooth", block: "start" }); }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); TJ.salvar(S); $("printArea").innerHTML = paginas(false, true).join(""); TJ.track("imprimiu", { p: total() });
    setTimeout(function () { window.print(); }, 500);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🗓️ Liberar meu planner — R$14,90"; }, 2500);
  }
  function init() {
    $("cores").innerHTML = CORES.map(function (c) { return '<button type="button" aria-label="cor ' + c + '" data-c="' + c + '" style="background:' + c + '"></button>'; }).join("");
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    $("fNome").value = S.nome; $("fFrase").value = S.frase; $("oHab").checked = S.hab; $("oFin").checked = S.fin; $("oSem").checked = S.sem; segs();
    var re = function () { segs(); if (!$("res").hidden) { ler(); render(); } };
    document.querySelectorAll("[data-cap]").forEach(function (b) { b.onclick = function () { S.cap = b.dataset.cap; re(); }; });
    document.querySelectorAll("#cores button").forEach(function (b) { b.onclick = function () { S.cor = b.dataset.c; re(); }; });
    ["oHab", "oFin", "oSem"].forEach(function (id) { $(id).onchange = re; });
    $("btnGerar").onclick = gerarClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    $("btnShare").onclick = function () { TJ.share("Achei um planner 2027 que sai com o seu nome na capa e os feriados marcados 🗓️"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNome").value = "Juliana"; gerarClick(); };
  init();
})();

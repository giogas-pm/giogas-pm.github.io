/* Bingo de Natal — motor M2 (imprimível com prévia marcada). Tudo roda no aparelho; servidor só sabe "pedido X pago". */
(function () {
  var ITENS = [["🎄","Árvore"],["🎅","Papai Noel"],["🤶","Mamãe Noel"],["🦌","Rena"],["🛷","Trenó"],["🎁","Presente"],["🔔","Sino"],["⭐","Estrela"],
    ["🕯️","Vela"],["🧦","Meia"],["⛄","Boneco de neve"],["❄️","Floco de neve"],["👼","Anjo"],["🎀","Laço"],["🍭","Bengala doce"],["🍪","Biscoito"],
    ["☕","Chocolate quente"],["🦃","Peru"],["🍞","Rabanada"],["🍰","Panetone"],["🍇","Uvas"],["🌰","Castanha"],["🥂","Brinde"],["🍽️","Ceia"],
    ["🧝","Duende"],["✉️","Cartinha"],["🌲","Pinheiro"],["💡","Pisca-pisca"],["🏠","Chaminé"],["🎶","Canção"],["👶","Menino Jesus"],["🐑","Ovelhinha"],
    ["🐫","Camelo"],["👑","Rei Mago"],["🧣","Cachecol"],["🧤","Luvas"],["🧸","Ursinho"],["🚂","Trenzinho"],["🍬","Bala"],["🎆","Fogos"]];
  var LET = ["N", "A", "T", "A", "L"];
  var $ = function (id) { return document.getElementById(id); };
  var S = { titulo: "Bingo de Natal da Família", modo: "fig", tam: 5, nomes: "", qtd: 8 };
  var CARTS = [], PREV = 3, pwSeen = false, sorteio = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function hash(s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nomes() { return S.nomes.split(/\n|,/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 100); }
  function total() { return Math.max(1, Math.min(100, Math.max(nomes().length, +S.qtd || 1))); }
  function tamReal() { return S.modo === "num" ? 5 : S.tam; }
  /* gera N cartelas diferentes entre si (conjunto de itens distinto), determinístico por slug+título */
  function gerar() {
    var r = rng(hash((TJ.slug || "demo") + "|" + S.titulo + "|" + S.modo + "|" + S.tam)), n = total(), t = tamReal(), vistos = {}, out = [], ns = nomes();
    var livre = t === 5; var k = t * t - (livre ? 1 : 0);
    for (var c = 0, guard = 0; c < n && guard < 5000; guard++) {
      var cel;
      if (S.modo === "num") {
        cel = [];
        for (var col = 0; col < 5; col++) {
          var faixa = []; for (var v = col * 15 + 1; v <= col * 15 + 15; v++) faixa.push(v);
          var pick = shuffle(faixa, r).slice(0, 5).sort(function (a, b) { return a - b; });
          for (var row = 0; row < 5; row++) { (cel[row] = cel[row] || [])[col] = pick[row]; }
        }
        cel = [].concat.apply([], cel).map(function (v, i) { return i === 12 ? null : v; });
      } else {
        var idx = shuffle(ITENS.map(function (_, i) { return i; }), r).slice(0, k);
        cel = idx.slice(); if (livre) cel.splice(12, 0, null);
      }
      var key = cel.filter(function (x) { return x !== null; }).slice().sort(function (a, b) { return a - b; }).join(".");
      if (vistos[key]) continue; vistos[key] = 1;
      out.push({ n: c + 1, nome: ns[c] || "", cel: cel }); c++;
    }
    return out;
  }
  function cartelaHTML(ct, marca) {
    var t = tamReal(), h = '<div class="bc t' + t + '"><div class="bh"><div class="bt">' + esc(S.titulo) + '</div><div class="bn">' +
      (ct.nome ? esc(ct.nome) : "Cartela nº " + ct.n) + '</div></div>';
    if (S.modo === "num") h += '<div class="bl">' + LET.map(function (l) { return "<span>" + l + "</span>"; }).join("") + "</div>";
    h += '<div class="bg" style="grid-template-columns:repeat(' + t + ',1fr)">';
    ct.cel.forEach(function (v) {
      if (v === null) h += '<div class="cell free"><b>✨</b><i>Feliz Natal</i></div>';
      else if (S.modo === "num") h += '<div class="cell num"><b>' + v + "</b></div>";
      else if (S.modo === "pal") h += '<div class="cell pal"><i>' + ITENS[v][1] + "</i></div>";
      else h += '<div class="cell"><b>' + ITENS[v][0] + "</b><i>" + ITENS[v][1] + "</i></div>";
    });
    h += '</div><div class="bf">Nº ' + ct.n + " · cartela única</div>";
    if (marca) h += '<div class="wm" data-qa="marca" aria-hidden="true"><span>PRÉVIA</span><span>PRÉVIA</span><span>PRÉVIA</span></div>';
    return h + "</div>";
  }
  function fichasHTML() {
    var h = '<div class="fichas"><h3>Fichas do sorteio — recorte e coloque num saquinho</h3><div class="fg">';
    if (S.modo === "num") for (var v = 1; v <= 75; v++) h += '<div class="fi"><b>' + LET[Math.floor((v - 1) / 15)] + " " + v + "</b></div>";
    else ITENS.forEach(function (it) { h += '<div class="fi"><b>' + (S.modo === "pal" ? "" : it[0]) + "</b><i>" + it[1] + "</i></div>"; });
    return h + "</div></div>";
  }
  function ler() {
    S.titulo = ($("fTit").value.trim() || "Bingo de Natal").slice(0, 60);
    S.nomes = $("fNomes").value.slice(0, 3000); S.qtd = Math.max(1, Math.min(100, +$("fQtd").value || 1));
  }
  function segs() {
    document.querySelectorAll("[data-modo]").forEach(function (b) { b.classList.toggle("on", b.dataset.modo === S.modo); });
    document.querySelectorAll("[data-tam]").forEach(function (b) { b.classList.toggle("on", +b.dataset.tam === tamReal()); b.disabled = S.modo === "num"; });
    $("numHint").style.display = S.modo === "num" ? "block" : "none";
  }
  function render() {
    CARTS = gerar(); var pago = TJ.unlocked;
    document.body.classList.toggle("unlocked", pago);
    var mostra = pago ? CARTS : CARTS.slice(0, PREV);
    $("prev").innerHTML = mostra.map(function (c) { return cartelaHTML(c, !pago); }).join("");
    $("prevInfo").textContent = CARTS.length + (CARTS.length > 1 ? " cartelas diferentes" : " cartela") +
      (!pago && CARTS.length > PREV ? " · mostrando " + PREV + " na prévia" : "") + " · " + (S.modo === "num" ? "números 1–75" : tamReal() + "×" + tamReal());
    $("res").hidden = false; $("zPago").hidden = !pago; $("zPay").hidden = pago;
    $("payN").textContent = CARTS.length;
  }
  function gerarClick() {
    ler(); TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("gerou", { n: CARTS.length, m: S.modo, t: tamReal() });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); TJ.salvar(S); CARTS = gerar();
    $("printArea").innerHTML = '<div class="pg">' + CARTS.map(function (c) { return cartelaHTML(c, false); }).join("") + "</div>" + fichasHTML();
    TJ.track("imprimiu", { n: CARTS.length, m: S.modo });
    setTimeout(function () { window.print(); }, 150);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🎄 Liberar para imprimir — R$14,90"; }, 2500);
  }
  /* sorteador na tela (grátis) */
  function sortear() {
    if (!sorteio) { sorteio = { pool: S.modo === "num" ? Array.from({ length: 75 }, function (_, i) { return i + 1; }) : ITENS.map(function (_, i) { return i; }), saiu: [] }; sorteio.pool = shuffle(sorteio.pool, Math.random); TJ.track("sorteio", { m: S.modo }); }
    if (!sorteio.pool.length) { TJ.toast("Acabaram as fichas! 🎉"); return; }
    var v = sorteio.pool.pop(); sorteio.saiu.push(v);
    var lab = function (x) { return S.modo === "num" ? LET[Math.floor((x - 1) / 15)] + " " + x : (S.modo === "pal" ? "" : ITENS[x][0] + " ") + ITENS[x][1]; };
    $("sAtual").textContent = lab(v); $("sAtual").classList.remove("pop"); void $("sAtual").offsetWidth; $("sAtual").classList.add("pop");
    $("sHist").innerHTML = sorteio.saiu.slice().reverse().map(function (x) { return "<span>" + esc(lab(x)) + "</span>"; }).join("");
    $("sCont").textContent = sorteio.saiu.length + " sorteados · faltam " + sorteio.pool.length;
  }
  function init() {
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    $("fTit").value = S.titulo; $("fNomes").value = S.nomes; $("fQtd").value = S.qtd; segs();
    document.querySelectorAll("[data-modo]").forEach(function (b) { b.onclick = function () { S.modo = b.dataset.modo; segs(); if (!$("res").hidden) { ler(); render(); } }; });
    document.querySelectorAll("[data-tam]").forEach(function (b) { b.onclick = function () { S.tam = +b.dataset.tam; segs(); if (!$("res").hidden) { ler(); render(); } }; });
    $("fNomes").oninput = function () { S.nomes = $("fNomes").value; var n = nomes().length; if (n) $("fQtd").value = Math.max(n, +$("fQtd").value || 0); };
    $("btnGerar").onclick = gerarClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    $("btnSort").onclick = sortear; $("btnReset").onclick = function () { sorteio = null; $("sAtual").textContent = "—"; $("sHist").innerHTML = ""; $("sCont").textContent = ""; };
    $("btnShare").onclick = function () { TJ.share("Olha que legal pro Natal: bingo com cartela única pra cada um da família 🎄"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d) render();
    TJ.retorno(function () { ler(); render(); $("res").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNomes").value = "Vó Lúcia\nTio Beto\nAna\nPedro"; $("fQtd").value = 8; gerarClick(); };
  init();
})();

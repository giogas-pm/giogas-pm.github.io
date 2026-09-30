/* Fraldas do Chá — motor M1 + share: calculadora e divisão por convidado grátis → lista impressa + cartões pagos. Tudo no aparelho. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var T = ["RN", "P", "M", "G", "XG"];
  var PESOS = { normal: [5, 20, 35, 30, 10], grande: [0, 10, 40, 35, 15], gemeos: [10, 25, 35, 25, 5] };
  var POR_PAC = [36, 50, 44, 40, 36], POR_DIA = [11, 9, 7.5, 6, 5], FAIXA = ["até 4 kg", "3 a 6 kg", "5 a 10 kg", "9 a 13 kg", "+12 kg"];
  var S = { bebe: "", data: "", qtd: "", peso: "normal", nomes: "" }, pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nomes() { return S.nomes.split("\n").map(function (x) { return x.replace(/^\s*\d+[\.\)\-–]?\s+/, "").trim().slice(0, 40); }).filter(Boolean).slice(0, 200); }
  function total() { return Math.max(nomes().length, Math.min(Math.max(parseInt(S.qtd, 10) || 0, 0), 300)); }
  function dividir(n) {
    var w = PESOS[S.peso], soma = 100, base = w.map(function (x) { return Math.floor(n * x / soma); }), falta = n - base.reduce(function (a, b) { return a + b; }, 0);
    var rest = w.map(function (x, i) { return [n * x / soma - base[i], i]; }).filter(function (r) { return w[r[1]] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
    for (var k = 0; k < falta; k++) base[rest[k % rest.length][1]]++;
    return base;
  }
  function lista() { /* expande a divisão em sequência intercalada (quem está perto na lista leva tamanhos diferentes) */
    var d = dividir(total()).slice(), out = [];
    while (out.length < total()) for (var i = 0; i < 5; i++) if (d[i] > 0) { d[i]--; out.push(i); }
    return out;
  }
  function dias(d) { var x = d.reduce(function (s, p, i) { return s + p * POR_PAC[i] / POR_DIA[i]; }, 0); return S.peso === "gemeos" ? x / 2 : x; }
  function ler() { S.bebe = $("fBebe").value.trim(); S.data = $("fData").value; S.qtd = $("fQtd").value; S.nomes = $("fNomes").value; }
  function quando() { if (!S.data) return ""; var d = new Date(S.data + "T12:00"); return isNaN(d) ? "" : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }); }
  function msg(nome, t) {
    return "Oi, " + nome + "! 💛 No chá de bebê " + (S.bebe ? "de " + S.bebe : "") + (quando() ? " (" + quando() + ")" : "") + ", a sua fralda é tamanho " + T[t] + " (" + FAIXA[t] + "). Obrigada por fazer parte! 🍼\nLista montada em " + location.origin + location.pathname;
  }
  function paginas(marca) {
    var d = dividir(total()), L = lista(), ns = nomes(), wm = marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "", bebe = S.bebe || "nosso bebê";
    var rows = L.map(function (t, i) { return "<tr><td>" + (i + 1) + ". " + esc(ns[i] || "____________________") + "</td><td><b>" + T[t] + '</b></td><td><span class="ck"></span></td></tr>'; });
    var tabela = function (rs) { return "<table><thead><tr><th>Convidado</th><th>Fralda</th><th>Chegou</th></tr></thead><tbody>" + rs.join("") + "</tbody></table>"; };
    var meio = Math.ceil(rows.length / 2), corpo = rows.length > 24 ? '<div class="cols">' + tabela(rows.slice(0, meio)) + tabela(rows.slice(meio)) + "</div>" : tabela(rows);
    var p1 = '<div class="pg">' + wm + '<div class="in"><div class="ey">chá de bebê · lista de fraldas</div><h3>' + esc(bebe) + '</h3><div class="sb">' + total() + " convidados" + (quando() ? " · " + quando() : "") + "</div>" +
      '<div class="res">' + d.map(function (x, i) { return "<div><b>" + x + "</b>" + T[i] + "</div>"; }).join("") + "</div>" + corpo +
      '<div class="rp">Rende cerca de ' + Math.round(dias(d) / 7) + " semanas de fralda · feito em Fraldas do Chá</div></div></div>";
    var cards = "", nPag = Math.ceil(L.length / 8), lim = marca ? Math.min(nPag, 1) : nPag;
    for (var p = 0; p < lim; p++) {
      cards += '<div class="pg cards">' + wm + '<div class="in">';
      for (var j = p * 8; j < p * 8 + 8; j++) cards += j < L.length ? '<div class="cd"><span class="em">🍼</span><div class="h">chá de ' + esc(bebe) + '</div><div class="nm">' + esc(ns[j] || "Para você") + '</div><div class="tx">a sua fralda é tamanho</div><div class="tm">' + T[L[j]] + '</div><div class="tx">' + FAIXA[L[j]] + " · qualquer marca 💛</div></div>" : '<div class="cd"></div>';
      cards += "</div></div>";
    }
    return p1 + cards;
  }
  function render() {
    var pago = TJ.unlocked, n = total(), d = dividir(n), L = lista(), ns = nomes();
    document.body.classList.toggle("unlocked", pago);
    $("rTopo").textContent = "Para " + n + " convidados" + (S.bebe ? " no chá de " + S.bebe : "") + ", peça:";
    $("rTams").innerHTML = d.map(function (x, i) { return "<div><b>" + x + "</b><span>" + T[i] + "</span><small>" + (x === 1 ? "pacote" : "pacotes") + "</small></div>"; }).join("");
    var sem = Math.round(dias(d) / 7);
    $("rDur").textContent = "≈ " + d.reduce(function (s, p, i) { return s + p * POR_PAC[i]; }, 0).toLocaleString("pt-BR") + " fraldas, o suficiente pra ~" + sem + " semanas" + (S.peso === "gemeos" ? " (já contando os dois)" : "") + ". Pacotes grandes variam de 30 a 60 fraldas.";
    $("zConv").hidden = !ns.length;
    $("rConv").innerHTML = ns.map(function (nm, i) { return '<li><span class="t">' + T[L[i]] + '</span><span class="n">' + esc(nm) + '</span><a target="_blank" rel="noopener" data-i="' + i + '" href="https://wa.me/?text=' + encodeURIComponent(msg(nm, L[i])) + '">WhatsApp</a></li>'; }).join("");
    $("prev").innerHTML = paginas(!pago);
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function segs() { document.querySelectorAll("[data-peso]").forEach(function (b) { b.classList.toggle("on", b.dataset.peso === S.peso); }); }
  function contar() { var n = nomes().length; $("nCont").textContent = n ? n + " convidado" + (n > 1 ? "s" : "") + " com nome (os demais ficam em branco na lista)" : ""; }
  function calcular() {
    ler(); if (!total()) { TJ.toast("Diga quantos convidados (ou cole os nomes) 🙂"); return; }
    TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("calculou", { n: total(), p: S.peso, nomes: nomes().length > 0 });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🍼 Liberar lista + cartões — R$14,90"; }, 2500);
  }
  function init() {
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    var q = new URLSearchParams(location.search); if (!d && q.get("n")) S.qtd = q.get("n"); if (!d && PESOS[q.get("peso")]) S.peso = q.get("peso");
    $("fBebe").value = S.bebe; $("fData").value = S.data; $("fQtd").value = S.qtd; $("fNomes").value = S.nomes; segs(); contar();
    document.querySelectorAll("[data-peso]").forEach(function (b) { b.onclick = function () { S.peso = b.dataset.peso; segs(); if (!$("res").hidden) { ler(); render(); } }; });
    $("fNomes").oninput = function () { S.nomes = $("fNomes").value; contar(); };
    $("rConv").addEventListener("click", function (e) { if (e.target.tagName === "A") TJ.track("share", { via: "wa_convidado" }); });
    $("btnCalc").onclick = calcular; $("btnPay").onclick = comprar;
    $("btnPrint").onclick = function () { if (!TJ.unlocked) { comprar(); return; } ler(); render(); TJ.track("imprimiu", { n: total() }); setTimeout(function () { window.print(); }, 300); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d && total()) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fBebe").value = "Helena"; $("fQtd").value = "30"; $("fNomes").value = "Tia Marta\nVó Lúcia\nCarol e Pedro\nJu\nFernanda\nBia e Rafa\nTio Beto\nDinda Paula\nMarina\nCamila"; calcular(); };
  init();
})();

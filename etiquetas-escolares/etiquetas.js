/* Etiquetas Escolares — motor M2: folha A4 com 48 etiquetas de nome (6 grandes, 6 médias, 6 redondas, 30 mini). Nome fica só no aparelho. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var TEMAS = {
    dino: ["🦖 Dinossauro", ["🦖", "🦕", "🌋", "🦴"], "#4d7c0f", "#f3fbe4", "#1f3a07"],
    unicornio: ["🦄 Unicórnio", ["🦄", "🌈", "⭐", "💖"], "#db2777", "#fdf0f7", "#6b0f3a"],
    espaco: ["🚀 Espaço", ["🚀", "🪐", "⭐", "👽"], "#1e3a8a", "#eef3ff", "#0f1f4d"],
    futebol: ["⚽ Futebol", ["⚽", "🥅", "🏆", "👟"], "#15803d", "#effcf3", "#0b3d1d"],
    princesa: ["👑 Princesa", ["👑", "🏰", "✨", "🌸"], "#9333ea", "#f7f0ff", "#3f0f6b"],
    mar: ["🐠 Fundo do mar", ["🐠", "🐙", "🐳", "🐚"], "#0e7490", "#ebfbfe", "#083844"],
    bichos: ["🐶 Bichinhos", ["🐶", "🐱", "🐰", "🐻"], "#c2410c", "#fff5ec", "#5a1e05"],
    lapis: ["✏️ Clássico", ["✏️", "📚", "🖍️", "📏"], "#334155", "#ffffff", "#0f172a"]
  };
  var S = { nome: "", turma: "", escola: "", tema: "dino", corte: true }, pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fs(txt, largura, max) { return Math.min(max, largura / (Math.max(txt.length, 3) * 0.6)).toFixed(2); }
  function mm(x) { return "calc(var(--mm)*" + x + ")"; }
  function curto(n) { var p = n.split(/\s+/).filter(Boolean); return p.length > 2 ? p[0] + " " + p[p.length - 1] : n; }
  function primeiro(n) { return n.split(/\s+/)[0] || n; }
  function ler() { S.nome = $("fNome").value.trim().slice(0, 40); S.turma = $("fTurma").value.trim().slice(0, 24); S.escola = $("fEscola").value.trim().slice(0, 40); S.corte = $("fCorte").checked; }
  function et(cls, emoji, nome, largura, max, sub, subLinhas) {
    return '<div class="et ' + cls + '"><span class="em">' + emoji + '</span><div class="tx"><div class="nm" style="font-size:' + mm(fs(nome, largura, max)) + '">' + esc(nome) + "</div>" +
      (sub || "") + "</div></div>";
  }
  function folha(marca) {
    var t = TEMAS[S.tema] || TEMAS.dino, em = t[1], nome = S.nome || "Nome da Criança", h = "", i;
    var sub1 = (S.turma || S.escola) ? '<div class="lin"></div>' + (S.turma ? '<div class="sb">' + esc(S.turma) + "</div>" : "") + (S.escola ? '<div class="sb">' + esc(S.escola) + "</div>" : "") : "";
    var sub2 = S.turma ? '<div class="sb">' + esc(S.turma) + "</div>" : "";
    h += '<div class="gr g1">'; for (i = 0; i < 6; i++) h += et("e1", em[i % 4], nome, 64, 10, sub1); h += "</div>";
    h += '<div class="gr g2">'; for (i = 0; i < 6; i++) h += et("e2", em[(i + 1) % 4], nome, 42, 6.6, sub2); h += "</div>";
    h += '<div class="gr g3">'; for (i = 0; i < 6; i++) h += et("e3", em[(i + 2) % 4], primeiro(nome), 22, 5.4, ""); h += "</div>";
    h += '<div class="gr g4">'; for (i = 0; i < 30; i++) h += et("e4", em[i % 4], curto(nome), 26, 4.6, ""); h += "</div>";
    return '<div class="fl' + (S.corte ? " corte" : "") + '" style="--ac:' + t[2] + ";--bg:" + t[3] + ";--tx:" + t[4] + '">' +
      (marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span><span>PRÉVIA</span><span>PRÉVIA</span></div>' : "") +
      '<div class="pg">' + h + '</div><div class="rod">Etiquetas Escolares · giogas-pm.github.io/etiquetas-escolares</div></div>';
  }
  function temas() {
    $("temas").innerHTML = Object.keys(TEMAS).map(function (k) { return '<button type="button" data-tema="' + k + '"' + (k === S.tema ? ' class="on"' : "") + ">" + TEMAS[k][0] + "</button>"; }).join("");
    document.querySelectorAll("[data-tema]").forEach(function (b) { b.onclick = function () { S.tema = b.dataset.tema; temas(); if (!$("res").hidden) { ler(); render(); } }; });
  }
  function render() {
    var pago = TJ.unlocked; document.body.classList.toggle("unlocked", pago);
    $("prev").innerHTML = folha(!pago); $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago; caber();
  }
  function caber() {
    $("prev").querySelectorAll(".nm").forEach(function (n) {
      var m = /\*\s*([\d.]+)/.exec(n.style.fontSize), x = m ? +m[1] : 5, k = 0;
      while (n.scrollWidth > n.clientWidth + 1 && x > 2 && k++ < 30) { x *= 0.93; n.style.fontSize = mm(x.toFixed(2)); }
    });
  }
  function gerarClick() {
    ler(); if (!S.nome) { TJ.toast("Digite o nome da criança 🙂"); $("fNome").focus(); return; }
    TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("gerou", { t: S.tema, n: S.nome.length }); $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); TJ.salvar(S); render(); $("printArea").innerHTML = $("prev").innerHTML; TJ.track("imprimiu", { t: S.tema }); setTimeout(function () { window.print(); }, 500);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "✏️ Liberar as etiquetas — R$14,90"; }, 2500);
  }
  function init() {
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    $("fNome").value = S.nome; $("fTurma").value = S.turma; $("fEscola").value = S.escola; $("fCorte").checked = S.corte !== false; temas();
    ["fNome", "fTurma", "fEscola", "fCorte"].forEach(function (id) { $(id).addEventListener("input", function () { if (!$("res").hidden) { ler(); render(); } }); });
    $("fCorte").onchange = function () { if (!$("res").hidden) { ler(); render(); } };
    $("btnGerar").onclick = gerarClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    $("btnShare").onclick = function () { TJ.share("Achei um site que faz as etiquetas escolares com o nome da criança pra imprimir ✏️"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d && d.nome) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNome").value = "Maria Eduarda Lima"; $("fTurma").value = "1º ano B"; $("fEscola").value = "Colégio Monteiro Lobato"; gerarClick(); };
  init();
})();

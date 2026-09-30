/* Certificado ABC — motor M2, lote: 1 certificado por aluno. Nomes ficam só no aparelho. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var TIPOS = {
    abc: ["Certificado", "Conclusão do ABC", "concluiu com alegria e dedicação a etapa de alfabetização, aprendendo a ler e a escrever"],
    ei: ["Certificado", "Conclusão da Educação Infantil", "concluiu com êxito a Educação Infantil, cheia de descobertas, brincadeiras e aprendizados"],
    pre: ["Diploma", "Formatura da Pré-escola", "concluiu a Pré-escola com muito carinho, curiosidade e amizade"],
    f5: ["Certificado", "Conclusão do 5º ano", "concluiu com êxito o 5º ano do Ensino Fundamental — anos iniciais"],
    f9: ["Certificado", "Conclusão do 9º ano", "concluiu com êxito o Ensino Fundamental"],
    merito: ["Honra ao Mérito", "Reconhecimento", "se destacou pelo esforço, pela dedicação e pelo companheirismo"]
  };
  var DEC = { lapis: ["✏️", "📚", "🖍️", "⭐"], estrelas: ["⭐", "🌟", "✨", "⭐"], classico: ["", "", "", ""] };
  var S = { tipo: "abc", nomes: "", escola: "", turma: "", ano: "2026", prof: "", dir: "", local: "", est: "lapis" }, pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nomes() { return S.nomes.split("\n").map(function (x) { return x.replace(/^\s*\d+[\.\)\-–]?\s+/, "").trim().slice(0, 60); }).filter(Boolean).slice(0, 60); }
  function ler() {
    S.tipo = $("fTipo").value; S.nomes = $("fNomes").value.slice(0, 5000); S.escola = $("fEscola").value.trim(); S.turma = $("fTurma").value.trim();
    S.ano = $("fAno").value.trim() || "2026"; S.prof = $("fProf").value.trim(); S.dir = $("fDir").value.trim(); S.local = $("fLocal").value.trim();
  }
  function cert(n, marca) {
    var t = TIPOS[S.tipo] || TIPOS.abc, d = DEC[S.est] || DEC.lapis;
    var onde = (S.turma ? " na turma " + esc(S.turma) : "") + (S.escola ? (S.turma ? (masc(S.escola) ? " do " : " da ") : (masc(S.escola) ? " no " : " na ")) + esc(S.escola) : "") + ", no ano de " + esc(S.ano) + ".";
    var as = [S.prof, S.dir].filter(Boolean);
    return '<div class="ct ' + S.est + '">' + (marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "") + '<div class="in">' +
      d.map(function (e, i) { return e ? '<span class="dc d' + (i + 1) + '">' + e + "</span>" : ""; }).join("") +
      '<div class="ti">' + t[0] + '</div><div class="su">' + t[1] + '</div><div class="cq">Certificamos que</div><div class="nm">' + esc(n) + '</div><div class="tx">' + t[2] + onde + "</div>" +
      (S.local ? '<div class="lc">' + esc(S.local) + "</div>" : "") + (as.length ? '<div class="as">' + as.map(function (a) { return "<div>" + esc(a) + "</div>"; }).join("") + "</div>" : "") + "</div></div>";
  }
  function masc(e) { return /^(col[eé]gio|instituto|centro|educand[aá]rio|cei|cmei|n[uú]cleo|jardim|externato|liceu|grupo)/i.test(e.trim()); }
  function segs() { document.querySelectorAll("[data-est]").forEach(function (b) { b.classList.toggle("on", b.dataset.est === S.est); }); }
  function contar() { var n = nomes().length; $("nCont").textContent = n ? n + " aluno" + (n > 1 ? "s" : "") : "Cole direto da lista de chamada."; }
  function render() {
    var pago = TJ.unlocked, ns = nomes(); if (!ns.length) ns = ["Nome do Aluno"];
    document.body.classList.toggle("unlocked", pago);
    $("prev").innerHTML = (pago ? ns : ns.slice(0, 2)).map(function (n) { return cert(n, !pago); }).join("");
    $("prevInfo").textContent = ns.length + " certificado" + (ns.length > 1 ? "s" : "") + (!pago && ns.length > 2 ? " · mostrando 2 na prévia" : "") + " · A4 deitado";
    $("payN").textContent = ns.length; $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function gerarClick() { ler(); if (!nomes().length) { TJ.toast("Cole pelo menos 1 nome de aluno 🙂"); return; } TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("gerou", { n: nomes().length, t: S.tipo, e: S.est }); $("res").scrollIntoView({ behavior: "smooth", block: "start" }); }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); TJ.salvar(S); $("printArea").innerHTML = nomes().map(function (n) { return cert(n, false); }).join("");
    TJ.track("imprimiu", { n: nomes().length }); setTimeout(function () { window.print(); }, 400);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🎓 Liberar a turma toda — R$14,90"; }, 2500);
  }
  function init() {
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    $("fTipo").value = S.tipo; $("fNomes").value = S.nomes; $("fEscola").value = S.escola; $("fTurma").value = S.turma; $("fAno").value = S.ano;
    $("fProf").value = S.prof; $("fDir").value = S.dir; $("fLocal").value = S.local; segs(); contar();
    document.querySelectorAll("[data-est]").forEach(function (b) { b.onclick = function () { S.est = b.dataset.est; segs(); if (!$("res").hidden) { ler(); render(); } }; });
    $("fTipo").onchange = function () { if (!$("res").hidden) { ler(); render(); } };
    $("fNomes").oninput = function () { S.nomes = $("fNomes").value; contar(); };
    $("btnGerar").onclick = gerarClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    $("btnShare").onclick = function () { TJ.share("Achei um site que faz o certificado do ABC da turma inteira de uma vez 🎓"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d && d.nomes) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNomes").value = "Ana Clara Souza\nBernardo Lima\nCecília Rocha"; $("fEscola").value = "Escola Municipal Monteiro Lobato"; $("fTurma").value = "Jardim II B"; $("fProf").value = "Profª Márcia Alves"; $("fDir").value = "Diretora Sandra Melo"; $("fLocal").value = "Campinas, 12 de dezembro de 2026"; gerarClick(); };
  init();
})();

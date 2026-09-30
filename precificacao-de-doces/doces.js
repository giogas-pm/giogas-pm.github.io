/* Precificação de Doces — motor M1: calculadora grátis → ficha técnica + tabela de preços (PDF 2 págs) paga. Tudo no aparelho. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var MOD = {
    brigadeiro: { prod: "Brigadeiro gourmet", rend: 30, emb: 0.12, horas: 1.5, un: "un", ings: [["Leite condensado", 7.49, 395, 395], ["Creme de leite", 3.29, 200, 100], ["Chocolate 50% cacau", 11.9, 200, 60], ["Manteiga", 9.9, 200, 15], ["Granulado belga", 14.9, 150, 90]] },
    pote: { prod: "Bolo de pote (250 ml)", rend: 12, emb: 1.1, horas: 2.5, un: "un", ings: [["Farinha de trigo", 5.49, 1000, 240], ["Açúcar", 4.79, 1000, 200], ["Ovos", 12.9, 12, 4], ["Leite", 5.29, 1000, 240], ["Chocolate em pó 50%", 11.9, 200, 60], ["Leite condensado", 7.49, 395, 790], ["Creme de leite", 3.29, 200, 400]] },
    brownie: { prod: "Brownie (8×8 cm)", rend: 16, emb: 0.6, horas: 1.5, un: "un", ings: [["Chocolate meio amargo", 34.9, 1000, 300], ["Manteiga", 9.9, 200, 200], ["Açúcar", 4.79, 1000, 300], ["Ovos", 12.9, 12, 4], ["Farinha de trigo", 5.49, 1000, 120], ["Cacau em pó", 16.9, 200, 30]] },
    bolo: { prod: "Bolo recheado", rend: 2.5, emb: 3, horas: 3, un: "kg", ings: [["Farinha de trigo", 5.49, 1000, 360], ["Açúcar", 4.79, 1000, 360], ["Ovos", 12.9, 12, 6], ["Leite", 5.29, 1000, 360], ["Leite condensado", 7.49, 395, 1185], ["Creme de leite", 3.29, 200, 600], ["Chocolate 50% cacau", 11.9, 200, 200], ["Chantilly", 22.9, 1000, 500]] },
    outro: { prod: "", rend: "", emb: "", horas: "", un: "un", ings: [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]] }
  };
  var S = { modelo: "brigadeiro", prod: "", ings: [], rend: "", emb: "", horas: "", valHora: 20, fixo: 10, margem: 60, taxa: 0, atelie: "", contato: "" }, pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(v) { var x = parseFloat(String(v).replace(",", ".")); return isFinite(x) ? x : 0; }
  function brl(v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function arred(v) { var p = v >= 20 ? 1 : v >= 5 ? 0.5 : 0.1; return Math.ceil(v / p - 1e-9) * p; }
  function un() { return MOD[S.modelo].un; }
  /* ---------- ingredientes ---------- */
  function linhas() {
    $("ings").innerHTML = S.ings.map(function (g, i) {
      return '<div class="ing" data-i="' + i + '"><input class="nm" aria-label="Ingrediente" placeholder="Ingrediente" value="' + esc(g[0]) + '">' +
        '<button type="button" class="x" aria-label="Remover">×</button>' +
        '<input inputmode="decimal" aria-label="Preço pago" placeholder="R$" value="' + esc(g[1]) + '"><input inputmode="decimal" aria-label="Tamanho da embalagem" placeholder="395" value="' + esc(g[2]) + '"><input inputmode="decimal" aria-label="Quantidade usada" placeholder="395" value="' + esc(g[3]) + '"><span class="cu"></span></div>';
    }).join("");
    custosLinha();
  }
  function lerIngs() { S.ings = Array.from(document.querySelectorAll(".ing")).map(function (r) { var q = r.querySelectorAll("input"); return [q[0].value.trim(), q[1].value, q[2].value, q[3].value]; }); }
  function custoIng(g) { var e = num(g[2]); return e > 0 ? num(g[1]) / e * num(g[3]) : 0; }
  function custosLinha() { document.querySelectorAll(".ing").forEach(function (r, i) { var q = r.querySelectorAll("input"); r.querySelector(".cu").textContent = brl(custoIng([0, q[1].value, q[2].value, q[3].value])); }); }
  function modelo(m) {
    var M = MOD[m]; S.modelo = m; S.prod = M.prod; S.ings = M.ings.map(function (g) { return g.slice(); }); S.rend = M.rend; S.emb = M.emb; S.horas = M.horas;
    preencher();
  }
  function preencher() {
    $("fModelo").value = S.modelo; $("fProd").value = S.prod; $("fRend").value = S.rend; $("fEmb").value = S.emb; $("fHoras").value = S.horas; $("fValHora").value = S.valHora;
    $("fFixo").value = S.fixo; $("fMargem").value = S.margem; $("fTaxa").value = S.taxa || ""; $("fAtelie").value = S.atelie; $("fContato").value = S.contato;
    $("lRend").textContent = un() === "kg" ? "Rende (kg)" : "Rende (unidades)"; linhas();
  }
  function ler() {
    lerIngs(); S.modelo = $("fModelo").value; S.prod = $("fProd").value.trim(); S.rend = $("fRend").value; S.emb = $("fEmb").value; S.horas = $("fHoras").value; S.valHora = $("fValHora").value;
    S.fixo = $("fFixo").value; S.margem = $("fMargem").value; S.taxa = $("fTaxa").value; S.atelie = $("fAtelie").value.trim(); S.contato = $("fContato").value.trim();
  }
  /* ---------- conta ---------- */
  function calc() {
    var ing = S.ings.reduce(function (s, g) { return s + custoIng(g); }, 0), fixo = ing * num(S.fixo) / 100, mao = num(S.horas) * num(S.valHora);
    var rend = Math.max(num(S.rend), 0.01), lote = ing + fixo + mao, cu = lote / rend + num(S.emb), taxa = Math.min(num(S.taxa), 60) / 100;
    var bruto = cu * (1 + num(S.margem) / 100) / (1 - taxa), preco = arred(bruto), lucro = preco * (1 - taxa) - cu;
    return { ing: ing, fixo: fixo, mao: mao, rend: rend, lote: lote, embT: num(S.emb) * rend, cu: cu, preco: preco, lucro: lucro, lucroRec: lucro * rend, taxa: taxa, minimo: cu / (1 - taxa) };
  }
  function qtds() { return un() === "kg" ? [1, 1.5, 2, 3, 4, 5] : [1, 6, 12, 25, 50, 100]; }
  function rot(q) { return un() === "kg" ? String(q).replace(".", ",") + " kg" : q === 1 ? "1 unidade" : q === 6 ? "Meia dúzia" : q === 12 ? "1 dúzia" : q === 100 ? "Cento" : q + " unidades"; }
  function precoQ(r, q) { var d = un() !== "kg" && q >= 50 ? 0.9 : un() !== "kg" && q >= 25 ? 0.95 : 1; return Math.max(arred(r.preco * q * d), r.minimo * q); }
  function paginas(marca) {
    var r = calc(), nome = S.prod || "Meu doce", at = S.atelie || "Seu ateliê", wm = marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "", hoje = new Date().toLocaleDateString("pt-BR");
    var tb = S.ings.filter(function (g) { return g[0] || num(g[1]); }).map(function (g) { return "<tr><td>" + esc(g[0] || "—") + '</td><td class="n">' + brl(num(g[1])) + " / " + esc(g[2]) + '</td><td class="n">' + esc(g[3]) + '</td><td class="n">' + brl(custoIng(g)) + "</td></tr>"; }).join("");
    var p1 = '<div class="pg">' + wm + '<div class="in"><div class="ey">ficha técnica · ' + esc(at) + "</div><h3>" + esc(nome) + '</h3><div class="sb">Rendimento: ' + String(r.rend).replace(".", ",") + " " + (un() === "kg" ? "kg" : "unidades") + " · atualizada em " + hoje + "</div>" +
      '<table><thead><tr><th>Ingrediente</th><th class="n">Pago / emb.</th><th class="n">Uso</th><th class="n">Custo</th></tr></thead><tbody>' + tb +
      '<tr class="tot"><td colspan="3">Ingredientes</td><td class="n">' + brl(r.ing) + "</td></tr></tbody></table>" +
      '<table style="margin-top:3cqw"><tbody><tr><td>Gás, luz e água (' + num(S.fixo) + '%)</td><td class="n">' + brl(r.fixo) + "</td></tr><tr><td>Mão de obra (" + String(num(S.horas)).replace(".", ",") + " h × " + brl(num(S.valHora)) + ')</td><td class="n">' + brl(r.mao) + "</td></tr>" +
      '<tr><td>Embalagens (' + brl(num(S.emb)) + " por " + (un() === "kg" ? "kg" : "unidade") + ')</td><td class="n">' + brl(r.embT) + '</td></tr><tr class="tot"><td>Custo total da receita</td><td class="n">' + brl(r.lote + r.embT) + "</td></tr></tbody></table>" +
      '<div class="kpis"><div><b>' + brl(r.cu) + "</b><span>custo por " + (un() === "kg" ? "kg" : "unidade") + "</span></div><div><b>" + brl(r.preco) + "</b><span>preço (margem " + num(S.margem) + "%)</span></div><div><b>" + brl(r.lucroRec) + "</b><span>lucro por receita</span></div></div>" +
      '<div class="rp">Preço mínimo (sem lucro): ' + brl(r.minimo) + (r.taxa ? " · já considera " + Math.round(r.taxa * 100) + "% de taxa de venda" : "") + " · calculado em Precificação de Doces</div></div></div>";
    var tp = qtds().map(function (q) { return "<tr><td>" + rot(q) + '</td><td class="n"><b>' + brl(precoQ(r, q)) + "</b></td></tr>"; }).join("");
    var p2 = '<div class="pg tab">' + wm + '<div class="in"><div class="lg">🧁</div><div class="ey">' + esc(at) + "</div><h3>" + esc(nome) + '</h3><div class="sb">Tabela de preços · ' + new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) + "</div>" +
      "<table><tbody>" + tp + '</tbody></table><div class="ob">' + (un() === "kg" ? "Encomendas com antecedência mínima de 3 dias." : "Pedido mínimo: meia dúzia · a partir de 25 unidades, desconto já aplicado.") + "</div>" +
      '<div class="ct2">' + esc(S.contato || "Encomendas pelo WhatsApp") + "</div></div></div>";
    return p1 + p2;
  }
  function render() {
    var pago = TJ.unlocked, r = calc();
    document.body.classList.toggle("unlocked", pago);
    $("rTopo").textContent = "Preço sugerido por " + (un() === "kg" ? "kg" : "unidade") + (S.prod ? " · " + S.prod : "");
    $("rPreco").textContent = brl(r.preco); $("rCusto").textContent = brl(r.cu); $("rLucro").textContent = brl(r.lucro); $("rReceita").textContent = brl(r.lucroRec);
    var qc = un() === "kg" ? 3 : 100; $("rCento").textContent = brl(precoQ(r, qc)); $("rCentoL").textContent = un() === "kg" ? "bolo de 3 kg" : "o cento (com 10% off)";
    var tot = r.preco * r.rend, parts = [["#e0a96d", r.ing + r.fixo, "ingredientes+gás"], ["#8a4b2a", r.mao, "sua hora"], ["#c9b8a6", r.embT, "embalagem"], ["#9aa5b1", tot * r.taxa, "taxa"], ["#2f7d4f", r.lucroRec, "lucro"]];
    $("rBarra").innerHTML = parts.map(function (p) { return '<i style="background:' + p[0] + ";width:" + Math.max(0, p[1] / tot * 100) + '%"></i>'; }).join("");
    $("rLeg").innerHTML = parts.filter(function (p) { return p[1] > 0.005; }).map(function (p) { return '<span style="color:' + p[0] + '">●</span> ' + p[2] + " " + Math.round(p[1] / tot * 100) + "%"; }).join(" · ");
    $("rAlerta").textContent = !num(S.horas) || !num(S.valHora) ? "⚠️ Você não colocou a sua hora de trabalho — o preço está baixo demais." : num(S.margem) < 30 ? "⚠️ Margem abaixo de 30%: qualquer aumento de ingrediente come o seu lucro." : "";
    $("prev").innerHTML = paginas(!pago);
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function calcular() {
    ler(); if (!(calc().ing > 0) || !(num(S.rend) > 0)) { TJ.toast("Preencha pelo menos 1 ingrediente e o rendimento 🙂"); return; }
    TJ.garanteSlug(); TJ.salvar(S); render(); TJ.track("calculou", { m: S.modelo, p: Math.round(calc().preco * 100) / 100 });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🧁 Liberar o PDF — R$12,90"; }, 2500);
  }
  function init() {
    var d = TJ.carregar(), q = new URLSearchParams(location.search).get("m");
    if (d) { S = Object.assign(S, d); preencher(); } else modelo(MOD[q] ? q : "brigadeiro");
    $("fModelo").onchange = function () { modelo(this.value); if (!$("res").hidden) render(); };
    $("btnAdd").onclick = function () { lerIngs(); S.ings.push(["", "", "", ""]); linhas(); document.querySelector(".ing:last-child input").focus(); };
    $("ings").addEventListener("click", function (e) { if (e.target.classList.contains("x")) { lerIngs(); S.ings.splice(+e.target.parentNode.dataset.i, 1); linhas(); } });
    $("ings").addEventListener("input", custosLinha);
    $("fAtelie").oninput = $("fContato").oninput = function () { if (!$("res").hidden) { ler(); TJ.salvar(S); $("prev").innerHTML = paginas(!TJ.unlocked); } };
    $("btnCalc").onclick = calcular; $("btnPay").onclick = comprar;
    $("btnPrint").onclick = function () { if (!TJ.unlocked) { comprar(); return; } ler(); render(); TJ.track("imprimiu"); setTimeout(function () { window.print(); }, 300); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { modelo("brigadeiro"); $("fAtelie").value = "Doces da Ju"; $("fContato").value = "@docesdaju"; calcular(); };
  init();
})();

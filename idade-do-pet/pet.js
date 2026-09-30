/* Idade do Pet — motor M1: calculadora grátis → certidão A4 paga. Dados e foto ficam só no aparelho (localStorage + IndexedDB). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var RACAS = [["srd-p", "Sem raça definida (pequeno)", "p"], ["srd-m", "Sem raça definida (médio)", "m"], ["srd-g", "Sem raça definida (grande)", "g"],
    ["shih-tzu", "Shih Tzu", "p"], ["yorkshire", "Yorkshire", "p"], ["poodle", "Poodle (toy/mini)", "p"], ["lhasa", "Lhasa Apso", "p"], ["pinscher", "Pinscher", "p"],
    ["spitz", "Spitz Alemão (Lulu)", "p"], ["maltes", "Maltês", "p"], ["chihuahua", "Chihuahua", "p"], ["dachshund", "Dachshund (Salsicha)", "p"], ["pug", "Pug", "p"],
    ["bulldog-frances", "Bulldog Francês", "p"], ["jack-russell", "Jack Russell", "p"], ["beagle", "Beagle", "m"], ["cocker", "Cocker Spaniel", "m"],
    ["border-collie", "Border Collie", "m"], ["bulldog-ingles", "Bulldog Inglês", "m"], ["schnauzer", "Schnauzer", "m"], ["basset", "Basset Hound", "m"],
    ["pitbull", "Pit Bull", "m"], ["golden", "Golden Retriever", "g"], ["labrador", "Labrador", "g"], ["pastor-alemao", "Pastor Alemão", "g"],
    ["husky", "Husky Siberiano", "g"], ["boxer", "Boxer", "g"], ["rottweiler", "Rottweiler", "g"], ["dalmata", "Dálmata", "g"], ["doberman", "Dobermann", "g"],
    ["akita", "Akita", "g"], ["chow-chow", "Chow Chow", "m"], ["dogue-alemao", "Dogue Alemão", "gg"], ["sao-bernardo", "São Bernardo", "gg"],
    ["mastiff", "Mastiff", "gg"], ["fila", "Fila Brasileiro", "gg"], ["terra-nova", "Terra-Nova", "gg"]];
  var TAXA = { p: 4, m: 5, g: 6, gg: 7, gato: 4 };
  var NPORTE = { p: "pequeno", m: "médio", g: "grande", gg: "gigante" };
  var S = { esp: "cao", nome: "", anos: "", meses: "", raca: "srd-m", porte: "m", tutor: "", est: "classico" }, FOTO = null, pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* ---------- cálculo ---------- */
  function humana(idade, porte) {
    if (idade <= 0) return 0;
    if (idade < 1) return idade * 15;
    if (idade < 2) return 15 + (idade - 1) * 9;
    return 24 + (idade - 2) * TAXA[porte];
  }
  function dna(idade) { return idade >= 0.25 ? Math.max(0, 16 * Math.log(idade) + 31) : null; }
  function fase(h, esp) {
    if (h < 12) return ["Filhote 🍼", "Fase de dentes, vacinas e muita energia."];
    if (h < 20) return ["Adolescente 🛹", "Testando limites — paciência e treino curto todo dia."];
    if (h < 40) return ["Adulto jovem 💪", "Auge da energia. Mantenha o peso e os passeios em dia."];
    if (h < 56) return ["Adulto maduro 😎", "Hora de check-up anual e atenção aos dentes."];
    if (h < 72) return ["Sênior 🧓", "Check-up a cada 6 meses, articulações e dieta sênior."];
    return ["Vovô de respeito 👑", "Muito carinho, conforto e visitas regulares ao veterinário."];
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
  function porteAtual() { return S.esp === "gato" ? "gato" : S.porte; }
  function idade() { var a = parseFloat(S.anos) || 0, m = parseFloat(S.meses) || 0; return a + m / 12; }
  function ler() { S.nome = $("fNome").value.trim(); S.anos = $("fAnos").value; S.meses = $("fMeses").value; S.raca = $("fRaca").value; S.tutor = $("fTutor").value.trim(); }
  /* ---------- foto (IndexedDB, chave = slug) ---------- */
  function idb() { return new Promise(function (ok, no) { var r = indexedDB.open("tj_fotos", 1); r.onupgradeneeded = function () { r.result.createObjectStore("f"); }; r.onsuccess = function () { ok(r.result); }; r.onerror = no; }); }
  function fotoPut(k, v) { return idb().then(function (db) { return new Promise(function (ok) { var t = db.transaction("f", "readwrite"); t.objectStore("f").put(v, k); t.oncomplete = ok; t.onerror = ok; }); }).catch(function () {}); }
  function fotoGet(k) { return idb().then(function (db) { return new Promise(function (ok) { var q = db.transaction("f").objectStore("f").get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; }); }).catch(function () { return null; }); }
  function reduz(file) {
    return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () {
      var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k;
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", 0.85)); }; im.src = fr.result; }; fr.readAsDataURL(file); });
  }
  /* ---------- render ---------- */
  function cert(marca) {
    var i = idade(), p = porteAtual(), h = Math.round(humana(i, p)), f = fase(h, S.esp), gato = S.esp === "gato";
    var nome = S.nome || (gato ? "Mingau" : "Paçoca"), rn = gato ? "Gato" : (RACAS.filter(function (r) { return r[0] === S.raca; })[0] || ["", "SRD"])[1];
    var ida = (Math.floor(i) ? Math.floor(i) + (Math.floor(i) > 1 ? " anos" : " ano") : "") + (Math.round((i % 1) * 12) ? (Math.floor(i) ? " e " : "") + Math.round((i % 1) * 12) + " meses" : "");
    var pw = S.est !== "classico" ? [[6, 8], [82, 5], [4, 60], [86, 52], [10, 88], [80, 90]].map(function (x) { return '<span class="pw" style="left:' + x[0] + "cqw;top:" + x[1] + '%">' + (S.est === "festa" ? "🎉" : "🐾") + "</span>"; }).join("") : "";
    var hoje = new Date().toLocaleDateString("pt-BR");
    return (marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "") + pw + '<div class="in">' +
      '<div class="ti">Certidão de Idade Humana</div><div class="su">' + (gato ? "felina" : "canina") + " · oficialmente fofa</div>" +
      '<div class="ft">' + (FOTO ? '<img alt="" src="' + FOTO + '">' : (gato ? "🐱" : "🐶")) + "</div>" +
      '<div class="nm">' + esc(nome) + '</div><div class="tx">com ' + esc(ida || "poucos dias") + " de vida " + (gato ? "de gato" : "de cachorro") + ", tem o equivalente a</div>" +
      '<div class="hb">' + h + "<small>anos humanos</small></div>" +
      '<div class="dd"><div><b>' + (gato ? "Espécie" : "Raça") + "</b>" + esc(rn) + "</div><div><b>Porte</b>" + (gato ? "felino" : NPORTE[p]) + "</div><div><b>Fase da vida</b>" + f[0] + "</div><div><b>Tutor(a)</b>" + esc(S.tutor || "—") + "</div></div>" +
      '<div class="fr">“' + frase(h, gato) + '”</div><div class="rp">Emitida em ' + hoje + " · lembrança divertida, sem valor oficial</div></div>";
  }
  function frase(h, gato) {
    if (h < 16) return "Declaramos, para os devidos fins, que ainda é um bebê e merece todos os mimos.";
    if (h < 40) return gato ? "Dono da casa, do sofá e do seu coração — nessa ordem." : "Cheio de energia, dono do sofá e do nosso coração.";
    if (h < 60) return "Na melhor idade: sabe o que quer, principalmente se for petisco.";
    return "Cada fio branco é um ano de amor incondicional. Respeitem o(a) veterano(a)!";
  }
  function render() {
    var pago = TJ.unlocked, i = idade(), p = porteAtual(), h = humana(i, p), f = fase(h), gato = S.esp === "gato";
    document.body.classList.toggle("unlocked", pago);
    $("rTopo").textContent = (S.nome || (gato ? "Seu gato" : "Seu cachorro")) + " tem";
    $("rHum").textContent = fmt(h);
    $("rFase").textContent = f[0] + " — " + f[1];
    var d = dna(i); $("rCien").textContent = d != null && !gato ? fmt(d) + " anos" : "–";
    $("rProx").textContent = fmt(humana(Math.floor(i) + 1, p)) + " anos"; $("rProxL").textContent = "no aniversário de " + (Math.floor(i) + 1) + (Math.floor(i) + 1 > 1 ? " anos" : " ano");
    $("rDica").textContent = gato ? "Gatos: depois dos 2 anos, cada ano vale ~4 anos humanos (a raça quase não muda a conta)." : "Porte " + NPORTE[p] + ": depois dos 2 anos, cada ano vale ~" + TAXA[p] + " anos humanos.";
    $("cert").className = "ct " + S.est; $("cert").innerHTML = cert(!pago);
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function segs() {
    document.querySelectorAll("[data-esp]").forEach(function (b) { b.classList.toggle("on", b.dataset.esp === S.esp); });
    document.querySelectorAll("[data-porte]").forEach(function (b) { b.classList.toggle("on", b.dataset.porte === S.porte); });
    document.querySelectorAll("[data-est]").forEach(function (b) { b.classList.toggle("on", b.dataset.est === S.est); });
    $("boxRaca").hidden = $("boxPorte").hidden = S.esp === "gato";
  }
  function calcular() {
    ler(); if (!(idade() > 0)) { TJ.toast("Coloque a idade (anos e/ou meses) 🙂"); return; }
    TJ.garanteSlug(); TJ.salvar(S); if (FOTO) fotoPut(TJ.slug, FOTO); render();
    TJ.track("calculou", { e: S.esp, p: porteAtual(), i: Math.round(idade()) });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S); if (FOTO) await fotoPut(TJ.slug, FOTO);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🐾 Liberar a certidão — R$9,90"; }, 2500);
  }
  function tabela() {
    $("tabRef").innerHTML = [1, 2, 3, 5, 7, 10, 12, 15].map(function (a) { return "<tr><td>" + a + (a > 1 ? " anos" : " ano") + "</td>" + ["p", "m", "g", "gg", "gato"].map(function (p) { return "<td>" + humana(a, p) + "</td>"; }).join("") + "</tr>"; }).join("");
  }
  async function init() {
    tabela();
    $("fRaca").innerHTML = RACAS.map(function (r) { return '<option value="' + r[0] + '">' + r[1] + "</option>"; }).join("");
    var q = new URLSearchParams(location.search); if (q.get("esp") === "gato") S.esp = "gato";
    if (q.get("porte") && NPORTE[q.get("porte")]) { S.porte = q.get("porte"); S.raca = { p: "srd-p", m: "srd-m", g: "srd-g", gg: "dogue-alemao" }[S.porte]; }
    if (q.get("raca")) { var rr = RACAS.filter(function (r) { return r[0] === q.get("raca"); })[0]; if (rr) { S.raca = rr[0]; S.porte = rr[2]; } }
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    if (TJ.slug) FOTO = await fotoGet(TJ.slug);
    $("fNome").value = S.nome; $("fAnos").value = S.anos; $("fMeses").value = S.meses; $("fRaca").value = S.raca; $("fTutor").value = S.tutor; segs();
    document.querySelectorAll("[data-esp]").forEach(function (b) { b.onclick = function () { S.esp = b.dataset.esp; segs(); }; });
    document.querySelectorAll("[data-porte]").forEach(function (b) { b.onclick = function () { S.porte = b.dataset.porte; S.raca = "srd-" + (S.porte === "gg" ? "g" : S.porte); $("fRaca").value = S.raca; segs(); }; });
    document.querySelectorAll("[data-est]").forEach(function (b) { b.onclick = function () { S.est = b.dataset.est; segs(); ler(); TJ.salvar(S); render(); }; });
    $("fRaca").onchange = function () { var r = RACAS.filter(function (x) { return x[0] === $("fRaca").value; })[0]; if (r) { S.porte = r[2]; segs(); } };
    $("fNasc").onchange = function () { var n = new Date($("fNasc").value + "T12:00"); if (isNaN(n)) return; var m = (new Date() - n) / (864e5 * 30.4375); if (m < 0) return; $("fAnos").value = Math.floor(m / 12); $("fMeses").value = Math.floor(m % 12); };
    $("fTutor").oninput = $("fNome").oninput = function () { if (!$("res").hidden) { ler(); render(); } };
    $("fFoto").onchange = async function () { var f = this.files[0]; if (!f) return; FOTO = await reduz(f); if (TJ.slug) fotoPut(TJ.slug, FOTO); if (!$("res").hidden) render(); TJ.toast("Foto adicionada 📷"); };
    $("btnCalc").onclick = calcular; $("btnPay").onclick = comprar;
    $("btnPrint").onclick = function () { if (!TJ.unlocked) { comprar(); return; } ler(); render(); TJ.track("imprimiu"); setTimeout(function () { window.print(); }, 300); };
    $("btnShare").onclick = function () { ler(); var g = S.esp === "gato"; TJ.share((S.nome || (g ? "Meu gato" : "Meu cachorro")) + " tem " + fmt(humana(idade(), porteAtual())) + " anos em idade humana 😱 Calcula a do seu:"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d && idade() > 0) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberada! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNome").value = "Paçoca"; $("fAnos").value = "7"; $("fMeses").value = "4"; $("fRaca").value = "golden"; $("fRaca").onchange(); calcular(); };
  init();
})();

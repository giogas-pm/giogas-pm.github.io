/* Tempo de Namoro — motor M1: contador grátis → quadro A4 pago. Dados e foto só no aparelho. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var S = { n1: "", n2: "", data: "", hora: "", tipo: "namoro", frase: "", est: "romantico" }, FOTO = null, pwSeen = false, tick = null;
  var ROT = { namoro: ["de namoro", "namorando"], casados: ["de casados", "casados"], juntos: ["juntos", "juntos"] };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function n(x) { return Math.floor(x).toLocaleString("pt-BR"); }
  function ini() { return new Date(S.data + "T" + (S.hora || "00:00") + ":00"); }
  function diaMes(y, m, d) { var ult = new Date(y, m + 1, 0).getDate(); return new Date(y, m, Math.min(d, ult)); }
  function ymd(a, b) {
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return [y, m, d];
  }
  function plural(v, s, p) { return v + " " + (v === 1 ? s : p); }
  function txtYmd(t) { var p = []; if (t[0]) p.push(plural(t[0], "ano", "anos")); if (t[1]) p.push(plural(t[1], "mês", "meses")); if (t[2] || !p.length) p.push(plural(t[2], "dia", "dias")); return p.length > 1 ? p.slice(0, -1).join(", ") + " e " + p[p.length - 1] : p[0]; }
  function calc() {
    var a = ini(), agora = new Date(), ms = agora - a, dias = Math.floor(ms / 864e5), t = ymd(a, agora);
    var totM = t[0] * 12 + t[1], prox = diaMes(a.getFullYear(), a.getMonth() + totM + 1, a.getDate());
    var marcos = [100, 200, 365, 500, 730, 1000, 1500, 2000, 2500, 3000, 3650, 4000, 5000, 7300, 10000, 15000], mc = marcos.filter(function (x) { return x > dias; })[0] || (Math.floor(dias / 1000) + 1) * 1000;
    return { a: a, ms: ms, dias: dias, t: t, totM: totM, prox: prox, dProx: Math.ceil((prox - new Date(agora.toDateString())) / 864e5), mc: mc, dataMc: new Date(a.getTime() + mc * 864e5) };
  }
  function ler() { S.n1 = $("fN1").value.trim(); S.n2 = $("fN2").value.trim(); S.data = $("fData").value; S.hora = $("fHora").value; S.frase = $("fFrase").value.trim(); }
  /* foto: IndexedDB (chave = slug) — sobrevive à ida ao Mercado Pago */
  function idb() { return new Promise(function (ok, no) { var r = indexedDB.open("tj_fotos", 1); r.onupgradeneeded = function () { r.result.createObjectStore("f"); }; r.onsuccess = function () { ok(r.result); }; r.onerror = no; }); }
  function fotoPut(k, v) { return idb().then(function (db) { return new Promise(function (ok) { var t = db.transaction("f", "readwrite"); t.objectStore("f").put(v, k); t.oncomplete = ok; t.onerror = ok; }); }).catch(function () {}); }
  function fotoGet(k) { return idb().then(function (db) { return new Promise(function (ok) { var q = db.transaction("f").objectStore("f").get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; }); }).catch(function () { return null; }); }
  function reduz(file) { return new Promise(function (ok) { var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 1200 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", 0.85)); }; im.src = fr.result; }; fr.readAsDataURL(file); }); }
  function quadro(marca) {
    var r = calc(), a = r.a;
    return (marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "") + '<div class="in">' +
      '<div class="ey">nossa história em números</div><div class="nm">' + esc(S.n1 || "Você") + "<i>&amp;</i>" + esc(S.n2 || "Amor") + "</div>" +
      '<div class="dt">' + ROT[S.tipo][1] + " desde " + a.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) + "</div>" +
      '<div class="ft">' + (FOTO ? '<img alt="" src="' + FOTO + '">' : "💞") + "</div>" +
      '<div class="big">' + n(r.dias) + '</div><div class="bl">dias ' + ROT[S.tipo][0] + '</div><div class="ymd">' + txtYmd(r.t) + "</div>" +
      '<div class="gr"><div><b>' + n(r.dias / 7) + "</b><span>semanas</span></div><div><b>" + n(r.totM) + "</b><span>meses</span></div><div><b>" + n(r.ms / 36e5) + "</b><span>horas</span></div><div><b>" + n(r.ms / 6e4) + "</b><span>minutos</span></div></div>" +
      '<div class="fr">' + esc(S.frase || "E o melhor ainda está por vir.") + '</div><div class="rp">contado em ' + new Date().toLocaleDateString("pt-BR") + "</div></div>";
  }
  function numeros() {
    var r = calc(); if (!(r.ms > 0)) return;
    $("rSeg").textContent = n(r.ms / 1000); $("rMin").textContent = n(r.ms / 6e4); $("rHor").textContent = n(r.ms / 36e5);
  }
  function render() {
    var pago = TJ.unlocked, r = calc();
    document.body.classList.toggle("unlocked", pago);
    $("rTopo").textContent = (S.n1 && S.n2 ? S.n1 + " e " + S.n2 + " estão " : "Vocês estão ") + ROT[S.tipo][1] + " há";
    $("rYmd").textContent = txtYmd(r.t); $("rDias").textContent = n(r.dias); $("rSem").textContent = n(r.dias / 7); $("rMes").textContent = n(r.totM);
    numeros(); clearInterval(tick); tick = setInterval(numeros, 1000);
    $("pMes").textContent = r.dProx === 0 ? "É hoje! 🎉" : r.dProx === 1 ? "amanhã" : "em " + r.dProx + " dias";
    $("pMesL").textContent = (r.totM + 1) % 12 === 0 ? (r.totM + 1) / 12 + "º aniversário · " + r.prox.toLocaleDateString("pt-BR") : (r.totM + 1) + "º mesversário · " + r.prox.toLocaleDateString("pt-BR");
    $("pMarco").textContent = n(r.mc) + " dias"; $("pMarcoL").textContent = "em " + r.dataMc.toLocaleDateString("pt-BR");
    $("cert").className = "ct " + S.est; $("cert").innerHTML = quadro(!pago);
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
  }
  function segs() {
    document.querySelectorAll("[data-tipo]").forEach(function (b) { b.classList.toggle("on", b.dataset.tipo === S.tipo); });
    document.querySelectorAll("[data-est]").forEach(function (b) { b.classList.toggle("on", b.dataset.est === S.est); });
  }
  function valida() { if (!S.data || isNaN(ini()) || ini() > new Date()) { TJ.toast("Coloque a data em que começaram (no passado) 🙂"); return false; } return true; }
  function calcular() {
    ler(); if (!valida()) return;
    TJ.garanteSlug(); TJ.salvar(S); if (FOTO) fotoPut(TJ.slug, FOTO); render();
    TJ.track("calculou", { t: S.tipo, d: calc().dias });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function comprar() {
    ler(); if (!valida()) return; TJ.garanteSlug(); TJ.salvar(S); if (FOTO) await fotoPut(TJ.slug, FOTO);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) render(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "💞 Liberar o quadro — R$9,90"; }, 2500);
  }
  async function init() {
    var d = TJ.carregar(); if (d) S = Object.assign(S, d);
    if (TJ.slug) FOTO = await fotoGet(TJ.slug);
    $("fN1").value = S.n1; $("fN2").value = S.n2; $("fData").value = S.data; $("fHora").value = S.hora; $("fFrase").value = S.frase; segs();
    $("fData").max = new Date().toISOString().slice(0, 10);
    document.querySelectorAll("[data-tipo]").forEach(function (b) { b.onclick = function () { S.tipo = b.dataset.tipo; segs(); if (!$("res").hidden) { ler(); render(); } }; });
    document.querySelectorAll("[data-est]").forEach(function (b) { b.onclick = function () { S.est = b.dataset.est; segs(); ler(); TJ.salvar(S); render(); }; });
    $("fFrase").oninput = function () { if (!$("res").hidden) { ler(); render(); } };
    $("fFoto").onchange = async function () { var f = this.files[0]; if (!f) return; FOTO = await reduz(f); if (TJ.slug) fotoPut(TJ.slug, FOTO); if (!$("res").hidden) render(); TJ.toast("Foto adicionada 📷"); };
    $("btnCalc").onclick = calcular; $("btnPay").onclick = comprar;
    $("btnPrint").onclick = function () { if (!TJ.unlocked) { comprar(); return; } ler(); render(); TJ.track("imprimiu"); setTimeout(function () { window.print(); }, 300); };
    $("btnShare").onclick = function () { ler(); var r = calc(); TJ.share("Já são " + n(r.dias) + " dias " + ROT[S.tipo][0] + " 💞 (" + txtYmd(r.t) + "). Calcula o de vocês:"); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (d && S.data) render();
    TJ.retorno(function () { ler(); render(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir / salvar PDF”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fN1").value = "Ana"; $("fN2").value = "Leo"; $("fData").value = "2023-02-14"; $("fHora").value = "20:30"; calcular(); };
  init();
})();

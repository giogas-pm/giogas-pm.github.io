/* Amigo Secreto — sorteio 100% no aparelho; cada resultado vai embaralhado dentro do link da pessoa (#s=...).
   Servidor não guarda sorteio nem nomes. Pago (R$9,90): etiquetas/cartões imprimíveis sem marca. */
(function () {
  /* ===== PONTO ÚNICO DE AFILIADO =====
     Vazio = link de busca normal. Quando o cadastro sair, preencha com o modelo do link de afiliado,
     usando {URL} (URL da busca, já codificada) — ex.: "https://s.shopee.com.br/an_redir?origin_link={URL}&affiliate_id=SEU_ID". */
  var AFILIADO_SHOPEE = "";
  var AFILIADO_ML = "";
  function linkShopee(q) { var u = "https://shopee.com.br/search?keyword=" + encodeURIComponent(q); return AFILIADO_SHOPEE ? AFILIADO_SHOPEE.replace("{URL}", encodeURIComponent(u)) : u; }
  function linkML(q) { var u = "https://lista.mercadolivre.com.br/" + encodeURIComponent(q.replace(/\s+/g, "-")); return AFILIADO_ML ? AFILIADO_ML.replace("{URL}", encodeURIComponent(u)) : u; }
  var IDEIAS = [[30, "Caneca divertida", "caneca divertida presente"], [30, "Meias estampadas", "meias divertidas kit"], [30, "Chocolate especial", "caixa de chocolate presente"], [30, "Chaveiro / porta-cartão", "porta cartão couro"],
    [50, "Garrafa térmica", "garrafa térmica inox"], [50, "Livro", "livro mais vendido"], [50, "Kit skincare", "kit skincare presente"], [50, "Luminária LED", "luminária led decorativa"], [50, "Jogo de cartas", "jogo de cartas para grupo"],
    [80, "Fone bluetooth", "fone de ouvido bluetooth"], [80, "Kit de vinho", "kit vinho taças presente"], [80, "Carregador portátil", "power bank 10000mah"], [80, "Planta + vaso", "vaso autoirrigável planta"],
    [100, "Caixa de som bluetooth", "caixa de som bluetooth"], [100, "Perfume", "perfume presente"], [100, "Smartwatch simples", "smartwatch"], [150, "Air fryer compacta", "air fryer 3 litros"], [150, "Mochila", "mochila notebook"], [200, "Cafeteira", "cafeteira expresso"], [200, "Echo / assistente", "alexa echo pop"]];
  var $ = function (id) { return document.getElementById(id); };
  var S = { grupo: "Amigo secreto da família", nomes: "", rest: "", valor: "50", data: "2026-12-24", links: null, env: {} };
  var pwSeen = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* codifica: JSON -> bytes -> XOR com chave aleatória de 4 bytes -> base64url (não é cofre, é pra ninguém "ler de olho") */
  function enc(o) {
    var b = new TextEncoder().encode(JSON.stringify(o)), k = crypto.getRandomValues(new Uint8Array(4)), out = new Uint8Array(b.length + 4);
    out.set(k); for (var i = 0; i < b.length; i++) out[i + 4] = b[i] ^ k[i % 4] ^ ((i * 29) & 255);
    var s = ""; out.forEach(function (x) { s += String.fromCharCode(x); });
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function dec(t) {
    try { var s = atob(t.replace(/-/g, "+").replace(/_/g, "/")), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
      var k = a.slice(0, 4), b = new Uint8Array(a.length - 4); for (var j = 0; j < b.length; j++) b[j] = a[j + 4] ^ k[j % 4] ^ ((j * 29) & 255);
      return JSON.parse(new TextDecoder().decode(b)); } catch (_) { return null; }
  }
  function nomes() { var vis = {}; return S.nomes.split(/\n|,|;/).map(function (x) { return x.trim().slice(0, 40); }).filter(function (x) { var k = x.toLowerCase(); if (!x || vis[k]) return false; vis[k] = 1; return true; }).slice(0, 60); }
  function restr(ns) {
    var idx = {}; ns.forEach(function (n, i) { idx[n.toLowerCase()] = i; }); var r = {};
    S.rest.split("\n").forEach(function (l) { var p = l.split(/\s+e\s+|,|\+|\/|&/i).map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
      if (p.length >= 2 && p[0] in idx && p[1] in idx) { r[idx[p[0]] + ":" + idx[p[1]]] = 1; r[idx[p[1]] + ":" + idx[p[0]]] = 1; } });
    return r;
  }
  function sortear(ns) {
    var r = restr(ns), n = ns.length;
    for (var t = 0; t < 30000; t++) {
      var p = ns.map(function (_, i) { return i; });
      for (var i = n - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = p[i]; p[i] = p[j]; p[j] = x; }
      var ok = true; for (var a = 0; a < n && ok; a++) if (p[a] === a || r[a + ":" + p[a]]) ok = false;
      if (ok) return p;
    }
    return null;
  }
  function fmtData(d) { if (!d) return ""; var p = d.split("-"); return p.length === 3 ? p[2] + "/" + p[1] : d; }
  function ler() { S.grupo = ($("fGrupo").value.trim() || "Amigo secreto").slice(0, 50); S.nomes = $("fNomes").value.slice(0, 3000); S.rest = $("fRest").value.slice(0, 1500); S.valor = $("fValor").value; S.data = $("fData").value; }
  function contar() { var n = nomes().length; $("nCont").textContent = n ? n + " participante" + (n > 1 ? "s" : "") : ""; }
  function base() { return location.origin + location.pathname; }
  function renderLinks() {
    $("linksP").innerHTML = S.links.map(function (l, i) {
      return '<div class="lp' + (S.env[i] ? " env" : "") + '"><b>' + esc(l.n) + '</b><button class="btn btn-pri" data-w="' + i + '">WhatsApp</button><button class="btn btn-sec" data-c="' + i + '">Copiar</button></div>';
    }).join("");
    $("linksP").querySelectorAll("[data-w]").forEach(function (b) { b.onclick = function () { var l = S.links[+b.dataset.w]; S.env[b.dataset.w] = 1; TJ.salvar(S); b.parentNode.classList.add("env");
      window.open("https://wa.me/?text=" + encodeURIComponent("🎁 " + S.grupo + "\nOi, " + l.n + "! Seu amigo secreto já foi sorteado. Abra o seu link (é só seu, não repasse):\n" + l.u), "_blank"); }; });
    $("linksP").querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { var l = S.links[+b.dataset.c]; try { navigator.clipboard.writeText(l.u); TJ.toast("Link de " + l.n + " copiado"); } catch (_) { prompt("Copie o link:", l.u); } }; });
  }
  function tagsHTML(ns, marca) {
    var wm = marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "";
    var h = ns.map(function (n) { return '<div class="tag">' + wm + '<div class="tg">Para</div><div class="tp">' + esc(n) + '</div><div class="td">De: seu amigo secreto 🤫<br><small>' + esc(S.grupo) + "</small></div></div>"; }).join("");
    return h;
  }
  function cartoesHTML(ns, marca) {
    var wm = marca ? '<div class="wm" data-qa="marca"><span>PRÉVIA</span></div>' : "";
    return ns.map(function () { return '<div class="tag cart">' + wm + '<div class="tg">' + esc(S.grupo) + '</div><div class="tp">Meu amigo secreto é…</div><div class="td">Pista 1:</div><div class="ln"></div><div class="td">Pista 2:</div><div class="ln"></div><div class="td">Pista 3:</div><div class="ln"></div></div>'; }).join("");
  }
  function renderOrg() {
    var pago = TJ.unlocked, ns = nomes(); document.body.classList.toggle("unlocked", pago);
    $("prev").innerHTML = tagsHTML(ns.slice(0, pago ? 60 : 4), !pago) + cartoesHTML(ns.slice(0, 1), !pago);
    $("res").hidden = false; $("zPay").hidden = pago; $("zPago").hidden = !pago;
    if (S.links) renderLinks(); else $("linksP").innerHTML = '<p class="hint">Faça o sorteio acima pra gerar os links.</p>';
  }
  function sortearClick() {
    ler(); var ns = nomes();
    if (ns.length < 3) { TJ.toast("Coloque pelo menos 3 participantes 🙂"); return; }
    var p = sortear(ns);
    if (!p) { TJ.toast("Com essas restrições não tem sorteio possível. Tire algum par e tente de novo."); return; }
    var info = { g: S.grupo, v: S.valor, d: S.data };
    S.links = ns.map(function (n, i) { return { n: n, u: base() + "#s=" + enc({ g: info.g, v: info.v, d: info.d, n: n, t: ns[p[i]] }) }; });
    S.env = {}; TJ.garanteSlug(); TJ.salvar(S); renderOrg();
    TJ.track("sorteou", { n: ns.length, r: S.rest.trim() ? 1 : 0, v: S.valor });
    $("res").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function imprimir() {
    if (!TJ.unlocked) { comprar(); return; }
    ler(); var ns = nomes(); if (!ns.length) { TJ.toast("Coloque os nomes primeiro"); return; }
    $("printArea").innerHTML = '<div class="tags">' + tagsHTML(ns, false) + '</div><div class="tags pb">' + cartoesHTML(ns, false) + "</div>";
    TJ.track("imprimiu", { n: ns.length }); setTimeout(function () { window.print(); }, 150);
  }
  async function comprar() {
    ler(); TJ.garanteSlug(); TJ.salvar(S);
    var b = $("btnPay"); b.disabled = true; b.textContent = "Abrindo pagamento…";
    try { var j = await TJ.checkout(); if (j && j.ja_pago) renderOrg(); else if (!j || !j.ok) TJ.toast("Pagamento indisponível agora 😬 tente em instantes"); }
    catch (_) { TJ.toast("Pagamento indisponível agora 😬"); }
    setTimeout(function () { b.disabled = false; b.textContent = "🎁 Liberar para imprimir — R$9,90"; }, 2500);
  }
  function ideias(v) {
    var lim = +v || 100, l = IDEIAS.filter(function (x) { return x[0] <= lim && x[0] >= Math.min(lim * 0.5, 100) - 1; });
    if (l.length < 6) l = IDEIAS.filter(function (x) { return x[0] <= lim; }).slice(-8);
    return l.slice(0, 8).map(function (x) { return '<a target="_blank" rel="nofollow sponsored noopener" data-loja="shopee" href="' + esc(linkShopee(x[2])) + '">' + esc(x[1]) + "<small>ver na Shopee</small></a>"; }).join("");
  }
  function lojaTrack(root) { root.querySelectorAll("a[data-loja]").forEach(function (a) { a.addEventListener("click", function () { TJ.track("clique_loja", { l: a.dataset.loja }); }); }); }
  /* ===== participante ===== */
  function modoPart(d) {
    document.querySelector(".hero").hidden = true; $("vOrg").hidden = true; $("vPart").hidden = false;
    $("pGrupo").textContent = d.g; $("pOla").textContent = "Oi, " + d.n + "! 🎁";
    $("pInfo").textContent = [d.v ? "Presente de até R$" + d.v : "", d.d ? "Revelação: " + fmtData(d.d) : ""].filter(Boolean).join(" · ");
    TJ.track("abriu_link");
    $("btnRevelar").onclick = function () { $("pCaixa").hidden = true; $("pRes").hidden = false; $("pTirou").textContent = d.t; $("pIdeias").hidden = false; TJ.track("revelou"); };
    $("pFaixa").textContent = d.v ? "até R$" + d.v : ""; $("pIdeiasL").innerHTML = ideias(d.v); lojaTrack($("pIdeiasL"));
    var k = "as_w_" + d.g + "_" + d.n, salvo = []; try { salvo = JSON.parse(localStorage.getItem(k) || "[]"); } catch (_) {}
    var h = ""; for (var i = 0; i < 6; i++) h += '<div class="wIt"><input maxlength="80" placeholder="' + ["Ex.: livro Tudo é rio", "Ex.: fone bluetooth branco", "Ex.: caneca do Corinthians", "", "", ""][i] + '" value="' + esc(salvo[i] || "") + '"></div>';
    $("wIn").innerHTML = h;
    $("btnLista").onclick = function () {
      var it = Array.prototype.map.call($("wIn").querySelectorAll("input"), function (x) { return x.value.trim(); }).filter(Boolean);
      if (!it.length) { TJ.toast("Escreva pelo menos 1 desejo 🙂"); return; }
      try { localStorage.setItem(k, JSON.stringify(it)); } catch (_) {}
      var u = base() + "#w=" + enc({ g: d.g, n: d.n, i: it, v: d.v });
      TJ.track("lista_desejos", { n: it.length });
      TJ.share("🎁 " + d.g + " — minha lista de desejos (" + d.n + "):", u);
    };
  }
  function modoLista(d) {
    document.querySelector(".hero").hidden = true; $("vOrg").hidden = true; $("vLista").hidden = false;
    $("lGrupo").textContent = d.g + (d.v ? " · até R$" + d.v : ""); $("lTit").textContent = "Lista de desejos de " + d.n;
    $("lItens").innerHTML = (d.i || []).slice(0, 6).map(function (x) { return "<li><b>" + esc(x) + '</b><div class="row"><a class="btn btn-pri" target="_blank" rel="nofollow sponsored noopener" data-loja="shopee" href="' + esc(linkShopee(x)) + '">Shopee</a><a class="btn btn-sec" target="_blank" rel="nofollow sponsored noopener" data-loja="ml" href="' + esc(linkML(x)) + '">Mercado Livre</a></div></li>'; }).join("");
    lojaTrack($("lItens")); TJ.track("abriu_lista");
  }
  window.addEventListener("hashchange", function () { if (/#[sw]=/.test(location.hash)) location.reload(); });
  function init() {
    var ms = /#s=([A-Za-z0-9_-]+)/.exec(location.hash), mw = /#w=([A-Za-z0-9_-]+)/.exec(location.hash);
    if (ms) { var d = dec(ms[1]); if (d && d.n && d.t) { modoPart(d); return; } }
    if (mw) { var w = dec(mw[1]); if (w && w.n) { modoLista(w); return; } }
    var s = TJ.carregar(); if (s) S = Object.assign(S, s);
    $("fGrupo").value = S.grupo; $("fNomes").value = S.nomes; $("fRest").value = S.rest; $("fValor").value = S.valor; $("fData").value = S.data; contar();
    $("fNomes").oninput = function () { S.nomes = $("fNomes").value; contar(); };
    $("btnSortear").onclick = sortearClick; $("btnPay").onclick = comprar; $("btnPrint").onclick = imprimir;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !pwSeen && !TJ.unlocked) { pwSeen = true; TJ.track("paywall_view"); } }); }, { threshold: .5 }).observe($("zPay"));
    if (s) renderOrg();
    TJ.retorno(function () { ler(); renderOrg(); $("zPago").scrollIntoView(); TJ.toast("Liberado! 🎉 Toque em “Imprimir etiquetas e cartões”"); });
  }
  window.TJ_QA_PREVIEW = function () { $("fNomes").value = "Ana\nBeto\nCarla\nDuda\nEdu"; $("fRest").value = "Ana e Beto"; S.nomes = $("fNomes").value; sortearClick(); };
  window.TJ_QA_AS = { enc: enc, dec: dec, sortear: sortear, setRest: function (r) { S.rest = r; } };
  init();
})();

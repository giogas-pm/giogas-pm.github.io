/* cal27.js — motor de calendário compartilhado (Calendário 2027, Planner 2027). Feriados nacionais calculados (Páscoa por Meeus). */
(function (w) {
  var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  function pascoa(a) {
    var b = a % 19, c = Math.floor(a / 100), d = a % 100, e = Math.floor(c / 4), f = c % 4, g = Math.floor((c + 8) / 25), h = Math.floor((c - g + 1) / 3),
      i = (19 * b + c - e - h + 15) % 30, k = Math.floor(d / 4), l = d % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((b + 11 * i + 22 * m) / 451),
      mes = Math.floor((i + m - 7 * n + 114) / 31), dia = ((i + m - 7 * n + 114) % 31) + 1;
    return new Date(a, mes - 1, dia);
  }
  function k(d) { return d.getMonth() + "-" + d.getDate(); }
  function mais(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function nDomingo(a, mes, n) { var d = new Date(a, mes, 1); while (d.getDay() !== 0) d.setDate(d.getDate() + 1); return mais(d, 7 * (n - 1)); }
  /* tipo: F = feriado nacional, P = ponto facultativo, C = data comemorativa */
  function feriados(a, comemorativas) {
    var r = {}, p = pascoa(a);
    function add(d, nome, t) { r[k(d)] = { nome: nome, t: t }; }
    [[0, 1, "Confraternização Universal"], [3, 21, "Tiradentes"], [4, 1, "Dia do Trabalho"], [8, 7, "Independência do Brasil"], [9, 12, "Nossa Senhora Aparecida"],
      [10, 2, "Finados"], [10, 15, "Proclamação da República"], [10, 20, "Dia Nacional de Zumbi e da Consciência Negra"], [11, 25, "Natal"]].forEach(function (x) { add(new Date(a, x[0], x[1]), x[2], "F"); });
    add(mais(p, -2), "Sexta-feira Santa", "F");
    add(mais(p, -48), "Carnaval", "P"); add(mais(p, -47), "Carnaval", "P"); add(mais(p, -46), "Quarta-feira de Cinzas", "P"); add(mais(p, 60), "Corpus Christi", "P");
    if (comemorativas) {
      add(p, "Páscoa", "C"); add(nDomingo(a, 4, 2), "Dia das Mães", "C"); add(nDomingo(a, 7, 2), "Dia dos Pais", "C"); add(new Date(a, 5, 12), "Dia dos Namorados", "C");
      add(new Date(a, 11, 24), "Véspera de Natal", "C"); add(new Date(a, 11, 31), "Véspera de Ano-Novo", "C");
    }
    return r;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* datas pessoais: "dd/mm Nome" por linha -> {"m-d":[nomes]} */
  function pessoais(txt) {
    var r = {}; String(txt || "").split("\n").forEach(function (l) { var m = /^\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[-–:]?\s*(.+)$/.exec(l); if (!m) return;
      var d = +m[1], mes = +m[2] - 1; if (mes < 0 || mes > 11 || d < 1 || d > 31) return; var key = mes + "-" + d; (r[key] = r[key] || []).push(m[3].trim().slice(0, 30)); });
    return r;
  }
  /* grade de um mês: seg=true começa na segunda */
  function mesHTML(a, m, o) {
    o = o || {}; var fer = o.fer || {}, pes = o.pes || {}, seg = !!o.seg;
    var cab = seg ? ["S", "T", "Q", "Q", "S", "S", "D"] : ["D", "S", "T", "Q", "Q", "S", "S"];
    if (!o.mini) cab = seg ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    var ini = new Date(a, m, 1).getDay(); if (seg) ini = (ini + 6) % 7;
    var n = new Date(a, m + 1, 0).getDate(), h = '<div class="cg' + (o.mini ? " mini" : "") + '">' + cab.map(function (c, i) { var dom = seg ? i === 6 : i === 0; return '<div class="ch' + (dom ? " dom" : "") + '">' + c + "</div>"; }).join("");
    for (var i = 0; i < ini; i++) h += '<div class="cd vz"></div>';
    for (var d = 1; d <= n; d++) {
      var key = m + "-" + d, f = fer[key], pe = pes[key], dow = new Date(a, m, d).getDay(), cls = "cd" + (dow === 0 ? " dom" : "") + (f ? " f" + f.t : "") + (pe ? " pe" : "");
      h += '<div class="' + cls + '"><b>' + d + "</b>" + (!o.mini ? (f ? "<i>" + esc(f.nome) + "</i>" : "") + (pe ? "<i class=\"ip\">🎂 " + esc(pe.join(", ")) + "</i>" : "") : "") + "</div>";
    }
    var tot = ini + n; while (tot % 7) { h += '<div class="cd vz"></div>'; tot++; }
    return h + "</div>";
  }
  function listaMes(a, m, fer) {
    var l = []; for (var d = 1; d <= 31; d++) { var f = fer[m + "-" + d]; if (f && new Date(a, m, d).getMonth() === m) l.push(("0" + d).slice(-2) + " " + f.nome + (f.t === "P" ? " (ponto facultativo)" : "")); }
    return l;
  }
  w.CAL = { MESES: MESES, pascoa: pascoa, feriados: feriados, pessoais: pessoais, mesHTML: mesHTML, listaMes: listaMes, esc: esc };
})(window);

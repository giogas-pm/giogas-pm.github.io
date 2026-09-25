# -*- coding: utf-8 -*-
"""Hub na raiz giogas-pm.github.io: linka todas as páginas dos apps (descoberta pelo Google) + robots com todos os sitemaps.
Rodar de apps/root-site: python gen_hub.py"""
import re, os, html
APPS = [("murai-repo", "murai", "Muraí — mural de recados coletivo", "Junte o recado de todo mundo num mural só: despedida, aposentadoria, aniversário, professora."),
        ("carta-noel", "carta-noel", "Carta do Noel — resposta do Papai Noel personalizada", "Carta do Papai Noel com o nome da criança, pronta pra imprimir, com certificado de bom comportamento."),
        ("revele", "revele", "Revelê — palpites de chá revelação", "Bolão de palpites menino ou menina pro chá revelação, com revelação na festa."),
        ("album", "album", "Álbum Coletivo — fotos da festa por QR code", "Os convidados mandam as fotos da festa pelo celular, sem app e sem login."),
        ("cha-de-panela", "cha-de-panela", "Kit do Chá — brincadeiras de chá de panela personalizadas", "Bingo com cartelas únicas, quem conhece a noiva, stop e prendas com o nome do casal, prontos pra imprimir."),
        ("bodas", "bodas", "Bodas — calculadora e quadro de bodas", "Descubra as bodas do casal pela data e monte um quadro de bodas pra imprimir.")]
BASE = "https://giogas-pm.github.io/"
def title_of(repo, url):
    rel = url.replace(BASE, "").split("/", 1)[1] if "/" in url.replace(BASE, "") else ""
    f = os.path.join("..", repo, rel, "index.html")
    try:
        t = re.search(r"<title>(.*?)</title>", open(f, encoding="utf-8").read(), re.S).group(1)
        return html.unescape(t.split("|")[0].strip())
    except Exception:
        return url
secs, maps = [], []
for repo, path, name, desc in APPS:
    sm = open(os.path.join("..", repo, "sitemap.xml"), encoding="utf-8").read()
    urls = re.findall(r"<loc>([^<]+)</loc>", sm)
    maps.append(BASE + path + "/sitemap.xml")
    lis = "".join(f'<li><a href="{u}">{html.escape(title_of(repo, u))}</a></li>' for u in urls)
    secs.append(f'<section><h2><a href="{BASE}{path}/">{html.escape(name)}</a></h2><p>{html.escape(desc)}</p><ul>{lis}</ul></section>')
page = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Apps pra celebrar junto — mural, carta do Noel, chá revelação, álbum, chá de panela, bodas</title>
<meta name="description" content="Pequenos apps gratuitos pra celebrar com a família e os amigos: mural de recados coletivo, carta do Papai Noel, palpites de chá revelação, álbum de fotos da festa, brincadeiras de chá de panela e calculadora de bodas.">
<link rel="canonical" href="{BASE}">
<style>body{{font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;padding:24px 16px;color:#2a211b;background:#fff9f0;line-height:1.5}}h1{{font-size:28px}}section{{background:#fff;border:1px solid #eadfce;border-radius:16px;padding:14px 18px;margin:14px 0}}h2{{margin:4px 0}}a{{color:#b3262d}}ul{{columns:2;column-gap:24px;padding-left:18px}}@media(max-width:600px){{ul{{columns:1}}}}</style></head>
<body><h1>Apps pra celebrar junto</h1><p>Ferramentas simples, feitas no Brasil, pra juntar as pessoas nos momentos que importam.</p>{"".join(secs)}</body></html>'''
open("index.html", "w", encoding="utf-8").write(page)
open("robots.txt", "w", encoding="utf-8").write("User-agent: *\nAllow: /\n" + "".join(f"Sitemap: {m}\n" for m in maps))
print("ok", sum(s.count("<li>") for s in secs), "links")

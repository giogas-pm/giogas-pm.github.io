# -*- coding: utf-8 -*-
"""Migra os apps de giogas-pm.github.io pro domínio próprio.
Como funciona no GitHub Pages: o CNAME fica SÓ no repo raiz (giogas-pm.github.io); os projetos (/murai, /carta-noel, ...)
passam a ser servidos em https://DOMINIO/<projeto>/ e o github.io redireciona com 301 sozinho.
Aqui a gente troca as URLs absolutas (canonical, sitemap, og, links, back_urls do Mercado Pago) pra não depender do 301.

Uso (de apps/root-site):  python migrar_dominio.py todosjuntos.com.br          -> dry-run (só lista)
                          python migrar_dominio.py todosjuntos.com.br --aplicar -> escreve, depois: commit/push de cada repo,
                          redeploy das Edge Functions de pagamento, GSC (nova propriedade + sitemaps), gen_hub.py."""
import os, sys
OLD = "https://giogas-pm.github.io/"
REPOS = ["root-site", "murai-repo", "carta-noel", "revele", "album", "cha-de-panela", "bodas"]
FUNCS = [  # SITE/back_urls do Mercado Pago (redeploy depois)
    "mural/supabase/functions/mp-preferencia", "carta-noel/supabase/functions/mp-preferencia-noel",
    "revele/supabase/functions/mp-preferencia-revele", "album/supabase/functions/mp-preferencia-album",
    "cha-de-panela/supabase/functions/mp-preferencia-cha", "bodas/supabase/functions/mp-preferencia-bodas",
    "root-site/supabase/functions/gsc-status"]
EXT = (".html", ".xml", ".txt", ".md", ".ts", ".py", ".json")

def main():
    dom = sys.argv[1].strip().strip("/"); aplicar = "--aplicar" in sys.argv
    new = f"https://{dom}/"; base = os.path.dirname(os.path.abspath(__file__)); apps = os.path.dirname(base)
    alvos = [os.path.join(apps, r) for r in REPOS] + [os.path.join(apps, f) for f in FUNCS]
    total = 0
    for alvo in alvos:
        for raiz, dirs, files in os.walk(alvo):
            dirs[:] = [d for d in dirs if d not in (".git", ".temp", "node_modules")]
            for f in files:
                if not f.endswith(EXT) or f == "migrar_dominio.py":
                    continue
                p = os.path.join(raiz, f)
                s = open(p, encoding="utf-8").read()
                n = s.count(OLD)
                if n:
                    total += n; print(f"{n:4d}  {os.path.relpath(p, apps)}")
                    if aplicar:
                        open(p, "w", encoding="utf-8").write(s.replace(OLD, new))
    if aplicar:
        open(os.path.join(base, "CNAME"), "w").write(dom + "\n")
        print("CNAME escrito no repo raiz:", dom)
    print(("APLICADO" if aplicar else "DRY-RUN"), total, "ocorrências")

if __name__ == "__main__":
    main()

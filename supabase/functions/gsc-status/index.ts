// Status do Google (Search Console) dos apps: páginas indexadas x desconhecidas (amostra do sitemap) + impressões/cliques 28d.
// GET ?k=<METRICS_KEY>. Usa a service account murai-seo (secret GSC_SA). Pra rotina semanal ler sem segredo local.
const KEY = Deno.env.get("METRICS_KEY") || "";
const SA = JSON.parse(Deno.env.get("GSC_SA") || "{}");
const ROOT = "https://giogas-pm.github.io/";
const APPS = ["murai", "carta-noel", "revele", "album"];
function b64u(b: ArrayBuffer | string) {
  const s = typeof b === "string" ? btoa(unescape(encodeURIComponent(b))) : btoa(String.fromCharCode(...new Uint8Array(b)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64u(JSON.stringify({ iss: SA.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const pem = SA.private_key.replace(/-----[^-]+-----|\n/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + b64u(sig) });
  return (await r.json()).access_token;
}
Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (KEY && url.searchParams.get("k") !== KEY) return new Response("nao_autorizado", { status: 401 });
  try {
    const t = await token(); const H = { Authorization: "Bearer " + t, "Content-Type": "application/json" };
    const end = new Date().toISOString().slice(0, 10), start = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);
    const out: Record<string, unknown> = {};
    for (const app of APPS) {
      const sm = await fetch(`${ROOT}${app}/sitemap.xml`).then((r) => r.text()).catch(() => "");
      const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const sample = urls.slice(0, 5); // cota da API de inspeção: amostra, em paralelo
      const sts = await Promise.all(sample.map((u) => fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", { method: "POST", headers: H, body: JSON.stringify({ inspectionUrl: u, siteUrl: ROOT }) })
        .then((r) => r.json()).then((r) => r?.inspectionResult?.indexStatusResult?.coverageState || "?").catch(() => "?")));
      let indexadas = 0; const nao: string[] = [];
      sts.forEach((st, i) => { if (/indexed/i.test(st) && !/not indexed/i.test(st)) indexadas++; else nao.push(sample[i].replace(ROOT, "/") + " (" + st + ")"); });
      const sa = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(ROOT)}/searchAnalytics/query`, { method: "POST", headers: H,
        body: JSON.stringify({ startDate: start, endDate: end, dimensions: ["page"], dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: `/${app}/` }] }], rowLimit: 100 }) }).then((r) => r.json()).catch(() => ({}));
      const rows = sa.rows || [];
      out[app] = { paginas_sitemap: urls.length, amostra: sample.length, indexadas_na_amostra: indexadas,
        impressoes_28d: rows.reduce((a: number, r: any) => a + r.impressions, 0), cliques_28d: rows.reduce((a: number, r: any) => a + r.clicks, 0),
        nao_indexadas: nao.slice(0, 5) };
    }
    return new Response(JSON.stringify({ ok: true, as_of: new Date().toISOString(), apps: out }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { headers: { "Content-Type": "application/json" } });
  }
});

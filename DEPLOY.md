# Deploy Guide: loadouts.info auf Cloudflare Pages

## Voraussetzungen
- GitHub-Repo `loadoutinfotoolhub/loadouts-info-site` mit aktuellem Code
- Cloudflare-Account (loadout.info.toolhub@gmail.com)
- Domain `loadouts.info` mit Cloudflare-Nameservern (bereits konfiguriert)

## Schritt 1: Git Push fixen

Die lokale Git-Konfiguration hat Credentials fuer `kimanabuch-dev` gecacht. Fix:

```bash
# Option A: GCM-Credential loeschen und neu authentifizieren
git credential-manager erase
host=github.com
protocol=https
# (Enter druecken nach der leeren Zeile)

# Dann push erneut versuchen:
cd C:\Users\sinth\projects\loadouts-info
git push origin main
# GCM oeffnet Browser-Login -> mit loadoutinfotoolhub einloggen

# Option B: Personal Access Token verwenden
# 1. https://github.com/settings/tokens -> Generate new token (classic)
# 2. Scopes: repo (Full control)
# 3. Token kopieren
git remote set-url origin https://loadoutinfotoolhub:<TOKEN>@github.com/loadoutinfotoolhub/loadouts-info-site.git
git push origin main
```

## Schritt 2: Cloudflare Pages Setup

1. Gehe zu https://dash.cloudflare.com
2. Login mit `loadout.info.toolhub@gmail.com`
3. Waehle "Workers & Pages" in der linken Sidebar
4. Klicke "Create" -> "Pages" -> "Connect to Git"
5. Autorisiere Cloudflare fuer den GitHub-Account `loadoutinfotoolhub`
6. Waehle Repository: `loadouts-info-site`
7. Build-Einstellungen:
   - **Production branch:** `main`
   - **Framework preset:** `Astro`
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (leer lassen)
   - **Node.js version:** Environment Variable `NODE_VERSION` = `20` setzen

8. Klicke "Save and Deploy"
9. Warte bis der erste Build durchlaeuft (ca. 2-3 Minuten)

## Schritt 3: Custom Domain verbinden

1. In Cloudflare Pages -> dein Projekt -> "Custom domains"
2. Klicke "Set up a custom domain"
3. Gib ein: `loadouts.info`
4. Cloudflare erstellt automatisch den CNAME-Record (da DNS bereits auf Cloudflare)
5. Warte auf SSL-Zertifikat (automatisch, dauert max. 15 Min)
6. Optional: Auch `www.loadouts.info` hinzufuegen (redirected automatisch)

## Schritt 4: Verifizieren

```bash
# Nach Deploy:
curl -I https://loadouts.info          # Sollte 200 oder 301->de/ sein
curl -I https://loadouts.info/de/      # Sollte 200 sein
curl https://loadouts.info/robots.txt  # Sollte robots.txt anzeigen
curl https://loadouts.info/llms.txt    # Sollte llms.txt anzeigen
```

## Schritt 5: Environment Variables (optional)

Falls spaeter benoetigt (z.B. Analytics-Keys):
1. Cloudflare Pages -> Settings -> Environment variables
2. Production und Preview getrennt konfigurierbar

## Automatische Deploys

Nach diesem Setup deployed Cloudflare automatisch bei jedem `git push origin main`. Kein manueller Deploy noetig.

## Troubleshooting

| Problem | Loesung |
|---------|---------|
| Build failed | Cloudflare Pages -> Deployments -> Klick auf fehlgeschlagenen Deploy -> Build-Logs lesen |
| pnpm nicht gefunden | Environment Variable `PNPM_VERSION` = `9` setzen |
| Node-Version falsch | Environment Variable `NODE_VERSION` = `20` setzen |
| 404 auf Pages | Build output directory pruefen (muss `dist` sein) |
| DNS nicht aufgeloest | Nameserver pruefen: muessen auf Cloudflare zeigen |
| SSL-Fehler | Cloudflare SSL/TLS -> Full (strict) waehlen |

/**
 * Source verification script for Initial-Seeding.
 * Fetches official Swiss government pages and verifies SSOT values via regex.
 *
 * Usage: npx tsx scripts/verify-sources.ts
 *
 * Output: Verification report with green/yellow/red status per value.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface SourcedValue {
  value: number;
  source: {
    url: string;
    retrieved: string;
    regex: string;
    expected: string;
    legalBasis?: string;
    displayName: string;
  };
}

interface VerifyResult {
  key: string;
  status: 'gruen' | 'gelb' | 'rot-regex' | 'rot-fetch';
  expected: string;
  found: string | null;
  details: string | null;
}

async function fetchWithRetry(url: string): Promise<{ ok: boolean; html: string; error?: string }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'loadouts-info-bot/1.0 (+https://loadouts.info)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'de-CH,de;q=0.9',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
      if (!res.ok) {
        if (attempt === 0) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return { ok: false, html: '', error: `HTTP ${res.status}` };
      }
      const html = await res.text();
      return { ok: true, html };
    } catch (e: unknown) {
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      return { ok: false, html: '', error: String(e) };
    }
  }
  return { ok: false, html: '', error: 'Max retries reached' };
}

function normalizeNumber(s: string): number | null {
  const cleaned = s.replace(/[''\s]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function extractSourcedValues(obj: unknown, path: string, result: Map<string, SourcedValue>) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const record = obj as Record<string, unknown>;
    if ('value' in record && 'source' in record && typeof record.value === 'number') {
      result.set(path, record as unknown as SourcedValue);
      return;
    }
    for (const [key, val] of Object.entries(record)) {
      if (key !== 'version' && key !== 'effectiveFrom' && key !== 'sources') {
        extractSourcedValues(val, path ? `${path}.${key}` : key, result);
      }
    }
  }
}

async function main() {
  const constantsPath = resolve(process.cwd(), 'src/data/ch-constants/2026.json');
  const raw = JSON.parse(readFileSync(constantsPath, 'utf-8'));

  const values = new Map<string, SourcedValue>();
  extractSourcedValues(raw, '', values);

  console.log(`\n=== Source-Guardian Initial-Seeding Verification ===`);
  console.log(`Total SSOT values to verify: ${values.size}`);
  console.log(`Date: ${new Date().toISOString().split('T')[0]}\n`);

  // Group by URL to respect rate limits
  const byUrl = new Map<string, { key: string; sv: SourcedValue }[]>();
  for (const [key, sv] of values) {
    const url = sv.source.url;
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url)!.push({ key, sv });
  }

  const results: VerifyResult[] = [];
  const fetchedUrls = new Map<string, string>();

  for (const [url, entries] of byUrl) {
    // Rate limit: 1 second between requests
    if (fetchedUrls.size > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Fetching: ${url}`);
    let html: string;

    if (fetchedUrls.has(url)) {
      html = fetchedUrls.get(url)!;
    } else {
      const fetchResult = await fetchWithRetry(url);
      if (!fetchResult.ok) {
        console.log(`  -> FAIL: ${fetchResult.error}`);
        for (const { key, sv } of entries) {
          results.push({
            key,
            status: 'rot-fetch',
            expected: sv.source.expected,
            found: null,
            details: fetchResult.error ?? 'Fetch failed',
          });
        }
        continue;
      }
      html = fetchResult.html;
      fetchedUrls.set(url, html);
      console.log(`  -> OK (${html.length} bytes)`);
    }

    for (const { key, sv } of entries) {
      try {
        const regex = new RegExp(sv.source.regex, 's');
        const match = html.match(regex);

        if (match) {
          const foundRaw = match[1] || match[0];
          const foundNum = normalizeNumber(foundRaw);
          const expectedNum = normalizeNumber(sv.source.expected);

          if (foundNum !== null && expectedNum !== null) {
            const tolerance = sv.value < 1 ? 0.001 : 0;
            if (Math.abs(foundNum - expectedNum) <= tolerance) {
              results.push({
                key,
                status: 'gruen',
                expected: sv.source.expected,
                found: foundRaw,
                details: null,
              });
            } else {
              results.push({
                key,
                status: 'gelb',
                expected: sv.source.expected,
                found: foundRaw,
                details: `Expected ${expectedNum}, found ${foundNum}`,
              });
            }
          } else {
            results.push({
              key,
              status: 'gelb',
              expected: sv.source.expected,
              found: foundRaw,
              details: `Could not normalize: "${foundRaw}"`,
            });
          }
        } else {
          results.push({
            key,
            status: 'rot-regex',
            expected: sv.source.expected,
            found: null,
            details: `Regex "${sv.source.regex}" did not match`,
          });
        }
      } catch (e) {
        results.push({
          key,
          status: 'rot-regex',
          expected: sv.source.expected,
          found: null,
          details: `Regex error: ${e}`,
        });
      }
    }
  }

  // Summary
  console.log(`\n=== VERIFICATION REPORT ===\n`);

  const gruen = results.filter(r => r.status === 'gruen');
  const gelb = results.filter(r => r.status === 'gelb');
  const rotRegex = results.filter(r => r.status === 'rot-regex');
  const rotFetch = results.filter(r => r.status === 'rot-fetch');

  console.log(`GRUEN  (verified):     ${gruen.length}/${results.length}`);
  console.log(`GELB   (mismatch):     ${gelb.length}/${results.length}`);
  console.log(`ROT-REGEX (no match):  ${rotRegex.length}/${results.length}`);
  console.log(`ROT-FETCH (unreachable): ${rotFetch.length}/${results.length}`);

  if (gruen.length > 0) {
    console.log(`\n--- GRUEN ---`);
    for (const r of gruen) {
      console.log(`  [OK] ${r.key}: expected "${r.expected}", found "${r.found}"`);
    }
  }

  if (gelb.length > 0) {
    console.log(`\n--- GELB (requires review) ---`);
    for (const r of gelb) {
      console.log(`  [!!] ${r.key}: ${r.details}`);
    }
  }

  if (rotRegex.length > 0) {
    console.log(`\n--- ROT-REGEX (page structure changed) ---`);
    for (const r of rotRegex) {
      console.log(`  [XX] ${r.key}: ${r.details}`);
    }
  }

  if (rotFetch.length > 0) {
    console.log(`\n--- ROT-FETCH (unreachable) ---`);
    for (const r of rotFetch) {
      console.log(`  [XX] ${r.key}: ${r.details}`);
    }
  }

  console.log(`\n=== END REPORT ===\n`);
}

main().catch(console.error);

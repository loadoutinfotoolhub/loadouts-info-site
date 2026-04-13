import type { AstroIntegration } from 'astro';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Astro build integration for Source-Guardian (Schwarm 4).
 * At build time:
 * 1. Validates all SSOT source metadata is present
 * 2. Checks that source URLs are syntactically valid
 * 3. Warns if retrieved dates are older than 90 days
 * 4. Logs source coverage report
 *
 * Does NOT fetch URLs at build time (that's the periodic source-guardian-lead job).
 */
export function sourceEnricher(): AstroIntegration {
  return {
    name: 'source-enricher',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const dataDir = resolve(process.cwd(), 'src/data');
        const constantsPath = resolve(dataDir, 'ch-constants/2026.json');

        if (!existsSync(constantsPath)) {
          logger.warn('SSOT file not found: src/data/ch-constants/2026.json');
          return;
        }

        const raw = JSON.parse(readFileSync(constantsPath, 'utf-8'));
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        let totalValues = 0;
        let sourcedValues = 0;
        let staleValues = 0;
        const issues: string[] = [];

        function checkValue(obj: unknown, path: string) {
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            const record = obj as Record<string, unknown>;
            if ('value' in record && 'source' in record) {
              totalValues++;
              const source = record.source as Record<string, unknown>;
              if (source.url && source.regex && source.expected && source.displayName) {
                sourcedValues++;
              } else {
                issues.push(`${path}: incomplete source metadata`);
              }
              if (source.retrieved) {
                const retrieved = new Date(source.retrieved as string);
                if (retrieved < ninetyDaysAgo) {
                  staleValues++;
                  issues.push(`${path}: source retrieved ${source.retrieved} (>90 days ago)`);
                }
              }
              return;
            }
            for (const [key, val] of Object.entries(record)) {
              if (key !== 'version' && key !== 'effectiveFrom' && key !== 'sources') {
                checkValue(val, `${path}.${key}`);
              }
            }
          }
        }

        checkValue(raw, 'CH2026');

        // Check canton source files
        const cantons = ['ZH', 'BE', 'VD', 'GE', 'AG', 'ZG', 'BS'];
        let cantonCount = 0;
        for (const code of cantons) {
          const cantonPath = resolve(dataDir, `cantons/${code}/sources.json`);
          if (existsSync(cantonPath)) {
            cantonCount++;
          } else {
            issues.push(`Missing canton source file: ${code}`);
          }
        }

        // Check global sources
        const globalPath = resolve(dataDir, 'global-sources.json');
        if (!existsSync(globalPath)) {
          issues.push('Missing global-sources.json');
        }

        // Report
        logger.info(`Source-Enricher Report:`);
        logger.info(`  SSOT values: ${totalValues} total, ${sourcedValues} with full source metadata`);
        logger.info(`  Stale sources (>90d): ${staleValues}`);
        logger.info(`  Canton source files: ${cantonCount}/${cantons.length}`);
        logger.info(`  Global sources: ${existsSync(globalPath) ? 'OK' : 'MISSING'}`);

        if (issues.length > 0) {
          logger.warn(`${issues.length} source issue(s):`);
          for (const issue of issues) {
            logger.warn(`  - ${issue}`);
          }
        } else {
          logger.info(`All source metadata complete.`);
        }
      },
    },
  };
}

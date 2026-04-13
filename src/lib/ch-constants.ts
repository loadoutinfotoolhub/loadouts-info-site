import raw from '../data/ch-constants/2026.json';
import { chConstantsSchema, type ChConstantsFlat } from '../schemas/ch-constants.schema';

/**
 * Full sourced SSOT data with per-value verification metadata.
 * Used by Source-Guardian (Schwarm 4) and SourceBox component.
 */
export const CH2026Sourced = chConstantsSchema.parse(raw);

/**
 * Recursively extracts .value from sourced number objects.
 * Leaves non-sourced values (strings, top-level sources) untouched.
 */
function flattenSourced(obj: unknown): unknown {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const record = obj as Record<string, unknown>;
    if ('value' in record && 'source' in record && typeof record.value === 'number') {
      return record.value;
    }
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) {
      result[key] = flattenSourced(val);
    }
    return result;
  }
  return obj;
}

/**
 * Typed, validated Swiss finance constants for 2026 (flat values).
 * SSOT: All financial values MUST be accessed through this export.
 * Never hardcode numbers in calculators or components.
 *
 * Usage: CH2026.saeule3a.maxMitPK -> 7258
 */
export const CH2026 = flattenSourced(CH2026Sourced) as ChConstantsFlat;

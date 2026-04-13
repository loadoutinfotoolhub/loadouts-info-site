import raw from '../data/ch-constants/2026.json';
import { chConstantsSchema } from '../schemas/ch-constants.schema';

/**
 * Typed, validated Swiss finance constants for 2026.
 * SSOT: All financial values MUST be accessed through this export.
 * Never hardcode numbers in calculators or components.
 */
export const CH2026 = chConstantsSchema.parse(raw);

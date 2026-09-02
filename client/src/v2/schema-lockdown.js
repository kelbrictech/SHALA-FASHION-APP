/**
 * SHALA V1 SCHEMA — EXTRACTED AND LOCKED FOR 2B FOUNDATION
 * Document ID: SHALA-V2-2B-SCHEMA-LOCKDOWN-001
 * 
 * This file extracts and formalizes the V1 schema enums that 2B validates.
 * Used as reference truth for state-engine validation and test expectations.
 * 
 * Source: client/src/foundation/schema.js (V1 production)
 * Validated by: client/src/v2/state-engine.test.js (19 tests)
 */

/**
 * SHALA Schema Version
 * Tracks schema compatibility across lifecycle phases.
 */
export const SCHEMA_VERSION = 1;

/**
 * DOMAIN PROGRESSION — Immutable Order
 * Product journey follows this exact sequence: CLOTHES → BAGS → SHOES → ACCESSORIES
 * Do not reorder. Do not add new domains in 2B–2E.
 */
export const DOMAINS = Object.freeze([
  "CLOTHES",
  "BAGS",
  "SHOES",
  "ACCESSORIES"
]);

/**
 * CANONICAL POSES — Exactly 10
 * Visual geometry choices for body presentation.
 * Schema-locked; unknown poses rejected by state-engine.
 */
export const POSES = Object.freeze([
  "POSE_01",
  "POSE_02",
  "POSE_03",
  "POSE_04",
  "POSE_05",
  "POSE_06",
  "POSE_07",
  "POSE_08",
  "POSE_09",
  "POSE_10"
]);

/**
 * CANONICAL STUDIOS — Exactly 6
 * Five standard Studios + MY_STUDIO (user-controlled).
 * Schema-locked; unknown Studios rejected by state-engine.
 */
export const STUDIOS = Object.freeze([
  "STUDIO_01",
  "STUDIO_02",
  "STUDIO_03",
  "STUDIO_04",
  "STUDIO_05",
  "MY_STUDIO"
]);

/**
 * BODY OVERRIDE CHOICES — Exactly 7
 * Visual geometry choices for body identity (1–7).
 * Out-of-range values rejected by state-engine.
 * Range: [1, 2, 3, 4, 5, 6, 7]
 */
export const BODY_OVERRIDE_MIN = 1;
export const BODY_OVERRIDE_MAX = 7;

/**
 * SCHEMA VALIDATION HELPER
 * Quick check: is a value in the canonical enum?
 */
export const isValidDomain = (domain) => DOMAINS.includes(domain);
export const isValidPose = (pose) => POSES.includes(pose);
export const isValidStudio = (studio) => STUDIOS.includes(studio);
export const isValidBodyOverride = (index) => 
  Number.isInteger(index) && index >= BODY_OVERRIDE_MIN && index <= BODY_OVERRIDE_MAX;

/**
 * SCHEMA EXPORT FOR REFERENCE
 * JSON-serializable representation of canonical schema.
 * Used by documentation, CI, and cross-coordinate validation.
 */
export const SCHEMA_REFERENCE = Object.freeze({
  version: SCHEMA_VERSION,
  domains: Array.from(DOMAINS),
  poses: Array.from(POSES),
  studios: Array.from(STUDIOS),
  bodyOverride: { min: BODY_OVERRIDE_MIN, max: BODY_OVERRIDE_MAX }
});

/**
 * 2B VALIDATION CONTRACTS
 * Express the frozen schema as testable predicates.
 */
export const SCHEMA_CONTRACTS = Object.freeze({
  domainCount: DOMAINS.length,
  poseCount: POSES.length,
  studioCount: STUDIOS.length,
  bodyOverrideRange: `${BODY_OVERRIDE_MIN}–${BODY_OVERRIDE_MAX}`,
  domainOrder: "CLOTHES → BAGS → SHOES → ACCESSORIES",
  validate: {
    domain: isValidDomain,
    pose: isValidPose,
    studio: isValidStudio,
    bodyOverride: isValidBodyOverride
  }
});

/**
 * SCHEMA INTEGRITY CHECK
 * 2B exit gate: all counts match contract.
 */
export function validateSchemaIntegrity() {
  const checks = {
    domainCountExact4: DOMAINS.length === 4,
    poseCountExact10: POSES.length === 10,
    studioCountExact6: STUDIOS.length === 6,
    domainOrderCorrect: 
      DOMAINS[0] === "CLOTHES" &&
      DOMAINS[1] === "BAGS" &&
      DOMAINS[2] === "SHOES" &&
      DOMAINS[3] === "ACCESSORIES",
    myStudioIncluded: STUDIOS.includes("MY_STUDIO"),
    allFrozen: 
      Object.isFrozen(DOMAINS) &&
      Object.isFrozen(POSES) &&
      Object.isFrozen(STUDIOS)
  };
  
  const passed = Object.values(checks).every(v => v === true);
  return { passed, details: checks };
}

export default {
  SCHEMA_VERSION,
  DOMAINS,
  POSES,
  STUDIOS,
  BODY_OVERRIDE_MIN,
  BODY_OVERRIDE_MAX,
  SCHEMA_REFERENCE,
  SCHEMA_CONTRACTS,
  validateSchemaIntegrity
};

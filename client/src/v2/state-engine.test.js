/**
 * SHALA — 2B FOUNDATION TEST SUITE
 * Document ID: SHALA-V2-2B-TEST-SUITE-001
 * 
 * Proves functional state/navigation foundation.
 * No external API dependency. Deterministic validation.
 */

import {
  createV2State, V2_PAGES, go, openContext, returnContext,
  setFaceSource, setMetricProfile, cmToFtIn, ftInToCm, kgToLb, lbToKg, cmToIn, inToCm,
  setCanonSeed, setBodyOverride, selectPose, selectStudio, setDomain, nextDomain,
  setReference, toggleReference, beginGeneration, generationSucceeded, generationFailed,
  acceptCandidate, rejectCandidate, skipDomain, startAgain, setOrientationGate,
  DOMAINS, POSES, STUDIOS
} from './state-engine.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(`ASSERT FAILED: ${message}`);
};

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) throw new Error(`ASSERT EQUALS FAILED: ${message} (got ${actual}, expected ${expected})`);
};

const assertArrayEquals = (actual, expected, message) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`ASSERT ARRAY EQUALS FAILED: ${message}`);
  }
};

/**
 * TEST 1: 26 pages remain represented
 */
function test_26_pages_represented() {
  assertEquals(V2_PAGES.length, 26, 'Exactly 26 pages must be defined');
  const expected = [
    'SPLASH','DEDICATION','LOGIN','REGISTER ACCOUNT','FORGOT PASSWORD','DASHBOARD TEASER','BIRTHDAY GREETING','MAIN DASHBOARD',
    'CREATE ME — FACE','CREATE ME — VITAL STATISTICS','IDENTITY GENERATING','CANON CONFIRMATION','DOUBLE CONFIRM','BODY SELF-SELECTION',
    'WORKSHOP','POSE SELECTION','STUDIO SELECTION','CLOTHES','BAGS','SHOES','ACCESSORIES','ALBUS GENERATING','THE REVEAL','TREND ALERT','FAVORITES','COMPACT UNDERSIDE'
  ];
  assertArrayEquals(V2_PAGES, expected, 'All 26 canonical pages must be present');
}

/**
 * TEST 2: Initial state is deterministic
 */
function test_initial_state_deterministic() {
  const s1 = createV2State();
  const s2 = createV2State();
  
  assertEquals(s1.page, 'SPLASH', 'Initial page must be SPLASH');
  assertEquals(s1.page, s2.page, 'Two fresh states must have same page');
  assertEquals(s1.build.activeDomain, 'CLOTHES', 'Initial domain must be CLOTHES');
  assert(!s1.build.generating, 'Initial generating must be false');
  assert(!s1.build.pendingReveal, 'Initial pendingReveal must be false');
}

/**
 * TEST 3: Valid page navigation succeeds
 */
function test_valid_page_navigation() {
  const s = createV2State();
  go(s, 'LOGIN');
  assertEquals(s.page, 'LOGIN', 'Valid page navigation must succeed');
  
  go(s, 'DASHBOARD TEASER');
  assertEquals(s.page, 'DASHBOARD TEASER', 'Navigation sequence must work');
}

/**
 * TEST 4: Invalid page navigation is rejected
 */
function test_invalid_page_navigation_rejected() {
  const s = createV2State();
  let caught = false;
  try {
    go(s, 'UNKNOWN PAGE');
  } catch (e) {
    caught = true;
  }
  assert(caught, 'Invalid page must throw error');
}

/**
 * TEST 5: Metric ↔ Imperial conversions round-trip within sensible tolerance
 */
function test_metric_imperial_roundtrip() {
  // cm → ft/in → cm
  const cm1 = 180;
  const ftIn = cmToFtIn(cm1);
  const cm2 = ftInToCm(ftIn.ft, ftIn.in);
  assert(Math.abs(cm1 - cm2) < 0.1, `cm roundtrip tolerance: ${cm1} → ${cm2}`);
  
  // kg → lb → kg
  const kg1 = 70;
  const lb = kgToLb(kg1);
  const kg2 = lbToKg(lb);
  assert(Math.abs(kg1 - kg2) < 0.1, `kg roundtrip tolerance: ${kg1} → ${kg2}`);
  
  // cm → in → cm (bust/waist/hips)
  const cm3 = 92;
  const inches = cmToIn(cm3);
  const cm4 = inToCm(inches);
  assert(Math.abs(cm3 - cm4) < 0.1, `cm/in roundtrip tolerance: ${cm3} → ${cm4}`);
}

/**
 * TEST 6: Body override accepts 1–7 and rejects out-of-range values
 */
function test_body_override_range() {
  const s = createV2State();
  
  for (let i = 1; i <= 7; i++) {
    setBodyOverride(s, i);
    assertEquals(s.profile.bodyOverride, i, `Body override ${i} must be accepted`);
  }
  
  let caught0 = false, caught8 = false, caughtNeg = false;
  try { setBodyOverride(s, 0); } catch (e) { caught0 = true; }
  try { setBodyOverride(s, 8); } catch (e) { caught8 = true; }
  try { setBodyOverride(s, -1); } catch (e) { caughtNeg = true; }
  
  assert(caught0 && caught8 && caughtNeg, 'Out-of-range body override must be rejected');
}

/**
 * TEST 7: All schema poses are accepted; unknown pose rejected
 */
function test_all_schema_poses_accepted() {
  const s = createV2State();
  
  for (const pose of POSES) {
    selectPose(s, pose);
    assertEquals(s.build.selectedPose, pose, `Pose ${pose} must be accepted`);
  }
  
  let caught = false;
  try {
    selectPose(s, 'UNKNOWN_POSE');
  } catch (e) {
    caught = true;
  }
  assert(caught, 'Unknown pose must be rejected');
}

/**
 * TEST 8: All six schema Studios are accepted; unknown Studio rejected
 */
function test_all_schema_studios_accepted() {
  const s = createV2State();
  
  for (const studio of STUDIOS) {
    selectStudio(s, studio);
    assertEquals(s.build.selectedStudio, studio, `Studio ${studio} must be accepted`);
  }
  
  let caught = false;
  try {
    selectStudio(s, 'UNKNOWN_STUDIO');
  } catch (e) {
    caught = true;
  }
  assert(caught, 'Unknown Studio must be rejected');
}

/**
 * TEST 9: Domain order is exactly CLOTHES → BAGS → SHOES → ACCESSORIES
 */
function test_domain_order() {
  const expected = ['CLOTHES', 'BAGS', 'SHOES', 'ACCESSORIES'];
  assertArrayEquals(DOMAINS, expected, 'Domain order must be canonical');
}

/**
 * TEST 10: SKIP preserves current root
 */
function test_skip_preserves_root() {
  const s = createV2State();
  const rootId = 'media-123';
  s.build.currentRootMediaId = rootId;
  
  skipDomain(s);
  assertEquals(s.build.currentRootMediaId, rootId, 'SKIP must preserve current root');
  assertEquals(s.build.activeDomain, 'BAGS', 'SKIP must advance domain');
}

/**
 * TEST 11: Setting/swapping active reference preserves root
 */
function test_swapping_reference_preserves_root() {
  const s = createV2State();
  const rootId = 'root-456';
  s.build.currentRootMediaId = rootId;
  
  setReference(s, 'CLOTHES', 'ref-789');
  assertEquals(s.build.currentRootMediaId, rootId, 'Setting reference must preserve root');
}

/**
 * TEST 12: Begin generation locks duplicate submission
 */
function test_begin_generation_locks_duplicate() {
  const s = createV2State();
  
  const result1 = beginGeneration(s);
  assert(result1 === true, 'First generation must return true');
  assert(s.build.generating === true, 'Generating flag must be true');
  
  const result2 = beginGeneration(s);
  assert(result2 === false, 'Duplicate generation must return false');
}

/**
 * TEST 13: Generation success creates candidate without replacing root
 */
function test_generation_success_creates_candidate() {
  const s = createV2State();
  const rootId = 'original-root';
  s.build.currentRootMediaId = rootId;
  
  beginGeneration(s);
  generationSucceeded(s, 'candidate-new');
  
  assertEquals(s.build.currentRootMediaId, rootId, 'Root must not change on generation success');
  assertEquals(s.build.candidateMediaId, 'candidate-new', 'Candidate must be set');
  assert(s.build.pendingReveal === true, 'pendingReveal must be true');
}

/**
 * TEST 14: Candidate acceptance replaces root
 */
function test_candidate_acceptance_replaces_root() {
  const s = createV2State();
  s.build.candidateMediaId = 'candidate-new';
  
  acceptCandidate(s);
  assertEquals(s.build.currentRootMediaId, 'candidate-new', 'Candidate must become root');
  assertEquals(s.build.candidateMediaId, null, 'Candidate must be cleared after acceptance');
}

/**
 * TEST 15: Candidate rejection preserves previous root
 */
function test_candidate_rejection_preserves_root() {
  const s = createV2State();
  const rootId = 'original-root';
  s.build.currentRootMediaId = rootId;
  s.build.candidateMediaId = 'rejected-candidate';
  
  rejectCandidate(s);
  assertEquals(s.build.currentRootMediaId, rootId, 'Rejection must preserve root');
  assertEquals(s.build.candidateMediaId, null, 'Candidate must be cleared');
  assertEquals(s.page, 'CLOTHES', 'Must return to active domain');
}

/**
 * TEST 16: Generation failure preserves previous root
 */
function test_generation_failure_preserves_root() {
  const s = createV2State();
  const rootId = 'protected-root';
  s.build.currentRootMediaId = rootId;
  beginGeneration(s);
  
  generationFailed(s, 'Network error');
  
  assertEquals(s.build.currentRootMediaId, rootId, 'Failure must preserve root');
  assertEquals(s.build.candidateMediaId, null, 'Failure must clear candidate');
  assert(s.build.generating === false, 'Generating flag must be false');
}

/**
 * TEST 17: START AGAIN clears active build but preserves profile
 */
function test_start_again_clears_build_preserves_profile() {
  const s = createV2State();
  
  // Set profile
  setFaceSource(s, 'face-data');
  setCanonSeed(s, 'seed-42');
  setBodyOverride(s, 3);
  
  // Set build state
  selectPose(s, 'POSE_05');
  selectStudio(s, 'STUDIO_02');
  s.build.currentRootMediaId = 'root-media';
  s.build.candidateMediaId = 'candidate-media';
  
  startAgain(s);
  
  // Profile must be preserved
  assertEquals(s.profile.faceSource, 'face-data', 'START AGAIN must preserve face source');
  assertEquals(s.profile.canonSeed, 'seed-42', 'START AGAIN must preserve canon seed');
  assertEquals(s.profile.bodyOverride, 3, 'START AGAIN must preserve body override');
  
  // Build state must be cleared
  assertEquals(s.build.selectedPose, null, 'START AGAIN must clear pose');
  assertEquals(s.build.selectedStudio, null, 'START AGAIN must clear studio');
  assertEquals(s.build.currentRootMediaId, null, 'START AGAIN must clear root');
  assertEquals(s.build.candidateMediaId, null, 'START AGAIN must clear candidate');
  assertEquals(s.page, 'WORKSHOP', 'START AGAIN must navigate to WORKSHOP');
}

/**
 * TEST 18: Compact contextual return restores invoking page
 */
function test_compact_contextual_return() {
  const s = createV2State();
  
  go(s, 'MAIN DASHBOARD');
  openContext(s, 'COMPACT UNDERSIDE');
  assertEquals(s.page, 'COMPACT UNDERSIDE', 'Must navigate to Compact');
  assertEquals(s.returnPage, 'MAIN DASHBOARD', 'Must remember invoking page');
  
  returnContext(s);
  assertEquals(s.page, 'MAIN DASHBOARD', 'Must return to invoking page');
  assertEquals(s.returnPage, null, 'Must clear return page');
}

/**
 * TEST 19: Orientation gate predicate behaves correctly
 */
function test_orientation_gate_predicate() {
  const s = createV2State();
  
  // Desktop: no gate
  go(s, 'THE REVEAL');
  setOrientationGate(s, {mobile: false, portrait: true});
  assert(s.transient.orientationGate === false, 'Desktop must bypass gate');
  
  // Mobile portrait on Reveal: gate active
  setOrientationGate(s, {mobile: true, portrait: true});
  assert(s.transient.orientationGate === true, 'Mobile portrait Reveal must trigger gate');
  
  // Mobile landscape on Reveal: gate inactive
  setOrientationGate(s, {mobile: true, portrait: false});
  assert(s.transient.orientationGate === false, 'Mobile landscape must bypass gate');
  
  // Mobile portrait on non-gate page: no gate
  go(s, 'WORKSHOP');
  setOrientationGate(s, {mobile: true, portrait: true});
  assert(s.transient.orientationGate === false, 'Mobile portrait on WORKSHOP must not gate');
  
  // Mobile portrait on Favorites: gate active
  go(s, 'FAVORITES');
  setOrientationGate(s, {mobile: true, portrait: true});
  assert(s.transient.orientationGate === true, 'Mobile portrait Favorites must trigger gate');
}

/**
 * Test runner
 */
export function runAll2BTests() {
  const tests = [
    { name: '26 pages represented', fn: test_26_pages_represented },
    { name: 'Initial state deterministic', fn: test_initial_state_deterministic },
    { name: 'Valid page navigation', fn: test_valid_page_navigation },
    { name: 'Invalid page navigation rejected', fn: test_invalid_page_navigation_rejected },
    { name: 'Metric ↔ Imperial roundtrip', fn: test_metric_imperial_roundtrip },
    { name: 'Body override range validation', fn: test_body_override_range },
    { name: 'All schema poses accepted', fn: test_all_schema_poses_accepted },
    { name: 'All schema Studios accepted', fn: test_all_schema_studios_accepted },
    { name: 'Domain order canonical', fn: test_domain_order },
    { name: 'SKIP preserves root', fn: test_skip_preserves_root },
    { name: 'Swap reference preserves root', fn: test_swapping_reference_preserves_root },
    { name: 'Begin generation locks duplicate', fn: test_begin_generation_locks_duplicate },
    { name: 'Generation success creates candidate', fn: test_generation_success_creates_candidate },
    { name: 'Candidate acceptance replaces root', fn: test_candidate_acceptance_replaces_root },
    { name: 'Candidate rejection preserves root', fn: test_candidate_rejection_preserves_root },
    { name: 'Generation failure preserves root', fn: test_generation_failure_preserves_root },
    { name: 'START AGAIN clears build/preserves profile', fn: test_start_again_clears_build_preserves_profile },
    { name: 'Compact contextual return', fn: test_compact_contextual_return },
    { name: 'Orientation gate predicate', fn: test_orientation_gate_predicate }
  ];
  
  const results = { passed: 0, failed: 0, errors: [] };
  
  for (const test of tests) {
    try {
      test.fn();
      results.passed++;
      console.log(`✓ ${test.name}`);
    } catch (e) {
      results.failed++;
      results.errors.push({ test: test.name, error: e.message });
      console.error(`✗ ${test.name}: ${e.message}`);
    }
  }
  
  return results;
}

// Export for use in test runners
export { assert, assertEquals, assertArrayEquals };

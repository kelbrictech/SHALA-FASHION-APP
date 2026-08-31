// client/src/foundation/validation.js
import { DOMAINS, POSES, STUDIOS } from './schema.js';

export function validateProfile(profile) {
  if (typeof profile !== 'object' || profile === null) return false;
  // minimal checks
  if ('height' in profile && typeof profile.height !== 'number') return false;
  if ('weight' in profile && typeof profile.weight !== 'number') return false;
  return true;
}

export function validateActiveBuild(build) {
  if (!build) return true;
  if (build.selectedDomain && !DOMAINS.includes(build.selectedDomain)) return false;
  if (build.selectedPoseId && !POSES.includes(build.selectedPoseId)) return false;
  if (build.selectedStudioId && !STUDIOS.includes(build.selectedStudioId)) return false;
  return true;
}

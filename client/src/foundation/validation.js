// client/src/foundation/validation.js
import { SCHEMA_VERSION, DOMAINS, POSES, STUDIOS } from './schema.js';

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validPointer(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.length > 0);
}

export function validateProfile(profile) {
  if (!isObject(profile)) return false;
  if ('schemaVersion' in profile && profile.schemaVersion !== SCHEMA_VERSION) return false;
  if ('height' in profile && (typeof profile.height !== 'number' || !Number.isFinite(profile.height))) return false;
  if ('weight' in profile && (typeof profile.weight !== 'number' || !Number.isFinite(profile.weight))) return false;
  if ('measurements' in profile && profile.measurements !== null && !isObject(profile.measurements)) return false;
  if ('selectedCanonId' in profile && profile.selectedCanonId !== null && typeof profile.selectedCanonId !== 'string') return false;
  if ('personalizedRootMediaPointer' in profile && !validPointer(profile.personalizedRootMediaPointer)) return false;
  // Raw face media is temporary and is not a legal permanent profile field.
  if ('faceMediaId' in profile || 'rawFaceMediaId' in profile || 'rawFaceMediaPointer' in profile) return false;
  return true;
}

export function validateActiveBuild(build) {
  if (build === null || build === undefined) return true;
  if (!isObject(build)) return false;
  if (build.selectedDomain && !DOMAINS.includes(build.selectedDomain)) return false;
  if (build.selectedPoseId && !POSES.includes(build.selectedPoseId)) return false;
  if (build.selectedStudioId && !STUDIOS.includes(build.selectedStudioId)) return false;
  if ('comparisonEnabled' in build && typeof build.comparisonEnabled !== 'boolean') return false;

  const root = build.currentRootMediaPointer;
  const reference = build.currentReferenceMediaPointer;
  const candidate = build.candidateMediaPointer;
  if (!validPointer(root) || !validPointer(reference) || !validPointer(candidate)) return false;
  if (root && reference && root === reference) return false;
  if (root && candidate && root === candidate) return false;
  return true;
}

export function validateFavorites(favorites) {
  return Array.isArray(favorites) && favorites.length <= 3;
}

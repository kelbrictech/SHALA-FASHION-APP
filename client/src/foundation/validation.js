// client/src/foundation/validation.js
import { SCHEMA_VERSION, DOMAINS, POSES, STUDIOS } from './schema.js';

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validPointer(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.length > 0);
}
function validStage(stage){
  if(!isObject(stage)) return false;
  if(!validPointer(stage.sourcePointer) || !validPointer(stage.appliedPointer)) return false;
  if('skipped' in stage && typeof stage.skipped!=='boolean') return false;
  return true;
}

export function validateProfile(profile) {
  if (!isObject(profile)) return false;
  if ('schemaVersion' in profile && profile.schemaVersion !== SCHEMA_VERSION) return false;
  if ('height' in profile && (typeof profile.height !== 'number' || !Number.isFinite(profile.height))) return false;
  if ('weight' in profile && (typeof profile.weight !== 'number' || !Number.isFinite(profile.weight))) return false;
  if ('measurements' in profile && profile.measurements !== null && !isObject(profile.measurements)) return false;
  if ('selectedCanonId' in profile && profile.selectedCanonId !== null && typeof profile.selectedCanonId !== 'string') return false;
  if ('personalizedRootMediaPointer' in profile && !validPointer(profile.personalizedRootMediaPointer)) return false;
  // Raw face media remains temporary onboarding input and is not permanent profile data.
  if ('faceMediaId' in profile || 'rawFaceMediaId' in profile || 'rawFaceMediaPointer' in profile) return false;
  return true;
}

export function validateActiveBuild(build) {
  if (build === null || build === undefined) return true;
  if (!isObject(build)) return false;

  // CSV-authoritative shape.
  if (build.selectedFocus && !DOMAINS.includes(build.selectedFocus)) return false;
  if (build.selectedPoseId && !POSES.includes(build.selectedPoseId)) return false;
  if (build.selectedStudioId && !STUDIOS.includes(build.selectedStudioId)) return false;
  if (build.currentStage && !DOMAINS.includes(build.currentStage)) return false;
  if ('comparisonEnabled' in build && typeof build.comparisonEnabled !== 'boolean') return false;
  if (!validPointer(build.currentRootMediaPointer) || !validPointer(build.candidateMediaPointer)) return false;
  if (build.stages !== undefined) {
    if(!isObject(build.stages)) return false;
    for(const domain of DOMAINS){
      if(!(domain in build.stages) || !validStage(build.stages[domain])) return false;
    }
  }

  // Backward compatibility with the pre-CSV 1B→1F build shape.
  if (build.selectedDomain && !DOMAINS.includes(build.selectedDomain)) return false;
  if (!validPointer(build.currentReferenceMediaPointer)) return false;
  return true;
}

export function validateFavorites(favorites) {
  return Array.isArray(favorites) && favorites.length <= 3;
}

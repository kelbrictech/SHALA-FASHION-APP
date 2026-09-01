# SHALA — V2 2A BEHAVIOR CONTRACT

**Document ID:** SHALA-V2-2A-BEHAVIOR-CONTRACT-001  
**Authorization:** `APPROVED — SHALA-BUILD-V2-2A-001`  
**Status:** BUILD 2A

## Governing Rule
No V2 behavior is invented merely because a V1 control exists. Known canon is contracted below; unresolved behavior is explicitly deferred/flagged.

## Frozen topology
V1 topology remains 26 surfaces. V2 changes behavior, not page inventory.

## State classes
- **Account-persistent:** account identity/profile once backend persistence is connected.
- **Profile-persistent:** accepted face identity representation, normalized measurements, resolved/overridden body seed.
- **Build-session:** selected pose, Studio, domain references, current root, candidate, reference toggle and active build progress.
- **Transient:** loading/generating overlays, ALBUS cameo, WERK!, validation messages, orientation gate.
- **Protected:** last successful accepted image/root. Candidate failure/rejection never overwrites it.

## Canonical journey
`Splash → Dedication → Login/Register → Dashboard → CREATE ME → Workshop → Pose → Studio → Clothes → Bags → Shoes → Accessories → Reveal`

Supporting routes: Dashboard ↔ Trends; Dashboard ↔ Favorites; Compact provides contextual navigation without changing canonical domain order.

## Surface behavior contract
1. **Splash** — TAP ME advances to Dedication.
2. **Dedication** — acknowledgement/continuation advances to Login; no product state mutation.
3. **Login** — OPEN SESAME validates required credentials then enters Dashboard path; SIGN ME UP opens Register; I FORGOT opens Forgot Password.
4. **Register Account** — validates name/password/confirmation; ALL DONE submits/continues; BRING ME BACK returns Login.
5. **Forgot Password** — accepts recovery input; PRAY THIS WORKS initiates recovery contract; BRING ME BACK returns Login.
6. **Dashboard Teaser** — envelope opens Birthday Greeting when eligible; otherwise continues to Main Dashboard.
7. **Birthday Greeting** — heart acknowledges gift and continues; birthday-opened flag is persistent when backend is connected.
8. **Main Dashboard** — Compact cover opens/closes; MIRROR ON THE WALL enters CREATE ME; EXPLORE enters Workshop; TRENDS enters Trend Alert; FAVORITES enters Favorites.
9. **CREATE ME — Face** — upload/camera establishes identity-source candidate; USE THIS PIC accepts it and advances to Vital Statistics. Raw face handling follows architecture privacy contract.
10. **CREATE ME — Vital Statistics** — cm/ft-in and kg/lb are bidirectionally synchronized; bust/waist/hips captured; THIS LOOKS RIGHT requires valid complete values, normalizes internally, then advances.
11. **Identity Generating** — transient ALBUS calculation state; deterministic resolver produces one of 63 canon seeds and advances automatically.
12. **Canon Confirmation** — SPOT ON accepts resolved canon; NOT QUITE opens Double Confirm.
13. **Double Confirm** — NA-AH! enters Body Self-Selection; FINE! accepts proposed canon; THE BODY THO enters Body Self-Selection while preserving identity lock.
14. **Body Self-Selection** — exactly seven visual geometry choices; THIS ONE selects; YES PLS accepts selected override; PICK AGAIN clears/reopens selection.
15. **Workshop** — canonical domain choices remain CLOTHES/BAGS/SHOES/ACCESSORIES; TRY ME begins/continues active build at chosen valid point without silently reordering canonical transformation lineage; Compact available.
16. **Pose Selection** — exactly 10 poses; selecting previews state; YES PLS accepts; PICK AGAIN clears; Compact available.
17. **Studio Selection** — six Studios: five standard + My Studio; selection previews; YES PLS accepts; PICK AGAIN clears; Compact available.
18. **Clothes** — upload/camera sets clothes reference; SLAP IT submits transformation; SWAP replaces only active reference; SKIP advances without corrupting root; REFERENCE toggle controls reference display/use contract; Compact available.
19. **Bags** — same interaction contract, Bags domain only.
20. **Shoes** — same interaction contract, Shoes domain only.
21. **Accessories** — same interaction contract, Accessories domain only.
22. **ALBUS Generating** — transient generation state; blocks duplicate submission; success creates candidate; recoverable failure returns to originating domain with protected root intact.
23. **The Reveal** — displays accepted/final candidate state; heart favorites; download invokes save/download contract; refresh/Try Another One returns to appropriate build continuation; REFERENCE toggles comparison/reference view; Compact available. Mobile portrait is gated; landscape/desktop released.
24. **Trend Alert** — ROLL AGAIN requests another trend item; THAT'S INTERESTING records/acknowledges interest contract; Compact available.
25. **Favorites** — displays maximum three protected favorite slots per current architecture; favorite selection/view toggle and download operate on selected favorite; Compact available. Mobile portrait gated; landscape/desktop released.
26. **Compact Underside** — Compact closes/returns to invoking context; NO-NO button remains a deliberate non-destructive refusal/exit affordance; exact destructive semantics are not invented in 2A.

## Transformation railway
`IMAGE N + PROMPT N + REFERENCE N → CANDIDATE IMAGE N+1`

- Candidate is never the root until accepted.
- Accept → candidate becomes current root.
- Reject/fail → current root remains unchanged.
- SWAP → active reference only.
- SKIP → no fabricated image; progression preserves current root.
- START AGAIN → clears currentRootMediaId, currentReferenceMediaId and pendingReveal before navigation changes; profile identity/body configuration remains unless Nuclear Reset is explicitly invoked.
- Nuclear Reset is outside ordinary START AGAIN and preserves three Favorites + Birthday Gift Opened Flag per architecture.

## Orientation contract
- Desktop/laptop: orientation gate bypassed.
- Mobile web Reveal and Favorites: portrait overlays `Shift to landscape mode`; underlying surface becomes usable in landscape.
- Gate is transient display behavior, not a separate product page.

## Working-area contract
- **YELLOW:** safe/static composition.
- **RED:** vertical extension/scroll allowed where designed.
- **BLUE:** horizontal Studio working area/pan where designed.
- **GREEN:** maximum product working boundary; Founder inspection tooling stays outside it.
- Exact visual polish belongs to V3; V2 implements usable behavior.

## Compact contract
Compact is contextual navigation, not an extra linear page requirement. Open/close preserves invoking context. Main destinations remain Mirror on the Wall, Explore, Trends and Favorites. Exact physical animation/polish is V2 2E; final art is V3.

## WERK! contract
WERK! is a transient conditioned prompt/display, never an icon, toggle or permanent placeholder. It appears only after the successful completion/exit condition defined by the active experience, then disappears without requiring product navigation. Timing/animation implementation is 2E.

## Failure/recovery contract
- Required-input validation does not mutate accepted state.
- Duplicate generation submission is blocked while pending.
- Media/API failure preserves last successful root and active user reference where recovery is possible.
- User receives recoverable feedback and may retry/swap/skip according to domain context.
- No failure path silently resets profile identity/body state.

## Explicitly unresolved / deferred
- Exact NO-NO destructive/non-destructive downstream semantics beyond safe refusal/return.
- Exact Trend Alert recommendation engine/data source.
- Exact authentication/recovery backend mechanics.
- Exact production image-generation API execution and prompt payloads beyond established railway/identity/body preservation contracts.
- Final visual assets, typography, animation polish and production styling → V3 unless 2E needs low-fi interaction feedback.

These items must not be invented during 2B–2F. Founder decision or later authorized contract is required where implementation cannot proceed safely without them.

## 2A Exit Gate
2A passes when:
1. all 26 V1 surfaces remain accounted for;
2. known V1 controls have V2 behavior contracts;
3. state ownership/lifetime is defined;
4. transformation lineage and root protection are explicit;
5. mobile orientation behavior is explicit;
6. unresolved semantics are quarantined rather than invented.

**Next construction coordinate after POLARIS/Founder release:** 2B — Foundation / functional state-navigation engine.

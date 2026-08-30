# SHALA-RENDER-PREFLIGHT-002

**Assignee:** ADAM / GitHub Copilot\
**Repository:** `kelbrictech/SHALA-FASHION-APP`\
**Scope:** Render proxy infrastructure preflight only

## Instruction

Implement the smallest possible Node.js Render proxy preflight.

### Requirements

-   Do not scaffold the SHALA application yet.
-   Preserve the existing repository.
-   Create a minimal server with:
    -   `GET /health` --- confirms proxy is alive.
    -   `GET /preflight/neon` --- connects through `DATABASE_URL` and
        reads only `shala_proxy_budget_controls`.
    -   Response exposes only:
        -   OpenAI testing cap
        -   accumulated OpenAI test spend
        -   traffic unlocked `true/false`
    -   `GET /preflight/cloudinary` --- verifies Cloudinary
        credentials/configuration without uploading personal media and
        without exposing API credentials.
-   No OpenAI API call.
-   No image generation.
-   No user measurements, body data, face data, or persistent user
    identifier.
-   Do not introduce `look_id` or any persistent cross-transaction
    identifier into Neon.
-   Store/use Cloudinary `public_id`, never permanent delivery URLs.
-   OpenAI traffic must remain locked.
-   Use environment variables already configured in Render.
-   Add only dependencies actually required.
-   Add a concise README section explaining the three preflight
    endpoints.
-   Before committing, report files changed and expected behavior.

## Acceptance Gate

`HEALTH PASS ∧ NEON PASS ∧ CLOUDINARY PASS ∧ OPENAI SPEND = $0.00`

## Boundary

Do **not** begin the actual SHALA frontend or application scaffold
during this task.

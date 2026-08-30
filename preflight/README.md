SHALA Render Preflight — minimal proxy checks

Endpoints
- GET /health
  - Returns 200 and { "status": "ok" }.

- GET /preflight/neon
  - Verifies Neon DB connectivity and reads the seeded testing budget row from table `shala_proxy_budget_controls`.
  - Uses the locked preflight cycle: budget_cycle_id = 202608 (no environment identifier required).
  - Reads exactly these DB columns:
    - hard_monthly_dollar_cap
    - accumulated_spent_dollars
    - is_traffic_unlocked
  - Maps DB columns to API response fields:
    {
      "openai_testing_cap": <number|null>,              // from hard_monthly_dollar_cap
      "accumulated_openai_test_spend": <number>,       // from accumulated_spent_dollars
      "traffic_unlocked": <boolean>                    // from is_traffic_unlocked
    }
  - Does not write to the database and exposes only those fields.

- GET /preflight/cloudinary
  - Verifies Cloudinary authentication using env vars:
    - CLOUDINARY_CLOUD_NAME
    - CLOUDINARY_API_KEY
    - CLOUDINARY_API_SECRET
  - Does NOT upload or list media and does NOT expose API credentials.
  - Returns { "cloudinary_ok": true } on success.

Run locally
1. cd preflight
2. npm install
3. Provide environment variables:
   - DATABASE_URL
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
4. npm start

Notes
- The Neon query targets budget_cycle_id = 202608 (seeded testing row) to ensure consistent, non-arbitrary results.
- No OpenAI key is required or used by this preflight.

'use strict';

const express = require('express');
const { Client } = require('pg');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Locked testing budget cycle (per Polaris)
const BUDGET_CYCLE_ID = 202608;

/**
 * Health check
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Create a new PG client for each request.
 */
function createDbClient() {
  const conn = process.env.DATABASE_URL;
  if (!conn) throw new Error('DATABASE_URL not configured');
  return new Client({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  });
}

/**
 * GET /preflight/neon
 *
 * Reads exactly:
 *   hard_monthly_dollar_cap,
 *   accumulated_spent_dollars,
 *   is_traffic_unlocked
 * from shala_proxy_budget_controls WHERE budget_cycle_id = 202608
 *
 * Maps DB columns to the response contract:
 *   openai_testing_cap <- hard_monthly_dollar_cap
 *   accumulated_openai_test_spend <- accumulated_spent_dollars
 *   traffic_unlocked <- is_traffic_unlocked
 *
 * No writes. No identifiers created. No OpenAI calls.
 */
app.get('/preflight/neon', async (_req, res) => {
  let client;
  try {
    client = createDbClient();
    await client.connect();

    const result = await client.query(
      `SELECT
         hard_monthly_dollar_cap,
         accumulated_spent_dollars,
         is_traffic_unlocked
       FROM shala_proxy_budget_controls
       WHERE budget_cycle_id = $1`,
      [BUDGET_CYCLE_ID]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        error: 'budget_row_not_found',
        message: 'No seeded testing budget row found for budget_cycle_id = 202608.',
      });
    }

    const row = result.rows[0];

    const openai_testing_cap =
      row.hard_monthly_dollar_cap == null ? null : parseFloat(row.hard_monthly_dollar_cap);
    const accumulated_openai_test_spend =
      row.accumulated_spent_dollars == null ? 0.0 : parseFloat(row.accumulated_spent_dollars);
    const traffic_unlocked = !!row.is_traffic_unlocked;

    return res.json({
      openai_testing_cap,
      accumulated_openai_test_spend,
      traffic_unlocked,
    });
  } catch (err) {
    // Log server-side, but do not expose DB/connection details to clients.
    console.error('Neon preflight error:', err && err.message ? err.message : err);
    return res.status(502).json({ error: 'database_unreachable' });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (e) {
        // swallow to avoid leaking error to client; already logged above if needed
      }
    }
  }
});

/**
 * GET /preflight/cloudinary
 *
 * Uses CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
 * Verifies auth/connectivity only (no upload, no listing, no public_id).
 * Does not return credentials or delivery URLs.
 */
app.get('/preflight/cloudinary', (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(400).json({
      cloudinary_ok: false,
      reason: 'missing_env',
      message: 'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment.',
    });
  }

  const options = {
    hostname: 'api.cloudinary.com',
    path: `/v1_1/${encodeURIComponent(cloudName)}/ping`,
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
      'User-Agent': 'shala-preflight/0.1',
    },
    timeout: 5000,
  };

  const reqCloud = https.request(options, (resp) => {
    const { statusCode } = resp;
    let body = '';
    resp.on('data', (chunk) => (body += chunk));
    resp.on('end', () => {
      if (statusCode >= 200 && statusCode < 300) {
        return res.json({ cloudinary_ok: true });
      } else if (statusCode === 401 || statusCode === 403) {
        return res.status(401).json({ cloudinary_ok: false, reason: 'auth' });
      } else {
        return res.status(502).json({ cloudinary_ok: false, reason: 'unreachable' });
      }
    });
  });

  reqCloud.on('error', (err) => {
    console.error('Cloudinary preflight error:', err && err.message ? err.message : err);
    return res.status(502).json({ cloudinary_ok: false, reason: 'unreachable' });
  });

  reqCloud.on('timeout', () => {
    reqCloud.destroy();
    return res.status(504).json({ cloudinary_ok: false, reason: 'timeout' });
  });

  reqCloud.end();
});

app.listen(PORT, () => {
  console.log(`SHALA preflight listening on port ${PORT}`);
});

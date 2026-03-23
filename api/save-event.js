// api/save-event.js
// POST — saves a new event + its ticket tiers to Neon
// Body: { user_id, name, type, description, date, time, location, online_link,
//         qty, price, sale_price, tags, cover_url, send_email, send_sms, in_person,
//         tiers: [{ type, price, qty, description }] }

import { getDb, ok, err, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const {
    user_id, name, type, description, date, time, location, online_link,
    qty, price, sale_price, tags = [], cover_url,
    send_email = true, send_sms = false, in_person = true,
    tiers = []
  } = req.body;

  if (!user_id) return err(res, 'user_id is required');
  if (!name)    return err(res, 'name is required');
  if (tiers.length === 0) return err(res, 'At least one ticket tier is required');

  try {
    const sql = getDb();

    // Insert event
    const eventRows = await sql`
      INSERT INTO events (
        user_id, name, type, description, date, time, location, online_link,
        qty, price, sale_price, tags, cover_url,
        send_email, send_sms, in_person, is_active
      ) VALUES (
        ${user_id}, ${name}, ${type || null}, ${description || null},
        ${date || null}, ${time || null}, ${location || null}, ${online_link || null},
        ${qty || 0}, ${price || 0}, ${sale_price || null}, ${tags},
        ${cover_url || null}, ${send_email}, ${send_sms}, ${in_person}, TRUE
      )
      RETURNING id
    `;

    const event_id = eventRows[0].id;

    // Insert each tier
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      await sql`
        INSERT INTO event_tiers (event_id, type, price, qty, description, position)
        VALUES (${event_id}, ${t.type}, ${t.price || 0}, ${t.qty || 0}, ${t.description || null}, ${i})
      `;
    }

    // If online event — create stream entry
    if (type === 'Online') {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await sql`
        INSERT INTO event_streams (event_id, stream_slug, is_live)
        VALUES (${event_id}, ${slug}, FALSE)
        ON CONFLICT (stream_slug) DO NOTHING
      `;
    }

    return ok(res, { event_id, message: 'Event saved successfully' });

  } catch (e) {
    console.error('save-event error:', e);
    return err(res, 'Database error: ' + e.message, 500);
  }
}

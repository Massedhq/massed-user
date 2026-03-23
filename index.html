// api/save-profile.js
// POST — saves user media profile to Neon
// Body: { user_id, display_name, title, bio, category, email, phone, website, photo_url }

import { getDb, ok, err, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const {
    user_id, display_name, title, bio, category,
    email, phone, website, photo_url
  } = req.body;

  if (!user_id) return err(res, 'user_id is required');

  try {
    const sql = getDb();

    await sql`
      UPDATE users SET
        display_name = ${display_name || null},
        title        = ${title || null},
        bio          = ${bio || null},
        category     = ${category || null},
        email        = ${email || null},
        phone        = ${phone || null},
        website      = ${website || null},
        photo_url    = ${photo_url || null},
        updated_at   = NOW()
      WHERE id = ${user_id}
    `;

    return ok(res, { message: 'Profile saved successfully' });

  } catch (e) {
    console.error('save-profile error:', e);
    return err(res, 'Database error: ' + e.message, 500);
  }
}

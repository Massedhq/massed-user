// api/verify-online-ticket.js
// POST — verifies a ticket number for online event access via stream.massed.io
// Body: { ticket_number, stream_slug }

import { getDb, ok, err, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const { ticket_number, stream_slug } = req.body;

  if (!ticket_number) return err(res, 'ticket_number is required');

  try {
    const sql = getDb();

    // Look up ticket and verify it belongs to this online event
    const rows = await sql`
      SELECT
        t.ticket_number,
        t.buyer_name,
        t.buyer_email,
        t.is_checked_in,
        e.name        AS event_name,
        e.type        AS event_type,
        e.date        AS event_date,
        e.time        AS event_time,
        s.stream_slug,
        s.is_live,
        ti.type       AS tier_type
      FROM event_tickets  t
      JOIN events         e  ON e.id = t.event_id
      LEFT JOIN event_streams s ON s.event_id = e.id
      JOIN event_tiers    ti ON ti.id = t.tier_id
      WHERE t.ticket_number = ${ticket_number.toUpperCase().trim()}
        AND e.type = 'Online'
        ${stream_slug ? sql`AND s.stream_slug = ${stream_slug}` : sql``}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return ok(res, {
        valid: false,
        status: 'NOT_FOUND',
        message: 'Ticket not found or not valid for this event'
      });
    }

    const ticket = rows[0];
    const streamUrl = `https://stream.massed.io/${ticket.stream_slug}`;

    return ok(res, {
      valid: true,
      status: 'ACCESS_GRANTED',
      message: 'Ticket verified — access granted',
      ticket: {
        ticket_number: ticket.ticket_number,
        buyer_name:    ticket.buyer_name,
        event_name:    ticket.event_name,
        tier_type:     ticket.tier_type,
        event_date:    ticket.event_date,
        event_time:    ticket.event_time,
        is_live:       ticket.is_live
      },
      stream_url: streamUrl
    });

  } catch (e) {
    console.error('verify-online-ticket error:', e);
    return err(res, 'Database error: ' + e.message, 500);
  }
}

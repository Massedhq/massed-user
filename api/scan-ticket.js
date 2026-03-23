// api/scan-ticket.js
// Called by the scanner when a QR code is read or a ticket number is entered manually
// POST { ticket_number: "TKT-12345-VIP-001", checked_in_by: "door-staff" }

import { getDb, ok, err, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const { ticket_number, checked_in_by = 'scanner' } = req.body;

  if (!ticket_number) return err(res, 'ticket_number is required');

  try {
    const sql = getDb();

    // 1. Look up the ticket
    const rows = await sql`
      SELECT
        t.id,
        t.ticket_number,
        t.buyer_name,
        t.buyer_email,
        t.buyer_phone,
        t.amount_paid,
        t.is_checked_in,
        t.checked_in_at,
        e.name        AS event_name,
        e.date        AS event_date,
        e.time        AS event_time,
        e.location    AS event_location,
        e.type        AS event_type,
        ti.type       AS tier_type,
        ti.price      AS tier_price
      FROM event_tickets t
      JOIN events      e  ON e.id = t.event_id
      JOIN event_tiers ti ON ti.id = t.tier_id
      WHERE t.ticket_number = ${ticket_number.toUpperCase().trim()}
      LIMIT 1
    `;

    // Ticket not found
    if (rows.length === 0) {
      return ok(res, {
        valid: false,
        status: 'NOT_FOUND',
        message: 'Ticket not found in system'
      });
    }

    const ticket = rows[0];

    // Already checked in
    if (ticket.is_checked_in) {
      return ok(res, {
        valid: false,
        status: 'ALREADY_USED',
        message: 'Ticket already checked in',
        ticket: {
          ticket_number:  ticket.ticket_number,
          buyer_name:     ticket.buyer_name,
          event_name:     ticket.event_name,
          tier_type:      ticket.tier_type,
          checked_in_at:  ticket.checked_in_at
        }
      });
    }

    // 2. Valid — mark as checked in
    await sql`
      UPDATE event_tickets
      SET
        is_checked_in  = TRUE,
        checked_in_at  = NOW(),
        checked_in_by  = ${checked_in_by}
      WHERE ticket_number = ${ticket_number.toUpperCase().trim()}
    `;

    return ok(res, {
      valid: true,
      status: 'CHECKED_IN',
      message: 'Ticket verified and checked in',
      ticket: {
        ticket_number:  ticket.ticket_number,
        buyer_name:     ticket.buyer_name,
        buyer_email:    ticket.buyer_email,
        event_name:     ticket.event_name,
        event_date:     ticket.event_date,
        event_time:     ticket.event_time,
        event_location: ticket.event_location,
        tier_type:      ticket.tier_type,
        amount_paid:    ticket.amount_paid
      }
    });

  } catch (e) {
    console.error('scan-ticket error:', e);
    return err(res, 'Database error: ' + e.message, 500);
  }
}

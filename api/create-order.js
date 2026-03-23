// api/create-order.js
// POST — called after successful checkout payment
// Creates individual ticket records in Neon for each purchased ticket
// Body: { event_id, buyer_name, buyer_email, buyer_phone, cart: [{ tier_id, tier_type, qty, price }] }

import { getDb, ok, err, cors } from './_db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const { event_id, buyer_name, buyer_email, buyer_phone, cart = [] } = req.body;

  if (!event_id)     return err(res, 'event_id is required');
  if (!buyer_email)  return err(res, 'buyer_email is required');
  if (!buyer_name)   return err(res, 'buyer_name is required');
  if (cart.length === 0) return err(res, 'cart is empty');

  try {
    const sql = getDb();

    // Get event info for ticket number generation
    const evRows = await sql`SELECT id FROM events WHERE id = ${event_id} LIMIT 1`;
    if (evRows.length === 0) return err(res, 'Event not found');

    const tickets = [];
    let ticketCounter = 1;

    for (const item of cart) {
      const { tier_id, tier_type, qty, price } = item;

      // Get current sold count for this tier
      const soldRows = await sql`
        SELECT COUNT(*) AS sold FROM event_tickets WHERE tier_id = ${tier_id}
      `;
      let soldCount = parseInt(soldRows[0].sold) || 0;

      for (let i = 0; i < qty; i++) {
        soldCount++;
        // Generate unique ticket number: TKT-{eventId5}-{tierAbbr3}-{index4}
        const evPart   = event_id.toString().slice(-5).padStart(5, '0');
        const tierPart = tier_type.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
        const numPart  = String(soldCount).padStart(4, '0');
        const ticket_number = `TKT-${evPart}-${tierPart}-${numPart}`;

        // Insert ticket
        const tRows = await sql`
          INSERT INTO event_tickets (
            event_id, tier_id, ticket_number,
            buyer_name, buyer_email, buyer_phone, amount_paid
          ) VALUES (
            ${event_id}, ${tier_id}, ${ticket_number},
            ${buyer_name}, ${buyer_email}, ${buyer_phone || null}, ${price || 0}
          )
          RETURNING id, ticket_number
        `;

        tickets.push({
          ticket_number: tRows[0].ticket_number,
          tier_type,
          buyer_name,
          index: ticketCounter++
        });
      }

      // Update sold count on tier
      await sql`
        UPDATE event_tiers SET sold = sold + ${qty} WHERE id = ${tier_id}
      `;
    }

    // Update total sold on event
    const totalSold = cart.reduce((s, i) => s + i.qty, 0);
    await sql`UPDATE events SET sold = sold + ${totalSold} WHERE id = ${event_id}`;

    return ok(res, {
      message: 'Order created successfully',
      tickets,
      total_tickets: tickets.length
    });

  } catch (e) {
    console.error('create-order error:', e);
    return err(res, 'Database error: ' + e.message, 500);
  }
}

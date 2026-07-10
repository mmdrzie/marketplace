import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../config/database.js';
import { dealerService } from '../domain/services/dealer.js';
import { auth } from '../middleware/auth.js';
import { AppError } from '../errors.js';

const upgradeSchema = z.object({
  role: z.enum(['dealer', 'agency']),
  business_name: z.string().min(1).max(200),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Account upgrade
const accountRouter = new Hono();
accountRouter.post('/upgrade', auth(), zValidator('json', upgradeSchema), async (c) => {
  const body = c.req.valid('json');
  const profile = await dealerService.upgrade({ ...body, user: c.get('user') });
  return c.json({ success: true, data: profile }, 201);
});

// Dealer dashboard (authenticated, dealer role)
const dealerDashboardRouter = new Hono();
dealerDashboardRouter.get('/stats', auth(), async (c) => {
  const stats = await dealerService.getStats(c.get('user'));
  return c.json({ success: true, data: stats });
});

const fleetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  plate_number: z.string().optional(),
  vin: z.string().optional(),
  status: z.string().optional(),
  location: z.any().optional(),
  fuel_consumption: z.number().optional(),
  last_service: z.string().optional(),
  next_service: z.string().optional(),
  insurance_expiry: z.string().optional(),
  inspection_expiry: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().int().optional(),
  current_value: z.number().int().optional(),
  total_hours: z.number().int().optional(),
  total_mileage: z.number().int().optional(),
  monthly_fuel_data: z.any().optional(),
  service_history: z.any().optional(),
});

// Fleet vehicles
dealerDashboardRouter.get('/fleet', auth(), async (c) => {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM fleet_vehicles WHERE user_id = $1 ORDER BY created_at DESC', [c.get('user').id]);
  return c.json({ success: true, data: rows });
});

dealerDashboardRouter.get('/fleet/:id', auth(), async (c) => {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM fleet_vehicles WHERE id = $1 AND user_id = $2', [c.req.param('id'), c.get('user').id]);
  if (!rows[0]) throw AppError.notFound('Vehicle not found');
  return c.json({ success: true, data: rows[0] });
});

dealerDashboardRouter.post('/fleet', auth(), zValidator('json', fleetSchema), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO fleet_vehicles (user_id, name, type, brand, model, year, plate_number, vin, status, location, fuel_consumption, last_service, next_service, insurance_expiry, inspection_expiry, purchase_date, purchase_price, current_value, total_hours, total_mileage, monthly_fuel_data, service_history)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
    [c.get('user').id, body.name, body.type ?? '', body.brand ?? '', body.model ?? '', body.year ?? 0, body.plate_number ?? '', body.vin ?? '', body.status ?? 'active', JSON.stringify(body.location ?? {}), body.fuel_consumption ?? 0, body.last_service ?? '', body.next_service ?? '', body.insurance_expiry ?? '', body.inspection_expiry ?? '', body.purchase_date ?? '', body.purchase_price ?? 0, body.current_value ?? 0, body.total_hours ?? 0, body.total_mileage ?? 0, JSON.stringify(body.monthly_fuel_data ?? []), JSON.stringify(body.service_history ?? [])],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

dealerDashboardRouter.put('/fleet/:id', auth(), zValidator('json', fleetSchema.partial()), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const vehicleId = c.req.param('id');
  const userId = c.get('user').id;
  const { rows: existing } = await db.query('SELECT * FROM fleet_vehicles WHERE id = $1 AND user_id = $2', [vehicleId, userId]);
  if (!existing[0]) throw AppError.notFound('Vehicle not found');
  const merged = { ...existing[0], ...body };
  const { rows } = await db.query(
    `UPDATE fleet_vehicles SET name = $1, type = $2, brand = $3, model = $4, year = $5, plate_number = $6, vin = $7, status = $8, location = $9, fuel_consumption = $10, last_service = $11, next_service = $12, insurance_expiry = $13, inspection_expiry = $14, purchase_date = $15, purchase_price = $16, current_value = $17, total_hours = $18, total_mileage = $19, monthly_fuel_data = $20, service_history = $21, updated_at = NOW() WHERE id = $22 AND user_id = $23 RETURNING *`,
    [merged.name, merged.type, merged.brand, merged.model, merged.year, merged.plate_number, merged.vin, merged.status, JSON.stringify(merged.location), merged.fuel_consumption, merged.last_service, merged.next_service, merged.insurance_expiry, merged.inspection_expiry, merged.purchase_date, merged.purchase_price, merged.current_value, merged.total_hours, merged.total_mileage, JSON.stringify(merged.monthly_fuel_data), JSON.stringify(merged.service_history), vehicleId, userId],
  );
  return c.json({ success: true, data: rows[0] });
});

dealerDashboardRouter.delete('/fleet/:id', auth(), async (c) => {
  const db = await getDb();
  const { rowCount } = await db.query('DELETE FROM fleet_vehicles WHERE id = $1 AND user_id = $2', [c.req.param('id'), c.get('user').id]);
  if (!rowCount) throw AppError.notFound('Vehicle not found');
  return c.json({ success: true, data: null });
});

// Service logs
dealerDashboardRouter.get('/fleet/:id/logs', auth(), async (c) => {
  const db = await getDb();
  const { rows } = await db.query(
    'SELECT * FROM service_logs WHERE vehicle_id = $1 AND user_id = $2 ORDER BY service_date DESC',
    [c.req.param('id'), c.get('user').id],
  );
  return c.json({ success: true, data: rows });
});

dealerDashboardRouter.post('/fleet/:id/logs', auth(), zValidator('json', z.object({ type: z.string(), cost: z.number().int().optional(), description: z.string().optional(), service_date: z.string().optional() })), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO service_logs (vehicle_id, user_id, type, cost, description, service_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [c.req.param('id'), c.get('user').id, body.type, body.cost ?? 0, body.description ?? '', body.service_date ?? new Date().toISOString().split('T')[0]],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

dealerDashboardRouter.get('/subscription', auth(), async (c) => {
  const sub = await dealerService.getSubscription(c.get('user'));
  return c.json({ success: true, data: sub });
});

// Public dealer profiles
const dealerPublicRouter = new Hono();
dealerPublicRouter.get('/:id/profile', async (c) => {
  const profile = await dealerService.getPublicProfile(c.req.param('id'));
  return c.json({ success: true, data: profile });
});

dealerPublicRouter.post('/:id/reviews', auth(), zValidator('json', reviewSchema), async (c) => {
  const body = c.req.valid('json');
  const review = await dealerService.addReview({
    dealer_id: c.req.param('id'),
    rating: body.rating,
    comment: body.comment,
    user: c.get('user'),
  });
  return c.json({ success: true, data: review }, 201);
});

export { accountRouter, dealerDashboardRouter, dealerPublicRouter };

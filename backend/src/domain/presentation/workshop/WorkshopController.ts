import type { Context } from 'hono';
import { workshopService } from '../../services/workshopService.js';
import { AppError } from '../../../errors.js';

export class WorkshopController {
  // --- Public ---

  async list(c: Context) {
    const q = c.req.query('q');
    const type = c.req.query('type');
    const city = c.req.query('city');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '12');
    const data = await workshopService.listPublic({ q, type, city, page, limit });
    return c.json({ success: true, data });
  }

  async cities(c: Context) {
    const data = await workshopService.listCities();
    return c.json({ success: true, data });
  }

  async getBySlug(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('تعمیرکار یافت نشد');
    const data = await workshopService.getPublicBySlug(slug);
    if (!data) throw AppError.notFound('تعمیرکار یافت نشد');
    return c.json({ success: true, data });
  }

  // --- Owner ---

  async my(c: Context) {
    const user = c.get('user');
    const data = await workshopService.getByUser(user.id);
    if (!data) throw AppError.notFound('پروفایل تعمیرکار ثبت نشده است');
    return c.json({ success: true, data });
  }

  async register(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await workshopService.register(user.id, {
      workshopName: body.workshopName,
      workshopSlug: body.workshopSlug,
      type: body.type,
      specialty: body.specialty,
      city: body.city,
      address: body.address,
      phone: body.phone,
      hours: body.hours,
      services: body.services,
      description: body.description,
      documents: body.documents,
    });
    return c.json({ success: true, data }, 201);
  }

  async update(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await workshopService.update(user.id, body);
    return c.json({ success: true, data });
  }

  // --- Admin ---

  async adminList(c: Context) {
    const status = c.req.query('status');
    const data = await workshopService.adminList(status || undefined);
    return c.json({ success: true, data });
  }

  async adminApprove(c: Context) {
    const id = c.req.param('id');
    if (!id) throw AppError.badRequest('شناسه تعمیرکار الزامی است');
    const data = await workshopService.adminApprove(id);
    return c.json({ success: true, data });
  }

  async adminReject(c: Context) {
    const id = c.req.param('id');
    if (!id) throw AppError.badRequest('شناسه تعمیرکار الزامی است');
    const { note } = await c.req.json();
    const data = await workshopService.adminReject(id, note || '');
    return c.json({ success: true, data });
  }

  async adminSuspend(c: Context) {
    const id = c.req.param('id');
    if (!id) throw AppError.badRequest('شناسه تعمیرکار الزامی است');
    const data = await workshopService.adminSuspend(id);
    return c.json({ success: true, data });
  }

  async adminUpdate(c: Context) {
    const id = c.req.param('id');
    if (!id) throw AppError.badRequest('شناسه تعمیرکار الزامی است');
    const body = await c.req.json();
    const data = await workshopService.adminUpdate(id, body);
    return c.json({ success: true, data });
  }

  async adminDelete(c: Context) {
    const id = c.req.param('id');
    if (!id) throw AppError.badRequest('شناسه تعمیرکار الزامی است');
    await workshopService.adminDelete(id);
    return c.json({ success: true });
  }
}

export const workshopController = new WorkshopController();

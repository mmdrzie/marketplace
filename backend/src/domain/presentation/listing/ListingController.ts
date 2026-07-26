import type { Context } from 'hono';
import { CreateListingUseCase } from '../../application/listing/CreateListingUseCase.js';
import { UpdateListingUseCase } from '../../application/listing/UpdateListingUseCase.js';
import { SubmitListingUseCase } from '../../application/listing/SubmitListingUseCase.js';
import { ApproveListingUseCase } from '../../application/listing/ApproveListingUseCase.js';
import { DeleteListingUseCase } from '../../application/listing/DeleteListingUseCase.js';
import { RejectListingUseCase } from '../../application/listing/RejectListingUseCase.js';
import { MarkSoldListingUseCase } from '../../application/listing/MarkSoldListingUseCase.js';
import { RenewListingUseCase } from '../../application/listing/RenewListingUseCase.js';
import { CreateListingCommand } from '../../application/listing/commands/CreateListingCommand.js';
import { UpdateListingCommand } from '../../application/listing/commands/UpdateListingCommand.js';
import { SubmitListingCommand } from '../../application/listing/commands/SubmitListingCommand.js';
import { ApproveListingCommand } from '../../application/listing/commands/ApproveListingCommand.js';
import { DeleteListingCommand } from '../../application/listing/commands/DeleteListingCommand.js';
import { RejectListingCommand } from '../../application/listing/commands/RejectListingCommand.js';
import { MarkSoldListingCommand } from '../../application/listing/commands/MarkSoldListingCommand.js';
import { RenewListingCommand } from '../../application/listing/commands/RenewListingCommand.js';
import { ListingRepository } from '../../entities/listing/Listing.repository.js';

export class ListingController {
  constructor(
    private readonly repo: ListingRepository,
    private readonly createUseCase: CreateListingUseCase,
    private readonly updateUseCase: UpdateListingUseCase,
    private readonly submitUseCase: SubmitListingUseCase,
    private readonly approveUseCase: ApproveListingUseCase,
    private readonly deleteUseCase: DeleteListingUseCase,
    private readonly rejectUseCase: RejectListingUseCase,
    private readonly markSoldUseCase: MarkSoldListingUseCase,
    private readonly renewUseCase: RenewListingUseCase,
  ) {}

  async create(c: Context): Promise<Response> {
    const body = await c.req.json();
    const user = c.get('user');
    const cmd = new CreateListingCommand(
      user.id, body.categoryId, body.provinceId, body.cityId,
      body.title, body.description, body.price, body.priceType,
      body.vehicleVariantId,
    );
    const dto = await this.createUseCase.execute(cmd);
    return c.json({ data: dto }, 201);
  }

  async update(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const body = await c.req.json();
    const user = c.get('user');
    const cmd = new UpdateListingCommand(
      id, user.id, body.title, body.description,
      body.price, body.priceType, body.categoryId,
      body.provinceId, body.cityId, body.vehicleVariantId,
    );
    const dto = await this.updateUseCase.execute(cmd);
    return c.json({ data: dto });
  }

  async submit(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const dto = await this.submitUseCase.execute(new SubmitListingCommand(id, user.id));
    return c.json({ data: dto });
  }

  async approve(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const dto = await this.approveUseCase.execute(new ApproveListingCommand(id, user.id));
    return c.json({ data: dto });
  }

  async reject(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const dto = await this.rejectUseCase.execute(new RejectListingCommand(id, user.id));
    return c.json({ data: dto });
  }

  async markSold(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const dto = await this.markSoldUseCase.execute(new MarkSoldListingCommand(id, user.id));
    return c.json({ data: dto });
  }

  async renew(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    const dto = await this.renewUseCase.execute(new RenewListingCommand(id, user.id));
    return c.json({ data: dto });
  }

  async delete(c: Context): Promise<Response> {
    const id = Number(c.req.param('id'));
    const user = c.get('user');
    await this.deleteUseCase.execute(new DeleteListingCommand(id, user.id));
    return c.json({ message: 'Deleted' });
  }

  async list(c: Context): Promise<Response> {
    const { scope, categoryId, provinceId, page, limit, sort } = c.req.query();
    const user = c.get('user');
    const result = await this.repo.findAll({
      scope: scope as 'all' | 'me' | undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      provinceId: provinceId ? Number(provinceId) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort,
    });
    return c.json({ data: result.items.map(l => l.snapshot()), total: result.total });
  }

  async getBySlug(c: Context): Promise<Response> {
    const listing = await this.repo.findBySlug(c.req.param('slug'));
    if (!listing) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: listing.snapshot() });
  }
}

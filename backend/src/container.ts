import { transactionManager } from './domain/infrastructure/outbox/TransactionManager.js';
import { ListingProjectionRepositoryImpl } from './domain/projection/listing/ListingProjection.repository.impl.js';
import { VehicleProjectionRepositoryImpl } from './domain/projection/vehicle/VehicleProjection.repository.impl.js';

import { ListingRepositoryImpl } from './domain/infrastructure/listing/ListingRepository.impl.js';
import { UserRepositoryImpl } from './domain/infrastructure/user/UserRepository.impl.js';
import { ConversationRepositoryImpl } from './domain/infrastructure/conversation/ConversationRepository.impl.js';
import { MessageRepositoryImpl } from './domain/infrastructure/conversation/MessageRepository.impl.js';
import { DealerRepositoryImpl } from './domain/infrastructure/dealer/DealerRepository.impl.js';
import { VehicleRepositoryImpl } from './domain/infrastructure/vehicle/VehicleRepository.impl.js';
import { TaxonomyRepositoryImpl } from './domain/infrastructure/taxonomy/TaxonomyRepository.impl.js';
import { PaymentRepositoryImpl } from './domain/infrastructure/payment/PaymentRepository.impl.js';
import { TenderRepositoryImpl } from './domain/infrastructure/tender/TenderRepository.impl.js';
import { NotificationRepositoryImpl } from './domain/infrastructure/notification/NotificationRepository.impl.js';
import { OutboxRepositoryImpl } from './domain/infrastructure/outbox/OutboxRepository.impl.js';
import { IdempotencyRepositoryImpl } from './domain/infrastructure/idempotency/IdempotencyRepository.impl.js';
import { ProvinceRepositoryImpl } from './domain/infrastructure/province/ProvinceRepository.impl.js';
import { CategoryRepositoryImpl } from './domain/infrastructure/category/CategoryRepository.impl.js';
import { AttributeRepositoryImpl } from './domain/infrastructure/attribute/AttributeRepository.impl.js';
import { ArticleRepositoryImpl } from './domain/infrastructure/article/ArticleRepository.impl.js';
import { ContentRepositoryImpl } from './domain/infrastructure/content/ContentRepository.impl.js';
import { ContentService } from './domain/services/contentService.js';
import { FavoriteRepositoryImpl } from './domain/infrastructure/favorite/FavoriteRepository.impl.js';
import { NotificationPreferencesRepositoryImpl } from './domain/infrastructure/notificationPreferences/NotificationPreferencesRepository.impl.js';


import { CreateListingUseCase } from './domain/application/listing/CreateListingUseCase.js';
import { UpdateListingUseCase } from './domain/application/listing/UpdateListingUseCase.js';
import { SubmitListingUseCase } from './domain/application/listing/SubmitListingUseCase.js';
import { ApproveListingUseCase } from './domain/application/listing/ApproveListingUseCase.js';
import { DeleteListingUseCase } from './domain/application/listing/DeleteListingUseCase.js';
import { RejectListingUseCase } from './domain/application/listing/RejectListingUseCase.js';
import { MarkSoldListingUseCase } from './domain/application/listing/MarkSoldListingUseCase.js';
import { RenewListingUseCase } from './domain/application/listing/RenewListingUseCase.js';

import { CreateBrandUseCase } from './domain/application/vehicle/CreateBrandUseCase.js';
import { CreateModelUseCase } from './domain/application/vehicle/CreateModelUseCase.js';
import { CreateVariantUseCase } from './domain/application/vehicle/CreateVariantUseCase.js';

import { ListingController } from './domain/presentation/listing/ListingController.js';
import { UserController } from './domain/presentation/user/UserController.js';
import { VehicleController } from './domain/presentation/vehicle/VehicleController.js';
import { TaxonomyController } from './domain/presentation/taxonomy/TaxonomyController.js';
import { PaymentController } from './domain/presentation/payment/PaymentController.js';
import { TenderController } from './domain/presentation/tender/TenderController.js';
import { ProvinceController } from './domain/presentation/province/ProvinceController.js';
import { CategoryController } from './domain/presentation/category/CategoryController.js';
import { AttributeController } from './domain/presentation/attribute/AttributeController.js';
import { ArticleController } from './domain/presentation/article/ArticleController.js';
import { ContentController } from './domain/presentation/content/ContentController.js';
import { FavoriteController } from './domain/presentation/favorite/FavoriteController.js';
import { NotificationPreferencesController } from './domain/presentation/notificationPreferences/NotificationPreferencesController.js';
import { EmailVerificationController } from './domain/presentation/email/EmailVerificationController.js';
import { PhoneVerificationController } from './domain/presentation/phone/PhoneVerificationController.js';
import { AdminController } from './domain/presentation/admin/AdminController.js';
import { DealerController } from './domain/presentation/dealer/DealerController.js';
import { StoreController } from './domain/presentation/store/StoreController.js';

import { OutboxWorker } from './domain/infrastructure/outbox/OutboxWorker.js';
import { ConversationProjectionRepositoryImpl } from './domain/infrastructure/conversation/ConversationProjectionRepository.impl.js';
import { ConversationSummaryRepositoryImpl } from './domain/infrastructure/conversation/ConversationSummaryRepository.impl.js';
import { realtimeBroadcaster } from './domain/infrastructure/realtime/RealtimeBroadcaster.js';

const listingRepo = new ListingRepositoryImpl();
const userRepo = new UserRepositoryImpl();
const conversationRepo = new ConversationRepositoryImpl();
const messageRepo = new MessageRepositoryImpl();
const dealerRepo = new DealerRepositoryImpl();
const vehicleRepo = new VehicleRepositoryImpl();
const taxonomyRepo = new TaxonomyRepositoryImpl();
const paymentRepo = new PaymentRepositoryImpl();
const tenderRepo = new TenderRepositoryImpl();
const notificationRepo = new NotificationRepositoryImpl();
const outboxRepo = new OutboxRepositoryImpl();
const idempotencyRepo = new IdempotencyRepositoryImpl();
const provinceRepo = new ProvinceRepositoryImpl();
const categoryRepo = new CategoryRepositoryImpl();
const attributeRepo = new AttributeRepositoryImpl();
const articleRepo = new ArticleRepositoryImpl();
const contentRepo = new ContentRepositoryImpl();
const contentService = new ContentService();
const favoriteRepo = new FavoriteRepositoryImpl();
const notificationPrefsRepo = new NotificationPreferencesRepositoryImpl();


const createListingUseCase = new CreateListingUseCase(listingRepo, undefined, transactionManager, outboxRepo);
const updateListingUseCase = new UpdateListingUseCase(listingRepo);
const submitListingUseCase = new SubmitListingUseCase(listingRepo);
const approveListingUseCase = new ApproveListingUseCase(listingRepo);
const deleteListingUseCase = new DeleteListingUseCase(listingRepo);
const rejectListingUseCase = new RejectListingUseCase(listingRepo);
const markSoldListingUseCase = new MarkSoldListingUseCase(listingRepo);
const renewListingUseCase = new RenewListingUseCase(listingRepo);
const createBrandUseCase = new CreateBrandUseCase(vehicleRepo);
const createModelUseCase = new CreateModelUseCase(vehicleRepo);
const createVariantUseCase = new CreateVariantUseCase(vehicleRepo);

export const listingController = new ListingController(
  listingRepo,
  createListingUseCase,
  updateListingUseCase,
  submitListingUseCase,
  approveListingUseCase,
  deleteListingUseCase,
  rejectListingUseCase,
  markSoldListingUseCase,
  renewListingUseCase,
);

export const userController = new UserController();

export const vehicleController = new VehicleController(
  createBrandUseCase,
  createModelUseCase,
  createVariantUseCase,
  vehicleRepo,
);

export const taxonomyController = new TaxonomyController(taxonomyRepo);

export const paymentController = new PaymentController(paymentRepo);

export const tenderController = new TenderController(tenderRepo);

export const provinceController = new ProvinceController(provinceRepo);
export const categoryController = new CategoryController(categoryRepo);
export const attributeController = new AttributeController(attributeRepo);
export const articleController = new ArticleController(articleRepo);
export const contentController = new ContentController(contentRepo, contentService);
export const favoriteController = new FavoriteController(favoriteRepo);
export const notificationPrefsController = new NotificationPreferencesController(notificationPrefsRepo);
export const emailVerificationController = new EmailVerificationController();
export const phoneVerificationController = new PhoneVerificationController();
export const adminController = new AdminController();
export const dealerController = new DealerController();
export const storeController = new StoreController();

const projectionRepo = new ConversationProjectionRepositoryImpl();
const summaryRepo = new ConversationSummaryRepositoryImpl();
const listingProjectionRepo = new ListingProjectionRepositoryImpl();
const vehicleProjectionRepo = new VehicleProjectionRepositoryImpl();

export const outboxWorker = new OutboxWorker(
  outboxRepo,
  projectionRepo,
  summaryRepo,
  undefined,
  realtimeBroadcaster,
  undefined,
  undefined,
  idempotencyRepo,
  listingProjectionRepo,
  vehicleProjectionRepo,
);

export const di = {
  repos: {
    listing: listingRepo,
    user: userRepo,
    conversation: conversationRepo,
    message: messageRepo,
    dealer: dealerRepo,
    vehicle: vehicleRepo,
    taxonomy: taxonomyRepo,
    payment: paymentRepo,
    tender: tenderRepo,
    notification: notificationRepo,
    outbox: outboxRepo,
    idempotency: idempotencyRepo,
    province: provinceRepo,
    category: categoryRepo,
    attribute: attributeRepo,
    article: articleRepo,
    content: contentRepo,
    favorite: favoriteRepo,
    notificationPreferences: notificationPrefsRepo,
  },
  services: {
    content: contentService,
  },
  projection: {
    listing: listingProjectionRepo,
    vehicle: vehicleProjectionRepo,
    conversation: projectionRepo,
    summary: summaryRepo,
  },
  useCases: {
    createListing: createListingUseCase,
    updateListing: updateListingUseCase,
    submitListing: submitListingUseCase,
    approveListing: approveListingUseCase,
    deleteListing: deleteListingUseCase,
    rejectListing: rejectListingUseCase,
    markSoldListing: markSoldListingUseCase,
    renewListing: renewListingUseCase,
    createBrand: createBrandUseCase,
    createModel: createModelUseCase,
    createVariant: createVariantUseCase,
  },
  controllers: {
    listing: listingController,
    user: userController,
    vehicle: vehicleController,
    taxonomy: taxonomyController,
    payment: paymentController,
    tender: tenderController,
    province: provinceController,
    category: categoryController,
    attribute: attributeController,
    article: articleController,
    favorite: favoriteController,
    notificationPreferences: notificationPrefsController,
    emailVerification: emailVerificationController,
    phoneVerification: phoneVerificationController,
    admin: adminController,
    dealer: dealerController,
    store: storeController,
  },
  outboxWorker,
};

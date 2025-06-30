// ==================== ENUMS ====================

export enum Role {
    AGENT = 'AGENT',
    CHEF_SERVICE = 'CHEF_SERVICE',
    CONSUL = 'CONSUL',
    ADMIN = 'ADMIN'
}

export enum UserType {
    DEMANDEUR = 'DEMANDEUR',
    PERSONNEL = 'PERSONNEL'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum ServiceType {
    VISA = 'VISA',
    BIRTH_ACT_APPLICATION = 'BIRTH_ACT_APPLICATION',
    CONSULAR_CARD = 'CONSULAR_CARD',
    LAISSEZ_PASSER = 'LAISSEZ_PASSER',
    MARRIAGE_CAPACITY_ACT = 'MARRIAGE_CAPACITY_ACT',
    DEATH_ACT_APPLICATION = 'DEATH_ACT_APPLICATION',
    POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
    NATIONALITY_CERTIFICATE = 'NATIONALITY_CERTIFICATE'
}

export enum RequestStatus {
    NEW = 'NEW',
    IN_REVIEW_DOCS = 'IN_REVIEW_DOCS',
    PENDING_ADDITIONAL_INFO = 'PENDING_ADDITIONAL_INFO',
    APPROVED_BY_AGENT = 'APPROVED_BY_AGENT',
    APPROVED_BY_CHEF = 'APPROVED_BY_CHEF',
    APPROVED_BY_CONSUL = 'APPROVED_BY_CONSUL',
    REJECTED = 'REJECTED',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    DELIVERED = 'DELIVERED',
    ARCHIVED = 'ARCHIVED',
    EXPIRED = 'EXPIRED',
    RENEWAL_REQUESTED = 'RENEWAL_REQUESTED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    MOBILE_MONEY = 'MOBILE_MONEY',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    OTHER = 'OTHER'
}

export enum PassportType {
    ORDINARY = 'ORDINARY',
    SERVICE = 'SERVICE',
    DIPLOMATIC = 'DIPLOMATIC'
}

export enum VisaType {
    SHORT_STAY = 'SHORT_STAY',
    LONG_STAY = 'LONG_STAY',
    TRANSIT = 'TRANSIT',
    OTHER = 'OTHER'
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export enum MaritalStatus {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED',
    OTHER = 'OTHER'
}

export enum BirthActRequestType {
    NEWBORN = 'NEWBORN',
    RENEWAL = 'RENEWAL'
}

export enum JustificationDocumentType {
    PASSPORT = 'PASSPORT',
    NATIONAL_ID_CARD = 'NATIONAL_ID_CARD',
    BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
    OTHER = 'OTHER'
}

export enum AccompanyingDocumentType {
    OLD_PASSPORT = 'OLD_PASSPORT',
    CONSULAR_CARD = 'CONSULAR_CARD',
    OTHER = 'OTHER'
}

export enum OriginCountryParentRelationshipType {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER'
}

export enum ExpenseCategory {
    SALARIES = 'SALARIES',
    GENERAL_OVERHEAD = 'GENERAL_OVERHEAD',
    RENT = 'RENT',
    INTERNET_COMM = 'INTERNET_COMM',
    UTILITIES = 'UTILITIES',
    OTHER = 'OTHER'
}

// ==================== BASE INTERFACES ====================

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== USER INTERFACES ====================

export interface User extends BaseEntity {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: Role;
    type: UserType;
    status: UserStatus;
}

export interface UserWithRelations extends User {
    requests?: Request[];
    uploadedDocuments?: Document[];
    statusChanges?: RequestStatusHistory[];
    recordedPayments?: Payment[];
    news?: News[];
    events?: Event[];
    expenses?: Expense[];
    services?: Service[];
    settings?: Setting[];
}

// ==================== REQUEST INTERFACES ====================

export interface Request extends BaseEntity {
    ticketNumber: string;
    userId: string;
    serviceType: ServiceType;
    status: RequestStatus;
    submissionDate: Date;
    completionDate?: Date;
    issuedDate?: Date;
    contactPhoneNumber?: string;
    observations?: string;
    amount: number;
}

export interface RequestWithRelations extends Request {
    user?: User;
    documents?: Document[];
    statusHistory?: RequestStatusHistory[];
    visaDetails?: VisaRequestDetails;
    birthActDetails?: BirthActRequestDetails;
    consularCardDetails?: ConsularCardRequestDetails;
    laissezPasserDetails?: LaissezPasserRequestDetails;
    marriageCapacityActDetails?: MarriageCapacityActRequestDetails;
    deathActDetails?: DeathActRequestDetails;
    powerOfAttorneyDetails?: PowerOfAttorneyRequestDetails;
    nationalityCertificateDetails?: NationalityCertificateRequestDetails;
    payment?: Payment;
}

// ==================== DOCUMENT INTERFACES ====================

export interface Document extends BaseEntity {
    fileName: string;
    mimeType: string;
    filePath: string;
    fileSizeKB: number;
    requestId: string;
    uploaderId: string;
}

export interface DocumentWithRelations extends Document {
    request?: Request;
    uploader?: User;
}

// ==================== STATUS HISTORY INTERFACES ====================

export interface RequestStatusHistory {
    id: string;
    requestId: string;
    oldStatus?: RequestStatus;
    newStatus: RequestStatus;
    changerId: string;
    changedAt: Date;
    reason?: string;
}

export interface RequestStatusHistoryWithRelations extends RequestStatusHistory {
    request?: Request;
    changer?: User;
}

// ==================== PAYMENT INTERFACES ====================

export interface Payment extends BaseEntity {
    requestId: string;
    amount: number;
    paymentDate: Date;
    method: PaymentMethod;
    transactionRef?: string;
    recordedById: string;
}

export interface PaymentWithRelations extends Payment {
    request?: Request;
    recordedBy?: User;
}

// ==================== SERVICE DETAIL INTERFACES ====================

export interface VisaRequestDetails extends BaseEntity {
    requestId: string;
    personFirstName: string;
    personLastName: string;
    personGender: Gender;
    personNationality: string;
    personBirthDate: Date;
    personBirthPlace: string;
    personMaritalStatus: MaritalStatus;
    passportType: PassportType;
    passportNumber: string;
    passportIssuedBy: string;
    passportIssueDate: Date;
    passportExpirationDate: Date;
    profession?: string;
    employerAddress?: string;
    employerPhoneNumber?: string;
    visaType: VisaType;
    durationMonths: number;
    destinationState?: string;
    visaExpirationDate?: Date;
}

export interface BirthActRequestDetails extends BaseEntity {
    requestId: string;
    personFirstName: string;
    personLastName: string;
    personBirthDate: Date;
    personBirthPlace: string;
    personNationality: string;
    personDomicile?: string;
    fatherFullName: string;
    motherFullName: string;
    requestType: BirthActRequestType;
}

export interface ConsularCardRequestDetails extends BaseEntity {
    requestId: string;
    personFirstName: string;
    personLastName: string;
    personBirthDate: Date;
    personBirthPlace: string;
    personProfession?: string;
    personNationality: string;
    personDomicile?: string;
    personAddressInOriginCountry?: string;
    fatherFullName?: string;
    motherFullName?: string;
    justificationDocumentType?: JustificationDocumentType;
    justificationDocumentNumber?: string;
    cardExpirationDate?: Date;
}

export interface LaissezPasserRequestDetails extends BaseEntity {
    requestId: string;
    personFirstName: string;
    personLastName: string;
    personBirthDate: Date;
    personBirthPlace: string;
    personProfession?: string;
    personNationality: string;
    personDomicile?: string;
    fatherFullName?: string;
    motherFullName?: string;
    destination?: string;
    travelReason?: string;
    accompanied: boolean;
    justificationDocumentType?: JustificationDocumentType;
    justificationDocumentNumber?: string;
    laissezPasserExpirationDate: Date;
}

export interface LaissezPasserRequestDetailsWithRelations extends LaissezPasserRequestDetails {
    accompaniers?: Accompanier[];
}

export interface Accompanier extends BaseEntity {
    laissezPasserRequestDetailsId: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    birthPlace: string;
    nationality: string;
    domicile?: string;
}

export interface MarriageCapacityActRequestDetails extends BaseEntity {
    requestId: string;
    husbandFirstName: string;
    husbandLastName: string;
    husbandBirthDate: Date;
    husbandBirthPlace: string;
    husbandNationality: string;
    husbandDomicile?: string;
    wifeFirstName: string;
    wifeLastName: string;
    wifeBirthDate: Date;
    wifeBirthPlace: string;
    wifeNationality: string;
    wifeDomicile?: string;
}

export interface DeathActRequestDetails extends BaseEntity {
    requestId: string;
    deceasedFirstName: string;
    deceasedLastName: string;
    deceasedBirthDate: Date;
    deceasedDeathDate: Date;
    deceasedNationality: string;
}

export interface PowerOfAttorneyRequestDetails extends BaseEntity {
    requestId: string;
    agentFirstName: string;
    agentLastName: string;
    agentJustificationDocumentType?: JustificationDocumentType;
    agentIdDocumentNumber?: string;
    agentAddress?: string;
    principalFirstName: string;
    principalLastName: string;
    principalJustificationDocumentType?: JustificationDocumentType;
    principalIdDocumentNumber?: string;
    principalAddress?: string;
    powerOfType?: string;
    reason?: string;
}

export interface NationalityCertificateRequestDetails extends BaseEntity {
    requestId: string;
    applicantFirstName: string;
    applicantLastName: string;
    applicantBirthDate: Date;
    applicantBirthPlace: string;
    applicantNationality: string;
    originCountryParentFirstName: string;
    originCountryParentLastName: string;
    originCountryParentRelationship: OriginCountryParentRelationshipType;
}

// ==================== CMS INTERFACES ====================

export interface News extends BaseEntity {
    title: string;
    content: string;
    imageUrl?: string;
    published: boolean;
    authorId: string;
}

export interface NewsWithRelations extends News {
    author?: User;
}

export interface Event extends BaseEntity {
    title: string;
    description: string;
    eventDate: Date;
    location?: string;
    imageUrl?: string;
    published: boolean;
    authorId: string;
}

export interface EventWithRelations extends Event {
    author?: User;
}

export interface Photo extends BaseEntity {
    title?: string;
    description?: string;
    imageUrl: string;
}

export interface Video extends BaseEntity {
    title?: string;
    description?: string;
    youtubeUrl: string;
}

// ==================== EXPENSE INTERFACES ====================

export interface Expense extends BaseEntity {
    amount: number;
    description?: string;
    category: ExpenseCategory;
    recordedById: string;
    expenseDate: Date;
}

export interface ExpenseWithRelations extends Expense {
    recordedBy?: User;
}

// ==================== SERVICE INTERFACES ====================

export interface Service extends BaseEntity {
    type: ServiceType;
    name: string;
    description?: string;
    defaultPrice: number;
    isPriceVariable: boolean;
    updatedById?: string;
}

export interface ServiceWithRelations extends Service {
    updatedBy?: User;
}

// ==================== SETTING INTERFACES ====================

export interface Setting extends BaseEntity {
    key: string;
    value: string;
    description?: string;
    updatedById?: string;
}

export interface SettingWithRelations extends Setting {
    updatedBy?: User;
}

// ==================== API RESPONSE INTERFACES ====================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<PaginatedResponse<T>> { }

// ==================== FORM INTERFACES ====================

// Create interfaces (sans id, createdAt, updatedAt)
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateRequestData = Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>;
export type CreateDocumentData = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>;
export type CreatePaymentData = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateNewsData = Omit<News, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateExpenseData = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateSettingData = Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>;

// Update interfaces (tous les champs optionnels sauf id)
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateRequestData = Partial<Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>>;
export type UpdateDocumentData = Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdatePaymentData = Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateNewsData = Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateEventData = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateExpenseData = Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateServiceData = Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>;
export type UpdateSettingData = Partial<Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>>;

// ==================== QUERY INTERFACES ====================

export interface RequestFilters {
    status?: RequestStatus;
    serviceType?: ServiceType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    ticketNumber?: string;
}

export interface UserFilters {
    type?: UserType;
    status?: UserStatus;
    role?: Role;
    email?: string;
}

export interface PaymentFilters {
    method?: PaymentMethod;
    startDate?: Date;
    endDate?: Date;
    recordedById?: string;
}

export interface ExpenseFilters {
    category?: ExpenseCategory;
    startDate?: Date;
    endDate?: Date;
    recordedById?: string;
}

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: SortOptions;
    search?: string;
}

// ==================== AUTH INTERFACES ====================

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface AuthUser extends User {
    permissions?: string[];
}

// ==================== STATISTICS INTERFACES ====================

export interface DashboardStats {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    totalRevenue: number;
    recentRequests: RequestWithRelations[];
    requestsByService: { [key in ServiceType]: number };
    requestsByStatus: { [key in RequestStatus]: number };
    monthlyRevenue: { month: string; revenue: number }[];
}

export interface ServiceStats {
    serviceType: ServiceType;
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    totalRevenue: number;
    averageProcessingTime: number;
}

// ==================== NOTIFICATION INTERFACES ====================

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
    userId: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
}

// ==================== FILE UPLOAD INTERFACES ====================

export interface FileUploadResponse {
    fileName: string;
    filePath: string;
    mimeType: string;
    fileSizeKB: number;
    url: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}
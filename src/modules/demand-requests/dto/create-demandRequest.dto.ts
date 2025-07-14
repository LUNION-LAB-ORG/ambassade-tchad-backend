// src/modules/requests/dto/create-request.dto.ts
import {
    IsEnum,
    IsOptional,
    ValidateNested,
    IsDateString,
    IsString,
    IsNumber,
    IsInt,
    IsArray,
    ArrayMinSize,
    IsNotEmpty,
    MaxLength,
    IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
    ServiceType,
    Gender,
    MaritalStatus,
    PassportType,
    VisaType,
    BirthActRequestType,
    JustificationDocumentType,
    OriginCountryParentRelationshipType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Exemple de VisaRequestDetailsDto
export class VisaRequestDetailsDto {
    @ApiProperty({
        description: "le prenom du demandeur de visa",
        example: "Anderson",
        required: true,
        maxLength: 255
    })
    @IsString({message: "Le prenom doit être une chaîne de caractères."})
    @MaxLength(255, {message: 'Le prenom ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le prenom est obligatoire.' })
    personFirstName: string;

    @ApiProperty({
        description: "le nom du demandeur de visa",
        example: "Kouassi",
        required: true,
        maxLength: 255
    })
    @IsString({message: "Le nom doit être une chaîne de caractères."})
    @MaxLength(255, {message: 'Le nom ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le nom est obligatoire.' })
    // @Transform(({ value }) => value.trim())    
    personLastName: string;

    @ApiProperty({
        description: "le genre du demandeur de visa",
        example: "feminin",
        required: true,
        maxLength: 255
    })
    @IsString({message: "Le genre doit être une chaîne de caractères."})
    @MaxLength(255, {message: 'Le genre ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le genre est obligatoire.' })
    // @Transform(({ value }) => value.trim())    
    @IsEnum(Gender) 
    personGender: Gender;

    @ApiProperty({
        description: "la nationalité du demandeur de visa",
        example: "Français",
        required: true,
        maxLength: 255
    })
    @IsString({message: "La nationalité doit être une chaîne de caractères."})
    @MaxLength(255, {message: 'La nationalité ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
    // @Transform(({ value }) => value.trim())  
    personNationality: string;

    @ApiProperty({
        description: "la date de naissance du demandeur de visa",
        example: "15/10/2025",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'La date de naissance ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
    // @Transform(({ value }) => value.trim())  
    @IsDateString() 
    personBirthDate: string;

    @ApiProperty({
        description: "le lieu de naissance du demandeur de visa",
        example: "Lyon",
        required: true,
        maxLength: 255
    })
    @IsString({message: "Le lieu de naissance doit être une chaîne de caractères."})
    @MaxLength(255, {message: 'Le lieu de naissance ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
    // @Transform(({ value }) => value.trim())  
    @IsString() personBirthPlace: string;

    @ApiProperty({
        description: "le statut matrimonial du demandeur de visa",
        example: "Celibataire",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'Le statut matrimonial ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le statut matrimonial est obligatoire.' })
    // @Transform(({ value }) => value.trim())  
    @IsEnum(MaritalStatus) 
    personMaritalStatus: MaritalStatus;

    
    @ApiProperty({
        description: "le type de passport du demandeur de visa",
        example: "Ordinaire",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'Le type de passport ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le type de passport est obligatoire.' })
    // @Transform(({ value }) => value.trim()) 
    @IsEnum(PassportType) 
    passportType: PassportType;

    
    @ApiProperty({
        description: "le numero du passport du demandeur de visa",
        example: "PA2545kkdjh478",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'Le numero du passport ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Le numer du passport est obligatoire.' })
    // @Transform(({ value }) => value.trim()) 
    @IsString({message: "Le numero du passport doit être une chaîne de caractère"}) 
    passportNumber: string;

    
    @ApiProperty({
        description: "le pays de delivrance du passport du demandeur de visa",
        example: "france",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'Le pays de delivrance du passport ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'Lepays de delivrance du passport est obligatoire.' })
    // @Transform(({ value }) => value.trim()) 
    @IsString({message: "Le pays de delivrance du passport doit être une chaîne de caractère"}) 
    passportIssuedBy: string;

    @ApiProperty({
        description: "la date de delivrance du passport du demandeur de visa",
        example: "12/04/2025",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'La date de delivrance du passport ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'La date de delivrance du passport est obligatoire.' })
    // @Transform(({ value }) => value.trim()) 
    @IsDateString() 
    passportIssueDate: string;

    @ApiProperty({
        description: "la date d'expiration du passport du demandeur de visa",
        example: "05/10/2023",
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'la date d\'expiration du passport ne doit pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'la date d\'expiration du passport est obligatoire.' })
    // @Transform(({ value }) => value.trim()) 
    @IsDateString() 
    passportExpirationDate: string;

    @ApiProperty({
        description: "la profession du demandeur de visa",
        example: "Informaticien",
        required: false,
        maxLength: 255
    })
    @MaxLength(255, {message: 'la  profession pas dépasser 255 caractères.'})
    // @Transform(({ value }) => value.trim()) 
    @IsOptional()
    @IsString({message: 'La profession doit être une chaîne de caractère'}) 
    profession?: string;

    @ApiProperty({
        description: "l'addresse de votre employeur du demandeur de visa",
        example: "Lyon, france",
        required: false,
        maxLength: 255
    })
    // @MaxLength(255, {message: 'l\'addresse de votre employeur pas dépasser 255 caractères.'})
    @Transform(({ value }) => value.trim()) 
    @IsOptional() 
    @IsString({message: 'l\'addresse de votre employeur doit être une chaîne de caractère'}) 
    employerAddress?: string;

    @ApiProperty({
        description: "le numéro de téléphone de votre employeur du demandeur de visa",
        example: "+330142564875",
        required: false,
        maxLength: 255
    })
    @MaxLength(255, {message: 'le numéro de téléphone de votre employeur pas dépasser 255 caractères.'})
    // @Transform(({ value }) => value.trim()) 
    @IsOptional() 
    @IsString({message: 'le numéro de téléphone de votre employeur doit être une chaîne de caractère'})  
    employerPhoneNumber?: string;

    @ApiProperty({
        description: "le type de visa demandé",
        example: "COURT SEJOUR",
        required: true,
        maxLength: 255
    })
    // @MaxLength(255, {message: 'le numéro de téléphone de votre employeur pas dépasser 255 caractères.'})
    @IsNotEmpty({ message: 'le numéro de téléphone votre employeur est obligatoire.' })
    // @Transform(({ value }) => value.trim())
    @IsEnum(VisaType) 
    
    visaType: VisaType;

    @ApiProperty({
        description: "La durée de votre sejour",
        example: 5,
        required: true,
        maxLength: 255
    })
    // @MaxLength(10, {message: 'La durée de votre sejour pas dépasser 10 caractères.'})
    @IsNotEmpty({ message: 'La durée de votre sejour est obligatoire.' })
    // @Transform(({ value }) => value.trim())
    @IsInt({message: 'la durée de votre sejour est un entier'}) 
    durationMonths: number;

    @ApiProperty({
        description: "La ville de votre destination",
        example: 5,
        required: true,
        maxLength: 255
    })
    @MaxLength(255, {message: 'La ville de votre destination pas dépasser 255 caractères.'})
    // @Transform(({ value }) => value.trim())
    @IsOptional() 
    @IsString({message: "La ville doit etre une chaîne de caractère"}) 
    destinationState?: string;
}

// DTO pour demande d'extrait d'acte de naissance
export class BirthActRequestDetailsDto {
    
    @ApiProperty({
        description: "Prénom de la personne concernée par l'acte de naissance",
        example: "Anderson",
        maxLength: 255,
    })
    @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le prénom ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
    personFirstName: string;

    @ApiProperty({
        description: "Nom de la personne concernée par l'acte de naissance",
        example: "Kouassi",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom est obligatoire.' })
    personLastName: string;

    @ApiProperty({
        description: "Date de naissance de la personne concernée",
        example: "1995-06-15",
    })
    @IsDateString({}, { message: 'La date de naissance doit être une date ISO valide.' })
    @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
    personBirthDate: string;

    @ApiProperty({
        description: "Lieu de naissance de la personne concernée",
        example: "Abidjan",
        maxLength: 255,
    })
    @IsString({ message: 'Le lieu de naissance doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le lieu de naissance ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
    personBirthPlace: string;

    @ApiProperty({
        description: "Nationalité de la personne concernée",
        example: "Ivoirienne",
        maxLength: 255,
    })
    @IsString({ message: 'La nationalité doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'La nationalité ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
    personNationality: string;

    @ApiProperty({
        description: "Domicile de la personne (facultatif)",
        example: "Yopougon, Abidjan",
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString({ message: 'Le domicile doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le domicile ne doit pas dépasser 255 caractères.' })
    personDomicile?: string;

    @ApiProperty({
        description: "Nom complet du père",
        example: "Kouadio Jean-Baptiste",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom du père doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom du père ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom du père est obligatoire.' })
    fatherFullName: string;

    @ApiProperty({
        description: "Nom complet de la mère",
        example: "Koné Awa",
        maxLength: 255,
    })
    @IsString({ message: 'Le nom de la mère doit être une chaîne de caractères.' })
    @MaxLength(255, { message: 'Le nom de la mère ne doit pas dépasser 255 caractères.' })
    @IsNotEmpty({ message: 'Le nom de la mère est obligatoire.' })
    motherFullName: string;

    @ApiProperty({
        description: "Type de demande d'acte de naissance",
        example: "EXTRAIT",
        enum: BirthActRequestType,
    })
    @IsEnum(BirthActRequestType, { message: 'Le type de demande est invalide.' })
    @IsNotEmpty({ message: 'Le type de demande est obligatoire.' })
    requestType: BirthActRequestType;
}

// DTO pour la demande de carte consulaire
export class ConsularCardRequestDetailsDto {
  @ApiProperty({
    description: 'Prénom de la personne concernée',
    example: 'Anderson',
    maxLength: 255,
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le prénom ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  personFirstName: string;

  @ApiProperty({
    description: 'Nom de la personne concernée',
    example: 'Kouassi',
    maxLength: 255,
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  personLastName: string;

  @ApiProperty({
    description: 'Date de naissance',
    example: '1990-05-12',
  })
  @IsDateString({}, { message: 'La date de naissance doit être une date valide.' })
  @IsNotEmpty({ message: 'La date de naissance est obligatoire.' })
  personBirthDate: string;

  @ApiProperty({
    description: 'Lieu de naissance',
    example: 'Abidjan',
    maxLength: 255,
  })
  @IsString({ message: 'Le lieu de naissance doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le lieu de naissance ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'Le lieu de naissance est obligatoire.' })
  personBirthPlace: string;

  @ApiProperty({
    description: 'Profession (facultative)',
    example: 'Développeur web',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La profession doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'La profession ne doit pas dépasser 255 caractères.' })
  personProfession?: string;

  @ApiProperty({
    description: 'Nationalité',
    example: 'Ivoirienne',
    maxLength: 255,
  })
  @IsString({ message: 'La nationalité doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'La nationalité ne doit pas dépasser 255 caractères.' })
  @IsNotEmpty({ message: 'La nationalité est obligatoire.' })
  personNationality: string;

  @ApiProperty({
    description: 'Domicile (facultatif)',
    example: 'Yopougon, Abidjan',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le domicile doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le domicile ne doit pas dépasser 255 caractères.' })
  personDomicile?: string;

  @ApiProperty({
    description: "Adresse au pays d'origine (facultatif)",
    enum: OriginCountryParentRelationshipType,
    required: false,
  })
  @IsOptional()
  @IsEnum(OriginCountryParentRelationshipType, {
    message: "Le type de lien au pays d'origine est invalide.",
  })
  personAddressInOriginCountry?: OriginCountryParentRelationshipType;

  @ApiProperty({
    description: 'Nom complet du père (facultatif)',
    example: 'Kouadio Jean-Baptiste',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le nom du père doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom du père ne doit pas dépasser 255 caractères.' })
  fatherFullName?: string;

  @ApiProperty({
    description: 'Nom complet de la mère (facultatif)',
    example: 'Koné Awa',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le nom de la mère doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le nom de la mère ne doit pas dépasser 255 caractères.' })
  motherFullName?: string;

  @ApiProperty({
    description: 'Type de document justificatif (facultatif)',
    enum: JustificationDocumentType,
    required: false,
  })
  @IsOptional()
  @IsEnum(JustificationDocumentType, {
    message: 'Le type de document justificatif est invalide.',
  })
  justificationDocumentType?: JustificationDocumentType;

  @ApiProperty({
    description: 'Numéro du document justificatif (facultatif)',
    example: 'DOC123456',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Le numéro du document doit être une chaîne de caractères.' })
  @MaxLength(255, { message: 'Le numéro du document ne doit pas dépasser 255 caractères.' })
  justificationDocumentNumber?: string;
}


// DTO de la demande du certificat de nationalité
export class NationalityCertificateRequestDetailsDto {
  @ApiProperty({
    description: "Prénom du demandeur",
    example: "Anderson",
    maxLength: 255,
  })
  @IsString({ message: "Le prénom doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le prénom ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le prénom est obligatoire." })
  applicantFirstName: string;

  @ApiProperty({
    description: "Nom du demandeur",
    example: "Kouassi",
    maxLength: 255,
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le nom ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le nom est obligatoire." })
  applicantLastName: string;

  @ApiProperty({
    description: "Date de naissance du demandeur",
    example: "1990-05-12",
  })
  @IsDateString({}, { message: "La date de naissance doit être une date valide." })
  @IsNotEmpty({ message: "La date de naissance est obligatoire." })
  applicantBirthDate: string;

  @ApiProperty({
    description: "Lieu de naissance du demandeur",
    example: "Abidjan",
    maxLength: 255,
  })
  @IsString({ message: "Le lieu de naissance doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le lieu de naissance ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le lieu de naissance est obligatoire." })
  applicantBirthPlace: string;

  @ApiProperty({
    description: "Nationalité du demandeur",
    example: "Ivoirienne",
    maxLength: 255,
  })
  @IsString({ message: "La nationalité doit être une chaîne de caractères." })
  @MaxLength(255, { message: "La nationalité ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "La nationalité est obligatoire." })
  applicantNationality: string;

  @ApiProperty({
    description: "Prénom du parent dans le pays d'origine",
    example: "Jean",
    maxLength: 255,
  })
  @IsString({ message: "Le prénom du parent doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le prénom du parent ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le prénom du parent est obligatoire." })
  originCountryParentFirstName: string;

  @ApiProperty({
    description: "Nom du parent dans le pays d'origine",
    example: "Koffi",
    maxLength: 255,
  })
  @IsString({ message: "Le nom du parent doit être une chaîne de caractères." })
  @MaxLength(255, { message: "Le nom du parent ne doit pas dépasser 255 caractères." })
  @IsNotEmpty({ message: "Le nom du parent est obligatoire." })
  originCountryParentLastName: string;

  @ApiProperty({
    description: "Relation du parent dans le pays d'origine",
    enum: OriginCountryParentRelationshipType,
  })
  @IsEnum(OriginCountryParentRelationshipType, { message: "Le type de relation est invalide." })
  @IsNotEmpty({ message: "La relation avec le parent est obligatoire." })
  originCountryParentRelationship: OriginCountryParentRelationshipType;
}

// Dto si y'a un accompagnateur
export class AccompanierDto {
  @ApiProperty({
    description: "Prénom de l'accompagnant",
    example: 'Marie',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "Nom de l'accompagnant",
    example: 'Dupont',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: "Date de naissance de l'accompagnant",
    example: '1995-06-15',
  })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: "Lieu de naissance de l'accompagnant",
    example: 'Paris',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  birthPlace: string;

  @ApiProperty({
    description: "Nationalité de l'accompagnant",
    example: 'Française',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  nationality: string;

  @ApiPropertyOptional({
    description: "Domicile de l'accompagnant",
    example: 'Lyon',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domicile?: string;
}


// DTO de la demande d'un laisser-passer
export class LaissezPasserRequestDetailsDto {
  @ApiProperty({ description: "Prénom du demandeur", example: "Anderson" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personFirstName: string;

  @ApiProperty({ description: "Nom du demandeur", example: "Kouassi" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personLastName: string;

  @ApiProperty({ description: "Date de naissance", example: "1990-05-12" })
  @IsDateString()
  @IsNotEmpty()
  personBirthDate: string;

  @ApiProperty({ description: "Lieu de naissance", example: "Abidjan" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personBirthPlace: string;

  @ApiPropertyOptional({ description: "Profession", example: "Informaticien" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  personProfession?: string;

  @ApiProperty({ description: "Nationalité", example: "Ivoirienne" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personNationality: string;

  @ApiProperty({ description: "Domicile", example: "Cocody" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  personDomicile: string;

  @ApiProperty({ description: "Nom complet du père", example: "Jean Kouadio" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  fatherFullName: string;

  @ApiProperty({ description: "Nom complet de la mère", example: "Marie Kouadio" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  motherFullName: string;

  @ApiPropertyOptional({ description: "Destination", example: "Paris" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @ApiPropertyOptional({ description: "Motif du voyage", example: "Affaires" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  travelReason?: string;

  @ApiProperty({ description: "Accompagné ou non" })
  @IsBoolean()
  accompanied: boolean;

  @ApiPropertyOptional({ description: "Liste des accompagnants", type: [AccompanierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccompanierDto)
  accompaniers?: AccompanierDto[];

  @ApiProperty({ enum: JustificationDocumentType, description: "Type de document justificatif" })
  @IsEnum(JustificationDocumentType)
  @IsNotEmpty()
  justificationDocumentType: JustificationDocumentType;

  @ApiProperty({ description: "Numéro du document justificatif", example: "JD123456" })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  justificationDocumentNumber: string;

  @ApiProperty({ description: "Date d'expiration du laissez-passer", example: "2025-12-31" })
  @IsDateString()
  @IsNotEmpty()
  laissezPasserExpirationDate: string;
}

// DTO pour une demande capacité de mariage
export class MarriageCapacityActRequestDetailsDto {
  // Époux
  @ApiProperty({ description: 'Prénom de l’époux', example: 'Jean' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandFirstName: string;

  @ApiProperty({ description: 'Nom de l’époux', example: 'Dupont' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandLastName: string;

  @ApiProperty({ description: 'Date de naissance de l’époux', example: '1985-02-15' })
  @IsDateString()
  @IsNotEmpty()
  husbandBirthDate: Date;

  @ApiProperty({ description: 'Lieu de naissance de l’époux', example: 'Paris' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandBirthPlace: string;

  @ApiProperty({ description: 'Nationalité de l’époux', example: 'Française' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  husbandNationality: string;

  @ApiPropertyOptional({ description: 'Domicile de l’époux', example: 'Lyon' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  husbandDomicile?: string;

  // Épouse
  @ApiProperty({ description: 'Prénom de l’épouse', example: 'Sophie' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeFirstName: string;

  @ApiProperty({ description: 'Nom de l’épouse', example: 'Martin' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeLastName: string;

  @ApiProperty({ description: 'Date de naissance de l’épouse', example: '1990-08-10' })
  @IsDateString()
  @IsNotEmpty()
  wifeBirthDate: Date;

  @ApiProperty({ description: 'Lieu de naissance de l’épouse', example: 'Abidjan' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeBirthPlace: string;

  @ApiProperty({ description: 'Nationalité de l’épouse', example: 'Ivoirienne' })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  wifeNationality: string;

  @ApiPropertyOptional({ description: 'Domicile de l’épouse', example: 'Bouaké' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  wifeDomicile?: string;
}


// DTO demande un acte de décès
export class DeathActRequestDetailsDto {
  @ApiProperty({
    description: 'Prénom du défunt',
    example: 'Jean',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedFirstName: string;

  @ApiProperty({
    description: 'Nom du défunt',
    example: 'Kouadio',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedLastName: string;

  @ApiProperty({
    description: 'Date de naissance du défunt',
    example: '1950-04-22',
  })
  @IsDateString()
  @IsNotEmpty()
  deceasedBirthDate: Date;

  @ApiProperty({
    description: 'Date de décès du défunt',
    example: '2023-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  deceasedDeathDate: Date;

  @ApiProperty({
    description: 'Nationalité du défunt',
    example: 'Ivoirienne',
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  deceasedNationality: string;
}

// DTO demande de procuration
export class PowerOfAttorneyRequestDetailsDto {
  @ApiProperty({
    description: "Prénom de l'agent",
    example: "Jean",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentFirstName: string;

  @ApiProperty({
    description: "Nom de l'agent",
    example: "Doe",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentLastName: string;

  @ApiProperty({
    description: "Type de document justificatif de l'agent",
    enum: JustificationDocumentType,
    example: JustificationDocumentType.PASSPORT,
  })
  @IsEnum(JustificationDocumentType)
  agentJustificationDocumentType: JustificationDocumentType;

  @ApiProperty({
    description: "Numéro de pièce d'identité de l'agent",
    example: "CI123456789",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentIdDocumentNumber: string;

  @ApiProperty({
    description: "Adresse de l'agent",
    example: "Abidjan, Côte d'Ivoire",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  agentAddress: string;

  @ApiProperty({
    description: "Prénom du mandant (donneur de procuration)",
    example: "Fatou",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalFirstName: string;

  @ApiProperty({
    description: "Nom du mandant",
    example: "Koné",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalLastName: string;

  @ApiProperty({
    description: "Type de document justificatif du mandant",
    enum: JustificationDocumentType,
    example: JustificationDocumentType.NATIONAL_ID_CARD,
  })
  @IsEnum(JustificationDocumentType)
  principalJustificationDocumentType: JustificationDocumentType;

  @ApiProperty({
    description: "Numéro de pièce d'identité du mandant",
    example: "NID987654321",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalIdDocumentNumber: string;

  @ApiProperty({
    description: "Adresse du mandant",
    example: "Bouaké, Côte d'Ivoire",
  })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  principalAddress: string;

  @ApiProperty({
    description: "Type de procuration (facultatif)",
    example: "Générale",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  powerOfType?: string;

  @ApiProperty({
    description: "Raison de la procuration (facultatif)",
    example: "Gestion de biens en mon absence",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

// DTO pour les demandes

export class CreateDemandRequestDto {
  @ApiProperty({
    enum: ServiceType,
    description: 'Type de service demandé',
    example: ServiceType.VISA,
  })
  @IsEnum(ServiceType, { message: 'Type de service invalide.' })
  @IsNotEmpty({ message: 'Le type de service est requis.' })
  serviceType: ServiceType;

  @ApiPropertyOptional({ type: () => VisaRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VisaRequestDetailsDto)
  visaDetails?: VisaRequestDetailsDto;

  @ApiPropertyOptional({ type: () => BirthActRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BirthActRequestDetailsDto)
  birthActDetails?: BirthActRequestDetailsDto;

  @ApiPropertyOptional({ type: () => ConsularCardRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConsularCardRequestDetailsDto)
  consularCardDetails?: ConsularCardRequestDetailsDto;

  @ApiPropertyOptional({ type: () => LaissezPasserRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LaissezPasserRequestDetailsDto)
  laissezPasserDetails?: LaissezPasserRequestDetailsDto;

  @ApiPropertyOptional({ type: () => MarriageCapacityActRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarriageCapacityActRequestDetailsDto)
  marriageCapacityActDetails?: MarriageCapacityActRequestDetailsDto;

  @ApiPropertyOptional({ type: () => DeathActRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeathActRequestDetailsDto)
  deathActDetails?: DeathActRequestDetailsDto;

  @ApiPropertyOptional({ type: () => PowerOfAttorneyRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PowerOfAttorneyRequestDetailsDto)
  powerOfAttorneyDetails?: PowerOfAttorneyRequestDetailsDto;

  @ApiPropertyOptional({ type: () => NationalityCertificateRequestDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NationalityCertificateRequestDetailsDto)
  nationalityCertificateDetails?: NationalityCertificateRequestDetailsDto;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone de contact',
    example: '+2250701020304',
  })
  @IsOptional()
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne.' })
  contactPhoneNumber?: string;
}
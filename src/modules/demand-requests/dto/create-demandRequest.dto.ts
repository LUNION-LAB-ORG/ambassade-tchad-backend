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
import { ApiProperty } from '@nestjs/swagger';

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

// Tu peux ajouter les autres DTOs de la même façon...
export class BirthActRequestDetailsDto {
    @IsString() personFirstName: string;
    @IsString() personLastName: string;
    @IsDateString() personBirthDate: string;
    @IsString() personBirthPlace: string;
    @IsString() personNationality: string;
    @IsOptional() @IsString() personDomicile?: string;

    @IsString() fatherFullName: string;
    @IsString() motherFullName: string;
    @IsEnum(BirthActRequestType) requestType: BirthActRequestType;
}

export class ConsularCardRequestDetailsDto {
    @IsString() personFirstName: string;
    @IsString() personLastName: string;
    @IsDateString() personBirthDate: string;
    @IsString() personBirthPlace: string;
    @IsOptional() @IsString() personProfession?: string;
    @IsString() personNationality: string;
    @IsOptional() @IsString() personDomicile?: string;
    @IsOptional() @IsString() personAddressInOriginCountry?: string;

    @IsOptional() @IsString() fatherFullName?: string;
    @IsOptional() @IsString() motherFullName?: string;
    @IsOptional() @IsEnum(JustificationDocumentType) justificationDocumentType?: JustificationDocumentType;
    @IsOptional() @IsString() justificationDocumentNumber?: string;
}

export class NationalityCertificateRequestDetailsDto {

    @IsString() applicantFirstName: string;
    @IsString() applicantLastName: string;
    @IsDateString() applicantBirthDate: string;
    @IsString() applicantBirthPlace: string;
    @IsString() applicantNationality: string;
    @IsString() originCountryParentFirstName: string;
    @IsString() originCountryParentLastName: string;
    @IsEnum(OriginCountryParentRelationshipType) originCountryParentRelationship: OriginCountryParentRelationshipType;
}

export class LaissezPasserRequestDetailsDto {
  @IsString()
  personFirstName: string;

  @IsString()
  personLastName: string;

  @IsDateString()
  personBirthDate: Date;

  @IsString()
  personBirthPlace: string;

  @IsOptional()
  @IsString()
  personProfession?: string;

  @IsString()
  personNationality: string;

  @IsOptional()
  @IsString()
  personDomicile?: string;

  @IsOptional()
  @IsString()
  fatherFullName?: string;

  @IsOptional()
  @IsString()
  motherFullName?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  travelReason?: string;

  @IsBoolean()
  accompanied: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccompanierDto)
  accompaniers?: AccompanierDto[];

  @IsOptional()
  @IsString()
  justificationDocumentType?: string; // Enum si besoin

  @IsOptional()
  @IsString()
  justificationDocumentNumber?: string;

  @IsDateString()
  laissezPasserExpirationDate: Date;
}

// Dto si y'a un accompagnateur
export class AccompanierDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  birthPlace: string;

  @IsString()
  nationality: string;

  @IsOptional()
  @IsString()
  domicile?: string;
}

export class MarriageCapacityActRequestDetailsDto {
  @IsString()
  husbandFirstName: string;

  @IsString()
  husbandLastName: string;

  @IsDateString()
  husbandBirthDate: Date;

  @IsString()
  husbandBirthPlace: string;

  @IsString()
  husbandNationality: string;

  @IsOptional()
  @IsString()
  husbandDomicile?: string;

  @IsString()
  wifeFirstName: string;

  @IsString()
  wifeLastName: string;

  @IsDateString()
  wifeBirthDate: Date;

  @IsString()
  wifeBirthPlace: string;

  @IsString()
  wifeNationality: string;

  @IsOptional()
  @IsString()
  wifeDomicile?: string;
}

export class DeathActRequestDetailsDto {
  @IsString()
  deceasedFirstName: string;

  @IsString()
  deceasedLastName: string;

  @IsDateString()
  deceasedBirthDate: Date;

  @IsDateString()
  deceasedDeathDate: Date;

  @IsString()
  deceasedNationality: string;
}

export class PowerOfAttorneyRequestDetailsDto {
  @IsString()
  agentFirstName: string;

  @IsString()
  agentLastName: string;

  @IsOptional()
  @IsString()
  agentJustificationDocumentType?: string;

  @IsOptional()
  @IsString()
  agentIdDocumentNumber?: string;

  @IsOptional()
  @IsString()
  agentAddress?: string;

  @IsString()
  principalFirstName: string;

  @IsString()
  principalLastName: string;

  @IsOptional()
  @IsString()
  principalJustificationDocumentType?: string;

  @IsOptional()
  @IsString()
  principalIdDocumentNumber?: string;

  @IsOptional()
  @IsString()
  principalAddress?: string;

  @IsOptional()
  @IsString()
  powerOfType?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}


export class CreateDemandRequestDto {
    @IsEnum(ServiceType)
    serviceType: ServiceType;

    @IsOptional()
    @ValidateNested()
    @Type(() => VisaRequestDetailsDto)
    visaDetails?: VisaRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => BirthActRequestDetailsDto)
    birthActDetails?: BirthActRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConsularCardRequestDetailsDto)
    consularCardDetails?: ConsularCardRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LaissezPasserRequestDetailsDto)
    laissezPasserDetails?: LaissezPasserRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => MarriageCapacityActRequestDetailsDto)
    marriageCapacityActDetails?: MarriageCapacityActRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DeathActRequestDetailsDto)
    deathActDetails?: DeathActRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => PowerOfAttorneyRequestDetailsDto)
    powerOfAttorneyDetails?: PowerOfAttorneyRequestDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => NationalityCertificateRequestDetailsDto)
    nationalityCertificateDetails?: NationalityCertificateRequestDetailsDto;

    @IsOptional()
    @IsString()
    contactPhoneNumber?: string;
}

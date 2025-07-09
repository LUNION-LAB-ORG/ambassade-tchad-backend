import { PartialType } from "@nestjs/mapped-types";
import { CreatePhotosDto } from "./create-photos.dto";


export class UpdatePhotosDto extends PartialType(CreatePhotosDto) {}
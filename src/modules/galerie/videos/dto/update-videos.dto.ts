import { PartialType } from "@nestjs/mapped-types";
import { CreateVideosDto } from "./create-videos.dto";


export class UpdateVideosDto extends PartialType(CreateVideosDto) {}
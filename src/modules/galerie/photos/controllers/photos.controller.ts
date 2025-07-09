import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PhotosService } from '../services/photos.service';
import { CreatePhotosDto } from '../dto/create-photos.dto';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { Role } from '@prisma/client';

@Controller('photos')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  create(@Body() dto: CreatePhotosDto, @Request() req) {
    return this.photosService.create(dto);
  }

  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  @Get('/filter')
  filter(
    @Query('title') title?: string,
    @Query('authorId') authorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.photosService.findAllWithFilters({
      title,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('/stats')
  getStats() {
    return this.photosService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreatePhotosDto) {
    return this.photosService.update(id, dto);
  }

  @Delete(':id')
   @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.photosService.remove(id, req.user.id);
    return { message:  `La photo avec l'id ${id} supprimé avec succès.` };
  }
}

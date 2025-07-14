// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Query,
//   Request,
//   UseGuards,
//   Put,
// } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { EventsService } from '../service/events.service';
// import { CreateEventsDto } from '../dto/create-events.dto';
// import { UpdateEventsDto } from '../dto/update-events.dto';
// import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
// import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
// import { Role } from '@prisma/client';

// @Controller('events')
// @UseGuards(JwtAuthGuard, UserRolesGuard)
// @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
// export class EventsController {
//   constructor(private readonly eventsService: EventsService) {}

//   @Post()
//   create(@Body() dto: CreateEventsDto, @Request() req) {
//     return this.eventsService.create(dto, req.user.id);
//   }

//   @Get()
//   findAll() {
//     return this.eventsService.findAll(false);
//   }

//   // @Get('/admin')
//   // findAllAdmin() {
//   //   return this.eventsService.findAll(true);
//   // }

//   @Get('/filter')
//   filter(
//     @Query('title') title?: string,
//     @Query('authorId') authorId?: string,
//     @Query('published') published?: boolean,
//     @Query('fromDate') fromDate?: string,
//     @Query('toDate') toDate?: string,
//   ) {
//     return this.eventsService.findAllWithFilters({
//       title,
//       authorId,
//       published: published !== undefined ? published === true : undefined,
//       fromDate: fromDate ? new Date(fromDate) : undefined,
//       toDate: toDate ? new Date(toDate) : undefined,
//     });
//   }

//   @Get('/stats')
//   getStats() {
//     return this.eventsService.getStats();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.eventsService.findOne(id);

//   }

//   @Put(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() dto: UpdateEventsDto,
//     @Request() req,
//   ) {
//     const updatedEvent = await this.eventsService.update(id, dto, req.user.id);
//     return {
//       message: 'Événement mis à jour avec succès.',
//       data: updatedEvent,
//     };
//   }


//   @Delete(':id')
//    @UseGuards(JwtAuthGuard, UserRolesGuard)
//   @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
//   async remove(@Param('id') id: string, @Request() req) {
//     await this.eventsService.remove(id, req.user.id);
//     return { message:  `Evènement avec l'id ${id} supprimé avec succès.` };
//   }
// }

 import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { EventsService } from '../service/events.service';
import { CreateEventsDto } from '../dto/create-events.dto';
import { UpdateEventsDto } from '../dto/update-events.dto';
import { UserRolesGuard } from 'src/modules/users/guards/user-roles.guard';
import { UserRoles } from 'src/modules/users/decorators/user-roles.decorator';
import { Role } from '@prisma/client';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Événements')
@Controller('events')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Événement créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({status:401, description: 'Vous n\'avez pas les droits'})
  create(@Body() dto: CreateEventsDto, @Request() req) {
    return this.eventsService.create(dto, req.user.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Liste des événements récupérée avec succès.' })
  findAll() {
    return this.eventsService.findAll(false);
  }

  @Get('/filter')
  @ApiResponse({ status: 200, description: 'Liste filtrée des événements.' })
  filter(
    @Query('title') title?: string,
    @Query('authorId') authorId?: string,
    @Query('published') published?: boolean,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.eventsService.findAllWithFilters({
      title,
      authorId,
      published: published !== undefined ? published === true : undefined,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('/stats')
  @ApiResponse({ status: 200, description: 'Statistiques des événements récupérées avec succès.' })
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Détails de l\'événement récupérés.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Événement mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  @ApiResponse({ status: 400, description: 'Mise à jour invalide.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventsDto,
    @Request() req,
  ) {
    const updatedEvent = await this.eventsService.update(id, dto, req.user.id);
    return {
      message: 'Événement mis à jour avec succès.',
      data: updatedEvent,
    };
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Événement supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Événement non trouvé.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.eventsService.remove(id, req.user.id);
    return { message: `Evènement avec l'id ${id} supprimé avec succès.` };
  }
}

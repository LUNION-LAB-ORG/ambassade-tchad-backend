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

@Controller('events')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventsDto, @Request() req) {
    return this.eventsService.create(dto, req.user.id);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll(false);
  }

  // @Get('/admin')
  // findAllAdmin() {
  //   return this.eventsService.findAll(true);
  // }

  @Get('/filter')
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
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);

  }

  @Put(':id')
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
   @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN, Role.CHEF_SERVICE, Role.CONSUL, Role.AGENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.eventsService.remove(id, req.user.id);
    return { message:  `Evènement avec l'id ${id} supprimé avec succès.` };
  }
}

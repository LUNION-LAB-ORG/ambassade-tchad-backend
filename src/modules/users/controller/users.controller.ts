import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Delete,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Role, User, UserType } from '@prisma/client';
import { UserRoles } from '../decorators/user-roles.decorator';
import { UserRolesGuard } from '../guards/user-roles.guard';
import { Request } from 'express';
import { QueryUserDto } from '../dto/query-user.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Créer un nouvel utilisateur du personnel (nécessite un rôle ADMIN)' })
  @ApiCreatedResponse({
    description: 'Utilisateur du personnel créé avec succès. Le mot de passe initial est généré.',
    schema: {
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phoneNumber: { type: 'string' },
        type: { type: 'string', example: UserType.PERSONNEL },
        role: { type: 'string', example: Role.AGENT },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        generatedPassword: { type: 'string', description: 'Mot de passe initial généré (à communiquer au nouvel utilisateur)' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Email déjà utilisé, rôle manquant/invalide, ou données invalides.",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé : Seul un administrateur peut créer des utilisateurs du personnel.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN)
  @Post()
  async create(
    @Req() req: Request,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(req, createUserDto);
  }

  @ApiOperation({ summary: "Obtenir les détails du profil de l'utilisateur connecté" })
  @ApiOkResponse({
    description: 'Profil utilisateur récupéré avec succès',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur non trouvé',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  detail(@Req() req: Request) {
    return this.usersService.detail(req);
  }

  @ApiOperation({ summary: 'Obtenir la liste de tous les utilisateurs avec des options de filtrage et pagination (nécessite un rôle PERSONNEL)' })
  @ApiOkResponse({
    description: 'Liste des utilisateurs récupérée avec succès.',
    type: QueryResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() queryDto: QueryUserDto): Promise<QueryResponseDto<Omit<User, 'password'>>> {
    return this.usersService.findAll(queryDto);
  }

  @ApiOperation({ summary: 'Mettre à jour le profil de l\'utilisateur connecté' })
  @ApiOkResponse({
    description: 'Profil utilisateur mis à jour avec succès.',
    schema: { type: 'object' },
  })
  @ApiBadRequestResponse({
    description: 'Données de mise à jour invalides.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async update(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req, updateUserDto);
  }

  @ApiOperation({ summary: 'Désactiver un utilisateur par son ID (changement de statut en INACTIVE, nécessite un rôle ADMIN)' })
  @ApiOkResponse({
    description: 'Utilisateur désactivé avec succès.',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur non trouvé.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'L\'utilisateur est déjà désactivé ou vous ne pouvez pas vous désactiver vous-même.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN)
  @Patch('deactivate/:id')
  async deactivate(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.deactivate(req, id);
  }

  @ApiOperation({ summary: 'Activer un utilisateur par son ID (changement de statut en ACTIVE, nécessite un rôle ADMIN)' })
  @ApiOkResponse({
    description: 'Utilisateur activé avec succès.',
    schema: { type: 'object' },
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur non trouvé.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'L\'utilisateur est déjà actif.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN)
  @Patch('activate/:id')
  async activate(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.activate(req, id);
  }

  @ApiOperation({ summary: 'Supprimer définitivement un utilisateur par son ID (nécessite un rôle ADMIN)' })
  @ApiOkResponse({
    description: 'Utilisateur supprimé définitivement avec succès.',
    schema: { type: 'object' },
  })
  @ApiBadRequestResponse({
    description: 'Impossible de supprimer cet utilisateur (ex: suppression de son propre compte).',
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur non trouvé.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(Role.ADMIN)
  @Delete(':id')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.remove(req, id);
  }
}
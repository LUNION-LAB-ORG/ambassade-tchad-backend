import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/services/prisma.service';
import { Prisma, User, UserType, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { GenerateDataService } from 'src/common/services/generate-data.service';
import { UserEvent } from '../events/user.event';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { QueryResponseDto } from 'src/common/dto/query-response.dto';

import { Request } from 'express';
import { UserStatsResponse } from '../responses/user-stats.response';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generateDataService: GenerateDataService,
    private readonly userEvent: UserEvent,
  ) { }

  /**
   * Crée un nouvel utilisateur de type PERSONNEL.
   * Un mot de passe initial est généré et l'utilisateur devra le changer à la première connexion.
   * @param req L'objet requête (pour l'acteur de l'action).
   * @param createUserDto Les données de création de l'utilisateur (doivent inclure le rôle).
   * @returns L'utilisateur créé (sans le mot de passe, mais avec le mot de passe généré en clair).
   * @throws BadRequestException si l'email existe déjà ou si le rôle est invalide.
   */
  async create(req: Request, createUserDto: CreateUserDto): Promise<Omit<User, 'password'> & { generatedPassword: string }> {
    const actor = req.user as User;

    const userExist = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExist) {
      throw new BadRequestException("Un utilisateur avec cet email existe déjà.");
    }

    const userTypeToCreate = UserType.PERSONNEL;

    const rawPassword = this.generateDataService.generateSecurePassword();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newUser = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        phoneNumber: createUserDto.phoneNumber,
        type: userTypeToCreate,
        role: createUserDto.role,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        isPasswordChangeRequired: true,
      },
    });

    // Ommettre le mot de passe de la réponse
    const { password: omittedPassword, ...rest } = newUser;

    return { ...rest, generatedPassword: rawPassword };
  }

  /**
   * Récupère tous les utilisateurs filtrés par les critères fournis, avec pagination.
   * @param queryDto DTO contenant les options de filtrage et de pagination.
   * @returns Un objet QueryResponseDto contenant les utilisateurs, et les métadonnées de pagination.
   */
  async findAll(queryDto: QueryUserDto): Promise<QueryResponseDto<Omit<User, 'password'>>> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: Prisma.UserWhereInput = {};

    if (filters.type) {
      whereClause.type = filters.type;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = { not: UserStatus.INACTIVE };
    }
    if (filters.role) {
      whereClause.role = filters.role;
    }
    if (filters.firstName) {
      whereClause.firstName = {
        contains: filters.firstName,
        mode: 'insensitive',
      };
    }
    if (filters.lastName) {
      whereClause.lastName = {
        contains: filters.lastName,
        mode: 'insensitive',
      };
    }
    if (filters.email) {
      whereClause.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }
    if (filters.phoneNumber) {
      whereClause.phoneNumber = {
        contains: filters.phoneNumber,
      };
    }
    const [totalUsers, users] = await Promise.all([
      this.prisma.user.count({
        where: whereClause,
      }),
      this.prisma.user.findMany({
        where: whereClause,
        skip: skip,
        take: take,
        orderBy: { createdAt: 'desc' },
        omit: { password: false },
      }),
    ]);

    return {
      data: users,
      meta: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }

  async stats(type: "personnel" | "demandeur"): Promise<UserStatsResponse> {
    const dateDebut = GenerateDataService.obtenirDateDebut('month');

    // Tous les utilisateurs
    const [allUsers, allUsersGrouped] = await Promise.all([
      this.prisma.user.count({
        where: {
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
        },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
          createdAt: { gte: dateDebut }
        }
      })
    ]);

    // Utilisateurs actifs
    const [activeUsers, activeUsersGrouped] = await Promise.all([
      this.prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
        },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          status: UserStatus.ACTIVE,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
          createdAt: { gte: dateDebut }
        }
      })
    ]);

    // Utilisateurs inactifs
    const [inactiveUsers, inactiveUsersGrouped] = await Promise.all([
      this.prisma.user.count({
        where: {
          status: UserStatus.INACTIVE,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
        },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          status: UserStatus.INACTIVE,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
          createdAt: { gte: dateDebut }
        }
      })
    ]);

    // Utilisateurs bannis
    const [bannedUsers, bannedUsersGrouped] = await Promise.all([
      this.prisma.user.count({
        where: {
          status: UserStatus.DELETED,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
        },
      }),
      this.prisma.user.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          status: UserStatus.DELETED,
          type: type === "personnel" ? UserType.PERSONNEL : UserType.DEMANDEUR,
          createdAt: { gte: dateDebut }
        }
      })
    ]);

    return {
      allUsers,
      allUsersSeries: GenerateDataService.genererSeries(allUsersGrouped, 'month'),
      activeUsers,
      activeUsersSeries: GenerateDataService.genererSeries(activeUsersGrouped, 'month'),
      inactiveUsers,
      inactiveUsersSeries: GenerateDataService.genererSeries(inactiveUsersGrouped, 'month'),
      bannedUsers,
      bannedUsersSeries: GenerateDataService.genererSeries(bannedUsersGrouped, 'month'),
    };
  }
  /**
   * Récupère le profil de l'utilisateur connecté.
   * @param userId L'ID de l'utilisateur.
   * @returns Le profil de l'utilisateur (sans le mot de passe).
   */
  async detail(userId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!profile) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Ommettre le mot de passe de la réponse
    const { password, ...rest } = profile;

    return rest;
  }

  /**
   * Met à jour les informations d'un utilisateur.
   * @param req L'objet requête.
   * @param updateUserDto Les données de mise à jour.
   * @returns L'utilisateur mis à jour (sans le mot de passe).
   */
  async update(req: Request, updateUserDto: UpdateUserDto) {
    const user = req.user as User;

    const { email, phoneNumber, ...rest } = updateUserDto;
    const data: UpdateUserDto = { ...rest };

    if (email === user.email) {
      data.email = email;
    }

    if (phoneNumber === user.phoneNumber) {
      data.phoneNumber = phoneNumber;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        type: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isPasswordChangeRequired: true,
      },
    });

    return updatedUser;
  }
  /**
   * Met à jour le rôle d'un utilisateur.
   * @param req L'objet requête.
   * @param updateUserDto Les données de mise à jour.
   * @returns L'utilisateur mis à jour (sans le mot de passe).
   */

  async updateRole(req: Request, id: string, updateUserDto: UpdateUserDto) {
    const actor = req.user as User;

    if (actor.id === id) {
      throw new BadRequestException('Vous ne pouvez pas changer le rôle de votre propre compte.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        type: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        isPasswordChangeRequired: true,
      },
    });

    return updatedUser;
  }

  /**
   * Désactive un utilisateur (soft delete).
   * @param req L'objet requête (l'acteur de l'action).
   * @param id L'ID de l'utilisateur à désactiver.
   * @returns L'utilisateur désactivé.
   * @throws NotFoundException si l'utilisateur n'est pas trouvé.
   * @throws BadRequestException si l'utilisateur est déjà inactif ou si l'acteur tente de se désactiver lui-même.
   */
  async deactivate(req: Request, id: string) {
    const actor = req.user as User;

    const userToDeactivate = await this.detail(id);

    if (userToDeactivate.status === UserStatus.INACTIVE) {
      throw new BadRequestException('L\'utilisateur est déjà vérouillé.');
    }
    if (actor.id === id) {
      throw new BadRequestException('Vous ne pouvez pas vérouiller votre propre compte.');
    }

    await this.prisma.user.update({
      where: { id: id },
      data: { status: UserStatus.INACTIVE },
    });

    return {
      success: true,
      message: 'Utilisateur vérouillé avec succès.',
    };
  }

  /**
   * Active un utilisateur désactivé.
   * @param req L'objet requête (l'acteur de l'action).
   * @param id L'ID de l'utilisateur à activer.
   * @returns L'utilisateur restauré.
   * @throws NotFoundException si l'utilisateur n'est pas trouvé.
   * @throws BadRequestException si l'utilisateur est déjà actif.
   */
  async activate(req: Request, id: string) {
    const actor = req.user as User;

    const userToActivate = await this.detail(id);

    if (userToActivate.status === UserStatus.ACTIVE) {
      throw new BadRequestException('L\'utilisateur est déjà dévérouillé.');
    }
    if (actor.id === id) {
      throw new BadRequestException('Vous ne pouvez pas dévérouiller votre propre compte.');
    }
    await this.prisma.user.update({
      where: { id: id },
      data: { status: UserStatus.ACTIVE },
    });

    return {
      success: true,
      message: 'Utilisateur dévérouillé avec succès.',
    };
  }

  /**
   * Supprime définitivement un utilisateur.
   * @param req L'objet requête (l'acteur de l'action).
   * @param id L'ID de l'utilisateur à supprimer.
   * @returns L'utilisateur supprimé.
   * @throws BadRequestException si l'acteur tente de supprimer son propre compte.
   */
  async remove(req: Request, id: string) {
    const actor = req.user as User;

    if (actor.id === id) {
      throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte directement via cette route.");
    }

    const userToDelete = await this.detail(id);

    await this.prisma.user.update({
      where: { id: userToDelete.id },
      data: { status: UserStatus.DELETED, deletedAt: new Date() },
    });

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès.',
    };
  }
}
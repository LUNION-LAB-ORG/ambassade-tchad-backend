import { Prisma, PrismaClient, UserType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient(); // Simplifié pour le contexte

export async function userSeed() {
  console.log('Début du seeding des utilisateurs...');

  // Définition des données des utilisateurs à insérer ou mettre à jour
  const datas: Prisma.UserCreateInput[] = [
    {
      // Administrateur du Back-Office
      firstName: 'Admin',
      lastName: 'Principal', // Ajout du lastName
      email: 'admin@ambassade.com', // Email générique pour la réutilisabilité
      password: 'Admin@2025', // Sera haché
      type: UserType.PERSONNEL, // Changé de BACKOFFICE à PERSONNEL
      role: Role.ADMIN, // Changé de UserRole.ADMIN à Role.ADMIN
      status: 'ACTIVE', // Assure que l'utilisateur est actif par défaut
      phoneNumber: '0000000000', // Exemple de numéro de téléphone
    },
    {
      // Un agent de l'ambassade
      firstName: 'Agent',
      lastName: 'Consulaire',
      email: 'agent@ambassade.com',
      password: 'Agent@2025',
      type: UserType.PERSONNEL,
      role: Role.AGENT,
      status: 'ACTIVE',
      phoneNumber: '1111111111',
    },
    {
      // Un Chef de Service
      firstName: 'Chef',
      lastName: 'Service',
      email: 'chef@ambassade.com',
      password: 'Chef@2025',
      type: UserType.PERSONNEL,
      role: Role.CHEF_SERVICE,
      status: 'ACTIVE',
      phoneNumber: '2222222222',
    },
    {
      // Un Consul
      firstName: 'Consul',
      lastName: 'General',
      email: 'consul@ambassade.com',
      password: 'Consul@2025',
      type: UserType.PERSONNEL,
      role: Role.CONSUL,
      status: 'ACTIVE',
      phoneNumber: '3333333333',
    },
    {
      // Un utilisateur DEMANDEUR pour les tests de l'espace demandeur
      firstName: 'Demandeur',
      lastName: 'Test',
      email: 'demandeur@example.com',
      password: 'Demandeur@2025', // Sera haché
      type: UserType.DEMANDEUR, // Type DEMANDEUR
      role: null, // Le rôle est null pour les clients, comme défini dans le schéma
      status: 'ACTIVE',
      phoneNumber: '4444444444',
    },
  ];

  for (const data of datas) {
    const { password, ...rest } = data; // Sépare le mot de passe du reste des données
    const salt = await bcrypt.genSalt(); // Génère un sel unique
    const hash = await bcrypt.hash(password, salt); // Hashe le mot de passe avec le sel

    try {
      await prisma.user.upsert({
        where: { email: data.email }, // Cherche un utilisateur par son email
        update: {
          ...rest, // Met à jour les autres champs
          password: hash, // Met à jour le mot de passe haché
        },
        create: {
          ...rest, // Crée les champs
          password: hash, // Définit le mot de passe haché
        },
      });
      console.log(`Utilisateur ${data.email} upserted avec succès.`);
    } catch (error) {
      console.error(
        `Erreur lors de l'upsert de l'utilisateur ${data.email}:`,
        error,
      );
      // Gérer l'erreur de manière plus robuste si nécessaire, par exemple en re-jetant l'erreur
      throw error;
    }
  }
  console.log('Fin du seeding des utilisateurs.');
}
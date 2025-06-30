import { Role } from "@prisma/client"; 

export const userGetRole = (role: Role) => {
    switch (role) {
        case Role.ADMIN:
            return 'Administrateur';
        case Role.AGENT:
            return 'Agent Consulaire';
        case Role.CHEF_SERVICE:
            return 'Chef de Service'; 
        case Role.CONSUL:
            return 'Consul'; 
        default:
            return 'Rôle Inconnu';
    }
}
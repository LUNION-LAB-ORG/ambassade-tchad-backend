import { User } from "@prisma/client";


export interface UserEventPayload {
    actor: User; // Celui qui effectue l'action
    user: User; // Celui qui subit l'action
};

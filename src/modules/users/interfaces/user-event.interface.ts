import { User } from "@prisma/client";


export interface UserEventPayload {
    actor: User;
    user: User;
};

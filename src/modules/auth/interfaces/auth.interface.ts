import { User } from "@prisma/client";

// Interface pour le retour de login initial (après email/mdp, avant OTP)
export interface PreLoginResponse {
    message: string;
    otpSent: boolean;
    email: string;
}

// Interface pour le retour final de login (après OTP, avec tokens)
export interface LoginSuccessResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}

// Interface pour le retour si le MDP doit être changé à la 1ère connexion
export interface FirstLoginPasswordChangeRequiredResponse {
    message: string;
    passwordChangeRequired: boolean;
}
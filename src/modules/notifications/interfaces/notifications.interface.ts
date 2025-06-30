import { UserType, Role } from "@prisma/client";

export interface NotificationRecipient {
    id: string;
    email: string;
    type: UserType;
    role?: Role | null;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string | null;
}

export interface NotificationContext<T> {
    actor: NotificationRecipient;
    recipients: NotificationRecipient[];
    data: T;
}

export interface NotificationTemplate<T> {
    title: (context: NotificationContext<T>) => string;
    message: (context: NotificationContext<T>) => string;
    icon: (context: NotificationContext<T>) => string;
    iconBgColor: (context: NotificationContext<T>) => string;
    showChevron?: boolean;
}
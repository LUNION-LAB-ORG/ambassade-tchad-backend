import { User } from "@prisma/client";

export interface NotificationContext<T> {
    recipients: User[];
    data: T;
}

export interface NotificationTemplate<T> {
    title: (context: NotificationContext<T>) => string;
    message: (context: NotificationContext<T>) => string;
    icon: (context: NotificationContext<T>) => string;
    iconBgColor: (context: NotificationContext<T>) => string;
    showChevron?: boolean;
}
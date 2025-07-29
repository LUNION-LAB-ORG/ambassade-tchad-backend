

export class UserStatsResponse {
    allUsers: number;
    allUsersSeries: { date: string; value: number }[]
    activeUsers: number;
    activeUsersSeries: { date: string; value: number }[]
    inactiveUsers: number;
    inactiveUsersSeries: { date: string; value: number }[]
    bannedUsers: number;
    bannedUsersSeries: { date: string; value: number }[]
}

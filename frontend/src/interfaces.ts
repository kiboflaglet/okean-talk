
export interface IUser {
    id: string;
    fullName: string;
}

export interface IRoom {
    id: string;
    topic: string;
    languages: string[];
    users?: IUser[];
    ownerId: string;
    owner?: IUser
    createdAt: string;
    maxParticipants: number;
}
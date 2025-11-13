import {ObjectId} from "mongodb";

export type Usuario =
    {
        _id?: ObjectId,
        username: string,
        email: string,
        passwordHash: string,
        createdAt?: Date
    }